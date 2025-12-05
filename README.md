# 📸 Photo-Sync

**Photo-Sync** is a full-stack web application designed to connect **Clients** with **Photographers**. Clients can find photographers for photoshoots, and photographers can manage their portfolios and bookings.

This project utilizes a modern **Monorepo** structure with a **Laravel 12** backend and a **Vue.js 3 (TypeScript)** frontend.

---

## 🚀 Tech Stack & Architecture

This project uses a unique hybrid cloud architecture for development:

| Component | Technology | Hosting/Service |
| :--- | :--- | :--- |
| **Backend** | Laravel 12 (PHP 8.2+) | Google Cloud Shell |
| **Database** | PostgreSQL | Neon.tech (Serverless Postgres) |
| **Frontend** | Vue 3 + Pinia + TypeScript | Vercel |
| **Tunneling** | Ngrok | Connects Vercel to Cloud Shell |
| **Styling** | CSS / Vite | Native Vue Scoped CSS |

### 🔄 Data Flow
1. User visits the Frontend on **Vercel**.
2. Frontend makes API requests via **Ngrok**.
3. **Ngrok** tunnels the request to **Google Cloud Shell**.
4. **Laravel** processes the request and queries the **Neon Database**.

---

## 🛠️ Prerequisites

Before running the project, ensure you have:
*   **Node.js & npm** (Frontend)
*   **PHP & Composer** (Backend)
*   **PostgreSQL Driver** (`php-pgsql`)
*   **Ngrok** (For exposing the local backend)
*   A **Neon.tech** database connection string.

---

## ⚙️ Installation & Setup

### 1. Backend Setup (Laravel)

Navigate to the project root:

```bash
# 1. Install PHP dependencies
composer install

# 2. Copy the environment file
cp .env.example .env

# 3. Generate App Key
php artisan key:generate
```

**Configure Database:**
Open `.env` and configure your Neon PostgreSQL credentials:

```ini
DB_CONNECTION=pgsql
DB_HOST=ep-your-endpoint.us-east-2.aws.neon.tech
DB_PORT=5432
DB_DATABASE=neondb
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

**Run Migrations:**
```bash
php artisan migrate
```

### 2. Frontend Setup (Vue.js)

Navigate to the frontend directory:

```bash
cd frontend

# 1. Install Node dependencies
npm install
```

---

## 🏃‍♂️ Development Workflow (Daily Start-up)

Because the Backend is hosted on **Google Cloud Shell** (which sleeps when inactive) and the Frontend is on **Vercel**, you must follow this routine to start working:

### Step 1: Start the Backend
In your Cloud Shell terminal (Tab 1):
```bash
cd ~/photo-sync
php artisan serve --port=8000
```

### Step 2: Start the Tunnel
In a new terminal tab (Tab 2), expose port 8000:
```bash
~/ngrok http 8000
```
*Copy the forwarding URL (e.g., `https://a1b2-c3d4.ngrok-free.app`).*

### Step 3: Connect Frontend to Backend
1. Open `frontend/src/services/api.ts`.
2. Update the `API_URL` constant with your **new Ngrok URL**:
   ```typescript
   const API_URL = 'https://your-new-url.ngrok-free.app/api';
   ```
3. Commit and push the change to GitHub:
   ```bash
   git add .
   git commit -m "Update API URL"
   git push
   ```
   *Vercel will automatically redeploy the frontend with the new connection string.*

---

## 📂 Project Structure

```
photo-sync/
├── app/                 # Laravel Backend Logic (Controllers, Models)
├── config/              # App Configuration (CORS, Auth)
├── database/            # Migrations & Seeders
├── routes/              # API Routes (api.php)
├── frontend/            # Vue.js Frontend Application
│   ├── src/
│   │   ├── layouts/     # AuthLayout, MainLayout
│   │   ├── router/      # Vue Router Config
│   │   ├── services/    # Axios API Configuration
│   │   ├── stores/      # Pinia State Management (Auth)
│   │   ├── views/       # Pages (Login, Dashboard, etc.)
│   └── vercel.json      # Vercel Routing Configuration
└── ...
```

---

## ✨ Key Features

*   **Role-Based Authentication:**
    *   Secure Login/Registration using Laravel Sanctum.
    *   Separate logic for **Clients** and **Photographers**.
*   **Dynamic Dashboards:**
    *   Clients see a search interface.
    *   Photographers see portfolio management tools.
*   **Persistent State:**
    *   Users stay logged in on page refresh via Pinia + LocalStorage + API validation.
*   **Security:**
    *   Passwords hashed via Bcrypt.
    *   API tokens managed via Sanctum.
    *   CORS configured for secure cross-origin requests.

---

## ⚠️ Troubleshooting

**1. "Failed to fetch" or Network Error:**
*   Check if `php artisan serve` is running.
*   Check if `ngrok` is running.
*   Ensure the URL in `frontend/src/services/api.ts` matches the active Ngrok URL.
*   Ensure the URL has `https://`.

**2. 404 Not Found on Vercel Refresh:**
*   Ensure `frontend/vercel.json` exists with the rewrite rules.

**3. "Could not find driver" (Backend):**
*   If using Cloud Shell, the PHP Postgres driver might be missing after a restart. Run the customization script:
    ```bash
    sudo ./customize_environment
    ```

---

## 📝 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

