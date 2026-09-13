# N1 原生部署

N1 使用 Armbian / Debian 12、ARM64，由 systemd 直接运行 Wire-Pod。
使用系统通过 DHCP 获取的局域网地址，服务直接监听 80、443、8080、8084；
Escape Pod 模式通过 mDNS 发布 `escapepod.local`。
管理页面为 `http://N1-IP:8080/`。

## 当前目录布局

- 程序：`/opt/wire-pod/releases/636166d`
- 当前版本链接：`/opt/wire-pod/current`
- 持久化数据：`/var/lib/wire-pod`
- Vosk 运行库：`/opt/wire-pod/libvosk`
- 独立 Go 1.22.4 ARM64 工具链：`/opt/wire-pod/tools/go`
- SDK 配置链接：`/opt/wire-pod/.anki_vector` → `/var/lib/wire-pod/anki_vector`
- 服务：`/etc/systemd/system/wire-pod.service`，模板在 `deploy/wire-pod-n1.service`

程序目录中的以下运行路径链接到 `/var/lib/wire-pod` 下对应位置：
`certs`、`stt`、`vosk`、`whisper.cpp`、`vector-cloud/build`、
`chipper/jdocs`、`chipper/plugins`、`chipper/session-certs`、`chipper/webroot/sessions`，
以及 `chipper` 下的 `apiConfig.json`、`botConfig.json`、`customIntents.json`、
`openaiChats.json`、`pico.key`、`useepod`。

本次按用户要求全新安装，未迁移旧配置和机器人认证资料，旧程序目录已清理。
仅复用通用 Vosk 运行库与语音模型。已初始化 `vosk / zh-CN`、Escape Pod、443。
机器人需要重新认证；AI 服务地址、模型和 API 密钥需在页面中配置。

## 运维与更新

```sh
systemctl status wire-pod
journalctl -u wire-pod --since '5 minutes ago'
curl -f http://127.0.0.1:8080/ok
```

后续更新将 Git 源码归档解压到新的 releases 子目录，在 N1 编译，
为上述运行路径建立指向现有持久化数据的链接，然后停止服务、切换 current、启动服务。
运行数据和机器人证书不得打包进 Git 源码归档。
更新前根据用户的数据保留要求处理备份，切勿删除 `/var/lib/wire-pod` 来更新程序。

编译命令（在新版本的 chipper 目录执行，将 VERSION 替换为实际源码提交号）：

```sh
export CGO_ENABLED=1
export CGO_CFLAGS=-I/opt/wire-pod/libvosk
export CGO_LDFLAGS='-L/opt/wire-pod/libvosk -lvosk -ldl -lpthread'
export LD_LIBRARY_PATH=/opt/wire-pod/libvosk
GOMAXPROCS=2 /opt/wire-pod/tools/go/bin/go build -p 2 -tags nolibopusfile \
  -ldflags "-s -w -X github.com/kercre123/wire-pod/chipper/pkg/vars.CommitSHA=$VERSION" \
  -o chipper ./cmd/vosk
```

验收包括：服务开机自启、重启后正常运行、中文页面、语音模型加载、
`escapepod.local` 解析到 N1、标准 443 的 TLS 握手。
服务器检查通过后，还需用户在机器人端完成激活和语音实测。
