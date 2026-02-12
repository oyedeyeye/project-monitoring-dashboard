# Ondo State PPIMU Analytics Dashboard

A secure, role-based analytics dashboard for monitoring state government projects, built with React, TypeScript, and Supabase.

## Features

- **Role-Based Access Control:**
  - **User (Engineer):** Update project progress, view assigned projects.
  - **Approver (Chairman):** Review and approve progress reports.
  - **Super User (Admin):** Manage users and MDAs.
- **Secure Authentication:** Integrated with Supabase Auth.
- **Real-time Updates:** Data is fetched directly from Supabase tables.
- **Modern UI:** "Governor's Dashboard" aesthetic with Ondo State branding.

## Prerequisites

- Node.js (v18 or higher)
- Supabase Project with the following tables: `mdas`, `projects`, `progress_updates`, `profiles`.

## Setup

1.  **Clone the repository** (if applicable).
2.  **Install dependencies:**
    ```bash
    npm install
    ```
