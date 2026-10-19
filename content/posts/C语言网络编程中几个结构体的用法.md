---
title: C语言网络编程中几个结构体的用法
url: /2021/10/09/017c语言网络编程中几个结构体的用法/
date: 2021-10-09T15:25:17.000Z
lastmod: 2021-10-08T16:29:54.314Z
description: "C语言网络编程中有很多结构体，其中很多的结构体对我来说很混乱，难以记住，想要先整理一下 sockaddr在头文件 #include <sys/socket.h> 中定义 sockaddr_in在头文件 #include<netinet/in.h>或#include <arpa/inet.h> 中定义"
tags:
  - 学习
categories:
  - 学习
  - 学习笔记
---

C语言网络编程中有很多结构体，其中很多的结构体对我来说很混乱，难以记住，想要先整理一下

## 用来处理网络通信的地址 {#用来处理网络通信的地址}

### struct sockaddr {#struct-sockaddr}

sockaddr在头文件`#include <sys/socket.h>`中定义


```c
struct sockaddr {
    unsigned short sa_family;  /* 地址族, AF_xxx */
    char sa_data[14];  /* 14字节的协议地址*/
};
```


### struct sockaddr\_in {#struct-sockaddr-in}

sockaddr\_in在头文件`#include<netinet/in.h>或#include <arpa/inet.h>`中定义


```c
struct sockaddr_in {
    short int sin_family; /* 地址族 */
    unsigned short int sin_port; /* 端口号 */
    struct in_addr sin_addr; /* Internet地址 */
    unsigned char sin_zero[8]; /* 与struct sockaddr一样的长度 */
};
```


### in\_addr {#in-addr}


```c
struct in_addr {
    unsigned long s_addr;   //32位ipv4的地址
};

```


这是个32位的ip地址，应该是用的16进制进行表示，比如说192.168.0.1就是（0xC0A80001）

### sockaddr和sockaddr\_in的区别 {#sockaddr和sockaddr-in的区别}

sockaddr常用于bind、connect、recvfrom、sendto等函数的参数，指明地址信息，是一种通用的套接字地址。

sockaddr\_in 是internet环境下套接字的地址形式。所以在网络编程中我们会对sockaddr\_in结构体进行操作，使用sockaddr\_in来建立所需的信息，最后使用类型转化就可以了。一般先把sockaddr\_in变量赋值后，强制类型转换后传入用sockaddr做参数的函数：sockaddr\_in用于socket定义和赋值；

## 其他相关函数 {#其他相关函数}

### htons() 和 inet\_addr() {#htons-和-inet-addr}

htons()作用是将端口号由主机字节序转换为网络字节序的整数值。(host to net)（都是简写还挺好记的）

inet\_addr()作用是将一个IP字符串转化为一个网络字节序的整数值，用于sockaddr\_in.sin\_addr.s\_addr。

### inet\_ntoa() {#inet-ntoa}

将一个sin\_addr结构体输出成IP字符串(network to ascii)。

## 给socket赋值的方法 {#给socket赋值的方法}

### 给地址赋值 {#给地址赋值}


```c
//第一种
inet_aton(server_addr_string,&myaddr.sin_addr); //myaddr是一个sockaddr_in的结构体
//第二种
myaddr.sin_addr.s_addr = inet_addr("这里写你要输入的ip地址，ipv4格式的就好了")    
```


### 给端口赋值 {#给端口赋值}


```c
myaddr.sin_port = htons(端口数目)  //括号里面就是数字就好了
```


### 例子 {#例子}


```c
int sockfd;
struct sockaddr_in my_addr;
sockfd = socket(AF_INET, SOCK_STREAM, 0); /* 套接字创建，返回值如果是-1就代表没创建成功 */

my_addr.sin_family = AF_INET; /* 主机字节序 这里指使用ipv4 */ 
my_addr.sin_port = htons(MYPORT); /* short, 网络字节序 */
my_addr.sin_addr.s_addr = inet_addr(“192.168.0.1″);

bzero(&(my_addr.sin_zero), 8); /* zero the rest of the struct */
/* bind()表示与my_addr中的ip地址来进行连接 */
bind(sockfd, (struct sockaddr *)&my_addr, sizeof(struct sockaddr));


```


参考博客：<https://blog.csdn.net/will130/article/details/53326740>
