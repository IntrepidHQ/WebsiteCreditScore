import { randomUUID } from "node:crypto";

import type { BillingAddOnId, BillingPlanId, TokenActionId } from "@/lib/billing/catalog";
import { getTokenActionCost } from "@/lib/billing/catalog";
import { buildAuditReportById, buildAuditReportFromUrl, buildLiveAuditReportFromUrl } from "@/lib/mock/report-builder";
import { sampleAudits } from "@/lib/mock/sample-audits";
import { prepareReportForStorage, passesReportQualityCheck } from "@/lib/product/report-quality";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  DashboardSnapshot,
  EmailTemplateRecord,
  LeadActivity,
  LeadDetailSnapshot,
  LeadRecord,
  LeadStage,
  ProductPromoRecord,
  PublicShareSnapshot,
  ReferralCodeRecord,
  ReferralEventRecord,
  ReminderRecord,
  SavedReport,
  ShareLinkRecord,
  ShareSurface,
  WorkspaceCreditEntry,
  WorkspaceEntitlement,
  WorkspaceRecord,
  WorkspaceSession,
} from "@/lib/types/product";
import { createDefaultProposalOffer } from "@/lib/utils/proposal-offers";
import { calculatePricingSummary, calculateProjectedScore, getDefaultSelectedIds } from "@/lib/utils/pricing";
import { createThemeTokens } from "@/lib/utils/theme";
import { slugFromUrl } from "@/lib/utils/url";

const LEGACY_BRAND_PATTERN = new RegExp(["C", "r", "a", "y", "d", "l"].join(""), "i");
const LEGACY_PROVIDER_PAGES_PATTERN = /provider pages/i;

function createId(prefix: string) {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

function sortNewestFirst<
  T extends {
    updatedAt?: string;
    createdAt?: string;
    dueAt?: string;
    occurredAt?: string;
  },
>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftValue =
      left.updatedAt ?? left.occurredAt ?? left.createdAt ?? left.dueAt ?? "";
    const rightValue =
      right.updatedAt ?? right.occurredAt ?? right.createdAt ?? right.dueAt ?? "";

    return new Date(rightValue).getTime() - new Date(leftValue).getTime();
  });
}

function buildWorkspace(ownerUserId: string, session: WorkspaceSession): WorkspaceRecord {
  const createdAt = new Date().toISOString();

  return {
    id: createId("workspace"),
    ownerUserId,
    name: `${session.name}'s workspace`,
    slug: session.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    createdAt,
    updatedAt: createdAt,
    billingStatus: "trial",
    billingPlan: "free",
    creditBalance: 10,
    tokenBalance: 10,
    entitlements: [],
    branding: {
      agencyName: "WebsiteCreditScore.com",
      logoMark: "WCS",
      logoColor: "",
      logoScale: 1,
      contactName: session.name,
      contactTitle: "Founder",
      contactEmail: session.email,
      contactPhone: "",
      headshot: session.avatarUrl ?? "/previews/agency-avatar.svg",
      accentOverride: "#f7b21b",
    },
    savedTheme: createThemeTokens({
      mode: "dark",
      accentColor: "#f7b21b",
    }),
  };
}

