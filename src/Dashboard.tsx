import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Calendar, Clock, Activity, 
  Settings, LogOut, Bell, Search,
  Plus, ChevronRight, MoreVertical,
  Filter, TrendingUp, ShieldCheck,
  BarChart3, PieChart, DollarSign,
  UserX, Heart, X, Check, MapPin,
  Stethoscope, UserPlus, AlertCircle, Printer,
  MessageSquare, FileText, Zap, UserCog, Send, Star
} from 'lucide-react';
import Logo from './Logo';
import { supabase } from './lib/supabase';

const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('reception');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados de Dados Reais
  const [specialistsList, setSpecialistsList] = useState<any[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<any[]>([]);
  const [newPatient, setNewPatient] = useState({
    name: '', phone: '', age: '', insurance: 'Particular', lgpd_consent: false
  });
  const [newAppointment, setNewAppointment] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    specialist_id: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: specialists } = await supabase.from('specialists').select('*');
      const { data: appointments } = await supabase.from('appointments').select('*, patients(*)').order('appointment_time', { ascending: true });
      if (specialists) setSpecialistsList(specialists);
      if (appointments) setAppointmentsList(appointments);
    } catch (error) {
      console.error('Erro:', error);
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
      const { data: patient, error: pError } = await supabase.from('patients').insert([{ 
        name: newPatient.name, phone: newPatient.phone, age: parseInt(newPatient.age) || null,
        insurance: newPatient.insurance, lgpd_consent: newPatient.lgpd_consent, lgpd_consent_date: new Date().toISOString()
      }]).select().single();
      if (pError) throw pError;
      const { error: aError } = await supabase.from('appointments').insert([{
        patient_id: patient.id, specialist_id: newAppointment.specialist_id || null,
        appointment_date: newAppointment.date, appointment_time: newAppointment.time, status: 'Aguardando'
      }]);
      if (aError) throw aError;
      setShowModal(false);
      setNewPatient({ name: '', phone: '', age: '', insurance: 'Particular', lgpd_consent: false });
    } catch (error: any) {
      alert('Erro: ' + error.message);
    } finally {
      setIsLoading(false);
    }
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(135deg, #130f40 0%, #2c3e50 100%)', padding: '10px 24px', borderRadius: 100, color: '#fff', boxShadow: '0 10px 20px rgba(19,15,64,0.15)', cursor: 'pointer', transition: 'transform 0.2s', border: `1px solid rgba(255,255,255,0.1)` }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
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
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> Horário: {app.appointment_time}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Stethoscope size={14} /> {app.type}</span>
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

            {/* VIEW: AGENDA KANBAN */}
            {activeTab === 'agenda' && (
              <motion.div key="agenda" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, height: 'calc(100vh - 250px)' }}>
                {[
                  { id: 'confirmados', label: 'Confirmados', color: colors.success, bg: 'linear-gradient(180deg, rgba(51, 217, 178, 0.05) 0%, rgba(255, 255, 255, 0) 100%)', items: [ { id: 1, patient: 'Ricardo Mendes', time: '14:00', type: 'Check-up', dr: 'Dr. Paulo' }, { id: 2, patient: 'Fernanda Lima', time: '14:30', type: 'Retorno', dr: 'Dra. Helena' }, { id: 5, patient: 'Amanda Silva', time: '15:00', type: 'Consulta', dr: 'Dr. Paulo' } ] },
                  { id: 'espera', label: 'Em Espera', color: colors.warn, bg: 'linear-gradient(180deg, rgba(255, 218, 121, 0.05) 0%, rgba(255, 255, 255, 0) 100%)', items: [ { id: 3, patient: 'Marcos Braz', time: '15:15', type: 'Consulta', dr: 'Dr. Andre' }, { id: 6, patient: 'Luciana Costa', time: '15:45', type: 'Exame', dr: 'Dra. Helena' } ] },
                  { id: 'finalizados', label: 'Finalizados', color: colors.textMuted, bg: 'linear-gradient(180deg, rgba(100, 116, 139, 0.05) 0%, rgba(255, 255, 255, 0) 100%)', items: [ { id: 4, patient: 'Julia Rocha', time: '13:00', type: 'Exame', dr: 'Dra. Helena' } ] },
                ].map(col => (
                  <div key={col.id} style={{ background: '#fff', backgroundImage: col.bg, borderRadius: 28, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 15px 35px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: col.color }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px 16px', borderBottom: '1px dashed rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 12, background: `${col.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Users size={18} color={col.color} />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.primary }}>{col.label}</h3>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: col.color, background: `${col.color}15`, padding: '6px 14px', borderRadius: 12 }}>{col.items.length}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', paddingBottom: '20px', paddingRight: '4px' }}>
                      {col.items.map(item => (
                        <motion.div 
                          key={item.id} 
                          drag 
                          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                          whileDrag={{ scale: 1.05, zIndex: 100, boxShadow: `0 25px 50px -12px ${col.color}40`, rotate: 2 }}
                          style={{ background: '#fff', padding: '20px', borderRadius: 20, boxShadow: '0 8px 20px -8px rgba(0,0,0,0.08)', cursor: 'grab', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', overflow: 'hidden' }}
                        >
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: col.color, opacity: 0.5 }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 8 }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.primary, background: '#f1f5f9', padding: '6px 12px', borderRadius: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{item.type}</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: colors.primary, display: 'flex', alignItems: 'center', gap: 6, background: `${colors.accent}15`, padding: '4px 10px', borderRadius: 8 }}><Clock size={14} color={colors.accent} /> {item.time}</span>
                          </div>
                          <div style={{ paddingLeft: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${col.color}20, ${col.color}40)`, color: col.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', border: `2px solid #fff`, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                {item.patient.charAt(0)}
                              </div>
                              <div style={{ fontWeight: 600, color: colors.primary, fontSize: '1.1rem' }}>{item.patient}</div>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, background: '#f8fafc', padding: '8px 12px', borderRadius: 10 }}>
                              <Stethoscope size={16} color={colors.accent} /> {item.dr}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
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
                      <button style={{ background: colors.success, color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 8px 16px ${colors.success}40`, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}><Plus size={18} /> Nova Receita</button>
                    </div>
                    
                    <textarea 
                      placeholder="Descreva o atendimento, queixas do paciente e conduta médica..." 
                      style={{ flex: 1, width: '100%', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 16, padding: 20, outline: 'none', resize: 'none', background: '#f8fafc', fontSize: '0.95rem', color: colors.text, fontFamily: 'inherit', lineHeight: 1.6 }}
                      defaultValue={"Paciente relata dores leves na região lombar após esforço físico.\n\nConduta:\n- Solicitação de Raio-X.\n- Prescrição de anti-inflamatório.\n- Repouso de 3 dias."}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                      <button style={{ background: colors.primary, color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 14, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: `0 10px 20px ${colors.primary}30` }}>
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
                      {[
                        { title: 'Lembrete Pré-Consulta', desc: 'Envia WhatsApp 2h antes para confirmar.', active: true },
                        { title: 'Pesquisa NPS', desc: 'Envia formulário de satisfação após finalização.', active: true },
                        { title: 'Follow-up de Bem-Estar', desc: 'Mensagem carinhosa 24h após o atendimento.', active: false },
                      ].map((auto, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: auto.active ? `${colors.success}10` : '#f8fafc', borderRadius: 16, border: `1px solid ${auto.active ? colors.success + '30' : 'rgba(0,0,0,0.05)'}` }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: auto.active ? colors.primary : colors.textMuted }}>{auto.title}</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 500, color: colors.textMuted, marginTop: 4 }}>{auto.desc}</div>
                          </div>
                          <div style={{ width: 44, height: 24, borderRadius: 12, background: auto.active ? colors.success : '#e2e8f0', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
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
                  <select value={newAppointment.specialist_id} onChange={e => setNewAppointment({...newAppointment, specialist_id: e.target.value})} style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', background: '#fff' }}>
                    <option value="">Selecione um médico...</option>
                    {specialistsList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.specialty})</option>)}
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

    </div>
  );
};

export default Dashboard;
