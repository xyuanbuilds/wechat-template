/**
 * 实现一个 音频播放器
 * 能够支持 播放、暂停、继续播放、停止、seek 等操作
 * 能够支持 播放暂停监听
 * 能够支持 播放结束监听
 * 能够支持 播放错误监听
 * 能够支持 播放状态监听
 * 加载后的音频，能够支持缓存
 *
 * 要求能够兼容 web-view 中的 H5 使用，也能直接在 小程序 中使用
 *
 * web-view 中无可用 jsapi，需要调用 web 原生接口
 *
 * 小程序中可用的 jsapi 有：
 * 1. wx.playVoice
 * 2. wx.pauseVoice
 * 3. wx.stopVoice
 * 4. wx.seekVoice
 * 5. wx.getVoiceInfo
 * 6. wx.getVoiceDuration
 * 7. wx.getVoicePath
 * 8. wx.getVoiceList
 */

class AudioPlayer {
  constructor() {
    // 单例模式：如果已经存在实例，直接返回
    if (AudioPlayer.instance) {
      return AudioPlayer.instance;
    }

    // 检测运行环境
    this.isWeChat = this._isWeChatEnvironment();
    this.isH5 = !this.isWeChat;

    // 播放器状态
    this.state = {
      src: "", // 当前音频源
      currentTime: 0, // 当前播放时间
      duration: 0, // 音频总时长
      volume: 1, // 音量 (0-1)
      playing: false, // 是否正在播放
      paused: false, // 是否暂停
      loading: false, // 是否正在加载
      buffered: 0, // 缓冲进度
      error: null, // 错误信息
    };

    // 内部状态标记（用于微信小程序区分暂停和停止）
    this._isStopped = false;

    // 内部状态标记（用于微信小程序区分暂停和停止）
    this._isStopped = false;

    // 事件监听器
    this.listeners = {
      play: [], // 播放开始
      pause: [], // 暂停
      stop: [], // 停止
      ended: [], // 播放结束
      error: [], // 播放错误
      timeupdate: [], // 播放进度更新
      loadstart: [], // 开始加载
      loadend: [], // 加载完成
      canplay: [], // 可以播放
      waiting: [], // 缓冲中
      statechange: [], // 状态变化
    };

    // 音频缓存
    this.audioCache = new Map();

    // 初始化播放器
    this._initPlayer();

    // 设置单例实例
    AudioPlayer.instance = this;
  }

  /**
   * 检测是否为微信环境
   */
  _isWeChatEnvironment() {
    // 检测是否存在 wx 对象和小程序环境
    if (typeof wx !== "undefined" && wx.createInnerAudioContext) {
      return true;
    }
    // 检测 User Agent
    if (typeof navigator !== "undefined") {
      return /MicroMessenger/i.test(navigator.userAgent);
    }
    return false;
  }

  /**
   * 初始化播放器
   */
  _initPlayer() {
    if (this.isWeChat) {
      this._initWeChatPlayer();
    } else {
      this._initH5Player();
    }
  }

  /**
   * 初始化微信小程序播放器
   */
  _initWeChatPlayer() {
    this.innerAudioContext = wx.createInnerAudioContext();

    // 绑定微信播放器事件
    this.innerAudioContext.onPlay(() => {
      console.log(
        `[AudioPlayer] onPlay 事件触发，当前音频: ${this.innerAudioContext.src}`
      );
      this.state.playing = true;
      this.state.paused = false;
      this.state.loading = false;
      this._isStopped = false; // 播放时重置停止标记
      this._emit("play");
      this._emit("statechange", { ...this.state });
    });

    this.innerAudioContext.onPause(() => {
      this.state.playing = false;
      this.state.paused = true;
      this.state.loading = false;
      // 暂停时不设置停止标记，保持之前的状态
      this._emit("pause");
      this._emit("statechange", { ...this.state });
    });

    this.innerAudioContext.onStop(() => {
      this.state.playing = false;
      this.state.paused = false;
      this.state.currentTime = 0;
      this.state.loading = false;
      this._isStopped = true; // 设置停止标记
      this._emit("stop");
      this._emit("statechange", { ...this.state });
    });

    this.innerAudioContext.onEnded(() => {
      this.state.playing = false;
      this.state.paused = false;
      this.state.currentTime = 0;
      this.state.loading = false;
      this._isStopped = true; // 播放结束也算停止状态
      this._emit("ended");
      this._emit("statechange", { ...this.state });
    });

    this.innerAudioContext.onError((error) => {
      this.state.error = error;
      this.state.playing = false;
      this.state.loading = false;
      this.state.error = error;
      this._emit("error", error);
      this._emit("statechange", { ...this.state });
    });

    this.innerAudioContext.onTimeUpdate(() => {
      this.state.currentTime = this.innerAudioContext.currentTime;
      this.state.duration = this.innerAudioContext.duration;
      this.state.loading = false;
      this._emit("timeupdate", {
        currentTime: this.state.currentTime,
        duration: this.state.duration,
      });
    });

    this.innerAudioContext.onCanplay(() => {
      this.state.loading = false;
      this.state.duration = this.innerAudioContext.duration;
      this._emit("canplay");
      this._emit("loadend");
      this._emit("statechange", { ...this.state });
    });

    this.innerAudioContext.onWaiting(() => {
      this.state.loading = true;
      this.state.error = null;
      this._emit("waiting");
      this._emit("statechange", { ...this.state });
    });
  }

