import fs from 'fs';
import path from 'path';

export interface ManagerRoomState {
  id: string;
  name: string;
  isReady: boolean;
  budget: number;
  squad: any[];
}

export interface OnlineRoom {
  code: string;
  budget: number;
  squadSize: number;
  diff: string;
  mode: string;
  status: 'lobby' | 'drafting' | 'finished';
  host: ManagerRoomState;
  guest: ManagerRoomState | null;
  gameState: {
    status: 'drafting' | 'choosing' | 'broke_choosing' | 'revealing' | 'finished';
    current_bid: number;
    winning_manager_id: string | null;
    seconds_remaining: number;
    waiting_initial_bid: boolean;
    turn_manager_id: string;
  };
  availablePool: any[];
  roundIndex: number;
  lastUpdated: number;
}

const CACHE_FILE = path.join(process.cwd(), 'rooms_cache.json');

function loadRoomsFromDisk(): Map<string, OnlineRoom> {
  const map = new Map<string, OnlineRoom>();
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      const obj = JSON.parse(data);
      Object.keys(obj).forEach(key => {
        map.set(key, obj[key]);
      });
    }
  } catch (err) {
    console.error('Error reading rooms cache file:', err);
  }
  return map;
}

function saveRoomsToDisk(roomsMap: Map<string, OnlineRoom>) {
  try {
    const obj: Record<string, OnlineRoom> = {};
    roomsMap.forEach((val, key) => {
      obj[key] = val;
    });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing rooms cache file:', err);
  }
}

const onlineRoomsStore: Map<string, OnlineRoom> = loadRoomsFromDisk();

export function getOrCreateOnlineRoom(
  code: string, 
  budget: number = 100000000, 
  squadSize: number = 11, 
  diff: string = 'medium', 
  mode: string = 'online_friend', 
  hostName: string = 'المستضيف', 
  hostId: string = 'host_1'
): OnlineRoom {
  const cleanCode = code.toUpperCase().trim();
  
  // Reload from disk to ensure cross-process sync
  const diskStore = loadRoomsFromDisk();
  const existing = diskStore.get(cleanCode) || onlineRoomsStore.get(cleanCode);
  if (existing) {
    onlineRoomsStore.set(cleanCode, existing);
    return existing;
  }

  const newRoom: OnlineRoom = {
    code: cleanCode,
    budget,
    squadSize,
    diff,
    mode,
    status: 'lobby',
    host: { id: hostId, name: hostName, isReady: true, budget, squad: [] },
    guest: null,
    gameState: {
      status: 'drafting',
      current_bid: 0,
      winning_manager_id: null,
      seconds_remaining: 15,
      waiting_initial_bid: true,
      turn_manager_id: hostId
    },
    availablePool: [],
    roundIndex: 0,
    lastUpdated: Date.now()
  };

  onlineRoomsStore.set(cleanCode, newRoom);
  saveRoomsToDisk(onlineRoomsStore);
  return newRoom;
}

export function updateOnlineRoom(code: string, updates: Partial<OnlineRoom>): OnlineRoom | null {
  const cleanCode = code.toUpperCase().trim();
  const diskStore = loadRoomsFromDisk();
  const room = diskStore.get(cleanCode) || onlineRoomsStore.get(cleanCode);
  if (!room) return null;

  const updated: OnlineRoom = {
    ...room,
    ...updates,
    lastUpdated: Date.now()
  };

  onlineRoomsStore.set(cleanCode, updated);
  diskStore.set(cleanCode, updated);
  saveRoomsToDisk(diskStore);
  return updated;
}


