
export enum UserRole {
  OPERATOR = 'OPERATOR',
  TEAM_LEAD = 'TEAM_LEAD',
  HSE_MANAGER = 'HSE_MANAGER',
  DIRECTOR = 'DIRECTOR'
}

export enum ActionStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFIED = 'VERIFIED',
  CLOSED = 'CLOSED'
}

export enum MeetingType {
  DAILY_5 = 'DAILY_5',
  WEEKLY_15 = 'WEEKLY_15'
}

export enum MeetingSection {
  SAFETY = 'Sécurité',
  QUALITY = 'Qualité',
  COST = 'Coûts',
  DELIVERY = 'Délais',
  PEOPLE = 'Personnel'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface ActionItem {
  id: string;
  description: string;
  status: ActionStatus;
  assigneeId: string;
  dueDate: string; // ISO Date
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  meetingId?: string;
  area: string; // e.g., "Zone B2"
  department: string; // New field for classification (Maintenance, HSE, Prod...)
  proofImage?: string;
}

export interface Meeting {
  id: string;
  type: MeetingType;
  teamId: string;
  date: string;
  startTime: string;
  durationSeconds: number; // actual duration
  completed: boolean;
  attendees: string[]; // User IDs
  notes: {
    section: MeetingSection;
    text: string;
    hasIssue: boolean;
  }[];
  signature?: string; // Base64 signature
}

export interface Team {
  id: string;
  name: string;
  members: User[];
}

export interface DataPackage {
  id: string;
  generatedAt: string;
  meetingId: string;
  meetingType: MeetingType;
  summary: string; // Short summary or hash
  actionCount: number;
  syncStatus: 'SYNCED' | 'PENDING' | 'ERROR';
  sizeKb: number;
}

export interface AppSettings {
  enableVoiceInput: boolean;
  enableSectionTimer: boolean;
  enableAutoSave: boolean;
  enableKanbanDragDrop: boolean; // Future proofing
  onboardingSeen: boolean;
}

export interface DataExport {
  version: string;
  exportedAt: string;
  settings: AppSettings;
  actions: ActionItem[];
  meetings: Meeting[];
  packages: DataPackage[];
  themes: string[];
  departments: string[];
  teams: Team[];
  emailConfig: string;
}
