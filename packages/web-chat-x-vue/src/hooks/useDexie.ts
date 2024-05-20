// useDb.ts
import { DatabaseManager } from "@/classes/DatabaseManager";

export default function useDb() {
  const databaseManager = inject<DatabaseManager | undefined>(
    "databaseManager"
  ); // 直接注入数据库实例
  if (!databaseManager) {
    throw new Error("The database instance has not been initialized.");
  }
  return {
    databaseManager: databaseManager!,
    createActivateUserDb:
      databaseManager!.createActivateUserDb.bind(databaseManager),
  };
}
