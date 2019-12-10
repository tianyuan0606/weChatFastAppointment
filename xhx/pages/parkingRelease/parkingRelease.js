const date = new Date()
const years = []
const months = []
const days = []
const PERIODS_DIFF = 15 * 60 * 1000;
const DAY_DIFF = 24 * 60 * 60 * 1000;
const weekNames = ['日','一','二','三','四','五','六']
const app = getApp()
import AJAX from '../../utils/networkUtil.js';
const weekDays = weekNames.map((name,index) => ({
  name: name,
  isSelected: false,
  value: index
}))
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //时间选择器开始时间和结束时间的最小差值
    minDuration : 30 * 60 * 1000,
    pickerHeight: 400,
    //渲染自动发布所用数据
    weekDays,
    //当前时段可用车位数
    avaliableParkingCount:0,
    //要发布的车位数
    parkingCount: 0,
    //是否自动发布
    isAutoPublish: false,
    //选择的时间段
    timePeriods:{
      startOfPeriod: 0,
      endOfPeriod: 0
    },
    avaliableParkingList:[],
    //停车场Id
    parklotId:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let currentTime = (new Date()).getTime();
    // 定义时间选择器的开始时间
    let firstStartTimestamp = currentTime - currentTime % PERIODS_DIFF + PERIODS_DIFF;
    this.setData({
      firstStartTimestamp
    })
    console.log(app.globalData.userInfo.userId)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  
  //获取选择的时间段
  getSelectedTimePeriod(params){
    console.log("传入的时间段为",params.detail)
    let timePeriods = params.detail
    this.setData({ timePeriods: timePeriods })
    this.getAvailableParking()
  },
  //获取当前时段可发布的车位
  getAvailableParking(){
    //车位数量置空
    this.setData({
      parkingCount: ''
    })
    let params = {
      user_id: app.globalData.userInfo.userId,
      start_time: this.data.timePeriods.startOfPeriod,
      end_time: this.data.timePeriods.endOfPeriod,
      mode: this.data.isAutoPublish?1: 0,
      timestamp: (new Date()).getTime(),
      parklotId: app.parklotId.id
    }
    if(this.data.isAutoPublish == true){
      let day_of_week = this.data.weekDays.filter(item => item.isSelected == true).map(item => item.value);
      //如果未选择天数，则不请求
      if(day_of_week.length == 0) return false
      params['day_of_week'] = day_of_week.join()
    }
    AJAX('/apiread/parkloc/allow/publish/info', params, (res)=> {
      let data = res.data
      console.log(data)
      this.setData({
        avaliableParkingCount: data.count,
        avaliableParkingList: data.parklocIds.split(','),
        parklotId: data.parklotId
      })
    })
  },
  //选择重复发布时段
  selectWeekdays(e){
    let index = e.target.dataset.index
    let weekDays = [...this.data.weekDays];
    weekDays[index].isSelected = !weekDays[index].isSelected;
    this.setData({
      weekDays:weekDays
    })
    this.getAvailableParking()
  },
  //修改车位数量执行的函数
  inputParkingCount(e){
    this.setData({
      parkingCount: e.detail.value
    })
  },
  //切换是否自动发布
  switchAutoPublish(){
    let isAutoPublish = !this.data.isAutoPublish;
    let currentTime = (new Date()).getTime();
    // 重置时间选择器的开始时间,如果是自动发布，时间段从0点开始，否则从当前时点的下一个整点开始
    let firstStartTimestamp = isAutoPublish ? currentTime - currentTime % DAY_DIFF - 8 * 60 * 60 * 1000: currentTime - currentTime % PERIODS_DIFF + PERIODS_DIFF;

    //重置自动发布时间
    weekDays.forEach((item) => {
      item.isSelected = false
    })

    this.setData({
      firstStartTimestamp: firstStartTimestamp,
      isAutoPublish: isAutoPublish,
      weekDays: weekDays
    })
    
  },
  //发布车位
  publishParking(){
    let parkingCount = this.data.parkingCount? parseInt(this.data.parkingCount): 0;
    if (parkingCount > this.data.avaliableParkingCount){
      this.showWrong('车位数量不能大于当前时段可发布的车位数');
      return;
    }
    if (parkingCount == 0){
      this.showWrong('请填写要发布的车位数量');
      return;
    }
    let parklocIds = this.data.avaliableParkingList.filter((item, index) => index < parkingCount).join(',')
    let params = {
      parklocIds: parklocIds,
      user_id: app.globalData.userInfo.userId,
      parklot_id: this.data.parklotId,
      start_time: this.data.timePeriods.startOfPeriod,
      end_time: this.data.timePeriods.endOfPeriod,
      mode: this.data.isAutoPublish ? 1 : 0,
      timestamp: (new Date()).getTime()

    }
    let autoPublishParams = {}
    if(this.data.isAutoPublish == true){
      let day_of_week = this.data.weekDays.filter(item => item.isSelected == true).map(item => item.value).join(',')
      if (day_of_week.length == 0){
        this.showWrong('请选择自动发布的时间');
        return;
      }

      autoPublishParams = {

        day_of_week: day_of_week
      }
    }
    params = {...params,...autoPublishParams}
    AJAX('/apiwrite/publish/batchAdd', params, (res) => {
      if(res.error_code == 2000){
        wx.showToast({
          title: '车位发布成功',
          duration: 2000
        });
        wx.navigateBack({
          delta: 1
        })

      }
    })
  },
  showWrong(msg){
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    })
  }
})