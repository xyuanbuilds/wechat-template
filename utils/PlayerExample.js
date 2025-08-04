/**
 * AudioPlayer 使用示例
 *
 * 这个播放器自动检测运行环境：
 * - 微信小程序：使用 wx.createInnerAudioContext()
 * - H5/Web：使用 HTML5 Audio API
 */

// 引入播放器（小程序环境）
const audioPlayer = require("./Player.js");

// 或者在 H5 环境中，播放器会自动挂载到 window 对象
// const audioPlayer = window.audioPlayer;

// ==================== 基本使用 ====================

/**
 * 示例1：基本播放控制
 */
function basicPlayExample() {
  // 播放音频
  audioPlayer
    .play("https://example.com/audio.mp3")
    .then(() => {
      console.log("播放成功");
    })
    .catch((error) => {
      console.error("播放失败:", error);
    });

  // 暂停播放
  setTimeout(() => {
    audioPlayer.pause();
    console.log("已暂停");
  }, 5000);

  // 继续播放
  setTimeout(() => {
    audioPlayer.play();
    console.log("继续播放");
  }, 10000);

  // 停止播放
  setTimeout(() => {
    audioPlayer.stop();
    console.log("已停止");
  }, 15000);
}

/**
 * 示例2：预加载音频
 */
function preloadExample() {
  // 预先设置音频源（支持缓存）
  audioPlayer
    .setSrc("https://example.com/audio.mp3")
    .then((audioData) => {
      console.log("音频加载完成:", audioData);
      console.log("音频时长:", audioData.duration);

      // 后续可以直接播放，无需再次加载
      return audioPlayer.play();
    })
    .then(() => {
      console.log("播放开始");
    })
    .catch((error) => {
      console.error("加载或播放失败:", error);
    });
}

/**
 * 示例3：跳转和音量控制
 */
function seekAndVolumeExample() {
  audioPlayer.play("https://example.com/audio.mp3").then(() => {
    // 跳转到 30 秒位置
    audioPlayer.seek(30);

    // 设置音量为 50%（仅 H5 支持）
    audioPlayer.setVolume(0.5);

    // 获取当前状态
    const state = audioPlayer.getState();
    console.log("当前状态:", state);
  });
}

// ==================== 事件监听 ====================

/**
 * 示例4：事件监听
 */
function eventListenerExample() {
  // 监听播放开始
  audioPlayer.on("play", () => {
    console.log("🎵 播放开始");
  });

  // 监听暂停
  audioPlayer.on("pause", () => {
    console.log("⏸️ 播放暂停");
  });

  // 监听播放结束
  audioPlayer.on("ended", () => {
    console.log("🔚 播放结束");
  });

  // 监听播放错误
  audioPlayer.on("error", (error) => {
    console.error("❌ 播放错误:", error);
  });

  // 监听播放进度
  audioPlayer.on("timeupdate", (timeData) => {
    console.log(`⏱️ 播放进度: ${timeData.currentTime}/${timeData.duration}`);

    // 计算播放进度百分比
    const progress = (timeData.currentTime / timeData.duration) * 100;
    console.log(`播放进度: ${progress.toFixed(1)}%`);
  });

  // 监听状态变化
  audioPlayer.on("statechange", (state) => {
    console.log("📊 状态变化:", {
      playing: state.playing,
      paused: state.paused,
      loading: state.loading,
      currentTime: state.currentTime,
      duration: state.duration,
    });
  });

  // 监听加载状态
  audioPlayer.on("loadstart", () => {
    console.log("📂 开始加载音频");
  });

  audioPlayer.on("loadend", () => {
    console.log("✅ 音频加载完成");
  });

  audioPlayer.on("waiting", () => {
    console.log("⏳ 音频缓冲中...");
  });
}

// ==================== 实际应用场景 ====================

/**
 * 示例5：音乐播放器组件
 */
class MusicPlayerComponent {
  constructor() {
    this.player = audioPlayer;
    this.currentSong = null;
    this.playlist = [];
    this.currentIndex = 0;

    this.initEventListeners();
  }

