import { useState } from 'react';
import Dashboard from './Dashboard';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import CheckoutPage from './CheckoutPage';
import { logoutUser } from './lib/auth';
import './index.css';

type ViewState = 'landing' | 'login' | 'register' | 'checkout' | 'dashboard';

interface SelectedPlan {
  name: string;
  price: string;
  slug: string;
  priceId: string;
}

function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan>({ 
    name: 'Avançado', 
    price: '597', 
    slug: 'avancado',
    priceId: import.meta.env.VITE_STRIPE_PRICE_AVANCADO || ''
  });
  const [clinicId, setClinicId] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Mapa de slug para preço (usado quando vem da LP)
  const planSlugMap: Record<string, string> = {
    'basico': 'basico',
    'crescimento': 'crescimento',
    'avancado': 'avancado',
    'enterprise': 'enterprise'
  };

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
        <Dashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
