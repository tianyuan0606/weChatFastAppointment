// components/customPickerView.js
/*
 *  自定义的时间选择器组件，用来选择一个时间段
 *  传入的参数
 *    minDurations
 *      desc：开始时间和结束时间的最小间隔，单位是毫秒, 默认为30分钟
 *      type：Number
 *      required: false
 *    firstStartTimestamp
 *      desc：最初的开始时间的时间戳，单位为毫秒
 *      require: false
 *    pickerHeight
 *      desc：picker组件的高度，单位为rpx
 *      require: true
 *  方法
 *    getSelectedTimePeriod
 *      desc：获取选择的时间段
 *      返回的参数：{
 *        startOfPeriod: startOfPeriod,
 *        endOfPeriod: endOfPeriod
 *      }
 */
import dayjs from '../../utils/dayjs.js'
//两个时间点之间的间隔，默认15分钟
const PERIODS_DIFF = 15 * 60 * 1000;
//用来记录之前选择的开始时间的索引
let lastStartTimePeriodIndex = 0;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    minDuration:{
      type: Number,
      value: 30 * 60 * 1000
    },
    firstStartTimestamp:{
      type: Number,
      observer(newVal,oldVal){
        this.generateTimePeriodsList(newVal)
      }
    },
    pickerHeight:{
      type:Number
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    pickerIndexes: [0,0],
    startTimePeriods:[],
    endTimePeriods:[],
    startTime: null,
    endTime: null
  },
  /**
   *  组件的生命周期
   */
  ready() {
    
  },
  /**
   * 组件的方法列表
   */
  methods: {
    bindChange: function (e) {
      const changedIndexed = e.detail.value;
      let startTimePeriodIndex = changedIndexed[0];
      //比对上一次开始时间段的索引值和本次开始时间段的索引值，判断是否开始时间发生了改变
      //如果开始时间发生了改变，更新结束时间段数组
      if(startTimePeriodIndex != lastStartTimePeriodIndex){
        lastStartTimePeriodIndex = startTimePeriodIndex;
        let startTimestamp = this.data.startTimePeriods[startTimePeriodIndex].timestamp;
        let endTimestamp = startTimestamp + this.data.minDuration;

        //更新结束时间段数组
        let endTimePeriods = this.generateTimePeriods(endTimestamp, { isStart: false });
        this.setData({
          endTimePeriods: endTimePeriods,
          pickerIndexes:[startTimePeriodIndex,0]
        });

        //向父组件传入选择的时间段
        this.getSelectedTimePeriod(this.data.pickerIndexes);
      } else {
        this.getSelectedTimePeriod(changedIndexed);
      }

    },
    //生成时间段列表
    generateTimePeriodsList(firstStartTimestamp){
      //获取首个开始时间点和结束时间点
      let firstEndTimestamp = firstStartTimestamp + this.data.minDuration;
      //生成开始时间段列表以及结束时间段列表
      let startTimePeriods = this.generateTimePeriods(firstStartTimestamp, { isStart: true })
      let endTimePeriods = this.generateTimePeriods(firstEndTimestamp, { isStart: false })
      console.log(firstStartTimestamp)
      this.setData({
        startTimePeriods: startTimePeriods,
        endTimePeriods: endTimePeriods,
        pickerIndexes: [0, 0]
      })
      //向父组件传入初始时间段
      this.getSelectedTimePeriod(this.data.pickerIndexes)
    },

    //获取选择的时间段并传给父组件
    getSelectedTimePeriod(pickerIndexes){
      let [startTimeIndex,endTimeIndex] = pickerIndexes
      //获取选择的时间段的开始时间和结束时间
      
      let startOfPeriod = this.data.startTimePeriods[startTimeIndex].timestamp,
          endOfPeriod = this.data.endTimePeriods[endTimeIndex].timestamp;
      this.triggerEvent('getSelectedTimePeriod',{
        startOfPeriod,endOfPeriod
      })
    },
    // 生成时间段数组
    generateTimePeriods(firstTimestamp,{isStart}){
      let timePeriods = [];
      //计算一共需要多少个时间段
      let periodsCount = 24 * 60 * 60 * 1000 / PERIODS_DIFF;
      let insertedTimestamp = firstTimestamp;
      for(let i = 0;i < periodsCount - 1;i++){
        let timestamp = insertedTimestamp;
        let timeDesc = dayjs(insertedTimestamp).format('HH:mm');

        //判断时间段输入本日还是次日
        let isTheSameDay = dayjs().isSame(timestamp, 'day');
        
        //如果属于次日的时间段，并且当前数组为开始时间，则不再往数组中添加时间段
        if(isTheSameDay == false){
          if (isStart == false || i == 0) {
            timeDesc = '次日' + timeDesc
          } else {
            break;
          }
        }

        let timePeriod = {
          timestamp,
          timeDesc
        }
        timePeriods.push(timePeriod)
        insertedTimestamp = insertedTimestamp + PERIODS_DIFF
      }
      return timePeriods
    }
  },

})
