// Display labels only. Keep the stored location and time-zone identifiers intact.
function formatRobotLocation(value) {
  if (!value) return "未设置";
  const cities = {
    beijing: "北京", shanghai: "上海", qingdao: "青岛", guangzhou: "广州",
    shenzhen: "深圳", tianjin: "天津", chongqing: "重庆", chengdu: "成都",
    hangzhou: "杭州", nanjing: "南京", suzhou: "苏州", wuhan: "武汉",
    "xi'an": "西安", xian: "西安", jinan: "济南", ningbo: "宁波",
    xiamen: "厦门", fuzhou: "福州", zhengzhou: "郑州", changsha: "长沙",
    shenyang: "沈阳", dalian: "大连", harbin: "哈尔滨", kunming: "昆明",
    "hong kong": "香港", macau: "澳门", macao: "澳门", taipei: "台北",
  };
  const match = String(value).trim().match(/^([^,]+)(?:,\s*(?:China|CN|中国))?$/i);
  const city = match && cities[match[1].trim().toLowerCase()];
  return typeof city === "string" ? "中国·" + city : String(value);
}

function showCurrentTimeZone(select, value) {
  // Older releases offered this invalid identifier for Auckland.
  const zone = value === "Australia/Auckland" ? "Pacific/Auckland" : value;
  select.querySelectorAll("option[data-current-timezone]").forEach((option) => option.remove());
  let option = Array.from(select.options).find((item) => item.value === zone);
  if (!option) {
    option = document.createElement("option");
    option.value = zone || "";
    option.textContent = zone ? "其他时区（" + zone + "）" : "未设置，请选择时区";
    option.dataset.currentTimezone = "true";
    select.appendChild(option);
  }
  select.value = option.value;
  return option.textContent;
}

function selectSettingsRadio(id) {
  const input = document.getElementById(id);
  if (input) input.checked = true;
}
