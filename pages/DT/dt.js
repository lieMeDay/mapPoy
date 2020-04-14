// pages/aa/aa.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    longitude: '',
    latitude: '',
    markers: '',
    polyline: []
    // scaletrue:
  },
  start() {
    console.log(111)
    let that = this
    let arr = []
    let obj = []
    wx.onLocationChange(function (res) {
      // console.log('location change', res)
      arr.push({
        longitude: res.longitude,
        latitude: res.latitude
      })
      obj.push(new Date().getTime() + '...' + res.speed + '...' + res.longitude + '...' + res.latitude)
      wx.setStorage({
        key: "paobugji",
        data: obj
      })
      // console.log(arr[arr.length - 1])
      that.setData({
        markers: arr[arr.length - 1],
        // longitude: arr[arr.length - 1][longitude],
        // latitude: arr[arr.length - 1][latitude],
        polyline: [{
          points: arr,
          color: "#FF0000DD",
          width: 2,
          dottedLine: true
        }]
      })
    })
  },
  end() {
    console.log(222)
    wx.stopLocationUpdate({
      success(res) {
        console.log('关闭后台定位', res)
      },
      fail(res) {
        console.log('关闭后台定位失败', res)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.getStorage({
    //   key: 'paobugji',
    //   success (res) {
    //     console.log(res.data)
    //   }
    // })
    let that = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        console.log(res)
        const latitude = res.latitude
        const longitude = res.longitude
        const speed = res.speed
        const accuracy = res.accuracy
        that.setData({
          longitude: longitude,
          latitude: latitude,
          markers: [longitude, latitude]
        })
      }
    })
    wx.startLocationUpdate({
      success(res) {
        console.log('开启后台定位', res)
      },
      fail(res) {
        console.log('开启后台定位失败', res)
      }
    })
    wx.startLocationUpdateBackground({
      success(res) {
        console.log('开启后台定位', res)
      },
      fail(res) {
        console.log('开启后台定位失败', res)
      }
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