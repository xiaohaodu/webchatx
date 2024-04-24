<template>
  <el-main>
    <el-card>
      <div class="about-card-div">
        <h1><strong>关于我们：</strong></h1>

        <p>
          欢迎来到 <strong>WebChatX</strong>——
          一款专为现代互联网用户打造的创新型P2P（点对点）实时聊天软件。我们以浏览器作为核心载体，深度融合WebRTC技术与中继服务器支持，提供无插件、跨平台的即时通讯体验。同时，我们创新性地采用纯前端存储方案，确保您的数据安全、便捷且完全掌控。
        </p>

        <h2><strong>核心技术亮点：</strong></h2>

        <ol>
          <li>
            <strong>基于浏览器的无缝体验：</strong>
            WebChatX无需安装任何应用程序或插件，只需打开浏览器即可开始即时聊天。无论您使用的是Windows、macOS、Linux操作系统，还是iOS、Android移动设备，只要支持现代浏览器标准，即可随时随地畅享高效沟通。
          </li>
          <li>
            <strong>WebRTC驱动的实时通信：</strong>
            我们充分利用WebRTC（网页实时通信）技术，实现低延迟、高清晰度的音频、视频通话以及文件传输。无论身处何处，您都能享受到如同面对面般的流畅交流体验。WebRTC的端到端加密特性，更确保了您的通信内容在传输过程中的私密性和安全性。
          </li>
          <li>
            <strong>中继服务器助力穿透网络限制：</strong>
            面对复杂的网络环境和可能存在的NAT（网络地址转换）问题，WebChatX引入了中继服务器。当直接P2P连接不可行时，中继服务器将协助建立并维持通信通道，确保消息、语音、视频等数据能够稳定、可靠地送达对方，极大地提升了连接成功率。
          </li>
          <li>
            <strong>纯前端存储，数据尽在掌握：</strong>
            WebChatX颠覆传统，采用纯前端存储机制，您的聊天记录、联系人信息及设置数据均直接保存在本地浏览器存储中。这意味着您的数据不会在云端留痕，有效降低数据泄露风险。同时，我们提供便捷的数据备份与恢复功能，让您轻松管理个人聊天历史，随时随地访问重要信息。
          </li>
        </ol>

        <h2><strong>核心功能概述：</strong></h2>

        <ul>
          <li>
            <strong>一对一/群组聊天：</strong>
            支持文字、表情、图片、文件等多种消息类型，满足日常沟通需求。
          </li>
          <li>
            <strong>高清音视频通话：</strong>
            实现高品质的点对点或群组音视频会议，一键开启远程协作或亲密交流。
          </li>
          <li>
            <strong>联系人管理：</strong>
            添加、编辑、分组管理联系人，快速找到并发起聊天。
          </li>
          <li>
            <strong>离线消息推送：</strong>
            即使对方离线，消息也会在上线后立即送达，确保信息传递无遗漏。
          </li>
          <li>
            <strong>主题与个性化设置：</strong>
            提供多款主题供您选择，支持自定义聊天背景、字体等，打造个性化的聊天空间。
          </li>
          <li>
            <strong>数据备份与恢复：</strong>
            简单易用的数据备份工具，让您随时保存、迁移或恢复聊天记录。
          </li>
        </ul>

        <h2><strong>我们的承诺：</strong></h2>

        <p>
          WebChatX坚守用户隐私与数据安全，严格遵守相关法律法规，不收集、不分析用户的聊天内容与个人信息。我们致力于通过技术创新，为您提供便捷、安全、自由的通信环境，让每一次交流都充满信任与价值。
        </p>

        <h3><strong>加入WebChatX，让沟通无界，让信任永续。</strong></h3>
      </div>
    </el-card>
  </el-main>
</template>
<style lang="scss" setup>
.about-card-div {
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 65vh;
}
/* 以下CSS用于模拟Markdown的列表样式 */
ol {
  list-style-type: decimal; /* 使用数字序号 */
  margin-left: 1.75em; /* 设置适当的左缩进 */
}
ul {
  list-style-type: disc;
  margin-left: 1.75em; /* 设置适当的左缩进 */
}
</style>