  /**
   * 初始化 H5 播放器
   */
  _initH5Player() {
    this.audio = new Audio();

    // 绑定 H5 播放器事件
    this.audio.addEventListener("play", () => {
      this.state.playing = true;
      this.state.paused = false;
      this.state.loading = false;
      this._emit("play");
      this._emit("statechange", { ...this.state });
    });

    this.audio.addEventListener("pause", () => {
      this.state.playing = false;
      this.state.paused = true;
      this.state.loading = false;
      this._emit("pause");
      this._emit("statechange", { ...this.state });
    });

    this.audio.addEventListener("ended", () => {
      this.state.playing = false;
      this.state.paused = false;
      this.state.currentTime = 0;
      this.state.loading = false;
      this._emit("ended");
      this._emit("statechange", { ...this.state });
    });

    this.audio.addEventListener("error", (error) => {
      this.state.playing = false;
      this.state.loading = false;
      this.state.error = error;
      this._emit("error", error);
      this._emit("statechange", { ...this.state });
    });

    this.audio.addEventListener("timeupdate", () => {
      this.state.currentTime = this.audio.currentTime;
      this.state.duration = this.audio.duration || 0;
      this.state.loading = false;
      this._emit("timeupdate", {
        currentTime: this.state.currentTime,
        duration: this.state.duration,
      });
    });

    this.audio.addEventListener("loadstart", () => {
      this.state.loading = true;
      this.state.error = null;
      this._emit("loadstart");
      this._emit("statechange", { ...this.state });
    });

    this.audio.addEventListener("loadedmetadata", () => {
      this.state.duration = this.audio.duration || 0;
    });

    this.audio.addEventListener("canplay", () => {
      this.state.loading = false;
      this.state.error = null;
      this._emit("canplay");
      this._emit("loadend");
      this._emit("statechange", { ...this.state });
    });

    this.audio.addEventListener("waiting", () => {
      this.state.loading = true;
      this.state.error = null;
      this._emit("waiting");
      this._emit("statechange", { ...this.state });
    });

    this.audio.addEventListener("progress", () => {
      if (this.audio.buffered.length > 0) {
        this.state.buffered = this.audio.buffered.end(
          this.audio.buffered.length - 1
        );
      }
    });
  }

