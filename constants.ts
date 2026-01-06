import { JMAIntensity } from './types';

export const P2P_WS_URL = 'wss://api.p2pquake.net/v2/ws';
export const P2P_HISTORY_URL = 'https://api.p2pquake.net/v2/history?codes=551&limit=20';

export const getShindoLabel = (scale: number): string => {
  switch (scale) {
    case 10: return '1';
    case 20: return '2';
    case 30: return '3';
    case 40: return '4';
    case 45: return '5-'; // 5弱
    case 50: return '5+'; // 5強
    case 55: return '6-'; // 6弱
    case 60: return '6+'; // 6強
    case 70: return '7';
    default: return '?';
  }
};

export const getShindoColor = (scale: number): string => {
  switch (scale) {
    case 10: return 'bg-cyan-500'; // 1
    case 20: return 'bg-blue-500'; // 2
    case 30: return 'bg-green-500'; // 3
    case 40: return 'bg-yellow-500 text-black'; // 4
    case 45: return 'bg-orange-500'; // 5-
    case 50: return 'bg-orange-600'; // 5+
    case 55: return 'bg-red-600'; // 6-
    case 60: return 'bg-red-700'; // 6+
    case 70: return 'bg-purple-700 border-2 border-yellow-400'; // 7
    default: return 'bg-gray-500';
  }
};

export const getTsunamiLabel = (status: string): string => {
  switch (status) {
    case 'None': return '津波の心配なし';
    case 'Checking': return '津波の有無を調査中';
    case 'NonEffective': return '若干の海面変動あり（被害なし）';
    case 'Watch': return '津波注意報';
    case 'Warning': return '津波警報';
    case 'MajorWarning': return '大津波警報';
    default: return '情報なし';
  }
};

export const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';
  // P2Pquake format: "2024/05/20 14:30:00" or similiar
  return timeStr.replace(/\//g, '-');
};
