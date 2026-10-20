---
title: 关于hexo的博客搭建
url: /2021/02/24/001第一篇/
date: 2021-02-23T16:00:00.000Z
lastmod: 2021-02-24T06:31:20.964Z
description: 这是我第一次搭建博客的记录。过程折腾了很多天，也遇到各种奇怪的 bug，最后在朋友帮助下成功上线，顺便记下当时踩过的坑和解决方法。
tags:
  - 技术
  - hexo
categories:
  - 教程
  - hexo
---

## 关于hexo的博客搭建 {#关于hexo的博客搭建}

## 关于前言 {#关于前言}

这是我第一次的博客介绍，仅供参考

这个博客的搭建弄了很多天，因为之前电脑总是经历了千奇百怪的bug，但在朋友的帮助下还是成功（应该算是成功吧）把这个博客搭建了起来。仔细一想好像真的白嫖了好多东西哈哈。

---

## 搭建博客 {#搭建博客}

### 前期准备 {#前期准备}

node.js下载、git安装

推荐教程：<https://blog.csdn.net/antma/article/details/86104068> node.js安装

​ <https://www.cnblogs.com/xueweisuoyong/p/11914045.html> git安装

- 注1：由于node.js版本过高的话会和hexo版本发生冲突导致报错，推荐node版本不超过12.x版本，可以使用nvm进行版本控制，

  nvm的教程：<https://www.cnblogs.com/gaozejie/p/10689742.html>

  当然也可以寻找其他版本的教程
- 注2：nodejs下载速度过慢的时候，是因为服务器在国外的原因，可以用国内的镜像来解决

  
```bat
npm install -g npm --registry=https://registry.npm.taobao.org
```


### 进行搭建 {#进行搭建}

- hexo的安装

  在命令行中输入命令

  
```text
npm install -g hexo-cli
```


  当然在具有淘宝镜像以后就是

  
```powershell
cnpm install -g hexo-cli
```


  等待过后便安装完成
- 博客初始化

  首先新创建一个文件夹

  然后在文件夹里进行命令行输入

  
```powershell
hexo init
```


  创建了文档，且初始化完成。

  注意：以后的操作都基于此文件夹，若出现严重bug可以删除此文件夹重新初始化hexo博客框架
- 以下是部分常用命令操作

  本地服务器建立

  
```powershell
hexo s
```


  生成静态文件

  
```powershell
hexo g
```


  清理缓存

  
```powershell
hexo clean
```


  向网站部署

  
```powershell
hexo d
```


以上，本地博客便搭建成功

---

## 关于远端部署 {#关于远端部署}

​ 本地博客搭建成功了就要部署到远端网站方便其他人查看，我这里用码云（gitee）来做示例，大家也可以使用github，两者用法几乎相同

​ 当然也可以购买服务器不过相对部署在GitHub和Gitee上就比较麻烦一点

- 首先创建一个仓库

  注意如果是GitHub的话仓库名必须固定：账号名.github.io（例如thanyi.github.io）

  但是在码云没有这个要求
- 在新建的文件夹使用命令安装一个和git相关的插件

  
```powershell
cnpm install --save hexo-deployer-git
```

- 文件夹中有名为”\_config.yml”的文件，打开文件，在最底部的# Deployment模块输入相关参数

  
```yaml
# Deployment
## Docs: https://hexo.io/docs/one-command-deployment
deploy:
type: git
repo: https://gitee.com/xxx/xxx.git			#这里填你的仓库的http地址
branch: master
```


  保存
- 部署到远端

  
```powershell
hexo d
```


  这样就成功部署到远端了

  注意：部署到远端之前需要先生成静态文件，命令在上方
- 在gitee的仓库右方**服务**下方的**Gitee**的下方的page按钮，点击进入部署页面，进行部署。

  gitee会为你提供你的部署网址，这就是你的博客网址了

---

## 关于主题 {#关于主题}

主题方面有很多做法，我用的是butterfly主题，它的使用连接如下：

<https://butterfly.js.org/posts/21cfbf15/>
