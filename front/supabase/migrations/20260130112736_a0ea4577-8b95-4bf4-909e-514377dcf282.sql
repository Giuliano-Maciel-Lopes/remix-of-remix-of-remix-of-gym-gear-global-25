-- =============================================================================
-- SISTEMA DE TRADING/IMPORTAÇÃO - SCHEMA COMPLETO
-- =============================================================================

-- 1. CRIAR ENUMS
-- =============================================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.currency_type AS ENUM ('USD', 'CNY', 'EUR', 'BRL', 'ARS');
CREATE TYPE public.incoterm_type AS ENUM ('FOB', 'CIF', 'EXW', 'DDP');
CREATE TYPE public.destination_country AS ENUM ('US', 'AR', 'BR');
CREATE TYPE public.container_type AS ENUM ('20FT', '40FT', '40HC');
CREATE TYPE public.quote_status AS ENUM ('draft', 'pending', 'approved', 'ordered', 'cancelled');
CREATE TYPE public.equipment_category AS ENUM ('Cardio', 'Strength', 'Free Weights', 'Benches', 'Accessories', 'Functional');

-- 2. CRIAR TABELA DE ROLES (CRÍTICO PARA SEGURANÇA)
-- =============================================================================

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. FUNÇÃO DE SEGURANÇA PARA VERIFICAR ROLE
-- =============================================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Função helper para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 4. TABELA DE CLIENTES
-- =============================================================================

CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'BR',
    default_currency currency_type NOT NULL DEFAULT 'USD',
    contact_email TEXT,
    contact_phone TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 5. TABELA DE FORNECEDORES
-- =============================================================================

CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'CN',
    default_currency currency_type NOT NULL DEFAULT 'USD',
    incoterm_default incoterm_type NOT NULL DEFAULT 'FOB',
    lead_time_days INTEGER NOT NULL DEFAULT 30,
    contact_email TEXT,
    contact_phone TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- 6. TABELA DE CATÁLOGO
-- =============================================================================

CREATE TABLE public.catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category equipment_category NOT NULL DEFAULT 'Cardio',
    description TEXT,
    unit_cbm NUMERIC(10,4) NOT NULL DEFAULT 0,
    unit_weight_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
    hs_code TEXT,
    ncm_code TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;

-- 7. TABELA DE SKU MAPPING
-- =============================================================================

CREATE TABLE public.sku_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    supplier_model_code TEXT NOT NULL,
    catalog_item_id UUID REFERENCES public.catalog_items(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (supplier_id, supplier_model_code)
);

ALTER TABLE public.sku_mapping ENABLE ROW LEVEL SECURITY;

-- 8. TABELA DE PREÇOS DOS FORNECEDORES
-- =============================================================================

CREATE TABLE public.supplier_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    catalog_item_id UUID NOT NULL REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    price_fob_usd NUMERIC(12,2) NOT NULL,
    currency_original currency_type NOT NULL DEFAULT 'USD',
    price_original NUMERIC(12,2) NOT NULL,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    moq INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (supplier_id, catalog_item_id, valid_from)
);

ALTER TABLE public.supplier_prices ENABLE ROW LEVEL SECURITY;

-- 9. TABELA DE QUOTES (PEDIDOS)
-- =============================================================================

CREATE TABLE public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    status quote_status NOT NULL DEFAULT 'draft',
    destination_country destination_country NOT NULL DEFAULT 'BR',
    container_type container_type NOT NULL DEFAULT '40HC',
    container_qty_override INTEGER,
    freight_per_container_usd NUMERIC(12,2) NOT NULL DEFAULT 3500,
    insurance_rate NUMERIC(6,4) NOT NULL DEFAULT 0.005,
    fixed_costs_usd NUMERIC(12,2) NOT NULL DEFAULT 500,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- 10. TABELA DE QUOTE LINES (ITENS DO PEDIDO)
-- =============================================================================

CREATE TABLE public.quote_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    catalog_item_id UUID NOT NULL REFERENCES public.catalog_items(id) ON DELETE CASCADE,
    qty INTEGER NOT NULL DEFAULT 1,
    chosen_supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    override_price_fob_usd NUMERIC(12,2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_lines ENABLE ROW LEVEL SECURITY;

-- 11. TRIGGER PARA ATUALIZAR updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_catalog_items_updated_at BEFORE UPDATE ON public.catalog_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sku_mapping_updated_at BEFORE UPDATE ON public.sku_mapping FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supplier_prices_updated_at BEFORE UPDATE ON public.supplier_prices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quote_lines_updated_at BEFORE UPDATE ON public.quote_lines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. POLÍTICAS RLS
-- =============================================================================

-- user_roles: apenas admins podem gerenciar, usuários podem ver seu próprio role
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.is_admin());

-- clients: todos autenticados podem ver, apenas admins podem modificar
CREATE POLICY "Authenticated users can view clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update clients" ON public.clients FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete clients" ON public.clients FOR DELETE TO authenticated USING (public.is_admin());

