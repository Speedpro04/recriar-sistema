-- =============================================
-- FIX: Corrigir RLS recursiva na tabela users
-- O erro "infinite recursion detected in policy for relation users"
-- ocorre porque as policies de 'users' fazem subquery na própria 'users'
-- 
-- SOLUÇÃO: Usar auth.uid() com clinics.owner_auth_id (sem recursão)
-- =============================================

-- 1. Remover políticas recursivas
DROP POLICY IF EXISTS "users_same_clinic" ON users;
DROP POLICY IF EXISTS "users_owner_manage" ON users;
DROP POLICY IF EXISTS "users_self_insert" ON users;

-- 2. Recriar políticas SEM recursão

-- Leitura: usuário vê a si mesmo + membros da mesma clínica (via clinics)
CREATE POLICY "users_read_own" ON users FOR SELECT USING (
    auth_id = auth.uid()
    OR clinic_id IN (
        SELECT id FROM clinics WHERE owner_auth_id = auth.uid()
    )
);

-- Insert: qualquer autenticado pode se inserir (onboarding)
CREATE POLICY "users_insert_auth" ON users FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
);

-- Update/Delete: apenas owner da clínica (via clinics, sem recursão)
CREATE POLICY "users_owner_manage" ON users FOR UPDATE USING (
    clinic_id IN (
        SELECT id FROM clinics WHERE owner_auth_id = auth.uid()
    )
);

CREATE POLICY "users_owner_delete" ON users FOR DELETE USING (
    clinic_id IN (
        SELECT id FROM clinics WHERE owner_auth_id = auth.uid()
    )
);

-- =============================================
-- FIM DO FIX
-- =============================================
