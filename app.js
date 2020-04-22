//app.js
var utils = require('./utils/util.js')
App({
  onLaunch: function () {
    setTimeout(function(){
      that.globalData.name  = 'pxh'
    },3000) 
    setTimeout(function(){
      that.globalData.name  = 'bbb'
    },6000) 
    wx.removeStorage({
      key: 'paobugji',
      success(res) {
        // console.log(res)
      }
    })
    let that = this
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        // console.log(res)
        // let APPID='wxbf160c13ec5871ef'
        // let SECRET='b0013939e826bda6b73b13e5c867e411'
        let JSCODE = res.code
        utils.tool({
          url: "/run/getOpenId",
          data: {
            code: JSCODE
          },
        }).then(res => {
          // console.log(res)
          that.globalData.openId = res.data.data.openid
          that.globalData.sessionKey = res.data.data.session_key
          if (that.CallbackFn) {
            // 如果有说明，onLoad中没有拿到值，把结果当参数再传入回调中
            that.CallbackFn(res);
          }
          utils.tool({
            url: "/run/getUser",
            data: {
              openId: res.data.data.openid
            },
          }).then(val => {
            console.log(val.data.data)
            if (val.data.data) {
              if (val.data.data.phone) {
                wx.getUserInfo({
                  success: res => {
                    // openId    nikeName   sex  city   phone  headImgUrl
                    let newObj = {
                      openId:val.data.data.openId,
                      phone:val.data.data.phone,
                      nikeName: res.userInfo.nickName,
                      sex: res.userInfo.gender == 0 ? '未知' : res.userInfo.gender == 1 ? '男' : '女',
                      city: res.userInfo.city,
                      headImgUrl: res.userInfo.avatarUrl
                    }
                    let truly=function(){
                      for(var k in newObj){
                        if(newObj[k]!=val.data.data[k]){
                          return k
                        }
                      }
                    }()
                    // console.log(truly)
                    if(truly){
                      // console.log(111)
                      // let objMsg={}
                      // utils.tool({
                      //   url:"/run/putUser",
                      //   data:''
                      // })
                    }


                  }
                })
              } else {
                that.globalData.showLogon = true
              }
            } else {
              that.globalData.showLogon = true
            }
          })
        })
      },
      fail: err => {
        console.log(err)
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
  // onHide () {
  //   console.log('app===>onHide')
  //   // Do something when hide.
  // },
  watch:function(method){
    console.log(method)
    var obj = this.globalData;
    Object.defineProperty(obj,"name", {
      configurable: true,
      enumerable: true,
      set: function (value) {
        console.log(value)
        this._name = value;
        console.log('是否会被执行2')
        method(value);
      },
      get:function(){
      // 可以在这里打印一些东西，然后在其他界面调用getApp().globalData.name的时候，这里就会执行。
        return this._name
      }
    })
  },
  globalData: {
    showLogon: false, //判断是否显示登陆
    userInfo: null,
    openId: '',
    name:'aaa'
  },
  tool: utils.tool,
})