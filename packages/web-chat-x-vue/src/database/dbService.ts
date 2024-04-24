// dbService.ts
import Dexie, { ActivatedUserDb, PublicDb } from "dexie";
import { getPeerIdFromUserId, isValidUserId } from "@/hooks/useEncryption";
import ChatUser from "@/classes/ChatUser";

type TableSchemas = {
  friends: Dexie.Table<ChatUserInfo, string>;
  users: Dexie.Table<ChatUserInfo, string>;
  currentUser: Dexie.Table<ChatUserInfo, string>;
  channels: Dexie.Table<ChatChannelInfo, string>;
  messages: Dexie.Table<ChatMessageInfo, string>;
};

// 对数据库实例进行类型扩展，使其包含表的类型
declare module "dexie" {
  interface PublicDb extends Dexie {
    users: TableSchemas["users"];
    currentUser: TableSchemas["currentUser"];
  }

  interface ActivatedUserDb extends Dexie {
    info: TableSchemas["users"];
    friends: TableSchemas["friends"];
    messages: TableSchemas["messages"];
    channels: TableSchemas["channels"];
  }
}

export class DbService {
  // 移除getInstance静态方法，直接在类构造函数中初始化数据库实例
  activatedUserDb!: ActivatedUserDb;
  publicDb!: PublicDb;

  constructor() {}
  async createPublicDb() {
    const db = new Dexie("peer_chat") as PublicDb;
    db.version(1).stores({
      users: "&id, name, email, phone, location, role",
      currentUser: "&unique, id, name, email, phone, location, role",
    });

    try {
      await db.open();
    } catch (error) {
      console.error("Error opening the database:", error);
    }
    this.publicDb = db;
    return db;
  }

  async createActivateUserDb(user: ChatUser, userId: string) {
    if (!isValidUserId(userId)) return;
    const peerId = getPeerIdFromUserId(userId);
    const db = new Dexie("peer_chat_" + peerId) as ActivatedUserDb;
    db.version(1).stores({
      info: "&id, name, email, phone, location, role",
      friends: "&id, name, email, phone, location, role",
      channels: "&id, name, email, phone, location, role",
      messages: "&id, user, channel.id, text, time",
    });
    try {
      await db.open();
      await db.info.put(user);
    } catch (error) {
      console.error("Error opening the database:", error);
    }
    this.activatedUserDb = db;
    return db;
  }
}
