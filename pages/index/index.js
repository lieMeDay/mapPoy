// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let socketOpen = false
    // const socketMsgQueue = []
    wx.connectSocket({
      url: 'ws://192.168.1.24:8899/websocket/ss',
    })
    wx.onSocketOpen(function (res) {
      console.log(res)
      console.log('已连接')
    })
    // wx.onSocketError(function (res) {
    //   console.log('WebSocket 连接打开失败，请检查！')
    // })

    wx.onSocketMessage(function (res) {
      console.log("收到服务器内容：" + res.data)
      wx.closeSocket()
    })
    wx.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！')
    })
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})