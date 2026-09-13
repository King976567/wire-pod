function updateSSHStatus(statusString) {
  setupStatus = document.getElementById("oskrSetupProgress");
  setupStatus.innerHTML = "";
  setupStatusP = document.createElement("p");
  setupStatusP.innerHTML = statusString;
  setupStatus.appendChild(setupStatusP);
}

function doSSHSetup() {
  const ip = document.getElementById("sshIp").value;
  const key = document.getElementById("sshKeyFile").files[0];

  if (ip && key) {
    const formData = new FormData();
    formData.append("key", key);
    formData.append("ip", ip);

    fetch("/api-ssh/setup", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      .then((response) => {
        if (response.includes("running")) {
          document.getElementById("oskrSetup").style.display = "none";
          updateSSHSetup();
          return;
        } else {
          updateSSHStatus(response);
        }
      });
  } else {
    updateSSHStatus("请输入 IP 地址并上传密钥。");
  }
}

function updateSSHSetup() {
  interval = setInterval(function () {
    fetch("/api-ssh/get_setup_status")
      .then((response) => response.text())
      .then((response) => {
        statusText = response;
        if (response.includes("done")) {
          updateSSHStatus(
            "文件传输完成！请使用上方的认证区域完成机器人设置，机器人随后应会进入引导界面。"
          );
          document.getElementById("oskrSetup").style.display = "block";
          clearInterval(interval);
        } else if (response.includes("error")) {
          resp = response;
          if (response.includes("no route to host")) {
            resp =
              "Wire-Pod 无法连接机器人。请确认机器人运行的是 OSKR/dev 固件，并且与 Wire-Pod 位于同一网络，同时检查 IP 地址是否正确。";
          }
          updateSSHStatus(resp);
          clearInterval(interval);
          document.getElementById("oskrSetup").style.display = "block";
          return;
        } else if (response.includes("not running")) {
          updateSSHStatus("正在开始 SSH 传输……");
        } else {
          updateSSHStatus(response);
        }
      });
  }, 500);
}
