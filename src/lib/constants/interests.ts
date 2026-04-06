export interface Interest {
  id: string;
  label: string;
  emoji: string;
}

export interface InterestCategory {
  id: string;
  label: string;
  emoji: string;
  interests: Interest[];
}

export const INTEREST_CATEGORIES: InterestCategory[] = [
  {
    id: 'food-and-drink',
    label: 'Food & Drink',
    emoji: '\u{1F37D}\uFE0F',
    interests: [
      { id: 'coffee-shops', label: 'Coffee shops', emoji: '\u2615' },
      { id: 'brunch', label: 'Brunch', emoji: '\u{1F95E}' },
      { id: 'fine-dining', label: 'Fine dining', emoji: '\u{1F377}' },
      { id: 'street-food', label: 'Street food', emoji: '\u{1F32E}' },
      { id: 'food-trucks', label: 'Food trucks', emoji: '\u{1F69A}' },
      { id: 'cooking-together', label: 'Cooking together', emoji: '\u{1F468}\u200D\u{1F373}' },
      { id: 'wine-tasting', label: 'Wine tasting', emoji: '\u{1F347}' },
      { id: 'brewery-taproom', label: 'Brewery/taproom', emoji: '\u{1F37A}' },
      { id: 'cocktail-bars', label: 'Cocktail bars', emoji: '\u{1F378}' },
      { id: 'boba-dessert', label: 'Boba/dessert', emoji: '\u{1F9CB}' },
      { id: 'bbq-cookout', label: 'BBQ/cookout', emoji: '\u{1F525}' },
    ],
  },
  {
    id: 'active-and-outdoors',
    label: 'Active & Outdoors',
    emoji: '\u{1F3C3}',
    interests: [
      { id: 'hiking', label: 'Hiking', emoji: '\u{1F97E}' },
      { id: 'biking', label: 'Biking', emoji: '\u{1F6B4}' },
      { id: 'running', label: 'Running', emoji: '\u{1F3C3}' },
      { id: 'rock-climbing', label: 'Rock climbing', emoji: '\u{1F9D7}' },
      { id: 'kayaking-paddleboard', label: 'Kayaking/paddleboard', emoji: '\u{1F6F6}' },
      { id: 'beach-day', label: 'Beach day', emoji: '\u{1F3D6}\uFE0F' },
      { id: 'pickup-sports', label: 'Pickup sports', emoji: '\u26BD' },
      { id: 'golf-mini-golf', label: 'Golf/mini golf', emoji: '\u26F3' },
      { id: 'swimming', label: 'Swimming', emoji: '\u{1F3CA}' },
      { id: 'skateboarding', label: 'Skateboarding', emoji: '\u{1F6F9}' },
      { id: 'fishing', label: 'Fishing', emoji: '\u{1F3A3}' },
    ],
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    emoji: '\u{1F3AC}',
    interests: [
      { id: 'movies', label: 'Movies', emoji: '\u{1F3AC}' },
      { id: 'live-music', label: 'Live music', emoji: '\u{1F3B5}' },
      { id: 'concerts', label: 'Concerts', emoji: '\u{1F3A4}' },
      { id: 'comedy-shows', label: 'Comedy shows', emoji: '\u{1F602}' },
      { id: 'karaoke', label: 'Karaoke', emoji: '\u{1F3B6}' },
      { id: 'bowling', label: 'Bowling', emoji: '\u{1F3B3}' },
      { id: 'arcade-games', label: 'Arcade/games', emoji: '\u{1F579}\uFE0F' },
      { id: 'escape-rooms', label: 'Escape rooms', emoji: '\u{1F510}' },
      { id: 'trivia-night', label: 'Trivia night', emoji: '\u{1F9E0}' },
      { id: 'board-game-cafe', label: 'Board game caf\u00E9', emoji: '\u265F\uFE0F' },
      { id: 'theme-parks', label: 'Theme parks', emoji: '\u{1F3A2}' },
      { id: 'go-karts', label: 'Go-karts', emoji: '\u{1F3CE}\uFE0F' },
    ],
  },
  {
    id: 'arts-and-culture',
    label: 'Arts & Culture',
    emoji: '\u{1F3A8}',
    interests: [
      { id: 'museums', label: 'Museums', emoji: '\u{1F3DB}\uFE0F' },
      { id: 'art-galleries', label: 'Art galleries', emoji: '\u{1F5BC}\uFE0F' },
      { id: 'theater', label: 'Theater', emoji: '\u{1F3AD}' },
      { id: 'bookstores', label: 'Bookstores', emoji: '\u{1F4DA}' },
      { id: 'poetry-open-mic', label: 'Poetry/open mic', emoji: '\u{1F399}\uFE0F' },
      { id: 'street-art-walks', label: 'Street art walks', emoji: '\u{1F3A8}' },
      { id: 'workshops-classes', label: 'Workshops/classes', emoji: '\u2702\uFE0F' },
      { id: 'farmers-markets', label: 'Farmers markets', emoji: '\u{1F9FA}' },
      { id: 'festivals', label: 'Festivals', emoji: '\u{1F3AA}' },
    ],
  },
  {
    id: 'chill-and-social',
    label: 'Chill & Social',
    emoji: '\u2615',
    interests: [
      { id: 'picnic-in-the-park', label: 'Picnic in the park', emoji: '\u{1F9FA}' },
      { id: 'coffee-and-talk', label: 'Coffee and talk', emoji: '\u2615' },
      { id: 'watch-party', label: 'Watch party', emoji: '\u{1F4FA}' },
      { id: 'study-work-together', label: 'Study/work together', emoji: '\u{1F4BB}' },
      { id: 'vinyl-record-shopping', label: 'Vinyl/record shopping', emoji: '\u{1F3B5}' },
      { id: 'thrift-shopping', label: 'Thrift shopping', emoji: '\u{1F6CD}\uFE0F' },
      { id: 'dog-park', label: 'Dog park', emoji: '\u{1F415}' },
      { id: 'stargazing', label: 'Stargazing', emoji: '\u2728' },
      { id: 'sauna-spa-day', label: 'Sauna/spa day', emoji: '\u{1F9D6}' },
    ],
  },
  {
    id: 'nightlife',
    label: 'Nightlife',
    emoji: '\u{1F319}',
    interests: [
      { id: 'bar-hopping', label: 'Bar hopping', emoji: '\u{1F37B}' },
      { id: 'dance-club', label: 'Dance club', emoji: '\u{1F483}' },
      { id: 'rooftop-bar', label: 'Rooftop bar', emoji: '\u{1F306}' },
      { id: 'live-dj', label: 'Live DJ', emoji: '\u{1F3A7}' },
      { id: 'house-party', label: 'House party', emoji: '\u{1F389}' },
      { id: 'late-night-eats', label: 'Late-night eats', emoji: '\u{1F32F}' },
      { id: 'pool-billiards', label: 'Pool/billiards', emoji: '\u{1F3B1}' },
      { id: 'hookah-lounge', label: 'Hookah lounge', emoji: '\u{1F4A8}' },
    ],
  },
];

export const ALL_INTERESTS: Interest[] = INTEREST_CATEGORIES.flatMap(
  (category) => category.interests
);

export function getInterestById(id: string): Interest | undefined {
  return ALL_INTERESTS.find((interest) => interest.id === id);
}
