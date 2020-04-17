// pages/history.js
let {
  tool
} = getApp()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: []
  },
  // 补0
  formatBit(val) {
    val = +val
    return val > 9 ? val : '0' + val
  },
  // 秒转时分秒
  formatSeconds(time) {
    let min = Math.floor(time % 3600)
    let val = this.formatBit(Math.floor(time / 3600)) + ':' + this.formatBit(Math.floor(min / 60)) + ':' + this.formatBit(time % 60)
    return val
  },
  getList(openId) {
    let that = this
    tool({
      url: "/run/getPerson",
      data: openId,
    }).then(suc => {
      let aa = []
        suc.data.data.forEach(v => {
          tool({
            url: "/run/getPersonDataByKey",
            data: {
              openKey: v
            },
          }).then(res => {
            // console.log(res)
            let lastd = res.data.data[res.data.data.length - 1]
            let emp = {
              openKey:v,
              time: v.split('%@%')[1],
              dis: lastd ? lastd.distance : '0',
              useTime: lastd ? that.formatSeconds(parseInt((lastd.useTime) / 1000)) : '00:00:00'
            }
            aa.push(emp)
            // console.log(aa)
            that.setData({
              dataList:aa
            })
          })
        })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList(options)
    // if (app.globalData.openId != '') {
    //   this.getList(app.globalData.openId)
    // } else {
    //   this.getOpenid()
    // }
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