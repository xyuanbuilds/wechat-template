// components/loading/loading.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示加载
    show: {
      type: Boolean,
      value: false,
    },
    // 加载文本
    text: {
      type: String,
      value: "加载中...",
    },
    // 加载类型: spinner, dots, pulse
    type: {
      type: String,
      value: "spinner",
    },
    // 遮罩层
    mask: {
      type: Boolean,
      value: true,
    },
    // 大小: small, medium, large
    size: {
      type: String,
      value: "medium",
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 内部状态
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击遮罩层事件
    onMaskTap: function () {
      // 可以在这里添加点击遮罩层的逻辑
      this.triggerEvent("masktap");
    },
  },
});
