use client

import { useState } from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard, Calendar, Users, FileText, Settings, Bell, Search, Menu, X,
  TrendingUp, DollarSign, Clock, CheckCircle2, UserPlus, LogOut, ChevronDown,
  MoreVertical, Plus, Filter
} from "lucide-react"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const stats = [
    { label: "Atendimentos hoje", value: "24", change: "+12%", icon: Users, color: "bg-blue-500" },
    { label: "Faturamento mês", value: "R$ 142.500", change: "+18%", icon: DollarSign, color: "bg-green-500" },
    { label: "Tempo médio", value: "22 min", change: "-8%", icon: Clock, color: "bg-purple-500" },
    { label: "Novos pacientes", value: "156", change: "+24%", icon: UserPlus, color: "bg-orange-500" }
  ]

  const appointments = [
    { time: "08:00", patient: "Maria Silva", type: "Consulta", status: "completed" },
    { time: "09:00", patient: "João Santos", type: "Retorno", status: "completed" },
    { time: "10:30", patient: "Ana Costa", type: "Exame", status: "in-progress" },
    { time: "14:00", patient: "Pedro Oliveira", type: "Consulta", status: "pending" },
    { time: "15:30", patient: "Carla Mendes", type: "Procedimento", status: "pending" }
  ]

  const navItems = [
    { icon: LayoutDashboard, label: "Visão Geral", active: true },
    { icon: Calendar, label: "Agenda", active: false },
    { icon: Users, label: "Pacientes", active: false },
    { icon: FileText, label: "Prontuários", active: false },
    { icon: TrendingUp, label: "Relatórios", active: false },
    { icon: Settings, label: "Configurações", active: false }
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-200 lg:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-semibold text-white">Axos Hub</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item, index) => (
              <button key={index} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.active ? "bg-sky-500 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                <item.icon className="w-5 h-5" /><span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <LogOut className="w-5 h-5" /><span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" placeholder="Buscar paciente, médico..." className="pl-10 pr-4 py-2.5 bg-slate-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 w-80" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-slate-600" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-sky-700 rounded-full flex items-center justify-center text-white font-semibold">DR</div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">Dr. Silva</p>
                  <p className="text-xs text-slate-500">Administrador</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Visão Geral</h1>
              <p className="text-slate-600">Acompanhe os indicadores da sua clínica</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>{stat.change}</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900">Próximos Atendimentos</h2>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><Filter className="w-5 h-5 text-slate-600" /></button>
                    <button className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      <Plus className="w-4 h-4" /> Novo
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {appointments.map((apt, index) => (
                    <div key={index} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-center"><div className="text-sm font-semibold text-slate-900">{apt.time}</div></div>
                        <div>
                          <div className="font-medium text-slate-900">{apt.patient}</div>
                          <div className="text-sm text-slate-500">{apt.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === "completed" ? "bg-green-100 text-green-700" : apt.status === "in-progress" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                          {apt.status === "completed" ? "Realizado" : apt.status === "in-progress" ? "Em andamento" : "Aguardando"}
                        </span>
                        <button className="p-1 hover:bg-slate-200 rounded transition-colors"><MoreVertical className="w-4 h-4 text-slate-400" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Acesso Rápido</h2>
                <div className="space-y-3">
                  {[
                    { label: "Novo Paciente", icon: UserPlus, color: "bg-blue-500" },
                    { label: "Nova Consulta", icon: Calendar, color: "bg-green-500" },
                    { label: "Prontuário", icon: FileText, color: "bg-purple-500" },
                    { label: "Relatórios", icon: TrendingUp, color: "bg-orange-500" }
                  ].map((item, index) => (
                    <button key={index} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                      <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-slate-700">{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-medium text-slate-500 mb-3">Médicos de plantão</h3>
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 border-2 border-white flex items-center justify-center text-white text-sm font-medium">DR</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
