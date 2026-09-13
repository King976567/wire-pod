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