function normalizeWorkspaceRecord(workspace: WorkspaceRecord) {
  const branding = workspace.branding ?? {
    agencyName: "",
    logoMark: "",
    logoColor: "",
    logoScale: 1,
    contactName: "",
    contactTitle: "",
    contactEmail: "",
    contactPhone: "",
    headshot: "",
    accentOverride: "",
  };

  const usesLegacyBrand = [
    workspace.name,
    workspace.slug,
    branding.agencyName,
    branding.logoMark,
    branding.contactName,
    branding.contactEmail,
    branding.headshot,
  ].some((value) => LEGACY_BRAND_PATTERN.test(value));
  const usesLegacyBilling = workspace.tokenBalance == null && workspace.billingPlan == null;
  const normalizedTokenBalance = usesLegacyBilling
    ? 10
    : workspace.tokenBalance ?? workspace.creditBalance ?? 10;

  return {
    ...workspace,
    name: workspace.name.toLowerCase().includes("internal workspace")
      ? "WebsiteCreditScore.com workspace"
      : workspace.name,
    slug: usesLegacyBrand ? "websitecreditscore" : workspace.slug,
    billingPlan: workspace.billingPlan ?? (workspace.billingStatus === "active" ? "pro" : "free"),
    creditBalance: usesLegacyBilling
      ? 10
      : workspace.creditBalance ?? normalizedTokenBalance,
    tokenBalance: normalizedTokenBalance,
    entitlements: workspace.entitlements ?? [],
    branding: {
      ...branding,
      agencyName: usesLegacyBrand ? "WebsiteCreditScore.com" : branding.agencyName,
      logoMark: usesLegacyBrand || branding.logoMark === "CR" ? "WCS" : branding.logoMark,
      logoColor: branding.logoColor ?? "",
      logoScale: branding.logoScale ?? 1,
      contactName: usesLegacyBrand ? "WebsiteCreditScore.com team" : branding.contactName,
      contactEmail: usesLegacyBrand ? "hello@websitecreditscore.com" : branding.contactEmail,
      headshot: usesLegacyBrand ? "/previews/agency-avatar.svg" : branding.headshot,
    },
  };
}

function createBalanceEntry(
  workspaceId: string,
  amount: number,
  label: string,
  options?: Partial<
    Pick<
      WorkspaceCreditEntry,
      "type" | "source" | "checkoutSessionId" | "actionId" | "actionKey"
    >
  >,
): WorkspaceCreditEntry {
  return {
    id: createId("credit"),
    workspaceId,
    amount,
    label,
    type: options?.type,
    source: options?.source,
    checkoutSessionId: options?.checkoutSessionId,
    actionId: options?.actionId,
    actionKey: options?.actionKey,
    createdAt: new Date().toISOString(),
  };
}

function mergeEntitlements(
  current: WorkspaceEntitlement[],
  next: WorkspaceEntitlement[],
) {
  return Array.from(new Set([...current, ...next]));
}

function isLegacyProviderPagesText(value: string | undefined | null) {
  return typeof value === "string" && LEGACY_PROVIDER_PAGES_PATTERN.test(value);
}

function isLegacyProviderPagesLead(lead: LeadRecord, report?: SavedReport) {
  return (
    isLegacyProviderPagesText(lead.title) ||
    isLegacyProviderPagesText(lead.companyName) ||
    isLegacyProviderPagesText(lead.summary) ||
    isLegacyProviderPagesText(lead.contactName) ||
    isLegacyProviderPagesText(lead.normalizedUrl) ||
    isLegacyProviderPagesText(report?.title) ||
    isLegacyProviderPagesText(report?.normalizedUrl) ||
    isLegacyProviderPagesText(report?.reportSnapshot.title) ||
    isLegacyProviderPagesText(report?.reportSnapshot.executiveSummary)
  );
}

