import { supabase } from './supabase';

// =============================================
// TIPOS
// =============================================
export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  min_specialists: number;
  max_specialists: number | null;
  features: string[];
  is_highlighted: boolean;
  active: boolean;
  display_order: number;
  stripe_price_id: string | null;
}

export interface RegisterData {
  clinicName: string;
  email: string;
  password: string;
  planSlug: string;
  phone: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SessionUser {
  id: string;
  email: string;
  clinicId: string;
  clinicName: string;
  role: string;
  planName: string;
}

// =============================================
// PLANOS
// =============================================
export async function fetchPlans(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) throw new Error(`Erro ao carregar planos: ${error.message}`);
  return data || [];
}

// =============================================
// CADASTRO (Register)
// =============================================
export async function registerClinic(data: RegisterData): Promise<{ userId: string; clinicId: string; tempPassword: string }> {
  const tempPassword = data.password || generateTempPassword();

  // 1. Criar usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: tempPassword,
    options: {
      data: {
        clinic_name: data.clinicName,
        phone: data.phone,
        role: 'owner'
      }
    }
  });

  if (authError) throw new Error(`Erro ao criar conta: ${authError.message}`);
  if (!authData.user) throw new Error('Falha ao criar usuário');

  const authUserId = authData.user.id;

  // 2. Chamar função SQL segura (SECURITY DEFINER) que bypassa RLS
  const { data: result, error: rpcError } = await supabase.rpc('register_clinic', {
    p_auth_id: authUserId,
    p_clinic_name: data.clinicName,
    p_email: data.email,
    p_plan_slug: data.planSlug,
    p_phone: data.phone
  });

  if (rpcError) throw new Error(`Erro ao criar clínica: ${rpcError.message}`);

  return { userId: authUserId, clinicId: result.clinic_id, tempPassword };
}

// =============================================
// LOGIN
// =============================================
export async function loginUser(data: LoginData): Promise<SessionUser> {
  // ======= MASTER BYPASS (PASSE LIVRE) =======
  if (data.email === 'wineatlas77@gmail.com' && data.password === '6687139') {
    return {
      id: 'master-user-id',
      email: 'wineatlas77@gmail.com',
      clinicId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      clinicName: 'AxosHub',
      role: 'owner',
      planName: 'Enterprise'
    };
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  });

  if (authError) throw new Error(`Credenciais inválidas: ${authError.message}`);
  if (!authData.user) throw new Error('Falha no login');

  // Buscar perfil do usuário
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select(`
      id,
      email,
      name,
      role,
      clinic_id,
      clinics (
        id,
        name,
        plan_id,
        plans (
          name
        )
      )
    `)
    .eq('auth_id', authData.user.id)
    .single();

  if (profileError || !userProfile) {
    throw new Error('Perfil do usuário não encontrado. Contate o suporte.');
  }

  const clinic = userProfile.clinics as any;

  return {
    id: userProfile.id,
    email: userProfile.email,
    clinicId: clinic?.id || '',
    clinicName: clinic?.name || '',
    role: userProfile.role,
    planName: clinic?.plans?.name || ''
  };
}

// =============================================
// ATIVAR ASSINATURA (após pagamento)
// =============================================
export async function activateSubscription(clinicId: string, stripePaymentIntentId?: string): Promise<void> {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      stripe_payment_intent_id: stripePaymentIntentId || null,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString()
    })
    .eq('clinic_id', clinicId)
    .eq('status', 'pending');

  if (error) throw new Error(`Erro ao ativar assinatura: ${error.message}`);

  // Marcar onboarding como concluído
  await supabase
    .from('clinics')
    .update({ onboarding_completed: true })
    .eq('id', clinicId);
}

// =============================================
// REGISTRAR ENVIO DE E-MAIL
// =============================================
export async function logEmailSent(params: {
  clinicId: string;
  toEmail: string;
  subject: string;
  template: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await supabase.from('email_logs').insert({
    clinic_id: params.clinicId,
    to_email: params.toEmail,
    from_email: 'axoshub.solara@gmail.com',
    subject: params.subject,
    template: params.template,
    status: 'sent',
    metadata: params.metadata || {}
  });
}

// =============================================
// LOGOUT
// =============================================
export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut();
}

// =============================================
// SESSÃO ATUAL
// =============================================
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// =============================================
// HELPERS
// =============================================
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
