CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY,
  store_id UUID NOT NULL,
  register_id UUID NOT NULL,
  sale_total INTEGER NOT NULL,
  cash_received INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pix_transfers (
  id UUID PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES sales(id),
  pix_key TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transaction_logs (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