function buildSeededLead(
  workspaceId: string,
  sampleReportId: string,
  fallbackUrl?: string,
  createdAt = new Date().toISOString(),
) {
  const sourceReport =
    buildAuditReportById(sampleReportId) ??
    buildAuditReportFromUrl(fallbackUrl ?? "https://www.onemedical.com");
  // DB enforces GLOBAL uniqueness on saved_reports.lead_id and share_links.token.
  // Sample IDs must be namespaced per workspace or the second signup hits duplicate key errors.
  const scopedLeadId = `${workspaceId}__sample__${sampleReportId}`;
  const baseReport = prepareReportForStorage(sourceReport);
  const report = {
    ...baseReport,
    id: scopedLeadId,
  };
  const summary = calculatePricingSummary(
    report.pricingBundle,
    getDefaultSelectedIds(report.pricingBundle),
  );
  const reportWithOffer = {
    ...report,
    proposalOffer: createDefaultProposalOffer(summary.total, new Date(createdAt)),
  };
  const leadId = scopedLeadId;

  const savedReport: SavedReport = {
    id: leadId,
    workspaceId,
    leadId,
    title: report.title,
    normalizedUrl: report.normalizedUrl,
    createdAt,
    updatedAt: createdAt,
    qualityCheckPassed: passesReportQualityCheck(reportWithOffer),
    reportSnapshot: reportWithOffer,
  };

  const lead: LeadRecord = {
    id: leadId,
    workspaceId,
    reportId: savedReport.id,
    title: report.title,
    companyName: report.title,
    normalizedUrl: report.normalizedUrl,
    previewImage: report.previewSet.current.desktop,
    stage: "audit-ready",
    createdAt,
    updatedAt: createdAt,
    currentScore: report.overallScore,
    projectedScore: calculateProjectedScore(report.overallScore, summary.selectedPackageItems),
    summary: report.executiveSummary,
    contactName: report.title,
    contactEmail: report.siteObservation.verifiedFacts.find((fact) => fact.type === "email")?.value,
    contactPhone: report.siteObservation.verifiedFacts.find((fact) => fact.type === "phone")?.value,
  };

  const shareLinks: ShareLinkRecord[] = (["audit", "packet", "brief"] as const).map(
    (surface) => ({
      id: createId(`share-${surface}`),
      workspaceId,
      leadId,
      surface,
      token: `${leadId}-${surface}-share`,
      views: 0,
      enabled: true,
      createdAt,
    }),
  );

  const activity: LeadActivity = {
    id: createId("activity"),
    workspaceId,
    leadId,
    type: "audit-created",
    title: "Audit created",
    detail: "Seeded starter lead from the WebsiteCreditScore.com sample library.",
    occurredAt: createdAt,
  };

  const reminder: ReminderRecord = {
    id: createId("reminder"),
    workspaceId,
    leadId,
    title: "Send sample packet",
    detail: "Use the packet to rehearse the outreach workflow before sending a live prospect review.",
    dueAt: createdAt,
    status: "open",
  };

  return { savedReport, lead, shareLinks, activity, reminder };
}

async function ensurePublicSampleSeeds(workspaceId: string) {
  const existingReports = await listPayloadRecords<SavedReport>(
    "saved_reports",
    "workspace_id",
    workspaceId,
  );
  const existingReportIds = new Set(existingReports.map((report) => report.id));

  for (const sample of sampleAudits) {
    const scopedSavedReportId = `${workspaceId}__sample__${sample.id}`;
    if (existingReportIds.has(scopedSavedReportId) || existingReportIds.has(sample.id)) {
      continue;
    }

    const seeded = buildSeededLead(
      workspaceId,
      sample.id,
      sample.url,
      sample.scannedAt,
    );

    await upsertPayloadRecord("saved_reports", {
      id: seeded.savedReport.id,
      workspace_id: workspaceId,
      lead_id: seeded.lead.id,
      payload: seeded.savedReport,
    });
    await upsertPayloadRecord("leads", {
      id: seeded.lead.id,
      workspace_id: workspaceId,
      payload: seeded.lead,
    });
    for (const shareLink of seeded.shareLinks) {
      await upsertPayloadRecord("share_links", {
        id: shareLink.id,
        workspace_id: workspaceId,
        lead_id: seeded.lead.id,
        surface: shareLink.surface,
        token: shareLink.token,
        payload: shareLink,
      });
    }
    await upsertPayloadRecord("activities", {
      id: seeded.activity.id,
      workspace_id: workspaceId,
      lead_id: seeded.lead.id,
      payload: seeded.activity,
    });
    await upsertPayloadRecord("reminders", {
      id: seeded.reminder.id,
      workspace_id: workspaceId,
      lead_id: seeded.lead.id,
      payload: seeded.reminder,
    });
  }
}

async function upsertPayloadRecord(
  table: string,
  row: Record<string, unknown>,
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from(table).upsert(row, { onConflict: "id" });

  if (error) {
    throw error;
  }
}

async function deleteWorkspaceScopedRows(
  table: string,
  workspaceId: string,
  filters: Array<[column: string, value: string]>,
) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from(table).delete().eq("workspace_id", workspaceId);

  for (const [column, value] of filters) {
    query = query.eq(column, value);
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}

async function listPayloadRecords<T>(
  table: string,
  column: string,
  value: string,
): Promise<T[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from(table).select("payload").eq(column, value);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => row.payload as T);
}

