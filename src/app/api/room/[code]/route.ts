import { NextResponse } from "next/server";
import { getOrCreateRoom, updateRoomState } from "@/lib/rooms";

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

    const room = getOrCreateRoom(code, budget, squadSize, diff, mode, name);

    return NextResponse.json(room);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to get room state" }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ code: string }> | { code: string } }) {
  try {
    const resolvedParams = await (props.params as any);
    const code = resolvedParams?.code || "ONLINE1";
    const body = await req.json();

    const { action, managerId, managerName, bidAmount, initialBid, roomData } = body;

    let room = getOrCreateRoom(code);

    if (action === 'join') {
      const existingGuest = room.managers.find(m => m.id === managerId || m.id === 'player2');
      if (!existingGuest && room.managers.length < 2) {
        room.managers.push({
          id: managerId || 'player2',
          name: managerName || 'لاعب 2 (أونلاين)',
          budget: room.budget,
          squad: []
        });
      }
      room = updateRoomState(code, { managers: room.managers }) || room;
    } else if (action === 'bid') {
      if (bidAmount > room.gameState.current_bid) {
        room.gameState.current_bid = bidAmount;
        room.gameState.winning_manager_id = managerId;
        room.gameState.waiting_initial_bid = false;
        room = updateRoomState(code, { gameState: room.gameState }) || room;
      }
    } else if (action === 'set_initial_bid') {
      room.gameState.current_bid = initialBid;
      room.gameState.winning_manager_id = managerId;
      room.gameState.waiting_initial_bid = false;
      room = updateRoomState(code, { gameState: room.gameState }) || room;
    } else if (action === 'sync') {
      if (roomData) {
        room = updateRoomState(code, roomData) || room;
      }
    }

    return NextResponse.json(room);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to update room state" }, { status: 500 });
  }
}
