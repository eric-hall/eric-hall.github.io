INSERT INTO Products (name, description, image_url, price, category_id)
VALUES
('AceYo Mercy 4', 'Competition-ready.', 'resources/images/yoyo1.png', 59.99,
(SELECT category_id FROM Categories WHERE name = 'yoyo')),
('OneDrop Terrarian', 'From Terraria!', 'resources/images/yoyo2.png', 34.99,
(SELECT category_id FROM Categories WHERE name = 'yoyo')),
('YJYOYO Time Slip', 'Perfect for intermediate players.', 'resources/images/yoyo3.png', 24.99,
(SELECT category_id FROM Categories WHERE name = 'yoyo')),
('YYF Godspeed', 'Great for learning new tricks.', 'resources/images/yoyo4.png', 19.99,
(SELECT category_id FROM Categories WHERE name = 'yoyo'));
