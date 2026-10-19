---
title: "关于vue路由和Django的路由问题"
permalink: "/2023/04/20/026-关于vue路由和Django的路由问题/"
pubDatetime: 2023-04-20T15:08:15.000Z
modDatetime: 2023-04-22T02:50:29.444Z
description: "总所周知，vue框架是一种非常非常简单的框架，对于路由的问题更是这样的，同时其实Django的框架中也有关于路由的实现（不如说路由才是最主要的问题之一）。Vue对于路由的实现是通过 vue.router 来实现的。而Django直接有个 url.py 文件来实现对于url路由的解决。 我的毕设是用了"
tags: ["前端"]
categories: []
---

总所周知，vue框架是一种非常非常简单的框架，对于路由的问题更是这样的，同时其实Django的框架中也有关于路由的实现（不如说路由才是最主要的问题之一）。Vue对于路由的实现是通过`vue.router`来实现的。而Django直接有个`url.py`文件来实现对于url路由的解决。

我的毕设是用了Vue+Django用作前后端分离进行的，所以真的是思考了很久关于这个路由到底是用哪边比较好比较方便，最终还是使用了Vue自带的`vue.router`，只是将Django框架作为了api的接口使用，通过几个路由进行文件的转接和使用。

## router的安装和使用

### 安装

这个很简单，在npm中直接安装就好


```shell
npm install vue-router
```


如果是用的vue3（比如我）那就直接用4.x版本的vue


```shell
npm install vue-router@4
```


### 使用

安装好之后直接在vue框架中的建立一个`router`文件夹，里面创建`index.js`（这个主要是就方便导入，import的时候导入`index.js`可以直接导入上级的文件夹。

使用的话，首先在在你的`index.js`中，引用`router`模块的两个函数


```javascript
import { createRouter, createWebHistory } from "vue-router";
```


ES6中对于多个函数或者模块的导出使用`{}`进行导出的，同时用 `''`或者`""`来表示模块

其次进行history和routes的创建


```javascript
const history = createWebHistory();
const routes = [
    {
      path: "/",
      component: () => import("@/views/MyHome"),
    },
    {
      path: "/results",
      component: () => import("@/views/HelloWorld"),
    },
  ];
const router = new createRouter({
  history,
  routes
});

```


一个是`history`，一个是`routes`

`createWebHistory()` 是 Vue Router 4 中用于创建路由历史记录对象的函数，返回一个历史记录对象。该函数主要用于在浏览器中使用 HTML5 History API 来管理路由，从而实现前端路由。

不过我目前还没有知道这个`history`有个什么用，后期再补充吧

对于`routes`，这个也就是一个对象列表，参数可以很明显的看出来就不细说了，也就是注意其实可以直接对`component`使用我们已经有过的vue组件，只是说你需要引用

格式如下：


```javascript
import HelloWorld from '@/components/HelloWorld.vue'

const routes = [
    {
      path: "/results",
      component: HelloWorld,
    },
  ];
```


最后进行导出


```javascript
export default router;
```


框架的`App.vue`文件中进行导入操作


```javascript
import router from "@/router"

const app = createApp(App)
app.use(router)

app.mount('#app')
```


其中@号代表的是项目根目录

最后的最后，需要注意的是，要把需要展示的内容，放在标签`<router-view></router-view>`中，我是喜欢直接放在`App.vue`中。

## Vue在上传视频后进行页面跳转

这个是最主要的在系统中实现需要的功能，也就是上传视频后直接跳往想要的界面

在vue中有专门做这个功能的模块

对我来说，因为我的需求是上传文件到后端，同时为了美观使用了`element-ui`作为前端的参考，所以我的上传地方是这样的


```javascript
<el-upload
     class="upload-demo"
     drag
     name="file"
     action="http://127.0.0.1:8000/api/upload"
     :on-success="handleUploadSuccess"
     multiple
  	>
```


注意的是`:on-success`是监控属性，也就是对属性的监控，这个属性是在element-ui的文档中有的

![image-20230421123302895](/2023/04/20/026-%E5%85%B3%E4%BA%8Evue%E8%B7%AF%E7%94%B1%E5%92%8CDjango%E7%9A%84%E8%B7%AF%E7%94%B1%E9%97%AE%E9%A2%98/image-20230421123302895.png)

注意`@`是绑定DOM事件，`:`是绑定属性，属性在文档看就行

然后在`script`中编辑


```javascript
methods: {
    handleUploadSuccess(response, file, fileList) {
      // 在这里处理上传成功后的逻辑，例如路由跳转
        this.$router.push('/results');
    },
  },
```


`this`表示的是这个本组件对象，而`$router` 是一个指向当前应用程序的 Vue Router 实例的属性，vue单独为一些内置属性和方法开了空间，用`$`加一命名

而后就直接跳转就好了
