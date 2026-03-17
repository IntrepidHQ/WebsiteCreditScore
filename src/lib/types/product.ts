import type { AgencyBranding, AuditReport, ThemeTokens } from "@/lib/types/audit";

export type LeadStage =
  | "new"
  | "audit-ready"
  | "packet-sent"
  | "follow-up-due"
  | "discovery-booked"
  | "brief-approved"
  | "won"
  | "lost";

export type ReminderStatus = "open" | "complete";
export type ShareSurface = "audit" | "packet" | "brief";
export type ProposalOfferType = "percentage" | "fixed" | "bonus";
export type ActivityType =
  | "audit-created"
  | "packet-opened"
  | "email-copied"
  | "stage-updated"
  | "reminder-created"
  | "reminder-completed"
  | "brief-approved"
  | "share-opened";
export type ReferralStatus = "pending" | "converted" | "credited";
export type BillingStatus = "trial" | "active" | "past-due" | "manual";

export interface ProposalOffer {
  id: string;
  label: string;
  reason: string;
  displayMode: ProposalOfferType;
  value: number;
  expiresAt: string;
  note?: string;
  bonusLabel?: string;
}

export interface WorkspaceRecord {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  billingStatus: BillingStatus;
  creditBalance: number;
  branding: AgencyBranding;
  savedTheme: ThemeTokens;
}

export interface SavedReport {
  id: string;
  workspaceId: string;
  leadId: string;
  title: string;
  normalizedUrl: string;
  createdAt: string;
  updatedAt: string;
  qualityCheckPassed: boolean;
  reportSnapshot: AuditReport;
}

export interface LeadRecord {
  id: string;
  workspaceId: string;
  reportId: string;
  title: string;
  companyName: string;
  normalizedUrl: string;
  previewImage?: string;
  stage: LeadStage;
  createdAt: string;
  updatedAt: string;
  currentScore: number;
  projectedScore: number;
  summary: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface LeadActivity {
  id: string;
  workspaceId: string;
  leadId: string;
  type: ActivityType;
  title: string;
  detail: string;
  occurredAt: string;
}

export interface ReminderRecord {
  id: string;
  workspaceId: string;
  leadId: string;
  title: string;
  detail: string;
  dueAt: string;
  status: ReminderStatus;
}

export interface EmailTemplateRecord {
  id: string;
  workspaceId: string;
  name: string;
  subject: string;
  body: string;
  kind: "intro" | "follow-up" | "proposal";
  updatedAt: string;
}

export interface ReferralCodeRecord {
  id: string;
  workspaceId: string;
  code: string;
  shareUrl: string;
  rewardLabel: string;
  createdAt: string;
}

export interface ReferralEventRecord {
  id: string;
  workspaceId: string;
  codeId: string;
  inviteeEmail: string;
  status: ReferralStatus;
  creditAmount: number;
  createdAt: string;
  convertedAt?: string;
}

export interface WorkspaceCreditEntry {
  id: string;
  workspaceId: string;
  amount: number;
  label: string;
  createdAt: string;
}

export interface ProductPromoRecord {
  id: string;
  code: string;
  label: string;
  description: string;
  type: "percentage" | "fixed" | "workspace-credit";
  value: number;
  active: boolean;
}

export interface ShareLinkRecord {
  id: string;
  workspaceId: string;
  leadId: string;
  surface: ShareSurface;
  token: string;
  views: number;
  enabled: boolean;
  createdAt: string;
}

export interface DashboardSnapshot {
  workspace: WorkspaceRecord;
  leads: LeadRecord[];
  reminders: ReminderRecord[];
  templates: EmailTemplateRecord[];
  referralCode: ReferralCodeRecord | null;
  referralEvents: ReferralEventRecord[];
  credits: WorkspaceCreditEntry[];
  promos: ProductPromoRecord[];
}

export interface LeadDetailSnapshot {
  workspace: WorkspaceRecord;
  lead: LeadRecord;
  savedReport: SavedReport;
  activities: LeadActivity[];
  reminders: ReminderRecord[];
  shareLinks: ShareLinkRecord[];
}

export interface PublicShareSnapshot {
  workspace: WorkspaceRecord;
  lead: LeadRecord;
  savedReport: SavedReport;
  shareLink: ShareLinkRecord;
}

export interface WorkspaceSession {
  mode: "demo" | "supabase";
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}
