import {
  createWebHistory,
  createRouter,
  RouteRecordRaw,
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router";
import useDb from "@/hooks/useDexie";
import { useDark } from "@vueuse/core";
import useLibp2p from "@/hooks/useLibp2p";
import { peerIdFromPeerId } from "@libp2p/peer-id";
import usePeer from "@/hooks/usePeer";
const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/test",
    name: "Test",
    component: () => import("@/views/Test.vue"),
    meta: { requiresAuth: false },
    redirect: { name: "TestDeixe" },
    children: [
      {
        path: "deixe",
        name: "TestDeixe",
        component: () =>
          import("@/components/TestComponents/TestDexieComponent.vue"),
      },
      {
        path: "emoji",
        name: "TestEmoji",
        component: () =>
          import("@/components/TestComponents/TestEmojiComponent.vue"),
      },
      {
        path: "peer_video",
        name: "TestPeerVideo",
        component: () =>
          import("@/components/TestComponents/TestPeerVideoComponent.vue"),
      },
      {
        path: "blob",
        name: "TestBlob",
        component: () =>
          import("@/components/TestComponents/TestBlobComponent.vue"),
      },
    ],
  },
  {
    path: "/overdue",
    name: "Overdue",
    component: () => import("@/views/Test.vue"),
    meta: { requiresAuth: false },
    redirect: { name: "OverdueVideo" },
    children: [
      {
        path: "video",
        name: "OverdueVideo",
        component: () =>
          import("@/components/OverdueComponents/OverdueVideoComponent.vue"),
      },
    ],
  },
  {
    path: "/",
    component: () => import("@/layouts/DefaultLayout.vue"),
    meta: { requiresAuth: true },
    redirect: { name: "Homepage" },
    children: [
      {
        path: "homepage",
        name: "Homepage",
        component: () => import("@/views/Homepage.vue"),
      },
      {
        path: "start_chatting",
        name: "StartChatting",
        component: () => import("@/views/StartChatting.vue"),
      },
      {
        path: "channel/:channel_id",
        name: "Channel",
        component: () => import("@/views/Channel.vue"),
      },
      {
        path: "private_chat/:user_id",
        name: "PrivateChat",
        component: () => import("@/views/PrivateChat.vue"),
      },
      {
        path: "set",
        name: "Set",
        component: () => import("@/views/Set.vue"),
        redirect: { name: "UserInfo" },
        meta: { activeMenu: "/set" },
        children: [
          {
            path: "userInfo",
            name: "UserInfo",
            component: () => import("@/components/SetUserInfoComponent.vue"),
          },
          {
            path: "privacy",
            name: "Privacy",
            component: () => import("@/components/SetPrivacyComponent.vue"),
          },
          {
            path: "about",
            name: "About",
            component: () => import("@/components/SetAboutComponent.vue"),
          },
          {
            path: "audio_video",
            name: "AudioVIdeo",
            component: () => import("@/components/SetAudioVideoComponent.vue"),
          },
          {
            path: "general",
            name: "General",
            component: () => import("@/components/SetGeneralComponent.vue"),
          },
          {
            path: "advanced",
            name: "Advanced",
            component: () => import("@/components/SetAdvancedComponent.vue"),
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局前置守卫
router.beforeEach(
  async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    useDark();
    const { createActivateUserDb, databaseManager } = useDb();
    const { libp2pManager } = useLibp2p();
    const { peerManager } = usePeer();
    libp2pManager.databaseManager = databaseManager;
    libp2pManager.peerManager = peerManager;
    const currentUser = await databaseManager.publicDb.currentUser
      .limit(1)
      .first();
    // 刷新后为全局的databaseManager重新注入
    if (to.meta?.requiresAuth) {
      // 检查目标路由是否要求认证
      // 如果有登录用户（public用户数据库控制）
      if (currentUser) {
        // 如果没有将当前登录用户设置为活跃用户，则创建使用当前用户信息，写入活跃用户数据库（active用户数据库（仅一个用户信息的数据库）控制）
        if (!databaseManager.activatedUserDb) {
          const dbs = await indexedDB.databases();
          const have = dbs.find((dbInfo) => {
            return `webChatX@${currentUser.id}` === dbInfo.name;
          });
          if (have) {
            await createActivateUserDb(currentUser, currentUser.id);
          } else {
            await databaseManager.syncPublicDB();
            next({ path: "/login" }); // 用户未登录，重定向到登录页
          }
        }
        // 如果当前libp2p节点管理器状态没有在运行，则根据当前用户创建启动节点
        if (!libp2pManager.getStatus()) {
          // 如果当前节点没有被创建，则创建
          if (!libp2pManager.getLibp2p()) {
            const peerId = peerIdFromPeerId(currentUser.peerId);
            await libp2pManager.createLibp2pNode(peerId);
          }
          //启动libp2p节点
          await libp2pManager.startLibp2pNode();
          libp2pManager.setChatUser(currentUser);
        }
        // 代码运行到这里肯定database和libp2p都已经正常启用了，那么可以启动peer了
        peerManager.createPeer({
          nearPeerId: currentUser.id,
        });
        next(); // 用户已登录，允许访问
      } else {
        next({ path: "/login" }); // 用户未登录，重定向到登录页
      }
    } else {
      next(); // 不需要认证，直接进入目标路由
    }
  }
);
export { router };
