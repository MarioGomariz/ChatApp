import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomName(): string {
  const num = Math.floor(Math.random() * 1000) + 1000;
  return `Invitado_${num}`;
}

export function generateRoomId(): string {
  // Simple alphanumeric ID for rooms
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
