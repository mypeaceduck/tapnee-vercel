export interface Improvement {
  improvement: number;
}

export interface TapRecord {
  taps: number;
  waitFrom: number;
}

export interface User {
  id: string;
}

export interface GameArea {
  areas: number;
}

export interface TapInput {
  gameId: string;
  areaId: number;
  userId: string;
  address?: string;
  auth?: string;
}
