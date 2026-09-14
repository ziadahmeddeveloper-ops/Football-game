// Server-side memory store for synchronized real-time online multiplayer rooms

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

const onlineRoomsStore: Map<string, OnlineRoom> = new Map();

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
  const existing = onlineRoomsStore.get(cleanCode);
  if (existing) {
    return existing;
  }

  const newRoom: OnlineRoom = {
    code: cleanCode,
    budget,
    squadSize,
    diff,
    mode,
    status: 'lobby', // Always start in lobby state!
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
  return newRoom;
}

export function updateOnlineRoom(code: string, updates: Partial<OnlineRoom>): OnlineRoom | null {
  const cleanCode = code.toUpperCase().trim();
  const room = onlineRoomsStore.get(cleanCode);
  if (!room) return null;

  const updated: OnlineRoom = {
    ...room,
    ...updates,
    lastUpdated: Date.now()
  };

  onlineRoomsStore.set(cleanCode, updated);
  return updated;
}

