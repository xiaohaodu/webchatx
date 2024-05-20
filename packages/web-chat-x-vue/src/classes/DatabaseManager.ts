// databaseManager.ts
import ChatUser from "@/classes/ChatUser";
import ChatChannel from "./ChatChannel";
import ChatMessageAggregation from "./ChatMessageAggregation";
import ChatMessage from "./ChatMessage";
// 对数据库实例进行类型扩展，使其包含表的类型
interface PublicDb extends Dexie {
  users: Dexie.Table<ChatUserInfo, string>;
  currentUser: Dexie.Table<ChatUserInfo, string>;
}

interface ActivatedUserDb extends Dexie {
  info: Dexie.Table<ChatUserInfo, string>;
  friends: Dexie.Table<ChatUserInfo, string>;
  messages: Dexie.Table<ChatMessageAggregationInfo, string>;
  subscribers: Dexie.Table<ChatUserInfo, string>;
  channels: Dexie.Table<ChatChannelInfo, string>;
}
import { exportDB, importDB } from "dexie-export-import";
import Dexie, { PromiseExtended } from "dexie";
import { isValidUserId } from "@/utils";
export class DatabaseManager {
  // 移除getInstance静态方法，直接在类构造函数中初始化数据库实例
  activatedUserDb!: ActivatedUserDb;
  publicDb!: PublicDb;

  constructor() {}
  async createPublicDb() {
    const db = new Dexie("webChatX") as PublicDb;
    db.version(1).stores({
      users: "&id",
      currentUser: "&unique, id",
    });

    try {
      await db.open();
    } catch (error) {
      console.error("Error opening the database:", error);
    }
    this.publicDb = db;
    await this.syncPublicDB();
    return db;
  }

