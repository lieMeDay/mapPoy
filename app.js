//app.js
var utils = require('./utils/util.js')
App({
  onLaunch: function () {
    wx.removeStorage({
      key: 'paobugji',
      success (res) {
        // console.log(res)
      }
    })
    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
    let that=this
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res)
        let APPID='wxbf160c13ec5871ef'
        let SECRET='b0013939e826bda6b73b13e5c867e411'
        let JSCODE=res.code
        utils.tool({
          url: "/run/getOpenId",
          data: {
            code: JSCODE
          },
        }).then(res=>{
          console.log(res)
          that.globalData.openId=res.data.data.openid
              if (that.CallbackFn) {
              // 如果有说明，onLoad中没有拿到值，把结果当参数再传入回调中
              that.CallbackFn(res);
          }
        })
        // wx.request({
        //   url: `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${JSCODE}&grant_type=authorization_code`,
        //   success (res) {
        //     console.log(res.data)
        //     that.globalData.openId=res.data.openid
        //     if (that.CallbackFn) {
        //       // 如果有说明，onLoad中没有拿到值，把结果当参数再传入回调中
        //       that.CallbackFn(res);
        //   }
        //   }
        // })
      },
      fail:err=>{
        console.log(err)
      },
      complete(r){
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        // console.log(res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      
      }
    })
  },
  onHide () {
    console.log('app===>onHide')
    // Do something when hide.
  },
  globalData: {
    userInfo: null,
    openId:'',
  },
  tool: utils.tool,
})