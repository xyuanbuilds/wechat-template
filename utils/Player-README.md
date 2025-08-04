# 🎵 音频播放器 (AudioPlayer) 使用指南

## 📖 概述

这是一个兼容微信小程序和 H5 环境的音频播放器，支持全局单例模式，提供统一的 API 接口。

## 🚀 快速开始

### 1. 在小程序中使用

```javascript
const audioPlayer = require("./utils/Player.js");

// 播放音频
audioPlayer
  .play("https://example.com/audio.mp3")
  .then(() => console.log("播放成功"))
  .catch((error) => console.error("播放失败:", error));
```

### 2. 在 H5 中使用

```javascript
// 播放器会自动挂载到 window 对象
const audioPlayer = window.audioPlayer;

// 使用方法相同
audioPlayer.play("https://example.com/audio.mp3");
```

## 🎛️ 测试页面

我们提供了一个完整的测试页面 `pages/player-test/player-test`，包含以下功能：

### 📱 测试页面功能

1. **播放控制**

   - ▶️ 播放/暂停切换
   - ⏹️ 停止播放
   - ⏮️⏭️ 上一首/下一首
   - 🎚️ 进度条拖拽控制
   - 🔊 音量调节（仅 H5 支持）

2. **音频列表测试**

   - 预设多个测试音频
   - 点击切换播放
   - 当前播放状态显示

3. **自定义音频测试**

   - 输入自定义音频 URL
   - 测试不同格式音频文件

4. **功能测试**

   - 📂 预加载测试
   - 🗑️ 缓存清理
   - 📊 状态查看

5. **实时日志**
   - 显示所有播放器事件
   - 支持日志复制和清空
   - 实时状态监控

### 🔍 如何访问测试页面

1. **通过首页导航**：在小程序首页点击"播放器测试"按钮
2. **直接访问**：在微信开发者工具中直接打开 `pages/player-test/player-test` 页面
3. **扫码测试**：部署后扫码进入小程序，导航到测试页面

## 🎯 主要 API

### 播放控制

```javascript
// 播放音频（可选传入 URL）
await audioPlayer.play("https://example.com/audio.mp3");

// 暂停播放
audioPlayer.pause();

// 停止播放
audioPlayer.stop();

// 跳转到指定时间（秒）
audioPlayer.seek(30);
```

### 音频管理

```javascript
// 预加载音频
const audioData = await audioPlayer.setSrc("https://example.com/audio.mp3");
console.log("音频时长:", audioData.duration);

// 设置音量（0-1，仅 H5 支持）
audioPlayer.setVolume(0.5);

// 获取当前状态
const state = audioPlayer.getState();
console.log("播放状态:", state);
```

### 事件监听

```javascript
// 监听播放开始
audioPlayer.on("play", () => {
  console.log("播放开始");
});

// 监听播放进度
audioPlayer.on("timeupdate", (timeData) => {
  console.log(`进度: ${timeData.currentTime}/${timeData.duration}`);
});

// 监听播放结束
audioPlayer.on("ended", () => {
  console.log("播放结束");
});

// 监听播放错误
audioPlayer.on("error", (error) => {
  console.error("播放错误:", error);
});

// 移除事件监听
audioPlayer.off("play", callback);
```

### 缓存管理

```javascript
// 清理过期缓存（默认 30 分钟）
audioPlayer.clearCache();

// 清理超过 10 分钟的缓存
audioPlayer.clearCache(10 * 60 * 1000);
```

## 🎵 支持的事件类型

| 事件名        | 说明         | 参数                      |
| ------------- | ------------ | ------------------------- |
| `play`        | 播放开始     | 无                        |
| `pause`       | 播放暂停     | 无                        |
| `stop`        | 播放停止     | 无                        |
| `ended`       | 播放结束     | 无                        |
| `error`       | 播放错误     | error 对象                |
| `timeupdate`  | 播放进度更新 | `{currentTime, duration}` |
| `loadstart`   | 开始加载     | 无                        |
| `loadend`     | 加载完成     | 无                        |
| `waiting`     | 缓冲中       | 无                        |
| `statechange` | 状态变化     | 完整状态对象              |

## 🎛️ 播放器状态

```javascript
const state = audioPlayer.getState();
// 返回对象包含：
{
  src: '',              // 当前音频源
  currentTime: 0,       // 当前播放时间
  duration: 0,          // 音频总时长
  volume: 1,            // 音量 (0-1)
  playing: false,       // 是否正在播放
  paused: false,        // 是否暂停
  loading: false,       // 是否正在加载
  buffered: 0,          // 缓冲进度
  error: null           // 错误信息
}
```

## ⚠️ 注意事项

### 微信小程序限制

1. **音量控制**：微信小程序不支持设置音量，`setVolume()` 方法会显示警告
2. **自动播放**：小程序需要用户交互后才能播放音频
3. **音频格式**：建议使用 MP3、AAC 等通用格式

### H5 环境限制

1. **自动播放**：现代浏览器限制自动播放，需要用户交互
2. **跨域问题**：确保音频资源支持跨域访问
3. **HTTPS**：在 HTTPS 环境下使用时，音频资源也需要 HTTPS

### 通用建议

1. **错误处理**：始终添加错误处理逻辑
2. **资源管理**：及时清理不需要的事件监听器
3. **缓存策略**：合理使用缓存功能，避免重复加载
4. **性能优化**：大文件音频建议预加载

## 🛠️ 开发调试

### 测试流程

1. 打开微信开发者工具
2. 导航到"播放器测试"页面
3. 测试各项功能
4. 查看实时日志
5. 验证不同场景下的表现

### 常见问题

**Q: 播放器无声音？**
A: 检查设备音量、音频文件是否有效、网络连接是否正常

**Q: 事件监听不触发？**
A: 确认事件名称正确，检查是否正确绑定事件监听器

**Q: 缓存不生效？**
A: 确认音频 URL 相同，检查网络状态，缓存可能在网络错误时清除

## 📝 更新日志

### v1.0.0

- ✅ 支持微信小程序和 H5 双端
- ✅ 全局单例模式
- ✅ 完整的事件系统
- ✅ 音频缓存功能
- ✅ 详细的测试页面

## 📞 技术支持

如果在使用过程中遇到问题，请：

1. 查看测试页面的事件日志
2. 检查控制台错误信息
3. 确认音频资源是否可访问
4. 验证网络连接状态

---

🎵 **享受音频播放的乐趣！**