async function ensurePromoCatalog(workspaceId: string) {
  const promos = await listPayloadRecords<ProductPromoRecord>("product_promos", "workspace_id", workspaceId);
  const now = new Date().toISOString();

  const seeds: ProductPromoRecord[] = [];

  if (!promos.some((promo) => promo.code === "FIFTEEN")) {
    seeds.push({
      id: createId("promo"),
      code: "FIFTEEN",
      label: "Launch coupon",
      description: "15% off the checkout total for early buyers.",
      type: "percentage",
      value: 15,
      active: true,
      maxRedemptions: 100,
      redemptionsUsed: 0,
    });
  }

  if (!promos.some((promo) => promo.code === "RUSH24")) {
    seeds.push({
      id: createId("promo"),
      code: "RUSH24",
      label: "24-Hour Turnaround",
      description: "Priority turnaround for a $250 fee.",
      type: "fixed",
      value: 250,
      active: true,
      maxRedemptions: 100,
      redemptionsUsed: 0,
    });
  }

  if (!promos.some((promo) => promo.code === "STARTUP")) {
    seeds.push({
      id: createId("promo"),
      code: "STARTUP",
      label: "Startup discount",
      description: "10% off for new business owners who need a website.",
      type: "percentage",
      value: 10,
      active: true,
      maxRedemptions: 100,
      redemptionsUsed: 0,
    });
  }

  for (const promo of seeds) {
    await upsertPayloadRecord("product_promos", {
      id: promo.id,
      workspace_id: workspaceId,
      payload: {
        ...promo,
        createdAt: now,
      },
    });
  }
}

async function getWorkspacePayload(workspaceId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("payload")
    .eq("id", workspaceId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data?.payload as WorkspaceRecord | undefined) ?? null;
}

export async function ensureSupabaseWorkspace(session: WorkspaceSession) {
  const supabase = await createSupabaseServerClient();
  // Prefer oldest row; limit(1) avoids PostgREST errors when duplicate owner rows exist.
  const { data, error } = await supabase
    .from("workspaces")
    .select("payload")
    .eq("owner_user_id", session.userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data?.payload) {
    const currentWorkspace = data.payload as WorkspaceRecord;
    const workspace = normalizeWorkspaceRecord(currentWorkspace);
    if (JSON.stringify(workspace) !== JSON.stringify(currentWorkspace)) {
      await upsertPayloadRecord("workspaces", {
        id: workspace.id,
        owner_user_id: session.userId,
        payload: workspace,
      });
    }
    await ensurePromoCatalog(workspace.id);
    await ensurePublicSampleSeeds(workspace.id);
    return workspace;
  }

  const workspace = buildWorkspace(session.userId, session);
  const referralCode: ReferralCodeRecord = {
    id: createId("referral"),
    workspaceId: workspace.id,
    code: "STARTUP",
    shareUrl: "https://websitecreditscore.com/app/login?ref=STARTUP",
    rewardLabel: "10% off for new business owners who need a website",
    createdAt: workspace.createdAt,
  };
  const template: EmailTemplateRecord = {
    id: createId("template"),
    workspaceId: workspace.id,
    name: "Intro review",
    subject: "Quick site review and redesign direction",
    body: "I pulled together a short review of the current site, the strongest friction points, and the clearest path to a better first impression. If useful, I can send the short packet and walk through it in fifteen minutes.",
    kind: "intro",
    updatedAt: workspace.createdAt,
  };
  const creditEntry: WorkspaceCreditEntry = {
    ...createBalanceEntry(workspace.id, 10, "Free tier included tokens", {
      type: "grant",
      source: "system",
    }),
    createdAt: workspace.createdAt,
  };
  await upsertPayloadRecord("workspaces", {
    id: workspace.id,
    owner_user_id: session.userId,
    payload: workspace,
  });
  await upsertPayloadRecord("referral_codes", {
    id: referralCode.id,
    workspace_id: workspace.id,
    payload: referralCode,
  });
  await upsertPayloadRecord("email_templates", {
    id: template.id,
    workspace_id: workspace.id,
    payload: template,
  });
  await upsertPayloadRecord("workspace_credits", {
    id: creditEntry.id,
    workspace_id: workspace.id,
    payload: creditEntry,
  });
  await ensurePromoCatalog(workspace.id);
  await ensurePublicSampleSeeds(workspace.id);

  return workspace;
}

