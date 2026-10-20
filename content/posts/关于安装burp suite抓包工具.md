---
title: 关于安装burp suite抓包工具
url: /2021/03/18/004抓包工具安装/
date: 2021-03-17T16:00:00.000Z
lastmod: 2021-03-18T16:37:37.873Z
description: "换电脑后需要重新安装 Burp Suite 做抓包测试。这篇文章整理了下载、安装和基础配置过程，并附上参考资料，方便以后重新搭建环境。"
tags:
  - 技术
  - 安装
categories:
  - 教程
  - burp suite
---

## 前言 {#前言}

由于一些原因换了台电脑，之前的抓包工具也没有了，所以想要重新下载burp suite来进行抓包测试

以下的教程很大部分参考了<https://blog.csdn.net/LUOBIKUN/article/details/87457545> 的内容，只是针对我自己的一些问题进行了阐述，并且总结了一些东西

## 资源下载 {#资源下载}

<https://blog.csdn.net/LUOBIKUN/article/details/87457545> 中有着百度云链接，里面有着java的jdk8版本，以及破解的burp软件

注1：因为burp suite的底层是用java程序编写，所以burp软件只能在java的环境里面运行，因此需要先搭建java环境

注2：对于上方的资源而言，如果jdk过于新( 比如说是jdk15)，那会导致有些操作无法执行而根本没办法运行burp suite

## jdk安装 {#jdk安装}

主要涉及了jdk和jre的安装以及环境变量的配置

### jdk-8u201-windows-x64安装 {#jdk-8u201-windows-x64安装}

[https://blog.csdn.net/LUOBIKUN/article/details/87457545中很详细](https://blog.csdn.net/LUOBIKUN/article/details/87457545%E4%B8%AD%E5%BE%88%E8%AF%A6%E7%BB%86)

### 环境变量 {#环境变量}

按下win键搜索“编辑系统环境变量”

![文章配图](/media/legacy/811df8c5e001-image-20210318233610723.png)

点击环境变量，进入界面

![文章配图](/media/legacy/bc15a3ea9a8c-QQ%E6%88%AA%E5%9B%BE20210318233846.png)

如我图所示，

> ①在“系统变量”中创建“JAVA\_HOME”，值为java的jdk安装的路径
>
> ②在path变量里书写%JAVA\_HOME%\bin 和 %JAVA\_HOME%\jre\bin
>
> 当然这个也要具体看你的jdk和jre的路径，比如我的jre是在jdk里面，如果你的你的jdk和jre是在同一个目录下，那就是直接弄绝对路径也可以
>
> ③在“系统变量”中创建“CLASSPATH”，变量值填写 “.;%JAVA\_HOME%\lib\dt.jar;%JAVA\_HOME%\lib\tools.jar”

## 安装burp suite {#安装burp-suite}

在下载好的压缩包里面有burp-loader-keygen.jar，将其打开后按照[https://blog.csdn.net/LUOBIKUN/article/details/87457545的教程走就行了](https://blog.csdn.net/LUOBIKUN/article/details/87457545%E7%9A%84%E6%95%99%E7%A8%8B%E8%B5%B0%E5%B0%B1%E8%A1%8C%E4%BA%86)

并且下载出来的是汉化版本

![文章配图](/media/legacy/7ae3b2ca22d2-20210318235702.png)

## 设置代理服务器 {#设置代理服务器}

我是直接用的Firefox浏览器，比较方便设置代理和导入证书

### 设置代理 {#设置代理}

在设置代理之前，要先记得在burp suite的界面中先把默认代理的接口勾上(我这里因为8080接口被占用了所以换了一个接口)

![文章配图](/media/legacy/5c8fd4294193-20210319000945.png)

然后打开firefox的设置界面(选项界面)，搜索“网络设置”，打开

![文章配图](/media/legacy/67469ebe7a30-20210319000112.png)

![文章配图](/media/legacy/48d41c15d816-20210319000200.png)

此时完成了代理，此时已经可以尝试着抓包了

### 导入证书 {#导入证书}

我们在第一次抓包的时候总是会遇到『您的连接不是私密连接』（Chrome）、『此网站的安全证书存在问题』（IE）或者『您的连接不安全』（Firefox）的问题

对于这种解决方式，就是导入证书，原理我暂时也不是很懂，之后学懂的话我再在这个地方进行解释吧

导入证书步骤：

​ 1）先开启burp suite的代理服务器并在浏览器里打开代理，访问[http://burp，此时会出现一个和burp相关的界面，点击右上角](http://burp,此时会出现一个和burp相关的界面,点击右上角/)

![文章配图](/media/legacy/0afca212c345-20210319001616.png)

此时会提醒你下载证书，下载即可

​ 2）导入证书，在Firefox的设置界面搜索“证书”，点击“导入”

![文章配图](/media/legacy/b2b869659519-20210319002000.png)

跳出的界面![文章配图](/media/legacy/d431d604c6d5-20210319002307.png)

现在你就可以抓以https开头的包了！

参考资料：

<https://www.anquanke.com/post/id/85925>

<https://blog.csdn.net/zyw_anquan/article/details/47904495>

<https://blog.csdn.net/LUOBIKUN/article/details/87457545>
