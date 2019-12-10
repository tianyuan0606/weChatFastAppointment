// pages/parkingsearchbyid/parkingsearchbyid.js
import { formatHm } from '../../utils/timeplugin.js'
import AJAX from '../../utils/networkUtil.js';
const app = getApp();
const PUBLISHED_PARKING = 1101; //车位状态：已发布
Page({

  /**
   * 页面的初始数据
   */
  data: {
    parkingResult: [
      // { parklocNumber: 100, startTime: "13:30",endTime: "15:30",parklotName:"北邮"},
      // { parklocNumber: 200, startTime: "13:30",endTime: "15:30",parklotName:"北邮"},
      // { parklocNumber: 111, startTime: "13:30", endTime: "15:30", parklotName: "北邮"},
      // { parklocNumber: 888, startTime: "13:30", endTime: "15:30", parklotName: "北邮" },
    ], //车位发布数据
    page:0, //当前页数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getParkingPublished(this.data.page);
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作：刷新页面
   */
  onPullDownRefresh: function () {
    this.setData({
      page:0,
    })
    this.getParkingPublished(this.data.page);
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数：获取下一页数据
   */
  onReachBottom: function () {
    this.setData({
      page: this.data.page+1,
    })
    this.getParkingPublished(this.data.page);
  },

  /**
   * 通过查询车位发布接口获取发布车位数据
   */
  getParkingPublished(curPage){
    var _this=this;
    let data ={
      "user_id": app.globalData.userInfo.userId,
      "state": PUBLISHED_PARKING,
      "page_num": curPage,
      "timestamp": String(new Date().getTime()),
    }
    AJAX('/apiread/parkloc/publish/query',data,function(res){
      if(res.error_code ==2000){
        if(res.data.length !== 0){
          //处理车位发布时间显示
          for (let item of res.data) {
            for (let publish of item.publishList) {
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
   * 按车位编号查询
   */
  onInputBlur: function(e){
    var _this = this;
    let parkingId = e.detail.value;
    let data = {
      "user_id": app.globalData.userInfo.userId,
      "parkloc_number": parkingId,
      "timestamp": String(new Date().getTime()),
    }
    AJAX('/apiread/parkloc/query/byNumber',data,function(res){
      if (res.error_code == 2000) {
        if(res.data.length !== 0){
          res.data.publishList[0].startTime = formatHm(res.data.publishList[0].startTime);
          res.data.publishList[0].endTime = formatHm(res.data.publishList[0].endTime);
        }
        _this.setData({
          parkingResult:res.data,
        });
      }else{
        wx.showToast({
          title: '按车位查询接口错误' + res.error_message,
          icon: 'none'
        })
      }
    });
  },

})