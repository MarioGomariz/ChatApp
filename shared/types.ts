export interface User {
  id: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
}

export interface RoomState {
  roomId: string;
  users: User[];
}