  async createActivateUserDb(user: ChatUser, id: string) {
    if (!isValidUserId(user.userId)) return;
    const peerId = id;
    const db = new Dexie("webChatX@" + peerId) as ActivatedUserDb;
    db.version(1).stores({
      info: "&id",
      friends: "&id",
      channels: "&id",
      subscribers: "&id",
      messages:
        "&id, postUserId, answerUserId, channelId, &[postUserId+answerUserId], &[postUserId+channelId]",
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

  getFriend = async (id: string) => {
    return (await this.activatedUserDb.friends.get(id))!;
  };
  putFriend = async (friend: ChatUser, me: ChatUser) => {
    friend.isOnline = false;
    this.activatedUserDb.friends.put(friend);
    await Promise.all([
      this.activatedUserDb.info.put(me),
      this.publicDb.users.put(me),
      this.publicDb.currentUser.put(me),
    ]);
  };
  getSubscriber = async (id: string) => {
    return (await this.activatedUserDb.subscribers.get(id))!;
  };
  putSubscriber = async (channel: ChatChannel, subscriber: ChatUser) => {
    await Promise.all([
      this.activatedUserDb.subscribers.put(subscriber),
      this.activatedUserDb.channels.put(channel),
    ]);
  };
  getChannel = async (id: string) => {
    return (await this.activatedUserDb.channels.get(id))!;
  };
  putChannel = async (channel: ChatChannel, me: ChatUser) => {
    this.activatedUserDb.channels.put(channel);
    await Promise.all([
      this.activatedUserDb.info.put(me),
      this.publicDb.users.put(me),
      this.publicDb.currentUser.put(me),
    ]);
  };

  deleteCurrentUser = async () => {
    await this.publicDb.currentUser.clear();
  };

  getCurrentUserInfo = async () => {
    return (await this.activatedUserDb.info.limit(1).first())!;
  };

  getAllUser = async () => {
    return (await this.publicDb.users.toArray())!;
  };

  getMessageAggregation = async (
    id: string,
    postUserId: string,
    answerUserId: string,
    channelId: string = ""
  ) => {
    if (id) return (await this.activatedUserDb.messages.get(id))!;
    else if (postUserId && channelId) {
      return (await this.activatedUserDb.messages
        .where({ postUserId, channelId })
        .limit(1)
        .first())!;
    } else if (postUserId && answerUserId) {
      return (await this.activatedUserDb.messages
        .where({ postUserId, answerUserId })
        .limit(1)
        .first())!;
    }
  };

  putMessageAggregation = async (messages: ChatMessageAggregation) => {
    await this.activatedUserDb.messages.put(messages);
  };

  putMessage = async (
    active: boolean,
    postUserId: string,
    answerUserId: string,
    message: string,
    channelId: string = "",
    file?: File
  ) => {
    const [messageAggregation, messageMe] = (await Promise.all([
      this.getMessageAggregation("", postUserId, answerUserId, channelId),
      active
        ? ChatMessage.create(message, postUserId, answerUserId, file, channelId)
        : ChatMessage.create(
            message,
            answerUserId,
            postUserId,
            file,
            channelId
          ),
    ])) as [ChatMessageAggregationInfo, ChatMessage];
    messageAggregation.messages.push(messageMe);
    await this.activatedUserDb.messages.put(messageAggregation);
    return messageAggregation;
  };

  getPublicDbUsers = async () => {
    return (await this.publicDb.users.toArray())!;
  };

  createNewUser = async (user: ChatUser) => {
    await this.publicDb.currentUser.put(user);
    await this.publicDb.users.put(user);
  };

  setCurrentUser = async (user: ChatUser) => {
    await this.publicDb.currentUser.put(user);
  };

  async exportDatabase(databaseName: string) {
    // Open an arbitrary IndexedDB database:
    const db = await new Dexie(databaseName).open();
    // Export it
    const blob = await exportDB(db);
    let jsonText = await new Response(blob).text();
    let jsonObj = JSON.parse(jsonText);
    for (const table of jsonObj.data.data) {
      if (table.tableName === "info") {
        table.rows[0].peerId.privateKey.buffer =
          table.rows[0].peerId.multihash.digest.buffer;
        table.rows[0].$types["peerId.privateKey.buffer"] = "arraybuffer";
      }
    }
    // 将修改后的JSON对象转换回字符串
    let updatedJsonText = JSON.stringify(jsonObj);

    // 使用新的JSON字符串创建一个新的Blob对象
    let newBlob = new Blob([updatedJsonText], { type: "application/json" });
    return newBlob;
  }

  async importDatabase(file: Blob) {
    // Import a file into a Dexie instance:
    const db = await importDB(file);
    return db; // backendDB() gives you the native IDBDatabase object.
  }

  exportAllUserDB = async () => {
    try {
      const users = await this.getAllUser();
      const blobs = [] as Array<Blob>;
      for (const user of users) {
        const peerId = user.id;
        const blob = await this.exportDatabase("webChatX@" + peerId);
        blobs.push(blob);
      }
      // const publicDb = await exportDB(this.publicDb);
      // blobs.push(publicDb);
      const combinedBlob = await this.combineMultipleBlobs(blobs);
      const file = new File([combinedBlob], "webChatX@All", {
        type: "application/json",
      });
      return file;
    } catch (error) {
      console.error("Error exporting database:", error);
    }
  };

  exportCurrentUserDB = async () => {
    try {
      const blobs = [] as Array<Blob>;
      const activatedUserDb = await exportDB(this.activatedUserDb);
      // const publicDb = await exportDB(this.publicDb);
      // blobs.push(activatedUserDb, publicDb);
      blobs.push(activatedUserDb);
      const currentUser = await this.getCurrentUserInfo();
      const combinedBlob = await this.combineMultipleBlobs(blobs);
      const file = new File(
        [combinedBlob],
        `${currentUser.name}@${currentUser.id}`,
        {
          type: "application/json",
        }
      );
      return file;
    } catch (error) {
      console.error("Error exporting database:", error);
    }
  };

  syncPublicDB = async () => {
    const dbs = await indexedDB.databases();
    const userDbs = dbs.filter((dbInfo) => {
      const isUserDb = dbInfo.name?.startsWith("webChatX@");
      return isUserDb;
    }) as IDBDatabaseInfo[];
    // peerId
    const userDbPeerIds = userDbs.map((userDb) => {
      return userDb.name?.slice(9);
    });
    // 获取所有用户的ID userId
    const allIds = await this.publicDb.users
      .toArray()
      .then((users) => users.map((user) => user.id));
    // 使用filter找出需要删除的用户ID userId
    const idsToDelete = allIds.filter((Id) => !userDbPeerIds.includes(Id));

    const addUserFromDB: PromiseExtended<string>[] = [];
    // userId
    for (const userDbPeerId of userDbPeerIds) {
      if (!allIds.includes(userDbPeerId!)) {
        const userDb = new Dexie(`webChatX@${userDbPeerId}`) as ActivatedUserDb;
        userDb.version(1).stores({
          info: "&id",
          friends: "&id",
          channels: "&id",
          messages:
            "&id, postUserId, answerUserId, channelId, &[postUserId+answerUserId], &[postUserId+channelId]",
        });
        try {
          await userDb.open();
          const dbUserInfo = await userDb.info.limit(1).first();
          if (dbUserInfo) {
            addUserFromDB.push(this.publicDb.users.put(dbUserInfo));
          }
        } catch (error) {
          console.error(
            `Error processing userDbPeerId ${userDbPeerId}:`,
            error
          );
        }
      }
    }
    await Promise.all(addUserFromDB);

    // 查询所有用户，并删除不在userDbIds列表中的用户
    const deleteIdWait = [];
    // 批量删除不需要的用户 userId
    for (const id of idsToDelete) {
      try {
        deleteIdWait.push(this.publicDb.users.delete(id));
      } catch (error) {
        // 这里可以处理可能的删除错误，比如记录不存在等
        console.error(`Error deleting user with id ${id}:`, error);
      }
    }
    await Promise.all(deleteIdWait);
  };

  importDB = async (file: Blob) => {
    const extractedBlobs = await this.splitMultipleBlobs(file);
    const loadArr = [];
    for (const dbBlob of extractedBlobs) {
      loadArr.push(this.importDatabase(dbBlob));
    }
    await Promise.all(loadArr);
    await this.syncPublicDB();
  };
  // 定义分隔符，这里使用一个不太可能在数据中出现的字节序列
  separatorBytes = new Uint8Array([0, 255, 238, 221]); // 对应于\x00\xFF\xEE\xDD
  async combineMultipleBlobs(blobs: Blob[]): Promise<Blob> {
    let combinedArray = new Uint8Array(0);

    for (const blob of blobs) {
      const currentArray = new Uint8Array(await blob.arrayBuffer());
      if (combinedArray.length > 0) {
        combinedArray = this.concatTypedArrays(
          combinedArray,
          this.separatorBytes
        ); // 在每个Blob之间插入分隔符
      }
      combinedArray = this.concatTypedArrays(combinedArray, currentArray);
    }

    return new Blob([combinedArray]);
  }

  // 辅助函数，用于合并两个Uint8Array
  concatTypedArrays(a: Uint8Array, b: Uint8Array): Uint8Array {
    const c = new Uint8Array(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
  }

  async splitMultipleBlobs(combinedBlob: Blob): Promise<Blob[]> {
    const combinedArray = new Uint8Array(await combinedBlob.arrayBuffer());
    let startIndex = 0;
    const blobs: Blob[] = [];

    // 外层循环确保处理完所有分隔符
    while (startIndex < combinedArray.length) {
      // 查找下一个分隔符的位置
      const separatorIndex = combinedArray.findIndex(
        (_, index) =>
          index >= startIndex && // 确保从startIndex开始查找
          index + this.separatorBytes.length <= combinedArray.length &&
          combinedArray
            .slice(index, index + this.separatorBytes.length)
            .every((v, i) => v === this.separatorBytes[i])
      );

      // 如果找不到分隔符（即到达最后一个Blob），则处理剩余部分并跳出循环
      if (separatorIndex === -1) {
        blobs.push(new Blob([combinedArray.slice(startIndex)]));
        break;
      }
      // 提取当前Blob的内容
      blobs.push(new Blob([combinedArray.slice(startIndex, separatorIndex)]));
      // 更新起始搜索位置到当前分隔符之后
      startIndex = separatorIndex + this.separatorBytes.length;
    }

    return blobs;
  }
}
