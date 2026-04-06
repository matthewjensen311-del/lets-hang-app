export interface DietaryOption {
  id: string;
  label: string;
  emoji: string;
}

export const DIETARY_OPTIONS: DietaryOption[] = [
  { id: 'vegetarian', label: 'Vegetarian', emoji: '\u{1F96C}' },
  { id: 'vegan', label: 'Vegan', emoji: '\u{1F331}' },
  { id: 'pescatarian', label: 'Pescatarian', emoji: '\u{1F41F}' },
  { id: 'gluten-free', label: 'Gluten-free', emoji: '\u{1F33E}' },
  { id: 'dairy-free', label: 'Dairy-free', emoji: '\u{1F95B}' },
  { id: 'nut-allergy', label: 'Nut allergy', emoji: '\u{1F95C}' },
  { id: 'halal', label: 'Halal', emoji: '\u262A\uFE0F' },
  { id: 'kosher', label: 'Kosher', emoji: '\u2721\uFE0F' },
  { id: 'keto', label: 'Keto', emoji: '\u{1F951}' },
  { id: 'no-pork', label: 'No pork', emoji: '\u{1F437}' },
  { id: 'no-shellfish', label: 'No shellfish', emoji: '\u{1F990}' },
  { id: 'no-restrictions', label: 'No restrictions', emoji: '\u2705' },
];
