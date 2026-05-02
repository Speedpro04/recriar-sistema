# PRD - Axos Hub

## Visão Geral

**Axos Hub** é um SaaS de gestão para clínicas médicas que busca simplificar processos administrativos e melhorar a experiência de pacientes e profissionais.

---

## Problema

Clínicas médicas enfrentam:
- Processos manuais e burocráticos
- Falta de integração entre sistemas
- Dificuldade em agendar e gerenciar consultas
- Ausência de relatórios em tempo real
- Comunicação ineficiente com pacientes

---

## Solução

Plataforma completa que oferece:
- Agendamento inteligente de consultas
- Prontuário eletrônico integrado
- Gestão financeira automatizada
- Comunicação via WhatsApp
- Relatórios e dashboards em tempo real

---

## Público-Alvo

### Primário
- Clínicas médicas de pequeno e médio porte
- Centros de diagnóstico
- Consultórios multi-especialidades

### Secundário
- Profissionais autônomos
- Clínicas de grande porte (Enterprise)

---

## Funcionalidades Principais

### MVP (Mínimo Viável)
- [x] Landing page de conversão
- [x] Página de login
- [x] Dashboard com indicadores
- [ ] Cadastro de clínicas (multi-tenant)
- [ ] Agendamento de consultas
- [ ] Prontuário eletrônico básico
- [ ] Integração WhatsApp (lembretes)

### Backlog
- [ ] Gestão financeira completa
- [ ] Telemedicina
- [ ] App para pacientes
- [ ] Relatórios customizáveis
- [ ] Integração com convênios
- [ ] Prescrição digital

---

## Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Clínicas ativas | 500+ |
| Profissionais usando | 50K+ |
| Uptime | 99,9% |
| NPS | 70+ |
| Churn mensal | < 3% |

---

## Stack Tecnológico

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend
- FastAPI (Python)
- Supabase (PostgreSQL + Auth)
- Redis (cache/filas)
- Celery (tarefas assíncronas)
- Evolution API (WhatsApp)
- Stripe (pagamentos)

### Infraestrutura
- Docker + Docker Compose
- Nginx (reverse proxy + SSL)
- Supabase Cloud

---

## Modelo de Negócio

### Planos

| Plano | Preço | Profissionais |
|-------|-------|---------------|
| Starter | R$ 199/mês | Até 2 |
| Professional | R$ 399/mês | Até 5 |
| Enterprise | Sob consulta | Ilimitado |

### Revenue Share
- 10% sobre pagamentos processados (pacientes)

---

## Roadmap

### Fase 1 - Fundação (Atual)
- [x] Estrutura do projeto
- [x] Landing page
- [x] Login
- [x] Dashboard básico
- [x] Configuração backend

### Fase 2 - Core (Próximos 30 dias)
- [ ] Cadastro de clínicas
- [ ] Gestão de pacientes
- [ ] Agendamento
- [ ] Integração WhatsApp

### Fase 3 - Escala (60-90 dias)
- [ ] Gestão financeira
- [ ] Relatórios avançados
- [ ] API pública
- [ ] Mobile app

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Vazamento de dados | Criptografia, RLS, backups |
| Baixa adoção | Onboarding facilitado, suporte 24/7 |
| Concorrência | Foco em UX e atendimento |
| Compliance LGPD | Assessoria jurídica especializada |

---

## Contatos

- **Produto**: [a definir]
- **Tech Lead**: [a definir]
- **Design**: [a definir]

---

*Última atualização: 2026-05-02*
