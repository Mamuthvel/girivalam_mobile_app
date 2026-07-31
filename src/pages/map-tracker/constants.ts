import type { Landmark } from "@/data/landmarks";

// Mode-specific content shown in the Girivalam tracker header/cards.
export const SOLO_CONTENT = {
  headerTitle: "Solo Girivalam",
  headerQuote: "Walking with Shiva, alone but never lonely",
  startButton: "Start Girivalam",
  stopButton: "Stop Girivalam",
  progressLabel: "Your Progress",
  completionTitle: "Solo Girivalam Completed!",
  completionMessage: "You have completed Girivalam. May Shiva walk with you within.",
};

export const GROUP_CONTENT = {
  headerTitle: "Group Girivalam",
  headerQuote: "Many feet, one sacred path",
  startButton: "Start Girivalam",
  stopButton: "Stop Girivalam",
  progressLabel: "Group Progress",
  completionTitle: "Group Girivalam Completed!",
  completionMessage: "Your group has completed Girivalam together. Unity is also a form of devotion.",
};

export interface Group {
  id: string;
  name: string;
  code: string;
  creator_id: string;
  description?: string;
  created_at: string;
  group_type: 'public' | 'private';
  password_hash?: string;
}

export const ALL_LANDMARK_TYPES: Landmark['type'][] = [
  'temple',
  'water',
  'food',
  'rest',
  'toilet',
  'medical',
  'parking',
];
