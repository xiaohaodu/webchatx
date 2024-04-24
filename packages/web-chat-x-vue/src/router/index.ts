import {
  createWebHistory,
  createRouter,
  RouteRecordRaw,
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router";
import useDb from "@/hooks/useDexie";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { requiresAuth: false },
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
        path: "channel",
        name: "Channel",
        component: () => import("@/views/Channel.vue"),
      },
      {
        path: "private_chat",
        name: "PrivateChat",
        component: () => import("@/views/PrivateChat.vue"),
      },
      {
        path: "set",
        name: "Set",
        component: () => import("@/views/Set.vue"),
        redirect: { name: "UserInfo" },
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
    const { publicDb, createActivateUserDb, activatedUserDb } = useDb();
    const currentUser = await publicDb.currentUser.limit(1).first();
    // 刷新后为全局的dbService重新注入
    if (to.meta?.requiresAuth) {
      // 检查目标路由是否要求认证
      if (currentUser) {
        if (!activatedUserDb) {
          createActivateUserDb(currentUser, currentUser.id);
        }
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
