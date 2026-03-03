"use client";

import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { generateRoomId } from "../lib/utils";
import {
  Plus,
  MessageCircle,
  ArrowRight,
  ShieldAlert,
  LogIn,
  MessagesSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { currentUser, initializeUser } = useChatStore();
  const router = useRouter();
  const [joinId, setJoinId] = useState("");

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const handleCreateRoom = () => {
    const roomId = generateRoomId();
    router.push(`/room/${roomId}`);
  };

  const handleChatWithAdmin = () => {
    const roomId = `admin-${generateRoomId()}`;
    router.push(`/room/${roomId}`);
  };

  const handleJoinRoom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (joinId.trim().length > 0) {
      router.push(`/room/${joinId.trim()}`);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden font-sans p-4">
      {/* Background Gradients - Tron Red Style */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-dark/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[130px]" />

      {/* Header Info */}
      <div className="relative z-10 flex flex-col items-center mb-10 w-full">
        <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-tr from-primary-dark to-primary flex items-center justify-center shadow-md">
          <MessagesSquare className="text-text-primary w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-2 text-center">
          Aplicación de Chat
        </h1>

        <a
          href="https://mario-gomariz-portfolio.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full border border-border/50 hover:border-primary/50 bg-background-secondary/50 hover:bg-background-hover transition-all duration-300"
        >
          <span className="text-[10px] text-text-muted font-medium">por</span>
          <span className="text-xs font-bold text-primary-light group-hover:text-primary transition-colors">
            @mariogomariz
          </span>
        </a>

        <div className="mt-4 bg-background-secondary rounded-full px-6 py-2 border border-border-light flex items-center justify-center gap-2 shadow-subtle-sm">
          <span className="text-sm font-medium text-text-muted">
            Tu identidad temporal:
          </span>
          <span className="text-sm font-bold text-primary-light">
            {currentUser.name}
          </span>
        </div>
      </div>

      <main className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Create / Join Room */}
        <section className="bg-background-card p-8 rounded-3xl border border-border shadow-subtle-lg hover:shadow-card-hover transition-shadow duration-500 flex flex-col items-center justify-center">
          <div className="w-12 h-12 mb-4 rounded-xl bg-background-secondary flex items-center justify-center border border-border-light text-text-secondary">
            <Plus className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Sala Pública
          </h2>
          <p className="text-text-secondary text-sm text-center mb-8 px-4">
            Genera una nueva sala para conversar o únete a una existente con su
            ID.
          </p>

          <div className="w-full flex flex-col gap-4">
            <form onSubmit={handleJoinRoom} className="flex gap-2 w-full">
              <input
                type="text"
                placeholder="ID de la sala..."
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                className="flex-1 h-12 rounded-xl bg-background-secondary border border-border px-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-all"
              />
              <button
                type="submit"
                disabled={!joinId.trim()}
                className="h-12 px-4 rounded-xl bg-background-secondary border border-border hover:bg-background-hover text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-subtle-sm"
              >
                <LogIn className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center gap-4 w-full my-1">
              <div className="h-[1px] flex-1 bg-border-light"></div>
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                O CREA UNA
              </span>
              <div className="h-[1px] flex-1 bg-border-light"></div>
            </div>

            <button
              onClick={handleCreateRoom}
              className="group relative w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-text-primary font-bold transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer border border-primary-hover/50"
            >
              <Plus className="w-4 h-4" />
              <span>Generar nueva sala</span>
            </button>
          </div>
        </section>

        {/* Right Side: Chat with Admin */}
        <section className="bg-background-card p-8 rounded-3xl border border-border shadow-subtle-lg hover:shadow-card-hover transition-shadow duration-500 flex flex-col items-center justify-center h-full">
          <div className="w-12 h-12 mb-4 rounded-xl bg-background-secondary flex items-center justify-center border border-border-light text-text-secondary">
            <ShieldAlert className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Soporte y Contacto
          </h2>
          <p className="text-text-secondary text-sm text-center mb-6 px-4">
            Inicia un chat privado directamente con el administrador para
            consultas o ayuda.
          </p>

          <div className="w-full mt-auto">
            <button
              onClick={handleChatWithAdmin}
              className="group relative w-full flex items-center justify-center gap-2 h-14 rounded-2xl bg-background-secondary hover:bg-background-hover text-text-primary font-medium transition-all duration-300 overflow-hidden border border-border cursor-pointer shadow-subtle-sm hover:shadow-subtle-md"
            >
              <MessageCircle className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
              <span>Chatear con Admin</span>
              <ArrowRight className="w-4 h-4 absolute right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary transition-all duration-300" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
