type UsePwaNotificationReturn = {
  showNotification: (title: string, options?: NotificationOptions) => void;
};

export default function usePwaNotification(): UsePwaNotificationReturn {
  // 不需要从"web"导入，因为Notification和NotificationOptions是全局类型
  const showNotification = (title: string, options?: NotificationOptions) => {
    if ("serviceWorker" in navigator && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, options);
          });
        }
      });
    }
  };

  // 初始化时请求通知权限
  onMounted(async () => {
    await Notification.requestPermission();
  });

  return { showNotification };
}
