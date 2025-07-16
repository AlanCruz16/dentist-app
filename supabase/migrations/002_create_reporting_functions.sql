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

-- Function to get the total revenue for a specific month
CREATE OR REPLACE FUNCTION get_monthly_revenue(p_year INT, p_month INT)
RETURNS NUMERIC AS $$
DECLARE
  total_revenue NUMERIC;
BEGIN
  SELECT
    COALESCE(SUM(amount_paid), 0) INTO total_revenue
  FROM
    payments
  WHERE
    EXTRACT(YEAR FROM payment_date) = p_year AND
    EXTRACT(MONTH FROM payment_date) = p_month;

  RETURN total_revenue;
END;
$$ LANGUAGE plpgsql;
