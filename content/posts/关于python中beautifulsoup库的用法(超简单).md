---
title: 关于python中beautifulsoup库的用法(超简单)
url: /2021/09/09/016关于python中beautiful库的用法/
date: 2021-09-09T07:19:01.000Z
lastmod: 2021-09-09T16:35:27.098Z
description: 之前有节实验课研究了爬虫，我深刻地感觉到了xpath就不适合玩爬虫（个人见解），于是我开始试着重新复习beautifulsoup库了 安装直接pip安装就好了 引用
tags:
  - python
categories:
  - 学习
  - python库
---

## 前言 {#前言}

之前有节实验课研究了爬虫，我深刻地感觉到了xpath就不适合玩爬虫（个人见解），于是我开始试着重新复习beautifulsoup库了

## beautifulsoup库的使用 {#beautifulsoup库的使用}

### 安装和引用 {#安装和引用}

安装直接pip安装就好了


```python
pip install bs4
```


引用


```python
from bs4 import BeautifulSoup
```


### 创建对象 {#创建对象}


```python
soup = BeautifulSoup(res_text,"html.parser",from_encoding="utf-8")
```


html.parser 是一个算是用于解释html文档的东西

### 使用 {#使用}

首先我需要一个html文档，一般来说是用了requests模块以后得来的content

然后使用的语法

##### 查找标签 {#查找标签}


```python
test1 = soup.findAll('a') 
#这个是指我要这个文档里面所有的a标签，包括了<a>一起，有一个像是list的返回，类型叫做ResultSet
test2 = soup.findAll('a',class_='xxx')
#在上面的基础上，我要的是所有class是'xxx'的标签
test3 = soup.findAll('a',class_='xxx',text='story')
#标签里面的文本筛选
```


我们还可以和著名的re库，也就是正则表达式一起用


```python
test4 = soup.findAll('a',class_='xxx',text=re.compile('.*?story.*?'))
```


##### 查找标签里的内容 {#查找标签里的内容}


```python
for item in test1:
	print(item.get_text())
#get_text()可以把标签里面的内容全部弄出来，不管你是不是普通的text，还是有<em>标签，都可以
```

