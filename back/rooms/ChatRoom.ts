import { Room, Client } from "colyseus";
import { RoomState, UserState, ChatMessageState } from "./schema/ChatState";
import { ChatMessage, User } from "../../shared/types";

export class ChatRoom extends Room<{ state: RoomState }> {
  maxClients = 50;

  onCreate(options: any) {
    this.state = new RoomState();
    
    // Asignamos el roomId del frontend o generamos uno si no viene
    this.state.roomId = options.roomId || this.roomId;

    // Notificación de Telegram si es una sala admin
    if (this.state.roomId.startsWith("admin-")) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.USER_ID;
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

      if (botToken && chatId) {
        const roomLink = `${frontendUrl}/room/${this.state.roomId}`;
        const message = `🚨 ¡Requieren soporte en el Chat App!\n\nID de Sala: ${this.state.roomId}\nEnlace para unirte: ${roomLink}`;

        console.log(`[Telegram] Intentando enviar notificación a admin para sala: ${this.state.roomId}`);
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            disable_web_page_preview: true,
          }),
        })
        .then(res => res.json())
        .then(data => console.log("[Telegram] Respuesta del servidor de Telegram:", data))
        .catch((err) => console.error("[Telegram] Error en la petición a Telegram:", err));
      }
    }
    
    // Cuando un cliente envíe un mensaje tipo "chat-message"
    this.onMessage("chat-message", (client, data: { text: string }) => {
      const user = this.state.users.get(client.sessionId);
      if (!user) return;

      const newMessage = new ChatMessageState();
      newMessage.id = Math.random().toString(36).substring(2, 9);
      newMessage.userId = user.id;
      newMessage.text = data.text;
      newMessage.timestamp = Date.now();

      // Lo guardamos en el estado temporal (Max 50)
      this.state.messages.push(newMessage);
      if (this.state.messages.length > 50) {
        this.state.messages.shift();
      }
      
      // Emitimos el mensaje a todos (incluyendo sender)
      const broadcastMsg: ChatMessage = {
        id: newMessage.id,
        userId: newMessage.userId,
        text: newMessage.text,
        timestamp: newMessage.timestamp
      };
      
      this.broadcast("new-message", broadcastMsg);
    });
  }

  // Utilidad interna para enviar y registrar mensajes de sistema
  private broadcastSystemMessage(text: string) {
    const sysMessage = new ChatMessageState();
    sysMessage.id = Math.random().toString(36).substring(2, 9);
    sysMessage.userId = "system";
    sysMessage.text = text;
    sysMessage.timestamp = Date.now();

    this.state.messages.push(sysMessage);
    if (this.state.messages.length > 50) {
      this.state.messages.shift();
    }

    const broadcastMsg: ChatMessage = {
      id: sysMessage.id,
      userId: sysMessage.userId,
      text: sysMessage.text,
      timestamp: sysMessage.timestamp
    };
      
    this.broadcast("new-message", broadcastMsg);
  }

  onJoin(client: Client, options: User) {
    console.log(client.sessionId, "joined!");
    
    // Creamos y guardamos el usuario en el mapa (clave: sessionId)
    const newUser = new UserState();
    newUser.id = options.id; // el ID que viene de Zustand
    newUser.name = options.name; // el Nombre ("Invitado x")
    
    this.state.users.set(client.sessionId, newUser);

    // Enviar historial de la memoria temporal solo a este cliente que recién entra
    const history = this.state.messages.map(m => ({
      id: m.id,
      userId: m.userId,
      text: m.text,
      timestamp: m.timestamp
    }));
    client.send("history", history);

    // Avisar a todos que alguien entró
    this.broadcastSystemMessage(`${newUser.name} se ha unido a la sala.`);
  }

  onLeave(client: Client, code?: number) {
    console.log(client.sessionId, "left!");
    
    const user = this.state.users.get(client.sessionId);
    if (user) {
      // Avisar a todos que alguien salió
      this.broadcastSystemMessage(`${user.name} ha abandonado la sala.`);
    }

    // Lo borramos del estado
    this.state.users.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
