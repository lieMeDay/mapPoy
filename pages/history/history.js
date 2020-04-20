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
    openId:'',
    delBtnWidth: 180,
    startX: "",
    list: [],
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
    openId={openId:'oy5TU5B3GEmPBjqQgG7LEHgsW3cc'}
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
            openKey: v,
            time: v.split('%@%')[1],
            dis: lastd ? lastd.distance : '0',
            useTime: lastd ? that.formatSeconds(parseInt((lastd.useTime) / 1000)) : '00:00:00'
          }
          aa.push(emp)
          var dateToTime = function (str) {
            return (new Date(str.replace(/-/g, '/'))).getTime(); //用/替换日期中的-是为了解决Safari的兼容
          }
          for (var i = 0; i < aa.length; i++) {
            aa[i].publishTimeNew = dateToTime(aa[i].time);
          }
          aa.sort(function (a, b) {
            return b.publishTimeNew > a.publishTimeNew ? 1 : -1;
          });
          // console.log(aa)
          that.setData({
            list: aa
          })
        })
      })
    })
  },

  touchS: function (e) {
    this.data.list.forEach(vv => {
      vv.txtStyle = ""
      vv.delStyle = ""
    });
    if (e.touches.length == 1) {
      this.setData({
        //设置触摸起始点水平方向位置
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function (e) {
    if (e.touches.length == 1) {
      //手指移动时水平方向位置
      var moveX = e.touches[0].clientX;
      //手指起始点位置与移动期间的差值
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var txtStyle = "";
      var delStyle = ""
      if (disX == 0 || disX < 0) { //如果移动距离小于等于0，说明向右滑动，文本层位置不变
        txtStyle = "left:0px";
        delStyle = "right:-" + delBtnWidth + "px";
      } else if (disX > 0) { //移动距离大于0，文本层left值等于手指移动距离
        txtStyle = "left:-" + disX + "px";
        delStyle = "right: -" + (delBtnWidth - disX) + "px";
        if (disX >= delBtnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度
          txtStyle = "left:-" + delBtnWidth + "px";
          delStyle = "right:0px"
        }
      }
      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index;
      var list = this.data.list;
      list[index].txtStyle = txtStyle;
      list[index].delStyle = delStyle;
      //更新列表的状态
      this.setData({
        list: list
      });
    }
  },
  touchE: function (e) {
    if (e.changedTouches.length == 1) {
      //手指移动结束后水平位置
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var txtStyle = disX > delBtnWidth / 2 ? "left:-" + delBtnWidth + "px" : "left:0px";
      var delStyle = disX > delBtnWidth / 2 ? "right:0px" : "right:-" + delBtnWidth + "px";
      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index;
      var list = this.data.list;
      list[index].txtStyle = txtStyle;
      list[index].delStyle = delStyle;
      //更新列表的状态
      this.setData({
        list: list
      });
    }
  },
  //获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750 / 2) / (w / 2); //以宽度750px设计稿做宽度的自适应
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  //点击删除按钮事件
  delItem: function (e) {
    // console.log(e)
    let obj={
      openId:this.data.openId,
      openKey:e.currentTarget.dataset.openkey
    }
    // console.log(obj)
    tool({
      url: "/run/delPersonOneRaw",
      data: obj,
    }).then(suc => {
      console.log(suc)
      //获取列表中要删除项的下标
      var index = e.currentTarget.dataset.index;
      var list = this.data.list;
      //移除列表中下标为index的项
      list.splice(index, 1);
      //更新列表的状态
      this.setData({
        list: list
      });
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      openId:options.openId
    })
    this.getList(options)
    this.initEleWidth();
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