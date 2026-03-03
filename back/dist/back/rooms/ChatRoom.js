"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoom = void 0;
const colyseus_1 = require("colyseus");
const ChatState_1 = require("./schema/ChatState");
class ChatRoom extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.maxClients = 50;
    }
    onCreate(options) {
        this.state = new ChatState_1.RoomState();
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
                }).catch((err) => console.error("Error enviando Telegram:", err));
            }
        }
        // Cuando un cliente envíe un mensaje tipo "chat-message"
        this.onMessage("chat-message", (client, data) => {
            const user = this.state.users.get(client.sessionId);
            if (!user)
                return;
            const newMessage = new ChatState_1.ChatMessageState();
            newMessage.id = Math.random().toString(36).substring(2, 9);
            newMessage.userId = user.id;
            newMessage.text = data.text;
            newMessage.timestamp = Date.now();
            // Lo guardamos en el estado 
            this.state.messages.push(newMessage);
            // Emitimos el mensaje a todos (incluyendo sender)
            const broadcastMsg = {
                id: newMessage.id,
                userId: newMessage.userId,
                text: newMessage.text,
                timestamp: newMessage.timestamp
            };
            this.broadcast("new-message", broadcastMsg);
        });
    }
    onJoin(client, options) {
        console.log(client.sessionId, "joined!");
        // Creamos y guardamos el usuario en el mapa (clave: sessionId)
        const newUser = new ChatState_1.UserState();
        newUser.id = options.id; // el ID que viene de Zustand
        newUser.name = options.name; // el Nombre ("Invitado x")
        this.state.users.set(client.sessionId, newUser);
    }
    onLeave(client, code) {
        console.log(client.sessionId, "left!");
        // Lo borramos del estado
        this.state.users.delete(client.sessionId);
    }
    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
exports.ChatRoom = ChatRoom;
