"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const colyseus_1 = require("colyseus");
const monitor_1 = require("@colyseus/monitor");
const ChatRoom_1 = require("./rooms/ChatRoom");
const port = Number(process.env.PORT || 2567);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const ws_transport_1 = require("@colyseus/ws-transport");
const server = http_1.default.createServer(app);
const gameServer = new colyseus_1.Server({
    transport: new ws_transport_1.WebSocketTransport({
        server
    }),
});
// Registrar la sala
gameServer.define("chat_room", ChatRoom_1.ChatRoom);
// Monitor opcional
app.use("/colyseus", (0, monitor_1.monitor)());
gameServer.listen(port);
console.log(`[GameServer] Escuchando en el puerto ${port}`);
