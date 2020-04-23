// pages/index/index.js
const app = getApp()
var util = require('../../utils/util.js')
let tool = getApp().tool
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Historical: [], //历史回顾
    hasBegin: [], //正在直播
    WillBegin: [], //即将开始
    showLogon:false
  },
  // 判断登录
  JudgeLogin(){
    let that=this
    if (app.globalData.showLogon) {
      console.log('aaaa===>'+app.globalData.showLogon)
      this.setData({
        showLogon: app.globalData.showLogon,
      })
    } else {
      app.CallbackShowLogon = logoState => {
        this.setData({
          showLogon: logoState
        })
      }
    }
  },
  getMatch(){
    tool({
      url:"/match/getMatchByOrg",
      data:{"orgId":1},
    }).then(res=>{
      console.log(res.data)
      let empHas=[]
      let empWill=[]
      let empHis=[]
      res.data.data.forEach(vv => {
        vv.showType = vv.type == "M" ? "马拉松" : "越野赛";
        vv.showPlace = vv.place.split("-")[0];
        vv.states = util.compareDate(vv.matchDate, vv.matchEndDate);
        vv.showDate = vv.matchDate.substring(0, 10);
        if(vv.states=='a'){
          empWill.push(vv) //即将开始
        }else if(vv.states=='b'){
          empHis.push(vv) //已结束
        }else{
          empHas.push(vv)
        }
      });
      this.setData({
        Historical: empHis, //历史回顾
        hasBegin: empHas, //正在进行
        WillBegin: empWill, //即将开始
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.JudgeLogin()
    this.getMatch()
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