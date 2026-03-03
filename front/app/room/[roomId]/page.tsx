"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChatStore } from "../../../store/useChatStore";
import { LogOut, Copy, Users, Send, Check, Loader2 } from "lucide-react";
import { ChatMessage, User } from "../../../../shared/types";

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const router = useRouter();
  const {
    currentUser,
    connectToRoom,
    colyseusRoom,
    leaveRoom,
    initializeAdmin,
  } = useChatStore();

  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const pwdParam = searchParams.get("pwd");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [copied, setCopied] = useState(false);
  const [connectedCount, setConnectedCount] = useState(0);
  const [userMap, setUserMap] = useState<Record<string, User>>({});
  const [isConnecting, setIsConnecting] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) {
      const adminSecret = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
      if (pwdParam && adminSecret && pwdParam === adminSecret) {
        initializeAdmin();
        return;
      }
      router.replace("/");
      return;
    }

    let ignore = false;

    // Connect to the actual backend room
    connectToRoom(roomId).then((room) => {
      // If the component unmounted while connecting, leave immediately
      if (ignore) {
        if (room) room.leave();
        return;
      }

      if (!room) {
        console.error("Failed to join room.");
        router.push("/");
        return;
      }

      // Escuchar historial temporal antes de aceptar nuevos mensajes
      room.onMessage("history", (historyMsgs: ChatMessage[]) => {
        setMessages(historyMsgs);
      });

      // Escuchar mensajes entranes desde Broadcast
      room.onMessage("new-message", (message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
      });

      // Escuchar cambios de estado para rastrear usuarios y la cantidad de conectados
      room.onStateChange((state: any) => {
        if (state.users) {
          const newUserMap: Record<string, User> = {};
          let count = 0;
          state.users.forEach((user: any) => {
            newUserMap[user.id] = { id: user.id, name: user.name };
            count++;
          });
          setUserMap(newUserMap);
          setConnectedCount(count);
        }
      });

      setIsConnecting(false);
    });

    return () => {
      ignore = true;
      leaveRoom();
    };
  }, [currentUser, roomId, router, connectToRoom, leaveRoom]);

  // Auto-scroll al fondo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    router.push("/");
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !currentUser || !colyseusRoom) return;

    // Send payload matching the server's expectation (`data: { text: string }`)
    colyseusRoom.send("chat-message", { text: inputText.trim() });
    setInputText("");
  };

  if (!currentUser) return null;

  const isAdminRoom = roomId.startsWith("admin-");

  return (
    <div className="flex flex-col h-screen bg-background font-sans relative">
      {/* Loading Overlay */}
      {isConnecting && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-text-primary font-medium text-lg">
            Conectando al servidor...
          </p>
          <p className="text-text-muted text-sm mt-2 text-center max-w-xs">
            Render puede tardar unos segundos en despertar el servidor si estaba
            inactivo.
          </p>
        </div>
      )}

      {/* Header */}
      <header className="h-16 flex-shrink-0 bg-background-card border-b border-border flex items-center justify-between px-4 md:px-6 shadow-subtle-sm z-10">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-text-primary leading-tight">
              {isAdminRoom ? "Soporte Admin" : `Sala: ${roomId}`}
            </h1>
            <span className="text-xs text-text-muted font-medium">
              Tú: {currentUser.name}
            </span>
          </div>

          {!isAdminRoom && (
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1.5 px-3 py-1.5 ml-2 rounded-lg bg-background-secondary border border-border hover:bg-background-hover hover:border-border-light transition-all text-xs font-medium text-text-secondary hover:text-text-primary"
              title="Copiar ID de la sala"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? (
                <span className="text-success hidden sm:inline">Copiado</span>
              ) : (
                <span className="hidden sm:inline">Copiar ID</span>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background-secondary border border-border text-xs font-medium text-text-secondary">
            <Users className="w-3.5 h-3.5" />
            <span>
              {connectedCount} conectado{connectedCount !== 1 ? "s" : ""}
            </span>
          </div>

          <button
            onClick={handleLeave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary transition-all text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Abandonar</span>
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          if (msg.userId === "system") {
            return (
              <div key={msg.id} className="w-full flex justify-center my-4">
                <span className="text-[11px] text-text-muted bg-background-secondary/50 px-4 py-1.5 rounded-full border border-border tracking-wide">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isMe = msg.userId === currentUser.id;
          const senderName = userMap[msg.userId]?.name || "Desconocido";

          return (
            <div
              key={msg.id}
              className={`flex flex-col w-full ${isMe ? "items-end" : "items-start"}`}
            >
              {!isMe && (
                <span className="text-xs text-text-secondary mb-1 ml-1 font-medium">
                  {senderName}
                </span>
              )}
              <div
                className={`max-w-[85%] md:max-w-[70%] px-4 py-2.5 rounded-2xl ${
                  isMe
                    ? "bg-primary text-text-primary rounded-br-sm shadow-md"
                    : "bg-background-card border border-border text-text-primary rounded-bl-sm shadow-subtle-sm"
                }`}
              >
                <p className="text-sm md:text-base leading-relaxed break-words">
                  {msg.text}
                </p>
                <span
                  className={`text-[10px] mt-1 block ${isMe ? "text-white/80" : "text-text-muted"}`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-background-card border-t border-border">
        <form
          onSubmit={handleSendMessage}
          className="flex gap-2 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 h-12 rounded-xl bg-background-secondary border border-border px-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || !colyseusRoom}
            className="h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-tr from-primary to-primary-light hover:from-primary-light hover:to-primary text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </footer>
    </div>
  );
}
