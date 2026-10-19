---
title: 关于npm的一些安装问题
url: /2021/03/22/005关于npm/
date: 2021-03-21T16:00:00.000Z
lastmod: 2021-03-22T17:23:37.410Z
description: 换了一台电脑后，关于nodejs，每次弄npm安装插件都有一大堆报错和warning，这里稍微整理一下，方便以后使用npm 在NodeJs开发中，往往需要安装各种依赖包，而有时候这些依赖包版本更新了或者改成了另外一个包名，导致npm install会报“requires a peer of XXX”
tags:
  - 技术
  - npm
categories:
  - 教程
  - npm
---

## 前言 {#前言}

换了一台电脑后，关于nodejs，每次弄npm安装插件都有一大堆报错和warning，这里稍微整理一下，方便以后使用npm

## “npm WARN requires a peer of XXX“问题 {#“npm-WARN-requires-a-peer-of-XXX“问题}

在NodeJs开发中，往往需要安装各种依赖包，而有时候这些依赖包版本更新了或者改成了另外一个包名，导致npm install会报“requires a peer of XXX”之类的warning。

我这次下载artitalk插件就是这个问题

![文章配图](/media/legacy/c929cca73e93-20210322235444.png)

解决方法，就是缺啥就补啥，命令如下：


```bat
npm install --save-dev "XXX"
```


其中“xxx”是你所缺少的模块，比如对于我这次缺少的模块，我的命令就为：


```bat
npm install --save-dev "typescript@>=2.7"
```


安装后就不会报错了

## npm WARN saveError ENOENT: no such file or directory, open ‘C:\Users...\package.json’问题 {#npm-WARN-saveError-ENOENT-no-such-file-or-directory-open-‘C-Users-package-json’问题}

根据错误提示，这个问题主要是缺少”package.json”文件所导致的，这个文件的作用是管理你本地安装的npm包

解决的方法，创建”package.json”文件，使用命令：


```bat
npm init
```


系统会给你提示来让你输入相关的配置，便于你自己配置，但对一些新手（比如我）来说，这样过于复杂，也怕自己改错什么配置

所以还可以使用命令：


```bat
npm init -y
```


它可以一次性将所有默认配置都写入文件，直接创建”package.json”文件，还挺方便的，使用如下

![文章配图](/media/legacy/aca0391a768f-20210323001342.png)

## npm warn package.json @1.0.0 no repository field问题 {#npm-warn-package-json-1-0-0-no-repository-field问题}

npm安装时总是报这个错，但是其实是安装成功的

![文章配图](/media/legacy/d78bc1d26168-20210323004816.png)

看问题可以知道应该是package.json里缺少 repository的问题，所以我们添加上就ok了

有大佬说这里是缺少项目的仓库字段，如下这种：

> 
```text
{
    ...
    "repository": {
        "type": "git",
        "url": "http://baidu.com"
    },
    ...
}
```


但如果只是练习自己用的话，只需要在package.json里做下面的配置就好了

> 
```text
{
    ...
    "private": true,
    ...
}
```


这样就是把项目设置为私有来避开warning

![文章配图](/media/legacy/5ae347e7ae76-20210323010224.png)

同理，npm WARN [root@1.0.0](mailto:root@1.0.0) No description也只需把description的值不为空就行了

## 后记 {#后记}

本文持续更新中……
