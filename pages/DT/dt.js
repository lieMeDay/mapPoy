// pages/aa/aa.js
const app = getApp()
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    timer: '',
    useTime: 0,
    useTrueTime:'00:00:00',
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfo: '',
    beginEnd: false,
    state: false,
    longitude: '',
    latitude: '',
    markers: '',
    polyline: [{
      points: [],
      color: "#FF0000DD",
      width: 2,
      dottedLine: true
    }],
    distance: 0,
    speed: '00:00'
    // scaletrue:
  },
  // onload 获取授权
  getuser() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      this.getLoc()
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        this.getLoc()
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          this.getLoc()
        }
      })
    }
  },
  // 组件传值
  getUserMsg(e) {
    console.log(e.detail)
    this.setData({
      hasUserInfo: true,
      userInfo: e.detail
    });
    this.getLoc()
  },
  // 定位授权
  getLoc() {
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
    that.startLB()
  },
  start() {
    let that = this
    let arr = []
    let obj = []
    wx.getSetting({
      success(res) {
        console.log(res.authSetting)
        let ULB = res.authSetting
        if (ULB.hasOwnProperty('scope.userLocationBackground')) {
          that.setData({
            beginEnd: true
          })
          that.data.timer = setInterval(
            function () {
              var numVal = that.data.useTime + 1;
              that.setData({
                useTime: numVal,
                useTrueTime:that.formatSeconds(numVal)
              });
            }, 1000);
          if (!that.data.state) {
            that.setData({
              state: true
            })
            wx.onLocationChange(function (res) {
              console.log('location change', res)
              arr.push({
                longitude: res.longitude,
                latitude: res.latitude
              })
              let dis = that.data.distance
              if (arr.length > 1) {
                if (res.speed != 0) {
                  let aa = arr[arr.length - 2]
                  let bb = arr[arr.length - 1]
                  dis += util.getDistance(aa.latitude, aa.longitude, bb.latitude, bb.longitude)
                  dis = dis.toFixed(2)
                }
              }
              that.setData({
                distance: dis,
                speed: that.forPace(res.speed)
              })
              obj.push(new Date().getTime() + '...' + res.speed + '...' + res.longitude + '...' + res.latitude)
              wx.setStorage({
                key: "paobugji",
                data: obj
              })
              // console.log(arr[arr.length - 1])
              that.setData({
                markers: arr[arr.length - 1],
                longitude: arr[arr.length - 1]['longitude'],
                latitude: arr[arr.length - 1]['latitude'],
                'polyline[0].points': arr
              })
            })
          } else {
            that.setData({
              state: false
            })
            that.startLB()
          }
        } else {
          that.setData({
            beginEnd: false
          })
          console.log('授权')
          wx.showModal({
            title: '提示',
            content: '请选择使用时和离开后',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
                that.goSQ()
              }
            }
          })
        }
      }
    })
  },
  end() {
    let dd=this.data.distance
    let tt=this.data.useTime/60
    this.setData({
      state: true,
      beginEnd: false,
      speed: dd/tt
    })
    let that=this
    clearInterval(that.data.timer)
    wx.stopLocationUpdate({
      success(res) {
        console.log('关闭后台定位', res)
      },
      fail(res) {
        console.log('关闭后台定位失败', res)
      }
    })
  },
  startLB() {
    let that = this
    wx.startLocationUpdateBackground({
      success(res) {
        var dateline = new Date()
        dateline = util.formatTime(dateline);
        var msg = dateline + ' 开启持续定位，成功'
      },
      fail(res) {
        console.log('开启后台定位失败', res)
        wx.showModal({
          title: '提示',
          content: '请选择使用时和离开后',
          showCancel: false,
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
              that.goSQ()
            }
          }
        })
      }
    })
  },
  goSQ() {
    let that = this
    wx.openSetting({
      success(res) {
        console.log(res.authSetting)
        let ULB = res.authSetting
        if (!ULB.hasOwnProperty('scope.userLocationBackground')) {
          wx.showModal({
            title: '提示',
            content: '请选择使用时和离开后',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
                that.goSQ()
              }
            }
          })
        }
      },
      fail(err) {
        console.log(err)
      }
    })
  },
  // 转配速
  forPace(sp) {
    if(sp==0){
      return '00:00'
    }else{
      let aa = 60 / ((sp.toFixed(2) * 3.6).toFixed(2))
      let b = parseInt(aa)
      let c = parseInt((aa - parseInt(aa) )* 60)
      console.log(aa,b,c)
      if (b < 10) {
        b = '0' + b;
      }
      if (c < 10) {
        c = '0' + c
      }
      return b + ':' + c
    }
  },
  　// 补0
  formatBit (val) {
    val = +val
    return val > 9 ? val : '0' + val
  },
  // 秒转时分秒
  formatSeconds (time) {
    let min = Math.floor(time % 3600)
    let val = this.formatBit(Math.floor(time / 3600)) + ':' + this.formatBit(Math.floor(min / 60)) + ':' + this.formatBit(time % 60)
    return val
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    // 获取用户信息
    that.getuser()
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