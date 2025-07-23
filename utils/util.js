// utils/util.js
/**
 * 格式化时间
 * @param {Date} date 日期对象
 * @param {string} format 格式化字符串
 * @returns {string} 格式化后的时间字符串
 */
const formatTime = (date, format = "YYYY-MM-DD HH:mm:ss") => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const formatNumber = (n) => {
    return n.toString().padStart(2, "0");
  };

  return format
    .replace("YYYY", year)
    .replace("MM", formatNumber(month))
    .replace("DD", formatNumber(day))
    .replace("HH", formatNumber(hour))
    .replace("mm", formatNumber(minute))
    .replace("ss", formatNumber(second));
};

/**
 * 获取当前时间戳
 * @returns {number} 时间戳
 */
const getCurrentTimestamp = () => {
  return Date.now();
};

/**
 * 防抖函数
 * @param {Function} fn 要防抖的函数
 * @param {number} delay 延迟时间
 * @returns {Function} 防抖后的函数
 */
const debounce = (fn, delay = 300) => {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

/**
 * 节流函数
 * @param {Function} fn 要节流的函数
 * @param {number} delay 延迟时间
 * @returns {Function} 节流后的函数
 */
const throttle = (fn, delay = 300) => {
  let lastTime = 0;
  return function (...args) {
    const currentTime = Date.now();
    if (currentTime - lastTime > delay) {
      fn.apply(this, args);
      lastTime = currentTime;
    }
  };
};

/**
 * 深拷贝对象
 * @param {any} obj 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj);
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item));
  }

  if (typeof obj === "object") {
    const clonedObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * 获取URL参数
 * @param {string} name 参数名
 * @param {string} url URL字符串
 * @returns {string|null} 参数值
 */
const getUrlParam = (name, url = window.location.href) => {
  const regex = new RegExp(`[?&]${name}=([^&#]*)`);
  const results = regex.exec(url);
  return results === null ? null : decodeURIComponent(results[1]);
};

/**
 * 手机号验证
 * @param {string} phone 手机号
 * @returns {boolean} 是否有效
 */
const isValidPhone = (phone) => {
  const regex = /^1[3-9]\d{9}$/;
  return regex.test(phone);
};

/**
 * 邮箱验证
 * @param {string} email 邮箱
 * @returns {boolean} 是否有效
 */
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * 身份证验证
 * @param {string} idCard 身份证号
 * @returns {boolean} 是否有效
 */
const isValidIdCard = (idCard) => {
  const regex =
    /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  return regex.test(idCard);
};

/**
 * 数字格式化（千分位）
 * @param {number} num 数字
 * @returns {string} 格式化后的数字字符串
 */
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * 字节转换
 * @param {number} bytes 字节数
 * @returns {string} 转换后的字符串
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * 生成随机字符串
 * @param {number} length 长度
 * @returns {string} 随机字符串
 */
const generateRandomString = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 获取文件扩展名
 * @param {string} filename 文件名
 * @returns {string} 扩展名
 */
const getFileExtension = (filename) => {
  return filename.split(".").pop().toLowerCase();
};

/**
 * 判断是否为微信环境
 * @returns {boolean} 是否为微信环境
 */
const isWechat = () => {
  return /MicroMessenger/i.test(navigator.userAgent);
};

/**
 * 获取设备信息
 * @returns {Promise} 设备信息
 */
const getDeviceInfo = () => {
  return new Promise((resolve) => {
    wx.getSystemInfo({
      success: resolve,
      fail: () => resolve({}),
    });
  });
};

/**
 * 获取网络状态
 * @returns {Promise} 网络状态
 */
const getNetworkType = () => {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: resolve,
      fail: () => resolve({}),
    });
  });
};

/**
 * 显示提示消息
 * @param {string} title 提示内容
 * @param {string} icon 图标类型
 * @param {number} duration 持续时间
 */
const showToast = (title, icon = "none", duration = 2000) => {
  wx.showToast({
    title,
    icon,
    duration,
  });
};

/**
 * 显示加载提示
 * @param {string} title 提示内容
 */
const showLoading = (title = "加载中...") => {
  wx.showLoading({
    title,
    mask: true,
  });
};

/**
 * 隐藏加载提示
 */
const hideLoading = () => {
  wx.hideLoading();
};

/**
 * 显示确认对话框
 * @param {string} content 内容
 * @param {string} title 标题
 * @returns {Promise} 用户选择结果
 */
const showModal = (content, title = "提示") => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => resolve(false),
    });
  });
};

/**
 * 页面跳转
 * @param {string} url 跳转地址
 * @param {string} type 跳转类型
 */
const navigateTo = (url, type = "navigateTo") => {
  const methods = {
    navigateTo: wx.navigateTo,
    redirectTo: wx.redirectTo,
    switchTab: wx.switchTab,
    reLaunch: wx.reLaunch,
    navigateBack: wx.navigateBack,
  };

  if (methods[type]) {
    methods[type]({ url });
  }
};

/**
 * 设置页面标题
 * @param {string} title 标题
 */
const setNavigationBarTitle = (title) => {
  wx.setNavigationBarTitle({ title });
};

/**
 * 获取第三方平台配置
 * @returns {object} 配置对象
 */
const getExtConfig = () => {
  return wx.getExtConfigSync ? wx.getExtConfigSync() : {};
};

module.exports = {
  formatTime,
  getCurrentTimestamp,
  debounce,
  throttle,
  deepClone,
  getUrlParam,
  isValidPhone,
  isValidEmail,
  isValidIdCard,
  formatNumber,
  formatBytes,
  generateRandomString,
  getFileExtension,
  isWechat,
  getDeviceInfo,
  getNetworkType,
  showToast,
  showLoading,
  hideLoading,
  showModal,
  navigateTo,
  setNavigationBarTitle,
  getExtConfig,
};
