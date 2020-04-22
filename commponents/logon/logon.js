// commponents/logon.js
const app = getApp()
let {
  tool
} = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    hasInfo: false,
    userInfo: {}
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getUserInfo: function (e) {
      if (e.detail.errMsg == "getUserInfo:ok") {
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
          hasInfo: true,
          userInfo: e.detail.userInfo
        })
      } else {
        console.log(e)
        wx.showToast({
          title: '请允许授权基本信息',
          icon: 'none',
          duration: 2000
        })
      }
    },
    getPhoneNumber(e) {
      let that = this
      console.log(e.detail.errMsg)
      // console.log(e.detail.iv)
      // console.log(e.detail.encryptedData)
      if (e.detail.errMsg == "getPhoneNumber:ok") {
        wx.login({
          success: res => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            // console.log(res)
            let JSCODE = res.code
            tool({
              url: "/run/getOpenId",
              data: {
                code: JSCODE
              },
            }).then(res => {
              // console.log(e.detail.iv)
              // console.log(e.detail.encryptedData)
              let obj = {
                iv: e.detail.iv,
                encryptedData: e.detail.encryptedData,
                sessionKey: res.data.data.session_key
              }
              tool({
                url: "/run/getPhone",
                data: obj,
              }).then(val => {
                // console.log(val)
                // console.log(that.data.userInfo)
                let msg = {
                  openId: res.data.data.openid,
                  nikeName: that.data.userInfo.nickName,
                  sex: that.data.userInfo.gender == 0 ? '未知' : that.data.userInfo.gender == 1 ? '男' : '女',
                  city: that.data.userInfo.city,
                  phone: val.data.data.phoneNumber,
                  headImgUrl: that.data.userInfo.avatarUrl
                }
                // console.log(msg)
                tool({
                  url: "/run/addUser",
                  data: msg,
                  method: "POST"
                }).then(vv => {
                  console.log(vv)
                  // this.triggerEvent("ForUserMsg", e.detail.userInfo);
                })
                app.globalData.showLogon = false
                this.triggerEvent("ForUserMsg", that.data.userInfo);
              })
            })
          },
          fail: err => {
            console.log(err)
          }
        })
      } else {
        wx.showToast({
          title: '请允许授权手机号',
          icon: 'none',
          duration: 2000
        })
      }
    },
  },
  attached() {
    let that=this
    // 获取用户信息
    wx.getSetting({
      success: res => {
        // console.log(res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              that.setData({
                hasInfo:true,
                userInfo:res.userInfo
              })
            }
          })
        }

      }
    })
  }
})