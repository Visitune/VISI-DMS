import { ActionItem, ActionStatus, DataPackage, Meeting, MeetingSection, MeetingType, Team, User, UserRole } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'Thomas Dupont', role: UserRole.TEAM_LEAD, avatar: 'https://i.pravatar.cc/150?u=u1' },
  { id: 'u2', name: 'Marie Curie', role: UserRole.HSE_MANAGER, avatar: 'https://i.pravatar.cc/150?u=u2' },
  { id: 'u3', name: 'Jean Reno', role: UserRole.OPERATOR, avatar: 'https://i.pravatar.cc/150?u=u3' },
  { id: 'u4', name: 'Sophie Marceau', role: UserRole.DIRECTOR, avatar: 'https://i.pravatar.cc/150?u=u4' },
  { id: 'u5', name: 'Luc Besson', role: UserRole.OPERATOR, avatar: 'https://i.pravatar.cc/150?u=u5' },
];

export const TEAMS: Team[] = [
  { id: 't1', name: 'Équipe Matin - Prod A', members: [USERS[0], USERS[2], USERS[4]] },
  { id: 't2', name: 'Équipe Après-midi - Packaging', members: [USERS[0], USERS[2]] },
];

export const DEPARTMENTS = [
  "Maintenance",
  "Production",
  "HSE / Sécurité",
  "Qualité",
  "Logistique",
  "RH"
];

export const MOCK_ACTIONS: ActionItem[] = [
  {
    id: 'a1',
    description: 'Réparer le carter de protection machine 3',
    status: ActionStatus.OPEN,
    assigneeId: 'u1',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    priority: 'HIGH',
    createdAt: new Date(Date.now() - 100000).toISOString(),
    area: 'Zone A1',
    department: 'Maintenance',
    proofImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'a2',
    description: 'Encombrement allée piétonne (Palettes)',
    status: ActionStatus.IN_PROGRESS,
    assigneeId: 'u3',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    priority: 'MEDIUM',
    createdAt: new Date(Date.now() - 200000000).toISOString(),
    area: 'Zone B2',
    department: 'Logistique',
    proofImage: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'a3',
    description: 'Fuite huile chariot élévateur #4',
    status: ActionStatus.VERIFIED,
    assigneeId: 'u5',
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    priority: 'HIGH',
    createdAt: new Date(Date.now() - 500000000).toISOString(),
    area: 'Logistique',
    department: 'Maintenance',
    proofImage: 'https://images.unsplash.com/photo-1517166357932-d20495cb655d?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'a4',
    description: 'Mise à jour affichage 5S',
    status: ActionStatus.OPEN,
    assigneeId: 'u2',
    dueDate: new Date(Date.now() + 300000000).toISOString(),
    priority: 'LOW',
    createdAt: new Date(Date.now() - 10000).toISOString(),
    area: 'Bureau Chef',
    department: 'HSE / Sécurité',
    proofImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600'
  }
];

export const MOCK_PACKAGES: DataPackage[] = [
  {
    id: 'pkg-001',
    generatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    meetingId: 'mtg-prev-1',
    meetingType: MeetingType.DAILY_5,
    summary: 'Point 5 - Prod A - RAS Sécurité',
    actionCount: 0,
    syncStatus: 'SYNCED',
    sizeKb: 12
  },
  {
    id: 'pkg-002',
    generatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    meetingId: 'mtg-prev-2',
    meetingType: MeetingType.DAILY_5,
    summary: 'Point 5 - Prod A - 2 Incidents',
    actionCount: 2,
    syncStatus: 'SYNCED',
    sizeKb: 45
  },
  {
    id: 'pkg-003',
    generatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    meetingId: 'mtg-prev-3',
    meetingType: MeetingType.WEEKLY_15,
    summary: 'Hebdo HSE - Revue Zone B',
    actionCount: 5,
    syncStatus: 'PENDING',
    sizeKb: 128
  }
];

export const HHSE_THEMES = [
  "Port des EPI (Lunettes)",
  "Gestes et Postures : Le dos",
  "Consignation : Les 7 étapes",
  "Risque Chute de Plain-pied",
  "Tri des déchets : Plastique vs Carton"
];

export const INITIAL_MEETING_STATE: Meeting = {
  id: 'new-meeting',
  type: MeetingType.DAILY_5,
  teamId: 't1',
  date: new Date().toISOString(),
  startTime: new Date().toISOString(),
  durationSeconds: 0,
  completed: false,
  attendees: [],
  notes: Object.values(MeetingSection).map(section => ({
    section,
    text: '',
    hasIssue: false
  }))
};

export const DEFAULT_SETTINGS: import('./types').AppSettings = {
  enableVoiceInput: false,
  enableSectionTimer: true,
  enableAutoSave: true,
  enableKanbanDragDrop: false,
  onboardingSeen: false
};
