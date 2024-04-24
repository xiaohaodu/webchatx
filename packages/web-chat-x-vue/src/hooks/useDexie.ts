// useDb.ts
import { inject } from "vue";
import { DbService } from "@/database/dbService";

export default function useDb() {
  const dbService = inject<DbService | undefined>("dbService"); // 直接注入数据库实例
  if (!dbService) {
    console.log("The database instance has not been initialized.");
  }
  return {
    dbService: dbService!,
    publicDb: dbService!.publicDb,
    activatedUserDb: dbService!.activatedUserDb,
    createActivateUserDb: dbService!.createActivateUserDb.bind(dbService),
  };
}
