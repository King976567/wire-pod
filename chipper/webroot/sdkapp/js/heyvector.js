async function triggerHeyVector() {
  const statusDiv = document.getElementById("heyVectorStatus");
  statusDiv.innerHTML = "<p>正在触发 Hey Vector……</p>";
  
  try {
    const response = await fetch("/api-sdk/trigger_wake_word?serial=" + esn, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (!response.ok) {
      throw new Error("触发唤醒词失败");
    }
    
    const result = await response.text();
    
    if (result.includes("success") || result.includes("ok")) {
      statusDiv.innerHTML = "<p style='color: var(--fg-color);'>Hey Vector 已成功触发！</p>";
    } else {
      throw new Error(result || "未知错误");
    }
    
    setTimeout(() => {
      statusDiv.innerHTML = "";
    }, 5000);
    
  } catch (error) {
    console.error("触发 Hey Vector 时出错：");
    
    setTimeout(() => {
      statusDiv.innerHTML = "";
    }, 5000);
  }
}