export async function getSupabaseDashboard(workspaceId: string): Promise<DashboardSnapshot> {
  const workspace = await getWorkspacePayload(workspaceId);

  if (!workspace) {
    throw new Error("Workspace not found.");
  }

  const [savedReports, leads, reminders, templates, referralCodes, referralEvents, credits, promos] =
    await Promise.all([
      listPayloadRecords<SavedReport>("saved_reports", "workspace_id", workspaceId),
      listPayloadRecords<LeadRecord>("leads", "workspace_id", workspaceId),
      listPayloadRecords<ReminderRecord>("reminders", "workspace_id", workspaceId),
      listPayloadRecords<EmailTemplateRecord>("email_templates", "workspace_id", workspaceId),
      listPayloadRecords<ReferralCodeRecord>("referral_codes", "workspace_id", workspaceId),
      listPayloadRecords<ReferralEventRecord>("referral_events", "workspace_id", workspaceId),
      listPayloadRecords<WorkspaceCreditEntry>("workspace_credits", "workspace_id", workspaceId),
      listPayloadRecords<ProductPromoRecord>("product_promos", "workspace_id", workspaceId),
    ]);

  const reportByLeadId = new Map(savedReports.map((report) => [report.leadId, report]));
  const filteredLeads = leads.filter((lead) => !isLegacyProviderPagesLead(lead, reportByLeadId.get(lead.id)));
  const filteredLeadIds = new Set(filteredLeads.map((lead) => lead.id));
  const filteredSavedReports = savedReports.filter((report) => {
    const snap = report.reportSnapshot;
    if (!snap) {
      return false;
    }

    return (
      filteredLeadIds.has(report.leadId) &&
      !isLegacyProviderPagesText(report.title) &&
      !isLegacyProviderPagesText(report.normalizedUrl) &&
      !isLegacyProviderPagesText(snap.title) &&
      !isLegacyProviderPagesText(snap.executiveSummary)
    );
  });

  return {
    workspace,
    savedReports: sortNewestFirst(filteredSavedReports),
    leads: sortNewestFirst(filteredLeads),
    reminders: sortNewestFirst(
      reminders.filter(
        (reminder) => reminder.status === "open" && filteredLeadIds.has(reminder.leadId),
      ),
    ),
    templates: sortNewestFirst(
      templates.filter(
        (template) =>
          !isLegacyProviderPagesText(template.name) &&
          !isLegacyProviderPagesText(template.subject) &&
          !isLegacyProviderPagesText(template.body),
      ),
    ),
    referralCode: referralCodes[0] ?? null,
    referralEvents: sortNewestFirst(referralEvents),
    credits: sortNewestFirst(credits),
    promos: promos.filter((promo) => promo.active),
  };
}

export async function getSupabaseLeadDetail(
  workspaceId: string,
  leadId: string,
): Promise<LeadDetailSnapshot | null> {
  const workspace = await getWorkspacePayload(workspaceId);

  if (!workspace) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: leadRow }, { data: reportRow }, { data: activityRows }, { data: reminderRows }, { data: shareRows }] =
    await Promise.all([
      supabase.from("leads").select("payload").eq("workspace_id", workspaceId).eq("id", leadId).maybeSingle(),
      supabase.from("saved_reports").select("payload").eq("workspace_id", workspaceId).eq("lead_id", leadId).maybeSingle(),
      supabase.from("activities").select("payload").eq("workspace_id", workspaceId).eq("lead_id", leadId),
      supabase.from("reminders").select("payload").eq("workspace_id", workspaceId).eq("lead_id", leadId),
      supabase.from("share_links").select("payload").eq("workspace_id", workspaceId).eq("lead_id", leadId),
    ]);

  if (!leadRow?.payload || !reportRow?.payload) {
    return null;
  }

  const lead = leadRow.payload as LeadRecord;
  const savedReport = reportRow.payload as SavedReport;

  if (isLegacyProviderPagesLead(lead, savedReport)) {
    return null;
  }

  return {
    workspace,
    lead,
    savedReport,
    activities: (activityRows ?? []).map((row) => row.payload as LeadActivity),
    reminders: (reminderRows ?? []).map((row) => row.payload as ReminderRecord),
    shareLinks: (shareRows ?? []).map((row) => row.payload as ShareLinkRecord),
  };
}

