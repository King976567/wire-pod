var client = new HttpClient();

var botList = document.getElementById("botList");

getSDKInfo().then((jsonResp) => {
  if (!botList) {
    return;
  }
  for (var i = 0; i < jsonResp["robots"].length; i++) {
    var option = document.createElement("option");
    option.text = jsonResp["robots"][i]["esn"];
    option.value = jsonResp["robots"][i]["esn"];
    botList.add(option);
  }
}).catch((error) => {
  console.error('获取 SDK 信息失败：', error);
  alert("获取机器人列表失败。可能是尚未认证机器人，或之前认证的机器人当前未连接。");
  window.location.href = "/";
});

function connectSDK() {
  var botList = document.getElementById("botList");
  fetch("/api-sdk/conn_test?serial=" + botList.value)
    .then((response) => response.text())
    .then((response) => {
      if (response.includes("success")) {
        window.location.href = "./settings.html?serial=" + botList.value;
      } else {
        alert(response);
      }
    });
}
