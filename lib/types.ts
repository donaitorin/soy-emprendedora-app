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

export type MovementType = "income" | "expense";

export type Movement = {
  id: string;
  account_id: string;
  type: MovementType;
  amount: number;
  occurred_on: string;
  created_at: string;
  source: IncomeSource | null;
  payment_method: PaymentMethod | null;
  category: ExpenseCategory | null;
};

export type MovementsPage = {
  items: Movement[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type LeadChannel = "instagram" | "whatsapp" | "referido" | "web" | "otro";

export type LeadStage = "nuevo" | "conversacion" | "propuesta" | "agendada" | "convertida";

export type LeadArchiveReason = "converted" | "not_converted";

export type Lead = {
  id: string;
  account_id: string;
  name: string;
  channel: LeadChannel;
  stage: LeadStage;
  stage_changed_at: string;
  converted_at: string | null;
  archived: boolean;
  archive_reason: LeadArchiveReason | null;
  archived_at: string | null;
  created_at: string;
};

export type LeadsPage = {
  items: Lead[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type LeadStats = {
  active_count: number;
  conversion_rate: number | null;
  avg_conversion_days: number | null;
};

export type PostingStatus = {
  last_post_at: string | null;
  days_since_last_post: number | null;
};

export type UnansweredConversation = {
  contact_name: string;
  hours_since_last_message: number;
};
