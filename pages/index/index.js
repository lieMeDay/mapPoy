// pages/index/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Historical:[]
  },
  watchBack: function (name){
    console.log(22222);
    console.log('this.name==' + name)
  },
  // 判断登录
  JudgeLogin(){
    let that=this
    app.watch(that.watchBack)
    // if (app.globalData.openId) {
    //   this.setData({
    //     openId: app.globalData.openId,
    //   })
    // } else {
    //   app.CallbackFn = res => {
    //     this.setData({
    //       openId: res.data.data.openid
    //     })
    //   }
    // }
  },
  getMatch(){

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.JudgeLogin()
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