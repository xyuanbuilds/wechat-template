// utils/request.js
const {
  getExtConfig,
  showToast,
  showLoading,
  hideLoading,
} = require("./util.js");

// 默认配置
const defaultConfig = {
  baseUrl: "https://api.example.com",
  timeout: 10000,
  header: {
    "Content-Type": "application/json",
  },
};

// 请求拦截器
const requestInterceptor = (config) => {
  // 获取第三方平台配置
  const extConfig = getExtConfig();

  // 合并配置
  const finalConfig = {
    ...defaultConfig,
    ...config,
  };

  // 如果有第三方平台配置，使用第三方配置的API地址
  if (extConfig && extConfig.config && extConfig.config.api) {
    finalConfig.baseUrl = extConfig.config.api.baseUrl || finalConfig.baseUrl;
    finalConfig.timeout = extConfig.config.api.timeout || finalConfig.timeout;
  }

  // 添加token
  const token = wx.getStorageSync("token");
  if (token) {
    finalConfig.header.Authorization = `Bearer ${token}`;
  }

  // 添加用户信息
  const userInfo = wx.getStorageSync("userInfo");
  if (userInfo) {
    finalConfig.header["X-User-ID"] = userInfo.id;
  }

  return finalConfig;
};

// 响应拦截器
const responseInterceptor = (response, url, method) => {
  const { statusCode, data } = response;

  // HTTP状态码处理
  if (statusCode === 200) {
    // 业务状态码处理
    if (data.code === 0 || data.code === 200) {
      return data;
    } else {
      // 业务错误处理
      const errorMsg = data.message || data.msg || "请求失败";
      showToast(errorMsg, "none");
      return Promise.reject(new Error(errorMsg));
    }
  } else if (statusCode === 401) {
    // 未授权，清除token并跳转到登录页
    wx.removeStorageSync("token");
    wx.removeStorageSync("userInfo");
    showToast("登录已过期，请重新登录", "none");
    // 跳转到登录页
    wx.reLaunch({
      url: "/pages/login/login",
    });
    return Promise.reject(new Error("登录已过期"));
  } else if (statusCode === 403) {
    showToast("权限不足", "none");
    return Promise.reject(new Error("权限不足"));
  } else if (statusCode === 404) {
    showToast("请求的资源不存在", "none");
    return Promise.reject(new Error("请求的资源不存在"));
  } else if (statusCode === 500) {
    showToast("服务器内部错误", "none");
    return Promise.reject(new Error("服务器内部错误"));
  } else {
    const errorMsg = `请求失败 (${statusCode})`;
    showToast(errorMsg, "none");
    return Promise.reject(new Error(errorMsg));
  }
};

// 基础请求函数
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 请求配置
    const config = requestInterceptor(options);
    const url = config.baseUrl + options.url;

    // 显示加载提示
    if (options.showLoading !== false) {
      showLoading(options.loadingText || "加载中...");
    }

    // 发起请求
    wx.request({
      url,
      method: options.method || "GET",
      data: options.data || {},
      header: config.header,
      timeout: config.timeout,
      success: (res) => {
        try {
          const result = responseInterceptor(res, url, options.method || "GET");
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        console.error("请求失败:", error);

        // 网络错误处理
        if (error.errMsg.includes("timeout")) {
          showToast("请求超时，请稍后重试", "none");
          reject(new Error("请求超时"));
        } else if (error.errMsg.includes("fail")) {
          showToast("网络连接失败，请检查网络", "none");
          reject(new Error("网络连接失败"));
        } else {
          showToast("请求失败，请稍后重试", "none");
          reject(error);
        }
      },
      complete: () => {
        // 隐藏加载提示
        if (options.showLoading !== false) {
          hideLoading();
        }
      },
    });
  });
};

// GET请求
const get = (url, data = {}, options = {}) => {
  return request({
    url,
    method: "GET",
    data,
    ...options,
  });
};

// POST请求
const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: "POST",
    data,
    ...options,
  });
};

// PUT请求
const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: "PUT",
    data,
    ...options,
  });
};

// DELETE请求
const del = (url, data = {}, options = {}) => {
  return request({
    url,
    method: "DELETE",
    data,
    ...options,
  });
};

// 文件上传
const upload = (url, filePath, name = "file", formData = {}, options = {}) => {
  return new Promise((resolve, reject) => {
    const config = requestInterceptor(options);
    const uploadUrl = config.baseUrl + url;

    // 显示加载提示
    if (options.showLoading !== false) {
      showLoading(options.loadingText || "上传中...");
    }

    wx.uploadFile({
      url: uploadUrl,
      filePath,
      name,
      formData,
      header: config.header,
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          const result = responseInterceptor(
            { statusCode: res.statusCode, data },
            uploadUrl,
            "POST"
          );
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        console.error("上传失败:", error);
        showToast("上传失败，请稍后重试", "none");
        reject(error);
      },
      complete: () => {
        if (options.showLoading !== false) {
          hideLoading();
        }
      },
    });
  });
};

// 文件下载
const download = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const config = requestInterceptor(options);
    const downloadUrl = config.baseUrl + url;

    // 显示加载提示
    if (options.showLoading !== false) {
      showLoading(options.loadingText || "下载中...");
    }

    wx.downloadFile({
      url: downloadUrl,
      header: config.header,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath);
        } else {
          reject(new Error(`下载失败 (${res.statusCode})`));
        }
      },
      fail: (error) => {
        console.error("下载失败:", error);
        showToast("下载失败，请稍后重试", "none");
        reject(error);
      },
      complete: () => {
        if (options.showLoading !== false) {
          hideLoading();
        }
      },
    });
  });
};

// 并发请求
const all = (requests) => {
  return Promise.all(requests);
};

// 请求重试
const retry = (requestFn, times = 3, delay = 1000) => {
  return new Promise((resolve, reject) => {
    const attempt = (remainingTimes) => {
      requestFn()
        .then(resolve)
        .catch((error) => {
          if (remainingTimes > 0) {
            setTimeout(() => {
              attempt(remainingTimes - 1);
            }, delay);
          } else {
            reject(error);
          }
        });
    };

    attempt(times);
  });
};

module.exports = {
  request,
  get,
  post,
  put,
  del,
  upload,
  download,
  all,
  retry,
};
