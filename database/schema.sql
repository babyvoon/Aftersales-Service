-- ==========================================================
-- Aftersales Service & Maintenance Dashboard
-- Database Schema v1.0
-- MySQL 8+
-- ==========================================================

CREATE DATABASE IF NOT EXISTS aftersales_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aftersales_db;

-- ==========================================================
-- Table: users
-- Stores system users (Admins, Service Advisors, Mechanics)
-- ==========================================================
DROP TABLE IF EXISTS ticket_items;
DROP TABLE IF EXISTS service_tickets;
DROP TABLE IF EXISTS spare_parts;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50)     NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    role            VARCHAR(20)     NOT NULL,
    full_name       VARCHAR(100)    NOT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'SERVICE_ADVISOR', 'MECHANIC'))
) ENGINE=InnoDB;

CREATE INDEX idx_users_role ON users(role);

-- ==========================================================
-- Table: customers
-- Soft Delete enabled (deleted_at)
-- ==========================================================
CREATE TABLE customers (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(100)    NOT NULL,
    phone_number    VARCHAR(20)     NOT NULL,
    email           VARCHAR(100)    NULL,
    address         TEXT            NULL,
    deleted_at      TIMESTAMP       NULL DEFAULT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_customers_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE INDEX idx_customers_phone      ON customers(phone_number);
CREATE INDEX idx_customers_deleted_at  ON customers(deleted_at);

-- ==========================================================
-- Table: vehicles
-- Soft Delete enabled (deleted_at)
-- One-to-Many: A customer can have multiple vehicles
-- ==========================================================
CREATE TABLE vehicles (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    customer_id     BIGINT          NOT NULL,
    license_plate   VARCHAR(20)     NOT NULL,
    vin_number      VARCHAR(17)     NOT NULL,
    brand           VARCHAR(50)     NOT NULL,
    model           VARCHAR(50)     NOT NULL,
    year            INT             NOT NULL,
    deleted_at      TIMESTAMP       NULL DEFAULT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_vehicles_license_plate UNIQUE (license_plate),
    CONSTRAINT uq_vehicles_vin_number    UNIQUE (vin_number),
    CONSTRAINT fk_vehicles_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_vehicles_customer_id  ON vehicles(customer_id);
CREATE INDEX idx_vehicles_deleted_at   ON vehicles(deleted_at);

-- ==========================================================
-- Table: spare_parts
-- Inventory of spare parts with pricing and stock tracking
-- ==========================================================
CREATE TABLE spare_parts (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    part_number     VARCHAR(50)     NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    description     TEXT            NULL,
    unit_price      DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
    stock_quantity  INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_spare_parts_part_number UNIQUE (part_number),
    CONSTRAINT chk_spare_parts_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_spare_parts_stock      CHECK (stock_quantity >= 0)
) ENGINE=InnoDB;

-- ==========================================================
-- Table: service_tickets
-- Soft Delete enabled (deleted_at)
-- Core workflow entity with status-based Kanban tracking
-- ==========================================================
CREATE TABLE service_tickets (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    vehicle_id      BIGINT          NOT NULL,
    user_id         BIGINT          NULL COMMENT 'Assigned mechanic',
    description     TEXT            NULL,
    status          VARCHAR(25)     NOT NULL DEFAULT 'PENDING',
    labor_cost      DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
    total_cost      DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
    deleted_at      TIMESTAMP       NULL DEFAULT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tickets_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    CONSTRAINT fk_tickets_user
        FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL,
    CONSTRAINT chk_tickets_status CHECK (
        status IN ('PENDING', 'IN_PROGRESS', 'WAITING_FOR_PARTS', 'COMPLETED', 'DELIVERED')
    ),
    CONSTRAINT chk_tickets_labor_cost CHECK (labor_cost >= 0),
    CONSTRAINT chk_tickets_total_cost CHECK (total_cost >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_tickets_vehicle_id  ON service_tickets(vehicle_id);
CREATE INDEX idx_tickets_user_id     ON service_tickets(user_id);
CREATE INDEX idx_tickets_status      ON service_tickets(status);
CREATE INDEX idx_tickets_deleted_at  ON service_tickets(deleted_at);
CREATE INDEX idx_tickets_created_at  ON service_tickets(created_at);

-- ==========================================================
-- Table: ticket_items
-- Many-to-Many resolution between service_tickets and spare_parts
-- ==========================================================
CREATE TABLE ticket_items (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    ticket_id       BIGINT          NOT NULL,
    part_id         BIGINT          NOT NULL,
    quantity        INT             NOT NULL DEFAULT 1,
    price_per_unit  DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
    subtotal        DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_ticket_items_ticket
        FOREIGN KEY (ticket_id) REFERENCES service_tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket_items_part
        FOREIGN KEY (part_id)   REFERENCES spare_parts(id)     ON DELETE RESTRICT,
    CONSTRAINT chk_ticket_items_quantity  CHECK (quantity > 0),
    CONSTRAINT chk_ticket_items_price     CHECK (price_per_unit >= 0),
    CONSTRAINT chk_ticket_items_subtotal  CHECK (subtotal >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_ticket_items_ticket_id ON ticket_items(ticket_id);
CREATE INDEX idx_ticket_items_part_id   ON ticket_items(part_id);