  /**
   * 设置音频源
   * @param {string} src 音频源 URL
   * @returns {Promise} 返回 Promise
   */
  setSrc(src) {
    return new Promise((resolve, reject) => {
      if (!src) {
        reject(new Error("音频源不能为空"));
        return;
      }

      // 重置播放状态
      this.state.src = src;
      this.state.error = null;
      this.state.currentTime = 0;
      this.state.duration = 0;
      this.state.playing = false;
      this.state.paused = false;
      this.state.loading = true;
      this._isStopped = false; // 重置停止标记

      // 检查缓存
      if (this.audioCache.has(src)) {
        const cachedData = this.audioCache.get(src);
        if (cachedData.loaded) {
          this.state.duration = cachedData.duration;
          this.state.loading = false;
          this._emit("statechange", { ...this.state });
          resolve(cachedData);
          return;
        }
      }

      // 触发加载开始事件
      this._emit("loadstart");
      this._emit("statechange", { ...this.state });

      if (this.isWeChat) {
        // 在设置新 src 之前，确保 innerAudioContext 处于干净状态
        console.log(`[AudioPlayer] 微信小程序设置音频源: ${src}`);
        console.log(
          `[AudioPlayer] 当前 innerAudioContext.src: ${this.innerAudioContext.src}`
        );

        try {
          // 先停止当前播放（如果有的话）
          this.innerAudioContext.stop();
          console.log(`[AudioPlayer] innerAudioContext.stop() 执行成功`);
        } catch (e) {
          // 忽略停止失败的错误
          console.log(
            `[AudioPlayer] innerAudioContext.stop() 失败: ${e.message}`
          );
        }

        // 设置新的音频源
        this.innerAudioContext.src = src;
        console.log(
          `[AudioPlayer] innerAudioContext.src 已设置为: ${this.innerAudioContext.src}`
        );

        // 微信小程序会自动触发 canplay 事件
        const onCanplay = () => {
          console.log(`[AudioPlayer] onCanplay 触发，音频源: ${src}`);
          console.log(
            `[AudioPlayer] innerAudioContext.src: ${this.innerAudioContext.src}`
          );
          console.log(
            `[AudioPlayer] innerAudioContext.duration: ${this.innerAudioContext.duration}`
          );

          this.innerAudioContext.offCanplay(onCanplay);
          this.innerAudioContext.offError(onError);

          this.state.loading = false;
          this.state.duration = this.innerAudioContext.duration;

          const audioData = {
            src: src,
            duration: this.innerAudioContext.duration,
            loaded: true,
            loadTime: Date.now(),
          };
          this.audioCache.set(src, audioData);

          this._emit("loadend");
          this._emit("statechange", { ...this.state });
          console.log(`[AudioPlayer] 音频加载完成: ${src}`);
          resolve(audioData);
        };
        const onError = (error) => {
          this.innerAudioContext.offCanplay(onCanplay);
          this.innerAudioContext.offError(onError);

          this.state.loading = false;
          this.state.error = error;
          this._emit("statechange", { ...this.state });
          reject(error);
        };
        this.innerAudioContext.onCanplay(onCanplay);
        this.innerAudioContext.onError(onError);
      } else {
        this.audio.src = src;
        const onCanplay = () => {
          this.audio.removeEventListener("canplay", onCanplay);
          this.audio.removeEventListener("error", onError);

          this.state.loading = false;
          this.state.duration = this.audio.duration;

          const audioData = {
            src: src,
            duration: this.audio.duration,
            loaded: true,
            loadTime: Date.now(),
          };
          this.audioCache.set(src, audioData);

          this._emit("loadend");
          this._emit("statechange", { ...this.state });
          resolve(audioData);
        };
        const onError = (error) => {
          this.audio.removeEventListener("canplay", onCanplay);
          this.audio.removeEventListener("error", onError);

          this.state.loading = false;
          this.state.error = error;
          this._emit("statechange", { ...this.state });
          reject(error);
        };
        this.audio.addEventListener("canplay", onCanplay);
        this.audio.addEventListener("error", onError);
      }
    });
  }

