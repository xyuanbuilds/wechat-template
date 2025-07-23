// pages/user/user.js
const { getExtConfig, showToast } = require("../../utils/util.js");

Page({
  data: {
    userInfo: null,
    extConfig: null,
    loading: false,
    userStats: {
      orders: 0,
      favorites: 0,
      points: 0,
      coupons: 0,
    },
    menuList: [
      {
        id: 1,
        icon: "⚙️",
        title: "设置",
        url: "/pages/profile/settings/settings",
        arrow: true,
      },
      {
        id: 2,
        icon: "📍",
        title: "收货地址",
        url: "/pages/profile/address/address",
        arrow: true,
      },
      {
        id: 3,
        icon: "💬",
        title: "意见反馈",
        url: "/pages/profile/feedback/feedback",
        arrow: true,
      },
      {
        id: 4,
        icon: "📞",
        title: "联系客服",
        url: "",
        arrow: true,
      },
      {
        id: 5,
        icon: "ℹ️",
        title: "关于我们",
        url: "/pages/about/about",
        arrow: true,
      },
    ],
  },

  onLoad: function (options) {
    this.getExtConfigInfo();
    this.checkLoginStatus();
    this.loadUserStats();
  },

  onShow: function () {
    this.checkLoginStatus();
    this.loadUserStats();
  },

  onPullDownRefresh: function () {
    this.refreshData();
  },

  // 获取第三方平台配置信息
  getExtConfigInfo: function () {
    const extConfig = getExtConfig();
    if (extConfig) {
      this.setData({
        extConfig: extConfig,
      });
    }
  },

  // 检查用户登录状态
  checkLoginStatus: function () {
    const userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
      });
    }
  },

  // 加载用户统计数据
  loadUserStats: function () {
    const userInfo = this.data.userInfo;
    if (!userInfo) return;

    // 这里可以调用API获取真实的用户统计数据
    // 目前使用模拟数据
    const mockStats = {
      orders: Math.floor(Math.random() * 10),
      favorites: Math.floor(Math.random() * 20),
      points: Math.floor(Math.random() * 1000),
      coupons: Math.floor(Math.random() * 5),
    };

    this.setData({
      userStats: mockStats,
    });
  },

  // 刷新数据
  refreshData: function () {
    this.setData({ loading: true });

    Promise.all([this.checkLoginStatus(), this.loadUserStats()]).finally(() => {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    });
  },

  // 菜单点击事件
  onMenuTap: function (e) {
    const { id, url, title } = e.currentTarget.dataset.item;

    if (id === 4) {
      // 联系客服
      this.contactService();
    } else if (url) {
      wx.navigateTo({
        url: url,
      });
    } else {
      showToast(`${title}功能待开发`, "none");
    }
  },

  // 订单状态点击事件
  onOrderStatusTap: function (e) {
    const status = e.currentTarget.dataset.status;
    showToast(`${status}功能待开发`, "none");

    // 这里可以跳转到对应的订单页面
    // wx.navigateTo({
    //   url: `/pages/order/list?status=${status}`
    // });
  },

  // 统计数据点击事件
  onStatsTap: function (e) {
    const type = e.currentTarget.dataset.type;
    showToast(`${type}功能待开发`, "none");

    // 这里可以跳转到对应的详情页面
    // wx.navigateTo({
    //   url: `/pages/stats/${type}`
    // });
  },

  // 联系客服
  contactService: function () {
    const extConfig = this.data.extConfig;
    if (
      extConfig &&
      extConfig.config &&
      extConfig.config.business &&
      extConfig.config.business.contact
    ) {
      const phone = extConfig.config.business.contact.phone;
      if (phone) {
        wx.makePhoneCall({
          phoneNumber: phone,
        });
      } else {
        showToast("暂无客服电话", "none");
      }
    } else {
      showToast("暂无客服信息", "none");
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

        showToast("获取用户信息成功", "success");
      },
      fail: (error) => {
        console.error("获取用户信息失败:", error);
        showToast("获取用户信息失败", "none");
      },
    });
  },

  // 退出登录
  logout: function () {
    wx.showModal({
      title: "提示",
      content: "确定要退出登录吗？",
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          wx.removeStorageSync("token");
          wx.removeStorageSync("userInfo");

          this.setData({
            userInfo: null,
          });

          showToast("已退出登录", "success");
        }
      },
    });
  },

  // 分享功能
  onShareAppMessage: function () {
    const extConfig = this.data.extConfig;
    return {
      title: extConfig?.config?.business?.name || "个人中心",
      path: "/pages/user/user",
      imageUrl: extConfig?.config?.business?.logo || "/images/share.jpg",
    };
  },

  // 分享到朋友圈
  onShareTimeline: function () {
    const extConfig = this.data.extConfig;
    return {
      title: extConfig?.config?.business?.name || "个人中心",
      imageUrl: extConfig?.config?.business?.logo || "/images/share.jpg",
    };
  },
});
