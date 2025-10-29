-- Insert default navigation menus
INSERT INTO navigation_menus (title, url, parent_id, sort_order, is_active, target, icon, created_at, updated_at) VALUES
('e-Dönüşüm', '#', NULL, 1, 1, '_self', NULL, datetime('now'), datetime('now')),
('Finansal Servisler', '#', NULL, 2, 1, '_self', NULL, datetime('now'), datetime('now')),
('Blog', '#', NULL, 3, 1, '_self', NULL, datetime('now'), datetime('now')),
('Destek', '#', NULL, 4, 1, '_self', NULL, datetime('now'), datetime('now')),
('Referanslar', '#', NULL, 5, 1, '_self', NULL, datetime('now'), datetime('now')),
('İletişim', '#', NULL, 6, 1, '_self', NULL, datetime('now'), datetime('now'));