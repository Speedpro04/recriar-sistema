"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  FileText,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-semibold text-slate-900">Axos Hub</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#funcionalidades" className="text-slate-600 hover:text-slate-900 transition-colors">Funcionalidades</a>
              <a href="#beneficios" className="text-slate-600 hover:text-slate-900 transition-colors">Benefícios</a>
              <a href="#depoimentos" className="text-slate-600 hover:text-slate-900 transition-colors">Depoimentos</a>
              <a href="#planos" className="text-slate-600 hover:text-slate-900 transition-colors">Planos</a>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-slate-700 hover:text-slate-900 font-medium transition-colors">
                Entrar
              </Link>
              <Link
                href="/login"
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg"
              >
                Começar grátis
              </Link>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
            <div className="px-4 py-4 space-y-4">
              <a href="#funcionalidades" className="block text-slate-600">Funcionalidades</a>
              <a href="#beneficios" className="block text-slate-600">Benefícios</a>
              <a href="#depoimentos" className="block text-slate-600">Depoimentos</a>
              <Link href="/login" className="block text-slate-700 font-medium">Entrar</Link>
              <Link href="/login" className="block bg-slate-900 text-white px-5 py-2.5 rounded-lg text-center">
                Começar grátis
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 bg-gradient-to-br from-slate-50 via-white to-sky-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                Nova versão 2.0 disponível
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Gestão de clínicas <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-sky-700">simplificada</span> e inteligente
              </h1>

              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                Plataforma completa para clínicas que buscam excelência operacional,
                redução de custos e experiência excepcional para pacientes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/login"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                >
                  Começar teste grátis
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#funcionalidades"
                  className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg border border-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Ver demonstração
                </a>
              </div>

              <p className="mt-4 text-slate-500 text-sm">
                14 dias grátis • Sem cartão de crédito • Cancele quando quiser
              </p>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div
              className="mt-16 relative"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative mx-auto max-w-5xl">
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
                <div className="bg-slate-900 rounded-t-2xl p-2 shadow-2xl">
                  <div className="bg-slate-800 rounded-t-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-900">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900">
                      <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((item) => (
                          <div key={item} className="bg-slate-700/50 rounded-lg p-4 animate-pulse">
                            <div className="h-3 bg-slate-600 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-slate-600 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "500+", label: "Clínicas atendidas" },
                { value: "50K+", label: "Profissionais usam" },
                { value: "99,9%", label: "Uptime garantido" },
                { value: "24/7", label: "Suporte dedicado" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-slate-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="funcionalidades" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Tudo que sua clínica precisa
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Funcionalidades completas para gestão integrada e inteligente
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Calendar,
                  title: "Agendamento Inteligente",
                  description: "Gestão completa de agenda com encaixes automáticos e lembretes via WhatsApp."
                },
                {
                  icon: FileText,
                  title: "Prontuário Eletrônico",
                  description: "Acesso rápido e seguro ao histórico completo de cada paciente."
                },
                {
                  icon: Users,
                  title: "Gestão de Pacientes",
                  description: "Cadastro completo com histórico, evoluções e documentos anexados."
                },
                {
                  icon: TrendingUp,
                  title: "Relatórios e Dashboards",
                  description: "Indicadores em tempo real para tomada de decisão estratégica."
                },
                {
                  icon: Shield,
                  title: "Segurança e Compliance",
                  description: "LGGD compatível, backup automático e criptografia de ponta a ponta."
                },
                {
                  icon: Clock,
                  title: "Controle Financeiro",
                  description: "Fluxo de caixa, contas a pagar/receber e integração com contabilidade."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="beneficios" className="py-24 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">
                  Feito por médicos, para médicos
                </h2>
                <p className="text-xl text-slate-300 mb-8">
                  Entendemos a rotina das clínicas porque já trabalhamos nela.
                  Cada funcionalidade foi pensada para economizar tempo e reduzir burocracia.
                </p>

                <div className="space-y-4">
                  {[
                    "Redução de até 40% no tempo de atendimento",
                    "Eliminação de papel e arquivamento físico",
                    "Integração com principais convênios do Brasil",
                    "Aplicativo para pacientes com telemedicina inclusa",
                    "Relatórios para ANS e TISS sem burocracia"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-sky-400 flex-shrink-0" />
                      <span className="text-slate-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-transparent rounded-3xl"></div>
                <div className="relative bg-slate-800 rounded-3xl p-8">
                  <div className="space-y-6">
                    {[
                      { label: "Atendimentos hoje", value: "47", change: "+12%" },
                      { label: "Faturamento mensal", value: "R$ 284.500", change: "+18%" },
                      { label: "Tempo médio de consulta", value: "22 min", change: "-8%" }
                    ].map((stat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="text-slate-400 text-sm">{stat.label}</div>
                          <div className="text-2xl font-bold">{stat.value}</div>
                        </div>
                        <div className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {stat.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="depoimentos" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                O que nossos clientes dizem
              </h2>
              <p className="text-xl text-slate-600">
                Mais de 500 clínicas confiam na Axos Hub
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "A Axos transformou completamente nossa gestão. Hoje atendemos 30% a mais de pacientes com a mesma equipe.",
                  author: "Dra. Mariana Costa",
                  role: "Diretora Clínica, Clínica Vida"
                },
                {
                  quote: "O suporte é excepcional. Já usei outros sistemas, mas nenhum chega perto da qualidade e atendimento da Axos.",
                  author: "Dr. Ricardo Mendes",
                  role: "Clínico Geral, Centro Médico Saúde"
                },
                {
                  quote: "Finalmente um sistema que entende a rotina de uma clínica. É como se tivessem desenhado sob medida para nós.",
                  author: "Dra. Fernanda Lima",
                  role: "Socia, Instituto de Olhos"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.author}</div>
                    <div className="text-slate-500 text-sm">{testimonial.role}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="planos" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Planos que cabem no seu bolso
              </h2>
              <p className="text-xl text-slate-600">
                Escolha a melhor opção para sua clínica
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: "Starter",
                  price: "R$ 199",
                  description: "Para clínicas em crescimento",
                  features: [
                    "Até 2 profissionais",
                    "Prontuário eletrônico",
                    "Agendamento online",
                    "Relatórios básicos",
                    "Suporte por e-mail"
                  ]
                },
                {
                  name: "Professional",
                  price: "R$ 399",
                  description: "O mais escolhido",
                  highlight: true,
                  features: [
                    "Até 5 profissionais",
                    "Tudo do Starter",
                    "Gestão financeira",
                    "Telemedicina",
                    "App para pacientes",
                    "Suporte prioritário"
                  ]
                },
                {
                  name: "Enterprise",
                  price: "Sob consulta",
                  description: "Para grandes operações",
                  features: [
                    "Profissionais ilimitados",
                    "Personalização completa",
                    "API de integração",
                    "Gerente de conta",
                    "Treinamento in loco",
                    "SLA garantido"
                  ]
                }
              ].map((plan, index) => (
                <motion.div
                  key={index}
                  className={`relative p-8 rounded-2xl border-2 ${
                    plan.highlight
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 bg-white'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Mais popular
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-slate-500 mb-4">{plan.description}</p>
                    <div className="text-4xl font-bold text-slate-900">{plan.price}</div>
                    {plan.price !== "Sob consulta" && (
                      <div className="text-slate-500">/mês</div>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-sky-500 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all ${
                      plan.highlight
                        ? 'bg-sky-500 hover:bg-sky-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                    }`}
                  >
                    Começar agora
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-sky-500 to-sky-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Pronto para transformar sua clínica?
            </h2>
            <p className="text-xl text-sky-100 mb-8">
              Comece seu teste grátis de 14 dias. Sem cartão de crédito.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-white text-sky-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-sky-50 transition-all hover:shadow-xl inline-flex items-center justify-center gap-2"
              >
                Começar teste grátis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="https://wa.me/5511999999999"
                className="bg-sky-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-sky-700 transition-all inline-flex items-center justify-center gap-2"
              >
                Falar com consultor
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-semibold">Axos Hub</span>
              </div>
              <p className="text-slate-400">
                Transformando a gestão de clínicas médicas no Brasil.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#funcionalidades" className="hover:text-white">Funcionalidades</a></li>
                <li><a href="#planos" className="hover:text-white">Planos</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Integrações</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carreiras</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white">Privacidade</a></li>
                <li><a href="#" className="hover:text-white">Termos</a></li>
                <li><a href="#" className="hover:text-white">Segurança</a></li>
                <li><a href="#" className="hover:text-white">LGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2025 Axos Hub. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}