  initEventListeners() {
    // 播放结束时自动下一首
    this.player.on("ended", () => {
      this.playNext();
    });

    // 监听播放进度，更新 UI
    this.player.on("timeupdate", (timeData) => {
      this.updateProgressBar(timeData);
    });

    // 监听状态变化，更新按钮状态
    this.player.on("statechange", (state) => {
      this.updateButtonState(state);
    });

    // 监听错误，显示错误信息
    this.player.on("error", (error) => {
      this.showErrorMessage(error);
    });
  }

  // 设置播放列表
  setPlaylist(songs) {
    this.playlist = songs;
    this.currentIndex = 0;
  }

  // 播放指定歌曲
  async playSong(index) {
    if (index < 0 || index >= this.playlist.length) {
      console.warn("歌曲索引超出范围");
      return;
    }

    this.currentIndex = index;
    this.currentSong = this.playlist[index];

    try {
      await this.player.play(this.currentSong.url);
      console.log(`正在播放: ${this.currentSong.title}`);
    } catch (error) {
      console.error("播放失败:", error);
    }
  }

  // 播放/暂停切换
  togglePlay() {
    const state = this.player.getState();
    if (state.playing) {
      this.player.pause();
    } else {
      this.player.play();
    }
  }

  // 上一首
  playPrevious() {
    const prevIndex = this.currentIndex - 1;
    const targetIndex = prevIndex < 0 ? this.playlist.length - 1 : prevIndex;
    this.playSong(targetIndex);
  }

  // 下一首
  playNext() {
    const nextIndex = (this.currentIndex + 1) % this.playlist.length;
    this.playSong(nextIndex);
  }

  // 更新进度条（需要具体实现）
  updateProgressBar(timeData) {
    // 在实际应用中，这里会更新 UI 进度条
    console.log(`进度更新: ${timeData.currentTime}/${timeData.duration}`);
  }

  // 更新按钮状态（需要具体实现）
  updateButtonState(state) {
    // 在实际应用中，这里会更新播放按钮的显示状态
    console.log("按钮状态更新:", state.playing ? "暂停" : "播放");
  }

  // 显示错误信息（需要具体实现）
  showErrorMessage(error) {
    // 在实际应用中，这里会显示错误提示
    console.error("播放器错误:", error);
  }
}

// ==================== 缓存管理 ====================

/**
 * 示例6：缓存管理
 */
function cacheManagementExample() {
  // 播放器会自动缓存已加载的音频信息

  // 手动清理过期缓存（超过10分钟的缓存）
  audioPlayer.clearCache(10 * 60 * 1000);

  // 获取当前状态（包含缓存信息）
  const state = audioPlayer.getState();
  console.log("播放器状态:", state);
}

// ==================== 环境检测 ====================

/**
 * 示例7：环境检测
 */
function environmentDetectionExample() {
  // 播放器会自动检测环境，但你也可以手动检测
  if (typeof wx !== "undefined" && wx.createInnerAudioContext) {
    console.log("当前运行在微信小程序环境");
  } else if (typeof window !== "undefined" && window.Audio) {
    console.log("当前运行在 H5 环境");
  } else {
    console.log("未知环境");
  }
}

// ==================== 播放器销毁 ====================

/**
 * 示例8：播放器销毁
 */
function destroyPlayerExample() {
  // 在页面卸载或组件销毁时，记得清理播放器
  audioPlayer.destroy();
  console.log("播放器已销毁");
}

// ==================== 导出示例 ====================

// 小程序中的使用
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    basicPlayExample,
    preloadExample,
    seekAndVolumeExample,
    eventListenerExample,
    MusicPlayerComponent,
    cacheManagementExample,
    environmentDetectionExample,
    destroyPlayerExample,
  };
}

// H5 中的使用
if (typeof window !== "undefined") {
  window.PlayerExamples = {
    basicPlayExample,
    preloadExample,
    seekAndVolumeExample,
    eventListenerExample,
    MusicPlayerComponent,
    cacheManagementExample,
    environmentDetectionExample,
    destroyPlayerExample,
  };
}
