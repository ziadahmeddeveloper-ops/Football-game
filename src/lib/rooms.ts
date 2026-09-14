// Server-side memory store for synchronized real-time online multiplayer rooms

export interface OnlineRoom {
  code: string;
  budget: number;
  squadSize: number;
  diff: string;
  mode: string;
  managers: Array<{
    id: string;
    name: string;
    budget: number;
    squad: any[];
  }>;
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

export function getOrCreateRoom(code: string, budget: number = 100000000, squadSize: number = 11, diff: string = 'medium', mode: string = 'online_friend', managerName: string = 'المستضيف'): OnlineRoom {
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
    managers: [
      { id: 'you', name: managerName, budget, squad: [] }
    ],
    gameState: {
      status: 'drafting',
      current_bid: 0,
      winning_manager_id: null,
      seconds_remaining: 15,
      waiting_initial_bid: true,
      turn_manager_id: 'you'
    },
    availablePool: [],
    roundIndex: 0,
    lastUpdated: Date.now()
  };

  onlineRoomsStore.set(cleanCode, newRoom);
  return newRoom;
}

export function updateRoomState(code: string, updates: Partial<OnlineRoom>): OnlineRoom | null {
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
