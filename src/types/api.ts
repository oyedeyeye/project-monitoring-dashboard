export interface MDA {
  id: string; // uuid
  name: string;
  code: string | null;
}

export interface Project {
  projectId: string;
  mdaId: string; // uuid
  title: string;
  sector: string;
  lga: string;
  senatorialDistrict: string;
  locationText: string;
  startDate: string; // Date string
  endDate: string; // Date string
  approvedBudget: number | string; // Numeric or string in CSV/JSON
  fundingSource: string;
  contractor: string | null;
  status: string;
  createdAt?: string;
  // Computed or joined fields
  mda?: any;
}

export interface ProgressUpdate {
  id: string; // uuid
  projectId: string;
  reportDate: string;
  physicalProgressPct: number;
  stage: 'Yet to Start' | 'In-progress' | 'Paused' | 'Completed' | string;
  milestoneStatus: string;
  keyUpdate: string;
  issueFlag: string | null;
  evidenceLink: string | null;
  createdAt?: string;
  issues?: Issue[];
}

export interface UserProfile {
  id: string; // uuid
  mdaId: string | null; // uuid
  fullName: string;
  role: 'WEBMASTER_ADMIN' | 'PPIMU_ADMIN' | 'MDA_OFFICER' | null;
}

export interface FinanceRecord {
  id: string; // uuid
  projectId: string;
  budgetYear: number;
  releaseToDate: number | string;
  paymentsToDate: number | string;
}

export interface Issue {
  id: string; // uuid
  projectId: string;
  logDate: string;
  issueCategory: string;
  issueItem: string;
  severity: number;
  owner: string;
  dueDate: string;
  status: 'Open' | 'Closed' | 'Resolved' | string;
  notes: string;
  followUp: string | null;
  progressUpdateId?: string | null;
}

export interface Database {
  public: {
    Tables: {
      mdas: {
        Row: MDA;
        Insert: Omit<MDA, 'id'>;
        Update: Partial<Omit<MDA, 'id'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'createdAt'>;
        Update: Partial<Omit<Project, 'createdAt'>>;
      };
      progress_updates: {
        Row: ProgressUpdate;
        Insert: Omit<ProgressUpdate, 'id' | 'createdAt'>;
        Update: Partial<Omit<ProgressUpdate, 'id' | 'createdAt'>>;
      };
      profiles: {
        Row: UserProfile;
        Insert: UserProfile;
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
}
