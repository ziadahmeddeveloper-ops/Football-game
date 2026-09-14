import { NextResponse } from "next/server";
import { getOrCreateOnlineRoom, updateOnlineRoom } from "@/lib/rooms";

export async function GET(req: Request, props: { params: Promise<{ code: string }> | { code: string } }) {
  try {
    const resolvedParams = await (props.params as any);
    const code = resolvedParams?.code || "ONLINE1";

    const { searchParams } = new URL(req.url);
    const budget = Number(searchParams.get("budget")) || 100000000;
    const squadSize = Number(searchParams.get("size")) || 11;
    const diff = searchParams.get("diff") || "medium";
    const mode = searchParams.get("mode") || "online_friend";
    const name = searchParams.get("name") || "اللاعب 1";
    const userId = searchParams.get("userId") || "host_1";

    const room = getOrCreateOnlineRoom(code, budget, squadSize, diff, mode, name, userId);

    return NextResponse.json(room);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch online room state" }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ code: string }> | { code: string } }) {
  try {
    const resolvedParams = await (props.params as any);
    const code = resolvedParams?.code || "ONLINE1";
    const body = await req.json();

    const { action, managerId, managerName, bidAmount, initialBid, pool, roomStateUpdates } = body;

    let room = getOrCreateOnlineRoom(code);

    if (action === 'create_or_init') {
      if (pool && pool.length > 0 && room.availablePool.length === 0) {
        room.availablePool = pool;
      }
      if (managerName && (!room.host.name || room.host.name === 'المستضيف')) {
        room.host.name = managerName;
      }
      room = updateOnlineRoom(code, { availablePool: room.availablePool, host: room.host }) || room;
    } else if (action === 'join') {
      if (!room.guest || room.guest.id === managerId) {
        room.guest = {
          id: managerId || 'guest_2',
          name: managerName || 'لاعب 2 (أونلاين)',
          budget: room.budget,
          squad: []
        };
        room.status = 'drafting';
        room = updateOnlineRoom(code, { guest: room.guest, status: 'drafting' }) || room;
      }
    } else if (action === 'bid') {
      if (bidAmount > room.gameState.current_bid) {
        room.gameState.current_bid = bidAmount;
        room.gameState.winning_manager_id = managerId;
        room.gameState.waiting_initial_bid = false;
        room = updateOnlineRoom(code, { gameState: room.gameState }) || room;
      }
    } else if (action === 'set_initial_bid') {
      room.gameState.current_bid = initialBid;
      room.gameState.winning_manager_id = managerId;
      room.gameState.waiting_initial_bid = false;
      room = updateOnlineRoom(code, { gameState: room.gameState }) || room;
    } else if (action === 'sync') {
      if (roomStateUpdates) {
        room = updateOnlineRoom(code, roomStateUpdates) || room;
      }
    }

    return NextResponse.json(room);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update room state" }, { status: 500 });
  }
}
