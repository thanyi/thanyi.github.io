---
title: Frp内网穿透实现远程桌面
url: /2022/04/09/023frp内网穿透实现远程桌面/
date: 2022-04-09T01:59:21.000Z
lastmod: 2022-05-19T12:04:01.532Z
description: 最近换了一个小电脑（也不是换了一个电脑，是终于把我的电脑系统换回windows了呜呜呜呜，windows真好我想说） 然后就想要把我的大电脑就放在宿舍用了，平时用小电脑出门就好了，于是在v2ex网站上找到了这个方法： 公网服务器 + frp内网穿透
tags:
  - 技术
  - frp
categories:
  - 技术
---

## 前言 {#前言}

最近换了一个小电脑（也不是换了一个电脑，是终于把我的电脑系统换回windows了呜呜呜呜，windows真好我想说）

然后就想要把我的大电脑就放在宿舍用了，平时用小电脑出门就好了，于是在v2ex网站上找到了这个方法：

公网服务器 + frp内网穿透

### 前置条件 {#前置条件}

- 一台vps服务器：这里我用的是腾讯云轻量，理论上来说只要一个有公网ip的服务器就好了
- frp应用包：从github下载：<https://github.com/fatedier/frp>
- 一点linux知识

## 开始 {#开始}

### 下载 {#下载}

首先我们进行对github包的下载：

![image-20220409101200243](/2022/04/09/023frp%E5%86%85%E7%BD%91%E7%A9%BF%E9%80%8F%E5%AE%9E%E7%8E%B0%E8%BF%9C%E7%A8%8B%E6%A1%8C%E9%9D%A2/image-20220409101200243.png)

当然如果你是用linux连接linux那当我没说

一般的腾讯云都是x64结构的

下载下来的包都是有客户端和服务端的部分

> - “frps”、”frps\_full.ini”、”frps.ini”是放在服务器端运行的可执行文件和配置文件。
> - “frpc”、”frpc\_full.ini”、”frpc.ini”是放在客户端端运行的可执行文件和配置文件。

### 服务器端配置 {#服务器端配置}

进入服务器对我们下载的包进行解压


```bash
tar -zxvf <压缩包名字>
```


如果你不知道压缩包该放哪可以放在/opt 路径下


```bash
mv <压缩包名字> /opt
```


然后我们进行配置：对frps.ini 进行修改：


```text
[common]
bind_addr = 0.0.0.0
bind_port = 7000
token = 12310086

dashboard_port = 7500
dashboard_user = admin
dashboard_pwd = admin123
```


参数：

- bind\_addr是我们表示服务器允许从任何ip来的请求
- bind\_port是规定端口
- token是可以当做服务器的连接密钥，需要这个东西
- 剩下的dashboard相关的是面板展示，可有可无

修改好了直接运行frps执行文件就好了

如果你想将它放在后台，那建议你使用nohup命令


```bash
nohup ./frps -c ./frps.ini &
```


### 客户端配置 {#客户端配置}

同理，下载github后进行配置

对frpc.ini 进行配置


```text
[common]
server_addr = <服务器ip>
server_port = 7000
token=12310086

[RDP]
type = tcp
local_ip = 127.0.0.1
local_port = 3389
remote_port = 33389
```


然后运行这个程序


```bat
frpc.exe -c frpc.ini
```


后面如果有success就是成功了

> 注意：一定要在这个时候进行服务器的防火墙设置

## 开始使用 {#开始使用}

在客户端进行使用的时候是这样的：

![image-20220414121931052](/2022/04/09/023frp%E5%86%85%E7%BD%91%E7%A9%BF%E9%80%8F%E5%AE%9E%E7%8E%B0%E8%BF%9C%E7%A8%8B%E6%A1%8C%E9%9D%A2/image-20220414121931052.png)

ip就是我们自己的服务器的公网ip

> 记得在被控制端的电脑上进行设置，并且只有windows专业版的电脑才可以设置！
