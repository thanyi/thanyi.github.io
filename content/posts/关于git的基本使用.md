---
title: 关于git的基本使用
url: /2021/02/25/002代码提交/
date: 2021-02-24T16:00:00.000Z
lastmod: 2021-12-07T14:39:21.655Z
description: "在本地写好代码后想上传到 GitHub 时，总是记不清 git 命令。这里把安装、绑定账号、提交和推送的完整流程整理一遍，方便以后查阅。"
tags:
  - git
  - 技术
categories:
  - 教程
  - git
---

## 前言 {#前言}

在本地写好代码了然后想要上传到GitHub的时候，使用git命令一直要忘记命令过程，现在把上传GitHub的命令过程整理一下

## 前期准备 {#前期准备}

git安装：<https://www.cnblogs.com/xueweisuoyong/p/11914045.html>

### 绑定用户 {#绑定用户}

- 下载好Git后，点击右键，打开git bash here

- 开始绑定用户名和邮箱（注：用户名是你GitHub的用户名，邮箱是你GitHub的绑定邮箱，上传到gitee的话同理）

  输入代码

  
```text
git config --user.name "你的用户名"
```


  
```text
git config --user.email "你的邮箱"
```


![文章配图](/media/legacy/7e23e5c40721-image-20210225171909368.png)

### SSHkey 设置 {#SSHkey-设置}

- 在git bash中输入代码：

  
```text
ssh-keygen -t rsa -(路径) -"github绑定邮箱"
```


​ 注：路径是指C盘或者D盘路径

​ 例如：ssh-keygen -t rsa -C -“[1316594115@qq.com](mailto:1316594115@qq.com)“

​ 输入后git bash中会有三次提醒输入操作  
​ 1）是路径确认，直接按回车存默认路径即可  
​ 2）直接回车键，这里我们不使用密码进行登录, 用密码太麻烦;  
​ 3）确认密码,直接回车键

​ （也就是说三次回车）

​ 之后电脑C盘路径C:\Users\Administrator（电脑名）.ssh 下会生成 id\_rsa.pub 文件，将其中内容复制下来

- 在github上找到设置界面，找到其中的”SSH and GPG keys”，点击New SSH key

![文章配图](/media/legacy/1e1f2e4693c4-2.png)

- 在key输入框中将之前复制的内容输入，title可自定义![文章配图](/media/legacy/15e7c2883cc8-image-20210225173650772.png)

  结束后即SSH keys绑定成功，前期所有准备结束

## git使用 {#git使用}

### git本地 {#git本地}

- 首先创建一个文件夹，文件夹中是我们已经写好的代码，之后Git命令操作都基于此文件夹

  在文件夹路径下打开git bush

  输入命令

  
```text
git init
```


  初始化成功后原文件夹里多了一个隐藏文件夹.git

  输入代码

  
```text
git add .
```


  即可上传 （代表将此文件夹里面的所有文件都保存在暂存区中）

  然后以后的修改使用commit命令进行提交

  
```text
git commit -m "这里是备注内容"
```


  这是将修改的内容提交到本地仓库

  注：add是将代码提交到我们所谓的“缓存区”，而commit则是将我们在缓存区的代码提交到本地仓库。

  ​ git有好几个区，工作区（workspace）、暂存区（index）、本地仓库（local repository）、还有远程仓库（remote repository）

### git提交到远程 {#git提交到远程}

- 在github上创建仓库
- 找到创建的仓库的地址(http地址、ssh地址)
- 输入命令：

  
```text
git remote add origin 你复制的地址
```


  注：创建了一个远程仓库名叫origin，和GitHub上的仓库建立了联系
- 然后，连接代码与远程的仓库

  
```text
git pull -u origin master
```

- 最后，将本地仓库的代码传输到GitHub的仓库上，输入代码

  
```text
git push -u origin master
```


  至此，代码到GitHub转换成功

## 总结 {#总结}

git的一系列代码是如下的这样：


```text
git init
git add .
git commit -m "这里是备注内容"
git remote add origin 你复制的地址
git pull -u origin master
git push -u origin master
```

