var postUrl = '[incoming webhook url]'
var username = '[bot name]';  // 通知時に表示されるユーザー名
var icon = ':icon:';

function post(message) {
  var jsonData =
  {
     "username" : username,
     "icon_emoji": icon,
     "text" : message
  };
  var payload = JSON.stringify(jsonData);

  var options =
  {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : payload
  };

  UrlFetchApp.fetch(postUrl, options);
}


//メンバー・役割のデータをスプレッドシートから取得
var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
var lastrow = sheet.getLastRow();

//1行目はタイトルなので
var members = sheet.getSheetValues(2, 1, lastrow-1, 1);  //データ行のみを取得する
var roles = sheet.getSheetValues(2, 2, lastrow-1, 1); //データ行のみを取得する

//メンバーに当番を割当ててSlackで通知する
function notifyCleaningRole() {

  //平日のみ実行
  var currentDate = new Date();
  var weekday = currentDate.getDay();
  if (weekday == 0 || weekday == 6) {
    return;
  }
  //祝日は実行しない
  var calendar = CalendarApp.getCalendarById('ja.japanese#holiday@group.v.calendar.google.com');
  if (calendar.getEventsForDay(currentDate, {max: 1}).length > 0) {
    return;
  } 

  //本日の当番を割り当てる
  var msg = "";
  var todaysRoles = rotate(roles);
  for(var i = 0; i < todaysRoles.length; i++){
    msg = msg + ">" + (members[i]+ "　　　　　").slice(0,4) + "： " + todaysRoles[i] + "\n";
    //割り当てた結果をスプレッドシートにも反映させる
    sheet.getRange(i+2, 2).setValue(todaysRoles[i]);
  }

  post("@channel\n本日の掃除当番:dusty_stick:\n\n \n" + msg + "");
}

//配列の要素を後ろにずらして、最後の要素を先頭に移動する
function rotate(array){
  array.unshift(array[array.length-1])
  array.pop();
  return array;
}

