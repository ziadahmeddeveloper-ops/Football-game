"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Users, User, DollarSign, Clock, Shield, Sparkles, ArrowLeft, 
  Trophy as TrophyIcon, UserPlus, AlertTriangle, Eye, Loader2, Hand, Shuffle, RefreshCw,
  Copy, Share2, Check, Key, Play
} from 'lucide-react';

interface Player {
  id: number;
  name: string;
  rating: number;
  position: string;
  image: string;
  club?: string;
  nationality?: string;
}

interface Manager {
  id: string;
  name: string;
  budget: number;
  squad: Player[];
  image?: string;
}

const FORMATIONS = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3', '4-1-2-1-2'];
const POSITIONS_LIST = ['ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'CB', 'LB', 'RB', 'GK'];

// Global Position Categorizer
const getCat = (pos: string) => {
  if (['ST', 'CF', 'LW', 'RW', 'LF', 'RF'].includes(pos)) return 'ATT';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM', 'LAM', 'RAM'].includes(pos)) return 'MID';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return 'DEF';
  if (pos === 'GK') return 'GK';
  return 'MID';
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function RoomPage({ params, searchParams }: { params: any, searchParams?: any }) {
  const searchParamsHook = useSearchParams();

  // Safe Next 15 params & searchParams unwrapping
  let unwrappedParams: any = params;
  if (params && typeof params.then === 'function') {
    try { unwrappedParams = React.use(params); } catch { unwrappedParams = params; }
  }

  let unwrappedSearchParams: any = searchParams;
  if (searchParams && typeof searchParams.then === 'function') {
    try { unwrappedSearchParams = React.use(searchParams); } catch { unwrappedSearchParams = searchParams; }
  }

  const roomCode = unwrappedParams?.code || (params && typeof params === 'object' && params.code) || "PRACTICE";
  
  const budgetParam = searchParamsHook?.get('budget') || unwrappedSearchParams?.budget;
  const sizeParam = searchParamsHook?.get('size') || unwrappedSearchParams?.size;
  const maxParam = searchParamsHook?.get('max') || unwrappedSearchParams?.max;
  const diffParam = searchParamsHook?.get('diff') || unwrappedSearchParams?.diff;

  const initialBudget = budgetParam ? parseInt(String(budgetParam), 10) : 100000000;
  const totalRounds = sizeParam ? parseInt(String(sizeParam), 10) : 11;
  const targetMaxPlayers = maxParam ? parseInt(String(maxParam), 10) : 4;
  const initialDiff = (diffParam && ['easy', 'medium', 'hard', 'legendary'].includes(String(diffParam).toLowerCase()))
    ? String(diffParam).toLowerCase()
    : 'medium';

  type RoomStateType = 'selection' | 'waiting' | 'drafting' | 'squad_builder' | 'match_result';
  const initialRoomState: RoomStateType = (roomCode === 'PRACTICE') ? 'drafting' : 'waiting';

  const [botDifficulty, setBotDifficulty] = useState<string>(initialDiff);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [roomState, setRoomState] = useState<RoomStateType>(initialRoomState);
  const [isPlayer2Joined, setIsPlayer2Joined] = useState<boolean>(roomCode === 'PRACTICE');
  const [player2Name, setPlayer2Name] = useState<string>("Challenger Friend");
  const [userProfile, setUserProfile] = useState<{ name: string; avatar: string; coins: number } | null>(null);
  const [connectedManagers, setConnectedManagers] = useState<Manager[]>([]);
  const [formation, setFormation] = useState<string>('4-3-3');
  
  const [managers, setManagers] = useState<Manager[]>([
    { id: 'you', name: 'You', budget: initialBudget, squad: [] },
    { id: 'bot1', name: 'Pep AI (Tactical)', budget: initialBudget, squad: [] },
  ]);

  useEffect(() => {
    if (initialBudget && managers[0]?.squad.length === 0) {
      setManagers(prev => prev.map(m => ({ ...m, budget: initialBudget })));
    }
  }, [initialBudget]);

  const [availablePool, setAvailablePool] = useState<Player[]>([]);
  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [fullPlayerPool, setFullPlayerPool] = useState<Player[]>([]);
  const [mysteryOptions, setMysteryOptions] = useState<Player[]>([]);
  const [showMysteryPackUI, setShowMysteryPackUI] = useState(false);
  const [selectedPackIndex, setSelectedPackIndex] = useState<number | null>(null);
  const [pendingRoundEndState, setPendingRoundEndState] = useState<any>(null);
  
  const [gameState, setGameState] = useState<{
    status: 'drafting' | 'choosing' | 'broke_choosing' | 'revealing' | 'finished';
    current_bid: number;
    winning_manager_id: string | null;
    seconds_remaining: number;
    waiting_initial_bid: boolean;
    turn_manager_id: string;
    broke_turn_manager_id: string;
  }>({
    status: 'drafting',
    current_bid: 0,
    winning_manager_id: 'bot1',
    seconds_remaining: 15,
    waiting_initial_bid: true,
    turn_manager_id: 'you',
    broke_turn_manager_id: 'you',
  });

  const [customBid, setCustomBid] = useState<string>("");
  const [bankruptPrice, setBankruptPrice] = useState<number>(5000000);
  const [selectedSwapIdx, setSelectedSwapIdx] = useState<number | null>(null);
  const [editingPositionIdx, setEditingPositionIdx] = useState<number | null>(null);

  const me: Manager = managers.find(m => m.id === 'you') || managers[0] || { id: 'you', name: 'You', budget: initialBudget, squad: [] };
  const opponent: Manager = managers.find(m => m.id !== 'you') || managers[1] || { id: 'bot1', name: 'Opponent', budget: initialBudget, squad: [] };

  
  const numManagers = managers.length;
  const roundPlayers = availablePool.slice(roundIndex * numManagers, (roundIndex + 1) * numManagers);
  const activePlayer = roundPlayers[0] || null;
  const loserPlayers = roundPlayers.slice(1);
  
  const isDraftFinished = roundIndex >= totalRounds;
  const isOpponentBankrupt = opponent && opponent.budget <= 0;

  // Determine who sets the initial bid: bankrupt side can't set it
  const getNextTurnManager = (nextRound: number, currentManagers: Manager[]) => {
    const myBudget = currentManagers.find(m => m.id === 'you')?.budget || 0;
    const anyBotHasBudget = currentManagers.some(m => m.id !== 'you' && m.budget > 0);
    
    if (myBudget <= 0 && anyBotHasBudget) {
      // I'm broke, let a bot set the bid
      const botWithBudget = currentManagers.find(m => m.id !== 'you' && m.budget > 0);
      return botWithBudget?.id || 'bot1';
    }
    if (!anyBotHasBudget && myBudget > 0) {
      // All bots are broke, I always set the bid
      return 'you';
    }
    // Normal alternating logic
    return (nextRound % currentManagers.length) === 0 ? 'you' : 'bot1';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.name) {
          setUserProfile(data);
          setManagers(prev => prev.map(m => m.id === 'you' ? { ...m, name: data.name } : m));
          setConnectedManagers([{ id: 'you', name: data.name, budget: initialBudget, squad: [], image: data.avatar }]);
        }
      })
      .catch(console.error);
    }
  }, []);

  const startPracticeDraft = (customManagers?: Manager[]) => {
    const activeManagers = customManagers || managers;
    if (customManagers) {
      setManagers(customManagers);
    }
    fetch(`${API_BASE}/api/players`)
      .then(res => res.json())
      .then(playersData => {
        const formatted: Player[] = playersData.map((p: any) => ({
          id: p.id,
          name: p.name,
          rating: p.rating,
          position: p.position,
          image: p.image_url,
          club: p.club,
          nationality: p.nationality
        }));
        
        // Deduplicate formatted players by ID
        const uniqueMap = new Map<number, Player>();
        formatted.forEach((p: Player) => { if (!uniqueMap.has(p.id)) uniqueMap.set(p.id, p); });
        const uniqueFormatted = Array.from(uniqueMap.values());
        
        setFullPlayerPool(uniqueFormatted);

        const numManagers = activeManagers.length;
        const totalNeeded = numManagers * totalRounds;
        
        const gks = uniqueFormatted.filter((p: Player) => getCat(p.position) === 'GK').sort(() => 0.5 - Math.random());
        const defs = uniqueFormatted.filter((p: Player) => getCat(p.position) === 'DEF').sort(() => 0.5 - Math.random());
        const mids = uniqueFormatted.filter((p: Player) => getCat(p.position) === 'MID').sort(() => 0.5 - Math.random());
        const atts = uniqueFormatted.filter((p: Player) => getCat(p.position) === 'ATT').sort(() => 0.5 - Math.random());

        const getPosCounts = (rounds: number) => {
          if (rounds <= 4) return { gk: 1, def: 1, mid: 1, att: 1 };
          if (rounds === 5) return { gk: 1, def: 2, mid: 1, att: 1 };
          if (rounds === 7) return { gk: 1, def: 2, mid: 2, att: 2 };
          return { gk: 1, def: 4, mid: 3, att: 3 };
        };

        const posCounts = getPosCounts(totalRounds);

        // Create ordered pool proportional to managers and squad size
        // Ensure NO duplicate IDs across the pool
        const poolIds = new Set<number>();
        const addUnique = (arr: Player[], count: number) => {
          const result: Player[] = [];
          for (const p of arr) {
            if (result.length >= count) break;
            if (!poolIds.has(p.id)) { poolIds.add(p.id); result.push(p); }
          }
          return result;
        };

        const orderedPool = [
          ...addUnique(gks, numManagers * posCounts.gk),
          ...addUnique(defs, numManagers * posCounts.def),
          ...addUnique(mids, numManagers * posCounts.mid),
          ...addUnique(atts, numManagers * posCounts.att)
        ];
        
        const remaining = uniqueFormatted.filter((p: Player) => !poolIds.has(p.id)).sort(() => 0.5 - Math.random());
        while (orderedPool.length < totalNeeded) {
            const next = remaining.pop();
            if (next && !poolIds.has(next.id)) { poolIds.add(next.id); orderedPool.push(next); }
            else if (!next) break;
        }

        setAvailablePool(orderedPool);
        setRoomState('drafting');
        setGameState({
          status: 'drafting',
          current_bid: 0,
          winning_manager_id: null,
          seconds_remaining: 15,
          waiting_initial_bid: true,
          turn_manager_id: getNextTurnManager(0, activeManagers),
          broke_turn_manager_id: 'you'
        });
      })
      .catch(err => {
        console.error("Failed to fetch players", err);
      });
  };

  // Auto-fetch player pool if entering drafting state with empty pool
  useEffect(() => {
    if (roomState === 'drafting' && availablePool.length === 0) {
      startPracticeDraft();
    }
  }, [roomState, availablePool.length]);


  const [revealData, setRevealData] = useState<{ results: { managerId: string, managerName: string, player: Player, isWinner: boolean }[] } | null>(null);

  // Sync / Draft Timer logic
  useEffect(() => {
    if (roomState !== 'drafting' || isDraftFinished || gameState.status !== 'drafting' || showMysteryPackUI) return;

    if (gameState.waiting_initial_bid) {
      if (gameState.turn_manager_id !== 'you' && !isOpponentBankrupt) {
        const timer = setTimeout(() => {
          const initial = Math.floor(Math.random() * 4 + 2) * 1000000;
          setGameState(prev => ({
            ...prev,
            waiting_initial_bid: false,
            current_bid: initial,
            winning_manager_id: prev.turn_manager_id,
            seconds_remaining: 15
          }));
        }, 1500);
        return () => clearTimeout(timer);
      }
      return;
    }

    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.seconds_remaining <= 1) {
          clearInterval(interval);
          setTimeout(() => handleRoundEnd(prev), 0);
          return { ...prev, seconds_remaining: 0 };
        }

        // Pro Bot Realistic Bidding Evaluation
        const getPlayerRealisticValuation = (p: Player): number => {
          const r = p.rating;
          if (r >= 94) return 60000000;
          if (r >= 90) return 45000000;
          if (r >= 87) return 30000000;
          if (r >= 84) return 20000000;
          if (r >= 81) return 12000000;
          if (r >= 78) return 7000000;
          return 4000000;
        };

        const mult = {
          easy: 0.8,
          medium: 1.0,
          hard: 1.25,
          legendary: 1.5,
        }[botDifficulty] || 1.0;

        const maxValuation = activePlayer ? getPlayerRealisticValuation(activePlayer) * mult : 10000000;

        const chanceByDiff = {
          easy: 0.20,
          medium: 0.40,
          hard: 0.65,
          legendary: 0.85,
        }[botDifficulty] || 0.40;

        if (prev.seconds_remaining < 14 && Math.random() < chanceByDiff) {
          const cat = activePlayer ? getCat(activePlayer.position) : 'MID';
          const eligibleBots = managers.filter(m => {
            if (m.id === 'you' || m.id === prev.winning_manager_id || m.budget <= prev.current_bid) return false;
            // Check position count: don't over-bid if bot already has 2+ GKs or 5+ ATTs
            const posCount = m.squad.filter(p => getCat(p.position) === cat).length;
            if (cat === 'GK' && posCount >= 2) return false;
            if (cat === 'ATT' && posCount >= 5) return false;
            
            const incrementNeeded = (activePlayer && activePlayer.rating >= 90) ? 5000000 : 2000000;
            const nextBidNeeded = prev.current_bid + incrementNeeded;
            return nextBidNeeded <= maxValuation && nextBidNeeded <= m.budget;
          });

          if (eligibleBots.length > 0 && activePlayer) {
            const biddingBot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
            const increment = (activePlayer.rating >= 90) ? 5000000 : 2000000;
            const nextBid = Math.min(biddingBot.budget, prev.current_bid + increment);

            if (nextBid > prev.current_bid && nextBid <= maxValuation) {
              return {
                ...prev,
                current_bid: nextBid,
                winning_manager_id: biddingBot.id,
                seconds_remaining: prev.seconds_remaining < 5 ? 5 : prev.seconds_remaining
              };
            }
          }
        }

        return { ...prev, seconds_remaining: prev.seconds_remaining - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [roomState, gameState.status, gameState.waiting_initial_bid, gameState.turn_manager_id, isDraftFinished, activePlayer, managers, showMysteryPackUI]);

  const handleRoundEnd = (currentState: typeof gameState) => {
    if (!activePlayer) return;

    const winnerId = currentState.winning_manager_id || 'you';
    const finalPrice = currentState.current_bid;

    // INTERCEPT LOSS: Show mystery package choice to the user if they lost the bid
    if (winnerId !== 'you') {
      const cat = getCat(activePlayer.position);
      const currentSquadIds = new Set();
      managers.forEach(m => m.squad.forEach(p => currentSquadIds.add(p.id)));
      availablePool.forEach(p => currentSquadIds.add(p.id));
      currentSquadIds.add(activePlayer.id);
      const candidates = fullPlayerPool
        .filter(p => getCat(p.position) === cat && !currentSquadIds.has(p.id))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      if (candidates.length < 3) {
        const remainingCandidates = fullPlayerPool
          .filter(p => !currentSquadIds.has(p.id))
          .sort(() => 0.5 - Math.random())
          .slice(0, 3 - candidates.length);
        candidates.push(...remainingCandidates);
      }

      while (candidates.length < 3) {
        candidates.push(activePlayer);
      }

      setMysteryOptions(candidates);
      setPendingRoundEndState({ winnerId, finalPrice });
      setShowMysteryPackUI(true);
      return;
    }

    let botIndex = 0;
    let newManagers = managers.map(m => {
      if (m.id === winnerId) {
        return {
          ...m,
          budget: Math.max(0, m.budget - finalPrice),
          squad: [...m.squad, activePlayer]
        };
      }
      const p = loserPlayers[botIndex] || activePlayer;
      botIndex++;
      return {
        ...m,
        squad: [...m.squad, p]
      };
    });

    setManagers(newManagers);

    const results = managers.map(m => {
      if (m.id === winnerId) return { managerId: m.id, managerName: m.name, player: activePlayer, isWinner: true };
      const p = newManagers.find(nm => nm.id === m.id)?.squad.slice(-1)[0] || activePlayer;
      return { managerId: m.id, managerName: m.name, player: p, isWinner: false };
    });

    setRevealData({ results });

    setGameState(prev => ({ ...prev, status: 'revealing' }));

    if (winnerId === 'you') {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }

    setTimeout(() => {
      setRevealData(null);
      const nextRound = roundIndex + 1;
      setRoundIndex(nextRound);

      if (nextRound >= totalRounds) {
        setRoomState('squad_builder');
      } else {
        const nextTurnManager = getNextTurnManager(nextRound, managers);
        setGameState({
          status: 'drafting',
          current_bid: 0,
          winning_manager_id: null,
          seconds_remaining: 15,
          waiting_initial_bid: true,
          turn_manager_id: nextTurnManager,
          broke_turn_manager_id: 'you'
        });
      }
    }, 3500);
  };

  const handleSelectMysteryPack = (idx: number) => {
    setSelectedPackIndex(idx);
    const chosenPlayer = mysteryOptions[idx];
    const { winnerId, finalPrice, isBankruptChoice, bankruptPrice } = pendingRoundEndState || {};

    let botIndex = 0;
    let newManagers = managers.map(m => {
      if (isBankruptChoice) {
        if (m.id === 'you') {
          return {
            ...m,
            budget: Math.max(0, m.budget - bankruptPrice),
            squad: [...m.squad, chosenPlayer]
          };
        } else {
          return {
            ...m,
            squad: [...m.squad, activePlayer]
          };
        }
      }

      if (m.id === winnerId) {
        return {
          ...m,
          budget: Math.max(0, m.budget - finalPrice),
          squad: [...m.squad, activePlayer]
        };
      }
      if (m.id === 'you') {
        return {
          ...m,
          squad: [...m.squad, chosenPlayer]
        };
      }
      
      const p = loserPlayers[botIndex] || activePlayer;
      botIndex++;
      return {
        ...m,
        squad: [...m.squad, p]
      };
    });

    setManagers(newManagers);

    const results = newManagers.map(m => {
      const p = m.squad[m.squad.length - 1] || chosenPlayer;
      return {
        managerId: m.id,
        managerName: m.name,
        player: p,
        isWinner: m.id === (isBankruptChoice ? 'you' : winnerId)
      };
    });

    setRevealData({ results });
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

    setTimeout(() => {
      setGameState(prev => ({ ...prev, status: 'revealing' }));
    }, 1200);

    setTimeout(() => {
      setShowMysteryPackUI(false);
      setSelectedPackIndex(null);
      setMysteryOptions([]);
      setPendingRoundEndState(null);
      setRevealData(null);
      
      const nextRound = roundIndex + 1;
      setRoundIndex(nextRound);

      if (nextRound >= totalRounds) {
        setRoomState('squad_builder');
      } else {
        const nextTurnManager = getNextTurnManager(nextRound, managers);
        setGameState({
          status: 'drafting',
          current_bid: 0,
          winning_manager_id: null,
          seconds_remaining: 15,
          waiting_initial_bid: true,
          turn_manager_id: nextTurnManager,
          broke_turn_manager_id: 'you'
        });
      }
    }, 5500);
  };

  const handleBankruptAction = (choice: 'keep_player' | 'random_player') => {
    if (!activePlayer || bankruptPrice > me.budget) {
      alert("Selected price exceeds your remaining budget!");
      return;
    }

    if (choice === 'random_player') {
      const cat = getCat(activePlayer.position);
      const currentSquadIds = new Set();
      managers.forEach(m => m.squad.forEach(p => currentSquadIds.add(p.id)));
      availablePool.forEach(p => currentSquadIds.add(p.id));
      currentSquadIds.add(activePlayer.id);

      const candidates = fullPlayerPool
        .filter(p => getCat(p.position) === cat && !currentSquadIds.has(p.id))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      if (candidates.length < 3) {
        const remainingCandidates = fullPlayerPool
          .filter(p => !currentSquadIds.has(p.id))
          .sort(() => 0.5 - Math.random())
          .slice(0, 3 - candidates.length);
        candidates.push(...remainingCandidates);
      }

      while (candidates.length < 3) {
        candidates.push(activePlayer);
      }

      setMysteryOptions(candidates);
      setPendingRoundEndState({ isBankruptChoice: true, bankruptPrice, choice });
      setShowMysteryPackUI(true);
      return;
    }

    let playerToAward = activePlayer;
    let newManagers = managers.map(m => {
      if (m.id === 'you') {
        return {
          ...m,
          budget: Math.max(0, m.budget - bankruptPrice),
          squad: [...m.squad, playerToAward]
        };
      }
      return m;
    });

    setManagers(newManagers);

    const results = newManagers.map(m => ({
      managerId: m.id,
      managerName: m.name,
      player: m.squad[m.squad.length - 1] || playerToAward,
      isWinner: m.id === 'you'
    }));

    setRevealData({ results });

    setGameState(prev => ({ ...prev, status: 'revealing' }));
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

    setTimeout(() => {
      setRevealData(null);
      const nextRound = roundIndex + 1;
      setRoundIndex(nextRound);

      if (nextRound >= totalRounds) {
        setRoomState('squad_builder');
      } else {
        setGameState({
          status: 'drafting',
          current_bid: 0,
          winning_manager_id: null,
          seconds_remaining: 15,
          waiting_initial_bid: true,
          turn_manager_id: getNextTurnManager(roundIndex + 1, managers),
          broke_turn_manager_id: 'you'
        });
      }
    }, 4500);
  };

  const handleBid = (amount: number) => {
    if (isDraftFinished || !me || gameState.status !== 'drafting') return false;
    if (amount > me.budget) { alert(`Insufficient budget! Remaining: ${formatMoney(me.budget)}`); return false; }
    if (amount <= gameState.current_bid) { alert(`Bid must be higher than ${formatMoney(gameState.current_bid)}`); return false; }
    
    setGameState(prev => ({ 
      ...prev, 
      current_bid: amount, 
      winning_manager_id: 'you', 
      seconds_remaining: prev.seconds_remaining < 5 ? 5 : prev.seconds_remaining 
    }));
    return true;
  };

  const parseBidAmount = (input: string) => {
    const englishNumbers = input.replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٥٦٧٨٩'.indexOf(d)]);
    const cleanStr = englishNumbers.toLowerCase().replace(/,/g, '').replace(/ /g, '').replace(/m/g, '').replace(/k/g, '');
    let amount = parseFloat(cleanStr);
    if (isNaN(amount)) return NaN;
    if (englishNumbers.toLowerCase().includes('m')) amount *= 1000000;
    else if (englishNumbers.toLowerCase().includes('k')) amount *= 1000;
    else if (amount > 0 && amount < 1000) amount *= 1000000;
    else if (amount >= 1000 && amount < 1000000) amount *= 1000;
    return amount;
  };

  const handleSetInitialBid = (amountToSet?: number) => {
    const amount = amountToSet !== undefined ? amountToSet : parseBidAmount(customBid);
    if (!isNaN(amount) && amount > 0) {
      if (amount > me.budget) {
        alert("Initial bid exceeds your budget!");
        return;
      }
      setGameState(prev => ({
        ...prev,
        waiting_initial_bid: false,
        current_bid: amount,
        winning_manager_id: 'you',
        seconds_remaining: 15
      }));
      setCustomBid("");
    }
  };

  const handleCustomBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseBidAmount(customBid);
    if (!isNaN(amount)) {
      const success = handleBid(amount); 
      if (success) setCustomBid(""); 
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  // --- RENDER SELECTION ---
  if (roomState === 'selection') {
    return (
      <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center p-6 bg-[#050811] text-white relative">
        <div className="absolute top-8 left-8 z-20">
          <Link href="/lobby" className="text-zinc-400 hover:text-white transition flex items-center gap-2 font-bold uppercase tracking-widest bg-white/5 px-6 py-3 rounded-2xl hover:bg-white/10 border border-white/5 hover:border-white/20">
            <ArrowLeft className="w-5 h-5" /> Back to Lobby
          </Link>
        </div>

        <h1 className="text-6xl font-black mb-4 text-white z-10 text-center">FUT DRAFT ARENA 2026</h1>
        <p className="text-zinc-400 mb-8 z-10 text-center max-w-lg">Choose a tactical formation, create an online draft room, or play an instant 1v1 draft match against Pep AI.</p>

        <div className="flex flex-col items-center mb-6 z-10">
          <label className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-3">Tactical Formation</label>
          <div className="flex gap-3 flex-wrap justify-center mb-6">
            {FORMATIONS.map(f => (
              <button key={f} onClick={() => setFormation(f)} className={`px-5 py-2 rounded-xl font-black text-sm transition-all border-2 ${formation === f ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'bg-black/50 text-white border-white/10 hover:border-[#00F0FF]/50'}`}>{f}</button>
            ))}
          </div>

          <label className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-3">Bot Difficulty Level</label>
          <div className="flex gap-3 flex-wrap justify-center">
            {['easy', 'medium', 'hard', 'legendary'].map(d => (
              <button 
                key={d} 
                onClick={() => setBotDifficulty(d)} 
                className={`px-5 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 ${
                  botDifficulty === d 
                    ? d === 'legendary' 
                      ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse'
                      : 'bg-[#0052FF] text-white border-[#0052FF] shadow-[0_0_15px_rgba(0,82,255,0.4)]' 
                    : 'bg-black/50 text-zinc-400 border-white/10 hover:border-white/30'
                }`}
              >
                {d === 'legendary' ? '🔥 LEGENDARY (UNBEATABLE)' : d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 z-10 w-full max-w-4xl">
          <button onClick={() => setRoomState('waiting')} className="group fut-card rounded-[2rem] p-8 flex flex-col items-center hover:scale-105 transition-transform bg-gradient-to-br from-purple-900/40 to-purple-950/40 border-2 border-transparent hover:border-purple-500/30">
            <Users className="w-16 h-16 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wider">Play Online</h2>
            <p className="text-purple-200/60 text-center mb-6 text-sm">Create a waiting room and invite your friends via room code.</p>
            <div className="w-full bg-purple-500/10 py-3 rounded-xl text-center text-purple-400 font-bold uppercase tracking-widest text-xs mt-4 group-hover:bg-purple-500 group-hover:text-white transition">Create Lobby</div>
          </button>

          <button onClick={() => startPracticeDraft()} className="group fut-card rounded-[2rem] p-8 flex flex-col items-center hover:scale-105 transition-transform bg-gradient-to-br from-blue-900/40 to-blue-950/40 border-2 border-transparent hover:border-blue-500/30">
            <User className="w-16 h-16 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wider">Practice 1v1</h2>
            <p className="text-blue-200/60 text-center mb-6 text-sm">Instantly start a match against Pep AI.</p>
            <div className="w-full bg-blue-500/10 py-3 rounded-xl text-center text-blue-400 font-bold uppercase tracking-widest text-xs mt-4 group-hover:bg-blue-500 group-hover:text-white transition">Start Instant Match</div>
          </button>
        </div>
      </div>
    );
  }



  // --- RENDER WAITING LOBBY ---
  if (roomState === 'waiting') {
    return (
      <div className="flex flex-col h-screen bg-[#050811] relative overflow-hidden text-white">
        <div className="absolute inset-0 z-50 bg-[#0B0F19] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0052FF]/25 via-[#0B0F19] to-[#0B0F19] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 flex flex-col items-center text-center relative shadow-2xl"
          >
            {/* LEAVE BUTTON */}
            <Link
              href="/lobby"
              className="absolute top-4 left-4 flex items-center gap-2 bg-white/5 hover:bg-red-600/30 border border-white/10 hover:border-red-500/50 text-zinc-400 hover:text-red-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" /> مغادرة الغرفة
            </Link>

            <div className="flex items-center gap-2 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <Users className="w-4 h-4" /> Online 1v1 Waiting Lobby
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white mb-2 uppercase tracking-tight">
              ساحة انتظار المباراة 🎮
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base font-bold mb-8 max-w-lg">
              شارك كود الغرفة مع صديقك للانضمام، ثم اضغط زر البدء للدخول في مواجهة المزاد المباشر!
            </p>

            {/* ROOM CODE DISPLAY & SHARE CARD */}
            <div className="w-full bg-gradient-to-r from-blue-950/60 via-black to-purple-950/60 border-2 border-[#00F0FF]/40 rounded-2xl p-6 mb-8 flex flex-col items-center gap-4 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
              <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">كود الغرفة الخاص بك (ROOM CODE)</span>
              
              <div className="flex items-center gap-3 bg-black/80 border border-white/20 px-6 py-3 rounded-2xl">
                <Key className="w-6 h-6 text-[#00F0FF]" />
                <span className="text-3xl sm:text-4xl font-black text-[#00F0FF] tracking-[0.3em] uppercase">{roomCode}</span>
              </div>

              <button 
                onClick={() => {
                  const shareUrl = window.location.href;
                  navigator.clipboard.writeText(shareUrl);
                  setCopiedToast(true);
                  setTimeout(() => setCopiedToast(false), 2500);
                }}
                className="bg-gradient-to-r from-[#00F0FF] to-blue-600 hover:from-blue-600 hover:to-[#00F0FF] text-black font-black px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-105 transition flex items-center gap-2 text-sm uppercase cursor-pointer"
              >
                {copiedToast ? <Check className="w-5 h-5 text-emerald-950" /> : <Share2 className="w-5 h-5" />}
                {copiedToast ? 'تم نسخ الرابط والكود!' : 'نسخ رابط الغرفة ومشاركتها 📋'}
              </button>
            </div>

            {/* DYNAMIC PLAYER SLOTS (SUPPORTING 2, 4, 8 PLAYERS) */}
            <div className="flex justify-between items-center w-full mb-4 px-2 flex-wrap gap-2">
              <span className="text-sm font-black text-white uppercase tracking-wider">
                المدراء الفنيون في الغرفة ({managers.length}/{targetMaxPlayers})
              </span>
              <button
                onClick={() => {
                  const BOT_NAMES = [
                    'Pep AI (Tactical)',
                    'Ancelotti AI (Mastermind)',
                    'Klopp AI (Gegenpress)',
                    'Zidane AI (Legend)',
                    'Mourinho AI (Special)',
                    'Arteta AI (Process)',
                    'Tuchel AI (System)',
                    'Nagelsmann AI (Analyst)'
                  ];
                  const fullList: Manager[] = [
                    { id: 'you', name: me.name || 'You', budget: initialBudget, squad: [] }
                  ];
                  for (let i = 1; i < targetMaxPlayers; i++) {
                    fullList.push({
                      id: `bot${i}`,
                      name: BOT_NAMES[i - 1] || `Bot ${i} (AI)`,
                      budget: initialBudget,
                      squad: []
                    });
                  }
                  setManagers(fullList);
                }}
                className="bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 text-xs font-black px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                🤖 ملء باقي الشواغر بالبوتات ({targetMaxPlayers} لاعبين)
              </button>
            </div>

            <div className={`grid grid-cols-1 ${targetMaxPlayers >= 8 ? 'sm:grid-cols-2 lg:grid-cols-4' : targetMaxPlayers >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2'} gap-3 w-full mb-8 max-h-[50vh] overflow-y-auto p-1`}>
              {Array.from({ length: targetMaxPlayers }).map((_, idx) => {
                const manager = managers[idx];
                const isHost = idx === 0;

                return (
                  <div 
                    key={manager ? manager.id : `slot-${idx}`} 
                    className={`bg-black/50 border-2 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden transition ${manager ? (isHost ? 'border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.2)]' : 'border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.2)]') : 'border-zinc-700 border-dashed opacity-60'}`}
                  >
                    <div className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${isHost ? 'text-[#FFD700]' : 'text-[#00F0FF]'}`}>
                      {isHost ? 'Host • أنت' : manager ? `Slot ${idx + 1} • المنافس` : `Slot ${idx + 1} • شاغر`}
                    </div>

                    {manager ? (
                      <>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mb-1.5 shadow-md ${isHost ? 'bg-gradient-to-br from-[#FFD700] to-amber-600 text-black' : 'bg-gradient-to-br from-[#00F0FF] to-blue-600 text-black'}`}>
                          {isHost ? 'YOU' : `P${idx + 1}`}
                        </div>
                        <span className="text-xs font-black text-white mb-1.5 truncate w-full text-center">{manager.name}</span>
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> READY
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 font-bold text-base mb-1.5">
                          ⏳
                        </div>
                        <span className="text-[11px] font-bold text-zinc-400 mb-2">بانتظار لاعب...</span>
                        <button 
                          onClick={() => {
                            const BOT_NAMES = [
                              'Pep AI (Tactical)',
                              'Ancelotti AI (Mastermind)',
                              'Klopp AI (Gegenpress)',
                              'Zidane AI (Legend)',
                              'Mourinho AI (Special)',
                              'Arteta AI (Process)',
                              'Tuchel AI (System)',
                              'Nagelsmann AI (Analyst)'
                            ];
                            const newBot = { id: `bot${managers.length}`, name: BOT_NAMES[managers.length - 1] || `Bot ${managers.length} (AI)`, budget: initialBudget, squad: [] };
                            setManagers(prev => [...prev, newBot]);
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold py-1 px-3 rounded-lg border border-white/10 transition cursor-pointer"
                        >
                          + إضافة بوت 🤖
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* START MATCH BUTTON */}
            <button 
              disabled={managers.length < 2}
              onClick={() => {
                startPracticeDraft(managers);
              }}
              className={`w-full py-4 rounded-2xl font-black text-xl uppercase tracking-widest shadow-2xl transition flex items-center justify-center gap-2 ${managers.length >= 2 ? 'bg-gradient-to-r from-[#00F0FF] to-blue-600 text-black shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-[1.02] cursor-pointer' : 'bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed'}`}
            >
              <Play className="w-6 h-6 fill-current" />
              {managers.length >= 2 ? `🚀 ابدأ مزاد المباراة الآن (${managers.length} مدربين)!` : 'بانتظار انضمام لاعبين للبدء...'}
            </button>

          </motion.div>
        </div>
      </div>
    );
  }

  // --- RENDER SQUAD BUILDER ---
  if (roomState === 'squad_builder') {
    const mySquad = me.squad;

    const swapSquadPositions = (idxA: number, idxB: number) => {
      const newSquad = [...mySquad];
      const temp = newSquad[idxA];
      newSquad[idxA] = newSquad[idxB];
      newSquad[idxB] = temp;
      setManagers(prev => prev.map(m => m.id === 'you' ? { ...m, squad: newSquad } : m));
    };

    const changePlayerPositionTag = (idx: number, newPos: string) => {
      const newSquad = [...mySquad];
      if (newSquad[idx]) {
        newSquad[idx] = { ...newSquad[idx], position: newPos };
      }
      setManagers(prev => prev.map(m => m.id === 'you' ? { ...m, squad: newSquad } : m));
      setEditingPositionIdx(null);
    };

    return (
      <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center p-6 bg-[#050811] text-white relative">
        <h2 className="text-4xl font-black text-[#00F0FF] neon-text mb-2 uppercase tracking-wider">SQUAD BUILDER</h2>
        <p className="text-zinc-400 mb-6 text-center max-w-xl text-sm">Change formation, swap player slots, or manually change any player's position (Defender to Midfield, Midfield to Attack, etc.)!</p>

        {/* Dynamic Formation Switcher */}
        <div className="flex gap-3 mb-6 bg-black/50 p-2 rounded-2xl border border-white/10 flex-wrap justify-center">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest self-center px-3">Tactical Formation:</span>
          {FORMATIONS.map(f => (
            <button 
              key={f} 
              onClick={() => setFormation(f)} 
              className={`px-4 py-1.5 rounded-xl font-black text-xs transition-all border ${formation === f ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Football Pitch Container */}
        <div className="w-full max-w-5xl h-[520px] mb-8 relative">
          <FootballPitch 
            squad={mySquad.slice(0, totalRounds)} 
            formation={formation}
            selectedIdx={selectedSwapIdx}
            onSelectPlayer={(idx) => {
              if (selectedSwapIdx === null) {
                setSelectedSwapIdx(idx);
              } else {
                swapSquadPositions(selectedSwapIdx, idx);
                setSelectedSwapIdx(null);
              }
            }}
            onOpenPositionEdit={(idx) => setEditingPositionIdx(idx)}
          />
        </div>

        {/* POSITION CUSTOMIZER POPUP */}
        {editingPositionIdx !== null && mySquad[editingPositionIdx] && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 border-2 border-[#00F0FF] rounded-3xl p-6 max-w-md w-full flex flex-col items-center">
              <h3 className="text-xl font-black text-white mb-2 uppercase">Change Position for {mySquad[editingPositionIdx].name}</h3>
              <p className="text-xs text-zinc-400 mb-4">Select new position tag (e.g. Move Defender to Midfield or Attack):</p>
              
              <div className="grid grid-cols-4 gap-2 w-full mb-6">
                {POSITIONS_LIST.map(pos => (
                  <button
                    key={pos}
                    onClick={() => changePlayerPositionTag(editingPositionIdx, pos)}
                    className={`py-2 rounded-xl font-black text-xs border ${mySquad[editingPositionIdx].position === pos ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}
                  >
                    {pos}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setEditingPositionIdx(null)}
                className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl font-bold text-xs text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Bench Players Bar */}
        <div className="flex gap-4 overflow-x-auto p-4 bg-black/60 backdrop-blur rounded-2xl w-full max-w-5xl border border-white/10 mb-8">
          <div className="text-white font-black self-center mr-2 uppercase tracking-widest text-xs">BENCH ({Math.max(0, mySquad.length - 11)}):</div>
          {mySquad.slice(11).map((sub, idx) => {
            const globalIdx = 11 + idx;
            const isSelected = selectedSwapIdx === globalIdx;
            return (
              <div 
                key={`sub-${idx}`} 
                onClick={() => {
                  if (selectedSwapIdx === null) {
                    setSelectedSwapIdx(globalIdx);
                  } else {
                    swapSquadPositions(selectedSwapIdx, globalIdx);
                    setSelectedSwapIdx(null);
                  }
                }}
                className={`flex flex-col items-center flex-shrink-0 w-20 p-2 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-[#00F0FF] bg-[#00F0FF]/20 scale-105 shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'border-white/10 bg-black/40 hover:bg-white/10'}`}
              >
                <div className="w-14 h-14 border-b-2 shadow-lg mb-1 relative flex items-end justify-center z-10 border-[#FFD700] bg-black/60 rounded overflow-hidden">
                  <img src={sub.image} alt={sub.name} className="w-[120%] h-[120%] object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <div className="absolute bottom-0 w-full text-center text-[9px] font-bold text-white bg-black/90">{sub.rating}</div>
                </div>
                <div className="text-[10px] text-white font-bold truncate w-full text-center">{sub.name.split(' ').pop()}</div>
                <div className="text-[8px] text-[#00F0FF] font-bold uppercase">{sub.position}</div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => setRoomState('match_result')}
          className="bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black px-12 py-4 rounded-2xl font-black text-xl hover:scale-105 transition shadow-[0_0_30px_rgba(255,215,0,0.5)] tracking-wider"
        >
          CONFIRM & START MATCH
        </button>
      </div>
    );
  }

  // --- RENDER MATCH RESULT ---
  if (roomState === 'match_result') {
    if (managers.length > 2) {
      return (
        <TournamentSimulator 
          managers={managers}
          formation={formation}
          botDifficulty={botDifficulty}
          onClose={() => setRoomState('squad_builder')}
        />
      );
    }
    return (
      <MatchSimulator 
        me={me}
        bot={managers.find(m => m.id === 'bot1') || managers[1]}
        formation={formation}
        botDifficulty={botDifficulty}
        onClose={() => setRoomState('squad_builder')}
      />
    );
  }

  // --- RENDER LIVE DRAFT ---
  return (
    <div className="flex flex-col h-screen bg-[#050811] relative overflow-hidden text-white">
      
      {/* REVEAL OVERLAY */}
      <AnimatePresence>
        {gameState.status === 'revealing' && revealData && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            <h2 className="text-2xl sm:text-4xl font-black text-[#00F0FF] mb-2 uppercase tracking-widest neon-text flex items-center gap-2 text-center">
              <Sparkles className="w-6 h-6 sm:w-10 sm:h-10 text-[#FFD700]" /> نتيجة الجولة {roundIndex + 1}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-zinc-400 mb-6 sm:mb-10 text-center">
              اللاعبون الحاصل عليها كل مدير فني في هذه الجولة:
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 max-w-6xl mb-6 sm:mb-12 max-h-[80vh] overflow-y-auto p-2">
              {revealData.results.map((data) => (
                <motion.div 
                  key={data.managerId}
                  initial={{ scale: 0, rotateY: 180, opacity: 0 }}
                  animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                  className={`fut-card p-4 sm:p-6 rounded-3xl w-60 sm:w-72 flex flex-col items-center border-4 ${data.isWinner ? 'border-[#FFD700] shadow-[0_0_40px_rgba(255,215,0,0.5)]' : 'border-[#00F0FF] shadow-[0_0_40px_rgba(0,240,255,0.5)]'} bg-black/80`}
                >
                  <div className={`text-xs sm:text-sm font-bold ${data.isWinner ? 'text-[#FFD700]' : 'text-[#00F0FF]'} uppercase tracking-widest mb-2 sm:mb-4 text-center truncate w-full flex items-center justify-center gap-1`}>
                    <span>{data.managerName}</span>
                    <span className="text-[10px] text-zinc-400">({data.isWinner ? 'فاز بالمزاد' : 'لاعب البكج/العشوائي'})</span>
                  </div>
                  <div className="w-28 h-28 sm:w-40 sm:h-40 border-b-4 border-[#FFD700] mb-2 sm:mb-4 flex items-end justify-center">
                    <img src={data.player.image} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1">{data.player.rating}</div>
                  <div className="text-base sm:text-xl font-black text-[#00F0FF] uppercase mb-1">{data.player.position}</div>
                  <div className="text-sm sm:text-lg font-bold text-zinc-200 text-center w-full truncate">{data.player.name}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MYSTERY PACK OVERLAY */}
      <AnimatePresence>
        {showMysteryPackUI && mysteryOptions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto"
          >
            <h2 className="text-2xl sm:text-4xl font-black text-[#FFD700] mb-2 uppercase tracking-widest text-center flex items-center gap-2 mt-4">
              <Sparkles className="w-8 h-8 text-[#FFD700]" /> اختر من بين 3 بكجات غامضة!
            </h2>
            <p className="text-sm sm:text-base font-bold text-zinc-300 mb-6 sm:mb-8 text-center max-w-xl">
              اختر بكج واحد فقط — البكجات المتبقية تبقى سرية! مركز اللاعب: <span className="text-[#00F0FF] font-black">{activePlayer?.position}</span>
            </p>

            {/* THE 3 PACK CARDS */}
            <div className="flex flex-col sm:flex-row justify-center items-stretch gap-4 sm:gap-8 mb-8 w-full max-w-3xl">
              {[0, 1, 2].map((idx) => {
                const isSelected = selectedPackIndex === idx;
                const isRevealed = selectedPackIndex !== null;
                const isLocked = isRevealed && !isSelected;

                return (
                  <motion.div
                    key={`pack-${idx}`}
                    onClick={() => {
                      if (!isRevealed) {
                        handleSelectMysteryPack(idx);
                      }
                    }}
                    whileHover={!isRevealed ? { scale: 1.05, y: -8 } : {}}
                    animate={isSelected ? { scale: 1.05 } : {}}
                    className={`relative flex-1 min-w-[180px] max-w-[220px] h-80 rounded-3xl cursor-pointer flex flex-col items-center justify-center border-4 transition-all duration-500 overflow-hidden ${
                      isSelected 
                        ? 'border-[#FFD700] shadow-[0_0_60px_rgba(255,215,0,0.7)] bg-gradient-to-b from-[#1a1000] to-black' 
                        : isLocked 
                          ? 'opacity-60 border-zinc-600 bg-zinc-900/60'
                          : 'border-[#00F0FF] hover:border-[#FFD700] bg-gradient-to-b from-[#0a1e3f] to-[#040d1a] shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                    }`}
                  >
                    {isSelected ? (
                      // CHOSEN pack — reveal it with gold glow
                      <motion.div 
                        initial={{ scale: 0.6, opacity: 0, rotateY: 180 }}
                        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                        transition={{ duration: 0.6, type: 'spring' }}
                        className="flex flex-col items-center p-4 h-full justify-center gap-2"
                      >
                        <div className="text-[#FFD700] text-xs font-black uppercase tracking-widest mb-1">✅ اخترت هذا!</div>
                        <div className="w-28 h-28 flex items-end justify-center">
                          <img src={mysteryOptions[idx].image} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                        <div className="text-4xl font-black text-white">{mysteryOptions[idx].rating}</div>
                        <div className="text-base font-black text-[#00F0FF] uppercase">{mysteryOptions[idx].position}</div>
                        <div className="text-sm font-bold text-zinc-200 text-center w-full truncate px-2">{mysteryOptions[idx].name}</div>
                      </motion.div>
                    ) : isLocked ? (
                      // UNCHOSEN dimmed pack
                      <div className="flex flex-col items-center p-4 h-full justify-center gap-2 opacity-50">
                        <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">❌ لم تختره</div>
                        <div className="w-20 h-20 opacity-40 flex items-end justify-center">
                          <img src={mysteryOptions[idx].image} className="w-full h-full object-contain grayscale" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                        <div className="text-2xl font-black text-zinc-400">{mysteryOptions[idx].rating}</div>
                        <div className="text-xs font-bold text-zinc-400 uppercase">{mysteryOptions[idx].position}</div>
                        <div className="text-xs font-bold text-zinc-400 text-center w-full truncate px-2">{mysteryOptions[idx].name}</div>
                      </div>
                    ) : (
                      // MYSTERY COVER
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-[#00F0FF]/10 border-2 border-[#00F0FF] flex items-center justify-center text-3xl font-black text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                          ❓
                        </div>
                        <span className="text-xs font-black text-white uppercase tracking-widest">بكج غامض #{idx + 1}</span>
                        <span className="text-[10px] text-zinc-400 font-bold">اضغط للاختيار 🎁</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* OPPONENT SQUAD SUMMARY IN MYSTERY OVERLAY */}
            <div className="w-full max-w-3xl bg-black/60 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-xs font-black text-[#00F0FF] uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#00F0FF]" /> تشكيلة المنافس الحالية ({opponent?.name || 'Opponent'})
                </span>
                <span className="text-[11px] font-bold text-zinc-400">لاعبون: {opponent?.squad.length || 0}/{totalRounds}</span>
              </div>
              <div>
                {opponent && opponent.squad.length > 0 ? (
                  <div className="flex flex-wrap gap-2 justify-start max-h-64 overflow-y-auto pr-1">
                    {opponent.squad.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 w-full">
                        <div className="w-7 h-7 rounded-md bg-black/60 border border-white/10 flex items-end justify-center overflow-hidden">
                          <img src={p.image} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-black text-[#00F0FF] uppercase">{p.position}</div>
                          <div className="text-[11px] font-bold text-white truncate">{p.name.split(' ').pop()}</div>
                        </div>
                        <div className="text-xs font-black text-[#FFD700]">{p.rating}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-xs italic">لم يحصل المنافس على لاعبين بعد</p>
                )}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* COPIED TOAST NOTIFICATION */}
      <AnimatePresence>
        {copiedToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#00F0FF] text-black font-black px-6 py-2.5 rounded-full shadow-[0_0_30px_rgba(0,240,255,0.6)] flex items-center gap-2 text-xs uppercase tracking-wider"
          >
            <Check className="w-4 h-4" /> 📋 تم نسخ رابط الغرفة (كود: {roomCode})! شاركه مع أصدقائك
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex-none min-h-[4rem] h-auto w-full flex flex-wrap sm:flex-nowrap items-center justify-between px-3 sm:px-6 py-2 z-10 border-b border-white/5 bg-black/40 backdrop-blur-md gap-2">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/lobby" className="text-zinc-400 hover:text-white transition flex items-center gap-1.5 text-xs sm:text-sm font-bold">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Leave
          </Link>
          <div className="h-6 sm:h-8 w-px bg-white/10" />

          {/* ROOM CODE BADGE & SHARE BUTTON */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-blue-900/50 border border-[#00F0FF]/40 px-3 py-1 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Key className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase hidden sm:inline">CODE:</span>
            <span className="text-xs sm:text-sm font-black text-[#00F0FF] tracking-widest uppercase">{roomCode}</span>
            <button 
              onClick={() => {
                const shareUrl = window.location.href;
                navigator.clipboard.writeText(shareUrl);
                setCopiedToast(true);
                setTimeout(() => setCopiedToast(false), 2500);
              }}
              className="ml-1 bg-[#00F0FF]/20 hover:bg-[#00F0FF]/40 text-[#00F0FF] px-2 py-0.5 rounded-lg transition flex items-center gap-1 text-[10px] font-black uppercase cursor-pointer"
              title="Copy Room Link to Share"
            >
              {copiedToast ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3 text-[#00F0FF]" />}
              {copiedToast ? 'COPIED!' : 'SHARE'}
            </button>
          </div>

          <h1 className="text-sm sm:text-xl font-black text-white flex items-center gap-1.5">
            ROUND <span className="text-[#00F0FF]">{roundIndex + 1}/{totalRounds}</span>
          </h1>
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/5 border border-white/10">
            <span className="text-zinc-400">BOT:</span>
            <span className={
              botDifficulty === 'legendary' ? 'text-red-400 font-extrabold animate-pulse' :
              botDifficulty === 'hard' ? 'text-amber-400' :
              botDifficulty === 'easy' ? 'text-emerald-400' : 'text-blue-400'
            }>
              {botDifficulty === 'legendary' ? '🔥 LEGENDARY (UNBEATABLE)' : botDifficulty.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap overflow-x-auto">
          {managers.map((m, idx) => (
            <React.Fragment key={m.id}>
              <div className={`flex flex-col ${m.id === 'you' ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate max-w-[80px]">{m.name}</span>
                <div className={`glass-panel px-2.5 sm:px-4 py-1 rounded-full flex items-center gap-1 sm:gap-2 border-opacity-30 bg-opacity-10 border ${m.id === 'you' ? 'border-[#FFD700] bg-[#FFD700] text-[#FFD700]' : 'border-[#00F0FF] bg-[#00F0FF] text-[#00F0FF]'}`}>
                  <span className="font-black text-xs sm:text-sm md:text-base">{formatMoney(m.budget)}</span>
                </div>
              </div>
              {idx < managers.length - 1 && <div className="h-6 sm:h-8 w-px bg-white/10 mx-0.5" />}
            </React.Fragment>
          ))}
        </div>
      </header>

      <main className="flex-1 flex w-full relative z-10 overflow-y-auto">
        <aside className="w-[350px] border-r border-white/5 bg-black/20 backdrop-blur-sm flex flex-col hidden xl:flex relative">
          <div className="p-6 border-b border-white/5 bg-black/40 flex justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Your Squad XI</h2>
            <span className="text-xs text-zinc-400 font-bold">{me.squad.length}/{totalRounds}</span>
          </div>
          <div className="flex-1 relative p-4 min-h-[500px]">
            <FootballPitch squad={me.squad} formation={formation} />
          </div>
        </aside>

        <section className="flex-1 flex flex-col items-center py-8 px-4 relative min-h-max">
          <div className="flex flex-col items-center mb-6">
            <div className={`text-6xl md:text-7xl font-black ${gameState.seconds_remaining <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              00:{gameState.seconds_remaining.toString().padStart(2, '0')}
            </div>
          </div>

          {/* ACTIVE PLAYER CARD */}
          {activePlayer ? (
            <div className={`fut-card w-full max-w-[340px] h-[460px] rounded-[2.5rem] flex flex-col items-center justify-between p-6 relative overflow-hidden ${activePlayer.rating >= 90 ? 'bg-gradient-to-br from-[#1a1500] to-black border-4 border-[#FFD700] shadow-[0_0_50px_rgba(255,215,0,0.8)]' : 'bg-black/60 border-2 border-white/10'}`}>
              <div className="flex justify-between w-full z-10">
                <div className="flex flex-col items-start">
                  <span className={`text-5xl font-black ${activePlayer.rating >= 90 ? 'text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-white' : 'text-white'}`}>{activePlayer.rating}</span>
                  <span className="text-lg font-bold text-[#00F0FF]">{activePlayer.position}</span>
                </div>
                {activePlayer.club && (
                  <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-zinc-300 self-start">{activePlayer.club}</span>
                )}
              </div>
              <div className="w-52 h-52 z-20 flex items-center justify-center">
                <img src={activePlayer.image} alt={activePlayer.name} className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <div className="flex flex-col items-center w-full z-10 bg-black/70 backdrop-blur p-4 rounded-2xl border border-white/10">
                <h3 className="text-xl font-black uppercase text-center truncate w-full text-white">{activePlayer.name}</h3>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[340px] h-[460px] rounded-[2.5rem] bg-black/40 border-2 border-dashed border-white/20 flex flex-col items-center justify-center p-6 text-zinc-400 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-[#00F0FF]" />
              <span className="font-bold text-sm">جاري جلب لاعب المزاد...</span>
            </div>
          )}

          {/* BANKRUPT OPPONENT OPTION PROMPT */}
          {isOpponentBankrupt ? (
            <div className="mt-8 flex flex-col items-center bg-purple-950/80 backdrop-blur-md p-6 rounded-3xl border-2 border-purple-500 shadow-2xl w-full max-w-[480px]">
              <span className="text-xs font-black text-purple-300 uppercase tracking-widest mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> المنافس لا يملك ميزانية!
              </span>
              <h3 className="text-lg font-black text-white text-center mb-4">اختر المبلغ الذي تود خصمه من ميزانيتك للاستحواذ:</h3>

              {/* Budget selector buttons */}
              <div className="grid grid-cols-4 gap-2 mb-4 w-full">
                {[1000000, 5000000, 10000000, 20000000].map(val => (
                  <button 
                    key={val} 
                    onClick={() => setBankruptPrice(val)}
                    className={`py-2 rounded-xl font-black text-xs transition border ${bankruptPrice === val ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-white/10 text-white border-white/10 hover:bg-white/20'}`}
                  >
                    {val / 1000000}M €
                  </button>
                ))}
              </div>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => handleBankruptAction('keep_player')}
                  className="flex-1 bg-gradient-to-r from-[#00F0FF] to-[#0052FF] text-white py-3 rounded-xl font-black text-xs shadow-lg uppercase"
                >
                  أخذ {activePlayer?.name.split(' ').pop()} بالسعر ({bankruptPrice / 1000000}M)
                </button>
                <button 
                  onClick={() => handleBankruptAction('random_player')}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-black py-3 rounded-xl font-black text-xs shadow-lg uppercase flex items-center justify-center gap-1"
                >
                  <Shuffle className="w-4 h-4" /> أخذ لاعب عشوائي ({bankruptPrice / 1000000}M)
                </button>
              </div>
            </div>
          ) : (
            /* INITIAL BID & ACTIVE BID CONTROLS */
            <div className="mt-8 flex flex-col items-center bg-black/50 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/10 shadow-2xl w-full max-w-[440px]">
              {gameState.waiting_initial_bid ? (
                <div className="text-center w-full">
                  <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-widest mb-1 block animate-pulse">Set Starting Bid</span>
                  {gameState.turn_manager_id === 'you' ? (
                    <div>
                      <h3 className="text-lg font-black text-white mb-3">It's your turn! Pick or enter opening price:</h3>
                      
                      {/* Quick Preset Buttons */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {[1000000, 5000000, 10000000, 20000000].map(val => (
                          <button 
                            key={val} 
                            onClick={() => handleSetInitialBid(val)}
                            className="bg-white/10 hover:bg-[#00F0FF] hover:text-black py-2 rounded-xl font-black text-xs transition border border-white/10"
                          >
                            {val / 1000000}M €
                          </button>
                        ))}
                      </div>

                      <form onSubmit={(e) => { e.preventDefault(); handleSetInitialBid(); }} className="flex gap-2 w-full">
                        <input 
                          type="text" 
                          placeholder="Custom (e.g., 15M, 5M)..." 
                          value={customBid} 
                          onChange={(e) => setCustomBid(e.target.value)} 
                          className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-[#00F0FF]" 
                        />
                        <button type="submit" className="bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black px-5 py-2.5 rounded-xl font-black shadow-[0_0_15px_rgba(255,215,0,0.4)] text-xs whitespace-nowrap">
                          SET START
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="text-md font-bold text-zinc-300 py-3">
                      Waiting for opponent ({managers.find(m => m.id === gameState.turn_manager_id)?.name}) to set opening price...
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full text-center">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Current Highest Bid</span>
                  <div className={`text-4xl font-black mb-2 neon-text ${gameState.winning_manager_id === 'you' ? 'text-[#00F0FF]' : 'text-rose-400'}`}>
                    {formatMoney(gameState.current_bid)}
                  </div>

                  {gameState.winning_manager_id !== 'you' && gameState.winning_manager_id ? (
                    <div className="animate-pulse text-xs font-black text-rose-400 bg-rose-500/20 border border-rose-500/40 px-4 py-1.5 rounded-full mb-4 inline-flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>المنافس ({managers.find(m => m.id === gameState.winning_manager_id)?.name}) زايد وسرق الصدارة!</span>
                    </div>
                  ) : gameState.winning_manager_id === 'you' ? (
                    <div className="text-xs font-black text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-4 py-1.5 rounded-full mb-4 inline-flex items-center gap-1.5">
                      <span>✅</span>
                      <span>أنت متصدر المزاد حالياً!</span>
                    </div>
                  ) : (
                    <div className="text-xs font-black text-zinc-400 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-4 inline-flex items-center gap-1.5">
                      <span>⏳</span>
                      <span>بانتظار بدء المزايدة...</span>
                    </div>
                  )}

                  <div className="flex gap-3 mb-3 w-full">
                    <button onClick={() => handleBid(gameState.current_bid + 1000000)} className="flex-1 glass-panel py-3 rounded-xl font-black text-white hover:bg-white/20 transition text-sm">+ 1M €</button>
                    <button onClick={() => handleBid(gameState.current_bid + 5000000)} className="flex-1 glass-panel py-3 rounded-xl font-black text-white hover:bg-white/20 transition text-sm">+ 5M €</button>
                  </div>

                  <form onSubmit={handleCustomBidSubmit} className="flex gap-2 w-full">
                    <input 
                      type="text" 
                      placeholder="Custom bid..." 
                      value={customBid} 
                      onChange={(e) => setCustomBid(e.target.value)} 
                      className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-[#00F0FF]" 
                    />
                    <button type="submit" className="bg-gradient-to-r from-[#0052FF] to-[#00F0FF] text-white px-6 py-2.5 rounded-xl font-black text-xs whitespace-nowrap shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                      BID NOW
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="w-[300px] border-l border-white/5 bg-black/20 backdrop-blur-sm flex flex-col hidden 2xl:flex relative">
          <div className="p-6 border-b border-white/5 bg-black/40 flex justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Opponent Squads</h2>
          </div>
          <div className="flex-1 relative p-4 overflow-y-auto flex flex-col gap-6">
            {managers.filter(m => m.id !== 'you').map(m => (
              <div key={m.id} className="flex flex-col bg-black/40 p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-[#00F0FF] uppercase">{m.name}</span>
                  <span className="text-[10px] text-zinc-500 font-bold">{m.squad.length}/{totalRounds}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {m.squad.length === 0 ? <span className="text-xs text-zinc-600">No players drafted</span> : m.squad.map((p, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-black/80 border border-white/10 rounded-full flex justify-center items-end overflow-hidden relative">
                        <img src={p.image} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <span className="absolute bottom-0 text-[8px] bg-black/90 w-full text-center font-bold text-zinc-300">{p.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}

function FootballPitch({ 
  squad, 
  formation = '4-3-3', 
  selectedIdx, 
  onSelectPlayer,
  onOpenPositionEdit 
}: { 
  squad: (Player | null)[], 
  formation?: string, 
  selectedIdx?: number | null, 
  onSelectPlayer?: (idx: number) => void,
  onOpenPositionEdit?: (idx: number) => void 
}) {
  const getCategory = (pos: string) => {
    if (['ST', 'CF', 'LW', 'RW', 'LF', 'RF'].includes(pos)) return 'ATT';
    if (['CDM', 'CM', 'CAM', 'LM', 'RM', 'LAM', 'RAM'].includes(pos)) return 'MID';
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return 'DEF';
    if (pos === 'GK') return 'GK';
    return 'MID';
  };

  const lines = {
    ATT: squad.map((p, i) => ({ player: p, index: i })).filter(item => item.player && getCategory(item.player.position) === 'ATT'),
    MID: squad.map((p, i) => ({ player: p, index: i })).filter(item => item.player && getCategory(item.player.position) === 'MID'),
    DEF: squad.map((p, i) => ({ player: p, index: i })).filter(item => item.player && getCategory(item.player.position) === 'DEF'),
    GK: squad.map((p, i) => ({ player: p, index: i })).filter(item => item.player && getCategory(item.player.position) === 'GK'),
  };

  const renderLine = (playersData: {player: Player | null, index: number}[], bottomPercent: string) => {
    return playersData.map((data, idx) => {
      const { player, index } = data;
      if (!player) return null;
      const leftPercent = `${((idx + 1) * 100) / (playersData.length + 1)}%`;
      const isSelected = selectedIdx === index;

      return (
        <motion.div 
          key={`${player.id}-${index}`}
          onClick={() => onSelectPlayer && onSelectPlayer(index)}
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className={`absolute w-16 h-20 flex flex-col items-center justify-center z-10 cursor-pointer transition-all ${isSelected ? 'scale-125 z-30' : 'hover:scale-110'}`}
          style={{ bottom: bottomPercent, left: leftPercent, transform: 'translate(-50%, 50%)' }}
        >
          <div className={`w-11 h-11 border-2 shadow-xl mb-1 relative flex items-end justify-center text-[8px] font-black rounded-full overflow-hidden ${isSelected ? 'border-[#00F0FF] ring-4 ring-[#00F0FF]/50 bg-black' : 'border-[#FFD700] bg-black/70'}`}>
            <img src={player.image} alt={player.name} className="w-[120%] h-[120%] object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div className="absolute bottom-0 w-full text-center text-[8px] font-bold text-white bg-black/80">{player.rating}</div>
          </div>
          
          <div className="flex items-center gap-1 bg-black/90 px-2 py-0.5 rounded-full border border-white/20 shadow-md">
            <span className="text-[9px] font-black text-white truncate max-w-[55px]">{player.name.split(' ').pop()}</span>
            {onOpenPositionEdit && (
              <button 
                onClick={(e) => { e.stopPropagation(); onOpenPositionEdit(index); }}
                className="text-[8px] font-bold text-[#00F0FF] hover:underline uppercase bg-white/10 px-1 rounded"
                title="Change Position"
              >
                {player.position}
              </button>
            )}
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div className="w-full h-full min-h-[420px] relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-gradient-to-b from-[#1c4b27] to-[#123319]">
      <div className="absolute inset-4 border border-white/30 rounded-2xl" />
      <div className="absolute top-1/2 left-4 right-4 border-t border-white/30 -translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full border border-white/30 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-white/60 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-4 left-1/2 w-44 h-20 border border-white/30 -translate-x-1/2 border-b-0 rounded-t-xl" />
      <div className="absolute top-4 left-1/2 w-44 h-20 border border-white/30 -translate-x-1/2 border-t-0 rounded-b-xl" />
      
      {renderLine(lines.ATT, '75%')}
      {renderLine(lines.MID, '50%')}
      {renderLine(lines.DEF, '25%')}
      {renderLine(lines.GK, '8%')}
    </div>
  );
}

interface MatchSimulatorProps {
  me: Manager;
  bot: Manager;
  formation: string;
  botDifficulty?: string;
  onClose: () => void;
}

const calculateTacticalSquadRating = (squad: Player[], isBot: boolean = false, difficulty: string = 'medium'): { totalRating: number; attRating: number; midRating: number; defRating: number; gkRating: number } => {
  if (!squad || squad.length === 0) {
    return { totalRating: 70, attRating: 70, midRating: 70, defRating: 70, gkRating: 70 };
  }

  const getCatLocal = (pos: string) => {
    if (['ST', 'CF', 'LW', 'RW', 'LF', 'RF'].includes(pos)) return 'ATT';
    if (['CDM', 'CM', 'CAM', 'LM', 'RM', 'LAM', 'RAM'].includes(pos)) return 'MID';
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return 'DEF';
    if (pos === 'GK') return 'GK';
    return 'MID';
  };

  const sorted = [...squad].sort((a, b) => b.rating - a.rating);

  const atts = sorted.filter(p => getCatLocal(p.position) === 'ATT');
  const mids = sorted.filter(p => getCatLocal(p.position) === 'MID');
  const defs = sorted.filter(p => getCatLocal(p.position) === 'DEF');
  const gks = sorted.filter(p => getCatLocal(p.position) === 'GK');

  const bestAtts = atts.slice(0, 3);
  const bestMids = mids.slice(0, 3);
  const bestDefs = defs.slice(0, 4);
  const bestGk = gks[0] || sorted[0];

  const attRating = bestAtts.length > 0 ? bestAtts.reduce((a, b) => a + b.rating, 0) / bestAtts.length : (sorted[0]?.rating || 75);
  const midRating = bestMids.length > 0 ? bestMids.reduce((a, b) => a + b.rating, 0) / bestMids.length : (sorted[0]?.rating || 75);
  const defRating = bestDefs.length > 0 ? bestDefs.reduce((a, b) => a + b.rating, 0) / bestDefs.length : (sorted[0]?.rating || 75);
  const gkRating = bestGk ? bestGk.rating : 75;

  const startingXIRating = (attRating * 0.35) + (midRating * 0.30) + (defRating * 0.25) + (gkRating * 0.10);

  const starCount = sorted.filter(p => p.rating >= 90).length;
  const starBonus = starCount * 1.5;

  const hasFullBalance = atts.length >= 2 && mids.length >= 3 && defs.length >= 3 && gks.length >= 1;
  const balanceBonus = hasFullBalance ? 3 : 0;

  let diffBonus = 0;
  if (isBot) {
    if (difficulty === 'easy') diffBonus = -12;
    if (difficulty === 'hard') diffBonus = +6;
    if (difficulty === 'legendary') diffBonus = +25;
  }

  const finalTotal = Math.round(startingXIRating + starBonus + balanceBonus + diffBonus);

  return {
    totalRating: finalTotal,
    attRating: Math.round(attRating + starBonus),
    midRating: Math.round(midRating + balanceBonus),
    defRating: Math.round(defRating),
    gkRating: Math.round(gkRating)
  };
};

function MatchSimulator({ me, bot, formation, botDifficulty = 'medium', onClose }: MatchSimulatorProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("جاري تحليل طاقات اللاعبين وتكتيكات الخطوط...");
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<any>(null);
  const [matchRecorded, setMatchRecorded] = useState<any>(null);

  useEffect(() => {
    const myTac = calculateTacticalSquadRating(me.squad, false, botDifficulty);
    const botTac = calculateTacticalSquadRating(bot.squad, true, botDifficulty);

    const diff = myTac.totalRating - botTac.totalRating;

    // === REALISTIC SCORE ENGINE ===
    // Weighted score pools inspired by real football statistics.
    // A random draw picks a realistic final score, then biased by diff.
    type ScorePair = [number, number]; // [myGoals, botGoals]

    const pickWeighted = (options: ScorePair[], weights: number[]): ScorePair => {
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      for (let i = 0; i < options.length; i++) {
        r -= weights[i];
        if (r <= 0) return options[i];
      }
      return options[options.length - 1];
    };

    // Score distributions for different difficulty levels
    let myGoals = 0;
    let botGoals = 0;

    if (botDifficulty === 'easy') {
      // Easy: You almost always win comfortably
      const easyCombos: ScorePair[] = [[2,0],[3,0],[2,1],[3,1],[1,0],[4,0],[4,1],[3,2]];
      const easyWeights = [25, 20, 20, 12, 10, 6, 5, 2];
      [myGoals, botGoals] = pickWeighted(easyCombos, easyWeights);

    } else if (botDifficulty === 'legendary') {
      // Legendary: Bot dominates heavily
      const legendCombos: ScorePair[] = [[0,3],[0,2],[1,3],[0,4],[1,2],[0,1],[1,4],[2,3],[2,4]];
      const legendWeights = [20, 18, 15, 12, 12, 10, 7, 4, 2];
      [myGoals, botGoals] = pickWeighted(legendCombos, legendWeights);

    } else {
      // Medium / Hard: Realistic football distribution
      // Outcomes weighted by rating diff.
      // diff > 8: favored to win, diff < -8: likely to lose, else competitive
      const winCombos: ScorePair[]   = [[1,0],[2,0],[2,1],[3,1],[1,0],[2,1],[3,0],[2,0]];
      const winWeights               = [28,  22,  20,  10,  8,   6,   4,   2  ];
      const drawCombos: ScorePair[]  = [[1,1],[0,0],[2,2],[1,1],[0,0],[2,2]];
      const drawWeights              = [40,  25,  15,  10,  8,   2  ];
      const lossCombos: ScorePair[]  = [[0,1],[0,2],[1,2],[0,1],[1,3],[0,3],[1,2]];
      const lossWeights              = [28,  22,  20,  12,  8,   6,   4  ];

      // Difficulty modifier affects outcome probability
      const diffMod = botDifficulty === 'hard' ? diff - 6 : diff;
      const rand = Math.random();

      if (diffMod > 8) {
        // Clearly better team — 75% win, 15% draw, 10% loss
        if (rand < 0.75) [myGoals, botGoals] = pickWeighted(winCombos, winWeights);
        else if (rand < 0.90) [myGoals, botGoals] = pickWeighted(drawCombos, drawWeights);
        else [myGoals, botGoals] = pickWeighted(lossCombos, lossWeights);
      } else if (diffMod > 2) {
        // Slight edge — 55% win, 25% draw, 20% loss
        if (rand < 0.55) [myGoals, botGoals] = pickWeighted(winCombos, winWeights);
        else if (rand < 0.80) [myGoals, botGoals] = pickWeighted(drawCombos, drawWeights);
        else [myGoals, botGoals] = pickWeighted(lossCombos, lossWeights);
      } else if (diffMod > -2) {
        // Even match — 38% win, 30% draw, 32% loss
        if (rand < 0.38) [myGoals, botGoals] = pickWeighted(winCombos, winWeights);
        else if (rand < 0.68) [myGoals, botGoals] = pickWeighted(drawCombos, drawWeights);
        else [myGoals, botGoals] = pickWeighted(lossCombos, lossWeights);
      } else if (diffMod > -8) {
        // Slight disadvantage — 20% win, 25% draw, 55% loss
        if (rand < 0.20) [myGoals, botGoals] = pickWeighted(winCombos, winWeights);
        else if (rand < 0.45) [myGoals, botGoals] = pickWeighted(drawCombos, drawWeights);
        else [myGoals, botGoals] = pickWeighted(lossCombos, lossWeights);
      } else {
        // Clear underdog — 10% win, 15% draw, 75% loss
        if (rand < 0.10) [myGoals, botGoals] = pickWeighted(winCombos, winWeights);
        else if (rand < 0.25) [myGoals, botGoals] = pickWeighted(drawCombos, drawWeights);
        else [myGoals, botGoals] = pickWeighted(lossCombos, lossWeights);
      }
    }

    const myPoss = botDifficulty === 'legendary'
      ? Math.floor(Math.random() * 15) + 25
      : botDifficulty === 'easy'
      ? Math.floor(Math.random() * 20) + 60
      : Math.min(70, Math.max(30, 50 + diff * 2 + Math.floor(Math.random() * 10 - 5)));

    const scorersMe = me.squad.filter(p => ['ATT', 'MID'].includes(getCat(p.position)));
    const scorersBot = bot.squad.filter(p => ['ATT', 'MID'].includes(getCat(p.position)));
    const defMe = me.squad.filter(p => getCat(p.position) === 'DEF');
    const defBot = bot.squad.filter(p => getCat(p.position) === 'DEF');

    const myShotsOn = myGoals + Math.floor(Math.random() * 3);
    const botShotsOn = botGoals + Math.floor(Math.random() * 5) + 2;
    const myShotsTotal = myShotsOn + Math.floor(Math.random() * 4) + 1;
    const botShotsTotal = botShotsOn + Math.floor(Math.random() * 5) + 3;
    const myCorners = Math.floor(Math.random() * 6) + 1;
    const botCorners = Math.floor(Math.random() * 7) + 3;
    const myFouls = Math.floor(Math.random() * 8) + 3;
    const botFouls = Math.floor(Math.random() * 6) + 2;
    const myYellow = Math.floor(Math.random() * 3);
    const botYellow = Math.floor(Math.random() * 2);
    const myPassAcc = botDifficulty === 'legendary' ? 72 : Math.min(95, Math.max(70, 80 + diff + Math.floor(Math.random() * 8 - 4)));
    const botPassAcc = botDifficulty === 'legendary' ? Math.floor(Math.random() * 4) + 95 : Math.min(95, Math.max(70, 80 - diff + Math.floor(Math.random() * 8 - 4)));
    const myOffsides = Math.floor(Math.random() * 4);
    const botOffsides = Math.floor(Math.random() * 4);

    const allMinutes = Array.from({length: 90}, (_, i) => i + 1).sort(() => 0.5 - Math.random());

    const myEvents: { minute: number; type: 'goal' | 'yellow' | 'red'; player: string }[] = [];
    const botEvents: { minute: number; type: 'goal' | 'yellow' | 'red'; player: string }[] = [];

    // Goals
    for (let i = 0; i < myGoals; i++) {
      const scorer = scorersMe[Math.floor(Math.random() * scorersMe.length)] || me.squad[0];
      myEvents.push({ minute: allMinutes[i], type: 'goal', player: scorer?.name ? (scorer.name.split(' ').length > 1 ? `${scorer.name.split(' ')[0][0]}. ${scorer.name.split(' ').slice(1).join(' ')}`.toUpperCase() : scorer.name.toUpperCase()) : 'PLAYER' });
    }
    for (let i = 0; i < botGoals; i++) {
      const scorer = scorersBot[Math.floor(Math.random() * scorersBot.length)] || bot.squad[0];
      botEvents.push({ minute: allMinutes[myGoals + i], type: 'goal', player: scorer?.name ? (scorer.name.split(' ').length > 1 ? `${scorer.name.split(' ')[0][0]}. ${scorer.name.split(' ').slice(1).join(' ')}`.toUpperCase() : scorer.name.toUpperCase()) : 'PLAYER' });
    }

    // Yellow cards
    for (let i = 0; i < myYellow; i++) {
      const p = me.squad[Math.floor(Math.random() * me.squad.length)];
      if (p) myEvents.push({ minute: Math.floor(Math.random() * 80) + 10, type: 'yellow', player: p.name.split(' ').pop()?.toUpperCase() || 'PLAYER' });
    }
    for (let i = 0; i < botYellow; i++) {
      const p = bot.squad[Math.floor(Math.random() * bot.squad.length)];
      if (p) botEvents.push({ minute: Math.floor(Math.random() * 80) + 10, type: 'yellow', player: p.name.split(' ').pop()?.toUpperCase() || 'PLAYER' });
    }

    // Red cards (25% chance)
    let myRed = 0;
    let botRed = 0;
    if (Math.random() < 0.25) {
      myRed = 1;
      const p = defMe[Math.floor(Math.random() * defMe.length)] || me.squad[0];
      if (p) myEvents.push({ minute: Math.floor(Math.random() * 35) + 55, type: 'red', player: p.name.split(' ').pop()?.toUpperCase() || 'PLAYER' });
    }
    if (Math.random() < 0.25) {
      botRed = 1;
      const p = defBot[Math.floor(Math.random() * defBot.length)] || bot.squad[0];
      if (p) botEvents.push({ minute: Math.floor(Math.random() * 35) + 55, type: 'red', player: p.name.split(' ').pop()?.toUpperCase() || 'PLAYER' });
    }

    myEvents.sort((a, b) => a.minute - b.minute);
    botEvents.sort((a, b) => a.minute - b.minute);

    setMatchData({
      score: { me: myGoals, bot: botGoals },
      possession: { me: myPoss, bot: 100 - myPoss },
      shotsOn: { me: myShotsOn, bot: botShotsOn },
      shotsTotal: { me: myShotsTotal, bot: botShotsTotal },
      corners: { me: myCorners, bot: botCorners },
      fouls: { me: myFouls, bot: botFouls },
      yellows: { me: myYellow, bot: botYellow },
      reds: { me: myRed, bot: botRed },
      passAcc: { me: myPassAcc, bot: botPassAcc },
      offsides: { me: myOffsides, bot: botOffsides },
      myEvents,
      botEvents,
      motm: (myGoals > botGoals ? scorersMe : scorersBot)[0] || me.squad[0],
    });

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setLoading(false); return 100; }
        if (p === 30) setStatusText("محاكاة مجريات المباراة...");
        if (p === 60) setStatusText("حساب التسديدات والتمريرات...");
        if (p === 85) setStatusText("تجميع الإحصائيات...");
        return p + 5;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading && matchData && !matchRecorded) {
      const isWin = matchData.score.me > matchData.score.bot;
      const isDraw = matchData.score.me === matchData.score.bot;
      const resType = isWin ? 'win' : isDraw ? 'draw' : 'loss';
      
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${API_BASE}/api/user/record-match`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ result: resType })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setMatchRecorded(data);
          }
        })
        .catch(console.error);
      }
    }
  }, [loading, matchData, matchRecorded]);

  if (loading) {
    return (
      <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center p-6 bg-[#03060f] text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black z-0 pointer-events-none" />
        <div className="z-10 flex flex-col items-center max-w-md w-full">
          <Loader2 className="w-16 h-16 text-[#00F0FF] animate-spin mb-6" />
          <h2 className="text-3xl font-black mb-2 uppercase tracking-widest text-[#00F0FF] text-center">جاري محاكاة المباراة</h2>
          <p className="text-zinc-400 text-sm mb-8 text-center">{statusText}</p>
          <div className="w-full bg-white/5 border border-white/10 h-3 rounded-full overflow-hidden mb-2">
            <div className="bg-gradient-to-r from-[#00F0FF] to-[#0052FF] h-full transition-all duration-150" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-black text-zinc-500">{progress}%</span>
        </div>
      </div>
    );
  }

  if (!matchData) return null;
  const { score, possession, shotsOn, shotsTotal, corners, fouls, yellows, reds, passAcc, offsides, myEvents, botEvents, motm } = matchData;
  const isWin = score.me > score.bot;
  const isDraw = score.me === score.bot;

  return (
    <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-start bg-[#03050c] text-white relative overflow-y-auto selection:bg-[#00F0FF]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#03050c] to-black z-0 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[350px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-red-600/10 blur-[140px] rounded-full pointer-events-none z-0" />

      <div className="z-10 w-full max-w-4xl flex flex-col items-center pt-8 pb-16 px-4">

        {/* === EA FC BROADCAST FULL TIME CARD (1:1 Reference Match) === */}
        <div className="relative w-full bg-gradient-to-b from-[#0a1324] via-[#0d182b] to-[#060a14] border-2 border-[#00F0FF]/30 rounded-[2.5rem] shadow-[0_0_60px_rgba(0,120,255,0.25)] p-6 sm:p-10 mb-10 overflow-visible">
          
          {/* Top border glowing accents */}
          <div className="absolute top-0 left-0 w-1/2 h-1 bg-gradient-to-r from-[#00F0FF] to-transparent rounded-tl-full" />
          <div className="absolute top-0 right-0 w-1/2 h-1 bg-gradient-to-l from-red-500 to-transparent rounded-tr-full" />

          {/* FULL TIME Header Badge */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-b from-zinc-700 via-zinc-800 to-black border border-white/20 px-8 py-1.5 rounded-full shadow-[0_4px_25px_rgba(0,0,0,0.9)] z-20 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-black italic tracking-[0.25em] text-white uppercase drop-shadow">FULL TIME</span>
          </div>

          {/* Score Header Row */}
          <div className="grid grid-cols-3 items-center pt-4 mb-6">
            
            {/* Left Team (Blue Warriors / Player) */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-2 flex items-center justify-center">
                <div className="w-full h-full rounded-3xl bg-gradient-to-b from-blue-600 via-blue-800 to-blue-950 border-4 border-blue-400/80 shadow-[0_0_30px_rgba(0,149,255,0.4)] flex flex-col items-center justify-center relative overflow-hidden">
                  <span className="text-[#FFD700] font-bold text-xs absolute top-1">★</span>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center text-3xl shadow-inner mt-2">
                    ⚽
                  </div>
                </div>
              </div>
              <span className="font-black text-sm sm:text-base text-white uppercase tracking-wider text-center drop-shadow-md truncate max-w-full">
                {me.name.toUpperCase() || 'BLUE WARRIORS'}
              </span>
            </div>

            {/* Score Numerals */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-3 sm:gap-6 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
                <span className={`text-6xl sm:text-8xl font-black italic tracking-tighter ${isWin ? 'text-white drop-shadow-[0_0_20px_rgba(0,240,255,0.8)]' : 'text-white'}`}>
                  {score.me}
                </span>
                <span className="text-3xl sm:text-5xl font-black text-zinc-500">-</span>
                <span className={`text-6xl sm:text-8xl font-black italic tracking-tighter ${!isWin && !isDraw ? 'text-white drop-shadow-[0_0_20px_rgba(255,0,80,0.8)]' : 'text-white'}`}>
                  {score.bot}
                </span>
              </div>
            </div>

            {/* Right Team (Red United / Opponent) */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-2 flex items-center justify-center">
                <div className="w-full h-full rounded-3xl bg-gradient-to-b from-red-600 via-rose-800 to-red-950 border-4 border-red-400/80 shadow-[0_0_30px_rgba(255,0,80,0.4)] flex flex-col items-center justify-center relative overflow-hidden">
                  <span className="text-[#FFD700] font-bold text-xs absolute top-1">★</span>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center text-3xl shadow-inner mt-2">
                    ⚽
                  </div>
                </div>
              </div>
              <span className="font-black text-sm sm:text-base text-white uppercase tracking-wider text-center drop-shadow-md truncate max-w-full">
                {bot.name.toUpperCase() || 'RED UNITED'}
              </span>
            </div>

          </div>

          {/* MATCH EVENTS LIST (Goals ⚽, Red Cards 🟥, Yellow Cards 🟨) */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10 text-xs sm:text-sm font-bold min-h-[90px]">
            
            {/* Left Team Events */}
            <div className="flex flex-col items-start gap-2 pl-2 sm:pl-6 border-r border-white/10">
              {myEvents.length === 0 ? (
                <span className="text-zinc-600 italic text-xs">No match events</span>
              ) : (
                myEvents.map((ev: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-zinc-200">
                    <span className="text-[#00F0FF] font-black">{ev.minute}'</span>
                    <span className="inline-flex items-center justify-center w-5 h-5">
                      {ev.type === 'goal' && <span className="text-sm">⚽</span>}
                      {ev.type === 'yellow' && <span className="w-2.5 h-3.5 bg-yellow-400 border border-yellow-200 rounded-[2px] shadow-sm inline-block" title="Yellow Card" />}
                      {ev.type === 'red' && <span className="w-2.5 h-3.5 bg-red-600 border border-red-300 rounded-[2px] shadow-sm inline-block" title="Red Card" />}
                    </span>
                    <span className="font-bold tracking-wide uppercase">{ev.player}</span>
                  </div>
                ))
              )}
            </div>

            {/* Right Team Events */}
            <div className="flex flex-col items-start gap-2 pl-2 sm:pl-6">
              {botEvents.length === 0 ? (
                <span className="text-zinc-600 italic text-xs">No match events</span>
              ) : (
                botEvents.map((ev: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-zinc-200">
                    <span className="text-red-400 font-black">{ev.minute}'</span>
                    <span className="inline-flex items-center justify-center w-5 h-5">
                      {ev.type === 'goal' && <span className="text-sm">⚽</span>}
                      {ev.type === 'yellow' && <span className="w-2.5 h-3.5 bg-yellow-400 border border-yellow-200 rounded-[2px] shadow-sm inline-block" title="Yellow Card" />}
                      {ev.type === 'red' && <span className="w-2.5 h-3.5 bg-red-600 border border-red-300 rounded-[2px] shadow-sm inline-block" title="Red Card" />}
                    </span>
                    <span className="font-bold tracking-wide uppercase">{ev.player}</span>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* CONTINUE BUTTON OVERLAPPING BOTTOM BORDER */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-30">
            <Link 
              href="/lobby"
              className="inline-block bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white font-black px-12 py-3 rounded-full border-2 border-blue-300 shadow-[0_0_30px_rgba(0,149,255,0.6)] hover:scale-105 transition tracking-widest text-sm uppercase cursor-pointer"
            >
              CONTINUE
            </Link>
          </div>

        </div>

        {/* Global Rank and Score Badge */}
        {matchRecorded && (
          <div className="w-full bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 border border-[#FFD700]/30 rounded-2xl p-4 mb-6 flex flex-wrap justify-between items-center text-xs sm:text-sm font-bold shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Match Outcome:</span>
              <strong className={isWin ? "text-emerald-400 font-black" : isDraw ? "text-zinc-300 font-black" : "text-rose-400 font-black"}>
                {isWin ? "🏆 WIN (+10 PTS)" : isDraw ? "🤝 DRAW (0 PTS)" : "😞 LOSS (-10 PTS)"}
              </strong>
            </div>
            <div className="flex items-center gap-4">
              <span>Total Score: <strong className={matchRecorded.score >= 0 ? "text-emerald-400 font-black" : "text-red-400 font-black"}>{matchRecorded.score >= 0 ? `+${matchRecorded.score}` : matchRecorded.score} PTS</strong></span>
              <span>World Rank: <strong className="text-[#FFD700] font-black">#{matchRecorded.global_rank}</strong></span>
            </div>
          </div>
        )}

        {/* TV BROADCAST MATCH STATISTICS TABLE */}
        <div className="w-full bg-[#0d1525] border border-white/10 rounded-2xl overflow-hidden mb-6 shadow-xl">
          <div className="bg-white/5 px-6 py-3 border-b border-white/10">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.15em] text-center">إحصائيات المباراة تفصيلياً</h3>
          </div>
          <div className="px-6 py-5 flex flex-col gap-5">
            <MatchStatRow label="الاستحواذ" valA={`${possession.me}%`} valB={`${possession.bot}%`} pctA={possession.me} />
            <MatchStatRow label="التسديدات" valA={`${shotsTotal.me}`} valB={`${shotsTotal.bot}`} pctA={shotsTotal.me / Math.max(1, shotsTotal.me + shotsTotal.bot) * 100} />
            <MatchStatRow label="على المرمى" valA={`${shotsOn.me}`} valB={`${shotsOn.bot}`} pctA={shotsOn.me / Math.max(1, shotsOn.me + shotsOn.bot) * 100} />
            <MatchStatRow label="دقة التمرير" valA={`${passAcc.me}%`} valB={`${passAcc.bot}%`} pctA={passAcc.me / Math.max(1, passAcc.me + passAcc.bot) * 100} />
            <MatchStatRow label="الركنيات" valA={`${corners.me}`} valB={`${corners.bot}`} pctA={corners.me / Math.max(1, corners.me + corners.bot) * 100} />
            <MatchStatRow label="الأخطاء" valA={`${fouls.me}`} valB={`${fouls.bot}`} pctA={fouls.me / Math.max(1, fouls.me + fouls.bot) * 100} />
            <MatchStatRow label="البطاقات الصفراء" valA={`${yellows.me}`} valB={`${yellows.bot}`} pctA={yellows.me / Math.max(1, yellows.me + yellows.bot) * 100} />
            <MatchStatRow label="البطاقات الحمراء" valA={`${reds.me}`} valB={`${reds.bot}`} pctA={reds.me / Math.max(1, reds.me + reds.bot) * 100} />
            <MatchStatRow label="التسلل" valA={`${offsides.me}`} valB={`${offsides.bot}`} pctA={offsides.me / Math.max(1, offsides.me + offsides.bot) * 100} />
          </div>
        </div>

        {/* MAN OF THE MATCH CARD */}
        {motm && (
          <div className="w-full bg-gradient-to-r from-[#FFD700]/10 via-[#0d1525] to-[#FFD700]/10 border border-[#FFD700]/20 rounded-2xl p-5 mb-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-black/60 border-2 border-[#FFD700]/40 flex items-end justify-center overflow-hidden">
              <img src={motm.image} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <div>
              <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.2em] block">★ Man of the Match</span>
              <span className="text-lg font-black text-white">{motm.name}</span>
              <span className="text-xs text-zinc-400 block">{motm.position} • {motm.rating} OVR</span>
            </div>
          </div>
        )}

        {/* FOOTER BUTTONS */}
        <div className="flex gap-4 flex-wrap justify-center">
          <Link 
            href="/leaderboard"
            className="bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition flex items-center gap-2"
          >
            🏆 الترتيب العالمي
          </Link>
          <Link 
            href="/lobby"
            className="bg-gradient-to-r from-[#00F0FF] to-blue-600 text-black px-10 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-105 transition"
          >
            🎮 لوبي جديد
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, valA, valB, percentA }: { label: string, valA: string, valB: string, percentA: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-1 text-zinc-400">
        <span>{valA}</span>
        <span className="text-white font-black">{label}</span>
        <span>{valB}</span>
      </div>
      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
        <div className="bg-[#00F0FF] h-full" style={{ width: `${percentA}%` }} />
        <div className="bg-purple-500 h-full flex-1" />
      </div>
    </div>
  );
}

function MatchStatRow({ label, valA, valB, pctA }: { label: string, valA: string, valB: string, pctA: number }) {
  const pctB = 100 - pctA;
  return (
    <div className="flex items-center gap-4">
      <span className="w-12 text-right text-sm font-black text-white">{valA}</span>
      <div className="flex-1 flex items-center gap-1">
        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden flex justify-end">
          <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${pctA}%` }} />
        </div>
        <span className="text-[10px] font-bold text-zinc-400 w-24 text-center uppercase tracking-wider">{label}</span>
        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
          <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${pctB}%` }} />
        </div>
      </div>
      <span className="w-12 text-left text-sm font-black text-white">{valB}</span>
    </div>
  );
}

interface TournamentSimulatorProps {
  managers: Manager[];
  formation: string;
  botDifficulty?: string;
  onClose: () => void;
}

function TournamentSimulator({ managers, formation, botDifficulty = 'medium', onClose }: TournamentSimulatorProps) {
  const is8Players = managers.length >= 8;
  type Phase = 'intro' | 'simulating_qf' | 'qf_results' | 'simulating_sf' | 'sf_results' | 'simulating_final' | 'podium';
  const [phase, setPhase] = useState<Phase>('intro');
  
  // Match Details Modal state
  const [viewingMatch, setViewingMatch] = useState<any>(null);

  // Quarter Finals (8 players)
  const [qf1, setQf1] = useState<any>(null);
  const [qf2, setQf2] = useState<any>(null);
  const [qf3, setQf3] = useState<any>(null);
  const [qf4, setQf4] = useState<any>(null);

  // Semi Finals
  const [sf1, setSf1] = useState<any>(null);
  const [sf2, setSf2] = useState<any>(null);

  // Final & 3rd
  const [final, setFinal] = useState<any>(null);
  const [third, setThird] = useState<any>(null);
  const [loadingText, setLoadingText] = useState("");

  useEffect(() => {
    if (is8Players) {
      setQf1({ m1: managers[0], m2: managers[1], s1: 0, s2: 0 });
      setQf2({ m1: managers[2], m2: managers[3], s1: 0, s2: 0 });
      setQf3({ m1: managers[4], m2: managers[5], s1: 0, s2: 0 });
      setQf4({ m1: managers[6], m2: managers[7], s1: 0, s2: 0 });
    } else if (managers.length >= 4) {
      setSf1({ m1: managers[0], m2: managers[1], s1: 0, s2: 0 });
      setSf2({ m1: managers[2], m2: managers[3], s1: 0, s2: 0 });
    }
  }, [managers, is8Players]);

  const simulateMatchDetailed = (m1: Manager, m2: Manager) => {
    const t1 = calculateTacticalSquadRating(m1.squad, m1.id !== 'you', botDifficulty);
    const t2 = calculateTacticalSquadRating(m2.squad, m2.id !== 'you', botDifficulty);

    const diff = t1.totalRating - t2.totalRating;
    
    // Goals logic strictly based on tactical squad power difference
    let s1 = 0;
    let s2 = 0;

    if (botDifficulty === 'legendary' && m1.id === 'you') {
      // Legendary difficulty advantage for AI
      s2 = Math.floor(Math.random() * 2) + 2;
      s1 = Math.max(0, s2 - 2);
    } else if (diff >= 12) {
      s1 = Math.floor(Math.random() * 3) + 2; // 2 to 4
      s2 = Math.floor(Math.random() * 2);     // 0 to 1
    } else if (diff >= 5) {
      s1 = Math.floor(Math.random() * 2) + 2; // 2 to 3
      s2 = Math.floor(Math.random() * 2);     // 0 to 1
    } else if (diff <= -12) {
      s1 = Math.floor(Math.random() * 2);     // 0 to 1
      s2 = Math.floor(Math.random() * 3) + 2; // 2 to 4
    } else if (diff <= -5) {
      s1 = Math.floor(Math.random() * 2);     // 0 to 1
      s2 = Math.floor(Math.random() * 2) + 2; // 2 to 3
    } else {
      // Competitive match
      const r = Math.random();
      if (r < 0.35) { s1 = 2; s2 = 1; }
      else if (r < 0.70) { s1 = 1; s2 = 2; }
      else if (r < 0.85) { s1 = 1; s2 = 1; }
      else { s1 = 2; s2 = 2; }
    }

    // Handle ties with penalty shootout
    let pen1: number | undefined;
    let pen2: number | undefined;
    let winner = m1;
    let loser = m2;

    if (s1 > s2) {
      winner = m1; loser = m2;
    } else if (s2 > s1) {
      winner = m2; loser = m1;
    } else {
      // Tied! Penalty Shootout
      if (diff > 0 || Math.random() > 0.5) {
        pen1 = 5; pen2 = Math.floor(Math.random() * 2) + 3; // 5 - 3 or 5 - 4
        winner = m1; loser = m2;
      } else {
        pen2 = 5; pen1 = Math.floor(Math.random() * 2) + 3;
        winner = m2; loser = m1;
      }
    }

    // Scorers & minutes
    const attMid1 = m1.squad.filter(p => ['ATT', 'MID'].includes(getCat(p.position)));
    const attMid2 = m2.squad.filter(p => ['ATT', 'MID'].includes(getCat(p.position)));

    const scorers1 = Array.from({ length: s1 }).map(() => ({
      name: attMid1.length > 0 ? attMid1[Math.floor(Math.random() * attMid1.length)].name : 'Player',
      minute: Math.floor(Math.random() * 85) + 5
    })).sort((a, b) => a.minute - b.minute);

    const scorers2 = Array.from({ length: s2 }).map(() => ({
      name: attMid2.length > 0 ? attMid2[Math.floor(Math.random() * attMid2.length)].name : 'Player',
      minute: Math.floor(Math.random() * 85) + 5
    })).sort((a, b) => a.minute - b.minute);

    const poss1 = Math.min(75, Math.max(25, 50 + Math.round(diff * 1.5)));
    const poss2 = 100 - poss1;

    const shots1 = s1 + Math.floor(Math.random() * 4) + 3;
    const shots2 = s2 + Math.floor(Math.random() * 4) + 3;

    return {
      m1, m2, s1, s2, pen1, pen2, winner, loser,
      scorers1, scorers2, poss1, poss2, shots1, shots2,
      tac1: t1, tac2: t2
    };
  };

  const startSimulateQf = () => {
    setPhase('simulating_qf');
    setLoadingText("جاري محاكاة ربع النهائي دوري الأبطال (8 فرق)...");
    setTimeout(() => {
      const resQf1 = simulateMatchDetailed(managers[0], managers[1]);
      const resQf2 = simulateMatchDetailed(managers[2], managers[3]);
      const resQf3 = simulateMatchDetailed(managers[4], managers[5]);
      const resQf4 = simulateMatchDetailed(managers[6], managers[7]);

      setQf1(resQf1);
      setQf2(resQf2);
      setQf3(resQf3);
      setQf4(resQf4);

      setSf1({ m1: resQf1.winner, m2: resQf2.winner, s1: 0, s2: 0 });
      setSf2({ m1: resQf3.winner, m2: resQf4.winner, s1: 0, s2: 0 });

      setPhase('qf_results');
    }, 3000);
  };

  const startSimulateSf = () => {
    setPhase('simulating_sf');
    setLoadingText("جاري محاكاة نصف نهائي دوري الأبطال...");
    setTimeout(() => {
      const m1_1 = is8Players ? qf1.winner : managers[0];
      const m1_2 = is8Players ? qf2.winner : managers[1];
      const m2_1 = is8Players ? qf3.winner : managers[2];
      const m2_2 = is8Players ? qf4.winner : managers[3];

      setSf1(simulateMatchDetailed(m1_1, m1_2));
      setSf2(simulateMatchDetailed(m2_1, m2_2));
      setPhase('sf_results');
    }, 3000);
  };

  const startSimulateFinals = () => {
    setPhase('simulating_final');
    setLoadingText("جاري محاكاة نهائي دوري الأبطال وحسم اللقب...");
    setTimeout(() => {
      const finalRes = simulateMatchDetailed(sf1.winner, sf2.winner);
      const thirdRes = simulateMatchDetailed(sf1.loser, sf2.loser);
      setFinal(finalRes);
      setThird(thirdRes);
      setPhase('podium');

      // Trigger Confetti
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

      // Record User Score (+10 for Win, -10 for Loss)
      const token = localStorage.getItem('token');
      if (token) {
        const isUserWinner = finalRes.winner.id === 'you';
        fetch(`${API_BASE}/api/matches/record`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            opponent_name: finalRes.loser.name,
            user_score: isUserWinner ? finalRes.s1 : finalRes.s2,
            bot_score: isUserWinner ? finalRes.s2 : finalRes.s1,
            result: isUserWinner ? 'win' : 'loss'
          })
        }).catch(console.error);
      }
    }, 3000);
  };

  if (phase === 'simulating_qf' || phase === 'simulating_sf' || phase === 'simulating_final') {
    return (
      <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-center p-6 bg-[#03060f] text-white relative">
        <div className="z-10 flex flex-col items-center max-w-md w-full">
          <Loader2 className="w-16 h-16 text-[#FFD700] animate-spin mb-6" />
          <h2 className="text-3xl font-black mb-2 uppercase tracking-widest text-[#FFD700] text-center">CHAMPIONS LEAGUE 🏆</h2>
          <p className="text-zinc-400 text-sm mb-8 text-center font-bold">{loadingText}</p>
        </div>
      </div>
    );
  }

  const renderMatchCard = (match: any, title: string) => {
    if (!match) return null;
    return (
      <div 
        onClick={() => match.winner && setViewingMatch(match)}
        className={`bg-black/60 border p-5 rounded-3xl w-[280px] flex flex-col items-center shadow-[0_0_20px_rgba(0,240,255,0.1)] relative overflow-hidden transition-all duration-300 ${match.winner ? 'cursor-pointer hover:scale-105 hover:border-[#FFD700] border-[#00F0FF]/40' : 'border-white/10'}`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent" />
        <div className="flex justify-between items-center w-full mb-3">
          <h3 className="text-[#00F0FF] font-black text-xs uppercase tracking-widest">{title}</h3>
          {match.winner && <span className="text-[9px] font-bold text-zinc-400 bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1"><Eye className="w-3 h-3 text-[#00F0FF]" /> التفاصيل</span>}
        </div>
        
        <div className="flex justify-between w-full items-center mb-2">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2 ${match.winner?.id === match.m1.id ? 'border-[#FFD700] bg-[#FFD700]/20 text-[#FFD700]' : 'border-white/20 bg-white/5 text-white'}`}>
              {match.m1.id === 'you' ? 'YOU' : match.m1.name.substring(0, 3)}
            </div>
            <span className="text-[10px] text-zinc-400 mt-1.5 text-center w-full truncate font-bold">{match.m1.name}</span>
          </div>
          
          <div className="px-3 flex flex-col items-center">
            <div className="text-xl font-black text-white">
              {match.winner ? `${match.s1} - ${match.s2}` : 'VS'}
            </div>
            {match.pen1 !== undefined && (
              <span className="text-[9px] text-amber-400 font-bold">({match.pen1}-{match.pen2} Pen)</span>
            )}
          </div>
          
          <div className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2 ${match.winner?.id === match.m2.id ? 'border-[#FFD700] bg-[#FFD700]/20 text-[#FFD700]' : 'border-white/20 bg-white/5 text-white'}`}>
              {match.m2.id === 'you' ? 'YOU' : match.m2.name.substring(0, 3)}
            </div>
            <span className="text-[10px] text-zinc-400 mt-1.5 text-center w-full truncate font-bold">{match.m2.name}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 w-full min-h-screen flex flex-col items-center justify-start py-12 px-6 bg-[#040814] text-white relative overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#0a1128] via-[#040814] to-black z-0 pointer-events-none" />
      
      {/* MATCH ANALYTICS MODAL */}
      {viewingMatch && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-black/95 border-2 border-[#00F0FF] rounded-3xl p-6 max-w-lg w-full flex flex-col items-center shadow-[0_0_50px_rgba(0,240,255,0.4)] relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setViewingMatch(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white font-black text-xl w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-[#00F0FF] text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FFD700]" /> تفاصيل مباراة دوري الأبطال
            </h3>
            
            {/* Teams & Score Header */}
            <div className="flex justify-between items-center w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
              <div className="flex flex-col items-center flex-1">
                <span className="text-base font-black text-white text-center">{viewingMatch.m1.name}</span>
                <span className="text-[10px] text-[#00F0FF] font-bold">طاقة الفريق: {viewingMatch.tac1?.totalRating || 80}</span>
              </div>

              <div className="flex flex-col items-center px-4">
                <div className="text-3xl font-black text-[#FFD700]">
                  {viewingMatch.s1} - {viewingMatch.s2}
                </div>
                {viewingMatch.pen1 !== undefined && (
                  <span className="text-xs font-bold text-amber-400 mt-1">
                    ({viewingMatch.pen1} - {viewingMatch.pen2} ركلات ترجيح ⚽)
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center flex-1">
                <span className="text-base font-black text-white text-center">{viewingMatch.m2.name}</span>
                <span className="text-[10px] text-[#00F0FF] font-bold">طاقة الفريق: {viewingMatch.tac2?.totalRating || 80}</span>
              </div>
            </div>

            {/* Goal Scorers */}
            <div className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 mb-6 flex justify-between gap-4">
              <div className="flex-1 flex flex-col gap-1 text-right border-r border-white/10 pr-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-white/10 pb-1 mb-1 block">الهدافون ({viewingMatch.m1.name})</span>
                {viewingMatch.scorers1 && viewingMatch.scorers1.length > 0 ? (
                  viewingMatch.scorers1.map((sc: any, idx: number) => (
                    <div key={idx} className="text-xs font-bold text-emerald-400">⚽ {sc.name} {sc.minute}'</div>
                  ))
                ) : (
                  <span className="text-[11px] text-zinc-600 italic">لا توجد أهداف</span>
                )}
              </div>

              <div className="flex-1 flex flex-col gap-1 text-left pl-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-white/10 pb-1 mb-1 block">الهدافون ({viewingMatch.m2.name})</span>
                {viewingMatch.scorers2 && viewingMatch.scorers2.length > 0 ? (
                  viewingMatch.scorers2.map((sc: any, idx: number) => (
                    <div key={idx} className="text-xs font-bold text-emerald-400">⚽ {sc.name} {sc.minute}'</div>
                  ))
                ) : (
                  <span className="text-[11px] text-zinc-600 italic">لا توجد أهداف</span>
                )}
              </div>
            </div>

            {/* Match Stats Comparison */}
            <div className="w-full flex flex-col gap-2.5 mb-6">
              <MatchStatRow label="الاستحواذ" valA={`${viewingMatch.poss1 || 50}%`} valB={`${viewingMatch.poss2 || 50}%`} pctA={viewingMatch.poss1 || 50} />
              <MatchStatRow label="التسديدات" valA={`${viewingMatch.shots1 || 5}`} valB={`${viewingMatch.shots2 || 5}`} pctA={50} />
              <MatchStatRow label="طاقة الهجوم" valA={`${viewingMatch.tac1?.attRating || 80}`} valB={`${viewingMatch.tac2?.attRating || 80}`} pctA={50} />
              <MatchStatRow label="طاقة الوسط" valA={`${viewingMatch.tac1?.midRating || 80}`} valB={`${viewingMatch.tac2?.midRating || 80}`} pctA={50} />
              <MatchStatRow label="طاقة الدفاع" valA={`${viewingMatch.tac1?.defRating || 80}`} valB={`${viewingMatch.tac2?.defRating || 80}`} pctA={50} />
            </div>

            <button 
              onClick={() => setViewingMatch(null)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-8 py-2.5 rounded-xl border border-white/10 transition cursor-pointer"
            >
              إغلاق التفاصيل
            </button>
          </div>
        </div>
      )}

      <div className="z-10 flex flex-col items-center w-full max-w-6xl">
        <div className="flex items-center gap-4 mb-2">
          <TrophyIcon className="w-10 h-10 text-[#FFD700]" />
          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700] uppercase tracking-widest text-center">
            {is8Players ? 'CHAMPIONS LEAGUE (8 TEAMS) 🏆' : 'CHAMPIONS LEAGUE (4 TEAMS) 🏆'}
          </h1>
          <TrophyIcon className="w-10 h-10 text-[#FFD700]" />
        </div>
        <p className="text-zinc-400 text-xs sm:text-sm mb-10 uppercase tracking-widest font-bold text-center">
          انقر على أي مباراة لمشاهدة تفاصيل الهدافين وإحصائيات طاقة الفريقين 📊
        </p>

        {phase === 'podium' && final && third ? (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-1000">
            <h2 className="text-2xl font-black text-[#FFD700] uppercase tracking-widest mb-8 text-center flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#FFD700]" /> منصة أفضل 3 مدربين في دوري الأبطال 🏆
            </h2>

            <div className="flex flex-col md:flex-row justify-center items-end gap-6 w-full max-w-4xl mb-12">
              {/* 2nd Place */}
              <div className="w-full md:w-1/3 bg-gradient-to-t from-zinc-400/20 to-black/80 border-2 border-zinc-400 rounded-[2.5rem] p-6 flex flex-col items-center shadow-[0_0_40px_rgba(161,161,170,0.2)]">
                <div className="text-zinc-400 font-black text-4xl mb-2">2nd 🥈</div>
                <div className="text-xl font-black text-white text-center mb-1">{final.loser.name}</div>
                <div className="text-xs text-zinc-400 font-bold uppercase">المركز الثاني (الوصيف)</div>
              </div>

              {/* 1st Place */}
              <div className="w-full md:w-1/3 bg-gradient-to-t from-[#FFD700]/30 via-amber-950/40 to-black/90 border-4 border-[#FFD700] rounded-[3rem] p-8 flex flex-col items-center shadow-[0_0_80px_rgba(255,215,0,0.5)] relative overflow-hidden -translate-y-4">
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#FFD700] opacity-30 blur-3xl rounded-full" />
                <div className="text-[#FFD700] font-black text-6xl mb-2 animate-bounce">1st 🏆</div>
                <div className="text-2xl font-black text-white text-center mb-1">{final.winner.name}</div>
                <div className="text-[#FFD700] text-xs font-black tracking-widest uppercase bg-[#FFD700]/10 border border-[#FFD700]/40 px-4 py-1 rounded-full">بطل دوري الأبطال</div>
              </div>

              {/* 3rd Place */}
              <div className="w-full md:w-1/3 bg-gradient-to-t from-amber-700/20 to-black/80 border-2 border-amber-700 rounded-[2.5rem] p-6 flex flex-col items-center shadow-[0_0_40px_rgba(180,83,9,0.2)]">
                <div className="text-amber-600 font-black text-4xl mb-2">3rd 🥉</div>
                <div className="text-xl font-black text-white text-center mb-1">{third.winner.name}</div>
                <div className="text-xs text-amber-500 font-bold uppercase">المركز الثالث (البرونزية)</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 mt-6 w-full max-w-sm">
              <button 
                onClick={onClose}
                className="w-full bg-[#00F0FF] hover:bg-white text-black px-10 py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition shadow-[0_0_30px_rgba(0,240,255,0.4)] cursor-pointer"
              >
                العودة للتشكيلة
              </button>
              <Link 
                href="/lobby"
                className="w-full text-center bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition cursor-pointer"
              >
                العودة للوبي 🏠
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {/* QUARTER FINALS (FOR 8 PLAYERS) */}
            {is8Players && (
              <div className="w-full flex flex-col items-center mb-10">
                <h3 className="text-xs font-black text-[#00F0FF] uppercase tracking-widest mb-4">Quarter-Finals (8 Teams)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full justify-items-center">
                  {renderMatchCard(qf1, 'Quarter Final 1')}
                  {renderMatchCard(qf2, 'Quarter Final 2')}
                  {renderMatchCard(qf3, 'Quarter Final 3')}
                  {renderMatchCard(qf4, 'Quarter Final 4')}
                </div>
              </div>
            )}

            {/* SEMI FINALS */}
            {((phase as string) === 'qf_results' || (phase as string) === 'simulating_sf' || (phase as string) === 'sf_results' || ((phase as string) === 'intro' && !is8Players)) && (
              <div className="w-full flex flex-col items-center mb-10">
                <h3 className="text-xs font-black text-[#00F0FF] uppercase tracking-widest mb-4">Semi-Finals (4 Teams)</h3>
                <div className="flex flex-wrap justify-center gap-6 w-full">
                  {renderMatchCard(sf1, 'Semi Final 1')}
                  {renderMatchCard(sf2, 'Semi Final 2')}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS & NEXT STAGE PREVIEWS */}
            <div className="flex flex-col items-center my-6">
              {is8Players && phase === 'intro' && (
                <button 
                  onClick={startSimulateQf}
                  className="bg-gradient-to-r from-[#00F0FF] to-blue-600 hover:from-blue-600 hover:to-[#00F0FF] text-black px-12 py-5 rounded-full font-black text-xl uppercase tracking-widest transition shadow-[0_0_40px_rgba(0,240,255,0.4)] hover:scale-105 cursor-pointer"
                >
                  🚀 محاكاة ربع النهائي (8 فرق)
                </button>
              )}

              {((!is8Players && phase === 'intro') || (is8Players && phase === 'qf_results')) && (
                <button 
                  onClick={startSimulateSf}
                  className="bg-gradient-to-r from-[#00F0FF] to-blue-600 hover:from-blue-600 hover:to-[#00F0FF] text-black px-12 py-5 rounded-full font-black text-xl uppercase tracking-widest transition shadow-[0_0_40px_rgba(0,240,255,0.4)] hover:scale-105 cursor-pointer"
                >
                  🔥 محاكاة نصف النهائي
                </button>
              )}

              {phase === 'sf_results' && (
                <div className="flex flex-col items-center">
                  <h2 className="text-2xl font-black text-[#FFD700] mb-6 uppercase tracking-widest">🏆 النهائي الكبير دوري الأبطال</h2>
                  <div className="flex justify-center gap-8 w-full max-w-4xl mb-8">
                    <div className="bg-black/80 border-2 border-[#FFD700] rounded-3xl p-6 flex gap-6 items-center shadow-[0_0_30px_rgba(255,215,0,0.3)]">
                      <span className="font-black text-xl text-white">{sf1?.winner?.name}</span>
                      <span className="font-black text-xl text-[#FFD700]">VS</span>
                      <span className="font-black text-xl text-white">{sf2?.winner?.name}</span>
                    </div>
                  </div>
                  <button 
                    onClick={startSimulateFinals}
                    className="bg-gradient-to-r from-[#FFD700] to-yellow-500 hover:from-yellow-500 hover:to-[#FFD700] text-black px-12 py-5 rounded-full font-black text-xl uppercase tracking-widest transition shadow-[0_0_40px_rgba(255,215,0,0.4)] hover:scale-105 cursor-pointer"
                  >
                    👑 محاكاة النهائي والترتيب النهائي
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