export async function createSupabaseLeadFromUrl(workspaceId: string, rawUrl: string) {
  const workspace = await getWorkspacePayload(workspaceId);

  if (!workspace) {
    throw new Error("Workspace not found.");
  }

  const tokenCost = getTokenActionCost("scan-site");

  if ((workspace.tokenBalance ?? workspace.creditBalance ?? 0) < tokenCost) {
    throw new Error("INSUFFICIENT_TOKENS");
  }

  const createdAt = new Date().toISOString();
  let liveReport;

  try {
    liveReport = await buildLiveAuditReportFromUrl(rawUrl);
  } catch {
    liveReport = buildAuditReportFromUrl(rawUrl);
  }

  const summary = calculatePricingSummary(
    liveReport.pricingBundle,
    getDefaultSelectedIds(liveReport.pricingBundle),
  );
  const report = prepareReportForStorage({
    ...liveReport,
    proposalOffer: createDefaultProposalOffer(summary.total, new Date(createdAt)),
  });
  const leadId = slugFromUrl(report.normalizedUrl);
  const savedReport: SavedReport = {
    id: leadId,
    workspaceId,
    leadId,
    title: report.title,
    normalizedUrl: report.normalizedUrl,
    createdAt,
    updatedAt: createdAt,
    qualityCheckPassed: passesReportQualityCheck(report),
    reportSnapshot: report,
  };
  const lead: LeadRecord = {
    id: leadId,
    workspaceId,
    reportId: savedReport.id,
    title: report.title,
    companyName: report.title,
    normalizedUrl: report.normalizedUrl,
    previewImage: report.previewSet.current.desktop,
    stage: "audit-ready",
    createdAt,
    updatedAt: createdAt,
    currentScore: report.overallScore,
    projectedScore: calculateProjectedScore(report.overallScore, summary.selectedPackageItems),
    summary: report.executiveSummary,
    contactName: report.title,
    contactEmail: report.siteObservation.verifiedFacts.find((fact) => fact.type === "email")?.value,
    contactPhone: report.siteObservation.verifiedFacts.find((fact) => fact.type === "phone")?.value,
  };

  await upsertPayloadRecord("saved_reports", {
    id: savedReport.id,
    workspace_id: workspaceId,
    lead_id: lead.id,
    payload: savedReport,
  });
  await upsertPayloadRecord("leads", {
    id: lead.id,
    workspace_id: workspaceId,
    payload: lead,
  });
  for (const surface of ["audit", "packet", "brief"] as const) {
    const shareLink: ShareLinkRecord = {
      id: createId(`share-${surface}`),
      workspaceId,
      leadId: lead.id,
      surface,
      token: `${lead.id}-${surface}-share`,
      views: 0,
      enabled: true,
      createdAt,
    };
    await upsertPayloadRecord("share_links", {
      id: shareLink.id,
      workspace_id: workspaceId,
      lead_id: lead.id,
      surface,
      token: shareLink.token,
      payload: shareLink,
    });
  }
  await upsertPayloadRecord("activities", {
    id: createId("activity"),
    workspace_id: workspaceId,
    lead_id: lead.id,
    payload: {
      id: createId("activity"),
      workspaceId,
      leadId: lead.id,
      type: "audit-created",
      title: "Audit created",
      detail: `Saved a working audit for ${report.title}.`,
      occurredAt: createdAt,
    } satisfies LeadActivity,
  });
  await upsertPayloadRecord("workspaces", {
    id: workspace.id,
    owner_user_id: workspace.ownerUserId,
    payload: {
      ...workspace,
      tokenBalance: (workspace.tokenBalance ?? workspace.creditBalance ?? 0) - tokenCost,
      creditBalance: (workspace.tokenBalance ?? workspace.creditBalance ?? 0) - tokenCost,
      updatedAt: createdAt,
    } satisfies WorkspaceRecord,
  });
  await upsertPayloadRecord("workspace_credits", {
    id: createId("credit"),
    workspace_id: workspaceId,
    payload: {
      ...createBalanceEntry(workspaceId, -tokenCost, "Live site scan", {
        type: "spend",
        source: "workspace",
        actionId: "scan-site",
        actionKey: `lead:${leadId}:scan`,
      }),
      createdAt,
    } satisfies WorkspaceCreditEntry,
  });

  return lead;
}

