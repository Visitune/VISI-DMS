
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
  email?: string;
  phone?: string;
}

// Pièce jointe (image, document, PDF)
export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'pdf';
  url: string;  // base64 ou URL
  uploadedAt: string;
  size: number;  // taille en bytes
}

// Commentaire sur une action
export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

// Action item améliorée avec support complet
export interface ActionItem {
  id: string;
  description: string;
  status: ActionStatus;
  assigneeId: string;
  dueDate: string; // ISO Date
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  updatedAt: string;
  meetingId?: string;
  area: string; // e.g., "Zone B2"
  department: string; // Classification (Maintenance, HSE, Prod...)
  category?: string;  // Type d'action (Sécurité, Qualité, Maintenance...)
  location?: string;  // Localisation détaillée
  tags?: string[];     // Tags pour filtrage
  attachments: Attachment[];  // Multiple fichiers/photos
  comments: Comment[];  // Commentaires
  proofImage?: string;  // Image de preuve (legacy - prefer attachments)
  completedAt?: string; // Date de completion
  verifiedBy?: string;  // Qui a vérifié
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
  actionIds?: string[]; // IDs des actions créées pendant la réunion
}

export interface Team {
  id: string;
  name: string;
  members: User[];
  leaderId?: string;  // ID du responsable de l'équipe
  createdAt?: string;
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
  defaultPriority: 'HIGH' | 'MEDIUM' | 'LOW';
  defaultDepartment: string;
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

// Catégories d'actions disponibles
export const ACTION_CATEGORIES = [
  'Sécurité',
  'Qualité',
  'Maintenance',
  'Production',
  'Environnement',
  'Logistique',
  'Organisation',
  'Formation',
  'Autre'
] as const;

// Tags prédéfinis pour les actions
export const ACTION_TAGS = [
  'Urgente',
  'Planifiée',
  'Récurrente',
  'Amélioration',
  'Conformité',
  'Audit',
  'Incendie',
  'EPI',
  '5S',
  'Ergonomie'
] as const;
