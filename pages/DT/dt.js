// pages/aa/aa.js
const app = getApp()
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowDate: '', //当前时间
    timer: '', //计时器 计时时间
    useTime: 0, //使用时间 秒数
    useTrueTime: '00:00:00', // 将useTime转为时分秒
    hasUserInfo: false, // 是否有用户信息
    canIUse: wx.canIUse('button.open-type.getUserInfo'), //为了获取用户信息
    userInfo: '', //用户信息
    beginEnd: false, // 开始/暂停
    state: false, // 第一次开始/暂停后开始
    longitude: '', //中心经度
    latitude: '', //中心纬度
    markers: '', // 个人点
    polyline: [{
      points: [],
      color: "#FF0000DD",
      width: 2,
      // dottedLine: false
    }], //线
    distance: '0.00', //距离
    speed: "--'--\"", //配速
    showAlert: false, //是否显示分段
    partArr: [] //分段数据
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
          if (that.data.timer == '') {
            that.data.timer = setInterval(
              function () {
                var numVal = that.data.useTime + 1;
                that.setData({
                  useTime: numVal,
                  useTrueTime: that.formatSeconds(numVal)
                });
              }, 1000);
          }
          if (!that.data.state) {
            that.setData({
              state: true
            })
            let trueDis = 0
            wx.onLocationChange(function (res) {
              // console.log('location change', res)
              arr.push({
                longitude: res.longitude,
                latitude: res.latitude
              })
              let dis = Number(that.data.distance)
              if (arr.length > 1) {
                if (res.speed != 0) {
                  let aa = arr[arr.length - 2]
                  let bb = arr[arr.length - 1]
                  // console.log('trueDis='+trueDis,'dis='+dis,'aa='+Number(util.getDistance(aa.latitude, aa.longitude, bb.latitude, bb.longitude)))
                  trueDis += Number(util.getDistance(aa.latitude, aa.longitude, bb.latitude, bb.longitude))
                  // console.log(trueDis,'-------',dis)
                  dis = Number(trueDis).toFixed(2)
                }
              }
              let tt = (that.data.useTime / 60).toFixed(2)
              that.setData({
                distance: dis,
                speed: tt > 0 && dis > 0 ? that.forPace(tt / dis) : "--'--\""
              })
              obj.push(new Date().getTime() + '...' + res.speed + '...' + res.longitude + '...' + res.latitude + '...' + dis)
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
            // that.setData({state: false })
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
    let that = this
    clearInterval(that.data.timer)
    let dd = that.data.distance
    let tt = that.data.useTime / 60
    that.setData({
      timer: '',
      state: true,
      beginEnd: false,
      speed: tt > 0 && dd > 0 ? that.forPace(tt / dd) : "--'--\""
    })
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
        // wx.showModal({
        //   title: '提示',
        //   content: '请选择使用时和离开后',
        //   showCancel: false,
        //   success(res) {
        //     if (res.confirm) {
        //       console.log('用户点击确定')
        //       that.goSQ()
        //     }
        //   }
        // })
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
    // console.log(sp)
    if (sp == 0) {
      return "--'--\""
    } else {
      // let aa = 60 / ((sp.toFixed(2) * 3.6).toFixed(2))
      let aa = sp.toFixed(2)
      let b = parseInt(aa)
      let c = parseInt((aa - parseInt(aa)) * 60)
      // console.log(aa,b,c)
      if (b < 10) {
        b = '0' + b;
      }
      if (c < 10) {
        c = '0' + c
      }
      return b + "'" + c + "\""
    }
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
  // 是否显示分段
  taggleAlert() {
    if(!this.data.showAlert){
      this.getpoint()
    }
    this.setData({
      showAlert: !this.data.showAlert
    })
  },
  // 获取分段
  getpoint() {
    let that = this
    wx.getStorage({
      key: 'paobugji',
      success(res) {
        // console.log(res.data)
        let smArr = []
        let disArr = res.data.map(x => x.split('...')[x.split('...').length - 1])
        // console.log('disArr:',disArr)
        let lastData = res.data[res.data.length - 1].split('...')
        let lastDis = lastData[lastData.length - 1]
        // let lastDis=3.2
        console.log('lastDis='+lastDis)
        // 最终距离为0 没有分段
        if (lastDis == 0) {
          that.setData({
            partArr: []
          })
        } else {
          let lB = Math.floor(lastDis)
          if (lB != 0) {
            let n = 0
            while (n < lB) {
              n++
              // i 最接近该距离的下标
              let i = util.lookupNear(disArr, n)
              let hm=0
              // 所用时间秒
              if (n == 1) {
                hm = parseInt(Number(res.data[i].split('...')[0] - res.data[0].split('...')[0]) / 1000)
              } else {
                hm = parseInt(Number(res.data[i].split('...')[0] - res.data[util.lookupNear(disArr, n - 1)].split('...')[0]) / 1000)
              }
              // console.log(hm)
              smArr.push({
                Num: n,
                dd: '1KM',
                useTime: that.formatSeconds(hm),
                meanPace: that.forPace((hm / 60) / 1)
              })
            }
            if (util.floatSub(lastDis,lB) > 0) {
              let hm = parseInt(Number(res.data[res.data.length - 1].split('...')[0] - res.data[util.lookupNear(disArr, n)].split('...')[0]) / 1000)
              smArr.push({
                Num: ++n,
                dd: util.floatSub(lastDis,lB),
                useTime: that.formatSeconds(hm),
                meanPace: that.forPace((hm / 60) / util.floatSub(lastDis,lB))
              })
            }
            smArr.push({
              Num: '总计',
              dd: lastDis,
              useTime: that.data.useTrueTime,
              meanPace: that.forPace((that.data.useTime / 60) / lastDis)
            })
          }else{
            smArr.push({
              Num: 1,
              dd: lastDis,
              useTime: that.data.useTrueTime,
              meanPace: that.forPace((that.data.useTime / 60) / lastDis)
            },{
              Num: '总计',
              dd: lastDis,
              useTime: that.data.useTrueTime,
              meanPace: that.forPace((that.data.useTime / 60) / lastDis)
            })
          }
          that.setData({
            partArr: smArr
          })
        }
      },
      fail(err) {
        that.setData({
          partArr: []
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    // console.log('onload')
    // 获取用户信息
    that.getuser()
    that.setData({
      nowDate: util.getNowDate(new Date())
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