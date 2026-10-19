---
title: "numpy的学习笔记"
permalink: "/2021/09/08/015python中numpy的用法/"
pubDatetime: 2021-09-08T13:51:58.000Z
modDatetime: 2021-09-14T01:39:14.443Z
description: "众所周知，numpy是机器学习和深度学习的基础，数据运算在数据挖掘领域也是有着丰富的用途，numpy、matplotlib的用法是很基础的事情，这里稍微总结一下，知识不多，学多少总结多少 菜鸟教程相关内容有很多，这里给个链接，我只总结一下少数东西 在numpy中的数组，其实就是我们在线性代数中学习的"
tags: ["numpy"]
categories: ["学习", "深度学习"]
---

## 前言

众所周知，numpy是机器学习和深度学习的基础，数据运算在数据挖掘领域也是有着丰富的用途，numpy、matplotlib的用法是很基础的事情，这里稍微总结一下，知识不多，学多少总结多少

菜鸟教程相关内容有很多，这里给个链接，我只总结一下少数东西

## numpy的一些小用法

### 数组

在numpy中的数组，其实就是我们在线性代数中学习的矩阵，矩阵在线性代数的地位自然不用我多说，所以numpy、matplotlib中很多东西都离不开这个数组

### 数组创建（从头创建）


```python
import numpy as np
x = np.empty([3,3]) #x是一个3行3列的矩阵，里面都是一些随机数，因为没有初始化
y = np.zeros((2,2), dtype = np.int) #这个是全是0的2*2矩阵
z = np.ones((2,2), dtype = np.int) #和上面一样
```


这就是普通的从头开始创建

### 数组创建（按数值范围创建）


```python
x = numpy.arange(5) #[0  1  2  3  4] 这就是按照一个范围来的
y = numpy.arange(10,20,2) #[10  12  14  16  18] 从10到20，步长为2

#这个是一维数组的创建，等差数列的创建，从1到10，创10个
x1 = numpy.linspace(1,10,10) #[ 1.  2.  3.  4.  5.  6.  7.  8.  9. 10.]
#这个是一维数组的创建，并且有一个间距展示
y1 = numpy.linspace(1,10,10,retstep= True)
#(array([ 1.,  2.,  3.,  4.,  5.,  6.,  7.,  8.,  9., 10.]), 1.0)
```


### 更改数组的形状


```python
b =np.linspace(1,10,10).reshape([10,1])
'''
[[ 1.]
 [ 2.]
 [ 3.]
 [ 4.]
 [ 5.]    变成了一个【10,1】的矩阵
 [ 6.]
 [ 7.]
 [ 8.]
 [ 9.]
 [10.]]   
'''

```


还有一个等差数列的np.logspace(),是同一种的用法

## matplotlib用法

菜鸟教程：<https://www.runoob.com/matplotlib/matplotlib-tutorial.html>

### matplotlib中的pyplot子库


```python
import matplotlib.pyplot as plt
import numpy as np

x = np.array([0, 6])
y = np.array([0, 100])

plt.plot(x, y) #拿着两个矩阵进去居然是！
plt.show()
```


![文章配图](/media/legacy/5334ed5672ec-20210908214821.png)


```text
xpoints = np.array([1, 2, 6, 8])
ypoints = np.array([3, 8, 1, 10])

plt.plot(xpoints, ypoints)
plt.show()

```


![文章配图](/media/legacy/eeab597a8c02-20210908214849.png)
