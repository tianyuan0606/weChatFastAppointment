// pages/lockcontrol/lockcontrol.js
import AJAX from '../../utils/networkUtil.js';
const app = getApp()
const img_non_selected_path = "../../assets/icon/ic_button_non_selected.png"
const img_selected_path = "../../assets/icon/ic_button_selected.png"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchKeyword: "",  //搜索关键字 
    pageNum: 0,
    parkingList: [],
    selectedIndex: [],
    selectedNum: 0,
    selectAll: false,
    imagePath: {
      selected: img_selected_path,
      nonSelected: img_non_selected_path
    },
    //控制操作相关
    controlFlag: false
  },

  onReady: function() {
    this.getAvailableParkings()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 页面相关事件处理函数--监听用户触底动作
   */
  onReachBottom() {
    this.setData({
      pageNum: this.pageNum++
    })
    this.getAvailableParkings()
  },

  //获取可用车位列表
  getAvailableParkings: function() {
    var _this = this
    var data = {
      // userId: 16,
      userId: wx.getStorageSync('userId'),
      pageNum: this.data.pageNum,
    }
    if (this.data.searchKeyword != "") {
      data.parklocNum = this.data.searchKeyword
    }
    AJAX("/apiread/parkloc/lock/batchList", data, function(res) {
      if (res.error_code == 2000) {
        var selectedIndex = _this.data.selectedIndex
        var parkingList = _this.data.parkingList
        res.data.forEach((item) => {
          parkingList.push(item)
          selectedIndex.push(false)
        })
        _this.setData({
          parkingList: parkingList,
          selectedIndex: selectedIndex,
        })
      }
    })
  },
  //车位列表点击事件
  onClickParkingListItem: function(event) {
    var selected = this.data.selectedIndex 
    var num = this.data.selectedNum
    if (selected[event.currentTarget.dataset.index]) {
      selected[event.currentTarget.dataset.index] = false
      num -= 1
      if (this.data.selectAll) {
        this.setData({
          selectAll: false
        })
      }
    } else {
      selected[event.currentTarget.dataset.index] = true
      num += 1
      if (!selected.includes(false)) {
        this.setData({
          selectAll: true
        })
      }
    }
    this.setData({
      selectedIndex: selected,
      selectedNum: num
    })
  },
  //全选按钮点击事件
  onClickSelectAll: function() {
    var selected = this.data.selectedIndex
    var num = 0
    if (this.data.selectAll) {  //全选->未选
      selected.fill(false, 0, selected.length)
    } else {  //未选->全选
      selected.fill(true, 0, selected.length)
      num = selected.length
    }
    this.setData({
      selectAll: !this.data.selectAll,
      selectedNum: num,
      selectedIndex: selected
    })
  },
  //搜索输入框变化触发事件
  onChangeSearchKeyword: function(event) {
    this.setData({
      searchKeyword: event.detail.value
    })
    this.setData({
      pageNum: 0,
      parkingList:[],
      selectedIndex: [],
      selectedNum: 0,
    })
    this.getAvailableParkings()
  },
  //控制车锁按钮点击事件
  onClickControlLock: function() {
    if(this.data.selectedNum > 0) {
      this.setData({
        controlFlag: true
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '请先选择控制的车锁',
      })
    }
    
  },
  //升降车锁操作
  controlCarlock: function(event) {
    var command = event.target.dataset.command
    if (command == 1) {
      wx.showLoading({
        title: '车锁正在升起...',
      })
    } else {
      wx.showLoading({
        title: '车锁正在降下...'
      })
    }
    var lockIds = ""
    this.data.parkingList.forEach((item, index) => {
      if (this.data.selectedIndex[index]) {
        lockIds += item.lockId
        lockIds += ","
      }
    })
    lockIds = lockIds.substr(0, lockIds.length-1)
    var data = {
      lock_ids: lockIds,
      command: command
    }
    AJAX("/lock/batch/control", data, function(res) {
      if (res.error_code == 2000) {
        wx.hideLoading()
        if (command == 1) {
          wx.showToast({
            title: '车锁已升起',
          })
        } else {
          wx.showToast({
            title: '车锁已降下',
          })
        }
      } else {
        wx.hideLoading()
        wx.showToast({
          icon: "none",
          title: res.error_message,
        })
      }
    })
  },
  //控制车锁对话框关闭按钮点击事件
  closeControlDialog: function() {
    this.setData({
      controlFlag: false
    })
  }
})