export async function applySupabaseBillingPurchase(
  workspaceId: string,
  input: {
    checkoutSessionId: string;
    label: string;
    tokenAmount: number;
    planId?: BillingPlanId | null;
    addOnIds?: BillingAddOnId[];
    entitlements?: WorkspaceEntitlement[];
  },
) {
  const workspace = await getWorkspacePayload(workspaceId);

  if (!workspace) {
    throw new Error("Workspace not found.");
  }

  const credits = await listPayloadRecords<WorkspaceCreditEntry>("workspace_credits", "workspace_id", workspaceId);
  const purchaseAlreadyApplied = credits.some(
    (entry) => entry.checkoutSessionId === input.checkoutSessionId,
  );

  if (purchaseAlreadyApplied) {
    return workspace;
  }

  const nextTokenBalance = (workspace.tokenBalance ?? workspace.creditBalance ?? 0) + input.tokenAmount;
  const updatedWorkspace: WorkspaceRecord = {
    ...workspace,
    tokenBalance: nextTokenBalance,
    creditBalance: nextTokenBalance,
    billingPlan: input.planId === "pro" ? "pro" : workspace.billingPlan,
    billingStatus: input.planId === "pro" ? "active" : workspace.billingStatus,
    entitlements: mergeEntitlements(workspace.entitlements ?? [], input.entitlements ?? []),
    updatedAt: new Date().toISOString(),
  };

  await upsertPayloadRecord("workspaces", {
    id: updatedWorkspace.id,
    owner_user_id: updatedWorkspace.ownerUserId,
    payload: updatedWorkspace,
  });
  await upsertPayloadRecord("workspace_credits", {
    id: createId("credit"),
    workspace_id: workspaceId,
    payload: createBalanceEntry(workspaceId, input.tokenAmount, input.label, {
      type: "purchase",
      source: "stripe",
      checkoutSessionId: input.checkoutSessionId,
    }),
  });

  return updatedWorkspace;
}

export async function consumeSupabaseWorkspaceTokens(
  workspaceId: string,
  input: {
    actionId: TokenActionId;
    actionKey: string;
    label: string;
  },
) {
  const workspace = await getWorkspacePayload(workspaceId);

  if (!workspace) {
    throw new Error("Workspace not found.");
  }

  const tokenCost = getTokenActionCost(input.actionId);
  const credits = await listPayloadRecords<WorkspaceCreditEntry>("workspace_credits", "workspace_id", workspaceId);
  const spendAlreadyLogged = credits.some(
    (entry) =>
      entry.type === "spend" &&
      entry.actionId === input.actionId &&
      entry.actionKey === input.actionKey,
  );

  if (spendAlreadyLogged || tokenCost <= 0) {
    return workspace;
  }

  if ((workspace.tokenBalance ?? workspace.creditBalance ?? 0) < tokenCost) {
    throw new Error("INSUFFICIENT_TOKENS");
  }

  const nextTokenBalance = (workspace.tokenBalance ?? workspace.creditBalance ?? 0) - tokenCost;
  const updatedWorkspace: WorkspaceRecord = {
    ...workspace,
    tokenBalance: nextTokenBalance,
    creditBalance: nextTokenBalance,
    updatedAt: new Date().toISOString(),
  };

  await upsertPayloadRecord("workspaces", {
    id: updatedWorkspace.id,
    owner_user_id: updatedWorkspace.ownerUserId,
    payload: updatedWorkspace,
  });
  await upsertPayloadRecord("workspace_credits", {
    id: createId("credit"),
    workspace_id: workspaceId,
    payload: createBalanceEntry(workspaceId, -tokenCost, input.label, {
      type: "spend",
      source: "workspace",
      actionId: input.actionId,
      actionKey: input.actionKey,
    }),
  });

  return updatedWorkspace;
}

