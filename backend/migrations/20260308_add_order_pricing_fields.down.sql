ALTER TABLE orders
  DROP COLUMN IF EXISTS applied_promotions_json,
  DROP COLUMN IF EXISTS final_amount,
  DROP COLUMN IF EXISTS loyalty_earned_points,
  DROP COLUMN IF EXISTS loyalty_redeemed_amount,
  DROP COLUMN IF EXISTS loyalty_redeemed_points,
  DROP COLUMN IF EXISTS promotion_discount_total,
  DROP COLUMN IF EXISTS discount_total;
