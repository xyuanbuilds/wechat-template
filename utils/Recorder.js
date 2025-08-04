/**
 * 实现一个 录音机
 * 能够支持 录音结束监听
 * 能够支持 录音错误监听
 * 能够支持 录音状态监听
 * 录音后的音频，能够支持缓存
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
