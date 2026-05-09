import { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import CheckoutPage from './CheckoutPage';
import { logoutUser, getCurrentSession } from './lib/auth';
import { supabase } from './lib/supabase';
import './index.css';

type ViewState = 'landing' | 'login' | 'register' | 'checkout' | 'dashboard' | 'loading';

interface SelectedPlan {
  name: string;
  price: string;
  slug: string;
  priceId: string;
}

function App() {
  const [view, setView] = useState<ViewState>('loading');
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan>({ 
    name: 'Avançado', 
    price: '597', 
    slug: 'avancado',
    priceId: import.meta.env.VITE_STRIPE_PRICE_AVANCADO || ''
  });
  const [clinicId, setClinicId] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Restaurar sessão ao carregar a página
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const checkoutSuccess = queryParams.get('checkout') === 'success';

    const restoreSession = async () => {
      try {
        const session = await getCurrentSession();
        if (session?.user) {
          const { data: userProfile } = await supabase
            .from('users')
            .select('clinic_id')
            .eq('auth_id', session.user.id)
            .single();

          if (userProfile?.clinic_id) {
            setClinicId(userProfile.clinic_id);
            setUserEmail(session.user.email || '');
            
            if (checkoutSuccess) {
              window.history.replaceState({}, document.title, "/");
            }
            
            setView('dashboard');
            return;
          }
        }
      } catch (err) {
        console.warn('Nenhuma sessão ativa:', err);
      }
      
      if (checkoutSuccess) {
        // Se pagou mas não achou a sessão (raro), tenta login ou mostra landing
        window.history.replaceState({}, document.title, "/");
      }
      setView('landing');
    };

    restoreSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setClinicId('');
        setUserEmail('');
        setView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDevPass = () => {
    setClinicId('dev-clinic-123');
    setUserEmail('admin@solara.com');
    setView('dashboard');
  };

  const handleNavigateToRegister = (name: string, price: string, slug: string, priceId: string) => {
    setSelectedPlan({ name, price, slug, priceId });
    setView('register');
  };

  const handleRegisterSuccess = (newClinicId: string, email: string) => {
    setClinicId(newClinicId);
    setUserEmail(email);
    setView('checkout');
  };

  const handleLoginSuccess = (loggedClinicId: string) => {
    setClinicId(loggedClinicId);
    setView('dashboard');
  };

  const handlePaymentSuccess = () => {
    setView('dashboard');
  };

  const handleLogout = async () => {
    await logoutUser();
    setClinicId('');
    setUserEmail('');
    setView('landing');
  };

  // Loading screen enquanto verifica sessão
  if (view === 'loading') {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#0a0822',
        fontFamily: "'Outfit', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            border: '3px solid rgba(126, 214, 223, 0.2)', 
            borderTop: '3px solid #7ed6df', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#7ed6df', fontWeight: 600, fontSize: '1rem' }}>Carregando Solara Connect...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="App">

      {/* ======= LANDING PAGE ======= */}
      {view === 'landing' && (
        <LandingPage 
          onNavigateToLogin={() => setView('login')} 
          onNavigateToRegister={handleNavigateToRegister}
        />
      )}

      {/* ======= LOGIN ======= */}
      {view === 'login' && (
        <LoginPage 
          onBack={() => setView('landing')} 
          onLogin={handleLoginSuccess}
          onNavigateToRegister={() => setView('register')}
          onDevPass={handleDevPass}
        />
      )}

      {/* ======= CADASTRO ======= */}
      {view === 'register' && (
        <RegisterPage 
          onBack={() => setView('landing')} 
          onNavigateToLogin={() => setView('login')}
          onRegisterSuccess={handleRegisterSuccess}
          selectedPlanSlug={selectedPlan.slug}
        />
      )}

      {/* ======= CHECKOUT ======= */}
      {view === 'checkout' && (
        <CheckoutPage 
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          priceId={selectedPlan.priceId}
          clinicId={clinicId}
          userEmail={userEmail}
          onBack={() => setView('register')}
          onPaymentSuccess={handlePaymentSuccess}
          onDevPass={handlePaymentSuccess}
        />
      )}

      {/* ======= DASHBOARD ======= */}
      {view === 'dashboard' && (
        <Dashboard onLogout={handleLogout} clinicId={clinicId} />
      )}
    </div>
  );
}

export default App;
