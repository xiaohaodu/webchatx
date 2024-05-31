// useDb.ts
import { DatabaseManager } from "@/classes/DatabaseManager";

export default function useDb() {
  const databaseManager =
    inject<Ref<DatabaseManager | undefined>>("databaseManager"); // 直接注入数据库实例
  if (!databaseManager?.value) {
    throw new Error("The database instance has not been initialized.");
  }
  const resetDatabaseManager = async () => {
    databaseManager.value = new DatabaseManager();
    await databaseManager.value.createPublicDb();
  };
  return {
    resetDatabaseManager,
    databaseManager: databaseManager.value!,
  };
}
