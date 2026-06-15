# Admin Dashboard — API Endpoints

This note documents the API surface required to power the **WEBMASTER ADMIN**
analytics overview (`/admin`). The same contracts are reused by the PPIMU admin
and agency (MDA) staff dashboards, scoped by the caller's role/MDA.

> **Key principle:** the frontend renders **pre-computed** values only. All
> counting, percentage math, rollups, and status derivation happen on the
> backend. The shapes below mirror the TypeScript types in
> `src/types/dashboard.ts`.

All endpoints require `Authorization: Bearer <JWT>`. Role scoping:

| Role             | Scope of returned data                          |
| ---------------- | ----------------------------------------------- |
| `WEBMASTER_ADMIN`| All MDAs, all projects (state-wide)             |
| `PPIMU_ADMIN`    | All MDAs (oversight)                            |
| `MDA_OFFICER`    | Only the caller's `mdaId`                        |

---

## Recommended: single aggregated endpoint

### `GET /admin/dashboard`

Returns everything the overview needs in one round-trip. This is what the
`useDashboardOverview` hook calls; until it exists the hook falls back to
**clearly-marked placeholder data** (`src/lib/placeholderDashboard.ts`).

**Query params** (all optional)

| Param      | Type   | Description                                              |
| ---------- | ------ | -------------------------------------------------------- |
| `mdaId`    | uuid   | Restrict aggregates to one MDA (auto-applied for staff). |
| `period`   | string | Comparison window for deltas, e.g. `month` (default).    |

**Response `200`**

```jsonc
{
  "metrics": {
    "mdaCount": 26,           // COUNT(*) FROM mdas
    "projectCount": 1248,     // COUNT(*) FROM projects
    "inProgressCount": 753,   // projects whose latest stage is in-progress
    "inProgressPct": 60,      // round(inProgressCount / projectCount * 100)
    "avgProgress": 87,        // avg of latest physicalProgressPct per project
    "avgProgressDelta": 5     // avgProgress now − avgProgress previous period
  },
  "stageBreakdown": [         // powers the donut chart
    { "stage": "Execution",   "count": 642, "pct": 52 },
    { "stage": "Procurement", "count": 256, "pct": 21 },
    { "stage": "Planning",    "count": 198, "pct": 16 },
    { "stage": "Completed",   "count": 152, "pct": 11 }
  ],
  "recentProjects": [         // powers the Recent Projects list
    {
      "id": "uuid",
      "title": "Bridge Works Completion at Idoani, Ose LGA",
      "location": "Idoani, Ose LGA",
      "progress": 90,         // latest physicalProgressPct
      "stage": "Execution"
    }
  ],
  "issues": {                 // powers the Active Issues card
    "openCount": 18,          // COUNT(*) FROM issues WHERE status = 'Open'
    "trend": [                // recent activity series for the mini bar chart
      { "label": "Mon", "value": 4 },
      { "label": "Tue", "value": 7 }
    ]
  },
  "topMdas": [                // powers Projects by MDA (Top 5), sorted desc
    { "mdaName": "Min. of Works & Infra.", "count": 320 },
    { "mdaName": "Min. of Education",      "count": 210 }
  ],
  "lastUpdated": "2026-06-15T10:30:00.000Z"
}
```

**Powers:** every card on the dashboard (metric strip, donut, recent list,
issues card, MDA bar chart, footer timestamp).

---

## Alternative: granular endpoints

If a single aggregate is not desired, the same UI can be fed by the following
endpoints. Each maps to one section of the dashboard.

### `GET /admin/metrics`
Powers the **four KPI cards**.

```
→ { mdaCount, projectCount, inProgressCount, inProgressPct, avgProgress, avgProgressDelta }
```
- Backend work: `COUNT` on `mdas` and `projects`; classify each project by its
  latest `progress_updates.stage`; compute `AVG(physicalProgressPct)` over the
  latest update per project; compute the delta against the prior period.

### `GET /admin/projects/stage-breakdown`
Powers the **Projects by Stage donut**.

```
→ [ { stage, count, pct } ]
```
- Backend work: `GROUP BY` latest stage; `pct = round(count / total * 100)`.
  Stage enum normalized to: `Execution | Procurement | Planning | Completed`.

### `GET /admin/projects/recent`
Powers the **Recent Projects** list.

| Param   | Type   | Default | Description                          |
| ------- | ------ | ------- | ------------------------------------ |
| `limit` | number | 5       | Number of rows.                      |
| `mdaId` | uuid   | —       | Optional MDA filter.                 |

```
→ [ { id, title, location, progress, stage } ]
```
- Backend work: most recently updated projects; `progress` = latest
  `physicalProgressPct`; `stage` derived from latest progress update.

### `GET /admin/issues/summary`
Powers the **Active Issues** card.

| Param  | Type   | Default | Description                               |
| ------ | ------ | ------- | ----------------------------------------- |
| `days` | number | 7       | Length of the trend series.               |

```
→ { openCount, trend: [ { label, value } ] }
```
- Backend work: `COUNT(*) WHERE status = 'Open'`; bucket issue `logDate` by day
  for the trend series.

### `GET /admin/projects/by-mda`
Powers the **Projects by MDA (Top N)** bar chart.

| Param   | Type   | Default | Description                  |
| ------- | ------ | ------- | ---------------------------- |
| `limit` | number | 5       | Top-N MDAs by project count. |

```
→ [ { mdaName, count } ]   // sorted by count desc
```
- Backend work: `COUNT(projects) GROUP BY mdaId JOIN mdas`, order desc, limit N.

---

## Existing endpoints reused by the app (not the overview)

These already exist in the codebase (`src/hooks/*`) and remain unchanged:

| Method & path                          | Used by                  |
| -------------------------------------- | ------------------------ |
| `GET /users?limit=&page=`              | `useUsers`, `useAdmin`   |
| `GET /mdas`, `GET /mdas/:id`           | `useAdmin`, `AuthContext`|
| `GET /projects?page=&limit=&mdaId=`    | `useProjects`            |
| `GET /progress-updates?page=&limit=`   | `useReports`             |
| `PUT /progress-updates/:id/approve`    | `useReports`             |
| `PUT /progress-updates/:id/reject`     | `useReports`             |
| `POST|PATCH|DELETE /issues`            | `useIssues`              |
| `POST /auth/register`                  | `useAdmin`               |

---

## Backend computation summary

| Computation            | Source tables                          | Notes                                            |
| ---------------------- | -------------------------------------- | ------------------------------------------------ |
| Project counts         | `projects`                             | Total + grouped by latest stage.                 |
| Latest stage / progress| `progress_updates`                     | Use the most recent update per `projectId`.      |
| Avg. progress + delta  | `progress_updates`                     | AVG of latest progress; compare to prior period. |
| Open issues + trend    | `issues`                               | Filter `status = 'Open'`; bucket by `logDate`.   |
| Top MDAs               | `projects` ⋈ `mdas`                    | COUNT grouped by `mdaId`, sorted desc.           |
| `lastUpdated`          | aggregation job / `now()`              | When the rollup was computed.                    |

> **Placeholder note:** `src/lib/placeholderDashboard.ts` contains realistic but
> **fake** values matching the response shape above. It is only used as a
> fallback while the endpoint is unavailable and should be removed once the live
> API is wired up.
