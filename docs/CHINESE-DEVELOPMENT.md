# 中文化开发记录

当前开发基线：

- 上游仓库：`https://github.com/kercre123/wire-pod`
- 基线提交：`347c45f7a4dba9adba7fa003c08248d301f19393`
- 本地分支：`chinese-ui`
- 语音识别：官方已包含 `zh-CN` Vosk 模型支持

## Windows 开发方式

官方 `setup.sh` 面向 Linux/macOS。Windows 上推荐使用 WSL2 或 Docker Desktop 运行完整服务；网页汉化和 Go 代码修改可以直接在 Windows 工作区完成。

开发顺序：

1. 先复制 `chipper/webroot` 到独立备份，逐页翻译 HTML 文本和 JavaScript 提示语。
2. 保持 API 路径、字段名和 DOM id 不变，避免前后端不兼容。
3. 在 WSL2/Docker 中启动官方后端，用浏览器验证中文页面、机器人连接、Vosk `zh-CN` 和配置保存。
4. 每项改动单独提交，便于回滚和与上游同步。

## 注意事项

- 官方前端和后端必须使用同一提交附近的版本。
- 配置、机器人认证证书、Vosk 模型属于运行数据，不应提交到 Git。
- 当前服务器的中文前端可以作为翻译参考，但不应直接覆盖官方最新版，需逐个核对 API。

## 国产模型和中转站

知识库设置中的“自定义”使用 OpenAI 兼容接口格式，填写 API 密钥、接口地址和模型名称即可。接口地址应填写到 `/v1` 这一层，例如：

- DeepSeek：`https://api.deepseek.com/v1`，模型 `deepseek-chat`
- 通义千问：`https://dashscope.aliyuncs.com/compatible-mode/v1`，模型 `qwen-plus`
- 智谱：`https://open.bigmodel.cn/api/paas/v4`，模型 `glm-4-flash`
- Kimi：`https://api.moonshot.cn/v1`，模型 `moonshot-v1-8k`
- SiliconFlow：`https://api.siliconflow.cn/v1`，模型按平台实际名称填写

中转站选择“手动填写 / 中转站”，填写中转站提供的 `/v1` 地址和模型名。开启自定义 TTS 前，需要确认中转站同时支持 OpenAI 兼容的 `/audio/speech` 接口；不支持时保持关闭，让机器人使用内置语音。
