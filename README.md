# AuraStore: Admin & Customer Authentication & Live Catalog Setup Guide

This guide walks you through setting up real password authentication with role-separated portals for Customers and Administrators, publishing products directly to PostgreSQL from the Admin portal, and displaying live catalog updates on the customer storefront.

## Architecture Overview

```
                      ┌─────────────────────────────────────────┐
                      │            PostgreSQL Database          │
                      │  - users (id, name, email, role, pwd)   │
                      │  - products (id, name, price, stock)    │
                      │  - orders & order_items                 │
                      └────────────────────┬────────────────────┘
                                           │
                       REST API (/api/auth, /api/products)
                                           │
                      ┌────────────────────┴────────────────────┐
                      │              Express Backend            │
                      │  - bcrypt password verification         │
                      │  - JWT token generation & role checks   │
                      │  - Transactional inventory management   │
                      └────────────────────┬────────────────────┘
                                           │
                        Separated Frontend Access Portals
                                           │
             ┌─────────────────────────────┴─────────────────────────────┐
             ▼                                                           ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│        Customer Portal        │               │         Admin Portal          │
│ - Email/Password Registration │               │ - Administrator Login Only    │
│ - Browse Live Catalog         │               │ - Publish New SKUs to DB      │
│ - Cart & Checkout             │               │ - Real-time Stock Adjustments │
│ - Order History Receipts      │               │ - Delete / Deprecate SKUs     │
└───────────────────────────────┘               └───────────────────────────────┘
```

## 1. Setting Up the Administrator Account

To establish a verified administrator in PostgreSQL with your password, run the included CLI provisioning utility:

```powershell
cd "C:\New folder (2)\aurastore_project\backend"
node config/createAdmin.js admin@aurastore.com Postgre1234 "Store Administrator"
```

### What This Does:

1. Connects to your PostgreSQL `aurastore` database using your database password (`Postgre1234`).
2. Checks if an account with `admin@aurastore.com` exists.
3. Generates a cryptographic salt and hashes `Postgre1234` with 10 bcrypt salt rounds.
4. Inserts the record into the `users` table with `role = 'admin'`.

*(You can also use this command to create multiple administrator accounts with custom emails and passwords).*

## 2. Customer vs. Administrator Separated Authentication

The frontend navigation bar includes dedicated authentication access points:

### A. Customer Sign In & Registration

1. In the header, click **Sign In**.
2. **Existing Customers**: Enter email and password and click **Sign In as Customer**.
3. **New Customers**: Switch to the **Sign Up** tab, enter Full Name, Email, and Password, and click **Complete Registration**.
4. Upon successful authentication:
   * A signed JWT token is stored in `localStorage`.
   * The user profile header displays the customer's name with a blue `CUSTOMER` badge.
   * **My Orders** and the active **Cart** drawer become accessible.

### B. Administrator Portal Access

1. In the header, click the dark **Admin Portal** button.
2. Enter your admin email (`admin@aurastore.com`) and password (`Postgre1234`).
3. Click **Sign In to Admin Console**.
4. **Role Enforcement**:
   * The backend validates the password and verifies `user.role === 'admin'`.
   * If a customer tries to log in through the Admin Portal, access is rejected with `Access denied: Administrator privileges required`.
5. Upon successful admin login:
   * The header displays an administrative badge (`ADMINISTRATOR`).
   * The **⚡ Admin SKU Portal** button unlocks on the navigation bar.

## 3. Adding Products from the Admin Portal to PostgreSQL

1. Click **⚡ Admin SKU Portal** in the navigation bar.
2. In the **Publish New Product SKU to Store** section, fill in:
   * **Product Name**: e.g., `Aura Pro Mechanical Keyboard`
   * **Brand**: e.g., `AuraGaming`
   * **Category**: `Electronics` or `Gaming`
   * **Price ($)**: `129.99`
   * **Initial Stock**: `30`
   * **Description**: `RGB mechanical gaming keyboard with hot-swappable switches.`
3. Click **+ Publish SKU to Store**.
4. **Backend Flow**:
   * The frontend issues an authenticated `POST /api/products` request containing the bearer token.
   * The backend validates administrative privileges (`admin` middleware).
   * The product record is inserted into the PostgreSQL `products` table.
   * A success alert confirms the product is saved and the live SKU inventory table refreshes.

## 4. Live Display on the Customer Storefront

1. In the navigation bar, click **Catalog** (or log out and browse as a Customer or Guest).
2. **Dynamic Synchronization**:
   * `HomeScreen.js` sends a `GET /api/products` request to PostgreSQL upon mounting.
   * The newly published product (`Aura Pro Mechanical Keyboard`) appears in the product grid with its live price, category badge, and stock count (`In Stock (30)`).
   * Search queries and category filters dynamically filter against both pre-existing and newly added items.

## 5. Live Checkout & Inventory Stock Decrement

1. Click **Add to Cart** on the new product.
2. Open the **Cart** drawer and click **Proceed to Checkout**.
3. The backend executes an atomic PostgreSQL transaction:
   * Verifies available stock for the item.
   * Automatically decrements the `count_in_stock` in PostgreSQL from `30` to `29`.
   * Creates an immutable order receipt in `orders` and `order_items`.
4. Return to the **Admin SKU Portal**:
   * The **Live Inventory** column immediately reflects `29 units` remaining.
   * Administrators can use the **+5 Stock** or **-1 Stock** buttons to adjust stock in the database at any time.

## 6. Verifying Data in PostgreSQL

You can inspect the live relational records directly inside **SQL Shell (psql)**:

```sql
\c aurastore

-- View registered users and roles
SELECT id, name, email, role, created_at FROM users;

-- View catalog products and live stock counts
SELECT id, name, category, price, count_in_stock FROM products;

-- View customer checkout receipts
SELECT id, user_id, items_price, tax_price, total_price, created_at FROM orders;
```