import api from '../../utils/api.js';
import AJAX from '../../utils/networkUtil.js';
const app = getApp();
Page({

  /**
  * 页面的初始数据
  */
  data: {
    currtab: 0,
    swipertab: [{ name: '预约订单', index: 0 }, { name: '停车订单', index: 1 }, { name: '退款订单', index: 2 }],
  },

  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {

  },
  /**
  * 生命周期函数--监听页面初次渲染完成
  */
  onShow(){
    // 页面渲染完成
    this.getDeviceInfo()
    this.orderShow()
  },

  getDeviceInfo: function () {
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          deviceW: res.windowWidth,
          deviceH: res.windowHeight
        })
      }
    })
  },

  /**
  * @Explain：选项卡点击切换
  */
  tabSwitch: function (e) {
    var that = this
    if (this.data.currtab === e.target.dataset.current) {
      return false
    } else {
      that.setData({
        currtab: e.target.dataset.current
      })
    }
  },

  tabChange: function (e) {
    this.setData({ currtab: e.detail.current })
    this.orderShow()
  },


  orderShow: function () {
    let that = this
    switch (this.data.currtab) {
      case 0:
        that.alreadyShow()
        break
      case 1:
        that.waitPayShow()
        break
      case 2:
        that.lostShow()
        break
    }
  },
  alreadyShow: function () {
    let that = this
    let data = {
      user_id:wx.getStorageSync('userId'),
      page_num: 0,
      type: -1
    }
    AJAX('/apiread/order/bill/list', data, function (res) {
      let list = []
      console.log(res)
      res.data.bills.forEach((item) => {
        if (item.state === 1301 || item.state === 1300 ) {
          list.push(item)
        }
      })
      that.setData({
        alreadyOrder: list
      })
    })
    
  },

  waitPayShow: function () {
    let that = this
    let data = {
      user_id:wx.getStorageSync('userId'),
      page_num: 0,
      type: -1
    }
    AJAX('/apiread/order/bill/list', data, function (res) {
      let list = []
      console.log(res)
      res.data.bills.forEach((item) => {
        if (item.state === 1302 || item.state === 1303 || item.state === 1304) {
          list.push(item)
        }
      })
      that.setData({
        waitPayOrder: list
      })
    })
  },

  lostShow: function () {
    let that = this
    let data = {
      user_id: wx.getStorageSync('userId'),
      page_num: 0,
      type: -1
    }
    AJAX('/apiread/order/bill/list', data, function (res) {
      let list = []
      console.log(res)
      res.data.bills.forEach((item) => {
        if (item.state >= 1307 && item.state<=1310) {
          list.push(item)
        }
      })
      that.setData({
        lostOrder: list
      })
    })
  },


  /**
  * 生命周期函数--监听页面显示
  */
  
})