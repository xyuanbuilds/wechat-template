// pages/index/index.js
const { formatTime, getExtConfig, showToast } = require("../../utils/util.js");
const { get } = require("../../utils/request.js");

Page({
  data: {
    userInfo: null,
    extConfig: null,
    bannerList: [],
    productList: [],
    loading: false,
    theme: {
      primaryColor: "#3cc51f",
      backgroundColor: "#ffffff",
      textColor: "#333333",
    },
  },

  onLoad: function (options) {
    // 获取第三方平台配置
    this.getExtConfigInfo();

    // 初始化页面数据
    this.initPageData();

    // 检查用户登录状态
    this.checkLoginStatus();
  },

  onShow: function () {},

  onPullDownRefresh: function () {
    // 下拉刷新
  },

  onReachBottom: function () {
    // 上拉加载更多
  },

  // 获取第三方平台配置信息
  getExtConfigInfo: function () {
    const extConfig = getExtConfig();
    console.log("第三方平台配置:", extConfig);

    if (extConfig && extConfig.config) {
      this.setData({
        extConfig: extConfig,
        theme: {
          primaryColor: extConfig.config.theme?.primaryColor || "#3cc51f",
          backgroundColor: extConfig.config.theme?.backgroundColor || "#ffffff",
          textColor: extConfig.config.theme?.textColor || "#333333",
        },
      });

      // 更新页面标题
      if (extConfig.config.business?.name) {
        wx.setNavigationBarTitle({
          title: extConfig.config.business.name,
        });
      }
    }
  },

  // 初始化页面数据
  initPageData: function () {
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
      });
    }
  },

  // 检查用户登录状态
  checkLoginStatus: function () {
    const token = wx.getStorageSync("token");
    const userInfo = wx.getStorageSync("userInfo");

    if (token && userInfo) {
      this.setData({
        userInfo: userInfo,
      });
    }
  },

  // 获取用户信息
  getUserProfile: function () {
    const that = this;
    wx.getUserProfile({
      desc: "用于完善用户资料",
      success: (res) => {
        console.log("获取用户信息成功:", res);
        that.setData({
          userInfo: res.userInfo,
        });

        // 保存用户信息
        wx.setStorageSync("userInfo", res.userInfo);

        // 可以在这里调用登录接口
        that.login(res.userInfo);
      },
      fail: (error) => {
        console.error("获取用户信息失败:", error);
        showToast("获取用户信息失败", "none");
      },
    });
  },

  // 登录
  login: function (userInfo) {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 发送登录请求
          this.sendLoginRequest(res.code, userInfo);
        } else {
          showToast("登录失败", "none");
        }
      },
    });
  },

  // 发送登录请求
  sendLoginRequest: function (code, userInfo) {
    const that = this;
    get("/api/user/login", {
      code: code,
      userInfo: userInfo,
    })
      .then((res) => {
        console.log("登录成功:", res);
        // 保存token
        wx.setStorageSync("token", res.data.token);
        wx.setStorageSync("userInfo", res.data.userInfo);

        that.setData({
          userInfo: res.data.userInfo,
        });

        showToast("登录成功", "success");
      })
      .catch((error) => {
        console.error("登录失败:", error);
        showToast("登录失败", "none");
      });
  },

  // 跳转到产品页面
  goToProducts: function () {
    wx.switchTab({
      url: "/pages/products/products",
    });
  },

  // 跳转到用户中心
  goToUser: function () {
    wx.switchTab({
      url: "/pages/user/user",
    });
  },

  // 跳转到关于页面
  goToAbout: function () {
    wx.switchTab({
      url: "/pages/about/about",
    });
  },

  // 跳转到 WebView 测试页面
  goToWebView: function () {
    wx.navigateTo({
      url: "/pages/webview/webview",
    });
  },

  // 分享功能
  onShareAppMessage: function () {
    const extConfig = this.data.extConfig;
    return {
      title: extConfig?.config?.business?.name || "小程序模板",
      path: "/pages/index/index",
      imageUrl: extConfig?.config?.business?.logo || "/images/share.jpg",
    };
  },

  // 分享到朋友圈
  onShareTimeline: function () {
    const extConfig = this.data.extConfig;
    return {
      title: extConfig?.config?.business?.name || "小程序模板",
      imageUrl: extConfig?.config?.business?.logo || "/images/share.jpg",
    };
  },
});
