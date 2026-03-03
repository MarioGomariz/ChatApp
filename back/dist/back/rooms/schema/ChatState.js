"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomState = exports.ChatMessageState = exports.UserState = void 0;
const schema_1 = require("@colyseus/schema");
class UserState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.id = "";
        this.name = "";
    }
}
exports.UserState = UserState;
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], UserState.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], UserState.prototype, "name", void 0);
class ChatMessageState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.id = "";
        this.userId = "";
        this.text = "";
        this.timestamp = 0;
    }
}
exports.ChatMessageState = ChatMessageState;
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], ChatMessageState.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], ChatMessageState.prototype, "userId", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], ChatMessageState.prototype, "text", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], ChatMessageState.prototype, "timestamp", void 0);
class RoomState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.roomId = "";
        this.users = new schema_1.MapSchema();
        this.messages = new schema_1.ArraySchema();
    }
}
exports.RoomState = RoomState;
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], RoomState.prototype, "roomId", void 0);
__decorate([
    (0, schema_1.type)({ map: UserState }),
    __metadata("design:type", Object)
], RoomState.prototype, "users", void 0);
__decorate([
    (0, schema_1.type)([ChatMessageState]),
    __metadata("design:type", Object)
], RoomState.prototype, "messages", void 0);