  /**
   * 播放音频
   * @param {string} src 可选，音频源 URL
   * @returns {Promise} 返回 Promise
   */
  play(src) {
    return new Promise(async (resolve, reject) => {
      try {
        // 如果传入了新的音频源，需要先停止当前播放
        if (src && src !== this.state.src) {
          console.log(`[AudioPlayer] 切换音频: ${this.state.src} -> ${src}`);

          // 停止当前播放（如果正在播放或加载）
          if (this.state.playing || this.state.loading || this.state.paused) {
            console.log(
              `[AudioPlayer] 停止当前播放，当前状态: playing=${this.state.playing}, loading=${this.state.loading}, paused=${this.state.paused}`
            );
            this.stop();
            // 等待一小段时间确保停止完成
            await new Promise((resolve) => setTimeout(resolve, 150));
          }

          // 设置新的音频源
          console.log(`[AudioPlayer] 开始设置新音频源: ${src}`);
          await this.setSrc(src);
          console.log(`[AudioPlayer] 音频源设置完成: ${this.state.src}`);
        } else if (src) {
          // 相同音频源，如果正在播放则直接返回
          if (this.state.playing) {
            resolve();
            return;
          }
          // 如果是暂停状态，直接继续播放
          if (this.state.paused && this.state.src === src) {
            if (this.isWeChat) {
              this.innerAudioContext.play();
            } else {
              await this.audio.play();
            }
            resolve();
            return;
          }
        }

        // 检查是否有音频源
        if (!this.state.src) {
          reject(new Error("请先设置音频源"));
          return;
        }

        // 如果当前正在加载，等待加载完成
        if (this.state.loading) {
          // 设置加载超时
          const loadTimeout = setTimeout(() => {
            reject(new Error("音频加载超时"));
          }, 10000); // 10秒超时

          // 等待加载完成
          const waitForLoad = () => {
            return new Promise((loadResolve) => {
              const checkLoad = () => {
                if (!this.state.loading) {
                  clearTimeout(loadTimeout);
                  loadResolve();
                } else {
                  setTimeout(checkLoad, 100);
                }
              };
              checkLoad();
            });
          };

          await waitForLoad();
        }

        // 开始播放
        console.log(`[AudioPlayer] 准备开始播放: ${this.state.src}`);

        if (this.isWeChat) {
          try {
            this._isStopped = false; // 播放时重置停止标记
            console.log(`[AudioPlayer] 调用 innerAudioContext.play()`);
            this.innerAudioContext.src = this.state.src;
            console.log(
              `[AudioPlayer] innerAudioContext.src: ${
                this.innerAudioContext ? this.innerAudioContext.src : "null"
              }`
            );
            this.innerAudioContext.play();
            // 播放成功后同步状态
            setTimeout(() => this._syncState(), 100);
            console.log(`[AudioPlayer] 播放调用成功`);
            resolve();
          } catch (error) {
            console.warn("微信音频播放失败:", error);
            reject(error);
          }
        } else {
          try {
            await this.audio.play();
            // 播放成功后同步状态
            this._syncState();
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 暂停播放
   */
  pause() {
    if (this.isWeChat) {
      try {
        if (this.innerAudioContext) {
          this.innerAudioContext.pause();
          // 暂停后同步状态
          setTimeout(() => this._syncState(), 50);
        }
      } catch (error) {
        console.warn("微信音频暂停失败:", error);
      }
    } else {
      this.audio.pause();
      // 暂停后同步状态
      this._syncState();
    }
  }

  /**
   * 停止播放
   */
  stop() {
    if (this.isWeChat) {
      try {
        if (this.innerAudioContext) {
          this._isStopped = true; // 设置停止标记
          this.innerAudioContext.stop();
          // 停止后同步状态
          setTimeout(() => this._syncState(), 50);
        }
      } catch (error) {
        console.warn("微信音频停止失败:", error);
        // 如果停止失败，手动更新状态
        this._isStopped = true; // 确保停止标记被设置
        this.state.playing = false;
        this.state.paused = false;
        this.state.currentTime = 0;
        this._emit("stop");
        this._emit("statechange", { ...this.state });
      }
    } else {
      this.audio.pause();
      this.audio.currentTime = 0;
      // 同步状态并手动触发事件
      this._syncState();
      this._emit("stop");
      this._emit("statechange", { ...this.state });
    }
  }

  /**
   * 跳转到指定时间
   * @param {number} time 时间（秒）
   */
  seek(time) {
    if (time < 0 || time > this.state.duration) {
      console.warn("seek 时间超出范围");
      return;
    }

    if (this.isWeChat) {
      if (this.innerAudioContext) {
        this.innerAudioContext.seek(time);
        // 跳转后同步状态
        setTimeout(() => this._syncState(), 100);
      }
    } else {
      this.audio.currentTime = time;
      // 跳转后同步状态
      this._syncState();
    }
  }

  /**
   * 设置音量
   * @param {number} volume 音量值 (0-1)
   */
  setVolume(volume) {
    if (volume < 0 || volume > 1) {
      console.warn("音量值应该在 0-1 之间");
      return;
    }

    this.state.volume = volume;

    if (this.isWeChat) {
      // 微信小程序的 InnerAudioContext 不支持设置音量
      console.warn("微信小程序暂不支持设置音量");
    } else {
      this.audio.volume = volume;
    }
  }

  /**
   * 同步播放器状态（内部方法）
   */
  _syncState() {
    // 从实际的播放器API获取最新状态并同步更新内部状态
    if (this.isWeChat && this.innerAudioContext) {
      try {
        // 获取微信小程序音频实时状态
        const currentTime = this.innerAudioContext.currentTime || 0;
        const duration =
          this.innerAudioContext.duration || this.state.duration || 0;
        const paused = this.innerAudioContext.paused;

        // 更新内部状态
        this.state.currentTime = isNaN(currentTime) ? 0 : currentTime;
        this.state.duration = isNaN(duration) ? this.state.duration : duration;

        // 微信小程序的播放状态判断
        if (this._isStopped) {
          // 如果是停止状态
          this.state.playing = false;
          this.state.paused = false;
        } else if (paused) {
          // 如果是暂停状态
          this.state.playing = false;
          this.state.paused = currentTime > 0; // 只有播放过才算暂停状态
        } else {
          // 如果是播放状态
          this.state.playing = true;
          this.state.paused = false;
        }

        // 微信小程序没有直接的 buffered 属性，保持原值
        // this.state.buffered 保持不变
      } catch (error) {
        console.warn("获取微信播放器状态失败:", error);
      }
    } else if (!this.isWeChat && this.audio) {
      try {
        // 获取 H5 音频实时状态
        const currentTime = this.audio.currentTime || 0;
        const duration = this.audio.duration || 0;
        const paused = this.audio.paused;
        const ended = this.audio.ended;

        // 更新内部状态
        this.state.currentTime = isNaN(currentTime) ? 0 : currentTime;
        this.state.duration = isNaN(duration) ? this.state.duration : duration;

        // H5 音频的播放状态判断
        if (ended) {
          this.state.playing = false;
          this.state.paused = false;
        } else if (paused) {
          this.state.playing = false;
          this.state.paused = currentTime > 0; // 只有播放过才算暂停状态
        } else {
          this.state.playing = true;
          this.state.paused = false;
        }

        // 更新缓冲状态
        if (this.audio.buffered && this.audio.buffered.length > 0) {
          this.state.buffered = this.audio.buffered.end(
            this.audio.buffered.length - 1
          );
        }
      } catch (error) {
        console.warn("获取H5播放器状态失败:", error);
      }
    }
  }

  /**
   * 获取当前状态
   */
  getState() {
    // 先同步状态，再返回
    this._syncState();
    return { ...this.state };
  }

  /**
   * 获取详细状态（包含内部标记，用于调试）
   */
  getDetailedState() {
    this._syncState();
    return {
      ...this.state,
      _isStopped: this._isStopped,
      _isWeChat: this.isWeChat,
      _hasInnerAudioContext: !!this.innerAudioContext,
      _hasAudio: !!this.audio,
    };
  }

  /**
   * 获取详细状态（包含内部标记，用于调试）
   */
  getDetailedState() {
    this._syncState();
    return {
      ...this.state,
      _isStopped: this._isStopped,
      _isWeChat: this.isWeChat,
      _hasInnerAudioContext: !!this.innerAudioContext,
      _hasAudio: !!this.audio,
    };
  }

  /**
   * 添加事件监听器
   * @param {string} event 事件名称
   * @param {Function} callback 回调函数
   */
  on(event, callback) {
    if (this.listeners[event] && typeof callback === "function") {
      this.listeners[event].push(callback);
    }
  }

  /**
   * 移除事件监听器
   * @param {string} event 事件名称
   * @param {Function} callback 回调函数
   */
  off(event, callback) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  /**
   * 清除所有监听器
   * @param {string} event 可选，指定事件名称
   */
  removeAllListeners(event) {
    if (event) {
      if (this.listeners[event]) {
        this.listeners[event] = [];
      }
    } else {
      Object.keys(this.listeners).forEach((key) => {
        this.listeners[key] = [];
      });
    }
  }

  /**
   * 触发事件
   * @param {string} event 事件名称
   * @param {any} data 事件数据
   */
  _emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`事件监听器执行错误: ${event}`, error);
        }
      });
    }
  }

