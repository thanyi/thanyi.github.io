---
title: "关于win系统中powershell的美化"
pubDatetime: 2021-04-29T16:00:00.000Z
modDatetime: 2021-04-30T15:48:07.677Z
description: "在花猪的带领下，学会了关于我电脑的powershell的美化，太香了 https://akilar.top/posts/8a76eb87/ 我觉得上文的那个文章里面写的很好了我就不写了"
tags: ["技术", "安装"]
categories: ["教程", "powershell"]
legacyHeadings: [{"depth": 2, "slug": "前言", "text": "前言"}, {"depth": 2, "slug": "特别感谢博客", "text": "特别感谢博客"}, {"depth": 2, "slug": "使用方法", "text": "使用方法"}, {"depth": 2, "slug": "有些bug的更改", "text": "有些bug的更改"}]
---

## 前言

在花猪的带领下，学会了关于我电脑的powershell的美化，太香了

## 特别感谢博客

<https://akilar.top/posts/8a76eb87/>

## 使用方法

我觉得上文的那个文章里面写的很好了我就不写了

## 有些bug的更改

你在按照教程

在powershell上使用命令打开.ps1文件的时候，输入


```powershell
Import-Module posh-git
Import-Module oh-my-posh
Set-Theme Agnoster
```


命令”Set-Theme Agnoster”是旧版本的命令（这个版本是oh-my-posh的版本），对于新版本，也就是V3版本的oh-my-posh来说

命令应该是


```powershell
Import-Module posh-git
Import-Module oh-my-posh
Set-PoshPrompt -Theme agnoster
```


然后问题就解决了
