-- Insert sample users
INSERT INTO users (id, email, name, preferences) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'user@example.com', 'Test User', '{
    "notifications": true,
    "voice_enabled": true,
    "timezone": "Europe/Moscow",
    "language": "ru"
  }'),
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@example.com', 'Admin User', '{
    "notifications": true,
    "voice_enabled": true,
    "timezone": "UTC",
    "language": "en"
  }');

-- Insert sample reminders
INSERT INTO reminders (user_id, original_text, text, category, datetime, priority) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Напомни завтра в 9 утра о встрече', 'Встреча', 'meeting', '2024-01-15 09:00:00+00', 'high'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Купить молоко в магазине', 'Купить молоко', 'shopping', NULL, 'medium'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Позвонить врачу на следующей неделе', 'Позвонить врачу', 'health', '2024-01-20 10:00:00+00', 'high');

-- Insert sample location-based reminder
INSERT INTO reminders (user_id, original_text, text, category, location, priority, conditions) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 
   'Напомни купить хлеб когда буду рядом с магазином', 
   'Купить хлеб', 
   'shopping', 
   '{"name": "Магазин", "latitude": 55.7558, "longitude": 37.6176, "radius": 100}',
   'medium',
   '{"type": "location", "active": true}'
  );
