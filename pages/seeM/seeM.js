// pages/seeM/seeM.js
let {
  tool
} = getApp()
const app = getApp()
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: '', //用户信息
    nowDate: '', //当前时间
    useTrueTime: '00:00:00', // 将useTime转为时分秒
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
  getData(openKey) {
    let that = this
    tool({
      url: "/run/getPersonDataByKey",
      data: openKey,
    }).then(res => {
      console.log(res.data)
      let record = res.data.data
      let lastRec = record[record.length - 1]
      let poyp = []
      record.forEach(v => {
        let emp = {
          longitude: v.longitude,
          latitude: v.latitude
        }
        poyp.push(emp)
      })
      that.setData({
        nowDate: openKey.openKey.split('%@%')[1],
        longitude: lastRec.longitude, //中心经度
        latitude: lastRec.latitude, //中心纬度
        markers: [{
          iconPath: "/images/first.png",
          id: 0,
          latitude: record[0].latitude,
          longitude: record[0].longitude,
          width: 20,
          height: 25
        },{
          iconPath: "/images/last.png",
          id: 0,
          latitude: lastRec.latitude,
          longitude: lastRec.longitude,
          width: 20,
          height: 25
        }], // 个人点
        'polyline[0].points': poyp,
        distance: lastRec.distance,
        useTrueTime: that.formatSeconds(parseInt(lastRec.useTime / 1000)),
        speed: lastRec.distance > 0 && parseInt(lastRec.useTime / 1000) / 60 > 0 ? that.forPace((parseInt(lastRec.useTime / 1000) / 60) / lastRec.distance) : "--'--\""
      })
      that.getpoint(record)
    })
  },

  // 是否显示分段
  taggleAlert() {
    this.setData({
      showAlert: !this.data.showAlert
    })
  },
  // 获取分段
  getpoint(poyLP) {
    let that = this
    // console.log(poyLP)
    let smArr = []
    let disArr = poyLP.map(x => x.distance)
    // console.log('disArr:', disArr)
    let lastAOB = poyLP[poyLP.length - 1] //最后一项
    let lastDis = poyLP[poyLP.length - 1].distance
    // let lastDis=3.2
    // console.log(lastDis)
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
          let useHm=0
          useHm=parseInt(Number(poyLP[i].useTime) / 1000)
          // console.log(poyLP[i],useHm,that.formatSeconds(useHm))
          // 所用时间秒
          if (n == 1) {
            hm = parseInt(Number(poyLP[i].time - poyLP[0].time) / 1000)
          } else {
            hm = parseInt(Number(poyLP[i].time - poyLP[util.lookupNear(disArr, n - 1)].time) / 1000)
          }
          // console.log(hm,useHm)
          smArr.push({
            Num: n,
            dd: '1',
            useTime: that.formatSeconds(useHm),
            meanPace: that.forPace((hm / 60) / 1)
          })
        }
        if (util.floatSub(lastDis, lB) > 0) {
          let hm = parseInt(Number(poyLP[poyLP.length - 1].time - poyLP[util.lookupNear(disArr, n)].time) / 1000)
          let useHm= parseInt(Number(poyLP[poyLP.length - 1].useTime) / 1000)
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
          meanPace: that.forPace(((lastAOB.useTime / 1000) / 60) / lastDis)
        })
      } else {
        smArr.push({
          Num: 1,
          dd: lastDis,
          useTime: that.data.useTrueTime,
          meanPace: that.forPace(((lastAOB.useTime / 1000) / 60) / lastDis)
        }, {
          Num: '总计',
          dd: lastDis,
          useTime: that.data.useTrueTime,
          meanPace: that.forPace(((lastAOB.useTime / 1000) / 60) / lastDis)
        })
      }
      that.setData({
        partArr: smArr
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    // options = {
    //   openKey: "oy5TU5B3GEmPBjqQgG7LEHgsW3cc%@%2020/04/17 18:03"
    // }
    this.getData(options)
    this.setData({
      userInfo: app.globalData.userInfo
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