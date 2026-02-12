export interface MDA {
    id: string; // uuid
    name: string;
    code: string | null;
}

export interface Project {
    project_id: string;
    mda_id: string; // uuid
    title: string;
    sector: string;
    lga: string;
    senatorial_district: string;
    location_text: string;
    start_date: string; // Date string
    end_date: string; // Date string
    approved_budget: number | string; // Numeric or string in CSV/JSON
    funding_source: string;
    contractor: string | null;
    status: string;
    created_at?: string;
    // Computed or joined fields
    mda?: string;
}

export interface ProgressUpdate {
    id: string; // uuid
    project_id: string;
    report_date: string;
    physical_progress_pct: number;
    stage: 'Execution' | 'Completed' | 'Planning' | 'Paused' | string;
    milestone_status: string;
    key_update: string;
    issue_flag: string | null;
    evidence_link: string | null;
    created_at?: string;
}

export interface UserProfile {
    id: string; // uuid, references auth.users
    mda_id: string | null; // uuid
    full_name: string;
    role: 'super_user' | 'approver' | 'user' | null;
}

export interface FinanceRecord {
    id: string; // uuid
    project_id: string;
    budget_year: number;
    release_to_date: number | string;
    payments_to_date: number | string;
}

export interface Issue {
    id: string; // uuid
    project_id: string;
    log_date: string;
    issue_type: string;
    severity: number;
    owner: string;
    due_date: string;
    status: 'Open' | 'Closed' | 'Resolved' | string;
    notes: string;
    follow_up: string | null;
}

export type Database = {
    public: {
        Tables: {
            mdas: {
                Row: MDA;
                Insert: Omit<MDA, 'id'>;
                Update: Partial<Omit<MDA, 'id'>>;
            };
            projects: {
                Row: Project;
                Insert: Omit<Project, 'created_at'>;
                Update: Partial<Omit<Project, 'created_at'>>;
            };
            progress_updates: {
                Row: ProgressUpdate;
                Insert: Omit<ProgressUpdate, 'id' | 'created_at'>;
                Update: Partial<Omit<ProgressUpdate, 'id' | 'created_at'>>;
            };
            profiles: {
                Row: UserProfile;
                Insert: Omit<UserProfile, 'id'>; // ID usually comes from Auth
                Update: Partial<Omit<UserProfile, 'id'>>;
            };
            finance: {
                Row: FinanceRecord;
                Insert: Omit<FinanceRecord, 'id'>;
                Update: Partial<Omit<FinanceRecord, 'id'>>;
            };
            issues: {
                Row: Issue;
                Insert: Omit<Issue, 'id'>;
                Update: Partial<Omit<Issue, 'id'>>;
            };
        };
    };
};
