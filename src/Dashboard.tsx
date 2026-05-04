import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Calendar, Clock, Activity, 
  Settings, LogOut, Search,
  Plus, TrendingUp,
  BarChart3, X, Check,
  Stethoscope, UserPlus, AlertCircle, Printer,
  MessageSquare, FileText, Zap, UserCog, Send,
  CheckCircle2, Target, Trash2
} from 'lucide-react';
import Logo from './Logo';
import { supabase } from './lib/supabase';

interface DashboardProps {
  onLogout: () => void;
  clinicId?: string;
}

const Dashboard = ({ onLogout, clinicId }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('reception');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showSpecialistModal, setShowSpecialistModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSolara, setShowSolara] = useState(false);
  const [solaraMessages, setSolaraMessages] = useState<any[]>([
    { role: 'assistant', content: 'Olá! Sou a Solara, sua assistente de IA. Como posso ajudar sua clínica hoje?' }
  ]);
  const [solaraInput, setSolaraInput] = useState('');
  const [clinicLimit, setClinicLimit] = useState(2); // Default to 2 if not loaded
  
  // Estados de Dados Reais
  const [specialistsList, setSpecialistsList] = useState<any[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<any[]>([]);
  const [newPatient, setNewPatient] = useState({
    name: '', phone: '', age: '', insurance: 'Particular', lgpd_consent: false
  });
  const [newAppointment, setNewAppointment] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    doctor_id: ''
  });
  const [newSpecialist, setNewSpecialist] = useState({
    name: '', email: '', specialty: '', crm: '', phone: ''
  });
  const [automations, setAutomations] = useState([
    { id: 1, title: 'Lembrete Pré-Consulta', desc: 'Envia WhatsApp 2h antes para confirmar.', active: true },
    { id: 2, title: 'Pesquisa NPS', desc: 'Envia formulário de satisfação após finalização.', active: true },
    { id: 3, title: 'Feliz Aniversário', desc: 'Mensagem automática no dia do aniversário do paciente.', active: true },
    { id: 4, title: 'Feliz Natal', desc: 'Mensagem de boas festas no final do ano.', active: true },
    { id: 5, title: 'Follow-up de Bem-Estar', desc: 'Mensagem carinhosa 24h após o atendimento.', active: false },
  ]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Buscar médicos da tabela 'users' com role='doctor' ou 'owner'
      const { data: doctors } = await supabase
        .from('users')
        .select('id, name, email, specialty, crm, active')
        .in('role', ['doctor', 'owner']);

      // Buscar limite do plano da clínica
      if (clinicId) {
        const { data: clinicData } = await supabase
          .from('clinics')
          .select('plans(max_specialists)')
          .eq('id', clinicId)
          .single();
        
        // Supabase returns nested relations as objects or arrays. We handle it safely.
        const plansData: any = clinicData?.plans;
        const planLimit = plansData?.max_specialists || plansData?.[0]?.max_specialists;
        if (planLimit) setClinicLimit(planLimit);
      }

      // Buscar agendamentos com dados do paciente e médico
      const { data: appointments, error: appError } = await supabase
        .from('appointments')
        .select('*, patients(name, phone, email), users!appointments_doctor_id_fkey(name, specialty)')
        .order('start_time', { ascending: true });
      
      if (appError) console.error('Supabase Query Error:', appError);
      if (doctors) setSpecialistsList(doctors);
      if (appointments) setAppointmentsList(appointments);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchData();
    const channel = supabase.channel('db-changes').on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData()).subscribe();
    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.lgpd_consent) {
      alert('Nome e Consentimento LGPD são obrigatórios!');
      return;
    }
    setIsLoading(true);
    try {
      // Inserir paciente com clinic_id obrigatório
      const { data: patient, error: pError } = await supabase.from('patients').insert([{ 
        name: newPatient.name, 
        phone: newPatient.phone,
        clinic_id: clinicId || undefined,
        notes: newPatient.insurance !== 'Particular' ? `Convênio: ${newPatient.insurance}` : null
      }]).select().single();
      if (pError) throw pError;

      // Montar start_time e end_time a partir de date + time
      const startTime = new Date(`${newAppointment.date}T${newAppointment.time}:00`);
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // +30 minutos

      const { error: aError } = await supabase.from('appointments').insert([{
        patient_id: patient.id, 
        doctor_id: newAppointment.doctor_id || null,
        clinic_id: clinicId || undefined,
        start_time: startTime.toISOString(), 
        end_time: endTime.toISOString(), 
        status: 'pending',
        type: 'Consulta'
      }]);
      if (aError) throw aError;
      setShowModal(false);
      setNewPatient({ name: '', phone: '', age: '', insurance: 'Particular', lgpd_consent: false });
      setNewAppointment({ date: new Date().toISOString().split('T')[0], time: '09:00', doctor_id: '' });
    } catch (error: any) {
      alert('Erro: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // === SALVAR NOVO ESPECIALISTA ===
  const handleSaveSpecialist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecialist.name.trim() || !newSpecialist.specialty.trim()) {
      alert('Nome e Especialidade são obrigatórios!');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.from('users').insert([{
        name: newSpecialist.name,
        email: newSpecialist.email || `${newSpecialist.name.toLowerCase().replace(/\s+/g, '.')}@clinica.com`,
        specialty: newSpecialist.specialty,
        crm: newSpecialist.crm || null,
        phone: newSpecialist.phone || null,
        role: 'doctor',
        clinic_id: clinicId || undefined,
        active: true
      }]);
      if (error) throw error;
      setShowSpecialistModal(false);
      setNewSpecialist({ name: '', email: '', specialty: '', crm: '', phone: '' });
      fetchData(); // Recarregar lista
    } catch (error: any) {
      alert('Erro ao salvar especialista: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // === ATUALIZAR STATUS DO AGENDAMENTO ===
  const handleUpdateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error.message);
    }
  };

  // === SOLARA IA - ENVIAR MENSAGEM ===
  const handleSolaraSend = () => {
    const msg = solaraInput.trim();
    if (!msg) return;

    // Adicionar mensagem do usuário
    setSolaraMessages(prev => [...prev, { role: 'user', content: msg }]);
    setSolaraInput('');

    // Simular resposta da IA baseada em palavras-chave (RAG local)
    setTimeout(() => {
      let response = '';
      const lower = msg.toLowerCase();

      if (lower.includes('agendar') || lower.includes('marcar') || lower.includes('consulta') || lower.includes('horário')) {
        response = 'Para agendar uma consulta, clique no botão "Novo Agendamento" no topo da página, ou me diga o nome do paciente, data e horário desejado que eu oriento o processo.';
      } else if (lower.includes('cancelar') || lower.includes('desmarcar')) {
        response = 'Para cancelar um agendamento, acesse a Agenda Kanban, localize o card do paciente e altere o status. Posso ajudar com algo mais?';
      } else if (lower.includes('remarcar') || lower.includes('reagendar') || lower.includes('mudar')) {
        response = 'Para remarcar, é necessário localizar o agendamento na Agenda Kanban e atualizar a data/horário. Deseja que eu explique o passo a passo?';
      } else if (lower.includes('paciente') || lower.includes('fila') || lower.includes('espera')) {
        response = `No momento, temos ${appointmentsList.filter(a => a.status === 'pending' || a.status === 'confirmed').length} pacientes na fila/confirmados. Acesse a aba Recepção para ver detalhes.`;
      } else if (lower.includes('médico') || lower.includes('especialista') || lower.includes('doutor')) {
        response = `Sua clínica possui ${specialistsList.length} especialista(s) cadastrado(s). Acesse a aba Especialistas para gerenciar a equipe.`;
      } else if (lower.includes('relatório') || lower.includes('faturamento') || lower.includes('receita')) {
        response = 'Os relatórios estão disponíveis na aba Relatórios. Lá você encontra faturamento, taxa de absenteísmo e NPS. Também é possível exportar em PDF.';
      } else if (lower.includes('lgpd') || lower.includes('dado') || lower.includes('privacidade')) {
        response = 'O Solara Connect está 100% em conformidade com a LGPD. Todos os dados são criptografados e o consentimento do paciente é registrado em cada check-in.';
      } else if (lower.includes('whatsapp') || lower.includes('mensagem')) {
        response = 'A integração WhatsApp está disponível na aba WhatsApp. A Solara IA pode responder agendamentos automaticamente quando ativada nas Configurações.';
      } else if (lower.includes('oi') || lower.includes('olá') || lower.includes('bom dia') || lower.includes('boa tarde')) {
        response = 'Olá! 😊 Estou aqui para ajudar com a gestão da sua clínica. Pode perguntar sobre agendamentos, pacientes, relatórios ou qualquer funcionalidade do sistema!';
      } else {
        response = 'Entendi sua dúvida! Para informações mais detalhadas, recomendo verificar as abas do painel. Posso ajudar com: agendamentos, cancelamentos, remarcações, relatórios, LGPD ou WhatsApp. O que prefere?';
      }

      setSolaraMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 800);
  };

  const timeString = currentTime.toLocaleTimeString('pt-BR', { 
    timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const colors = {
    bg: '#f0f4f8',
    sidebar: '#130f40',
    primary: '#130f40',
    accent: '#7ed6df',
    success: '#33d9b2',
    danger: '#ff5252',
    warn: '#ffda79',
    text: '#1e293b',
    textMuted: '#64748b',
    white: '#ffffff',
    glass: 'rgba(255, 255, 255, 0.7)'
  };

  const menuItems = [
    { id: 'reception', label: 'Recepção', icon: <Users size={20} /> },
    { id: 'recovery', label: 'Recuperação', icon: <TrendingUp size={20} /> },
    { id: 'agenda', label: 'Agenda Kanban', icon: <Calendar size={20} /> },
    { id: 'emr', label: 'Prontuário', icon: <FileText size={20} /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare size={20} /> },
    { id: 'journey', label: 'Pré e Pós Consulta', icon: <Zap size={20} /> },
    { id: 'specialists', label: 'Especialistas', icon: <Stethoscope size={20} /> },
    { id: 'reports', label: 'Relatórios', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Configurações', icon: <Settings size={20} /> },
  ];

  const DonutChart = ({ percent, color, label }: { percent: number, color: string, label: string }) => {
    const r = 35;
    const circ = 2 * Math.PI * r;
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 8px' }}>
          <svg width="80" height="80" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <motion.circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - (percent / 100) * circ }} transition={{ duration: 1.5 }} strokeLinecap="round" transform="rotate(-90 50 50)" />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 700, fontSize: '0.9rem', color: colors.primary }}>{percent}%</div>
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted }}>{label}</div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.bg, fontFamily: "'Outfit', sans-serif" }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '280px', backgroundColor: colors.sidebar, color: '#fff', padding: '32px 20px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100, overflowY: 'auto' }}>
        <div style={{ marginBottom: 40, padding: '0 12px' }}><Logo size={40} textColor="#fff" text="Solara Connect" /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, transition: 'all 0.2s', backgroundColor: activeTab === item.id ? 'rgba(126, 214, 223, 0.15)' : 'transparent', color: activeTab === item.id ? colors.accent : 'rgba(255,255,255,0.6)', textAlign: 'left' }}>
              {item.icon} {item.label}
              {activeTab === item.id && <motion.div layoutId="active" style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', backgroundColor: colors.accent }} />}
            </button>
          ))}
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, transition: 'all 0.2s', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.4)', marginTop: '24px' }} onMouseEnter={(e) => e.currentTarget.style.color = colors.danger} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
            <LogOut size={20} /> Sair
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ padding: '24px 40px', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: colors.primary, marginBottom: 4 }}>
                {menuItems.find(i => i.id === activeTab)?.label}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: colors.textMuted, fontSize: '0.95rem', fontWeight: 600 }}>
                <Clock size={16} color={colors.accent} /> <span style={{ letterSpacing: '1px' }}>{timeString}</span>
                <span style={{ opacity: 0.3 }}>|</span> <span>São Paulo</span>
              </div>
            </div>

            <div 
              onClick={() => setShowSolara(!showSolara)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(135deg, #130f40 0%, #2c3e50 100%)', padding: '10px 24px', borderRadius: 100, color: '#fff', boxShadow: '0 10px 20px rgba(19,15,64,0.15)', cursor: 'pointer', transition: 'transform 0.2s', border: `1px solid rgba(255,255,255,0.1)` }} 
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} 
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.accent, boxShadow: `0 0 10px ${colors.accent}` }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '1px' }}>SOLARA IA</span>
              <span style={{ fontSize: '0.7rem', color: colors.primary, background: colors.success, padding: '3px 8px', borderRadius: 10, fontWeight: 800 }}>ON</span>
            </div>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
              {['reception', 'agenda', 'specialists', 'emr'].includes(activeTab) && (
                <div style={{ position: 'relative', width: 300 }}>
                  <Search size={18} color={colors.textMuted} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" placeholder="Buscar..." style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', outline: 'none', background: 'rgba(255,255,255,0.5)' }} />
                </div>
              )}
              
              {activeTab === 'reports' ? (
                <button onClick={() => window.print()} style={{ background: '#fff', color: colors.primary, border: `1px solid ${colors.primary}20`, padding: '12px 24px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: `0 4px 10px rgba(0,0,0,0.05)` }}>
                  <Printer size={20} /> Exportar Relatório (PDF)
                </button>
              ) : activeTab === 'specialists' ? (
                <button onClick={() => {
                  if (specialistsList.length >= clinicLimit) {
                    alert(`Limitação do Plano: Você atingiu o limite máximo de ${clinicLimit} especialista(s) permitido no seu plano atual.\n\nPor favor, faça um upgrade para adicionar mais profissionais à sua clínica.`);
                  } else {
                    setShowSpecialistModal(true);
                  }
                }} style={{ background: colors.primary, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: `0 10px 20px ${colors.primary}30` }}>
                  <Plus size={20} /> Novo Especialista
                </button>
              ) : (
                <button onClick={() => setShowModal(true)} style={{ background: colors.primary, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: `0 10px 20px ${colors.primary}30` }}>
                  <UserPlus size={20} /> {activeTab === 'agenda' ? 'Novo Agendamento' : 'Check-in Rápido'}
                </button>
              )}
            </div>
          </div>
          <div style={{ height: 2, width: '100%', background: `linear-gradient(to right, ${colors.accent}, ${colors.success}, transparent)` }} />
        </header>

        <div style={{ padding: '40px' }}>
          <AnimatePresence mode="wait">
            
            {/* VIEW: RECEPTION HIGH-TECH */}
            {activeTab === 'reception' && (
              <motion.div key="reception" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                
                {/* Top Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 40 }}>
                  {[
                    { label: 'Na Fila', value: '08', sub: 'Média 15m', icon: <Clock />, color: colors.accent },
                    { label: 'Em Atendimento', value: '03', sub: 'Salas ativas', icon: <Activity />, color: colors.success },
                    { label: 'Urgências', value: '01', sub: 'Prioridade Alta', icon: <AlertCircle />, color: colors.danger },
                    { label: 'Confirmados', value: '42', sub: 'Total hoje', icon: <Check />, color: colors.primary },
                  ].map((s, i) => (
                    <div key={i} style={{ background: '#fff', padding: '24px', borderRadius: 24, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: colors.primary }}>{s.value}</div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: s.color }}>{s.sub}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: colors.textMuted }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
                  
                  {/* Pacientes na Fila */}
                  <div style={{ background: '#fff', borderRadius: 28, border: '1px solid rgba(0,0,0,0.05)', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: colors.primary }}>Fila de Atendimento</h3>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700, color: colors.textMuted }}>Filtros</button>
                        <button style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700, color: colors.textMuted }}>Ver Tudo</button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {appointmentsList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>Nenhum paciente na fila.</div>
                      ) : (
                        appointmentsList.map((app) => (
                          <motion.div key={app.id} whileHover={{ x: 10 }} style={{ display: 'flex', alignItems: 'center', padding: '20px', borderRadius: 20, background: '#fff', border: `1px solid #f1f5f9`, boxShadow: '0 4px 6px rgba(0,0,0,0.01)' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: colors.primary, color: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginRight: 20 }}>{app.patients?.name?.charAt(0) || 'P'}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, color: colors.primary, fontSize: '1rem', marginBottom: 4 }}>{app.patients?.name}</div>
                              <div style={{ fontSize: '0.85rem', color: colors.textMuted, display: 'flex', gap: 12 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> Horário: {app.start_time ? new Date(app.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Stethoscope size={14} /> {app.type || 'Consulta'}</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', marginRight: 24 }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: colors.success }}>{app.status}</div>
                              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: colors.textMuted }}>EM ESPERA</div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Status dos Especialistas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ background: colors.primary, borderRadius: 28, padding: '28px', color: '#fff', boxShadow: `0 20px 40px ${colors.primary}40` }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}><Stethoscope size={20} color={colors.accent} /> Especialistas</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {specialistsList.length === 0 ? (
                          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px' }}>Nenhum médico cadastrado.</div>
                        ) : (
                          specialistsList.slice(0, 3).map((d, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: i === specialistsList.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{d.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{d.specialty}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: d.active ? colors.success : colors.warn }}>{d.active ? 'Disponível' : 'Em Pausa'}</div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Sala {i+1}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div style={{ background: '#fff', borderRadius: 28, border: '1px solid rgba(0,0,0,0.05)', padding: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: colors.primary, marginBottom: 20 }}>Metas do Dia</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <DonutChart percent={75} color={colors.success} label="Consultas" />
                        <DonutChart percent={40} color={colors.accent} label="Retornos" />
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* VIEW: RECOVERY (RECUPERAÇÃO) */}
            {activeTab === 'recovery' && (
              <motion.div key="recovery" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                
                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                  {[
                    { label: 'Receita em Risco', value: 'R$ 48.500', color: colors.warn, icon: <TrendingUp size={24} />, desc: 'Orçamentos pendentes' },
                    { label: 'Pacientes Inativos', value: '142', color: colors.danger, icon: <Users size={24} />, desc: 'Há mais de 90 dias' },
                    { label: 'Taxa de Retorno', value: '12%', color: colors.success, icon: <CheckCircle2 size={24} />, desc: '+2% este mês' },
                    { label: 'Recuperado (Mês)', value: 'R$ 8.200', color: colors.accent, icon: <Activity size={24} />, desc: 'Meta: R$ 10.000' }
                  ].map((stat, i) => (
                    <div key={i} style={{ background: '#fff', padding: 24, borderRadius: 28, border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {React.cloneElement(stat.icon as React.ReactElement<any>, { color: stat.color })}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: stat.color, background: `${stat.color}10`, padding: '4px 10px', borderRadius: 8 }}>AO VIVO</div>
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: colors.primary, marginBottom: 4 }}>{stat.value}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: colors.primary }}>{stat.label}</div>
                      <div style={{ fontSize: '0.75rem', color: colors.textMuted, marginTop: 4 }}>{stat.desc}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }}>
                  
                  {/* Inactive Patients List */}
                  <div style={{ background: '#fff', borderRadius: 32, padding: 32, border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 15px 40px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: colors.primary, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Users size={24} color={colors.accent} /> Pacientes para Reativar
                      </h3>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid rgba(0,0,0,0.1)`, background: '#f8fafc', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Filtrar por Tempo</button>
                        <button style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: colors.primary, color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Exportar Lista</button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { name: 'Ricardo Mendes', lastVisit: '120 dias atrás', procedure: 'Implante Dentário', value: 'R$ 4.500', risk: 'Alto' },
                        { name: 'Julia Rocha', lastVisit: '155 dias atrás', procedure: 'Harmonização Facial', value: 'R$ 2.800', risk: 'Crítico' },
                        { name: 'Marcos Braz', lastVisit: '95 dias atrás', procedure: 'Limpeza e Profilaxia', value: 'R$ 350', risk: 'Médio' },
                        { name: 'Luciana Costa', lastVisit: '210 dias atrás', procedure: 'Clareamento Laser', value: 'R$ 1.200', risk: 'Crítico' },
                      ].map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', background: '#f8fafc', borderRadius: 20, border: '1px solid transparent', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = colors.accent}>
                          <div style={{ width: 44, height: 44, borderRadius: 14, background: colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginRight: 16 }}>{p.name.charAt(0)}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: colors.primary, fontSize: '1rem' }}>{p.name}</div>
                            <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>{p.procedure} • Última visita: {p.lastVisit}</div>
                          </div>
                          <div style={{ textAlign: 'right', marginRight: 32 }}>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: colors.primary }}>{p.value}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: p.risk === 'Crítico' ? colors.danger : colors.warn }}>Risco {p.risk}</div>
                          </div>
                          <button onClick={() => alert('Mensagem de recuperação inteligente enviada via WhatsApp para ' + p.name + '!')} style={{ background: colors.success, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 12, fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 8px 16px ${colors.success}30` }}>
                            <MessageSquare size={16} /> Recuperar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Campaigns Sidebar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #1e1b4b 100%)`, borderRadius: 32, padding: 32, color: '#fff', boxShadow: `0 20px 40px ${colors.primary}40`, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: colors.accent, filter: 'blur(100px)', opacity: 0.15 }}></div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>Campanhas Inteligentes</h3>
                      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: 24, lineHeight: 1.6 }}>Selecione um modelo de campanha e deixe a IA da Solara cuidar das mensagens.</p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                          { title: 'Reativação VIP', desc: 'Para pacientes inativos há +180 dias', color: colors.accent },
                          { title: 'Fechamento de Orçamento', desc: 'Follow-up para orçamentos pendentes', color: colors.success },
                          { title: 'Promoção Especial', desc: 'Envio em massa para toda a base', color: colors.warn }
                        ].map((c, i) => (
                          <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: 4 }}>{c.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>{c.desc}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: c.color, fontWeight: 700 }}>Disponível</span>
                              <button style={{ background: 'transparent', border: `1px solid ${c.color}`, color: c.color, padding: '4px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 }}>Configurar</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: '#fff', borderRadius: 32, padding: 32, border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 15px 40px rgba(0,0,0,0.03)', textAlign: 'center' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Target size={32} color={colors.primary} />
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: colors.primary, marginBottom: 8 }}>Dica da IA</h4>
                      <p style={{ fontSize: '0.85rem', color: colors.textMuted, lineHeight: 1.5 }}>
                        Pacientes que realizaram <strong>Limpeza</strong> têm 40% mais chance de aceitar novos orçamentos se contatados em até 5 dias.
                      </p>
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {/* VIEW: AGENDA KANBAN */}
            {activeTab === 'agenda' && (
              <motion.div key="agenda" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, height: 'calc(100vh - 250px)' }}>
                {(() => {
                  const statusMap = [
                    { id: 'confirmados', label: 'Confirmados', statuses: ['confirmed', 'pending'], color: colors.success, bg: 'linear-gradient(180deg, rgba(51, 217, 178, 0.05) 0%, rgba(255, 255, 255, 0) 100%)', nextStatus: 'in_progress', nextLabel: 'Iniciar' },
                    { id: 'espera', label: 'Em Atendimento', statuses: ['in_progress'], color: colors.warn, bg: 'linear-gradient(180deg, rgba(255, 218, 121, 0.05) 0%, rgba(255, 255, 255, 0) 100%)', nextStatus: 'completed', nextLabel: 'Finalizar' },
                    { id: 'finalizados', label: 'Finalizados', statuses: ['completed'], color: colors.textMuted, bg: 'linear-gradient(180deg, rgba(100, 116, 139, 0.05) 0%, rgba(255, 255, 255, 0) 100%)', nextStatus: null, nextLabel: null },
                  ];
                  return statusMap.map(col => {
                    const items = appointmentsList.filter(a => col.statuses.includes(a.status));
                    return (
                      <div key={col.id} style={{ background: '#fff', backgroundImage: col.bg, borderRadius: 28, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 15px 35px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: col.color }} />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px 16px', borderBottom: '1px dashed rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 12, background: `${col.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Users size={18} color={col.color} />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.primary }}>{col.label}</h3>
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: col.color, background: `${col.color}15`, padding: '6px 14px', borderRadius: 12 }}>{items.length}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', paddingBottom: '20px', paddingRight: '4px' }}>
                          {items.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px 16px', color: colors.textMuted, fontSize: '0.85rem' }}>Nenhum paciente nesta coluna.</div>
                          ) : (
                            items.map(item => {
                              const patientName = item.patients?.name || 'Paciente';
                              const doctorName = item.users?.name || 'Sem médico';
                              const time = item.start_time ? new Date(item.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';
                              return (
                                <motion.div 
                                  key={item.id} 
                                  layout
                                  whileHover={{ y: -4, boxShadow: '0 12px 24px -4px rgba(0,0,0,0.1)' }}
                                  style={{ background: '#fff', padding: '20px', borderRadius: 20, boxShadow: '0 8px 20px -8px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', overflow: 'hidden', cursor: 'default' }}
                                >
                                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: col.color, opacity: 0.5 }} />
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 8 }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.primary, background: '#f1f5f9', padding: '6px 12px', borderRadius: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{item.type || 'Consulta'}</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: colors.primary, display: 'flex', alignItems: 'center', gap: 6, background: `${colors.accent}15`, padding: '4px 10px', borderRadius: 8 }}><Clock size={14} color={colors.accent} /> {time}</span>
                                  </div>
                                  <div style={{ paddingLeft: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${col.color}20, ${col.color}40)`, color: col.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', border: `2px solid #fff`, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                        {patientName.charAt(0)}
                                      </div>
                                      <div style={{ fontWeight: 600, color: colors.primary, fontSize: '1.1rem' }}>{patientName}</div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, background: '#f8fafc', padding: '8px 12px', borderRadius: 10 }}>
                                      <Stethoscope size={16} color={colors.accent} /> {doctorName}
                                    </div>
                                  </div>
                                  {col.nextStatus && (
                                    <button onClick={() => handleUpdateAppointmentStatus(item.id, col.nextStatus!)} style={{ background: `${col.color}15`, color: col.color, border: `1px solid ${col.color}40`, padding: '8px 16px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', marginLeft: 8, transition: 'all 0.2s' }}>
                                      <Check size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />{col.nextLabel}
                                    </button>
                                  )}
                                </motion.div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </motion.div>
            )}

            {/* VIEW: EMR (PRONTUÁRIO) */}
            {activeTab === 'emr' && (
              <motion.div key="emr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 32 }}>
                
                {/* Resumo do Paciente */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ background: '#fff', borderRadius: 28, padding: 32, border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 15px 35px rgba(0,0,0,0.02)', textAlign: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, margin: '0 auto 16px' }}>C</div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.primary }}>Carlos Eduardo</h3>
                    <div style={{ fontSize: '0.85rem', color: colors.textMuted, fontWeight: 500, marginBottom: 24 }}>34 Anos • O+ • Convênio</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', background: '#f8fafc', padding: 16, borderRadius: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}><span style={{ color: colors.textMuted, fontWeight: 600 }}>Peso</span> <span style={{ fontWeight: 700, color: colors.primary }}>78 kg</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}><span style={{ color: colors.textMuted, fontWeight: 600 }}>Altura</span> <span style={{ fontWeight: 700, color: colors.primary }}>1.82 m</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}><span style={{ color: colors.textMuted, fontWeight: 600 }}>Alergias</span> <span style={{ fontWeight: 700, color: colors.danger }}>Penicilina</span></div>
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 28, padding: 24, border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 15px 35px rgba(0,0,0,0.02)' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: colors.primary, marginBottom: 16 }}>Histórico Recente</h4>
                    <div style={{ position: 'relative', paddingLeft: 16, borderLeft: `2px solid #e2e8f0` }}>
                      <div style={{ position: 'relative', marginBottom: 16 }}>
                        <div style={{ position: 'absolute', left: -21, top: 4, width: 10, height: 10, borderRadius: '50%', background: colors.accent, border: '2px solid #fff' }} />
                        <div style={{ fontSize: '0.75rem', color: colors.textMuted, fontWeight: 600 }}>12 Mar 2026</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.primary }}>Consulta de Rotina</div>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: -21, top: 4, width: 10, height: 10, borderRadius: '50%', background: '#cbd5e1', border: '2px solid #fff' }} />
                        <div style={{ fontSize: '0.75rem', color: colors.textMuted, fontWeight: 600 }}>05 Fev 2026</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.primary }}>Exame de Sangue</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evolução e Prescrição */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ background: '#fff', borderRadius: 28, padding: 32, border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 15px 35px rgba(0,0,0,0.02)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.primary, display: 'flex', alignItems: 'center', gap: 10 }}><FileText size={20} color={colors.accent} /> Evolução Clínica (Anamnese)</h3>
                      <button onClick={() => setShowPrescriptionModal(true)} style={{ background: colors.success, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 8px 16px ${colors.success}40`, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}><Plus size={18} /> Nova Receita</button>
                    </div>
                    
                    <textarea 
                      placeholder="Descreva o atendimento, queixas do paciente e conduta médica..." 
                      style={{ flex: 1, width: '100%', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 16, padding: 20, outline: 'none', resize: 'none', background: '#f8fafc', fontSize: '0.95rem', color: colors.text, fontFamily: 'inherit', lineHeight: 1.6 }}
                      defaultValue={"Paciente relata dores leves na região lombar após esforço físico.\n\nConduta:\n- Solicitação de Raio-X.\n- Prescrição de anti-inflamatório.\n- Repouso de 3 dias."}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                      <button onClick={() => setShowSignatureModal(true)} style={{ background: colors.primary, color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 14, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: `0 10px 20px ${colors.primary}30` }}>
                        <Check size={20} /> Assinar e Salvar
                      </button>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* VIEW: WHATSAPP */}
            {activeTab === 'whatsapp' && (
              <motion.div key="whatsapp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ height: 'calc(100vh - 200px)', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 1000, background: '#fff', borderRadius: 32, border: '8px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', overflow: 'hidden' }}>
                  {/* Sidebar contacts */}
                  <div style={{ width: 320, background: '#f8fafc', borderRight: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                     <div style={{ padding: 20, borderBottom: '1px solid rgba(0,0,0,0.05)' }}><input placeholder="Buscar conversa..." style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: 'none', background: '#e2e8f0', outline: 'none', fontSize: '0.9rem', fontWeight: 500 }}/></div>
                     <div style={{ flex: 1, overflowY: 'auto' }}>
                       {[
                         { name: 'Ricardo Mendes', time: '14:05', msg: 'Chego em 5 minutos.', unread: 2 },
                         { name: 'Julia Rocha', time: '13:50', msg: 'Obrigada pelo atendimento!', unread: 0 },
                         { name: 'Marcos Braz', time: 'Ontem', msg: 'Pode reagendar para amanhã?', unread: 0 },
                       ].map((chat, i) => (
                         <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.03)', display: 'flex', gap: 12, cursor: 'pointer', background: i === 0 ? '#fff' : 'transparent', borderLeft: i === 0 ? `4px solid ${colors.success}` : '4px solid transparent' }}>
                           <div style={{ width: 44, height: 44, borderRadius: '50%', background: colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>{chat.name.charAt(0)}</div>
                           <div style={{ flex: 1 }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontWeight: 800, fontSize: '0.95rem', color: colors.primary }}>Solara <span style={{ color: colors.accent }}>Connect</span></span> <span style={{ fontSize: '0.75rem', color: i === 0 ? colors.success : colors.textMuted, fontWeight: i === 0 ? 700 : 500 }}>{chat.time}</span></div>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '0.85rem', color: colors.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160, fontWeight: i === 0 ? 600 : 500 }}>{chat.msg}</span> {chat.unread > 0 && <span style={{ width: 20, height: 20, background: colors.success, color: '#fff', borderRadius: '50%', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{chat.unread}</span>}</div>
                           </div>
                         </div>
                       ))}
                     </div>
                  </div>
                  {/* Chat Area */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f1f5f9', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }} />
                    <div style={{ padding: '20px 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'relative', zIndex: 2 }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                         <div style={{ width: 48, height: 48, borderRadius: '50%', background: colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>R</div>
                         <div><div style={{ fontWeight: 700, color: colors.primary, fontSize: '1.1rem' }}>Ricardo Mendes</div><div style={{ fontSize: '0.8rem', color: colors.success, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, background: colors.success, borderRadius: '50%' }} /> Em atendimento pela IA</div></div>
                       </div>
                       <button style={{ background: '#fff', color: colors.danger, border: `1px solid ${colors.danger}40`, padding: '10px 16px', borderRadius: 12, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 10px rgba(255, 82, 82, 0.1)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                         <UserCog size={18} /> Assumir Atendimento (Humano)
                       </button>
                    </div>
                    <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', position: 'relative', zIndex: 2 }}>
                       <div style={{ alignSelf: 'center', background: 'rgba(0,0,0,0.05)', padding: '6px 16px', borderRadius: 12, fontSize: '0.75rem', color: colors.textMuted, fontWeight: 700 }}>Hoje</div>
                       <div style={{ alignSelf: 'flex-start', background: '#fff', padding: '16px 20px', borderRadius: '0 20px 20px 20px', maxWidth: '75%', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', fontSize: '0.95rem', color: colors.primary, fontWeight: 500, lineHeight: 1.5 }}>
                         Olá Ricardo, seu lembrete de consulta para hoje às 14:00 com Dr. Paulo. Confirma sua presença? <span style={{ display: 'block', fontSize: '0.7rem', color: colors.textMuted, marginTop: 8, textAlign: 'right', fontWeight: 600 }}>11:30</span>
                       </div>
                       <div style={{ alignSelf: 'flex-end', background: colors.success, color: '#fff', padding: '16px 20px', borderRadius: '20px 0 20px 20px', maxWidth: '75%', boxShadow: '0 4px 10px rgba(51, 217, 178, 0.2)', fontSize: '0.95rem', fontWeight: 500 }}>
                         Chego em 5 minutos. <span style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'right', fontWeight: 600 }}>14:05</span>
                       </div>
                    </div>
                    <div style={{ padding: '20px 32px', background: '#fff', borderTop: '1px solid rgba(0,0,0,0.05)', position: 'relative', zIndex: 2 }}>
                       <div style={{ display: 'flex', background: '#f8fafc', padding: '10px 10px 10px 24px', borderRadius: 24, border: '1px solid rgba(0,0,0,0.05)' }}>
                         <input type="text" placeholder="Escreva uma mensagem..." style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', fontWeight: 500 }} />
                         <button style={{ width: 48, height: 48, borderRadius: 20, background: colors.primary, color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}><Send size={20} /></button>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW: JOURNEY (PRE/POST) */}
            {activeTab === 'journey' && (
              <motion.div key="journey" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  
                  {/* Automações Ativas */}
                  <div style={{ background: '#fff', borderRadius: 28, padding: '32px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 15px 35px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.primary, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Zap size={20} color={colors.accent} /> Motores de Automação
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {automations.map((auto) => (
                        <div key={auto.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: auto.active ? `${colors.success}10` : '#f8fafc', borderRadius: 16, border: `1px solid ${auto.active ? colors.success + '30' : 'rgba(0,0,0,0.05)'}` }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: auto.active ? colors.primary : colors.textMuted }}>{auto.title}</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 500, color: colors.textMuted, marginTop: 4 }}>{auto.desc}</div>
                          </div>
                          <div 
                            onClick={() => setAutomations(prev => prev.map(a => a.id === auto.id ? { ...a, active: !a.active } : a))}
                            style={{ width: 44, height: 24, borderRadius: 12, background: auto.active ? colors.success : '#e2e8f0', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}
                          >
                            <div style={{ position: 'absolute', top: 2, left: auto.active ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', transition: 'all 0.3s' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Log em Tempo Real */}
                  <div style={{ background: '#130f40', borderRadius: 28, padding: '32px', color: '#fff', boxShadow: '0 20px 40px rgba(19,15,64,0.3)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle, rgba(126, 214, 223, 0.15) 0%, rgba(0,0,0,0) 70%)', transform: 'translate(50%, -50%)' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Activity size={20} color={colors.accent} /> Log do Cérebro Ativo
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 2 }}>
                      {[
                        { time: '14:02', text: 'NPS enviado para Julia Rocha', status: 'success' },
                        { time: '13:45', text: 'Lembrete enviado para Marcos Braz', status: 'success' },
                        { time: '13:30', text: 'Confirmação pendente: Ana Beatriz', status: 'warn' },
                        { time: '13:10', text: 'Follow-up enviado: Carlos Oliveira', status: 'success' },
                      ].map((log, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 600, marginTop: 2 }}>{log.time}</div>
                          <div style={{ flex: 1, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: log.status === 'success' ? colors.success : colors.warn, boxShadow: `0 0 10px ${log.status === 'success' ? colors.success : colors.warn}` }} />
                              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>{log.text}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* VIEW: SPECIALISTS */}
            {activeTab === 'specialists' && (
              <motion.div key="specialists" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
                {specialistsList.length === 0 ? (
                   <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px', color: colors.textMuted }}>Nenhum especialista cadastrado.</div>
                ) : (
                  specialistsList.map((doc, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: 28, padding: '32px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 15px 35px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: doc.active ? colors.success : colors.textMuted }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                        <div style={{ width: 60, height: 60, borderRadius: 20, background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, boxShadow: `0 10px 20px ${colors.primary}30` }}>
                          {doc.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: colors.primary }}>{doc.name}</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: colors.accent }}>{doc.specialty}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '16px', borderRadius: 16 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.primary }}>{doc.rating || 5.0}</div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase' }}>Rating</div>
                        </div>
                        <div style={{ width: 1, background: 'rgba(0,0,0,0.05)' }} />
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: doc.active ? colors.success : colors.danger }}>{doc.active ? 'Ativo' : 'Inativo'}</div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase' }}>Status</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* VIEW: REPORTS */}
            {activeTab === 'reports' && (
              <motion.div key="reports" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                  {[
                    { label: 'Faturamento Mensal', value: 'R$ 84.500', trend: '+12%', color: colors.success },
                    { label: 'Taxa de Absenteísmo', value: '4.2%', trend: '-2.1%', color: colors.accent },
                    { label: 'NPS (Satisfação)', value: '9.8', trend: '+0.5', color: colors.warn },
                    { label: 'Perdas Financeiras', value: 'R$ 1.200', trend: '-R$ 400', color: colors.danger },
                  ].map((stat, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: 24, padding: '24px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.textMuted, marginBottom: 12 }}>{stat.label}</div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: colors.primary, marginBottom: 8 }}>{stat.value}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: stat.color }}>{stat.trend} em relação ao mês passado</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
                  <div style={{ background: '#fff', borderRadius: 28, padding: '32px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.primary, marginBottom: 32 }}>Receita Diária (Semana)</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', padding: '0 20px' }}>
                      {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                          <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 1, delay: i * 0.1 }} style={{ width: 40, background: `linear-gradient(180deg, ${colors.accent} 0%, ${colors.success} 100%)`, borderRadius: '12px 12px 0 0', opacity: 0.8 }} />
                          <div style={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textMuted }}>{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 28, padding: '32px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.primary, marginBottom: 32, textAlign: 'center' }}>Distribuição de Planos</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                      <div style={{ position: 'relative', width: 160, height: 160 }}>
                        <svg viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke={colors.success} strokeWidth="20" strokeDasharray="180 251" transform="rotate(-90 50 50)" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke={colors.accent} strokeWidth="20" strokeDasharray="50 251" transform="rotate(90 50 50)" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke={colors.warn} strokeWidth="20" strokeDasharray="21 251" transform="rotate(140 50 50)" />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.primary }}>342</div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: colors.textMuted }}>Pacientes</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 500, color: colors.textMuted }}><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.success }} /> Particular</span> <span>72%</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 500, color: colors.textMuted }}><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.accent }} /> Convênio SulAmérica</span> <span>20%</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 500, color: colors.textMuted }}><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.warn }} /> Outros</span> <span>8%</span></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {/* VIEW: SETTINGS (CONFIGURAÇÕES) */}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                
                <div style={{ background: '#fff', borderRadius: 32, padding: 32, border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 15px 40px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: colors.primary, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Settings size={24} color={colors.accent} /> Perfil da Clínica
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>Nome da Unidade</label>
                      <input defaultValue="Solara Connect - Matriz" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>E-mail de Notificações</label>
                      <input defaultValue="axoshub.solara@gmail.com" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>Telefone Comercial</label>
                        <input defaultValue="(11) 99999-0000" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: colors.textMuted, marginBottom: 8 }}>CNPJ</label>
                        <input defaultValue="00.000.000/0001-00" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                      </div>
                    </div>
                    <button style={{ marginTop: 12, background: colors.primary, color: '#fff', border: 'none', padding: '14px', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Salvar Alterações</button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  <div style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #1e1b4b 100%)`, borderRadius: 32, padding: 32, color: '#fff' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Zap size={20} color={colors.accent} /> Cérebro IA (Solara)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Automação de WhatsApp</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>IA responde agendamentos sozinha</div>
                        </div>
                        <div style={{ width: 44, height: 24, background: colors.success, borderRadius: 12, position: 'relative', cursor: 'pointer' }}>
                          <div style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', position: 'absolute', right: 3, top: 3 }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Análise de Churn</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Detectar pacientes em risco</div>
                        </div>
                        <div style={{ width: 44, height: 24, background: colors.success, borderRadius: 12, position: 'relative', cursor: 'pointer' }}>
                          <div style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', position: 'absolute', right: 3, top: 3 }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 32, padding: 32, border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 15px 40px rgba(0,0,0,0.03)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: colors.primary, marginBottom: 16 }}>Personalização</h3>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {['#130f40', '#7ed6df', '#33d9b2', '#ffda79'].map(c => (
                        <div key={c} style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: c, border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', cursor: 'pointer' }} />
                      ))}
                      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* MODAL: NOVO AGENDAMENTO / CHECK-IN */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(19, 15, 64, 0.6)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: 32, padding: '40px', position: 'relative', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)' }}>
              <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 24, right: 24, background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: 10, cursor: 'pointer' }}><X size={20} color={colors.primary} /></button>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: colors.primary, marginBottom: 8 }}>Novo Agendamento</h2>
              <p style={{ color: colors.textMuted, marginBottom: 32 }}>Preencha os dados do paciente e confirme o consentimento LGPD.</p>
              <form onSubmit={handleSaveAppointment} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: colors.primary, marginBottom: 8 }}>Nome Completo</label>
                  <input type="text" required value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} placeholder="Ex: João Silva" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: colors.primary, marginBottom: 8 }}>WhatsApp / Telefone</label>
                    <input type="text" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} placeholder="(00) 00000-0000" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: colors.primary, marginBottom: 8 }}>Idade</label>
                    <input type="number" value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} placeholder="Ex: 30" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: colors.primary, marginBottom: 8 }}>Data</label>
                    <input type="date" required value={newAppointment.date} onChange={e => setNewAppointment({...newAppointment, date: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: colors.primary, marginBottom: 8 }}>Horário</label>
                    <input type="time" required value={newAppointment.time} onChange={e => setNewAppointment({...newAppointment, time: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: colors.primary, marginBottom: 8 }}>Especialista</label>
                  <select value={newAppointment.doctor_id} onChange={e => setNewAppointment({...newAppointment, doctor_id: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', background: '#fff' }}>
                    <option value="">Selecione um médico...</option>
                    {specialistsList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.specialty || 'Geral'})</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#f8fafc', padding: '16px', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                  <input type="checkbox" required checked={newPatient.lgpd_consent} onChange={e => setNewPatient({...newPatient, lgpd_consent: e.target.checked})} style={{ marginTop: 4, cursor: 'pointer' }} id="lgpd" />
                  <label htmlFor="lgpd" style={{ fontSize: '0.8rem', color: colors.textMuted, cursor: 'pointer', lineHeight: '1.4' }}>
                    <strong>Termo de Consentimento LGPD:</strong> O paciente autoriza a coleta e tratamento de seus dados pessoais para fins de atendimento clínico e comunicações via WhatsApp conforme a Lei 13.709/18.
                  </label>
                </div>

                <button type="submit" disabled={isLoading} style={{ marginTop: 12, background: colors.primary, opacity: isLoading ? 0.7 : 1, color: '#fff', border: 'none', padding: '16px', borderRadius: 14, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  {isLoading ? 'Salvando...' : <><Check size={20} /> Salvar Agendamento</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: NOVO ESPECIALISTA */}
      <AnimatePresence>
        {showSpecialistModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(19, 15, 64, 0.6)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: 32, padding: '40px', position: 'relative', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)' }}>
              <button onClick={() => setShowSpecialistModal(false)} style={{ position: 'absolute', top: 24, right: 24, background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: 10, cursor: 'pointer' }}><X size={20} color={colors.primary} /></button>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: colors.primary, marginBottom: 8 }}>Novo Especialista</h2>
              <p style={{ color: colors.textMuted, marginBottom: 32 }}>Adicione um novo médico à sua clínica.</p>
              <form onSubmit={handleSaveSpecialist} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: colors.primary, marginBottom: 8 }}>Nome Completo</label>
                  <input type="text" required value={newSpecialist.name} onChange={e => setNewSpecialist({...newSpecialist, name: e.target.value})} placeholder="Ex: Dr. Paulo Silva" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: colors.primary, marginBottom: 8 }}>Especialidade</label>
                    <input type="text" required value={newSpecialist.specialty} onChange={e => setNewSpecialist({...newSpecialist, specialty: e.target.value})} placeholder="Ex: Ortodontia" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: colors.primary, marginBottom: 8 }}>CRM (Opcional)</label>
                    <input type="text" value={newSpecialist.crm} onChange={e => setNewSpecialist({...newSpecialist, crm: e.target.value})} placeholder="Ex: 12345-SP" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: colors.primary, marginBottom: 8 }}>E-mail (Opcional)</label>
                    <input type="email" value={newSpecialist.email} onChange={e => setNewSpecialist({...newSpecialist, email: e.target.value})} placeholder="Ex: doutor@clinica.com" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: colors.primary, marginBottom: 8 }}>WhatsApp / Emergência</label>
                    <input type="text" value={newSpecialist.phone} onChange={e => setNewSpecialist({...newSpecialist, phone: e.target.value})} placeholder="(00) 00000-0000" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} style={{ marginTop: 12, background: colors.success, opacity: isLoading ? 0.7 : 1, color: '#fff', border: 'none', padding: '16px', borderRadius: 14, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  {isLoading ? 'Salvando...' : <><Plus size={20} /> Salvar Especialista</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: NOVA RECEITA */}
      <AnimatePresence>
        {showPrescriptionModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(19, 15, 64, 0.6)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: '#fff', width: '100%', maxWidth: '600px', borderRadius: 32, padding: '40px', position: 'relative', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)' }}>
              <button onClick={() => setShowPrescriptionModal(false)} style={{ position: 'absolute', top: 24, right: 24, background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: 10, cursor: 'pointer' }}><X size={20} color={colors.primary} /></button>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: colors.primary, marginBottom: 8 }}>Nova Prescrição</h2>
              <p style={{ color: colors.textMuted, marginBottom: 32 }}>Emita receitas médicas de forma rápida e segura.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: colors.primary, marginBottom: 8 }}>Medicamento</label>
                  <input type="text" placeholder="Busque por princípio ativo ou nome comercial" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: colors.primary, marginBottom: 8 }}>Posologia</label>
                    <input type="text" placeholder="Ex: 1 comprimido a cada 8h" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: colors.primary, marginBottom: 8 }}>Duração</label>
                    <input type="text" placeholder="Ex: 7 dias" style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none' }} />
                  </div>
                </div>
                <button onClick={() => {
                  alert('Receita salva com sucesso!');
                  setShowPrescriptionModal(false);
                }} style={{ marginTop: 12, background: colors.success, color: '#fff', border: 'none', padding: '16px', borderRadius: 14, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <Plus size={20} /> Adicionar Medicamento e Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ASSINATURA DIGITAL */}
      <AnimatePresence>
        {showSignatureModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(19, 15, 64, 0.6)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: '#fff', width: '100%', maxWidth: '400px', borderRadius: 32, padding: '40px', position: 'relative', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)', textAlign: 'center' }}>
              <button onClick={() => setShowSignatureModal(false)} style={{ position: 'absolute', top: 24, right: 24, background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: 10, cursor: 'pointer' }}><X size={20} color={colors.primary} /></button>
              
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${colors.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Check size={32} color={colors.primary} />
              </div>
              
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.primary, marginBottom: 12 }}>Assinar Prontuário</h2>
              <p style={{ color: colors.textMuted, marginBottom: 32, fontSize: '0.9rem', lineHeight: 1.5 }}>
                Ao assinar digitalmente, este prontuário será fechado de acordo com as normas do CFM e LGPD.
              </p>
              
              <button onClick={() => {
                  alert('Prontuário assinado e salvo com sucesso!');
                  setShowSignatureModal(false);
                }} style={{ width: '100%', background: colors.primary, color: '#fff', border: 'none', padding: '16px', borderRadius: 14, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                Confirmar Assinatura
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING SOLARA ASSISTANT */}
      <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
        <AnimatePresence>
          {/* FAB Button para abrir Solara IA */}
          {!showSolara && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1, boxShadow: `0 12px 30px ${colors.accent}60` }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSolara(true)}
              style={{
                width: 60, height: 60, borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.primary} 0%, #2c3e50 100%)`,
                color: '#fff', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 24px ${colors.primary}50`,
                position: 'relative'
              }}
            >
              <Zap size={26} color={colors.accent} />
              <div style={{ position: 'absolute', top: -2, right: -2, width: 14, height: 14, borderRadius: '50%', background: colors.success, border: '2px solid #fff', boxShadow: `0 0 8px ${colors.success}` }} />
            </motion.button>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showSolara && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} style={{ width: 350, height: 500, background: '#fff', borderRadius: 28, boxShadow: '0 25px 60px -12px rgba(19, 15, 64, 0.4)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ background: colors.primary, padding: '24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: colors.accent, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={24} color={colors.primary} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>Solara AI</div>
                    <div style={{ fontSize: '0.7rem', color: colors.success, fontWeight: 700 }}>Online e Atenta</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setSolaraMessages([{ role: 'assistant', content: 'Conversa limpa. Como posso ajudar?' }])} title="Limpar Conversa" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#fff' }}><Trash2 size={16} /></button>
                  <button onClick={() => setShowSolara(false)} title="Fechar" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#fff' }}><X size={16} /></button>
                </div>
              </div>
              
              <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, background: '#f8fafc' }}>
                {solaraMessages.map((m, i) => (
                  <div key={i} style={{ alignSelf: m.role === 'assistant' ? 'flex-start' : 'flex-end', background: m.role === 'assistant' ? '#fff' : colors.primary, color: m.role === 'assistant' ? colors.primary : '#fff', padding: '12px 16px', borderRadius: m.role === 'assistant' ? '0 16px 16px 16px' : '16px 16px 0 16px', fontSize: '0.9rem', maxWidth: '85%', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', border: m.role === 'assistant' ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                    {m.content}
                  </div>
                ))}
              </div>

              <div style={{ padding: 16, borderTop: '1px solid rgba(0,0,0,0.05)', background: '#fff', display: 'flex', gap: 10 }}>
                <input 
                  value={solaraInput}
                  onChange={e => setSolaraInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSolaraSend()}
                  placeholder="Digite sua dúvida..." 
                  style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }} 
                />
                <button onClick={handleSolaraSend} style={{ background: colors.primary, color: '#fff', border: 'none', borderRadius: 12, padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
};

export default Dashboard;
