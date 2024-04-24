module.exports = {
  apps: [
    {
      name: "web-chat-x-express", // app name
      script: "./index.js", // 启动执行文件
      watch: true,
      exec_mode: "cluster",
      instances: "max",
      watch_delay: 1000, // 文件变化后，延迟重启时间
    },
  ],
};
