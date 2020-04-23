const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const getNowDate = date => {
  const year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let minute = date.getMinutes()
  month = month > 9 ? month : '0' + month
  day = day > 9 ? day : '0' + day
  hour = hour > 9 ? hour : '0' + hour
  minute = minute > 9 ? minute : '0' + minute
  // const second = date.getSeconds()
  return year + '/' + month + '/' + day + ' ' + hour + ':' + minute
}

const getDistance = (lat1, lng1, lat2, lng2) => {
  var radLat1 = lat1 * Math.PI / 180.0;
  var radLat2 = lat2 * Math.PI / 180.0;
  var a = radLat1 - radLat2;
  var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137; // EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000;
  return s;
}

const imgUrl="http://192.168.1.24:9898"
// const imgUrl = "https://paoner.lvtutech.com/aiyunpao/"
const request = (options) => {
  // let BaseUrl = "https://paoner.lvtutech.com/aiyunpao/"
  let BaseUrl='http://192.168.1.24:9898'
    return new Promise((resolve, reject)=>{
      if (!options.method) {
        options.method = "GET"
      }
      Object.assign(options, {
        url: BaseUrl + options.url,
        data:options.data,
        header:{
          "Content-Type":"application/json"
        },
        success: resolve,
        fail: reject,
        complete: (res)=>{
          // wx.hideLoading()
        },
      })
      // wx.showLoading({
      //   title: '玩命加载...',
      // })
      wx.request(options)
    })
}

//输入一个数值，返回数组项最接近的一项
const lookupNear = (array, value) => {
  // console.log(value)
  // 将原数组复制，不会影响原数组
  let arr = array.concat([]);
  arr.push(value);
  // 数据排序
  arr.sort((a, b) => {
    return a - b;
  });
  let index = arr.indexOf(value);
  // 当前项在数组第一项 / 最后一项，返回当前项的后一项 / 前一项
  if (index === 0) {
    return arr[index + 1];
  } else if (index === array.length - 1) {
    return arr[index - 1];
  }
  //   console.log(arr)
  // 当前项和前一项或者后一项比较，返回差值小的项
  //   console.log(arr[index - 1],arr[index],arr[index + 1])
  let resultIndex =
    arr[index] - arr[index - 1] > arr[index + 1] - arr[index] ?
    index + 1 :
    index - 1;
  //   console.log( arr[resultIndex],resultIndex)
  // return arr[resultIndex];
  return resultIndex
}

/*解决两个数相加精度丢失问题*/
const floatAdd=(a, b)=> {
  var c, d, e;
  if (undefined == a || null == a || "" == a || isNaN(a)) {
    a = 0;
  }
  if (undefined == b || null == b || "" == b || isNaN(b)) {
    b = 0;
  }
  try {
    c = a.toString().split(".")[1].length;
  } catch (f) {
    c = 0;
  }
  try {
    d = b.toString().split(".")[1].length;
  } catch (f) {
    d = 0;
  }
  e = Math.pow(10, Math.max(c, d));
  return (floatMul(a, e) + floatMul(b, e)) / e;
}
/*解决两个数相减精度丢失问题*/
const floatSub=(a, b)=> {
  var c, d, e;
  if (undefined == a || null == a || "" == a || isNaN(a)) {
    a = 0;
  }
  if (undefined == b || null == b || "" == b || isNaN(b)) {
    b = 0;
  }
  try {
    c = a.toString().split(".")[1].length;
  } catch (f) {
    c = 0;
  }
  try {
    d = b.toString().split(".")[1].length;
  } catch (f) {
    d = 0;
  }
  e = Math.pow(10, Math.max(c, d));
  return (floatMul(a, e) - floatMul(b, e)) / e;
}
/*解决两个数相乘精度丢失问题*/
const floatMul=(a, b)=> {
  var c = 0,
    d = a.toString(),
    e = b.toString();
  try {
    c += d.split(".")[1].length;
  } catch (f) {}
  try {
    c += e.split(".")[1].length;
  } catch (f) {}
  return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
}
/*解决两个数相除精度丢失问题*/
const floatDiv=(a, b)=> {
  var c, d, e = 0,
    f = 0;
  try {
    e = a.toString().split(".")[1].length;
  } catch (g) {}
  try {
    f = b.toString().split(".")[1].length;
  } catch (g) {}
  return c = Number(a.toString().replace(".", "")), d = Number(b.toString().replace(".", "")), floatMul(c / d, Math.pow(10, f - e));
}
const compareDate=(d1, d2)=> {
  //如果时间格式是正确的，那下面这一步转化时间格式就可以不用了
  var dateBegin = new Date(d1.replace(/-/g, "/")); //将-转化为/，使用new Date
  var dateEnd = new Date(d2.replace(/-/g, "/")); //将-转化为/，使用new Date
  // var dateBegin = new Date(d1); //将-转化为/，使用new Date
  // var dateEnd = new Date(d2); //将-转化为/，使用new Date
  var dateNow = new Date(); //获取当前时间

  var beginDiff = dateNow.getTime() - dateBegin.getTime(); //时间差的毫秒数       
  // var beginDayDiff = Math.floor(beginDiff / (24 * 3600 * 1000)); //计算出相差天数

  var endDiff = dateNow.getTime() - dateEnd.getTime(); //时间差的毫秒数
  // var endDayDiff = Math.floor(endDiff / (24 * 3600 * 1000)); //计算出相差天数    

  // a==>未开始  b==>已结束 c==>在时间段内
  if (beginDiff < 0) {
    return 'a'
  }
  if (endDiff > 0) {
    return 'b'
  }
  if (beginDiff > 0 && endDiff < 0) {
    return 'c'
  } else {
    return 'd'
  }
}

module.exports = {
  formatTime: formatTime,
  getNowDate: getNowDate,
  getDistance: getDistance,
  tool: request,
  imgUrl:imgUrl,
  lookupNear: lookupNear,
  floatAdd:floatAdd,
  floatSub:floatSub,
  floatMul:floatMul,
  floatDiv:floatDiv,
  compareDate:compareDate
}