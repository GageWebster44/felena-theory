
-- 👤 Operators
insert into operators (id, alias, xp, role) values
('11111111-1111-1111-1111-111111111111', 'CipherFox', 3200, 'admin'),
('22222222-2222-2222-2222-222222222222', 'NovaX', 1800, 'user'),
('33333333-3333-3333-3333-333333333333', 'Specter', 950, 'user');

-- 🔓 CRT Unlocks
insert into crt_unlocks (operator_id, route, unlocked, unlocked_at) values
('11111111-1111-1111-1111-111111111111', '/simulator', true, now()),
('22222222-2222-2222-2222-222222222222', '/xp-shop', true, now()),
('33333333-3333-3333-3333-333333333333', '/game-room', true, now());

-- ⚙️ Engine Unlocks
insert into engine_unlocks (operator_id, engine_id, unlocked, activated, unlocked_at, last_activated) values
('11111111-1111-1111-1111-111111111111', 'SNUBNOSE', true, true, now(), now()),
('22222222-2222-2222-2222-222222222222', 'JARVIS', true, false, now(), null);

-- 💰 XP Transactions
insert into xp_transactions (operator_id, type, amount, metadata) values
('11111111-1111-1111-1111-111111111111', 'inject', 1500, '{"source":"admin"}'),
('22222222-2222-2222-2222-222222222222', 'win', 300, '{"game":"slot-machine"}'),
('33333333-3333-3333-3333-333333333333', 'loss', -200, '{"game":"roulette"}');

-- 🧪 Override Logs
insert into override_logs (operator_id, action, target, metadata) values
('11111111-1111-1111-1111-111111111111', 'inject_xp', 'CipherFox', '{"amount":1500}'),
('11111111-1111-1111-1111-111111111111', 'unlock_crt', '/simulator', '{"method":"manual"}');
