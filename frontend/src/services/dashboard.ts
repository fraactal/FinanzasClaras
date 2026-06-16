import { apiFetch } from "./api";
import type { AdminSystemOverview, AdminUser, Budget, Category, DailyReport, Expense, FinancialProfile, MonthlyReport, Tip, WeeklyReport } from "../types";

export const today = () => new Date().toISOString().slice(0, 10);

export const fetchCategories = () => apiFetch<Category[]>("/categories");
export const fetchExpenses = (params = `date=${today()}`) => apiFetch<Expense[]>(`/expenses?${params}`);
export const createExpense = (payload: Record<string, unknown>) => apiFetch<Expense>("/expenses", { method: "POST", body: JSON.stringify(payload) });
export const updateExpense = (id: number, payload: Record<string, unknown>) => apiFetch<Expense>(`/expenses/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
export const deleteExpense = (id: number) => apiFetch<void>(`/expenses/${id}`, { method: "DELETE" });
export const fetchDailyReport = (date: string) => apiFetch<DailyReport>(`/reports/daily?date=${date}`);
export const fetchWeeklyReport = (date: string) => apiFetch<WeeklyReport>(`/reports/weekly?date=${date}`);
export const fetchMonthlyReport = (year: number, month: number) => apiFetch<MonthlyReport>(`/reports/monthly?year=${year}&month=${month}`);
export const fetchBudgets = () => apiFetch<Budget[]>("/budgets");
export const createBudget = (payload: Record<string, unknown>) => apiFetch<Budget>("/budgets", { method: "POST", body: JSON.stringify(payload) });
export const deleteBudget = (id: number) => apiFetch<void>(`/budgets/${id}`, { method: "DELETE" });
export const fetchProfile = () => apiFetch<FinancialProfile>("/financial-profile");
export const saveProfile = (payload: Record<string, unknown>) => apiFetch<FinancialProfile>("/financial-profile", { method: "PUT", body: JSON.stringify(payload) });
export const fetchTips = () => apiFetch<Tip[]>("/tips");
export const createCategory = (payload: Record<string, unknown>) => apiFetch<Category>("/categories", { method: "POST", body: JSON.stringify(payload) });
export const updateCategory = (id: number, payload: Record<string, unknown>) => apiFetch<Category>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
export const deleteCategoryApi = (id: number) => apiFetch<void>(`/categories/${id}`, { method: "DELETE" });

export const fetchAdminUsers = (email = "") =>
  apiFetch<AdminUser[]>(`/admin/users${email ? `?email=${encodeURIComponent(email)}` : ""}`);

export const deactivateUserByEmail = (email: string) =>
  apiFetch<{ message: string; email: string; is_active: boolean }>("/admin/users/deactivate-by-email", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const reactivateUserByEmail = (email: string) =>
  apiFetch<{ message: string; email: string; is_active: boolean }>("/admin/users/reactivate-by-email", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const fetchAdminSystemOverview = () =>
  apiFetch<AdminSystemOverview>("/admin/system-overview");
