import api from '../../utils/api.js';
import AJAX from '../../utils/networkUtil.js';
const app = getApp();
Page({
  data: {
    headSrc:"/assets/icon/img_default_avatar.png",
    userName:'登录/注册',
    ajaxGetUserInfo:null,
    isLoginFlag:false,
    couponCount:null,
    //判断用户是否为车主，true为车主，false为业主
    isCarOwner: false,
    showModal: false,
    parklotList: [],
    Lists: [{name: "sdg",id:1},{name:"dsg",id: 2}],
    index: -1,
    show: false
  },
  onLoad: function () {
  },
  onReady(){

  },
  onShow(){
    let _this=this;
    _this.testUserId()
  },
  onHide(){
    // if (wx.getStorageSync('firstLogin')) {
    //   return
    // }

  },
  onUnload(){
  },
  viewBills() {
    
    wx.navigateTo({
      url: '../bills/bills',
    })
    
  },
  fetchParklot() {
    let that = this
    let data = {
      user_id: wx.getStorageSync('userId'),//app.globalData.userInfo.userId,
      timestamp: (new Date().getTime()/1000).toString()
    }
    AJAX('/apiread/parklot/publish/parklotinfo',data,function(res) {
      that.setData({
        parklotList: res.data
      })
    })
  },
  goLogin(){
    if(this.data.isLoginFlag == false){
      wx.navigateTo({
        url: '../login/login',
      })
    }
  },
  goMyPlate() {
    if (this.data.isLoginFlag == false) {
      wx.navigateTo({
        url: '../login/login',
      })
    }else{
      wx.navigateTo({
        url: '../platelist/platelist?entrance=personal',
      })
    }
    
  },
  // goMyCoupon() {
  //   wx.navigateTo({
  //     url: '../coupon/coupon',
  //   })
  // },
  goMyParkingRelease(parklotId) {
    if (this.data.isLoginFlag == false) {
      wx.navigateTo({
        url: '../login/login',
      })
    } else {
      app.parklotId = {
        id: parklotId
      }
      wx.navigateTo({
        url: '../parkingRelease/parkingRelease'
      })
    }
  },
  goMyParking(){
    if (this.data.isLoginFlag == false) {
      wx.navigateTo({
        url: '../login/login',
      })
    } else {
      wx.navigateTo({
        url: '../parkinglistwithoutsearch/parkinglistwithoutsearch',
      })
    }
  },
  goLockControl() {
    if (this.data.isLoginFlag == false) {
      wx.navigateTo({
        url: '../login/login',
      })
    } else {
      wx.navigateTo({
        url: '../lockcontrol/lockcontrol',
      })
    }
  },
  goMyAppointment() {
    if (this.data.isLoginFlag == false) {
      wx.navigateTo({
        url: '../login/login',
      })
    } else {
      wx.navigateTo({
        url: '../order/order',
      })
    }
  },
  testUserId() {
    let _this = this
    if (wx.getStorageSync('firstLogin') || wx.getStorageSync('exit')) {
      return
    }
    if (!wx.getStorageSync('userId')) {
      _this.setData({
        isLoginFlag: false
      })
        wx.getSetting({
          success(res) {
            if (res.authSetting['scope.userInfo']) {
              wx.showModal({
                title: '提示',
                content: '信息丢失，请重新授权！',
                success: function (res) {
                  if (res.confirm) {
                    wx.redirectTo({
                      url: '../index/index'
                    })
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                    return
                  }
                }
              })
            }
          }
        })
    } else {
      if (wx.getStorageSync('isLoginFlag')) {
        _this.setData({
          headSrc: wx.getStorageSync('avatarUrl'),
          userName: wx.getStorageSync('userPhone'),
          isLoginFlag: wx.getStorageSync('isLoginFlag'),
          isCarOwner: wx.getStorageSync('isCarOwner'),
        })
        _this.fetchParklot()
      } else {
        _this._getUserInfo();//获取用户信息
        _this.fetchParklot()
      }
     
    }
  },
  _getUserInfo(){
    let _this=this;
    let data={
      'user_id': wx.getStorageSync('userId'),//app.globalData.userInfo.userId,
      // "timestamp": String(new Date().getTime())
    }
    AJAX('/apiread/user/info/get', data,function(res){
        let data=res.data;
        console.log(data)
        _this._handleUserInfo(data)
  })
  },
  _handleUserInfo(data){
    let _this=this;
    console.log(data)
    if (data.phone!=null){
      wx.setStorageSync('userPhone', data.phone)
      wx.setStorageSync('isLoginFlag', true)
      wx.setStorageSync('isCarOwner', data.userType === 0)
      _this.setData({
        headSrc: wx.getStorageSync('avatarUrl'),//app.globalData.avatarUrl,
        userName: data.phone,
        isLoginFlag: true,
        isCarOwner: data.userType === 0
      })
    }
  },
  exit() {
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确定要退出登陆吗？',
      success(res) {
        if (res.confirm) {
          app.globalData.userInfo == null,
          wx.clearStorageSync()
          wx.setStorageSync('exit', true)
          wx.redirectTo({
            url: '../login/login',
          })
          console.log('用户退出登录')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  selectTap(){
    this.setData({
      show: !this.data.show
    })
  },
  optionTap(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      index: index,
      show: !this.data.show
    })
  },
  modalCancel() {
    console.log('concel')
  },
  modalConfirm() {
    let parklotId = this.data.parklotList[this.data.index].id
    console.log(parklotId)
    this.goMyParkingRelease(parklotId)

  },
  chooseParklot() {
    if (this.data.isLoginFlag == false) {
      wx.navigateTo({
        url: '../login/login',
      })
    } else {
      this.setData({
        showModal: true
      })
    }

  }
})