export async function deleteSupabaseLead(workspaceId: string, leadId: string) {
  const detail = await getSupabaseLeadDetail(workspaceId, leadId);

  if (!detail) {
    return false;
  }

  await Promise.all([
    deleteWorkspaceScopedRows("share_links", workspaceId, [["lead_id", leadId]]),
    deleteWorkspaceScopedRows("activities", workspaceId, [["lead_id", leadId]]),
    deleteWorkspaceScopedRows("reminders", workspaceId, [["lead_id", leadId]]),
    deleteWorkspaceScopedRows("saved_reports", workspaceId, [["lead_id", leadId]]),
    deleteWorkspaceScopedRows("leads", workspaceId, [["id", leadId]]),
  ]);

  return true;
}

export async function updateSupabaseLeadStage(
  workspaceId: string,
  leadId: string,
  stage: LeadStage,
) {
  const detail = await getSupabaseLeadDetail(workspaceId, leadId);

  if (!detail) {
    return null;
  }

  const updatedLead = {
    ...detail.lead,
    stage,
    updatedAt: new Date().toISOString(),
  };

  await upsertPayloadRecord("leads", {
    id: updatedLead.id,
    workspace_id: workspaceId,
    payload: updatedLead,
  });
  await upsertPayloadRecord("activities", {
    id: createId("activity"),
    workspace_id: workspaceId,
    lead_id: leadId,
    payload: {
      id: createId("activity"),
      workspaceId,
      leadId,
      type: "stage-updated",
      title: "Lead stage updated",
      detail: `Moved to ${stage.replace(/-/g, " ")}.`,
      occurredAt: updatedLead.updatedAt,
    } satisfies LeadActivity,
  });

  return updatedLead;
}

export async function completeSupabaseReminder(workspaceId: string, reminderId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("reminders")
    .select("payload")
    .eq("workspace_id", workspaceId)
    .eq("id", reminderId)
    .maybeSingle();

  if (!data?.payload) {
    return null;
  }

  const reminder = data.payload as ReminderRecord;
  reminder.status = "complete";

  await upsertPayloadRecord("reminders", {
    id: reminder.id,
    workspace_id: workspaceId,
    lead_id: reminder.leadId,
    payload: reminder,
  });

  return reminder;
}

export async function saveSupabaseTemplate(
  workspaceId: string,
  input: Pick<EmailTemplateRecord, "name" | "subject" | "body" | "kind"> & {
    id?: string;
  },
) {
  const template: EmailTemplateRecord = {
    id: input.id ?? createId("template"),
    workspaceId,
    name: input.name,
    subject: input.subject,
    body: input.body,
    kind: input.kind,
    updatedAt: new Date().toISOString(),
  };

  await upsertPayloadRecord("email_templates", {
    id: template.id,
    workspace_id: workspaceId,
    payload: template,
  });

  return template;
}

export async function resolveSupabasePublicShare(
  surface: ShareSurface,
  id: string,
  token: string,
): Promise<PublicShareSnapshot | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("share_links")
    .select("workspace_id,payload")
    .eq("lead_id", id)
    .eq("surface", surface)
    .eq("token", token)
    .maybeSingle();

  if (!data?.payload || !data.workspace_id) {
    return null;
  }

  const shareLink = data.payload as ShareLinkRecord;
  const detail = await getSupabaseLeadDetail(data.workspace_id, id);

  if (!detail) {
    return null;
  }

  const updatedShareLink = {
    ...shareLink,
    views: shareLink.views + 1,
  };
  await upsertPayloadRecord("share_links", {
    id: updatedShareLink.id,
    workspace_id: detail.workspace.id,
    lead_id: detail.lead.id,
    surface,
    token,
    payload: updatedShareLink,
  });

  return {
    workspace: detail.workspace,
    lead: detail.lead,
    savedReport: detail.savedReport,
    shareLink: updatedShareLink,
  };
}
