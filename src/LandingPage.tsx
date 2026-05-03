import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, ArrowRight, Stethoscope, Building, CheckCircle2, Activity } from 'lucide-react';
import Logo from './Logo';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: (planName: string, planPrice: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, onNavigateToRegister }) => {
  const colors = {
    primary: '#130f40',
    bg: '#ffffff',
    cardBorder: '#7ed6df',
    cardBg: '#f7f1e3',
    btnSuccess: '#33d9b2',
    btnDanger: '#ff5252',
    btnWarn: '#ffda79',
    extra: '#ff793f'
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  };

  const staggerContainer = {
    animate: {
      transition: { staggerChildren: 0.15 }
    }
  };

  const containerStyle = {
    maxWidth: '1140px',
    margin: '0 auto',
    width: '100%',
    position: 'relative' as const,
    zIndex: 1
  };

  // Componente de link do menu com hover elegante
  const NavLink: React.FC<{ label: string; color: string; hoverColor: string }> = ({ label, color, hoverColor }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <motion.a
        href="#"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ scale: 1.05 }}
        style={{
          color: hovered ? hoverColor : color,
          textDecoration: 'none',
          fontWeight: hovered ? '700' : '500',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          position: 'relative',
          paddingBottom: 4
        }}
      >
        {label}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: hovered ? '100%' : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 2,
            background: hoverColor,
            borderRadius: 2
          }}
        />
      </motion.a>
    );
  };

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.primary, minHeight: '100vh', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>
      
      {/* Navigation */}
      <nav style={{ position: 'fixed', width: '100%', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: `2px solid ${colors.btnSuccess}`, padding: '20px 0' }}>
        <div style={{ ...containerStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
          <Logo size={40} textColor={colors.primary} />
          <div style={{ display: 'flex', gap: 40, alignItems: 'center', fontWeight: '500', fontSize: '1.05rem' }}>
            {['Soluções', 'Especialistas', 'Planos'].map((label) => (
              <NavLink key={label} label={label} color={colors.primary} hoverColor={colors.btnSuccess} />
            ))}
            <motion.button 
              onClick={onNavigateToLogin}
              whileHover={{ scale: 1.05, boxShadow: `0 8px 25px ${colors.primary}30` }}
              whileTap={{ scale: 0.98 }}
              style={{ backgroundColor: colors.primary, color: colors.bg, border: 'none', padding: '12px 28px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}
            >
              Acesso Restrito
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ paddingTop: '180px', paddingBottom: '120px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '10%', width: 600, height: 600, background: colors.cardBorder, filter: 'blur(200px)', opacity: 0.15, zIndex: 0, borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '20%', left: '5%', width: 500, height: 500, background: colors.btnSuccess, filter: 'blur(150px)', opacity: 0.1, zIndex: 0, borderRadius: '50%' }} />

        <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 20px' }}>
          <motion.div initial="initial" animate="animate" variants={staggerContainer} style={{ maxWidth: '900px' }}>
            <motion.div variants={fadeInUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 20px', background: colors.cardBg, border: `1px solid ${colors.cardBorder}80`, borderRadius: '30px', color: colors.primary, fontSize: '0.9rem', fontWeight: '600', marginBottom: 40, textTransform: 'uppercase' }}>
              <span style={{ width: 8, height: 8, background: colors.btnSuccess, borderRadius: '50%', display: 'inline-block', boxShadow: `0 0 10px ${colors.btnSuccess}` }} />
              O Novo Padrão em Gestão de Clínicas
            </motion.div>
            
            <motion.h1 variants={fadeInUp} style={{ fontSize: '5.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: 32, letterSpacing: '-0.04em', color: colors.primary }}>
              Solara Connect: <br/>
              <span style={{ position: 'relative', color: colors.primary }}>
                Excelência Clínica.
                <svg style={{ position: 'absolute', bottom: 10, left: 0, width: '100%', height: 12, zIndex: -1 }} viewBox="0 0 300 12" preserveAspectRatio="none">
                  <path d="M0 6 Q 150 12 300 6" fill="none" stroke={colors.btnSuccess} strokeWidth="12" strokeLinecap="round"/>
                </svg>
              </span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} style={{ fontSize: '1.3rem', color: '#555', maxWidth: 700, margin: '0 auto 48px', fontWeight: '400', lineHeight: '1.6' }}>
              A solução completa para Clínicas Odontológicas, Estética, Medicina e Bem-estar. Automatize sua recepção e recupere pacientes em um só lugar.
            </motion.p>
            
            <motion.div variants={fadeInUp} style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
              <motion.button 
                onClick={onNavigateToLogin}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{ backgroundColor: colors.btnSuccess, color: colors.primary, border: 'none', padding: '20px 40px', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 20px 40px ${colors.btnSuccess}40` }}
              >
                Agendar Demonstração <ArrowRight size={20} />
              </motion.button>
              <motion.button 
                onClick={onNavigateToLogin}
                whileHover={{ scale: 1.03, backgroundColor: colors.cardBg }}
                whileTap={{ scale: 0.97 }}
                style={{ backgroundColor: 'transparent', color: colors.primary, border: `2px solid ${colors.cardBorder}`, padding: '20px 40px', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer' }}
              >
                Ver Soluções
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginTop: '80px', width: '100%', position: 'relative' }}
          >
            <div style={{ borderRadius: '32px', overflow: 'hidden', border: `1px solid ${colors.cardBorder}50`, boxShadow: `0 40px 80px ${colors.primary}15`, background: colors.bg, padding: '16px' }}>
               <img src="/hero.png" alt="Interface Solara Connect" style={{ width: '100%', borderRadius: '20px', display: 'block', border: `1px solid ${colors.cardBorder}30` }} onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2000&q=80'; }} />
            </div>
            
            <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }} style={{ position: 'absolute', top: -30, right: -30, background: colors.bg, border: `1px solid ${colors.cardBorder}`, padding: '20px 32px', borderRadius: '24px', boxShadow: `0 20px 40px ${colors.primary}10`, display: 'flex', alignItems: 'center', gap: 16 }}>
               <div style={{ width: 48, height: 48, borderRadius: '12px', background: `${colors.btnSuccess}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <ShieldCheck size={28} color={colors.btnSuccess} />
               </div>
               <div style={{ textAlign: 'left' }}>
                 <div style={{ fontWeight: '800', color: colors.primary, fontSize: '1.2rem' }}>HIPAA & LGPD</div>
                 <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Conformidade Total</div>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Trust Section */}
      <section style={{ borderTop: `1px solid ${colors.cardBorder}30`, borderBottom: `1px solid ${colors.cardBorder}30`, background: colors.cardBg }}>
        <div style={{ ...containerStyle, padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '0.9rem', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 40 }}>Aprovado por Clínicas e Hospitais de Referência</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6, filter: 'grayscale(100%)' }}>
            {['ODONTOLOGIA', 'ESTÉTICA', 'DERMATOLOGIA', 'FISIOTERAPIA', 'PEDIATRIA'].map((brand, i) => (
              <h3 key={i} style={{ fontSize: '1.5rem', fontWeight: '800', color: colors.primary }}>{brand}</h3>
            ))}
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section style={{ padding: '120px 0' }}>
        <div style={{ ...containerStyle, padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 80, maxWidth: 800, margin: '0 auto 80px' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: 24, color: colors.primary, letterSpacing: '-0.02em' }}>Projetado para sua Clínica</h2>
            <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: '1.6' }}>O Solara Connect elimina a burocracia, permitindo que seus especialistas foquem no que importa: o resultado do cliente.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { icon: <Clock />, title: "Fila Zero", desc: "Triagem e admissão automatizadas. O paciente aguarda menos de 5 minutos na recepção." },
              { icon: <Building />, title: "Gestão de Salas", desc: "Painel Kanban em tempo real para otimização de consultórios e controle de fluxo." },
              { icon: <Stethoscope />, title: "Prontuário Unificado", desc: "Integração total do histórico do paciente antes mesmo de ele entrar na sala." }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, boxShadow: `0 20px 40px ${colors.cardBorder}40` }}
                style={{ background: colors.bg, border: `1px solid ${colors.cardBorder}50`, padding: '40px 32px', borderRadius: '32px', transition: 'all 0.3s ease' }}
              >
                <div style={{ width: 64, height: 64, background: colors.cardBg, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, border: `1px solid ${colors.cardBorder}` }}>
                  {React.cloneElement(feat.icon as React.ReactElement, { size: 32, color: colors.primary })}
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: 16, color: colors.primary }}>{feat.title}</h3>
                <p style={{ color: '#666', fontSize: '1rem', lineHeight: '1.6' }}>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LGPD Compliance Section */}
      <section style={{ padding: '100px 0', background: 'linear-gradient(135deg, #130f40 0%, #2c3e50 100%)', color: '#fff', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: colors.btnSuccess, filter: 'blur(200px)', opacity: 0.1, borderRadius: '50%' }} />
        <div style={{ ...containerStyle, padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: 'rgba(51, 217, 178, 0.1)', border: '1px solid rgba(51, 217, 178, 0.3)', borderRadius: '20px', color: colors.btnSuccess, fontSize: '0.85rem', fontWeight: '700', marginBottom: 32, textTransform: 'uppercase' }}>
              <ShieldCheck size={18} /> Segurança de Dados Enterprise
            </div>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: 24, lineHeight: '1.1', letterSpacing: '-0.02em' }}>Sua Clínica 100% aderente à LGPD.</h2>
            <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: 40 }}>
              A Solara Connect foi construída sob os pilares da Lei Geral de Proteção de Dados (Lei 13.709/18). 
              Garantimos que cada dado de saúde, prontuário e informação pessoal seja tratado com o mais alto nível de criptografia e governança.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                "Criptografia de ponta a ponta em todos os prontuários médicos.",
                "Gestão rigorosa de consentimento e termos de uso.",
                "Hospedagem em servidores com certificação ISO 27001 e HIPAA.",
                "Logs de auditoria completos para cada acesso a dado sensível."
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '1.05rem', fontWeight: '500' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: colors.btnSuccess, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={16} color={colors.primary} />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{ position: 'relative' }}
          >
            <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '48px', borderRadius: '40px', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
                <Building size={32} color={colors.btnSuccess} /> Certificações de Segurança
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {['LGPD Brasil', 'HIPAA Ready', 'ISO 27001', 'SOC2 Type II'].map((cert, i) => (
                  <div key={i} style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontWeight: '700' }}>
                    {cert}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: -30, right: -30, width: 200, height: 200, background: colors.btnSuccess, filter: 'blur(100px)', opacity: 0.2, borderRadius: '50%' }} />
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '120px 0', background: colors.cardBg, borderTop: `1px solid ${colors.cardBorder}30`, borderBottom: `1px solid ${colors.cardBorder}30`, marginBottom: '120px' }}>
        <div style={{ ...containerStyle, padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 80, maxWidth: 800, margin: '0 auto 80px' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: 24, color: colors.primary, letterSpacing: '-0.02em' }}>Planos Sob Medida</h2>
            <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: '1.6' }}>Escolha o plano ideal com base no tamanho do seu corpo clínico. Todos os planos incluem acesso completo ao sistema.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { title: "Básico", esp: "Até 2 especialistas", price: "197", color: colors.btnSuccess },
              { title: "Crescimento", esp: "3 a 5 especialistas", price: "397", color: colors.cardBorder },
              { title: "Avançado", esp: "6 a 9 especialistas", price: "597", color: colors.btnWarn },
              { title: "Enterprise", esp: "Acima de 10", price: "897", color: colors.primary }
            ].map((plan, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, boxShadow: `0 30px 50px ${colors.cardBorder}40` }}
                style={{ 
                  background: colors.bg, 
                  border: `1px solid ${colors.cardBorder}50`, 
                  padding: '48px 32px', 
                  borderRadius: '32px', 
                  transition: 'all 0.3s ease', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Destaque para o plano Avançado */}
                {i === 2 && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', background: colors.btnWarn, color: colors.primary, fontSize: '0.8rem', fontWeight: '800', padding: '6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Mais Escolhido
                  </div>
                )}
                
                <div style={{ background: plan.color === colors.primary ? colors.primary : `${plan.color}20`, color: plan.color === colors.primary ? colors.bg : colors.primary, padding: '8px 20px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '800', marginBottom: 24, marginTop: i === 2 ? 16 : 0 }}>
                  {plan.title}
                </div>
                
                <h3 style={{ fontSize: '1.1rem', color: '#666', marginBottom: 16, fontWeight: '600' }}>{plan.esp}</h3>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 32, color: colors.primary }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>R$</span>
                  <span style={{ fontSize: '3.5rem', fontWeight: '800', letterSpacing: '-0.05em' }}>{plan.price}</span>
                  <span style={{ fontSize: '1rem', color: '#888', fontWeight: '500' }}>/mês</span>
                </div>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.95rem', color: '#555', fontWeight: '500' }}><CheckCircle2 size={20} color={colors.btnSuccess} /> Gestão de Salas</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.95rem', color: '#555', fontWeight: '500' }}><CheckCircle2 size={20} color={colors.btnSuccess} /> Prontuário Integrado</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.95rem', color: '#555', fontWeight: '500' }}><CheckCircle2 size={20} color={colors.btnSuccess} /> Suporte Prioritário</li>
                </ul>
                
                <button 
                  onClick={() => onNavigateToRegister(plan.title, plan.price)}
                  style={{ 
                    width: '100%', 
                    background: plan.color === colors.primary ? colors.primary : 'transparent', 
                    color: plan.color === colors.primary ? colors.bg : colors.primary, 
                    border: `2px solid ${plan.color === colors.primary ? colors.primary : colors.cardBorder}`, 
                    padding: '16px', 
                    borderRadius: '16px', 
                    fontSize: '1.05rem', 
                    fontWeight: '700', 
                    cursor: 'pointer', 
                    marginTop: 'auto',
                    transition: 'all 0.2s'
                  }}
                >
                  Assinar Agora
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '0 0 120px' }}>
        <div style={{ ...containerStyle, padding: '0 20px' }}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            style={{ background: colors.primary, padding: '80px 60px', borderRadius: '48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: colors.btnSuccess, filter: 'blur(200px)', opacity: 0.2, borderRadius: '50%' }} />
            
            <h2 style={{ fontSize: '3.5rem', fontWeight: '800', color: colors.bg, marginBottom: 24, letterSpacing: '-0.02em' }}>Eleve sua Clínica.</h2>
            <p style={{ fontSize: '1.2rem', color: `${colors.bg}80`, maxWidth: 600, margin: '0 auto 48px', lineHeight: '1.6' }}>
              Agende uma demonstração exclusiva com nossos especialistas e descubra como o Solara Connect pode transformar sua operação.
            </p>
            <motion.button 
              onClick={onNavigateToLogin}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{ backgroundColor: colors.btnSuccess, color: colors.primary, border: 'none', padding: '20px 48px', borderRadius: '20px', fontSize: '1.2rem', fontWeight: '800', cursor: 'pointer', boxShadow: `0 20px 40px ${colors.btnSuccess}30` }}
            >
              Falar com um Consultor
            </motion.button>
          </motion.div>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${colors.cardBorder}40`, background: colors.cardBg, color: '#666', fontWeight: '500', padding: '60px 0' }}>
        <div style={{ ...containerStyle, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 40, alignItems: 'center' }}>
          
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Logo size={24} showText={false} />
                <span style={{ fontWeight: '700', color: colors.primary }}>Solara Connect © 2026</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#888' }}>
                Contato: <a href="mailto:axoshub.solara@gmail.com" style={{ color: colors.accent, textDecoration: 'none' }}>axoshub.solara@gmail.com</a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 32 }}>
              <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>Termos de Uso</a>
              <a href="#" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>Política de Privacidade (LGPD)</a>
            </div>
          </div>

          <div style={{ textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '30px', width: '100%' }}>
            <div style={{ fontSize: '1rem', color: '#888', fontWeight: '400' }}>
              Desenvolvido pela <span style={{ color: colors.primary, fontWeight: '800', letterSpacing: '0.02em' }}>AxosHub</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
