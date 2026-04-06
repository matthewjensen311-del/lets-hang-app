import Anthropic from '@anthropic-ai/sdk';
import type { ItineraryResponse, ItineraryResponseItem } from '@/types/hangout';
import {
  ITINERARY_SYSTEM_PROMPT,
  SWAP_ITEM_PROMPT,
  REGENERATE_PROMPT,
} from './prompts';

// ── Types ─────────────────────────────────────────────────────────────

export interface ParticipantPrefs {
  interests: string[];
  dietaryRestrictions: string[];
  budgetTier: string;
}

export interface ItineraryParams {
  participants: ParticipantPrefs[];
  sharedInterests: string[];
  lowestBudget: string;
  mergedDietary: string[];
  dateTime: string;
  duration: number;
  location: string;
  vibe: string;
  vibeTags: string[];
  indoorOutdoor: string;
  energyLevel: string;
  participantCount: number;
}

interface SwapConstraints {
  budget: string;
  dietary: string[];
  location: string;
}

// ── Raw AI response item shape (different from our DB types) ──────────

interface RawAIItem {
  order: number;
  type: string;
  title: string;
  description: string;
  venue_name: string;
  venue_address: string;
  estimated_duration_minutes: number;
  estimated_cost_per_person: number;
  suggested_time: string;
  why_this_fits: string;
  dietary_note?: string;
  booking_url_hint?: string;
}

interface RawAIResponse {
  title: string;
  description: string;
  vibe_summary: string;
  total_estimated_cost_per_person: number;
  items: RawAIItem[];
}

// ── Client singleton ──────────────────────────────────────────────────

function getClient(): Anthropic {
  return new Anthropic();
}

// ── Helpers ───────────────────────────────────────────────────────────

function buildUserMessage(params: ItineraryParams): string {
  return `Plan a hangout with the following details:

**Participants:** ${params.participantCount} people
**Shared Interests:** ${params.sharedInterests.length > 0 ? params.sharedInterests.join(', ') : 'None specifically — suggest broadly appealing activities'}
**Budget Tier:** ${params.lowestBudget} (this is the lowest among all participants)
**Dietary Restrictions:** ${params.mergedDietary.length > 0 ? params.mergedDietary.join(', ') : 'None'}
**Date & Time:** ${params.dateTime}
**Duration:** ${params.duration} hours
**Location:** ${params.location}
**Vibe:** ${params.vibe}
**Vibe Tags:** ${params.vibeTags.length > 0 ? params.vibeTags.join(', ') : 'General hangout'}
**Indoor/Outdoor:** ${params.indoorOutdoor}
**Energy Level:** ${params.energyLevel}`;
}

function mapRawItemToResponse(raw: RawAIItem, index: number): ItineraryResponseItem {
  const validTypes = ['food', 'activity', 'drinks', 'entertainment', 'transport', 'other'] as const;
  type ValidType = (typeof validTypes)[number];
  const itemType: ValidType = validTypes.includes(raw.type as ValidType)
    ? (raw.type as ValidType)
    : 'other';

  const notes = [
    raw.why_this_fits,
    raw.dietary_note ? `Dietary: ${raw.dietary_note}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  return {
    order_index: raw.order ?? index + 1,
    type: itemType,
    title: raw.title,
    description: raw.description,
    venue_name: raw.venue_name,
    venue_address: raw.venue_address,
    estimated_start: raw.suggested_time,
    estimated_end: '',
    estimated_cost_per_person: raw.estimated_cost_per_person ?? 0,
    booking_url: raw.booking_url_hint,
    notes: notes || undefined,
  };
}

function parseItineraryJSON(text: string): RawAIResponse {
  // Try to extract JSON from the response — handle markdown code fences
  let jsonStr = text.trim();

  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  // Find the first { and last } to handle any wrapping text
  const firstBrace = jsonStr.indexOf('{');
  const lastBrace = jsonStr.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(jsonStr) as RawAIResponse;
}

function rawToItineraryResponse(raw: RawAIResponse): ItineraryResponse {
  return {
    title: raw.title,
    description: raw.description,
    vibe_summary: raw.vibe_summary,
    total_estimated_cost_per_person: raw.total_estimated_cost_per_person,
    items: raw.items.map((item, i) => mapRawItemToResponse(item, i)),
  };
}

// ── Public API ────────────────────────────────────────────────────────

export async function generateItinerary(
  params: ItineraryParams
): Promise<ItineraryResponse> {
  const client = getClient();

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: ITINERARY_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildUserMessage(params),
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response received from AI');
  }

  const raw = parseItineraryJSON(textBlock.text);
  return rawToItineraryResponse(raw);
}

export async function swapItineraryItem(
  currentItinerary: ItineraryResponse,
  itemOrder: number,
  constraints: SwapConstraints
): Promise<ItineraryResponseItem> {
  const client = getClient();

  const itemToSwap = currentItinerary.items.find(
    (item) => item.order_index === itemOrder
  );
  if (!itemToSwap) {
    throw new Error(`Item with order ${itemOrder} not found in itinerary`);
  }

  const existingVenues = currentItinerary.items
    .map((item) => item.venue_name)
    .filter(Boolean);

  const userMessage = `Current itinerary: ${JSON.stringify(currentItinerary, null, 2)}

Item to replace (order ${itemOrder}):
${JSON.stringify(itemToSwap, null, 2)}

Constraints:
- Budget tier: ${constraints.budget}
- Dietary restrictions: ${constraints.dietary.length > 0 ? constraints.dietary.join(', ') : 'None'}
- Location: ${constraints.location}

Do NOT suggest any of these existing venues: ${existingVenues.join(', ')}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SWAP_ITEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response received from AI');
  }

  const rawItem = parseItineraryJSON(textBlock.text) as unknown as RawAIItem;
  return mapRawItemToResponse(rawItem, itemOrder - 1);
}

export async function regenerateItinerary(
  previousItinerary: ItineraryResponse,
  params: ItineraryParams
): Promise<ItineraryResponse> {
  const client = getClient();

  const previousVenues = previousItinerary.items
    .map((item) => item.venue_name)
    .filter(Boolean);

  const userMessage = `${buildUserMessage(params)}

IMPORTANT: This is a REGENERATION request. The user did not like the previous itinerary.
Previous itinerary title: "${previousItinerary.title}"
Previous venues (do NOT reuse any of these): ${previousVenues.join(', ')}

Generate a completely different plan.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `${ITINERARY_SYSTEM_PROMPT}\n\n${REGENERATE_PROMPT}`,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response received from AI');
  }

  const raw = parseItineraryJSON(textBlock.text);
  return rawToItineraryResponse(raw);
}
