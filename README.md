# Ondo State PPIMU Analytics Dashboard

A secure, role-based analytics dashboard for monitoring state government projects, built with React, TypeScript, Tailwind CSS, and integrated with a high-performance NestJS + MariaDB backend.

---

## 🌟 Features

*   **Role-Based Access Control (RBAC):**
    *   **Engineer (`MDA_OFFICER`):** Manage assigned projects, view paginated progress submission history, submit new updates, and log project issues.
    *   **Chairman (`PPIMU_ADMIN`):** Review pending progress reports across all MDAs, request changes, and grant logical approvals.
    *   **Super User (`WEBMASTER_ADMIN`):** Full administrative controls over user accounts, MDAs, and government projects.
*   **JWT-Based Authentication**: Secure token-based session handling with standard headers and token auto-expiry redirection interceptors.
*   **Dual-Tab Engineer Dashboard**: Elegant glassmorphic tab layout separating active assigned projects list from the paginated submission history.
*   **Advanced Table Pagination**:
    *   Dynamic limit selection (25, 30, or 50 entries per page).
    *   Page jumping numbered button arrays with smart ellipsis truncation.
    *   Smooth transitions and micro-interaction row clicks that link history entries directly to project detailed modal cards.
*   **Flawless Backend Integration**: High-performance axios interceptor automatically converts backend camelCase Prisma models and relation conventions to standard frontend snake_case structures and plural relations.

---

## ⚙️ Prerequisites

*   Node.js (v18 or higher)
*   A running instance of the [NestJS Analytics API](../analytics-api) (Default port: `5000` or `3000`)

---

## 🛠️ Setup & Installation

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure environment variables:**
    Create a `.env` file in the root directory and specify the URL of your local NestJS backend server:
    ```env
    VITE_API_URL=http://localhost:5000
    ```

3.  **Run development server:**
    ```bash
    npm run dev
    ```

4.  **Build for production:**
    ```bash
    npm run build
    ```

---

## 📂 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/             # Core design system (Button, Card, Badge, Table, Modal)
│   ├── ProtectedRoute.tsx
│   ├── NewUserModal.tsx
│   ├── UpdateModal.tsx
│   └── ProjectDetailsModal.tsx
├── layouts/            # Layout wrappers
│   └── DashboardLayout.tsx
├── pages/              # Application views
│   ├── Login.tsx
│   ├── UserDashboard.tsx
│   ├── ApproverDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── Unauthorized.tsx
├── hooks/              # Custom data-fetching hooks (NestJS API compatible)
│   ├── useProjects.ts
│   ├── useReports.ts
│   ├── useAdmin.ts
│   ├── useProjectDetails.ts
│   └── useMdaHistory.ts # Paginated updates history hook
├── context/            # Global state (JWT Auth)
│   └── AuthContext.tsx
├── lib/                # API client configuration
│   └── api.ts          # Axios client with JWT & Case-Mapping interceptors
└── types/              # TypeScript definitions
    └── api.ts
```

---

## 📝 Available Routes

| Route | Description | Accessibility |
| :--- | :--- | :--- |
| `/` | **Login Page**: Entry point for all roles. | Public |
| `/dashboard` | **MDA Officer Dashboard**: For engineers to manage projects and submit updates. | Protected (`MDA_OFFICER`) |
| `/approvals` | **Approver Dashboard**: For chairmen to approve progress updates. | Protected (`PPIMU_ADMIN`) |
| `/admin` | **Admin Dashboard**: For Super Users to manage MDAs, Projects, and Users. | Protected (`WEBMASTER_ADMIN`) |
