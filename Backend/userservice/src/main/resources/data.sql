INSERT INTO users (id, created_at, email, first_name, hospital_id, is_enabled,
                   last_name, password, role, updated_at, username)
VALUES (1, NOW(), 'admin@gmail.com', 'Admin', NULL, true,
        'Saheb', '$2a$10$tW2CDix3Yj8ZRuk4vN7WUuqnohZBFyPIFVn1kVnssNnYqyF987Aa.',
        'ADMIN', NOW(), 'admin') ON CONFLICT (id) DO NOTHING;

-- Fix the auto-increment sequence to start AFTER your inserted admin
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));