export const formatTimeStamp = function (timeStamp) {
  let newTime = ''
  let date = new Date(timeStamp)
  let year = date.getFullYear() + ''
  let month = date.getMonth() + 1 + ''
  let d = date.getDate() + ''
  let hours = date.getHours() + ''
  let minutes = date.getMinutes() + ''
  let seconds = date.getSeconds() + ''
  let milliSeconds = date.getMilliseconds() + ''
  month = ('00' + month).substr(month.length)
  d = ('00' + d).substr(d.length)
  hours = ('00' + hours).substr(hours.length)
  seconds = ('00' + seconds).substr(seconds.length)
  minutes = ('00' + minutes).substr(minutes.length)
  milliSeconds = ('00' + milliSeconds).substr(milliSeconds.length)
  newTime = year + '-' + month + '-' + d + ' ' + hours + ':' + minutes + ':' + seconds + ':' + milliSeconds
  return newTime
}
/**
 * HH:mm型
 */
export const formatHm = function(timeStamp){
  let date = new Date(timeStamp);
  let hours = ('00'+ date.getHours()).substr(-2);
  let minutes = ('00' + date.getMinutes()).substr(-2);
  return hours+":"+minutes;
}