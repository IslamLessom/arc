#!/bin/sh
set -e

echo "🚀 Starting ARC Backend..."

# Ждем готовности базы данных
echo "⏳ Waiting for database to be ready..."
max_attempts=30
attempt=0
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
  attempt=$((attempt + 1))
  if [ $attempt -ge $max_attempts ]; then
    echo "❌ Database is not ready after $max_attempts attempts. Exiting."
    exit 1
  fi
  echo "Database is unavailable - sleeping (attempt $attempt/$max_attempts)"
  sleep 2
done

echo "✅ Database is ready!"

# Запускаем seed скрипт для ролей и подписок
echo "🌱 Seeding roles and subscriptions..."
if ./seed_roles_and_subscriptions; then
  echo "✅ Roles and subscriptions seeded successfully"
else
  echo "⚠️  Warning: Failed to seed roles and subscriptions, but continuing..."
fi

# Запускаем seed скрипт для onboarding questions
echo "🌱 Seeding onboarding questions..."
if ./seed_onboarding_questions; then
  echo "✅ Onboarding questions seeded successfully"
else
  echo "⚠️  Warning: Failed to seed onboarding questions, but continuing..."
fi

# Запускаем seed скрипт для типов счетов
echo "🌱 Seeding account types..."
if ./seed_account_types; then
  echo "✅ Account types seeded successfully"
else
  echo "⚠️  Warning: Failed to seed account types, but continuing..."
fi

# Запускаем основное приложение
echo "🚀 Starting application..."
exec ./main

