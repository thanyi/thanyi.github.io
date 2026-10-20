---
title: C语言socket相关函数
url: /2021/10/10/018C语言socket相关函数/
date: 2021-10-10T07:09:32.000Z
lastmod: 2022-03-21T16:15:25.656Z
description: 整理 C 语言网络编程中常用的 socket 函数，包括创建套接字、bind、listen、accept 和 connect 的用法、返回值以及常见错误处理。
tags:
  - 学习
categories:
  - 学习
  - 学习笔记
---

网络编程中的一些函数的具体用法

## socket创建过程的一些函数 {#socket创建过程的一些函数}

### 套接字创建函数 {#套接字创建函数}


```c
#include <sys/socket.h>
int socket(int domain, int type, int protocol); //函数原型

 if (-1==(listend=socket(AF_INET,SOCK_STREAM,0)))
 {
	 perror("create listen socket error\n");
	 exit(1);
 }
```


创建套接字，成功时返回文件描述符，失败时返回-1

### 绑定函数 {#绑定函数}


```c
#include <sys/socket.h>
int bind(int sockfd, struct sockaddr *myaddr, socklen_t addrlen); //函数原型

if (-1==bind(listend,(struct sockaddr *)&server,sizeof(struct sockaddr))) //server是事先定义好了的
{
    perror("bind error\n");
    exit(1);
} //例子
```


调用bind函数给套接字分配IP地址和端口，成功时返回0，失败时返回-1

也就是说这个是自己给自己的绑定

### 监听函数 {#监听函数}


```c
#include <sys/socket.h>
int listen(int sockfd, int backlog);

 if (-1==listen(listend,5))  //listend是一个套接字
 {
	perror("listen error\n");
	exit(1);
 }
```


将套接字转化为可接收连接的状态，成功时返回0，失败时返回-1

### 接收函数 {#接收函数}


```c
#include <sys/socket.h>
int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);

if (-1==(connectd=accept(listend,(struct sockaddr*)&client,&len)))
{
    perror("create connect socket error\n");
    continue;
}
```


### 具体流程 {#具体流程}

1. 调用socket函数创建套接字
2. 调用bind函数分配IP地址和端口号
3. 调用listen函数转为可接收请求状态
4. 调用accept函数受理连接请求（accept函数会再返回一个套接字）

   ![文章配图](/media/legacy/07e03ecc8c70-20211010113502.png)

## 读写过程中的函数 {#读写过程中的函数}

虽然说是两组分别用在不同操作系统的函数，但实际上来说，几乎是都可以用的

### read函数和write函数（听说大多数用在linux） {#read函数和write函数（听说大多数用在linux）}

#### read函数 {#read函数}

函数原型：


```c
include <unistd.h>
ssize_t read(inf fd, void *buf, size_t bnytes);//成功时返回接收的字节数（但遇到文件结尾则返回0），失败时返回-1
```


- fd：显示数据接收对象的文件描述符
- buf：要保存接收数据的缓冲地址值
- nbytes：要接收数据的最大字节数

#### write函数 {#write函数}


```c
ssize_t write(int fd, const void *buf, size_t nbytes);


```


- fd：显示数据接收对象的文件描述符
- buf：要保存接收数据的缓冲地址值
- nbytes：要接收数据的最大字节数

### recv函数和send函数（大多数用在windows） {#recv函数和send函数（大多数用在windows）}

#### recv函数 {#recv函数}

recv和read相似，都可用来接收sockfd发送的数据，但recv比read多了一个参数，也就是第四个参数，它可以指定标志来控制如何接收数据。


```c
ssize_t recv(int sockfd, void *buf, size_t nbytes, int flags);

if (0>(recvnum = recv(connectd,recv_buf,sizeof(recv_buf),0)))
    {
    perror("recv error\n");
    close(connectd);
    continue;
    }
recv_buf[recvnum]='\0';
```


#### send函数 {#send函数}


```c
int send(SOCKET sock, const char *buf, int len, int flags);

if (0>send(sockfd,send_buf,sizeof(send_buf),0))
{
    perror("error occar in sending data\n");
    break;
}
```


## 其他小tips {#其他小tips}

### ssize\_t和size\_t数据类型 {#ssize-t和size-t数据类型}

- ssize\_t是有符号整型，在32位机器上等同与int，在64位机器上等同与long int

几乎没有什么区别，就是一个整型变量

- size\_t 就是无符号型的ssize\_t，也就是unsigned long/ unsigned int (在32位下）
  - size\_t的正确定义应该是typedef unsigned long size\_t。
