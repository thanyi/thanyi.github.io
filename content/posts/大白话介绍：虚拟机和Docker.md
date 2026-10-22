---
title: 大白话介绍：虚拟机和Docker
url: /posts/vm-and-docker/
date: 2026-10-22T11:54:20+08:00
description: 从云厂商为什么用虚拟机售卖实例讲起，对比虚拟机与 Docker 容器的隔离方式、架构差异，并解释 namespace 与 cgroup 的隔离和限额原理。
tags: ["虚拟机", "Docker", "Linux"]
categories: ["学习"]
draft: false
---

和老板谈论之后，给我提供了课后问题，为什么ecs都是VM虚拟机？为什么不用基于container的虚拟机？
正好借此机会总结归纳一下这两种虚拟机的区别，以下是我随便在网上抓的图。

![虚拟机与容器对比图](/images/vm-and-docker/vm-vs-container.png)

## 虚拟机

虚拟机可以说是基于虚机的实例。

虚拟机模拟整个系统的硬件环境，有着自己的操作系统内核。我们在云厂商进行实例申请的时候，都是虚拟机的实例而不是基于docker的实例。这也是我被问到的问题。

> 其实仔细一想都能明白，对于一个对外售卖虚拟机服务的云厂商来说，不可能使用docker这种实例来售卖，万一有黑客通过虚拟机逃逸手段，那不是就会让其能够访问其他用户了吗？
> 这样从一个商业企业来说带来的后果是不可估计的，用基于虚机的实例，就能较好的阻挡这个问题。因为虚机的隔离性，哪怕真的存在虚拟机逃逸行为，也不可能从一个虚机逃到另一个虚机。

基于虚机的实例的核心组件包括：
- Guest OS：一个真正的OS系统，包括Linux或者Windows这样的操作系统，和平时真正运行在硬件上的操作系统没有区别。
- Hypervisor：虚拟机监控器，Hypervisor在Guest OS和真正的操作系统之间。对于上层的Guest OS提供CPU、内存、文件系统等一切硬件的虚拟化。

### Guest OS

没什么可说的，就是一个操作系统，和其他在硬件上部署的没有区别。

### Hypervisor

Hypervisor：虚拟机监控器，作为虚拟机的os的底层，这一层是做为虚拟化的软件层。

但不是所有的Hypervisor都是存在于硬件之上的。这里还有两种类型的分类：Type 1和Type 2，区别是在于其部署位置。

Type 1的部署位置是在硬件环境上，而Type 2的部署位置是在操作系统中。
这里是GPT的对比图：

![Type 1 Hypervisor 架构](/images/vm-and-docker/hypervisor-type-1.png)

![Type 2 Hypervisor 架构](/images/vm-and-docker/hypervisor-type-2.png)

可以看出Type 1是非常贴近硬件了，而Type 2还是作为一个应用层的程序进行运行。

这里举出各自的产品可能更容易进行说明，都是大家平时会进行使用的产品：
- Type 1：VMware ESXi、Microsoft Hyper-V、Xen
- Type 2：VMware Workstation、Oracle VirtualBox、Parallel Desktop

但这里我又提出一个问题：
我最亲爱的windows中的WSL 2算是什么架构？他看起来也不像是一个Type 2呀？但是说是Type 1，感觉好像和Type 1又存在上下级关系，让我很迷惑。

这里我还真去搜索了一下（GPT老师），得到的结论是：WSL 2是属于Type 1，它在电脑中的架构是这样：

![WSL 2 架构](/images/vm-and-docker/wsl2-architecture.png)

WSL 2的虚拟机和windows 11是属于同级关系。Type 1 的 Hypervisor 位于操作系统之下，而 Windows 在其中承担了特殊的虚拟机管理角色。
这里还有对比：

| 项目           | Windows           | WSL 2 Linux     |
| ------------ | ----------------- | --------------- |
| Partition 类型 | Root Partition    | Child Partition |
| 操作系统内核       | Windows NT Kernel | Linux Kernel    |
| CPU 执行       | 受 Hypervisor 管理   | 受 Hypervisor 管理 |
| 物理设备访问       | 拥有特殊设备管理权限        | 主要通过虚拟设备访问      |
| 管理其他 VM      | 可以                | 默认不能            |
| 权限           | 特权管理分区            | 普通 Guest 分区     |

#### 配置例子

假设有一台配备 64GB 内存和 8 核 CPU 的物理服务器。使用 VMware ESXi 这样的 Hypervisor，你可以划分出三个虚拟机：

- **VM1**：分配 16GB 内存，2 核 CPU，运行 Ubuntu 系统，用于 Web 网站托管。
- **VM2**：分配 32GB 内存，4 核 CPU，运行 Windows Server 系统，作为数据库服务器。
- **VM3**：分配 16GB 内存，2 核 CPU，运行 CentOS 系统，用于应用程序开发。

