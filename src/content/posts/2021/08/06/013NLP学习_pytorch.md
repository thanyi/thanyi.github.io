---
title: "关于NLP的学习"
pubDatetime: 2021-08-06T15:37:53.000Z
modDatetime: 2021-09-14T01:37:20.392Z
description: "深度学习从广义上来讲就是程序可以自己学习自己的意思。是指一个已经写好的代码程序经过大量的数据使得自身得到了发展 总共有三个部分的特征： 一、反向传播算法"
tags: ["深度学习"]
categories: ["学习", "深度学习"]
legacyHeadings: [{"depth": 2, "slug": "深度学习的概念", "text": "深度学习的概念"}, {"depth": 2, "slug": "学习pytorch", "text": "学习pytorch"}, {"depth": 3, "slug": "特点", "text": "特点"}, {"depth": 3, "slug": "使用pytorch进行深度学习的步骤", "text": "使用pytorch进行深度学习的步骤"}, {"depth": 4, "slug": "构建神经网络模型", "text": "构建神经网络模型"}, {"depth": 4, "slug": "建立损失函数和优化器", "text": "建立损失函数和优化器"}, {"depth": 5, "slug": "损失函数", "text": "损失函数"}, {"depth": 5, "slug": "优化器", "text": "优化器"}, {"depth": 4, "slug": "对神经网络进行分批次训练", "text": "对神经网络进行分批次训练"}, {"depth": 2, "slug": "预处理", "text": "预处理"}, {"depth": 3, "slug": "数据预处理", "text": "数据预处理"}, {"depth": 3, "slug": "预处理手段", "text": "预处理手段"}, {"depth": 2, "slug": "实例：关于分类相关的深度学习", "text": "实例：关于分类相关的深度学习"}, {"depth": 3, "slug": "文本向量化", "text": "文本向量化"}, {"depth": 3, "slug": "构造分类器", "text": "构造分类器"}, {"depth": 2, "slug": "pytorch的工具", "text": "pytorch的工具"}, {"depth": 3, "slug": "TensorBoard的使用", "text": "TensorBoard的使用"}, {"depth": 4, "slug": "语法", "text": "语法"}, {"depth": 3, "slug": "transform使用", "text": "transform使用"}, {"depth": 4, "slug": "用法（以totensor-为例）", "text": "用法（以totensor()为例）"}, {"depth": 2, "slug": "pytorch数据集的读取", "text": "pytorch数据集的读取"}, {"depth": 3, "slug": "torchvision中的datasets和DataLoader", "text": "torchvision中的datasets和DataLoader"}, {"depth": 4, "slug": "dataset用法", "text": "dataset用法"}, {"depth": 4, "slug": "DataLoader用法", "text": "DataLoader用法"}]
---

## 深度学习的概念

深度学习从广义上来讲就是程序可以自己学习自己的意思。是指一个已经写好的代码程序经过大量的数据使得自身得到了发展

总共有三个部分的特征：

一、反向传播算法

二、特征提取能力

三、端到端之间的学习方法

## 学习pytorch

### 特点

中间有三个特点：

1、完全符合python编程（tensorflow就不行，是在python语法和TensorFlow自己有些格式之间转换）

2、方便的张量（tensor）计算 –>可以将变量加载到GPU（图形处理器）上

3、对动态计算图的支持 —->动态计算图，是pytorch的特有特性，是可以用来表示反向传播算法的一种图示

![文章配图](/media/legacy/2faed0c87e88-20210806235217.png)

### 使用pytorch进行深度学习的步骤

#### 构建神经网络模型


```python
neu = torch.nn.Sequential(
	torch.nn.Linear(input_size,hidden_size), #输入层到隐含层之间的线性运算
	torch.nn.Sigmoid(),		#作用在对隐含层的每一个神经元
	torch.nn.Linear(hidden_size,output_size),  #从隐含层到输出层的线性运算
)	
```


这个格式的参数输入可以将所有神经网络的参数储存在neu.parameters中

**其中输入层的每一个神经元都是多维向量的一个维度**

![文章配图](/media/legacy/af985d5a464f-20210807204929.png)

#### 建立损失函数和优化器

##### 损失函数

用来评价模型的**预测值**和**真实值**不一样的程度，损失函数越好，通常模型的性能越好。不同的模型用的损失函数一般也不一样。

pytorch中的损失函数


```python
cost = torch.nn.MSELoss()
```


torch.nn.MSELoss() <——–> torch.mean((y-y\*)^2)

意识是预测值和真实值差的平方的平均值

cost是函数指针，指向这个mseloss函数

##### 优化器


```python
optimizer = torch.optim.SGD(neu.parameters(),lr=0.01)
```


neu.parameters是定义好的神经网络中的所有等待被优化的所有参数的集合

lr是学习效率参数

#### 对神经网络进行分批次训练

## 预处理

### 数据预处理

类型变量：数值的大小没有特殊的含义。比如说预测当地此时具有的共享单车数的时候的”星期几”这个变量。与之相对的是–特征变量(特征属性，在一个表中的特征列)

### 预处理手段

一、对类型变量进行类型编码，比如one-hot编码

