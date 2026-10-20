---
title: (pip)关于代理安装问题
url: /2021/04/12/006关于pip/
date: 2021-04-11T16:00:00.000Z
lastmod: 2021-08-04T14:19:31.518Z
description: 研究同学的项目时，通过 pip 下载导入包出现错误。经过搜索发现是无法连接代理导致的问题，这里记录排查过程和具体的解决方法。
tags:
  - 技术
  - 安装
categories:
  - 学习
  - pip
---

## 前言 {#前言}

研究同学的项目，想要通过pip下载导入包的时候，出现了错误

## Failed to establish a new connection: [WinError 10061] 由于目标计算机积极拒绝，无法连接。’))’: /simple/flask-migrate/ {#Failed-to-establish-a-new-connection-WinError-10061-由于目标计算机积极拒绝，无法连接。’-’-simple-flask-migrate}

![文章配图](/media/legacy/1570445836e0-20210412201816.png)

在网上一番搜索了之后，发现是显示无法连接到代理的问题

解决方法也很简单：通过修改注册表中的代理设置

## 解决方法 {#解决方法}

快捷键【win】+【R】输入regedit 打开注册表编辑器

打开【HKEY\_CURRENT\_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings】路径

选择关于代理的设置：【ProxyEnable】设置变为【0】

![文章配图](/media/legacy/18ce2ebe7adb-20210412202407.png)

再使用pip的时候，就发现已经没问题了

![文章配图](/media/legacy/2c2d4054a37d-20210412202551.png)

参考链接：<https://blog.csdn.net/m0_37811192/article/details/89411415>
