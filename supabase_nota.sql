-- Tabel untuk menyimpan kustomisasi nota (hasil edit)
CREATE TABLE IF NOT EXISTS public.nota_customizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    custom_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id)
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_nota_customizations_order_id ON public.nota_customizations(order_id);

-- Komentar tabel
COMMENT ON TABLE public.nota_customizations IS 'Menyimpan kustomisasi nota yang diedit manual (tidak mengubah data orderan asli)';
COMMENT ON COLUMN public.nota_customizations.custom_data IS 'JSONB berisi semua field nota yang dikustomisasi';