// commponents/logon.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    getUserInfo: function (e) {
      app.globalData.userInfo = e.detail.userInfo
      console.log(e.detail.userInfo)
      this.triggerEvent("ForUserMsg", e.detail.userInfo);
    },
  }
})