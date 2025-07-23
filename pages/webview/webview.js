Page({
  data: {
    // 测试用的网页链接列表
    webUrls: [
      "https://developers.weixin.qq.com/miniprogram/dev/",
      "https://www.baidu.com/",
    ],
    currentUrl: "", // 当前加载的网页链接
    selectedIndex: 0, // 当前选中的链接索引
  },

  onLoad: function (options) {
    console.log("WebView 页面加载", options);

    // 从页面参数获取要加载的网址
    if (options.url) {
      this.setData({
        currentUrl: decodeURIComponent(options.url),
      });
    } else {
      // 默认加载第一个链接
      // this.setData({
      //   currentUrl: this.data.webUrls[0],
      // });
    }
  },

  onShow: function () {
    console.log("WebView 页面显示");
  },

  onHide: function () {
    console.log("WebView 页面隐藏");
  },

  onUnload: function () {
    console.log("WebView 页面卸载");
  },

  // 选择网址
  selectUrl: function (e) {
    const index = e.currentTarget.dataset.index;
    const url = this.data.webUrls[index];

    this.setData({
      currentUrl: url,
      selectedIndex: index,
    });

    console.log("切换网址:", url);
  },

  // 自定义输入网址
  showInputDialog: function () {
    wx.showModal({
      title: "输入网址",
      placeholderText: "请输入要测试的网址",
      editable: true,
      success: (res) => {
        if (res.confirm && res.content) {
          let url = res.content.trim();

          // 简单的 URL 验证和补全
          if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
          }

          this.setData({
            currentUrl: url,
            selectedIndex: -1, // 自定义链接
          });

          console.log("自定义网址:", url);
        }
      },
    });
  },

  // web-view 网页加载完成
  onWebViewLoad: function (e) {
    console.log("网页加载完成:", e.detail);

    wx.showToast({
      title: "网页加载完成",
      icon: "success",
      duration: 2000,
    });
  },

  // web-view 网页加载出错
  onWebViewError: function (e) {
    console.error("网页加载失败:", e.detail);

    wx.showModal({
      title: "加载失败",
      content: "网页加载失败，请检查网址是否正确或网络连接是否正常",
      showCancel: false,
    });
  },

  // web-view 接收到网页消息
  onWebViewMessage: function (e) {
    console.log("收到网页消息:", e.detail);
  },

  // 刷新网页
  refreshWebView: function () {
    const currentUrl = this.data.currentUrl;

    // 通过重新设置 URL 来刷新页面
    this.setData({
      currentUrl: "",
    });

    setTimeout(() => {
      this.setData({
        currentUrl: currentUrl,
      });
    }, 100);

    wx.showToast({
      title: "正在刷新...",
      icon: "loading",
      duration: 1500,
    });
  },

  // 复制当前网址
  copyUrl: function () {
    if (this.data.currentUrl) {
      wx.setClipboardData({
        data: this.data.currentUrl,
        success: () => {
          wx.showToast({
            title: "网址已复制",
            icon: "success",
          });
        },
      });
    }
  },

  // 分享页面
  onShareAppMessage: function () {
    return {
      title: "WebView 测试页面",
      path: `/pages/webview/webview?url=${encodeURIComponent(
        this.data.currentUrl
      )}`,
    };
  },
});