  /**
   * 清理缓存
   * @param {number} maxAge 最大缓存时间（毫秒），默认 30 分钟
   */
  clearCache(maxAge = 30 * 60 * 1000) {
    const now = Date.now();
    for (const [key, value] of this.audioCache.entries()) {
      if (now - value.loadTime > maxAge) {
        this.audioCache.delete(key);
      }
    }
  }

  /**
   * 销毁播放器
   */
  destroy() {
    this.stop();
    this.removeAllListeners();

    if (this.isWeChat && this.innerAudioContext) {
      this.innerAudioContext.destroy();
    }

    this.audioCache.clear();
    AudioPlayer.instance = null;
  }
}

// 静态方法：获取单例实例
AudioPlayer.getInstance = function () {
  if (!AudioPlayer.instance) {
    AudioPlayer.instance = new AudioPlayer();
  }
  return AudioPlayer.instance;
};

// 导出单例实例
const playerInstance = AudioPlayer.getInstance();

// 兼容不同的模块导出方式
if (typeof module !== "undefined" && module.exports) {
  // CommonJS (小程序)
  module.exports = playerInstance;
  module.exports.AudioPlayer = AudioPlayer;
} else if (typeof window !== "undefined") {
  // 浏览器全局变量
  window.AudioPlayer = AudioPlayer;
  window.audioPlayer = playerInstance;
}

// ES6 模块导出 (如果需要，可以取消注释)
// export default playerInstance;
// export { AudioPlayer };