-- suppliers: todos autenticados podem ver, apenas admins podem modificar
CREATE POLICY "Authenticated users can view suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert suppliers" ON public.suppliers FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update suppliers" ON public.suppliers FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete suppliers" ON public.suppliers FOR DELETE TO authenticated USING (public.is_admin());

-- catalog_items: todos autenticados podem ver, apenas admins podem modificar
CREATE POLICY "Authenticated users can view catalog" ON public.catalog_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert catalog" ON public.catalog_items FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update catalog" ON public.catalog_items FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete catalog" ON public.catalog_items FOR DELETE TO authenticated USING (public.is_admin());

-- sku_mapping: todos autenticados podem ver, apenas admins podem modificar
CREATE POLICY "Authenticated users can view sku_mapping" ON public.sku_mapping FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert sku_mapping" ON public.sku_mapping FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update sku_mapping" ON public.sku_mapping FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete sku_mapping" ON public.sku_mapping FOR DELETE TO authenticated USING (public.is_admin());

-- supplier_prices: todos autenticados podem ver, apenas admins podem modificar
CREATE POLICY "Authenticated users can view prices" ON public.supplier_prices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert prices" ON public.supplier_prices FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update prices" ON public.supplier_prices FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete prices" ON public.supplier_prices FOR DELETE TO authenticated USING (public.is_admin());

-- quotes: usuários podem ver e criar seus próprios, admins podem tudo
CREATE POLICY "Users can view own quotes" ON public.quotes FOR SELECT TO authenticated USING (created_by = auth.uid() OR public.is_admin());
CREATE POLICY "Users can create quotes" ON public.quotes FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Admins can update quotes" ON public.quotes FOR UPDATE TO authenticated USING (public.is_admin() OR created_by = auth.uid());
CREATE POLICY "Admins can delete quotes" ON public.quotes FOR DELETE TO authenticated USING (public.is_admin());

-- quote_lines: seguem a mesma política do quote pai
CREATE POLICY "Users can view quote lines" ON public.quote_lines FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.quotes WHERE id = quote_id AND (created_by = auth.uid() OR public.is_admin())));
CREATE POLICY "Users can insert quote lines" ON public.quote_lines FOR INSERT TO authenticated 
    WITH CHECK (EXISTS (SELECT 1 FROM public.quotes WHERE id = quote_id AND (created_by = auth.uid() OR public.is_admin())));
CREATE POLICY "Users can update quote lines" ON public.quote_lines FOR UPDATE TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.quotes WHERE id = quote_id AND (created_by = auth.uid() OR public.is_admin())));
CREATE POLICY "Admins can delete quote lines" ON public.quote_lines FOR DELETE TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.quotes WHERE id = quote_id AND public.is_admin()));

-- 13. TRIGGER PARA CRIAR ROLE DE USUÁRIO AUTOMATICAMENTE
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. DADOS INICIAIS (MOCK DATA)
-- =============================================================================

-- Inserir itens de catálogo
INSERT INTO public.catalog_items (sku, name, category, description, unit_cbm, unit_weight_kg, hs_code, ncm_code) VALUES
('TRD-001', 'Esteira Profissional T900', 'Cardio', 'Esteira comercial com motor AC 5HP, inclinação automática até 20%', 1.2, 180, '9506.91', '9506.91.00'),
('BIK-001', 'Bicicleta Ergométrica B500', 'Cardio', 'Bicicleta vertical com console digital, 24 níveis de resistência', 0.45, 65, '9506.91', '9506.91.00'),
('HAL-001', 'Kit Halteres Emborrachados 2-40kg', 'Free Weights', 'Conjunto completo de halteres emborrachados com rack', 0.8, 420, '9506.91', '9506.91.00'),
('BEN-001', 'Banco de Musculação Ajustável', 'Benches', 'Banco ajustável com 7 posições, suporte para leg extension', 0.35, 45, '9506.91', '9506.91.00'),
('CRS-001', 'Cross Trainer Elíptico E700', 'Cardio', 'Elíptico comercial com stride 20", console touchscreen', 0.95, 120, '9506.91', '9506.91.00'),
('SMT-001', 'Smith Machine Pro', 'Strength', 'Smith machine com contrapeso, guias lineares de precisão', 2.1, 350, '9506.91', '9506.91.00'),
('CBL-001', 'Crossover Cable Machine', 'Strength', 'Crossover duplo com colunas de 100kg cada', 2.5, 450, '9506.91', '9506.91.00'),
('RCK-001', 'Power Rack Profissional', 'Strength', 'Rack com barras de segurança, suporte para pull-up', 1.8, 280, '9506.91', '9506.91.00'),
('ROW-001', 'Remo Indoor R400', 'Cardio', 'Remo com resistência a ar/magnética, monitor PM5', 0.55, 40, '9506.91', '9506.91.00'),
('ACC-001', 'Kit Acessórios Funcional', 'Accessories', 'Kettlebells, medicine balls, battle ropes, TRX', 0.6, 150, '9506.91', '9506.91.00');

