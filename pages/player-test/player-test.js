// pages/player-test/player-test.js
const audioPlayer = require("../../utils/Player.js");

Page({
  data: {
    // 播放器状态
    playerState: {
      src: "",
      currentTime: 0,
      duration: 0,
      playing: false,
      paused: false,
      loading: false,
      error: null,
    },

    // 测试音频列表
    testAudios: [
      {
        id: 1,
        title: "测试音频 1",
        url: "https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/music/audio.mp3",
        duration: "0:05",
      },
      {
        id: 2,
        title: "测试音频 2",
        url: "https://sf1-cdn-tos.huoshanstatic.com/obj/labcv-tob/muse/tts_BV005.mp3",
        duration: "0:03",
      },
    ],

    // 当前选中的音频
    currentAudioIndex: 0,

    // 自定义音频 URL
    customUrl: "",

    // 播放进度
    progress: 0,

    // 音量
    volume: 100,

    // 事件日志
    eventLogs: [],

    // 播放器信息
    playerInfo: {
      isWeChat: false,
      version: "1.0.0",
    },
  },

  onLoad() {
    console.log("播放器测试页面加载");
    this.initPlayer();
    this.detectEnvironment();
  },

  onUnload() {
    // 页面卸载时清理播放器
    this.cleanupPlayer();
  },

  // 初始化播放器
  initPlayer() {
    // 获取播放器初始状态
    const state = audioPlayer.getState();
    this.setData({
      playerState: state,
    });

    // 绑定播放器事件
    this.bindPlayerEvents();

    this.addLog("播放器初始化完成");
  },

  // 绑定播放器事件监听
  bindPlayerEvents() {
    // 播放开始
    audioPlayer.on("play", () => {
      this.addLog("🎵 播放开始");
      this.updatePlayerState();
    });

    // 暂停
    audioPlayer.on("pause", () => {
      this.addLog("⏸️ 播放暂停");
      // 显示详细状态信息，帮助调试
      const detailedState = audioPlayer.getDetailedState();
      this.addLog(
        `   暂停状态确认: _isStopped=${detailedState._isStopped}, playing=${detailedState.playing}, paused=${detailedState.paused}`
      );
      this.updatePlayerState();
    });

    // 停止
    audioPlayer.on("stop", () => {
      this.addLog("⏹️ 播放停止");
      // 显示详细状态信息，帮助调试
      const detailedState = audioPlayer.getDetailedState();
      this.addLog(
        `   停止状态确认: _isStopped=${detailedState._isStopped}, playing=${detailedState.playing}, paused=${detailedState.paused}`
      );
      this.updatePlayerState();
    });

    // 播放结束
    audioPlayer.on("ended", () => {
      this.addLog("🔚 播放结束");
      this.updatePlayerState();
    });

    // 播放错误
    audioPlayer.on("error", (error) => {
      this.addLog(
        `❌ 播放错误: ${error.errMsg || error.message || JSON.stringify(error)}`
      );
      this.updatePlayerState();
    });

    // 播放进度更新
    audioPlayer.on("timeupdate", (timeData) => {
      const progress =
        timeData.duration > 0
          ? (timeData.currentTime / timeData.duration) * 100
          : 0;
      this.setData({
        progress: Math.round(progress),
      });
      this.updatePlayerState();
    });

    // 加载开始
    audioPlayer.on("loadstart", () => {
      this.addLog("📂 开始加载音频");
      this.updatePlayerState();
    });

    // 加载完成
    audioPlayer.on("loadend", () => {
      this.addLog("✅ 音频加载完成");
      this.updatePlayerState();
    });

    // 缓冲中
    audioPlayer.on("waiting", () => {
      this.addLog("⏳ 音频缓冲中...");
      this.updatePlayerState();
    });

    // 状态变化
    audioPlayer.on("statechange", () => {
      this.updatePlayerState();
    });
  },

  // 更新播放器状态
  updatePlayerState() {
    const state = audioPlayer.getState();
    this.setData({
      playerState: state,
    });
  },

  // 检测运行环境
  detectEnvironment() {
    const isWeChat = typeof wx !== "undefined" && wx.createInnerAudioContext;
    this.setData({
      "playerInfo.isWeChat": isWeChat,
    });

    this.addLog(`🔍 运行环境: ${isWeChat ? "微信小程序" : "H5/Web"}`);
  },

  // 添加事件日志
  addLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;

    const logs = this.data.eventLogs;
    logs.unshift(logEntry);

    // 限制日志数量，避免内存占用过多
    if (logs.length > 50) {
      logs.pop();
    }

    this.setData({
      eventLogs: logs,
    });

    console.log(logEntry);
  },

  // 播放指定音频
  async playAudio(e) {
    const index = e.currentTarget.dataset.index;
    const audio = this.data.testAudios[index];

    this.setData({
      currentAudioIndex: index,
    });

    this.addLog(`🎯 准备播放: ${audio.title}`);

    try {
      await audioPlayer.play(audio.url);
      this.addLog(`✅ 开始播放: ${audio.title}`);
    } catch (error) {
      this.addLog(`❌ 播放失败: ${error.message}`);
      wx.showToast({
        title: "播放失败",
        icon: "error",
      });
    }
  },

  // 播放/暂停切换
  togglePlay() {
    const state = audioPlayer.getState();

    if (state.playing) {
      audioPlayer.pause();
      this.addLog("⏸️ 手动暂停");
    } else if (state.paused) {
      audioPlayer.play();
      this.addLog("▶️ 继续播放");
    } else {
      // 如果没有音频源，播放第一个测试音频
      if (!state.src) {
        this.playAudio({ currentTarget: { dataset: { index: 0 } } });
      } else {
        audioPlayer.play();
        this.addLog("▶️ 开始播放");
      }
    }
  },

  // 停止播放
  stopPlay() {
    audioPlayer.stop();
    this.addLog("⏹️ 手动停止");
  },

  // 上一首
  playPrevious() {
    const currentIndex = this.data.currentAudioIndex;
    const prevIndex =
      currentIndex > 0 ? currentIndex - 1 : this.data.testAudios.length - 1;

    this.playAudio({ currentTarget: { dataset: { index: prevIndex } } });
  },

  // 下一首
  playNext() {
    const currentIndex = this.data.currentAudioIndex;
    const nextIndex = (currentIndex + 1) % this.data.testAudios.length;

    this.playAudio({ currentTarget: { dataset: { index: nextIndex } } });
  },

  // 进度条拖拽
  onProgressChange(e) {
    const progress = e.detail.value;
    const state = audioPlayer.getState();

    if (state.duration > 0) {
      const seekTime = (progress / 100) * state.duration;
      audioPlayer.seek(seekTime);
      this.addLog(`⏭️ 跳转到: ${this.formatTime(seekTime)}`);
    }
  },

  // 音量调节
  onVolumeChange(e) {
    const volume = e.detail.value;
    const volumeValue = volume / 100;

    audioPlayer.setVolume(volumeValue);
    this.setData({ volume });
    this.addLog(`🔊 音量设置: ${volume}%`);
  },

  // 自定义 URL 输入
  onCustomUrlInput(e) {
    this.setData({
      customUrl: e.detail.value,
    });
  },

  // 播放自定义 URL
  async playCustomUrl() {
    const url = this.data.customUrl.trim();

    if (!url) {
      wx.showToast({
        title: "请输入音频 URL",
        icon: "error",
      });
      return;
    }

    this.addLog(`🎯 播放自定义音频: ${url}`);

    try {
      await audioPlayer.play(url);
      this.addLog("✅ 自定义音频播放成功");
    } catch (error) {
      this.addLog(`❌ 自定义音频播放失败: ${error.message}`);
      wx.showToast({
        title: "播放失败",
        icon: "error",
      });
    }
  },

  // 预加载测试
  async preloadTest() {
    const audio = this.data.testAudios[0];
    this.addLog(`📂 预加载测试: ${audio.title}`);

    try {
      const audioData = await audioPlayer.setSrc(audio.url);
      this.addLog(`✅ 预加载成功: 时长 ${this.formatTime(audioData.duration)}`);
    } catch (error) {
      this.addLog(`❌ 预加载失败: ${error.message}`);
    }
  },

  // 清理缓存
  clearCache() {
    audioPlayer.clearCache();
    this.addLog("🗑️ 缓存已清理");
    wx.showToast({
      title: "缓存已清理",
      icon: "success",
    });
  },

  // 清空日志
  clearLogs() {
    this.setData({
      eventLogs: [],
    });
  },

  // 获取播放器状态
  getPlayerState() {
    const state = audioPlayer.getDetailedState();
    const stateInfo = JSON.stringify(state, null, 2);

    this.addLog("📊 详细状态 (包含内部标记):");
    this.addLog(stateInfo);

    wx.showModal({
      title: "播放器详细状态",
      content: stateInfo,
      showCancel: false,
    });
  },

  // 清理播放器
  cleanupPlayer() {
    audioPlayer.removeAllListeners();
    this.addLog("🧹 播放器事件监听已清理");
  },

  // 格式化时间
  formatTime(seconds) {
    if (!seconds || seconds < 0) return "00:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  },

  // 复制日志
  copyLogs() {
    const logs = this.data.eventLogs.join("\n");

    wx.setClipboardData({
      data: logs,
      success: () => {
        wx.showToast({
          title: "日志已复制",
          icon: "success",
        });
      },
    });
  },
});
