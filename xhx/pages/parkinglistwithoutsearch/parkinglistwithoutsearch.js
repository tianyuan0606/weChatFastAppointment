// pages/parkinglistwithoutsearch/parkinglistwithoutsearch.js
const PUBLISHED_PARKING = 1101; //车位状态：已发布
import { formatHm } from '../../utils/timeplugin.js'
import AJAX from '../../utils/networkUtil.js';
const app = getApp();
const img_non_selected_path = "../../assets/icon/ic_button_non_selected.png"
const img_selected_path = "../../assets/icon/ic_button_selected.png"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parkingResult: [],
    page: 0, //当前页数
    selectAll: false,     //是否全选
    publishItemTotal: 0,  //发布时间段总数
    selectedNum: 0,       //目前选中时间段个数
    imagePath: {
      selected: img_selected_path,
      nonSelected: img_non_selected_path
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getParkingPublished()
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      page: this.data.page++
    })
    this.getParkingPublished()
  },

  /**
   * 通过查询车位发布接口获取发布车位数据
   */
  getParkingPublished() {
    var _this = this;
    let data = {
      "user_id": app.globalData.userInfo.userId,
      // "user_id": 105,
      "state": PUBLISHED_PARKING,
      "page_num": this.data.page,
      "timestamp": String(new Date().getTime()),
    }
    AJAX('/apiread/parkloc/publish/query', data, function (res) {
      if (res.error_code == 2000) {
        if (res.data.length !== 0) {
          //处理车位发布时间显示

          var parkingResult = _this.data.parkingResult
          var publishItemTotal = _this.data.publishItemTotal
          res.data.forEach((item) => {
            item.publishList.forEach((publishItem) => {
              publishItem.startTime = formatHm(publishItem.startTime)
              publishItem.endTime = formatHm(publishItem.endTime)
              publishItem.repeat = _this.convertRepeatRule(publishItem.mode, publishItem.dayOfWeek)
              publishItem.selected = false
              publishItemTotal ++
            })
            parkingResult.push(item)
          })
          _this.setData({
            parkingResult: parkingResult,
            publishItemTotal: publishItemTotal
          });
        }
      } else {
        wx.showToast({
          title: '车位列表接口错误' + res.error_message,
          icon: 'none'
        })
      }
    })
  },
  //列表选项点击事件
  onClickPublishItem: function(event) {
    let parkingIndex = event.target.dataset.parkingIndex
    let publishIndex = event.target.dataset.publishIndex
    let parkingResult = this.data.parkingResult
    let selectedNum = this.data.selectedNum
    if (parkingResult[parkingIndex].publishList[publishIndex].selected) {
      parkingResult[parkingIndex].publishList[publishIndex].selected = false
      selectedNum --
    } else {
      parkingResult[parkingIndex].publishList[publishIndex].selected = true
      selectedNum ++
    }
    this.setData({
      parkingResult: parkingResult,
      selectedNum: selectedNum,
      selectAll: this.data.publishItemTotal == selectedNum
    })
  },
  //全选点击事件
  onClickSelectAll() {
    var _this = this
    var parkingResult = this.data.parkingResult
    parkingResult.forEach((item) => {
      item.publishList.forEach((publishItem) => {
        publishItem.selected = !_this.data.selectAll
      })
    })
    this.setData({
      parkingResult: parkingResult,
      selectAll: !this.data.selectAll,
      selectedNum: this.data.selectAll ? 0 : this.data.publishItemTotal
    })
  },
  //取消发布按钮点击事件
  onClickPublishCancel: function() {
    var _this = this
    var publishIds = ""
    this.data.parkingResult.forEach((item) => {
      item.publishList.forEach((publishItem) => {
        if (publishItem.selected) {
          publishIds += publishItem.publishId
          publishIds += ","
        }
      })
    })
    var data = {
      publishIds: publishIds.substr(0, publishIds.length - 1)
    }
    console.log(JSON.stringify(data))
    AJAX("/apiwrite/publish/cancel", data, function(res) {
      console.log(res)
      _this.setData({
        parkingResult: [],
        page: 0, //当前页数
        selectAll: false,     //是否全选
        publishItemTotal: 0,  //发布时间段总数
        selectedNum: 0,       //目前选中时间段个数
      })
      _this.getParkingPublished()
    })
  },

  //生成循环发布字符串
  convertRepeatRule: function (mode, dayOfWeek) {
    let repeat = ""
    if (mode == 0) {
      // 发布一次
      repeat = "一次";
    } else {
      // 循环发布
      if (dayOfWeek.indexOf("1") != -1 && dayOfWeek.indexOf("2") != -1 && dayOfWeek.indexOf("3") != -1 && dayOfWeek.indexOf("4") != -1 && dayOfWeek.indexOf("5") != -1 && dayOfWeek.indexOf("6") != -1 && dayOfWeek.indexOf("0") != -1) {
        repeat = "每天"
      } else {
        // 重复发布
        repeat = "每周:"
        if (dayOfWeek.indexOf("1") != -1) {
          repeat += "一"
        }
        if (dayOfWeek.indexOf("2") != -1) {
          repeat += "二"
        }
        if (dayOfWeek.indexOf("3") != -1) {
          repeat += "三"
        }
        if (dayOfWeek.indexOf("4") != -1) {
          repeat += "四"
        }
        if (dayOfWeek.indexOf("5") != -1) {
          repeat += "五"
        }
        if (dayOfWeek.indexOf("6") != -1) {
          repeat += "六"
        }
        if (dayOfWeek.indexOf("0") != -1) {
          repeat += "日"
        }
      }
    }
    return repeat
  },

})