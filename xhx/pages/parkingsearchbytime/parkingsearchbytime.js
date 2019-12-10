// pages/parkingsearchbytime/parkingsearchbytime.js
import { formatHm } from '../../utils/timeplugin.js'
import AJAX from '../../utils/networkUtil.js';
const app = getApp()
const PERIODS_DIFF = 15 * 60 * 1000;
const PUBLISHED_PARKING = 1101; //车位状态：已发布
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPicker:true, //picker组件是否显示
    minDuration: 30 * 60 * 1000, //最小间隔时间
    pickerHeight: 500, //picker组件高度
    parkingResult:[
      // { parklocNumber: 100, startTime: "13:30", endTime: "15:30", parklotName: "北邮" },
      // { parklocNumber: 200, startTime: "13:30", endTime: "15:30", parklotName: "北邮" }
    ], //发布车位数据
    startOfPeriod:0, //选择时间段的开始时间戳
    endOfPeriod:0, //选择时间段的结束时间戳
    searchTime:'请选择发布时段', //显示的已选择时间段
    page:0, //当前未搜索结果页数
    resultPage: 0 //当前搜索结果页数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let currentTime = (new Date()).getTime();
    // 定义时间选择器的开始时间
    let firstStartTimestamp = currentTime - currentTime % PERIODS_DIFF + PERIODS_DIFF;
    this.setData({
      firstStartTimestamp
    });
    this.getParkingPublished(this.data.page);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作：刷新页面
   */
  onPullDownRefresh: function () {
    this.setData({
      page: 0,
      resultPage: 0,
      parkingResult:[],
      searchTime: '请选择发布时段'
    })
    this.getParkingPublished(this.data.page);
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数：获取下一页数据
   */
  onReachBottom: function () {
    if (this.data.searchTime == '请选择发布时段'){
      this.setData({
        page: this.data.page + 1,
      })
      this.getParkingPublished(this.data.page);
    }else{
      this.setData({
        resultPage: this.data.resultPage + 1,
      })
      this.searchbyTime(this.data.resultPage);
    }
  },

  /**
   * 通过查询车位发布接口获取发布车位数据
   */
  getParkingPublished(curPage) {
    var _this = this;
    let data = {
      "user_id": app.globalData.userInfo.userId,
      "state": PUBLISHED_PARKING,
      "page_num": curPage,
      "timestamp": String(new Date().getTime()),
    }
    AJAX('/apiread/parkloc/publish/query', data, function (res) {
      if (res.error_code == 2000) {
        if (res.data.length != 0) {
          //处理车位发布时间显示
          for (let item of res.data) {
            for(let publish of item.publishList){
              publish.startTime = formatHm(publish.startTime);
              publish.endTime = formatHm(publish.endTime);
            }
          }
          _this.setData({
            parkingResult: _this.data.parkingResult.concat(res.data),
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

  /**
   * 按时间查询
   */
  searchbyTime:function(curPage){
    var _this = this;
    let data = {
      "user_id": app.globalData.userInfo.userId,
      "start_time": this.data.startOfPeriod,
      "end_time": this.data.endOfPeriod,
      "page_num": curPage,
      "timestamp": String(new Date().getTime())
    }
    AJAX('/apiread/parkloc/query/byTime', data, function (res) {
      if (res.error_code == 2000) {
        if (res.data.length !== 0) {
          //处理车位发布时间显示
          for (let item of res.data) {
            for (let publish of item.publishList) {
              publish.startTime = formatHm(publish.startTime);
              publish.endTime = formatHm(publish.endTime);
            }
          }
        }
        _this.setData({
          parkingResult: _this.data.parkingResult.concat(res.data),
        });
      } else {
        wx.showToast({
          title: '按时段查询接口错误' + res.error_message,
          icon: 'none'
        })
      }
    });
  },
  /**
   * 选择时间段点击事件：显示picker组件
   */
  onSelectClicked: function () {
    this.setData({
      showPicker: !this.data.showPicker
    });
  },

  /**
   * 蒙层点击事件：隐藏picker组件，启动查询
   */
  onMaskClicked: function(){
    console.log("mask")
    this.setData({
      showPicker: !this.data.showPicker,
      searchTime: formatHm(this.data.startOfPeriod)+ " - " +formatHm(this.data.endOfPeriod),
      parkingResult: []
    });
    this.searchbyTime(this.data.resultPage);
  },

  /**
   * 获取picker组件选择的时间段
   */
  getSelectedTimePeriod: function (params) {
    console.log("传入的时间段为", params.detail)
    this.setData({
      startOfPeriod: params.detail.startOfPeriod,
      endOfPeriod: params.detail.endOfPeriod
    });
  },

})