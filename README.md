
# Ondo State PPIMU Analytics Dashboard

A secure, role-based analytics dashboard for monitoring state government projects, built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Role-Based Access Control (RBAC):**
  - **Engineer (User):** View assigned projects, report physical progress, and upload evidence.
  - **Chairman (Approver):** Review pending progress reports and approve them.
  - **Super User (Admin):** Manage system users, assign roles, and configure MDA settings.
- **Secure Authentication:** User management and session handling powered by Supabase Auth.
- **Dynamic Workflows:**
  - **Progress Updates:** Modal-based form for engineers to submit detailed reports (Percentage, Stage, Comments).
  - **Approval System:** One-click approval process for chairmen.
- **Modern UI/UX:**
  - Responsive "Governor's Dashboard" aesthetic with Ondo State branding.
  - interactive data tables with status badges.
  - Real-time feedback with loading states and toast notifications.

## Prerequisites

- Node.js (v18 or higher)
- Supabase Project with the following tables: `mdas`, `projects`, `progress_updates`, `profiles`.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <project_directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory with your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/             # Core design system (Button, Card, Badge, Table, Modal)
│   ├── ProtectedRoute.tsx
│   ├── NewUserModal.tsx
│   └── UpdateModal.tsx
├── layouts/            # Layout wrappers
│   └── DashboardLayout.tsx
├── pages/              # Application views
│   ├── Login.tsx
│   ├── UserDashboard.tsx
│   ├── ApproverDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── Unauthorized.tsx
├── hooks/              # Custom data fetching hooks
│   ├── useProjects.ts
│   ├── useReports.ts
│   └── useAdmin.ts
├── context/            # Global state (Auth)
│   └── AuthContext.tsx
├── lib/                # Supabase configuration
│   └── supabase.ts
└── types/              # TypeScript definitions
    └── supabase.ts
```

## Usage Workflows

### 1. Engineers (User)
- Log in to access the **My Projects** dashboard.
- View a list of projects assigned to your Ministry/Department/Agency (MDA).
- Click **"Update"** on a project to open the reporting modal.
- Enter the report date, physical progress (%), current stage, and comments.
- Submit the report for review.

### 2. Chairmen (Approver)
- Log in to access the **Approvals** dashboard.
- Review a list of pending progress reports from engineers in your MDA.
- Click **"Approve"** to validate a report. This updates the status to "Approved" in the system.

### 3. Super Users (Admin)
- Log in to access the **Admin Dashboard**.
- View all system users and their roles.
- specific actions:
  - **Add User:** Create new accounts for Engineers or Chairmen and assign them to specific MDAs.

## Available Routes

| Route | Description | Accessibility |
| :--- | :--- | :--- |
| `/` | **Login Page**: Entry point for all users. | Public |
| `/dashboard` | **User Dashboard**: For Engineers to view projects and report progress. | Protected (Role: User) |
| `/approvals` | **Approver Dashboard**: For Chairmen to review and approve reports. | Protected (Role: Approver) |
| `/admin` | **Admin Dashboard**: For Super Users to manage MDAs and Users. | Protected (Role: Super User) |

> **Note:** Accessing a protected route without the correct role will redirect you to the `/unauthorized` page.

## Deployment

To build the application for production:

```bash
npm run build
```

The output will be generated in the `dist` directory, ready to be deployed to any static host (Vercel, Netlify, etc.).