-- Inserir fornecedores
INSERT INTO public.suppliers (name, country, default_currency, incoterm_default, lead_time_days) VALUES
('Shandong Fitness Equipment Co.', 'CN', 'USD', 'FOB', 45),
('Guangzhou Gym Factory', 'CN', 'USD', 'FOB', 40),
('Taiwan Sports Manufacturing', 'TW', 'USD', 'FOB', 35),
('USA Fitness Wholesale', 'US', 'USD', 'EXW', 14),
('European Gym Supply', 'DE', 'EUR', 'CIF', 30);

-- Inserir clientes
INSERT INTO public.clients (name, country, default_currency) VALUES
('Academia Smart Fit', 'BR', 'USD'),
('Gympass Argentina', 'AR', 'USD'),
('Fitness First Miami', 'US', 'USD'),
('Bio Ritmo São Paulo', 'BR', 'USD'),
('Megatlon Buenos Aires', 'AR', 'USD');

-- Inserir preços dos fornecedores
INSERT INTO public.supplier_prices (supplier_id, catalog_item_id, price_fob_usd, currency_original, price_original, valid_from)
SELECT 
    s.id,
    c.id,
    CASE 
        WHEN c.sku = 'TRD-001' THEN 1850 + (random() * 400)::int
        WHEN c.sku = 'BIK-001' THEN 450 + (random() * 150)::int
        WHEN c.sku = 'HAL-001' THEN 1200 + (random() * 300)::int
        WHEN c.sku = 'BEN-001' THEN 280 + (random() * 80)::int
        WHEN c.sku = 'CRS-001' THEN 980 + (random() * 250)::int
        WHEN c.sku = 'SMT-001' THEN 2200 + (random() * 500)::int
        WHEN c.sku = 'CBL-001' THEN 2800 + (random() * 600)::int
        WHEN c.sku = 'RCK-001' THEN 1100 + (random() * 300)::int
        WHEN c.sku = 'ROW-001' THEN 750 + (random() * 200)::int
        WHEN c.sku = 'ACC-001' THEN 550 + (random() * 150)::int
        ELSE 500
    END,
    'USD',
    CASE 
        WHEN c.sku = 'TRD-001' THEN 1850 + (random() * 400)::int
        WHEN c.sku = 'BIK-001' THEN 450 + (random() * 150)::int
        WHEN c.sku = 'HAL-001' THEN 1200 + (random() * 300)::int
        WHEN c.sku = 'BEN-001' THEN 280 + (random() * 80)::int
        WHEN c.sku = 'CRS-001' THEN 980 + (random() * 250)::int
        WHEN c.sku = 'SMT-001' THEN 2200 + (random() * 500)::int
        WHEN c.sku = 'CBL-001' THEN 2800 + (random() * 600)::int
        WHEN c.sku = 'RCK-001' THEN 1100 + (random() * 300)::int
        WHEN c.sku = 'ROW-001' THEN 750 + (random() * 200)::int
        WHEN c.sku = 'ACC-001' THEN 550 + (random() * 150)::int
        ELSE 500
    END,
    CURRENT_DATE
FROM public.suppliers s
CROSS JOIN public.catalog_items c
WHERE s.name IN ('Shandong Fitness Equipment Co.', 'Guangzhou Gym Factory', 'Taiwan Sports Manufacturing');

-- Inserir SKU mappings
INSERT INTO public.sku_mapping (supplier_id, supplier_model_code, catalog_item_id, notes)
SELECT 
    s.id,
    CASE 
        WHEN c.sku = 'TRD-001' THEN 'SD-TREAD-900'
        WHEN c.sku = 'BIK-001' THEN 'SD-BIKE-500'
        WHEN c.sku = 'HAL-001' THEN 'SD-DUMB-SET'
        WHEN c.sku = 'BEN-001' THEN 'SD-BENCH-ADJ'
        WHEN c.sku = 'CRS-001' THEN 'SD-ELLIP-700'
        WHEN c.sku = 'SMT-001' THEN 'SD-SMITH-PRO'
        WHEN c.sku = 'CBL-001' THEN 'SD-CABLE-X2'
        WHEN c.sku = 'RCK-001' THEN 'SD-RACK-PRO'
        WHEN c.sku = 'ROW-001' THEN 'SD-ROWER-400'
        WHEN c.sku = 'ACC-001' THEN 'SD-FUNC-KIT'
        ELSE 'SD-UNKNOWN'
    END || '-' || s.name,
    c.id,
    'Mapeamento automático'
FROM public.suppliers s
CROSS JOIN public.catalog_items c
WHERE s.name = 'Shandong Fitness Equipment Co.';