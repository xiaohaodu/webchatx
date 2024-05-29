import { createApp } from "vue";
import "./css/style.scss";
import "./css/tailwindcss.css";
import { router } from "./router";
import App from "./App.vue";
import { DatabaseManager } from "./classes/DatabaseManager";
import "element-plus/theme-chalk/dark/css-vars.css";
import { Libp2pManager } from "./classes/Libp2pManager";
import { PeerManager } from "./classes/PeerManager";

const app = createApp(App);
// 注册全局变量，确保所有组件都能访问到唯一的数据库实例
const databaseManager = new DatabaseManager();
await databaseManager.createPublicDb();
app.provide("databaseManager", databaseManager);

// 注册全局变量，确保所有组件都能访问到唯一的Libp2p节点实例
const libp2pManager = new Libp2pManager();
app.provide("libp2pManager", libp2pManager);

// 注册全局变量，确保所有组件都能都访问到唯一的WebRTC节点实例
const peerManager = new PeerManager();
app.provide("peerManager", peerManager);

app.use(router);
app.mount("#app");

// import { registerSW } from "virtual:pwa-register";
// registerSW({ immediate: true });
