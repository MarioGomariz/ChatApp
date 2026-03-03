import { create } from 'zustand';
import { Client, Room } from '@colyseus/sdk';
import { User } from '../../shared/types';
import { generateRandomName } from '../lib/utils';

// We explicitly connect to the Colyseus backend port from Environment Variables
const colyseusUrl = process.env.NEXT_PUBLIC_COLYSEUS_URL || 'http://localhost:2567';
const colyseusClient = new Client(colyseusUrl);

interface ChatStore {
  currentUser: User | null;
  colyseusRoom: Room | null;
  initializeUser: () => void;
  initializeAdmin: () => void;
  connectToRoom: (roomId: string) => Promise<Room | undefined>;
  leaveRoom: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  currentUser: null,
  colyseusRoom: null,

  initializeUser: () => {
    set((state) => {
      if (state.currentUser) return state; // Already initialized
      const randomId = Math.random().toString(36).substring(2, 10);
      return {
        currentUser: {
          id: randomId,
          name: generateRandomName(),
        },
      };
    });
  },

  initializeAdmin: () => {
    set({
      currentUser: {
        id: "admin-" + Math.random().toString(36).substring(2, 6),
        name: "Soporte Técnico"
      }
    });
  },

  connectToRoom: async (roomId: string) => {
    try {
      const state = get();
      if (!state.currentUser) return;
      
      // Prevent double connections if we're already natively connected to this exact room
      if (state.colyseusRoom && state.colyseusRoom.roomId === roomId) {
        return state.colyseusRoom;
      }
      
      // If there's a previous hanging connection to a different room, clean it up
      if (state.colyseusRoom) {
        state.colyseusRoom.leave();
      }

      // The backend expects the roomId and user options in onCreate/onJoin
      const room = await colyseusClient.joinOrCreate('chat_room', {
        roomId,
        id: state.currentUser.id,
        name: state.currentUser.name
      });

      set({ colyseusRoom: room });
      return room;
    } catch (e) {
      console.error('FAILED TO CONNECT:', e);
      return undefined;
    }
  },

  leaveRoom: () => {
    const state = get();
    if (state.colyseusRoom) {
      state.colyseusRoom.leave();
    }
    set({ colyseusRoom: null });
  },
}));
