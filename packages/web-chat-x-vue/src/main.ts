import { createApp } from "vue";
import "./css/style.scss";
import "./css/tailwindcss.css";
import { router } from "./router";
import App from "./App.vue";
import { registerSW } from "virtual:pwa-register";
import { DbService } from "./database/dbService";
import "element-plus/theme-chalk/dark/css-vars.css";
import { Libp2pManager } from "./classes/Libp2pManager";
registerSW({ immediate: true });

const app = createApp(App);
// 注册全局变量，确保所有组件都能访问到唯一的数据库实例
const dbService = new DbService();

await dbService.createPublicDb();
app.provide("dbService", dbService); // 注入数据库实例
const libp2pManager = new Libp2pManager();
app.provide("libp2pManager", libp2pManager);

app.use(router);

app.mount("#app");
