# 微信小程序模板

这是一个专为第三方服务商设计的微信小程序模板，支持多商家使用同一个模板，并可进行个性化配置。

## 📋 目录

- [功能特性](#功能特性)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [第三方平台配置](#第三方平台配置)
- [自定义主题](#自定义主题)
- [API 接口](#api接口)
- [分包配置](#分包配置)
- [部署说明](#部署说明)
- [常见问题](#常见问题)

## 🚀 功能特性

- ✅ **第三方平台支持** - 完整的第三方服务商代开发支持
- ✅ **多商家配置** - 支持多个商家使用同一个模板
- ✅ **个性化主题** - 支持自定义主题颜色、商家信息等
- ✅ **分包架构** - 合理的分包设计，提升加载速度
- ✅ **通用组件** - 丰富的通用组件库
- ✅ **网络请求** - 统一的网络请求处理和错误处理
- ✅ **工具函数** - 完善的工具函数库
- ✅ **响应式设计** - 适配不同屏幕尺寸
- ✅ **暗黑模式** - 支持暗黑模式适配

## 📁 项目结构

```
template-mini/
├── app.js                 # 小程序入口文件
├── app.json               # 小程序全局配置
├── app.wxss               # 小程序全局样式
├── ext.json               # 第三方平台配置文件
├── project.config.json    # 开发者工具配置
├── sitemap.json           # 站点地图配置
├── pages/                 # 页面文件
│   ├── index/            # 首页
│   ├── user/             # 用户中心
│   ├── products/         # 产品页面
│   ├── about/            # 关于页面
│   ├── shop/             # 商店分包
│   └── profile/          # 个人资料分包
├── utils/                # 工具函数
│   ├── util.js           # 通用工具函数
│   └── request.js        # 网络请求工具
├── components/           # 组件文件
└── images/              # 图片资源
```

## 🎯 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-repo/template-mini.git
cd template-mini
```

### 2. 配置项目

1. 在微信开发者工具中打开项目
2. 修改 `project.config.json` 中的 `appid` 为你的小程序 AppID
3. 配置 `ext.json` 文件中的第三方平台信息

### 3. 启动开发

在微信开发者工具中编译和预览小程序

## ⚙️ 第三方平台配置

### ext.json 配置说明

```json
{
  "extEnable": true,
  "extAppid": "授权小程序的AppID",
  "directCommit": false,
  "ext": {
    "name": "小程序模板",
    "version": "1.0.0",
    "config": {
      "theme": {
        "primaryColor": "#3cc51f",
        "backgroundColor": "#ffffff",
        "textColor": "#333333"
      },
      "business": {
        "name": "商家名称",
        "logo": "商家logo链接",
        "description": "商家描述",
        "contact": {
          "phone": "400-000-0000",
          "address": "商家地址",
          "email": "contact@example.com"
        }
      },
      "features": {
        "enableLocation": true,
        "enablePayment": true,
        "enableShare": true,
        "enableFeedback": true
      },
      "api": {
        "baseUrl": "https://api.example.com",
        "timeout": 10000
      }
    }
  }
}
```

### 配置项说明

- **extEnable**: 是否启用第三方平台配置
- **extAppid**: 授权小程序的 AppID
- **directCommit**: 是否直接提交到审核队列
- **ext.config**: 第三方平台自定义配置
  - **theme**: 主题配置
  - **business**: 商家信息配置
  - **features**: 功能开关配置
  - **api**: API 接口配置

## 🎨 自定义主题

### 1. 修改主题颜色

在 `ext.json` 中配置主题颜色：

```json
{
  "ext": {
    "config": {
      "theme": {
        "primaryColor": "#3cc51f",
        "backgroundColor": "#ffffff",
        "textColor": "#333333"
      }
    }
  }
}
```

### 2. 自定义商家信息

```json
{
  "ext": {
    "config": {
      "business": {
        "name": "你的商家名称",
        "logo": "https://example.com/logo.png",
        "description": "商家简介",
        "contact": {
          "phone": "400-000-0000",
          "address": "商家地址",
          "email": "contact@example.com"
        }
      }
    }
  }
}
```

## 🌐 API 接口

### 网络请求配置

```javascript
// utils/request.js
const { get, post, put, del } = require("../../utils/request.js");

// GET请求
get("/api/products", { page: 1, limit: 10 })
  .then((res) => {
    console.log("获取产品列表成功:", res);
  })
  .catch((error) => {
    console.error("获取产品列表失败:", error);
  });

// POST请求
post("/api/orders", { productId: 1, quantity: 2 })
  .then((res) => {
    console.log("创建订单成功:", res);
  })
  .catch((error) => {
    console.error("创建订单失败:", error);
  });
```

### 接口说明

- **基础 URL**: 从 `ext.json` 中的 `config.api.baseUrl` 获取
- **超时时间**: 从 `ext.json` 中的 `config.api.timeout` 获取
- **请求拦截**: 自动添加 token 和用户信息
- **响应拦截**: 统一处理错误和状态码

## 📦 分包配置

### 主包页面

- `pages/index/index` - 首页
- `pages/user/user` - 用户中心
- `pages/products/products` - 产品页面
- `pages/about/about` - 关于页面

### 分包页面

**商店分包 (pages/shop/)**

- `detail/detail` - 产品详情
- `category/category` - 产品分类
- `cart/cart` - 购物车
- `order/order` - 订单页面

**个人资料分包 (pages/profile/)**

- `settings/settings` - 设置页面
- `address/address` - 收货地址
- `feedback/feedback` - 意见反馈

## 🚀 部署说明

### 1. 开发环境部署

1. 配置 `ext.json` 文件
2. 在微信开发者工具中预览和调试
3. 提交代码到第三方平台

### 2. 生产环境部署

1. 确保所有配置正确
2. 测试所有功能
3. 提交审核
4. 发布上线

### 3. 第三方平台部署

1. 将代码上传到第三方平台
2. 配置模板信息
3. 商家授权使用
4. 个性化配置

## 📱 页面预览

### 首页

- 轮播图展示
- 快捷菜单
- 推荐产品
- 商家信息

### 用户中心

- 用户信息展示
- 功能菜单
- 设置选项

### 产品页面

- 产品列表
- 搜索功能
- 分类筛选

## 🔧 自定义开发

### 添加新页面

1. 在 `pages/` 目录下创建新页面
2. 在 `app.json` 中添加页面路径
3. 根据需要添加到相应的分包

### 创建自定义组件

1. 在 `components/` 目录下创建组件
2. 编写组件代码
3. 在页面中引用组件

### 添加工具函数

1. 在 `utils/` 目录下添加工具函数
2. 导出函数供页面使用
3. 完善函数注释

## ❓ 常见问题

### Q: 如何配置第三方平台？

A: 修改 `ext.json` 文件，设置 `extEnable` 为 `true`，并配置相应的参数。

### Q: 如何自定义主题颜色？

A: 在 `ext.json` 的 `ext.config.theme` 中配置主题颜色。

### Q: 如何添加新的 API 接口？

A: 使用 `utils/request.js` 中的请求方法，自动处理第三方平台配置。

### Q: 分包如何配置？

A: 在 `app.json` 的 `subPackages` 中配置分包信息。

### Q: 如何处理不同商家的个性化需求？

A: 通过 `ext.json` 中的配置项和 `wx.getExtConfigSync()` 获取配置信息。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests 来完善这个模板。

## 📞 联系我们

如有问题或建议，请联系：

- 邮箱：developer@example.com
- 微信：your-wechat-id
