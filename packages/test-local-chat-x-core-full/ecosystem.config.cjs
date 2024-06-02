module.exports = {
  apps: [
    {
      name: "local-chat-x-core", // app name
      script: "./index.js", // 启动执行文件
      node_args: "--harmony",
      watch: true,
      exec_mode: "fork",
      watch_delay: 1000, // 文件变化后，延迟重启时间
    },
  ],
};
