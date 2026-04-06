export interface VibeTagOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

export const VIBE_TAGS: VibeTagOption[] = [
  {
    id: 'chill',
    label: 'Chill',
    emoji: '\u{1F60C}',
    description: 'Low-key and relaxed, no pressure',
  },
  {
    id: 'active',
    label: 'Active',
    emoji: '\u26A1',
    description: 'Get moving and break a sweat',
  },
  {
    id: 'romantic',
    label: 'Romantic',
    emoji: '\u{1F495}',
    description: 'Date night or couples vibes',
  },
  {
    id: 'night-out',
    label: 'Night Out',
    emoji: '\u{1F319}',
    description: 'Hit the town after dark',
  },
  {
    id: 'foodie',
    label: 'Foodie',
    emoji: '\u{1F37D}\uFE0F',
    description: 'All about the food and drinks',
  },
  {
    id: 'adventure',
    label: 'Adventure',
    emoji: '\u{1F3D4}\uFE0F',
    description: 'Try something new and exciting',
  },
  {
    id: 'cultural',
    label: 'Cultural',
    emoji: '\u{1F3AD}',
    description: 'Arts, history, and learning',
  },
  {
    id: 'budget-friendly',
    label: 'Budget-Friendly',
    emoji: '\u{1F4B0}',
    description: 'Fun that won\'t break the bank',
  },
  {
    id: 'spontaneous',
    label: 'Spontaneous',
    emoji: '\u{1F3B2}',
    description: 'Go with the flow, surprise me',
  },
  {
    id: 'celebration',
    label: 'Celebration',
    emoji: '\u{1F389}',
    description: 'Something worth celebrating',
  },
];
