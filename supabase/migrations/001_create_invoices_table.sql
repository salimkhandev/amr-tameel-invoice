-- Create invoices table for customer QR code access
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  order_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'In Transit',
  qr_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Create index on created_at for sorting and FIFO cleanup
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- Enable Row Level Security (optional, remove if you want public access)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for QR code scanning)
CREATE POLICY "Allow public read access" ON invoices
  FOR SELECT
  TO public
  USING (true);

-- Create policy to allow service role to insert/update (server-side)
CREATE POLICY "Allow service role insert" ON invoices
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role update" ON invoices
  FOR UPDATE
  TO service_role
  WITH CHECK (true);

-- Create policy to allow service role delete (server-side)
CREATE POLICY "Allow service role delete" ON invoices
  FOR DELETE
  TO service_role
  USING (true);

-- Create a function to maintain maximum 50 invoices (FIFO cleanup)
CREATE OR REPLACE FUNCTION maintain_max_invoices()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the oldest invoice if count exceeds 50
  DELETE FROM invoices
  WHERE id IN (
    SELECT id FROM invoices
    ORDER BY created_at ASC
    LIMIT (
      SELECT GREATEST(0, COUNT(*) - 50)
      FROM invoices
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run the cleanup function after each insert
CREATE TRIGGER cleanup_old_invoices
AFTER INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION maintain_max_invoices();

-- Add comment to document the cleanup strategy
COMMENT ON TABLE invoices IS 'Stores invoice data for QR code customer access. Auto-cleanup maintains max 50 invoices using FIFO (oldest deleted when count exceeds 50).';