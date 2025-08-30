-- STEP 6: Create trigger for auto-generating tracking numbers on new orders
-- Run this last

CREATE OR REPLACE FUNCTION set_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_number IS NULL THEN
    NEW.tracking_number := 'TW' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Ensure uniqueness (retry if duplicate)
    WHILE EXISTS (SELECT 1 FROM orders WHERE tracking_number = NEW.tracking_number) LOOP
      NEW.tracking_number := 'TW' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS orders_set_tracking_number ON orders;

-- Create the trigger
CREATE TRIGGER orders_set_tracking_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_tracking_number();