二、数据变量标准化(归一化)，对数值变量进行统一化运算，使其更加方便运算。(比如对数据减去均值再除以方差)

![文章配图](/media/legacy/310d15e5b635-20210807203214.png)

三、分批训练，将其分类为训练集、测试集。还有将其切分成小批，一批一批地进入神经网络，每一批训练网络一次

## 实例：关于分类相关的深度学习

例子：文本分类的问题

### 文本向量化

文本向量化是将一个不固定长度的文本变成一个固定长度的向量

所采用的技术就是**词袋模型**

**词袋模型**是指将一段文本的所有词视为一个装满文本的大袋子，忽略单词之间的顺序，只看频率，并且将这个大袋子中的单词全部变成向量，有多少个单词就是多少维的向量

举例：


```text
我 爱 北京 天安门
每个 人 都有 一个 爱 的 人
```


那么我们对应的单词表就是

{我，爱，北京，天安门，每个，人，都有，一个，的}—–> 九维向量


```text
我 爱 北京 天安门
{1/4，1/4，1/4，1/4，0，0，0，0，0}  #向量表示
每个 人 都有 一个 爱 的 人
{0，1/7，0，0，1/7，2/7，1/7，1/7，1/7} #向量表示
```


### 构造分类器


```text
model = nn.Sequential(
	nn.Linear(input_size,hidden_size),
	nn.ReLU(), #在计算的速度上更快，并且有利于梯度信息的传递，在一定程度上避免了梯度爆炸的问题
	nn.Linear(hidden_size,2), #2是因为这个就是个分类，我们假设分成2类
	nn.LogSoftmax(dim=), #用于解决分类问题的分类输出层计算
)
```


## pytorch的工具

### TensorBoard的使用

TensorBoard是一个对于我们想要展示的图片的展示平台

在存在pytorch的环境里面的终端使用命令


```bat
tensorboard --logdir logs(这个是你规定的文件夹名) --port 你的端口
```


![文章配图](/media/legacy/64bcd2095472-20210913155329.png)

#### 语法

首先需要导入包


```python
from torch.utils.tensorboard import SummaryWriter
from PIL import Image
import numpy as np
```


对SummaryWriter生成对象，使用PIL来将路径中的图片来变成对象


```text
writer = SummaryWriter('logs')
img_path = 'data/train/ants_img/5650366_e22b7e1065.jpg'
image_PIL = Image.open(img_path)
```


使用numpy把PIL的对象变成numpy的数组，再导入进Writer对象，（writer中只接受numpy数组或者其他的参数，反正PIL的不行）


```python
img_array = np.array(image_PIL)
writer.add_image('train',img_array,1,dataformats='HWC') 
//参数分别是名字，数组（数据），1是指step，每次变的话可要在tensorboard上有很多步骤，hwc是一种格式问题
```


![image-20210913162314922](/img/missing-image.svg)

或者我如果想要添加数组，做图像


```python
for i in range(100):
    writer.add_scalar("y=5x",3*i,i)
```


![文章配图](/media/legacy/5a77a28a4ad1-20210913162217.png)

最后关闭函数


```python
writer.close()
```


### transform使用

transform是pytorch中的一个工具箱，里面有很多的功能工具

一般来说是用来对图片做一些处理，输入一个图片，输出一个结果

#### 用法（以totensor()为例）

首先弄一个对象，transform的对象，再输入一个图片类型 就可以对其操作，进行输出


```text
from torch.utils.tensorboard import SummaryWriter
import cv2
from torchvision.transforms import transforms

img_path='data/train/ants_img/5650366_e22b7e1065.jpg'
writer = SummaryWriter('logs')
img = cv2.imread(img_path)

tensor_trans = transforms.ToTensor()
trans_img = tensor_trans(img)

writer.add_image('test1', trans_img)

writer.close()
```


还有很多其他的，compose()主要是合并，resize()是改变图片大小

就懒得讲了

## pytorch数据集的读取

### torchvision中的datasets和DataLoader

这是一个图片的数据集的模块，有关图片的数据的读取利用都是用这个模块

#### dataset用法


```python
import torchvision
from torch.utils.tensorboard import SummaryWriter


dataset_transform = torchvision.transforms.Compose([
    torchvision.transforms.ToTensor()
])

train_set = torchvision.datasets.CIFAR10(root='./dayo2/dataset',train=True,transform=dataset_transform,download=True)
//train 是指算不算训练集，transform是对这个数据集开始使用的工具

test_set = torchvision.datasets.CIFAR10(root='./dayo2/dataset',train=False,transform=dataset_transform,download=True)
```


#### DataLoader用法


```python
test_loader = DataLoader(dataset=test_set, batch_size=64, shuffle=True, drop_last=False)
//参数分别是之前的数据集，batch_size是一次性取出来的数目，shuffle是指是否两次之间要打乱抽取，drop_last为False指最后不足64的要不要舍弃
writer = SummaryWriter("day03_log")

for epoch in range(2):
    step=0
    for data in test_loader:
        img,target = data
        writer.add_images("epoch:{}".format(epoch),img,global_step=step)
        step +=1
writer.close()
```


![文章配图](/media/legacy/49be4e79d933-20210914093625.png)
