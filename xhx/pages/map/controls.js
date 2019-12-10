const app = getApp()
const screenWidth = app.globalData.screenInfo.screenWidth;
//高德地图导航相关
import amapFile from '../../utils/amap-wx.js'
const myAmap = new amapFile.AMapWX({
  key: 'a801c56d900eef247f46b8012c5e42a9'
});
//控件图标文件路径
const MapcarIcon = "/assets/icon/ic_home_car.png",
  MappriceIcon = "/assets/icon/ic_home_money.png",
  MapcurrentPositionIcon = "/assets/icon/ic_home_position.png",
  MappersonIcon = "/assets/icon/home_mine@3x.png",
  MapRefreshIcon = "/assets/icon/ic_home_refresh.png";
//makes图标文件
const staticCarIcon = "/assets/icon/ic_map_gray.png",
  centorICon = "/assets/icon/ic_parting_map.png",
  currentcarIcon = '/assets/icon/ic_map_check.png',
  activeCarIcon = '/assets/icon/ic_map_car.png',
  pricecarIcon = '/assets/icon/ic_map_money.png';
  //标记点图标文件
const contenrLogo ="/assets/icon/ic_map_heart.png",
arrowIcon ="/assets/icon/ic_map_start.png";
let timer = null;
let currentPositionControl = {
  id: 1,
  position: {
    width: 60,
    height: 60,
    left: 20,
    top: 150
  },
  clickable: true,
  iconPath: MapcurrentPositionIcon
}
let refreshControl = {
  id: 2,
  position: {
    width: 60,
    height: 60,
    left: screenWidth - 80,
    top: 220
  },
  clickable: true,
  iconPath: MapRefreshIcon
}
let priceControl = {
  id: 3,
  position: {
    width: 60,
    height: 60,
    left: screenWidth - 80,
    top: 150
  },
  clickable: true,
  iconPath: MappriceIcon

}
let carControl = {
  id: 4,
  position: {
    width: 60,
    height: 60,
    left: screenWidth - 80,
    top: 150
  },
  clickable: true,
  iconPath: MapcarIcon
}
let personalControl = {
  id: 5,
  position: {
    width: 60,
    height: 60,
    left: 20,
    top: 220
  },
  clickable: true,
  iconPath: MappersonIcon
}
//设置图标
let setMarkers = function(currentParkinIndex, markerType, parkingList,nowCenter) {
  let markersList = []
  for (let [index, item] of parkingList.entries()) {
    let markerItem = {}
    let content;
    let iconPath;
    if (item.type == 0) { //静态车场只会显示灰色状态
      // content = item.show == 1 ? item.left_amount : item.total_amount;
      iconPath = staticCarIcon
    } else if (item.type == 1 || item.type == 2) {
      // content = markerType == 1 ? item.parking_fee + ' 元' : item.reservable_amount + ' 个';
      iconPath = currentParkinIndex == index ? currentcarIcon : (markerType == 1 ? pricecarIcon : activeCarIcon)
    }
    content = markerType == 1 ? item.parking_fee + '元' : item.reservable_amount + '个';
    content = content.toString();

    let calloutItem = {
      content: content,
      fontSize: 12,
      color: "#000000",
      textAlign: "center",
      display: 'ALWAYS',
      padding: 3,
      borderRadius: 5,
      borderWidth: 3,
      borderColor: 'white'
    }
    let x = - content.length * 3.2;
    let y = - 30;
    let labelItem = {
      content: content,
      fontSize: 12,
      color: "#000000",
      textAlign: "center",
      anchorX: x,
      anchorY: y,
    }
    markerItem = {
      iconPath: iconPath,
      id: index,
      latitude: item.lat,
      longitude: item.lng,
      width: 32,
      height: 40
    }
    if (app.globalData.system.phoneType == 'iOS'){
      markerItem = {...markerItem,label:labelItem}
    } else {
      markerItem = { ...markerItem, callout: calloutItem }

    }
    markersList.push(markerItem)
  }
  return markersList;
}
let getDistance = function(lat1, lng1, lat2, lng2) {
  let radLat1 = parseFloat(lat1) * Math.PI / 180.0;
  let radLat2 = parseFloat(lat2) * Math.PI / 180.0;
  let a = radLat1 - radLat2;
  let b = parseFloat(lng1) * Math.PI / 180.0 - parseFloat(lng2) * Math.PI / 180.0;
  let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137; // EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000;
  return s;
}
//设置路线
let setPolyline = function(startLat, startLng, nowLat, nowLng, _this) {
  let distance = getDistance(startLat, startLng, nowLat, nowLng);
  //如果导航距离大于200km，不做导航
  if(distance > 200){
    let polyline = [{
      points: [],
      color: "#418DF9DD",
      width: 4
    }];
    _this.setData({
      polyline: polyline
    })
    wx.showToast({
      title: '距离太远，为了流畅性起见，不进行距离导航',
      icon: 'none',
      duration:1000
    })
    return;
  }
  myAmap.getDrivingRoute({
    origin: startLng + "," + startLat,
    destination: nowLng + "," + nowLat,
    success: function(data) {
      let steps = data.paths[0].steps;
      let polylinePoints = [];
      for (let i = 0; i < steps.length; i++) {
        let rawText = steps[i].polyline;
        let tempList = rawText.split(";")
        let tempListLength = tempList.length
        for (let j in tempList) {
          var item = tempList[j].split(",")
          polylinePoints.push({
            longitude: item[0],
            latitude: item[1]
          })
        }
      }
      let polyline = [{
        points: polylinePoints,
        color: "#418DF9DD",
        width: 4
      }];
      _this.setData({
        polyline: polyline
      })
    },
    fail: function(errmsg){
      console.log(errmsg)
    }
  })
}
//处理数据组
let hadleArrary = function(parkingList) {
  let ccArrary = [],
    cwArrary = [],
    newArrary = {};
  for (let [index, item] of parkingList.entries()) {
    if (item.type == 2) {
      cwArrary.push(item)
    } else if (item.type == 1) {
      ccArrary.push(item)
    }
  }
  newArrary.ccArrary = ccArrary //约车场
  newArrary.cwArrary = cwArrary; //约车位
  newArrary.all = parkingList; //所有停车场
  return newArrary;
}
//预约未支付的倒计时处理
let countappointNopay = function(_this, startTime) {
  let timeLen = parseInt((new Date().getTime() - startTime) / 1000);
  if (timer != null) {
    clearTimeout(timer);
    timer = null;
  }
}
//倒计时处理函数
let countDown = function(startTime) {
  //0是停车中倒计时1是入场倒计时
  let countTime = {}
  let len= parseInt((new Date().getTime() - startTime) / 1000)
  let hour = Math.floor(len / 3600);
  let miute = Math.floor((len % 3600) / 60);
  countTime.hour = hour < 10 ? '0' + hour : hour;
  countTime.miute = miute < 10 ? '0' + miute : miute
  let seconds = len % 60
  countTime.seconds = seconds < 10 ? '0' + seconds : seconds;
  return countTime;
}
//停车中倒计时处理
let countParking = function (clear,_this, types, time) {
  //types==0停车时长倒计时types==1入场倒计时
  if (clear == 1) {
    clearTimeout(timer);
    timer = null;
    return false;
  }
  if (timer != null) {
    clearTimeout(timer);
    timer = null;
  }
  if (types == 0) {
    let conuttimeFirst = countDown(time)
    _this.setData({
      noteShowFlag: true,
      noteMessage: `您已经停车${conuttimeFirst.hour}小时${conuttimeFirst.miute}分`
    })
    timer = setInterval(() => {
      let countTime = countDown(time,types);
      _this.setData({
        noteShowFlag: true,
        noteMessage: `您已经停车${countTime.hour}小时${countTime.miute}分`
      })
    }, 60000)
  } else if (types==1){
    let yyDate = new Date(time);
    let hour = yyDate.getHours();
    let miute=yyDate.getMinutes();
    _this.setData({
      noteShowFlag: true,
      noteMessage: `车位预约成功,入场时间${hour}点${miute}分`
    })
  }
}

let mapControls = {
  currentPositionControl: currentPositionControl,
  refreshControl: refreshControl,
  priceControl: priceControl,
  carControl: carControl,
  setMarkers: setMarkers,
  personalControl: personalControl,
  setPolyline: setPolyline,
  hadleArrary: hadleArrary,
  countappointNopay: countappointNopay,
  countParking: countParking
}
export default mapControls