-- Function to get the number of new patients per month
CREATE OR REPLACE FUNCTION get_new_patients_per_month()
RETURNS TABLE(month TEXT, new_patients_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(created_at, 'YYYY-MM') AS month,
    COUNT(id) AS new_patients_count
  FROM
    patients
  GROUP BY
    TO_CHAR(created_at, 'YYYY-MM')
  ORDER BY
    month;
END;
$$ LANGUAGE plpgsql;

-- Function to get the total revenue per month
CREATE OR REPLACE FUNCTION get_monthly_revenue()
RETURNS TABLE(month TEXT, total_revenue NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(payment_date, 'YYYY-MM') AS month,
    SUM(amount_paid) AS total_revenue
  FROM
    payments
  GROUP BY
    TO_CHAR(payment_date, 'YYYY-MM')
  ORDER BY
    month;
END;
$$ LANGUAGE plpgsql;
