import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export class UserState extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
}

export class ChatMessageState extends Schema {
  @type("string") id: string = "";
  @type("string") userId: string = "";
  @type("string") text: string = "";
  @type("number") timestamp: number = 0;
}

export class RoomState extends Schema {
  @type("string") roomId: string = "";
  @type({ map: UserState }) users = new MapSchema<UserState>();
  @type([ChatMessageState]) messages = new ArraySchema<ChatMessageState>();
}
