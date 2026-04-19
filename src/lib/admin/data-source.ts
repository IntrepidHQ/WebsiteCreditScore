/**
 * Admin data-source selector.
 *
 * - Live Supabase queries (`./queries`) when `hasSupabaseEnv()` is true.
 * - Deterministic mock seed (`./mock-data`) otherwise, so preview deploys and
 *   unconfigured local dev still render a dashboard.
 *
 * All functions are exported async-uniformly so consumers can `await` without
 * caring which source is active. Mock functions are sync; we wrap them in
 * `Promise.resolve(...)` to keep the external surface consistent.
 */

import { hasSupabaseEnv } from "@/lib/supabase/config";
import * as mock from "./mock-data";
import * as live from "./queries";
import type {
  AdminCustomer,
  AdminDailyPoint,
  AdminScan,
  AdminSummary,
} from "./mock-data";

const useLive = hasSupabaseEnv();

export const getAdminCustomers = (): Promise<AdminCustomer[]> =>
  useLive ? live.getAdminCustomers() : Promise.resolve(mock.getAdminCustomers());

export const getAdminCustomer = (id: string): Promise<AdminCustomer | null> =>
  useLive ? live.getAdminCustomer(id) : Promise.resolve(mock.getAdminCustomer(id));

export const getAdminScansForCustomer = (customerId: string): Promise<AdminScan[]> =>
  useLive
    ? live.getAdminScansForCustomer(customerId)
    : Promise.resolve(mock.getAdminScansForCustomer(customerId));

export const getAdminDailySeries = (days = 30): Promise<AdminDailyPoint[]> =>
  useLive ? live.getAdminDailySeries(days) : Promise.resolve(mock.getAdminDailySeries(days));

export const getAdminSummary = (): Promise<AdminSummary> =>
  useLive ? live.getAdminSummary() : Promise.resolve(mock.getAdminSummary());

export { formatCents, planLabel } from "./mock-data";
export type {
  AdminCustomer,
  AdminDailyPoint,
  AdminPlan,
  AdminScan,
  AdminSummary,
} from "./mock-data";
