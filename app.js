// app.js
App({
  onLaunch: function (options) {
    // 小程序启动时触发
    console.log("小程序启动", options);

    // 获取系统信息
    this.getSystemInfo();

    // 获取第三方平台配置
    this.getExtConfig();

    // 检查更新
    this.checkUpdate();
  },

  onShow: function (options) {
    // 小程序显示时触发
    console.log("小程序显示", options);
  },

  onHide: function () {
    // 小程序隐藏时触发
    console.log("小程序隐藏");
  },

  onError: function (msg) {
    // 小程序错误时触发
    console.error("小程序错误:", msg);
  },

  // 获取系统信息
  getSystemInfo: function () {
    const that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.systemInfo = res;
      },
    });
  },

  // 获取第三方平台配置
  getExtConfig: function () {
    const that = this;
    wx.getExtConfigSync
      ? (that.globalData.extConfig = wx.getExtConfigSync())
      : "";
  },

  // 检查小程序更新
  checkUpdate: function () {
    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log("检查更新结果:", res.hasUpdate);
    });

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: "更新提示",
        content: "新版本已经准备好，是否重启应用？",
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
          }
        },
      });
    });

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
      console.error("新版本下载失败");
    });
  },

  // 全局数据
  globalData: {
    userInfo: null,
    systemInfo: null,
    extConfig: null, // 第三方平台配置
  },
});
