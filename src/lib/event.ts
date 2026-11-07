export const MAX_PLUS_ONES = 10;

export type Rsvp = {
  id: string;
  name: string;
  dish: string;
  plusOnes: number;
  // True when this browser created the entry and may edit/remove it.
  mine: boolean;
};

export type DietaryEntry = {
  id: string;
  name: string;
  note: string;
  mine: boolean;
};
