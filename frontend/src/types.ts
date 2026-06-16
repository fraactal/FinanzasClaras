export type User = {
  id: number;
  nombre: string;
  email: string;
  is_admin: boolean;
  moneda_preferida: string;
  pais: string;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: number;
  user_id: number;
  nombre: string;
  emoji: string;
  color?: string | null;
  order_position: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
};

export type Expense = {
  id: number;
  user_id: number;
  category_id: number;
  descripcion: string;
  monto: number;
  fecha_gasto: string;
  tipo: string;
  metodo_pago?: string | null;
  nota?: string | null;
  created_at: string;
  updated_at: string;
};

export type Budget = {
  id: number;
  user_id: number;
  periodo: "diario" | "semanal" | "mensual";
  category_id?: number | null;
  monto: number;
  fecha_inicio: string;
  fecha_fin?: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type FinancialProfile = {
  id: number;
  user_id: number;
  ingreso_mensual_estimado?: number | null;
  meta_ahorro_mensual?: number | null;
  dia_pago_estimado?: number | null;
  moneda: string;
  pais: string;
  objetivo_financiero_principal?: string | null;
  created_at: string;
  updated_at: string;
};

export type Tip = {
  id: number;
  titulo: string;
  contenido: string;
  activo: boolean;
};

export type BudgetStatus = {
  presupuesto?: number | null;
  restante?: number | null;
  porcentaje_usado?: number | null;
  estado: "ok" | "warning" | "danger" | "sin_tope";
};

export type CategoryTotal = {
  category_id: number;
  nombre: string;
  emoji: string;
  total: number;
};

export type DailyReport = {
  fecha: string;
  total: number;
  presupuesto: BudgetStatus;
  categorias: CategoryTotal[];
  movimientos: Array<{
    id: number;
    descripcion: string;
    monto: number;
    fecha_gasto: string;
    tipo: string;
    metodo_pago?: string | null;
    categoria: string;
    emoji: string;
  }>;
  mensaje: string;
};

export type WeeklyReport = {
  desde: string;
  hasta: string;
  total: number;
  promedio_diario: number;
  mayor_gasto_dia: number;
  dias_con_gasto: number;
  dias: Array<{ fecha: string; total: number }>;
  categorias: CategoryTotal[];
  presupuesto: BudgetStatus;
};

export type MonthlyReport = {
  year: number;
  month: number;
  total: number;
  promedio_diario: number;
  proyeccion?: number | null;
  dias_con_gasto: number;
  dias_del_mes: number;
  semanas: Array<{ etiqueta: string; total: number }>;
  categorias: CategoryTotal[];
  presupuesto: BudgetStatus;
};

export type AdminUser = {
  id: number;
  nombre: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminSystemOverview = {
  google_oauth_configured: boolean;
  password_reset_email_delivery: boolean;
  expose_reset_token_in_dev: boolean;
  frontend_url: string;
  notes: string[];
};
