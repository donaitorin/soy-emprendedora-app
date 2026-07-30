export type AccountWithRole = {
  id: string;
  name: string;
  created_at: string;
  my_role: "owner" | "collaborator";
};

export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "user";
  is_active: boolean;
  created_at: string;
  accounts: AccountWithRole[];
};

export type MetaStatus = {
  connected: boolean;
  fb_page_id: string | null;
  ig_business_id: string | null;
  page_name: string | null;
  ig_username: string | null;
  profile_picture_url: string | null;
  token_expires_at: string | null;
  is_primary: boolean | null;
};

export type MetaPage = {
  fb_page_id: string;
  page_name: string;
  ig_business_id: string | null;
  ig_username: string | null;
};

export type MetaCallbackResponse = {
  account_id: string;
  pages: MetaPage[];
  requires_selection: boolean;
};

export type DashboardInsights = {
  ig_business_id: string | null;
  ig_username: string | null;
  followers_count: number | null;
  impressions: number | null;
  reach: number | null;
};

export type IncomeSource = "mentoria" | "comunidad" | "claridad" | "producto" | "otro";

export type PaymentMethod = "transferencia" | "stripe" | "mercadopago" | "paypal" | "efectivo";

export type ExpenseCategory = "herramientas" | "publicidad" | "educacion" | "servicios" | "otro";

export type Income = {
  id: string;
  account_id: string;
  amount: number;
  occurred_on: string;
  source: IncomeSource;
  payment_method: PaymentMethod;
  created_at: string;
};

export type Expense = {
  id: string;
  account_id: string;
  amount: number;
  occurred_on: string;
  category: ExpenseCategory;
  created_at: string;
};
