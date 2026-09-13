# 群晖 Docker 部署

`docker/compose.nas.yaml` 使用独立容器 `wire-pod-zh` 和命名卷
`wire-pod-zh-data`、`wire-pod-zh-images`。管理页面为 `http://NAS-IP:18080`。
HTTP、TLS、附加服务分别映射到 18081、18443、18084，以避开群晖常见端口。

此端口配置用于先运行和配置服务器。Vector 通常依赖局域网发现和标准 443
端口；直接映射到 18443 并不表示机器人已能连接。正式迁移时需另行配置
独立局域网 IP（如 macvlan）或适合现有网络的 TLS 转发与发现方式，并实机验证。
原机器人服务器和证书应保留，直到新服务器接入验证成功。

## 构建与启动

在源码根目录执行，`VERSION` 替换为实际源码提交号：

```sh
VERSION=<commit-sha>
docker build --build-arg COMMIT_SHA="$VERSION" -f dockerfile -t "wire-pod-zh:$VERSION" .
WIREPOD_VERSION="$VERSION" docker compose -p wire-pod-zh -f docker/compose.nas.yaml up -d
docker inspect --format '{{.State.Health.Status}}' wire-pod-zh
curl -f http://localhost:18080/ok
```

群晖若 PATH 中没有 Docker，可使用
`sudo -n /var/packages/ContainerManager/target/usr/bin/docker` 替代 `docker`。

## 更新与回退

更新前停止该容器，将两个命名卷的内容备份至独立备份目录，再启动旧版本，
然后构建新版本。保留旧镜像标签与备份。
将 `WIREPOD_VERSION` 指向目标提交再执行 `compose up -d` 即可切换镜像。
如果新版本改变了数据格式，回退时还需恢复与旧镜像对应的数据备份。
不要使用 `compose down -v`，它会删除持久化数据。

源码上传和构建应排除运行配置、机器人证书、会话、聊天记录和私钥。
Git 提交中不保存 API 密钥或实际运行数据。