注意：每个虚拟机都在完全隔离的环境中运行，拥有自己专属的操作系统、文件系统和网络配置。

>虽然理论上可以，但使用时不建议这么分，你要留点内存给宿主机，给VMware ESXi 。不过CPU的分配是可以按照工作负载进行动态调度，不是简单地静态切割。所以CPU可以这样分。

## 容器

这里开始这就是基于docker的容器的内容了。
基于docker的实例，也就是容器，它和虚机不一样。容器不存在Guest OS这个东西，它使用的内核就是宿主机自己的内核。

### 架构

![容器架构](/images/vm-and-docker/container-architecture.png)

这张图能看出容器的架构，不同的容器创建和管理依托于Container Runtime，然后这个Container Runtime建立于宿主机的kernel之上，不同的容器都共享同一个kernel。
这也导致容器的架构只能依托于宿主机的架构，不会在一个linux主机上能出现一个windows容器。

那为什么有时候不同的linux发行版可以作为容器呢？比如可以从ubuntu中做一个centos容器，这个架构不是有问题吗？

这是因为不同的linux发行版其实在linux内核是一致的，都是linux的官方内核，只是其版本、编译配置等存在区别。从下图能够感觉出来，他们的内核都是linux内核，所以容器创建出的架构虽然不同（ubuntu、debian、centos等），但都能通过依赖宿主机的linux架构进行创建。只是使用的用户空间不一样。

![不同 Linux 发行版共享同一内核](/images/vm-and-docker/same-kernel-1.png)

![不同发行版的用户空间差异](/images/vm-and-docker/same-kernel-2.png)

### 容器的原理

那么容器到底是怎么产生的呢？
这种能直接在操作系统内核之上，在用户态对不同环境进行划分。和刚刚说的type 2的虚拟机的区别又是什么？

先说说第一个问题，容器产生的原理。容器产生包含了几个部分的机制：
- namespace
- cgroup

> 有些博客把用一句话把一个容器进行归纳：**namespace 决定"看得见什么"(隔离)、cgroup 决定"能用多少"(限额)、rootfs+overlayfs 决定"文件系统长什么样"(镜像视图)。**
> 也有的说：容器只是宿主机上一组 **被 namespace 隔离、被 cgroup 限额** 的普通进程。
> 这里先按照第二个来，因为更简单理解。

#### namespace

namespace用于进程之间的隔离，注意不是只针对容器，说白了容器的就是一种被隔离的进程。

举例子，假设有两个进程p1和p2，在宿主机上给他们的pid分别是123和456，他俩有不同的namespace，那么看到的系统就完全不一样。

看到的pid不一样、user不一样、mount的东西不一样、主机名不一样、IPC不一样、消息队列不一样...
这些都是namespace负责的职责。都可以在进行clone系统调用的时候，用 `CLONE_NEW*` 标志创建：

| namespace | Flag              | 隔离内容                                          |
| --------- | ----------------- | --------------------------------------------- |
| Cgroup    | `CLONE_NEWCGROUP` | Cgroup 根目录视图                                  |
| IPC       | `CLONE_NEWIPC`    | System V IPC、POSIX 消息队列                       |
| Network   | `CLONE_NEWNET`    | 网卡、协议栈、路由表、端口                                 |
| Mount     | `CLONE_NEWNS`     | 挂载点 / 目录层次结构                                  |
| PID       | `CLONE_NEWPID`    | 进程号（每个 PID namespace 内部从 1 开始编号）              |
| Time      | `CLONE_NEWTIME`   | 启动时钟与单调时钟（`CLOCK_MONOTONIC`/`CLOCK_BOOTTIME`） |
| User      | `CLONE_NEWUSER`   | 用户 ID / 组 ID                                  |
| UTS       | `CLONE_NEWUTS`    | 主机名 / NIS 域名                                  |
有三个相关系统调用：
- clone()：新进程 + 新 namespace，容器启动主力。
- unshare()：当前进程脱离进新 namespace，PID namespace 要靠下一个子进程落地。
- setns()：凭 `/proc/<pid>/ns/*` 的 fd 加入已有 namespace，是 nsenter / CNI 的底座。

#### Cgroup

进行了隔离之后，还需要对这个进程能调用的资源进行限制。这就是cgroup做的事情。他能决定一组进程能够使用多少系统资源。

现在是用cgroup v2的比较多。

![cgroup v2 示意图](/images/vm-and-docker/cgroup-v2.png)

使用方式就是向这个伪文件系统中添加数据就行了，比较简单。
```
# 开始

sudo mkdir /sys/fs/cgroup/my-container # 创建一个cgroup

echo 536870912 | sudo tee \
  /sys/fs/cgroup/my-container/memory.max  # 设置这个cgroup的能使用的计算机相关限制

echo 12345 | sudo tee \
  /sys/fs/cgroup/my-container/cgroup.procs # 加入一个进程

# 结束
```
