import Dexie from "dexie";

async function start() {
  const dbb = new Dexie("test");
  dbb.version(1).stores({
    users: "&id, name",
    currentUser: "&unique, id, name",
  });

  await dbb.open();
  const db = dbb as any;
  await db.users.put({ id: 0, name: 0 });
  await db.users.put({ id: 1, name: 1 });
  await db.users.put({ id: 1, name: 1 });

  await db.currentUser.put({ unique: 0, id: 0, name: 0 });
  await db.currentUser.put({ unique: 0, id: 1, name: 0 });
  await db.currentUser.put({ unique: 1, id: 1, name: 0 });
  await db.currentUser.put({ unique: 1, id: 1, name: 1 });
}
start()
  .then(() => {
    console.log("ok");
  })
  .catch((e) => {
    console.log("not ok ", e);
  });
