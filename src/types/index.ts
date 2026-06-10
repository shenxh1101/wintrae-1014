export type UserRole = 'tenant' | 'inspector';

export type HazardStatus = 'pending' | 'processing' | 'rectified' | 'closed';
export type HazardLevel = 'high' | 'medium' | 'low';
export type HazardType = 'channel_block' | 'illegal_power' | 'extinguisher_missing' | 'fire_door' | 'other';

export interface HazardItem {
  id: string;
  title: string;
  type: HazardType;
  level: HazardLevel;
  status: HazardStatus;
  location: string;
  floor: string;
  description: string;
  imageUrl: string;
  reporter: string;
  reporterRole: UserRole;
  reportTime: string;
  deadline?: string;
  inspector?: string;
  rectifyRequirement?: string;
  rectifyResult?: string;
  reviewTime?: string;
  sourcePointId?: string;
  sourceRouteId?: string;
  sourcePointName?: string;
}

export interface InspectionPoint {
  id: string;
  name: string;
  floor: string;
  location: string;
  checked: boolean;
  checkTime?: string;
  remark?: string;
  imageUrl?: string;
}

export interface InspectionRoute {
  id: string;
  name: string;
  floor: string;
  totalPoints: number;
  checkedPoints: number;
  points: InspectionPoint[];
  startTime?: string;
  endTime?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  location: string;
  floor: string;
  position: string;
  expireDate: string;
  lastCheckDate: string;
  lastCheckResult: 'normal' | 'abnormal';
  qrCode: string;
  imageUrl: string;
}

export type MessageType = 'overdue' | 'repeat' | 'high_risk' | 'rectify' | 'training' | 'system';
export type MessagePriority = 'urgent' | 'important' | 'normal';

export interface MessageItem {
  id: string;
  type: MessageType;
  priority: MessagePriority;
  title: string;
  content: string;
  time: string;
  read: boolean;
  relatedId?: string;
  relatedType?: 'hazard' | 'equipment';
}

export interface TrainingItem {
  id: string;
  title: string;
  trainer: string;
  location: string;
  time: string;
  duration: string;
  signedIn: boolean;
  signTime?: string;
}

export interface Statistics {
  totalHazards: number;
  pendingHazards: number;
  processingHazards: number;
  rectifiedHazards: number;
  todayInspections: number;
  completedInspections: number;
  overdueCount: number;
  highRiskCount: number;
}
