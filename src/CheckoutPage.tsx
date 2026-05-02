import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, ArrowLeft, MailCheck, LockKeyhole, Calendar, Hash, Lock, AlertCircle } from 'lucide-react';
import Logo from './Logo';
import { activateSubscription, logEmailSent } from './lib/auth';

interface CheckoutPageProps {
  planName: string;
  planPrice: string;
  clinicId: string;
  userEmail: string;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ planName, planPrice, clinicId, userEmail, onPaymentSuccess, onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [focusState, setFocusState] = useState({ card: false, name: false, val: false, cvv: false });

  const colors = {
    bgRight: '#130f40',
    bgLeft: '#0a0822',
    cyan: '#7ed6df',
    cyanDark: 'rgba(126, 214, 223, 0.2)',
    textMuted: '#888888',
    inputBg: '#1a164a',
    success: '#33d9b2',
    danger: '#ff5252'
  };

  const setFocus = (field: string, value: boolean) => {
    setFocusState(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      // Simula processamento do Stripe (2.5s)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Ativa a assinatura no banco
      await activateSubscription(clinicId, `pi_simulated_${Date.now()}`);

      // Registra o envio do e-mail no banco
      await logEmailSent({
        clinicId,
        toEmail: userEmail || 'cliente@clinica.com',
        subject: `Bem-vindo ao Solara Medical — Plano ${planName}`,
        template: 'welcome',
        metadata: { plan: planName, price: planPrice }
      });

      setIsSuccess(true);

      // Redireciona para o dashboard após 5 segundos
      setTimeout(() => {
        onPaymentSuccess();
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar pagamento.');
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.bgRight, fontFamily: "'Outfit', sans-serif", overflow: 'hidden' }}>
      
      {/* LEFT PANEL */}
      <div style={{ width: '35%', minWidth: '450px', backgroundColor: colors.bgLeft, padding: '40px 60px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.02)', boxShadow: '10px 0 30px rgba(0,0,0,0.5)', zIndex: 10 }}>
        
        {!isSuccess && (
          <button onClick={onBack} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', marginBottom: 'auto' }}>
            <ArrowLeft size={16} /> Voltar
          </button>
        )}

        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '360px', margin: 'auto' }}>
          {isSuccess ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, background: `${colors.success}20`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: `0 0 30px ${colors.success}40` }}>
                <CheckCircle2 size={40} color={colors.success} strokeWidth={2.5} />
              </div>
              <h2 style={{ fontSize: '2rem', color: colors.success, marginBottom: 16 }}>Pagamento Aprovado!</h2>
              <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: 8 }}>Plano <strong>{planName}</strong> ativado com sucesso.</p>
              <p style={{ color: colors.textMuted, fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24 }}>
                Um e-mail de confirmação foi enviado para <strong style={{ color: colors.cyan }}>{userEmail}</strong>
              </p>
              <p style={{ color: colors.textMuted, fontSize: '0.85rem' }}>
                Redirecionando para o dashboard...
              </p>
            </motion.div>
          ) : (
            <>
              <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center', transform: 'scale(1.15)' }}>
                <Logo size={48} textColor={colors.cyan} text="Checkout" />
              </div>
              
              {/* Resumo do plano */}
              <div style={{ width: '100%', background: colors.inputBg, border: `1px solid ${colors.cyanDark}`, borderRadius: 16, padding: '20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: colors.textMuted, marginBottom: 4 }}>Plano Selecionado</div>
                  <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>{planName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: colors.textMuted, marginBottom: 4 }}>Valor mensal</div>
                  <div style={{ fontSize: '1.4rem', color: colors.cyan, fontWeight: 800 }}>R$ {planPrice}</div>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', background: `${colors.danger}20`, border: `1px solid ${colors.danger}50`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: colors.danger }}>
                  <AlertCircle size={18} /> {error}
                </motion.div>
              )}

              <form style={{ width: '100%' }} onSubmit={handlePayment}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: colors.cyan, marginBottom: 8, fontWeight: 600 }}>Número do Cartão</label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={18} color={focusState.card ? colors.cyan : colors.textMuted} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', transition: 'color 0.3s' }} />
                    <input type="text" placeholder="0000 0000 0000 0000" maxLength={19} onFocus={() => setFocus('card', true)} onBlur={() => setFocus('card', false)} style={{ width: '100%', backgroundColor: colors.inputBg, border: `1px solid ${focusState.card ? colors.cyan : colors.cyanDark}`, borderRadius: 12, padding: '14px 14px 14px 44px', color: '#ffffff', fontSize: '1rem', outline: 'none', transition: 'all 0.3s', letterSpacing: '1px' }} />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: colors.cyan, marginBottom: 8, fontWeight: 600 }}>Nome no Cartão</label>
                  <input type="text" placeholder="NOME IGUAL AO CARTÃO" onFocus={() => setFocus('name', true)} onBlur={() => setFocus('name', false)} style={{ width: '100%', backgroundColor: colors.inputBg, border: `1px solid ${focusState.name ? colors.cyan : colors.cyanDark}`, borderRadius: 12, padding: '14px 16px', color: '#ffffff', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s', textTransform: 'uppercase' }} />
                </div>

                <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: colors.cyan, marginBottom: 8, fontWeight: 600 }}>Validade</label>
                    <div style={{ position: 'relative' }}>
                      <Calendar size={18} color={focusState.val ? colors.cyan : colors.textMuted} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', transition: 'color 0.3s' }} />
                      <input type="text" placeholder="MM/AA" maxLength={5} onFocus={() => setFocus('val', true)} onBlur={() => setFocus('val', false)} style={{ width: '100%', backgroundColor: colors.inputBg, border: `1px solid ${focusState.val ? colors.cyan : colors.cyanDark}`, borderRadius: 12, padding: '14px 14px 14px 44px', color: '#ffffff', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s' }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: colors.cyan, marginBottom: 8, fontWeight: 600 }}>CVV</label>
                    <div style={{ position: 'relative' }}>
                      <Hash size={18} color={focusState.cvv ? colors.cyan : colors.textMuted} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', transition: 'color 0.3s' }} />
                      <input type="password" placeholder="123" maxLength={4} onFocus={() => setFocus('cvv', true)} onBlur={() => setFocus('cvv', false)} style={{ width: '100%', backgroundColor: colors.inputBg, border: `1px solid ${focusState.cvv ? colors.cyan : colors.cyanDark}`, borderRadius: 12, padding: '14px 14px 14px 44px', color: '#ffffff', fontSize: '0.95rem', outline: 'none', transition: 'all 0.3s' }} />
                    </div>
                  </div>
                </div>

                <motion.button disabled={isProcessing} whileHover={!isProcessing ? { scale: 1.02, boxShadow: `0 10px 25px ${colors.cyan}50` } : {}} whileTap={!isProcessing ? { scale: 0.98 } : {}} type="submit" style={{ width: '100%', background: isProcessing ? colors.inputBg : `linear-gradient(to right, ${colors.cyan}, #00a8ff)`, border: isProcessing ? `1px solid ${colors.cyan}` : 'none', padding: '16px', borderRadius: 12, color: isProcessing ? colors.cyan : '#ffffff', fontWeight: 700, fontSize: '1.05rem', cursor: isProcessing ? 'wait' : 'pointer', marginBottom: 12, boxShadow: isProcessing ? 'none' : `0 8px 20px ${colors.cyan}40`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                  {isProcessing ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <LockKeyhole size={20} />
                    </motion.div>
                  ) : (
                    <><LockKeyhole size={20} /> Finalizar Pagamento</>
                  )}
                </motion.button>

                <button type="button" onClick={onPaymentSuccess} style={{ width: '100%', background: 'transparent', border: `1px solid ${colors.textMuted}`, padding: '12px', borderRadius: 12, color: colors.textMuted, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginBottom: 24, transition: 'all 0.2s' }}>
                  Pular Pagamento (Passe Livre 🔑)
                </button>

                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: colors.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Lock size={14} /> Transação 100% criptografada
                </div>
              </form>
            </>
          )}
        </motion.div>
        
        <div style={{ marginTop: 'auto' }}></div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width: '65%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '800px', height: '800px', background: isSuccess ? `radial-gradient(circle, ${colors.success}20 0%, rgba(0,0,0,0) 60%)` : `radial-gradient(circle, ${colors.cyan}15 0%, rgba(0,0,0,0) 60%)`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, transition: 'background 1s ease' }}></div>
        
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {isSuccess ? (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.success}40`, borderRadius: 24, padding: 32, width: '100%', maxWidth: 500, backdropFilter: 'blur(20px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 20, marginBottom: 20 }}>
                <div style={{ background: colors.success, padding: 12, borderRadius: '50%' }}>
                  <MailCheck size={24} color={colors.bgRight} />
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>Recibo & Acesso Liberado</div>
                  <div style={{ color: colors.success, fontSize: '0.9rem' }}>De: axoshub.solara@gmail.com</div>
                </div>
              </div>
              <div style={{ color: '#ccc', lineHeight: 1.6, fontSize: '1rem' }}>
                <p>Olá! O pagamento da sua clínica foi processado com sucesso.</p>
                <p>Sua infraestrutura <strong>Solara Connect</strong> já foi provisionada.</p>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: 16, borderRadius: 12, marginTop: 16, border: '1px dashed rgba(255,255,255,0.2)' }}>
                  <strong>Plano:</strong> {planName}<br/>
                  <strong>Valor:</strong> R$ {planPrice}/mês<br/>
                  <strong>Usuário:</strong> {userEmail}<br/>
                  <strong>Status:</strong> <span style={{ color: colors.success }}>✓ Ativo</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              <div style={{ width: 180, height: 180, background: 'rgba(126, 214, 223, 0.08)', borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40, boxShadow: `0 0 60px ${colors.cyan}20, inset 0 0 30px ${colors.cyan}10`, border: `1px solid ${colors.cyan}30`, backdropFilter: 'blur(10px)' }}>
                <CreditCard size={90} color={colors.cyan} strokeWidth={1.5} style={{ filter: `drop-shadow(0 0 15px ${colors.cyan})` }} />
              </div>
              <h2 style={{ fontSize: '3rem', color: colors.cyan, marginBottom: 20, fontWeight: 800, letterSpacing: '-0.02em', textShadow: `0 0 30px ${colors.cyan}40` }}>Transação Segura</h2>
              <p style={{ textAlign: 'center', color: '#a0a0a0', maxWidth: 450, fontSize: '1.2rem', lineHeight: 1.6, fontWeight: 400 }}>Processamos seu pagamento com os mais rígidos protocolos bancários globais.</p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;
