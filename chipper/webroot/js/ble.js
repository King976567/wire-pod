const vectorEpodSetup = "https://wpsetup.keriganc.com";
let authEl = document.getElementById("botAuth");
let statusP = document.createElement("p");
let OTAUpdating = false;

const externalSetup = document.createElement("a");
externalSetup.href = vectorEpodSetup;
externalSetup.innerHTML = vectorEpodSetup;

function showBotAuth() {
  GetLog = false;
  toggleSections("section-botauth", "icon-BotAuth");
  checkBLECapability();
}

function toggleSections(showSection, icon) {
  const sections = ["section-intents", "section-log", "section-botauth", "section-version", "section-uicustomizer"];
  sections.forEach((section) => (document.getElementById(section).style.display = "none"));
  document.getElementById(showSection).style.display = "block";
  updateColor(icon);
}

function checkBLECapability() {
  updateAuthel("正在检查 Wire-Pod 是否可以直接使用蓝牙……");
  fetch("/api-ble/init")
    .then((response) => response.text())
    .then((response) => {
      if (response.includes("success")) {
        beginBLESetup();
      } else {
        showExternalSetupInstructions();
      }
    });
}

function showExternalSetupInstructions() {
  authEl.innerHTML = `
    <p>请在任意支持蓝牙的设备上打开以下网站设置 Vector。</p>
    <a href="${vectorEpodSetup}" target="_blank">${vectorEpodSetup}</a>
    <br>
    <small class="desc">注意：OSKR/dev 机器人可能会提示固件警告，可以忽略。</small>
  `;
}

function beginBLESetup() {
  authEl.innerHTML = `
    <p>1. 将 Vector 放在充电底座上。</p>
    <p>2. 连按两次顶部按钮，屏幕上应出现钥匙图标。</p>
    <p>3. 点击“开始扫描”，然后与 Vector 配对。</p>
    <button onclick="scanRobots(false)">开始扫描</button>
  `;
}

function reInitBLE() {
  fetch("/api-ble/disconnect").then(() => fetch("/api-ble/init").catch(() => {
    showExternalSetupInstructions();
  })).catch(() => fetch("/api-ble/init"));
}

