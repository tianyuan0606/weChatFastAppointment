// pages/parkinglist/parkinglist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchBy: [{
      title: "按车位查询",
      imagePath: "/assets/icon/mine_search_p@3x.png"
    }, {
      title: "按时段查询",
      imagePath: "/assets/icon/mine_search_t@3x.png"
    }]
  },

  onSearchTypeClicked(e) {
    console.log(e.target);
    if (e.target.id === "0") {
      wx.navigateTo({
        url: '../parkingsearchbyid/parkingsearchbyid',
      });
    } else if (e.target.id === "1") {
      wx.navigateTo({
        url: '../parkingsearchbytime/parkingsearchbytime',
      });
    }
  }
})