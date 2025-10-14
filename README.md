# Система Бронирования Мест (Node.js/TypeScript/PostgreSQL)

Это API для бронирования мест на мероприятие. Основная бизнес-логика реализована с использованием транзакций PostgreSQL и уникальных индексов для предотвращения двойного бронирования (один пользователь — одно место на событие).

## 🚀 Стек Технологий

* **Сервер:** Node.js
* **Язык:** TypeScript
* **Фреймворк:** Express.js
* **База данных:** PostgreSQL
* **Клиент БД:** `node-postgres (pg)`

## 📋 Требования

Для запуска проекта необходимо установить следующее программное обеспечение:

1.  **Node.js** (версия 16 или выше)
2.  **npm** (Node Package Manager, поставляется с Node.js)
3.  **PostgreSQL** (версия 10 или выше)
4.  **SQL-клиент** (например, pgAdmin или psql) для начальной настройки БД.

## ⚙️ Настройка и Запуск Проекта

### 1. Клонирование Репозитория и Установка Зависимостей



-- Таблица событий
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_seats INT NOT NULL
);

-- Таблица бронирований
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL REFERENCES events(id),
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- !!! УНИКАЛЬНЫЙ ИНДЕКС !!!
-- Гарантирует, что связка (event_id, user_id) всегда уникальна.
ALTER TABLE bookings
ADD CONSTRAINT unique_user_event UNIQUE (event_id, user_id);

-- Добавление тестовых данных
INSERT INTO events (name, total_seats) VALUES
('Конференция Node.js', 100),
('Вебинар по TypeScript', 5); -->