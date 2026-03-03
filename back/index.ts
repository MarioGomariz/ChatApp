import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { monitor } from "@colyseus/monitor";
import { ChatRoom } from "./rooms/ChatRoom";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

import { WebSocketTransport } from "@colyseus/ws-transport";

const server = http.createServer(app);
const gameServer = new Server({
  transport: new WebSocketTransport({
    server
  }),
});

// Registrar la sala
gameServer.define("chat_room", ChatRoom);

// Monitor opcional
app.use("/colyseus", monitor());

gameServer.listen(port);
console.log(`[GameServer] Escuchando en el puerto ${port}`);
