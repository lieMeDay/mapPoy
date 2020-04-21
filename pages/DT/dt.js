// pages/aa/aa.js
const app = getApp()
var util = require('../../utils/util.js')
let {
  tool
} = getApp()
Page({

  /*
   * 页面的初始数据
   */
  data: {
    openId: '',
    openKey: '',
    nowDate: '', //当前时间
    startData: {
      trueDis: 0,
      arr: [],
      objStorage: []
    },
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
    markers: [], // 个人点
    polyline: [{
      points: [],
      color: "#FF0000DD",
      width: 2,
      // dottedLine: false
    }], //线
    putN: 1, //向后台发送数据次数
    distance: '0.00', //距离
    speed: "--'--\"", //配速
    showAlert: false, //是否显示分段
    partArr: [] //分段数据
  },
  // onload 获取授权
  getuser() {
    if (app.globalData.openId) {
      this.setData({
        openId: app.globalData.openId,
      })
    } else {
      app.CallbackFn = res => {
        this.setData({
          openId: res.data.data.openid
        })
      }
    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      this.getLoc(1)
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        this.getLoc(1)
      }
    } else {
      console.log(33)
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          this.getLoc(1)
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
    this.getLoc(1)
  },
  // 定位授权
  getLoc(i) {
    let that = this
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        console.log(res)
        const latitude = res.latitude
        const longitude = res.longitude
        const speed = res.speed
        const accuracy = res.accuracy
        // let markMy = that.data.markers
        // markMy[0] = [longitude, latitude]
        that.setData({
          longitude: longitude,
          latitude: latitude,
          // markers: markMy
        })
      },
      fail(err) {
        console.log(err)
        that.setData({
          longitude: 116.397128,
          latitude: 39.916527,
          // markers: [116.397128, 39.916527]
        })
      }
    })
    /*
    当i==1时为首次进入 获取前后台定位权限
    不为 1 时，只重新定位获取当前位置
     */
    if (i == 1) {
      that.startL()
      that.startLB()
    }
  },
  // 点击开始
  start() {
    let that = this
    // 每次开始都重新定义
    let trueDis = 0
    let arr = []
    let objStorage = []

    // 结束后重新开始 所有都归零
    that.setData({
      useTime: 0, //时间为0
      useTrueTime: '00:00:00', // 将useTime转为时分秒
      'polyline[0].points': [], //线为空
      distance: '0', //距离
      speed: "--'--\"", //配速
      partArr: [] //分段数据
    })
    // 清除上一次的storage
    wx.removeStorage({
      key: 'paobugji',
      success(res) {
        console.log(res)
      }
    })
    wx.getSetting({
      success(res) {
        console.log(res.authSetting)
        let ULB = res.authSetting
        if (ULB.hasOwnProperty('scope.userLocationBackground')) {
          that.setData({
            openKey: util.getNowDate(new Date())
          })
          // `/run/addPerson?openId=${that.data.openId}&openKey=${that.data.openKey}`,
          let jsonData = {
            openId: that.data.openId,
            openKey: that.data.openKey
          }
          tool({
            url: '/run/addPerson',
            data: JSON.stringify(jsonData),
            method: "POST"
          }).then(resolve => {
            // console.log(resolve.data)
            that.startBind()
          })
        } else {
          wx.authorize({
            scope: 'scope.userLocationBackground'
          })
          that.setData({
            beginEnd: false
          })
          console.log('授权')
          wx.showModal({
            title: '提示',
            content: '请在位置设置中选择使用小程序期间和离开小程序后',
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
  // 点击结束
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
    wx.getStorage({
      key: 'paobugji',
      success(res) {
        let startTime = Number(res.data[0].split('...')[0])
        let nn = that.data.putN
        let newList = res.data.slice(100 * (nn - 1), res.data.length)
        if (that.data.distance < 0.5) {
          wx.showToast({
            title: '距离不能小于500米',
            icon:"none",
            duration: 2000
          })
          // console.log(e)
          let obj = {
            openId: that.data.openId,
            openKey: that.data.openId+'%@%'+that.data.openKey
          }
          // console.log(obj)
          tool({
            url: "/run/delPersonOneRaw",
            data: obj,
          }).then(suc => {
            console.log(suc)
          })
        } else {
          that.postPoyMsg(newList, startTime)
        }
      }
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
  // 开始执行
  startBind() {
    let that = this
    let abc = {
      trueDis: 0,
      arr: [],
      objStorage: []
    }
    that.setData({
      startData: abc
    })
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
      wx.onLocationChange(function (res) {
        that.data.startData.arr.push({
          longitude: res.longitude,
          latitude: res.latitude
        })
        let dis = Number(that.data.distance)
        // console.log('dis=' + dis, 'arrr=' + that.data.startData.arr.length)
        // console.log("trueDis=" + that.data.startData.trueDis)
        if (that.data.startData.arr.length > 1) {
          if (res.speed != 0) {
            let aa = that.data.startData.arr[that.data.startData.arr.length - 2]
            let bb = that.data.startData.arr[that.data.startData.arr.length - 1]
            // console.log('trueDis='+trueDis,'dis='+dis,'aa='+Number(util.getDistance(aa.latitude, aa.longitude, bb.latitude, bb.longitude)))
            that.data.startData.trueDis += Number(util.getDistance(aa.latitude, aa.longitude, bb.latitude, bb.longitude))
            // console.log(trueDis,'-------',dis)
            dis = Number(that.data.startData.trueDis).toFixed(2)
          }
        }
        let tt = (that.data.useTime / 60).toFixed(2)
        that.setData({
          distance: dis == 0 ? '0.00' : dis,
          speed: tt > 0 && dis > 0 ? that.forPace(tt / dis) : "--'--\""
        })
        // 毫秒 速度 经度 纬度 距离
        that.data.startData.objStorage.push(new Date().getTime() + '...' + res.speed + '...' + res.longitude + '...' + res.latitude + '...' + dis)
        wx.setStorage({
          key: 'paobugji',
          data: that.data.startData.objStorage
        })
        wx.getStorage({
          key: 'paobugji',
          success(res) {
            let startTime = Number(res.data[0].split('...')[0])
            let nn = that.data.putN
            if (res.data.length >= 100 * nn) {
              let newList = res.data.slice(100 * (nn - 1), 100 * nn)
              that.postPoyMsg(newList, startTime)
            }
          }
        })

        // console.log(arr[arr.length - 1])
        // let markMy = that.data.markers
        // markMy[0] = that.data.startData.arr[that.data.startData.arr.length - 1]
        // markMy[0].iconPath=""
        that.setData({
          // markers: markMy,
          longitude: that.data.startData.arr[that.data.startData.arr.length - 1]['longitude'],
          latitude: that.data.startData.arr[that.data.startData.arr.length - 1]['latitude'],
          'polyline[0].points': that.data.startData.arr
        })
      })
    } else {
      // that.setData({state: false })
      // 重新获取定位 2 为随便传 只要不为 1 
      that.getLoc(2)
      that.startLB()
      that.startL()
    }
  },
  // 添加上传轨迹信息
  postPoyMsg(newList, startTime) {
    let that = this
    let emptyRRA = []
    newList.forEach(v => {
      let emptyJBO = {
        openId: that.data.openId,
        openKey: that.data.openKey,
        time: v.split('...')[0],
        longitude: v.split('...')[2],
        latitude: v.split('...')[3],
        distance: v.split('...')[4],
        useTime: Number(v.split('...')[0]) - startTime
      }
      emptyRRA.push(emptyJBO)
    })
    that.setData({
      putN: ++that.data.putN
    })
    tool({
      url: "/run/addPersonData",
      method: "POST",
      data: emptyRRA,
    }).then(suc => {
      console.log(suc)
    })
  },
  // 开启前台获取定位
  startL() {
    wx.startLocationUpdate({
      success(res) {
        console.log('开启小程序进入前台时接收位置消息', res)
      },
      fail(res) {
        console.log('开启小程序进入前台时接收位置消息失败', res)
      }
    })
  },
  // 开启后台获取定位
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
          content: '请在位置设置中选择使用小程序期间和离开小程序后',
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
  // 打开 openSetting 选择使用时和离开后
  goSQ() {
    let that = this
    wx.openSetting({
      success(res) {
        console.log(res.authSetting)
        let ULB = res.authSetting
        if (!ULB.hasOwnProperty('scope.userLocationBackground')) {
          wx.showModal({
            title: '提示',
            content: '请在位置设置中选择使用小程序期间和离开小程序后',
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
  // 秒转时分秒
  formatSeconds(time) {
    let min = Math.floor(time % 3600)
    let hh = Math.floor(time / 3600) > 9 ? Math.floor(time / 3600) : '0' + Math.floor(time / 3600)
    let mm = Math.floor(min / 60) > 9 ? Math.floor(min / 60) : '0' + Math.floor(min / 60)
    let ss = time % 60 > 9 ? time % 60 : '0' + time % 60
    let val = hh + ':' + mm + ':' + ss
    return val
  },
  // 是否显示分段
  taggleAlert() {
    if (!this.data.showAlert) {
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
        console.log('lastDis=' + lastDis)
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
              let hm = 0
              let useHm = 0
              // 该项 - 第一项的时间戳为使用时间
              useHm = parseInt(Number(res.data[i].split('...')[0] - res.data[0].split('...')[0]) / 1000)
              // 所用时间秒
              if (n == 1) {
                hm = parseInt(Number(res.data[i].split('...')[0] - res.data[0].split('...')[0]) / 1000)
              } else {
                hm = parseInt(Number(res.data[i].split('...')[0] - res.data[util.lookupNear(disArr, n - 1)].split('...')[0]) / 1000)
              }
              // console.log(hm)
              smArr.push({
                Num: n,
                dd: '1',
                useTime: that.formatSeconds(useHm),
                meanPace: that.forPace((hm / 60) / 1)
              })
            }
            if (util.floatSub(lastDis, lB) > 0) {
              let hm = parseInt(Number(res.data[res.data.length - 1].split('...')[0] - res.data[util.lookupNear(disArr, n)].split('...')[0]) / 1000)
              let useHm = parseInt(Number(res.data[res.data.length - 1].split('...')[0] - res.data[0].split('...')[0]) / 1000)
              smArr.push({
                Num: ++n,
                dd: util.floatSub(lastDis, lB),
                useTime: that.formatSeconds(useHm),
                meanPace: that.forPace((hm / 60) / util.floatSub(lastDis, lB))
              })
            }
            smArr.push({
              Num: '总计',
              dd: lastDis,
              useTime: that.data.useTrueTime,
              meanPace: that.forPace((that.data.useTime / 60) / lastDis)
            })
          } else {
            smArr.push({
              Num: 1,
              dd: lastDis,
              useTime: that.data.useTrueTime,
              meanPace: that.forPace((that.data.useTime / 60) / lastDis)
            }, {
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
  // 点击照相
  takePictures: function () {
    var that = this;
    if (that.data.openKey == '') {
      wx.showModal({
        title: '提示',
        content: '请先开始',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      })
    } else {
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          console.log(res)
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFilePaths = res.tempFilePaths;
          let mark = that.data.markers
          mark.push({
            iconPath: tempFilePaths[0],
            // id: 0,
            latitude: that.data.latitude,
            longitude: that.data.longitude,
            width: 20,
            height: 25
          })
          that.setData({
            markers: mark
          })
          // // 上传图片
          wx.uploadFile({
            url: util.imgUrl + "/run/uploadImg",
            filePath: tempFilePaths[0],
            name: 'img',
            success(res) {
              const imgName = JSON.parse(res.data).data.img
              console.log(imgName)
              let imgUrl = util.imgUrl + '/run/query_pic?name=' + imgName
              console.log(imgUrl)

              let target = {
                openId: that.data.openId,
                openKey: that.data.openKey,
                time: new Date().getTime(),
                longitude: that.data.longitude,
                latitude: that.data.latitude,
                distance: that.data.distance,
                useTime: that.data.useTime * 1000,
                img: imgUrl
              }
              tool({
                url: '/run/addPersonDataImg',
                data: target,
                method: "POST"
              }).then(resolve => {
                console.log(resolve.data)
              })
            }
          })
        }
      });
    }
  },
  /*
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    // tool({url:"/j/subject_abstrat",data:{subject_id: 2364086}}).then(res=>{
    //   let {data}=res
    //   console.log(data)
    // })
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