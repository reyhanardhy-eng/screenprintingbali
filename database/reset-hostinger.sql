-- FULL RESET: permanently deletes every existing app table in this Hostinger DB.
-- Target is intentionally fixed to the approved database. Run only after the
-- user confirms this exact reset. Back up first if any table has rows.

USE `u621154993_spbprod`;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS
  app_sessions,
  app_users,
  bag_sizes,
  conversations,
  cuts,
  design_sizes,
  fabrics,
  login_attempts,
  messages,
  portfolio_items,
  print_methods,
  products;

SET FOREIGN_KEY_CHECKS = 1;
