import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type { AgencyBranding, ThemeTokens } from "@/lib/types/audit";
import type { BillingAddOnId, BillingPlanId, TokenActionId } from "@/lib/billing/catalog";
import {
  assertWorkspaceAllowsMaxPrompt,
  workspaceWithComplimentaryMaxEntitlement,
} from "@/lib/billing/max-access";
import { FREE_TIER_CREDITS, getTokenActionCost } from "@/lib/billing/catalog";
import { buildAuditReportById, buildAuditReportFromUrl, buildLiveAuditReportFromUrl } from "@/lib/mock/report-builder";
import { sampleAudits } from "@/lib/mock/sample-audits";
import { prepareReportForStorage, passesReportQualityCheck } from "@/lib/product/report-quality";
import type {
  BillingPlan,
  BillingStatus,
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
import { isUnlimitedWorkspace } from "@/lib/product/unlimited-workspace";
import { calculatePricingSummary, calculateProjectedScore, getDefaultSelectedIds } from "@/lib/utils/pricing";
import { createThemeTokens } from "@/lib/utils/theme";
import { slugFromUrl } from "@/lib/utils/url";

const STORE_PATH = path.join("/tmp", "craydl-product-store.json");
const LEGACY_BRAND_PATTERN = new RegExp(["C", "r", "a", "y", "d", "l"].join(""), "i");
const LEGACY_PROVIDER_PAGES_PATTERN = /provider pages/i;

interface LocalProductStore {
  workspaces: WorkspaceRecord[];
  savedReports: SavedReport[];
  leads: LeadRecord[];
  activities: LeadActivity[];
  reminders: ReminderRecord[];
  emailTemplates: EmailTemplateRecord[];
  referralCodes: ReferralCodeRecord[];
  referralEvents: ReferralEventRecord[];
  workspaceCredits: WorkspaceCreditEntry[];
  promos: ProductPromoRecord[];
  shareLinks: ShareLinkRecord[];
}

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
>(
  items: T[],
) {
  return [...items].sort((left, right) => {
    const leftValue =
      left.updatedAt ?? left.occurredAt ?? left.createdAt ?? left.dueAt ?? "";
    const rightValue =
      right.updatedAt ?? right.occurredAt ?? right.createdAt ?? right.dueAt ?? "";

    return new Date(rightValue).getTime() - new Date(leftValue).getTime();
  });
}

function getSurfaceToken(leadId: string, surface: ShareSurface) {
  return `${leadId}-${surface}-share`;
}

function getWorkspaceDefaults(ownerUserId: string) {
  const createdAt = new Date().toISOString();
  const unlimited = isUnlimitedWorkspace();

  return {
    id: "workspace-websitecreditscore",
    ownerUserId,
    name: "WebsiteCreditScore.com workspace",
    slug: "websitecreditscore",
    createdAt,
    updatedAt: createdAt,
    billingStatus: (unlimited ? "active" : "trial") as BillingStatus,
    billingPlan: (unlimited ? "pro" : "free") as BillingPlan,
    creditBalance: unlimited ? 999_999 : FREE_TIER_CREDITS,
    tokenBalance: unlimited ? 999_999 : FREE_TIER_CREDITS,
    entitlements: unlimited ? (["seo-benchmark", "max-stealth"] as WorkspaceEntitlement[]) : [],
    branding: {
      agencyName: "WebsiteCreditScore.com",
      logoMark: "WCS",
      logoColor: "",
      logoScale: 1,
      contactName: "WebsiteCreditScore.com team",
      contactTitle: "Founder",
      contactEmail: "",
      contactPhone: "",
      headshot: "/previews/agency-avatar.svg",
      accentOverride: "#f7b21b",
    },
    savedTheme: createThemeTokens({
      mode: "dark",
      accentColor: "#f7b21b",
    }),
    onboardingWelcomeScanUsed: false,
  };
}

function normalizeWorkspaceRecord(workspace: WorkspaceRecord) {
  const usesLegacyBrand = [
    workspace.name,
    workspace.slug,
    workspace.branding.agencyName,
    workspace.branding.logoMark,
    workspace.branding.contactName,
    workspace.branding.contactEmail,
    workspace.branding.headshot,
  ].some((value) => LEGACY_BRAND_PATTERN.test(value));

  const branding = {
    ...workspace.branding,
    agencyName: usesLegacyBrand ? "WebsiteCreditScore.com" : workspace.branding.agencyName,
    logoMark: usesLegacyBrand || workspace.branding.logoMark === "CR" ? "WCS" : workspace.branding.logoMark,
    logoColor: workspace.branding.logoColor ?? "",
    logoScale: workspace.branding.logoScale ?? 1,
    contactName: usesLegacyBrand ? "WebsiteCreditScore.com team" : workspace.branding.contactName,
    contactEmail: usesLegacyBrand ? "" : workspace.branding.contactEmail,
    contactPhone: usesLegacyBrand ? "" : workspace.branding.contactPhone,
    headshot: usesLegacyBrand ? "/previews/agency-avatar.svg" : workspace.branding.headshot,
  };

  const name = workspace.name.toLowerCase().includes("internal workspace")
    ? "WebsiteCreditScore.com workspace"
    : workspace.name;
  const slug = usesLegacyBrand ? "websitecreditscore" : workspace.slug;
  const usesLegacyBilling = workspace.tokenBalance == null && workspace.billingPlan == null;
  const normalizedTokenBalance = usesLegacyBilling
    ? 10
    : workspace.tokenBalance ?? workspace.creditBalance ?? FREE_TIER_CREDITS;

  return {
    ...workspace,
    name,
    slug,
    billingPlan: workspace.billingPlan ?? (workspace.billingStatus === "active" ? "pro" : "free"),
    creditBalance: usesLegacyBilling
      ? 10
      : workspace.creditBalance ?? normalizedTokenBalance,
    tokenBalance: normalizedTokenBalance,
    entitlements: workspace.entitlements ?? [],
    onboardingWelcomeScanUsed: workspace.onboardingWelcomeScanUsed !== false,
    branding,
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

function pruneLegacyProviderPages(store: LocalProductStore) {
  const leadIdsToRemove = new Set(
    store.leads
      .filter(
        (lead) =>
          isLegacyProviderPagesText(lead.title) ||
          isLegacyProviderPagesText(lead.companyName) ||
          isLegacyProviderPagesText(lead.summary) ||
          isLegacyProviderPagesText(lead.contactName) ||
          isLegacyProviderPagesText(lead.normalizedUrl),
      )
      .map((lead) => lead.id),
  );

  const reportIdsToRemove = new Set(
    store.savedReports
      .filter(
        (report) =>
          leadIdsToRemove.has(report.leadId) ||
          isLegacyProviderPagesText(report.title) ||
          isLegacyProviderPagesText(report.normalizedUrl) ||
          isLegacyProviderPagesText(report.reportSnapshot.title) ||
          isLegacyProviderPagesText(report.reportSnapshot.executiveSummary),
      )
      .map((report) => report.id),
  );

  const activityCount = store.activities.length;
  const reminderCount = store.reminders.length;
  const shareCount = store.shareLinks.length;
  const templateCount = store.emailTemplates.length;

  store.savedReports = store.savedReports.filter((report) => !reportIdsToRemove.has(report.id));
  store.leads = store.leads.filter((lead) => !leadIdsToRemove.has(lead.id));
  store.activities = store.activities.filter((activity) => !leadIdsToRemove.has(activity.leadId));
  store.reminders = store.reminders.filter((reminder) => !leadIdsToRemove.has(reminder.leadId));
  store.shareLinks = store.shareLinks.filter((shareLink) => !leadIdsToRemove.has(shareLink.leadId));
  store.emailTemplates = store.emailTemplates.filter(
    (template) =>
      !isLegacyProviderPagesText(template.name) &&
      !isLegacyProviderPagesText(template.subject) &&
      !isLegacyProviderPagesText(template.body),
  );

  return (
    leadIdsToRemove.size > 0 ||
    reportIdsToRemove.size > 0 ||
    store.activities.length !== activityCount ||
    store.reminders.length !== reminderCount ||
    store.shareLinks.length !== shareCount ||
    store.emailTemplates.length !== templateCount
  );
}

function createSavedLeadFromReport(
  workspaceId: string,
  reportId: string,
  reportTitle: string,
  normalizedUrl: string,
  createdAt: string,
) {
  const baseReport = prepareReportForStorage(
    buildAuditReportById(reportId) ?? buildAuditReportFromUrl(normalizedUrl),
  );
  const defaultSelections = getDefaultSelectedIds(baseReport.pricingBundle);
  const summary = calculatePricingSummary(baseReport.pricingBundle, defaultSelections);
  const projectedScore = calculateProjectedScore(
    baseReport.overallScore,
    summary.selectedPackageItems,
  );
  const proposalOffer = createDefaultProposalOffer(summary.total, new Date(createdAt));
  const report = {
    ...baseReport,
    proposalOffer,
  };
  const leadId = report.id;
  const phoneFact = report.siteObservation.verifiedFacts.find((fact) => fact.type === "phone");
  const emailFact = report.siteObservation.verifiedFacts.find((fact) => fact.type === "email");

  const savedReport: SavedReport = {
    id: leadId,
    workspaceId,
    leadId,
    title: reportTitle,
    normalizedUrl,
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
    normalizedUrl,
    previewImage: report.previewSet.current.desktop,
    stage: reportId === "one-medical" ? "audit-ready" : "follow-up-due",
    createdAt,
    updatedAt: createdAt,
    currentScore: report.overallScore,
    projectedScore,
    summary: report.executiveSummary,
    contactName: report.title,
    contactEmail: emailFact?.value,
    contactPhone: phoneFact?.value,
  };

  const shareLinks: ShareLinkRecord[] = (["audit", "packet", "brief"] as const).map(
    (surface) => ({
      id: createId(`share-${surface}`),
      workspaceId,
      leadId,
      surface,
      token: getSurfaceToken(leadId, surface),
      views: surface === "packet" ? 2 : surface === "audit" ? 1 : 0,
      enabled: true,
      createdAt,
    }),
  );

  const activities: LeadActivity[] = [
    {
      id: createId("activity"),
      workspaceId,
      leadId,
      type: "audit-created",
      title: "Audit created",
      detail: "The working audit was generated and saved to the workspace.",
      occurredAt: createdAt,
    },
    {
      id: createId("activity"),
      workspaceId,
      leadId,
      type: "packet-opened",
      title: "Packet opened",
      detail: "The packet share link has already been checked internally.",
      occurredAt: createdAt,
    },
  ];

  const reminderDue = new Date(createdAt);
  reminderDue.setDate(reminderDue.getDate() + 2);
  const reminders: ReminderRecord[] = [
    {
      id: createId("reminder"),
      workspaceId,
      leadId,
      title: "Follow up on the packet",
      detail: "Send the short intro email, then check for a reply or site visit within two business days.",
      dueAt: reminderDue.toISOString(),
      status: "open",
    },
  ];

  return {
    savedReport,
    lead,
    shareLinks,
    activities,
    reminders,
  };
}

async function createSeedStore(ownerUserId: string): Promise<LocalProductStore> {
  const workspace = getWorkspaceDefaults(ownerUserId);
  const now = new Date();
  const seededLeads = sampleAudits.map((sample) =>
    createSavedLeadFromReport(
      workspace.id,
      sample.id,
      sample.title,
      sample.url,
      sample.scannedAt ?? now.toISOString(),
    ),
  );
  const latestSeedDate = seededLeads.reduce((latest, entry) => {
    const createdAt = new Date(entry.savedReport.createdAt);

    return createdAt.getTime() > latest.getTime() ? createdAt : latest;
  }, now);
  const earliestSeedDate = seededLeads.reduce((earliest, entry) => {
    const createdAt = new Date(entry.savedReport.createdAt);

    return createdAt.getTime() < earliest.getTime() ? createdAt : earliest;
  }, latestSeedDate);

  const referralCodeId = createId("referral");

  return {
    workspaces: [workspace],
    savedReports: seededLeads.map((entry) => entry.savedReport),
    leads: seededLeads.map((entry) => entry.lead),
    activities: seededLeads.flatMap((entry) => entry.activities),
    reminders: seededLeads.flatMap((entry) => entry.reminders),
    emailTemplates: [
      {
        id: createId("template"),
        workspaceId: workspace.id,
        name: "Intro review",
        subject: "Quick site review and redesign direction",
        body: "I pulled together a short review of the current site, the biggest friction points, and the fastest path to a better first impression. If helpful, I can send over the short packet and walk you through it in fifteen minutes.",
        kind: "intro",
        updatedAt: latestSeedDate.toISOString(),
      },
      {
        id: createId("template"),
        workspaceId: workspace.id,
        name: "Follow-up after packet",
        subject: "Following up on the site packet",
        body: "Wanted to follow up on the review I sent over. If the direction feels relevant, I can tighten this into a scoped brief and recommended package before any design work starts.",
        kind: "follow-up",
        updatedAt: latestSeedDate.toISOString(),
      },
    ],
    referralCodes: [
      {
        id: referralCodeId,
        workspaceId: workspace.id,
        code: "STARTUP",
        shareUrl: "https://websitecreditscore.com/app/login?ref=STARTUP",
        rewardLabel: "10% off for new business owners who need a website",
        createdAt: now.toISOString(),
      },
    ],
    referralEvents: [
      {
        id: createId("ref-event"),
        workspaceId: workspace.id,
        codeId: referralCodeId,
        inviteeEmail: "studio@example.com",
        status: "pending",
        creditAmount: 0,
        createdAt: now.toISOString(),
      },
      {
        id: createId("ref-event"),
        workspaceId: workspace.id,
        codeId: referralCodeId,
        inviteeEmail: "ops@example.com",
        status: "credited",
        creditAmount: 10,
        createdAt: seededLeads[1]?.savedReport.createdAt ?? now.toISOString(),
        convertedAt: latestSeedDate.toISOString(),
      },
    ],
    workspaceCredits: [
      {
        ...createBalanceEntry(workspace.id, FREE_TIER_CREDITS, "Free tier included credits", {
          type: "grant",
          source: "system",
        }),
        createdAt: earliestSeedDate.toISOString(),
      },
    ],
    promos: [
      {
        id: createId("promo"),
        code: "FIFTEEN",
        label: "Launch coupon",
        description: "15% off the checkout total for early buyers.",
        type: "percentage",
        value: 15,
        active: true,
        maxRedemptions: 100,
        redemptionsUsed: 0,
      },
      {
        id: createId("promo"),
        code: "RUSH24",
        label: "24-Hour Turnaround",
        description: "Priority turnaround for a $250 fee.",
        type: "fixed",
        value: 250,
        active: true,
        maxRedemptions: 100,
        redemptionsUsed: 0,
      },
      {
        id: createId("promo"),
        code: "STARTUP",
        label: "Startup discount",
        description: "10% off for new business owners who need a website.",
        type: "percentage",
        value: 10,
        active: true,
      },
    ],
    shareLinks: seededLeads.flatMap((entry) => entry.shareLinks),
  };
}

async function readStore(ownerUserId: string) {
  try {
    const content = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(content) as LocalProductStore;

    if (!parsed.workspaces.length) {
      throw new Error("Empty local product store");
    }

    let mutated = false;
    const normalizedWorkspaces = parsed.workspaces.map(normalizeWorkspaceRecord);
    const normalizedReferralCodes = parsed.referralCodes.map((entry) =>
      entry.code === "CRAYDL-FOUNDING" || entry.code === "WCS-FOUNDING" || entry.code === "FOUNDING"
        ? {
            ...entry,
            code: "STARTUP",
            shareUrl: "https://websitecreditscore.com/app/login?ref=STARTUP",
          }
        : entry,
    );
    if (JSON.stringify(normalizedWorkspaces) !== JSON.stringify(parsed.workspaces)) {
      parsed.workspaces = normalizedWorkspaces;
      mutated = true;
    }
    if (JSON.stringify(normalizedReferralCodes) !== JSON.stringify(parsed.referralCodes)) {
      parsed.referralCodes = normalizedReferralCodes;
      mutated = true;
    }

    if (pruneLegacyProviderPages(parsed)) {
      mutated = true;
    }

    const needsFifteenSeed = !parsed.promos.some((promo) => promo.code === "FIFTEEN");
    const needsRushSeed = !parsed.promos.some((promo) => promo.code === "RUSH24");
    const needsStartupSeed = !parsed.promos.some((promo) => promo.code === "STARTUP");

    if (needsFifteenSeed) {
      parsed.promos.unshift({
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
      mutated = true;
    }

    if (needsRushSeed) {
      parsed.promos.splice(1, 0, {
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
      mutated = true;
    }

    if (needsStartupSeed) {
      parsed.promos.push({
        id: createId("promo"),
        code: "STARTUP",
        label: "Startup discount",
        description: "10% off for new business owners who need a website.",
        type: "percentage",
        value: 10,
        active: true,
      });
      mutated = true;
    }

    const workspaceId = parsed.workspaces[0]?.id;

    if (workspaceId) {
      for (const sample of sampleAudits) {
        const exists = parsed.savedReports.some((report) => report.id === sample.id);

        if (exists) {
          continue;
        }

        const seeded = createSavedLeadFromReport(
          workspaceId,
          sample.id,
          sample.title,
          sample.url,
          sample.scannedAt ?? new Date().toISOString(),
        );

        parsed.savedReports.push(seeded.savedReport);
        parsed.leads.push(seeded.lead);
        parsed.activities.push(...seeded.activities);
        parsed.reminders.push(...seeded.reminders);
        parsed.shareLinks.push(...seeded.shareLinks);
        mutated = true;
      }
    }

    if (mutated) {
      await fs.writeFile(STORE_PATH, JSON.stringify(parsed, null, 2), "utf8");
    }

    return parsed;
  } catch {
    const seeded = await createSeedStore(ownerUserId);
    await fs.writeFile(STORE_PATH, JSON.stringify(seeded, null, 2), "utf8");
    return seeded;
  }
}

async function writeStore(store: LocalProductStore) {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

async function updateStore<T>(
  ownerUserId: string,
  updater: (store: LocalProductStore) => Promise<T> | T,
) {
  const store = await readStore(ownerUserId);
  const result = await updater(store);
  await writeStore(store);
  return result;
}

function getWorkspaceOrThrow(store: LocalProductStore, workspaceId: string) {
  const workspace = store.workspaces.find((entry) => entry.id === workspaceId);

  if (!workspace) {
    throw new Error(`Unknown workspace: ${workspaceId}`);
  }

  return workspace;
}

export async function ensureLocalWorkspace(session: WorkspaceSession) {
  return updateStore(session.userId, async (store) => {
    const idx = store.workspaces.findIndex((workspace) => workspace.ownerUserId === session.userId);

    if (idx >= 0) {
      const merged = workspaceWithComplimentaryMaxEntitlement(store.workspaces[idx], session.email);
      store.workspaces[idx] = merged;
      return merged;
    }

    const workspace = workspaceWithComplimentaryMaxEntitlement(
      getWorkspaceDefaults(session.userId),
      session.email,
    );
    store.workspaces.push(workspace);
    return workspace;
  });
}

export async function getLocalDashboard(workspaceId: string, ownerUserId: string): Promise<DashboardSnapshot> {
  const store = await readStore(ownerUserId);
  const workspace = getWorkspaceOrThrow(store, workspaceId);

  return {
    workspace,
    savedReports: sortNewestFirst(
      store.savedReports.filter((report) => report.workspaceId === workspaceId),
    ),
    leads: sortNewestFirst(
      store.leads
        .filter((lead) => lead.workspaceId === workspaceId)
        .map((lead) => ({
          ...lead,
          previewImage:
            lead.previewImage ??
            store.savedReports.find((entry) => entry.leadId === lead.id)?.reportSnapshot.previewSet.current.desktop,
        })),
    ),
    reminders: sortNewestFirst(
      store.reminders.filter(
        (reminder) => reminder.workspaceId === workspaceId && reminder.status === "open",
      ),
    ),
    templates: sortNewestFirst(
      store.emailTemplates.filter((template) => template.workspaceId === workspaceId),
    ),
    referralCode:
      store.referralCodes.find((entry) => entry.workspaceId === workspaceId) ?? null,
    referralEvents: sortNewestFirst(
      store.referralEvents.filter((entry) => entry.workspaceId === workspaceId),
    ),
    credits: sortNewestFirst(
      store.workspaceCredits.filter((entry) => entry.workspaceId === workspaceId),
    ),
    promos: store.promos.filter((promo) => promo.active),
  };
}

export async function getLocalLeadDetail(
  workspaceId: string,
  leadId: string,
  ownerUserId: string,
): Promise<LeadDetailSnapshot | null> {
  const store = await readStore(ownerUserId);
  const workspace = getWorkspaceOrThrow(store, workspaceId);
  const lead = store.leads.find((entry) => entry.workspaceId === workspaceId && entry.id === leadId);
  const savedReport = store.savedReports.find(
    (entry) => entry.workspaceId === workspaceId && entry.leadId === leadId,
  );

  if (!lead || !savedReport) {
    return null;
  }

  return {
    workspace,
    lead,
    savedReport,
    activities: sortNewestFirst(
      store.activities.filter((entry) => entry.workspaceId === workspaceId && entry.leadId === leadId),
    ),
    reminders: sortNewestFirst(
      store.reminders.filter((entry) => entry.workspaceId === workspaceId && entry.leadId === leadId),
    ),
    shareLinks: store.shareLinks.filter(
      (entry) => entry.workspaceId === workspaceId && entry.leadId === leadId,
    ),
  };
}

export async function createLocalLeadFromUrl(
  workspaceId: string,
  rawUrl: string,
  ownerUserId: string,
) {
  return updateStore(ownerUserId, async (store) => {
    const workspace = getWorkspaceOrThrow(store, workspaceId);
    const tokenCost = getTokenActionCost("scan-site");
    const unlimited = isUnlimitedWorkspace();
    const welcomeScanFree = !unlimited && workspace.onboardingWelcomeScanUsed === false;

    if (!unlimited && !welcomeScanFree && workspace.tokenBalance < tokenCost) {
      throw new Error("INSUFFICIENT_TOKENS");
    }

    const createdAt = new Date().toISOString();

    let liveReport;

    try {
      liveReport = await buildLiveAuditReportFromUrl(rawUrl);
    } catch {
      liveReport = buildAuditReportFromUrl(rawUrl);
    }

    const defaultSelections = getDefaultSelectedIds(liveReport.pricingBundle);
    const summary = calculatePricingSummary(liveReport.pricingBundle, defaultSelections);
    const projectedScore = calculateProjectedScore(
      liveReport.overallScore,
      summary.selectedPackageItems,
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
      previewImage: report.previewSet?.current?.desktop || "/previews/fallback-desktop.svg",
      stage: "audit-ready",
      createdAt,
      updatedAt: createdAt,
      currentScore: report.overallScore,
      projectedScore,
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
        token: getSurfaceToken(leadId, surface),
        views: 0,
        enabled: true,
        createdAt,
      }),
    );

    store.savedReports = [
      ...store.savedReports.filter((entry) => entry.id !== savedReport.id),
      savedReport,
    ];
    store.leads = [...store.leads.filter((entry) => entry.id !== lead.id), lead];
    store.shareLinks = [
      ...store.shareLinks.filter((entry) => entry.leadId !== lead.id),
      ...shareLinks,
    ];
    store.activities.push(
      {
        id: createId("activity"),
        workspaceId,
        leadId,
        type: "audit-created",
        title: "Audit created",
        detail: unlimited
          ? `Saved a working audit for ${report.title}.`
          : welcomeScanFree
            ? `Welcome scan — no tokens charged. Saved a working audit for ${report.title}.`
            : `Saved a working audit for ${report.title}.`,
        occurredAt: createdAt,
      },
      {
        id: createId("activity"),
        workspaceId,
        leadId,
        type: "reminder-created",
        title: "Follow-up reminder queued",
        detail: "The lead is ready for packet delivery and follow-up.",
        occurredAt: createdAt,
      },
    );
    store.reminders.push({
      id: createId("reminder"),
      workspaceId,
      leadId,
      title: "Send packet and follow up",
      detail: "Review the packet, copy the outreach email, and send the short packet within one business day.",
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: "open",
    });
    if (!unlimited) {
      workspace.onboardingWelcomeScanUsed = true;
    }
    if (!unlimited && !welcomeScanFree) {
      workspace.tokenBalance -= tokenCost;
      workspace.creditBalance = workspace.tokenBalance;
      store.workspaceCredits.push({
        ...createBalanceEntry(workspaceId, -tokenCost, "Live site scan", {
          type: "spend",
          source: "workspace",
          actionId: "scan-site",
          actionKey: `lead:${leadId}:scan`,
        }),
        createdAt,
      });
    }
    workspace.updatedAt = createdAt;

    return lead;
  });
}

export async function applyLocalBillingPurchase(
  workspaceId: string,
  ownerUserId: string,
  input: {
    checkoutSessionId: string;
    label: string;
    tokenAmount: number;
    planId?: BillingPlanId | null;
    addOnIds?: BillingAddOnId[];
    entitlements?: WorkspaceEntitlement[];
  },
) {
  return updateStore(ownerUserId, (store) => {
    const workspace = getWorkspaceOrThrow(store, workspaceId);
    const purchaseAlreadyApplied = store.workspaceCredits.some(
      (entry) => entry.workspaceId === workspaceId && entry.checkoutSessionId === input.checkoutSessionId,
    );

    if (purchaseAlreadyApplied) {
      return workspace;
    }

    if (input.tokenAmount > 0) {
      workspace.tokenBalance += input.tokenAmount;
      workspace.creditBalance = workspace.tokenBalance;
    }

    if (input.planId === "pro") {
      workspace.billingPlan = "pro";
      workspace.billingStatus = "active";
    }

    workspace.entitlements = mergeEntitlements(
      workspace.entitlements,
      input.entitlements ?? [],
    );
    workspace.updatedAt = new Date().toISOString();
    store.workspaceCredits.push(
      createBalanceEntry(workspaceId, input.tokenAmount, input.label, {
        type: "purchase",
        source: "stripe",
        checkoutSessionId: input.checkoutSessionId,
      }),
    );

    return workspace;
  });
}

export async function consumeLocalWorkspaceTokens(
  workspaceId: string,
  ownerUserId: string,
  input: {
    actionId: TokenActionId;
    actionKey: string;
    label: string;
  },
) {
  return updateStore(ownerUserId, (store) => {
    const workspace = getWorkspaceOrThrow(store, workspaceId);

    if (isUnlimitedWorkspace()) {
      return workspace;
    }

    if (input.actionId === "max-prompt") {
      assertWorkspaceAllowsMaxPrompt(workspace);
    }

    const tokenCost = getTokenActionCost(input.actionId);
    const spendAlreadyLogged = store.workspaceCredits.some(
      (entry) =>
        entry.workspaceId === workspaceId &&
        entry.type === "spend" &&
        entry.actionId === input.actionId &&
        entry.actionKey === input.actionKey,
    );

    if (spendAlreadyLogged || tokenCost <= 0) {
      return workspace;
    }

    if (workspace.tokenBalance < tokenCost) {
      throw new Error("INSUFFICIENT_TOKENS");
    }

    workspace.tokenBalance -= tokenCost;
    workspace.creditBalance = workspace.tokenBalance;
    workspace.updatedAt = new Date().toISOString();
    store.workspaceCredits.push(
      createBalanceEntry(workspaceId, -tokenCost, input.label, {
        type: "spend",
        source: "workspace",
        actionId: input.actionId,
        actionKey: input.actionKey,
      }),
    );

    return workspace;
  });
}

export async function deleteLocalLead(
  workspaceId: string,
  leadId: string,
  ownerUserId: string,
) {
  return updateStore(ownerUserId, (store) => {
    const leadExists = store.leads.some(
      (entry) => entry.workspaceId === workspaceId && entry.id === leadId,
    );

    if (!leadExists) {
      return false;
    }

    store.leads = store.leads.filter(
      (entry) => !(entry.workspaceId === workspaceId && entry.id === leadId),
    );
    store.savedReports = store.savedReports.filter(
      (entry) => !(entry.workspaceId === workspaceId && entry.leadId === leadId),
    );
    store.reminders = store.reminders.filter(
      (entry) => !(entry.workspaceId === workspaceId && entry.leadId === leadId),
    );
    store.activities = store.activities.filter(
      (entry) => !(entry.workspaceId === workspaceId && entry.leadId === leadId),
    );
    store.shareLinks = store.shareLinks.filter(
      (entry) => !(entry.workspaceId === workspaceId && entry.leadId === leadId),
    );

    return true;
  });
}

export async function updateLocalLeadStage(
  workspaceId: string,
  leadId: string,
  stage: LeadStage,
  ownerUserId: string,
) {
  return updateStore(ownerUserId, (store) => {
    const lead = store.leads.find((entry) => entry.workspaceId === workspaceId && entry.id === leadId);

    if (!lead) {
      return null;
    }

    lead.stage = stage;
    lead.updatedAt = new Date().toISOString();
    store.activities.push({
      id: createId("activity"),
      workspaceId,
      leadId,
      type: "stage-updated",
      title: "Lead stage updated",
      detail: `Moved to ${stage.replace(/-/g, " ")}.`,
      occurredAt: lead.updatedAt,
    });

    return lead;
  });
}

export async function completeLocalReminder(
  workspaceId: string,
  reminderId: string,
  ownerUserId: string,
) {
  return updateStore(ownerUserId, (store) => {
    const reminder = store.reminders.find(
      (entry) => entry.workspaceId === workspaceId && entry.id === reminderId,
    );

    if (!reminder) {
      return null;
    }

    reminder.status = "complete";
    store.activities.push({
      id: createId("activity"),
      workspaceId,
      leadId: reminder.leadId,
      type: "reminder-completed",
      title: "Reminder completed",
      detail: reminder.title,
      occurredAt: new Date().toISOString(),
    });

    return reminder;
  });
}

export async function saveLocalTemplate(
  workspaceId: string,
  ownerUserId: string,
  input: Pick<EmailTemplateRecord, "name" | "subject" | "body" | "kind"> & {
    id?: string;
  },
) {
  return updateStore(ownerUserId, (store) => {
    const existing = input.id
      ? store.emailTemplates.find(
          (entry) => entry.workspaceId === workspaceId && entry.id === input.id,
        )
      : null;

    if (existing) {
      existing.name = input.name;
      existing.subject = input.subject;
      existing.body = input.body;
      existing.kind = input.kind;
      existing.updatedAt = new Date().toISOString();

      return existing;
    }

    const template: EmailTemplateRecord = {
      id: createId("template"),
      workspaceId,
      name: input.name,
      subject: input.subject,
      body: input.body,
      kind: input.kind,
      updatedAt: new Date().toISOString(),
    };

    store.emailTemplates.push(template);

    return template;
  });
}

export async function saveLocalTheme(
  workspaceId: string,
  ownerUserId: string,
  theme: ThemeTokens,
  branding: AgencyBranding,
) {
  return updateStore(ownerUserId, (store) => {
    const workspace = getWorkspaceOrThrow(store, workspaceId);

    workspace.savedTheme = theme;
    workspace.branding = { ...workspace.branding, ...branding };
    workspace.updatedAt = new Date().toISOString();

    return workspace;
  });
}

export async function resolveLocalPublicShare(
  surface: ShareSurface,
  id: string,
  token: string,
  ownerUserId = "demo-owner",
): Promise<PublicShareSnapshot | null> {
  return updateStore(ownerUserId, (store) => {
    const shareLink = store.shareLinks.find(
      (entry) =>
        entry.leadId === id &&
        entry.surface === surface &&
        entry.token === token &&
        entry.enabled,
    );

    if (!shareLink) {
      return null;
    }

    const savedReport = store.savedReports.find((entry) => entry.leadId === id);
    const lead = store.leads.find((entry) => entry.id === id);
    const workspace = store.workspaces.find((entry) => entry.id === shareLink.workspaceId);

    if (!savedReport || !lead || !workspace) {
      return null;
    }

    shareLink.views += 1;
    store.activities.push({
      id: createId("activity"),
      workspaceId: workspace.id,
      leadId: lead.id,
      type: "share-opened",
      title: `${surface} share opened`,
      detail: `The ${surface} share link was opened.`,
      occurredAt: new Date().toISOString(),
    });

    return {
      workspace,
      lead,
      savedReport,
      shareLink,
    };
  });
}
