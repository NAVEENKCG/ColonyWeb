export type UserRole = 'resident' | 'committee';

export interface User {
  id: string;
  name: string;
  phone: string;
  flatNumber: string;
  block: string;
  role: UserRole;
  avatar?: string;
}

export type ComplaintCategory =
  | 'water'
  | 'power'
  | 'lift'
  | 'security'
  | 'clean'
  | 'parking'
  | 'area'
  | 'other';

export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved';

export interface TimelineEvent {
  id: string;
  senderType: 'user' | 'maintenance';
  senderName: string;
  senderNameTa: string;
  timestamp: string;
  text: string;
  textTa?: string;
  photoUrl?: string;
}

export interface ComplaintFeedback {
  isResolved: boolean;
  rating: number;
  comments?: string;
  submittedAt?: string;
}

export interface Complaint {
  id: string;
  customId: string; // e.g. CMP-8421 or C-2023-114A or #CMP-2041
  category: ComplaintCategory;
  categoryLabel: string;
  categoryLabelTa: string;
  title: string;
  titleTa: string;
  description: string;
  descriptionTa?: string;
  flatLocation: string;
  reportedBy: string; // Flat number or name
  reportedAt: string;
  status: ComplaintStatus;
  photoUrl?: string;
  timeline: TimelineEvent[];
  feedback?: ComplaintFeedback;
  technicianAssigned?: string;
  assignedBadge?: string; // e.g. 'MT'
}

export interface Notice {
  id: string;
  category: 'MAINTENANCE' | 'MEETING' | 'SECURITY' | 'GENERAL';
  categoryColor: string;
  date: string;
  title: string;
  bodyEn: string;
  bodyTa: string;
  author?: string;
}

export type ActiveTab = 'complaints' | 'raise' | 'notices';

export type AppView =
  | 'welcome'
  | 'register'
  | 'login'
  | 'resident_home'
  | 'raise_complaint'
  | 'complaint_detail'
  | 'committee_dashboard'
  | 'notices';