function scanRobots(returning) {
  const disconnectButtonDiv = document.getElementById("disconnectButton");
  disconnectButtonDiv.innerHTML = `
    <button onclick="disconnect()">断开连接</button>
  `;
  updateAuthel("正在扫描……");
  fetch("/api-ble/scan", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" } })
    .then((response) => response.json())
    .then((parsed) => {
      authEl.innerHTML = returning ? "<p>配对码错误，正在重新扫描……</p>" : "";
      authEl.innerHTML += "<small>正在扫描……</small>";

      const buttonsDiv = document.createElement("div");
      parsed.forEach((robot) => {
        const button = document.createElement("button");
        button.innerHTML = robot.name;
        button.onclick = () => connectRobot(robot.id);
        buttonsDiv.appendChild(button);
      });

      const rescanButton = document.createElement("button");
      rescanButton.innerHTML = "重新扫描";
      rescanButton.onclick = () => {
        updateAuthel("正在重新初始化蓝牙并扫描……");
        reInitBLE().then(() => scanRobots(false));
      };

      updateAuthel("点击要配对的机器人。");
      authEl.appendChild(rescanButton);
      authEl.appendChild(buttonsDiv);
    }).catch(() => {
      updateAuthel("扫描失败，正在重新初始化蓝牙并扫描……");
      reInitBLE().then(() => scanRobots(false));
    });
}

function disconnect() {
  authEl.innerHTML = "正在断开连接……";
  OTAUpdating = false;
  fetch("/api-ble/stop_ota").then(() => fetch("/api-ble/disconnect").then(() => checkBLECapability())).catch(() => checkBLECapability());
}

function connectRobot(id) {
  updateAuthel("正在连接机器人……");
  fetch(`/api-ble/connect?id=${id}`)
    .then((response) => response.text())
    .then((response) => {
      if (response.includes("success")) {
        createPinEntry();
      } else {
        alert("连接失败，Wire-Pod 将重启并返回设置首页。");
        updateAuthel("正在等待 Wire-Pod 重启……");
        setTimeout(checkBLECapability, 3000);
      }
    }).catch(() => {
      alert("连接失败，Wire-Pod 将重启并返回设置首页。");
        updateAuthel("正在等待 Wire-Pod 重启……");
      setTimeout(checkBLECapability, 3000);
    })
}

function createPinEntry() {
  authEl.innerHTML = `
    <p>输入 Vector 屏幕上显示的配对码。</p>
    <input type="text" id="pinEntry" placeholder="在此输入配对码" maxlength="6">
    <br>
    <button onclick="sendPin()">发送配对码</button>
  `;
}

function sendPin() {
  const pin = document.getElementById("pinEntry").value;
  updateAuthel("正在发送配对码……");
  fetch(`/api-ble/send_pin?pin=${pin}`)
    .then((response) => response.text())
    .then((response) => {
      if (response.includes("incorrect pin") || response.includes("length of pin")) {
        updateAuthel("配对码错误，正在重新初始化蓝牙并扫描……");
        reInitBLE().then(() => scanRobots(true));
      } else {
        wifiCheck();
      }
    }).catch(() => {
      updateAuthel("发送配对码失败，正在重新初始化蓝牙并扫描……");
      reInitBLE().then(() => scanRobots(true));
    });
}

function wifiCheck() {
  fetch("/api-ble/get_wifi_status")
    .then((response) => response.text())
    .then((response) => {
      if (response === "1") {
        whatToDo();
      } else {
        scanWifi();
      }
    }).catch(() => {
      updateAuthel("检查 Wi-Fi 状态失败，正在重新初始化蓝牙并扫描……");
      reInitBLE().then(() => scanRobots(true));
    });
}

function scanWifi() {
  authEl.innerHTML = "正在扫描 Wi-Fi 网络……";
  fetch("/api-ble/scan_wifi")
    .then((response) => response.json())
    .then((networks) => {
      authEl.innerHTML = `
        <p>选择要让 Vector 连接的 Wi-Fi 网络。</p>
        <button onclick="scanWifi()">重新扫描</button>
        <br>
        ${networks
          .map(
            (network) =>
              network.ssid && `<button onclick="createWiFiPassEntry('${network.ssid}', '${network.authtype}')">${network.ssid}</button>`
          )
          .join("")}
      `;
    }).catch(() => {
      updateAuthel("扫描 Wi-Fi 网络失败，正在重新初始化蓝牙并扫描……");
      reInitBLE().then(() => scanRobots(true));
    });
}

function createWiFiPassEntry(ssid, authtype) {
  authEl.innerHTML = `
    <button onclick="scanWifi()">重新扫描</button>
    <p>请输入 Wi-Fi 密码：${ssid}</p>
    <input type="text" id="passEntry" placeholder="密码">
    <br>
    <button onclick="connectWifi('${ssid}', '${authtype}')">连接 Wi-Fi</button>
  `;
}

function connectWifi(ssid, authtype) {
  const password = document.getElementById("passEntry").value;
  authEl.innerHTML = "正在将 Vector 连接到 Wi-Fi……";
  fetch(`/api-ble/connect_wifi?ssid=${ssid}&password=${password}&authType=${authtype}`)
    .then((response) => response.text())
    .then((response) => {
      if (!response.includes("255")) {
        alert("连接失败，密码可能不正确");
        createWiFiPassEntry(ssid, authtype);
      } else {
        whatToDo();
      }
    }).catch(() => {
      updateAuthel("连接 Wi-Fi 失败，正在重新初始化蓝牙并扫描……");
      reInitBLE().then(() => scanRobots(true));
    });
}

function checkFirmware() {
  fetch("/api-ble/get_firmware")
    .then((response) => response.text())
    .then((response) => {
      const splitFirmware = response.split("-");
      console.log(splitFirmware);
    }).catch(() => {
      updateAuthel("获取固件版本失败，正在重新初始化蓝牙并扫描……");
      reInitBLE().then(() => scanRobots(true));
    });
}

function whatToDo() {
  fetch("/api-ble/get_robot_status")
    .then((response) => response.text())
    .then((response) => {
      switch (response) {
        case "in_recovery_prod":
          doOTA("local");
          break;
        case "in_recovery_dev":
          doOTA("http://wpsetup.keriganc.com:81/1.6.0.3331.ota");
          break;
        case "in_firmware_nonep":
          showRecoveryInstructions();
          break;
        case "in_firmware_dev":
          showDevWarning();
          break;
        case "in_firmware_ep":
          showAuthButton();
          break;
      }
    });
}

function showRecoveryInstructions() {
  authEl.innerHTML = `
    <p>1. 将 Vector 放在充电底座上。</p>
    <p>2. 按住顶部按钮 15 秒，机器人会关机；继续按住，直到它重新开机。</p>
    <p>3. 点击“开始扫描”，然后与 Vector 配对。</p>
    <button onclick="scanRobots(false)">开始扫描</button>
  `;
  alert("你的机器人固件不适用于 Wire-Pod。请按照说明将机器人置于恢复模式。");
}

function showDevWarning() {
  alert("你的机器人是 Dev 机器人。认证前请先完成“配置 OSKR/dev 解锁机器人”步骤。如果已经完成，可以忽略此提示。");
  showAuthButton();
}

function showAuthButton() {
  authEl.innerHTML = `<button onclick="doAuth()">开始认证</button>`;
}

function doOTA(url) {
  updateAuthel("正在开始 OTA 更新……");
  fetch(`/api-ble/start_ota?url=${url}`)
    .then((response) => response.text())
    .then((response) => {
      if (response.includes("success")) {
        OTAUpdating = true;
        const interval = setInterval(() => {
          fetch("/api-ble/get_ota_status")
            .then((otaResponse) => otaResponse.text())
            .then((otaResponse) => {
              updateAuthel(otaResponse);
              if (otaResponse.includes("complete")) {
                alert("OTA 更新完成。机器人重启后，请按步骤重新与 Wire-Pod 配对，随后将完成认证和设置。");
                OTAUpdating = false;
                clearInterval(interval);
                checkBLECapability();
              } else if (otaResponse.includes("stopped") || !OTAUpdating) {
                clearInterval(interval);
              }
            });
        }, 2000);
      } else {
        whatToDo();
      }
    });
}

function updateAuthel(update) {
  authEl.innerHTML = `<p>${update}</p>`;
}

function doAuth() {
  updateAuthel("正在认证你的 Vector……");
  fetch("/api-ble/do_auth")
    .then((response) => response.text())
    .then((response) => {
      if (response.includes("error")) {
        showAuthError();
      } else {
        showWakeOptions();
      }
    });
}

function showAuthError() {
  updateAuthel("认证失败，请在约 15 秒后重试。如果再次失败，请查看故障排查指南：");
  const troubleshootingLink = document.createElement("a");
  troubleshootingLink.href = "https://github.com/kercre123/wire-pod/wiki/Troubleshooting#error-logging-in-the-bot-is-likely-unable-to-communicate-with-your-wire-pod-instance";
  troubleshootingLink.target = "_blank";
  troubleshootingLink.innerText = "https://github.com/kercre123/wire-pod/wiki/Troubleshooting";
  authEl.appendChild(document.createElement("br"));
  authEl.appendChild(troubleshootingLink);
}

function showWakeOptions() {
  updateAuthel("认证成功！请选择唤醒 Vector 的方式。");
  authEl.innerHTML += `
    <button onclick="doOnboard(true)">使用唤醒动画唤醒（推荐）</button>
    <br>
    <button onclick="doOnboard(false)">立即唤醒，不播放唤醒动画</button>
  `;
}

function doOnboard(withAnim) {
  updateAuthel("正在引导设置机器人……");
  fetch(`/api-ble/onboard?with_anim=${withAnim}`).then(() => {
    fetch("/api-ble/disconnect");
    updateAuthel("Vector 已完成设置！可以在“机器人设置”中继续配置。");
    const disconnectButtonDiv = document.getElementById("disconnectButton");
    disconnectButtonDiv.innerHTML = `
      <button onclick="checkBLECapability()">返回配对说明</button>
    `;
  });
}
