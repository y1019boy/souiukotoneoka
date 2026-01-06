// P2P Quake API Types
// Documentation: https://www.p2pquake.net/json_api_v2/

export interface QuakePoint {
  pref: string;
  addr: string;
  isArea: boolean;
  scale: number;
}

export interface QuakeEarthquake {
  time: string;
  hypocenter: {
    name: string;
    latitude: number;
    longitude: number;
    depth: number; // in km, -1 if unknown
    magnitude: number; // -1 if unknown
  };
  maxScale: number;
  domesticTsunami: string; // None, Checking, NonEffective, Watch, Warning, MajorWarning
}

export interface QuakeIssue {
  time: string;
  eventId: string;
  type: string;
  source: string;
}

export interface P2PQuakeEvent {
  _id?: string;
  id: string;
  code: number; // 551 is Earthquake Information
  time: string;
  issue: QuakeIssue;
  earthquake: QuakeEarthquake;
  points: QuakePoint[];
}

export enum JMAIntensity {
  Shindo1 = 10,
  Shindo2 = 20,
  Shindo3 = 30,
  Shindo4 = 40,
  Shindo5Minus = 45,
  Shindo5Plus = 50,
  Shindo6Minus = 55,
  Shindo6Plus = 60,
  Shindo7 = 70,
}