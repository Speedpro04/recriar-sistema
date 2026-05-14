import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, ArrowRight, Stethoscope, Building, CheckCircle2, MessageSquare, Calendar, ChevronUp } from 'lucide-react';
import Logo from './Logo';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: (planName: string, planPrice: string, planSlug: string, priceId: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin, onNavigateToRegister }) => {
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/5512978138934?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20o%20Solara%20Connect!', '_blank');
  };
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
  // Componente de link do menu com hover elegante
  const NavLink: React.FC<{ label: string; target: string; color: string; hoverColor: string }> = ({ label, target, color, hoverColor }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <motion.a
        href={`#${target}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ y: -2 }}
        style={{
          color: hovered ? hoverColor : color,
          textDecoration: 'none',
          fontWeight: '600',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px 4px',
          fontSize: '1rem',
          letterSpacing: '-0.01em'
        }}
      >
        {label}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: hovered ? '100%' : 0, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 3,
            background: hoverColor,
            borderRadius: 4,
            boxShadow: `0 2px 10px ${hoverColor}40`
          }}
        />
      </motion.a>
    );
  };

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.primary, minHeight: '100vh', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>
      
      {/* Navigation */}
      <nav style={{ 
        position: 'fixed', 
        width: '100%', 
        top: 0, 
        zIndex: 100, 
        background: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(12px)', 
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.btnSuccess}`, 
        padding: '16px 0',
        transition: 'all 0.4s ease'
      }}>
        <div style={{ ...containerStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
          <Logo size={38} textColor={colors.primary} />
          
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 32, marginRight: 16 }}>
              {[
                { label: 'Soluções', target: 'solucoes' },
                { label: 'Especialistas', target: 'experiencia' },
                { label: 'Planos', target: 'planos' }
              ].map((item) => (
                <NavLink key={item.label} label={item.label} target={item.target} color={colors.primary} hoverColor={colors.btnSuccess} />
              ))}
            </div>
            
            <motion.button 
              onClick={onNavigateToLogin}
              whileHover={{ scale: 1.02, boxShadow: `0 10px 30px ${colors.primary}20` }}
              whileTap={{ scale: 0.98 }}
              style={{ 
                backgroundColor: colors.primary, 
                color: '#fff', 
                border: 'none', 
                padding: '12px 24px', 
                borderRadius: '14px', 
                fontWeight: '700', 
                cursor: 'pointer', 
                fontSize: '0.95rem',
                letterSpacing: '0.02em',
                transition: 'all 0.3s ease'
              }}
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
              Software para Gestão de Clínicas e Consultórios
            </motion.div>
            
            <motion.h1 variants={fadeInUp} style={{ fontSize: '46px', fontWeight: '800', lineHeight: '1.1', marginBottom: 32, letterSpacing: '-0.04em', color: colors.primary }}>
              Solara Connect: <br/>
              <span style={{ position: 'relative', color: colors.primary }}>
                Automação Via WhatsApp.
                <svg style={{ position: 'absolute', bottom: 2, left: 0, width: '100%', height: 12, zIndex: -1 }} viewBox="0 0 300 12" preserveAspectRatio="none">
                  <path d="M0 6 Q 150 12 300 6" fill="none" stroke={colors.btnSuccess} strokeWidth="12" strokeLinecap="round"/>
                </svg>
              </span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} style={{ fontSize: '1.15rem', color: '#555', maxWidth: 700, margin: '0 auto 48px', fontWeight: '400', lineHeight: '1.6' }}>
              A solução em nuvem completa. CRM para clínicas com integração WhatsApp, sistema de agendamento online para pacientes e chatbot para recepção. Como reduzir faltas em consultas médicas? Com a plataforma de automação de lembretes Solara Connect.
            </motion.p>
            
            <motion.div variants={fadeInUp} style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
              <motion.button 
                onClick={handleWhatsAppClick}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{ backgroundColor: colors.btnSuccess, color: colors.primary, border: 'none', padding: '20px 40px', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 20px 40px ${colors.btnSuccess}40` }}
              >
                Agendar Demonstração <ArrowRight size={20} />
              </motion.button>
              <motion.button 
                onClick={() => document.getElementById('solucoes')?.scrollIntoView({ behavior: 'smooth' })}
                whileHover={{ scale: 1.03, backgroundColor: colors.cardBg }}
                whileTap={{ scale: 0.97 }}
                style={{ backgroundColor: 'transparent', color: colors.primary, border: `2px solid ${colors.cardBorder}`, padding: '20px 40px', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer' }}
              >
                Ver Soluções
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div 
      {/* Back to Top Button */}
      {showScrollTop && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.1, backgroundColor: colors.primary, color: '#fff' }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '40px',
            right: '40px',
            width: '56px',
            height: '56px',
            backgroundColor: colors.btnSuccess,
            color: colors.primary,
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            border: 'none',
            transition: 'background-color 0.3s ease, color 0.3s ease'
          }}
        >
          <ChevronUp size={28} strokeWidth={2.5} />
        </motion.div>
      )}
    </div>
  );
};

export default LandingPage;
