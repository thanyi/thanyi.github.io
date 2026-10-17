---
title: "flask框架的使用教程"
pubDatetime: 2021-06-04T16:00:00.000Z
modDatetime: 2021-06-05T12:41:00.975Z
description: "这个是关于我们要做的项目的学习 我们用了flask框架 虚拟环境的配置保证了到时候项目交接的时候"
tags: ["技术", "flask"]
categories: ["教程", "flask"]
legacyHeadings: [{"depth": 2, "slug": "flask", "text": "flask"}, {"depth": 3, "slug": "虚拟环境", "text": "虚拟环境"}, {"depth": 3, "slug": "配置文件", "text": "配置文件"}, {"depth": 3, "slug": "路由", "text": "路由"}, {"depth": 4, "slug": "路由的变量规则", "text": "路由的变量规则"}, {"depth": 4, "slug": "路由中url重定向行为", "text": "路由中url重定向行为"}, {"depth": 4, "slug": "路由的返回值", "text": "路由的返回值"}, {"depth": 4, "slug": "关于make-response", "text": "关于make_response"}, {"depth": 4, "slug": "response和request对象", "text": "response和request对象"}, {"depth": 3, "slug": "模板", "text": "模板"}, {"depth": 4, "slug": "对于HTML里面有from表单的情况", "text": "对于HTML里面有from表单的情况"}, {"depth": 4, "slug": "补充：json", "text": "补充：json"}, {"depth": 4, "slug": "重定向", "text": "重定向"}, {"depth": 4, "slug": "模板的参数投递", "text": "模板的参数投递"}, {"depth": 5, "slug": "语句块", "text": "语句块"}, {"depth": 5, "slug": "过滤器", "text": "过滤器"}, {"depth": 5, "slug": "自定义过滤器", "text": "自定义过滤器"}, {"depth": 4, "slug": "模板复用", "text": "模板复用"}, {"depth": 5, "slug": "模块继承", "text": "模块继承"}, {"depth": 5, "slug": "包含", "text": "包含"}, {"depth": 5, "slug": "宏", "text": "宏"}, {"depth": 4, "slug": "引用static文件夹中的文件", "text": "引用static文件夹中的文件"}, {"depth": 3, "slug": "蓝图", "text": "蓝图"}, {"depth": 4, "slug": "视图", "text": "视图"}, {"depth": 4, "slug": "蓝图是什么", "text": "蓝图是什么"}, {"depth": 5, "slug": "蓝图中的Flask-name", "text": "蓝图中的Flask(_ name _)"}, {"depth": 4, "slug": "项目中的关于表的删除操作", "text": "项目中的关于表的删除操作"}, {"depth": 3, "slug": "flask-script", "text": "flask-script"}, {"depth": 3, "slug": "ORM", "text": "ORM"}, {"depth": 4, "slug": "在flask中与之相关的库", "text": "在flask中与之相关的库"}, {"depth": 5, "slug": "SQLALchemy", "text": "SQLALchemy"}, {"depth": 5, "slug": "flask-sqlalchemy", "text": "flask-sqlalchemy"}, {"depth": 5, "slug": "flask-migrate", "text": "flask-migrate"}, {"depth": 4, "slug": "配置文件-1", "text": "配置文件"}, {"depth": 4, "slug": "app和ORM", "text": "app和ORM"}, {"depth": 5, "slug": "app和SQLAlchemy关联", "text": "app和SQLAlchemy关联"}, {"depth": 5, "slug": "app和flask-migrate", "text": "app和flask-migrate"}, {"depth": 3, "slug": "模型", "text": "模型"}, {"depth": 5, "slug": "db对象的一些方法", "text": "db对象的一些方法"}, {"depth": 5, "slug": "关于对数据库的操作", "text": "关于对数据库的操作"}, {"depth": 3, "slug": "关于直接在前端对后端数据库的操作", "text": "关于直接在前端对后端数据库的操作"}, {"depth": 3, "slug": "表与表之间的关联", "text": "表与表之间的关联"}]
---

## flask

这个是关于我们要做的项目的学习

我们用了flask框架

### 虚拟环境

虚拟环境的配置保证了到时候项目交接的时候

让别的组员不用也在pip上面 配置很多东西

直接就放在这个项目包里面了

### 配置文件

在flask的文件项目里面可以自己新建一个settings.py

里面就是普通的关于配置的书写


```text
ENV ="development"
DEBUG = True
```


然后在app.py中


```text
app.config.from_object(settings)
```


就可以开始实施配置文件了

### 路由

在pycharm中弄了flask项目以后，有


```python
@app.route('/')
def hello_world():
    return 'Hello World!'
```


这个是一个装饰器，也就是可以翻译成


```python
 def hello_world():    
 	return 'Hello World!'
 	
 app.add_url_rule('/',view_func=index)
```


将路由和这个视图函数绑定在一起

注：app是一个Flask类弄出的对象，是整个flask项目的中心

具有各种和项目相关的方法和变量

#### 路由的变量规则

路由可以在里面加入一些变量，放入在路由里面的


```python
@app.route('/index/<str:key>')
def hello_world(key):
    return 'Hello World!'
```


key是一个变量，也可以不叫key，然后这个路由里面一旦涉及一个<..>变量，所对应的函数就要多一个参数,默认是字符串类型

这些类型就是那些数据类型

还有一个path和uuid类型，了解就行

#### 路由中url重定向行为

在路由中，如果我的定义是最后有个”/“

比如


```python
@app.route('/index/')
```


它会具有重定向。也就是说如果我在浏览器里面是写的”/index/“

它也会重定向到”/index”这里，顺便一说此时的返回状态码是30x(也就是说302、308)这些，和重定向有关的状态码

#### 路由的返回值

return的那些字符串都是进入了Respone中，Response（“返回的字符串”）


```python
@app.route('/')
def hello_world():
    return 'Hello World!'
```


这个return ‘Hello World!’

等价于 return Response (‘Hello World!’)

这个Respone中的参数就是web中response中的一些参数

![文章配图](/media/legacy/583a0e69f648-20210605203610.png)

return 的返回值可以是元组，在这个情况下后面的跟着的可以是响应码


```python
@app.route('/')
def hello_world():
    return 'Hello World!',404
```


那这个页面就会直接变成404的样子，也就是在响应报文中有个404了

#### 关于make\_response

这个话题我还不知道放在哪里我就直接放在这个路由版块了


```python
response = make_response("这是一个文本")
```


这个创建了一个response对象，在视图函数里面就可以直接返回这个对象，这就是一个响应对象

还可以通过


```python
response.headers["aaa"]="fff"
```


来在响应头里加一个参数

#### response和request对象

上面那个应该是就response对象的用法但我不想改顺序了

那这里就讲request

直接在flask里面导入进来就好了（原来import里真的可以直接导对象啊）

request可以直接调用其中的变量

### 模板

render\_template(“xxx.html”)

这个方法是flask自带的，一直就有

里面的xxx.html是指在templates文件夹里面的名字

![文章配图](/media/legacy/9c14925d303d-20210605203630.png)

#### 对于HTML里面有from表单的情况

这个form表单里面的action属性

表示了提交以后要进入的路径


```html
<from action="/xxx" method="get">
    <input type="text" name = "username">
</from>
```


这个name属性很重要，是你用来传参的地方

你可以通过request.args.get(‘username’)

直接吧你输入的值拿到

而对于post方法

你首先要这样


```python
@app.route('/',methods=['GET','POST'])
```


然后使用request.form.get(‘username’)

这样才可以

#### 补充：json

这是个关于json用法的补充

json我之前一直没怎么学好

json是一个字符串格式，应该是属于字符串那个范围

在python中，列表变成json格式字符串：


```python
json_str = json.dumps(列表变量名)
```


#### 重定向

重定向有个状态码302

302表示就是重定向，表示浏览器接收到了302，发现自己应该转一个地址，就直接转过去了，此时浏览器还要在发一个请求给服务器，表示我再要一个给之前重定向的那个url，请给我这个url的响应

在flask中，这个重定向是直接有一个redirect函数可以来使用，应该也是在flask里面自己就有的，都不需要换什么


```python
return redirect("要换的地址")
```


![文章配图](/media/legacy/c2ca2f8ae64f-20210605203700.png) 而redirect常常和url\_for搭配起来使用

url\_for 感觉也就是给一个很长的路径弄一个比较好记的小名

它也是一个flask自带的函数，可以直接用

用法是首先


```python
@app.route('/',methods=['GET','POST'],endpoint='小名')
```


然后在你想用的地方


```python
url_for('小名')
```


就好了

#### 模板的参数投递


```python
render_template("你的HTML"，变量名= flask里面弄的变量名)
```


在html里面就是


```text
{{变量名}}
```


这个变量如果在flask里面没有就是空白字符串

这个我学过了所以不多讲了

**这里面的语法对于python的所有语法都适用**

顺便一说这些都是先在render\_template里面，也就是jinjia2这个模板引擎里面进行了渲染，然后才开始return到浏览器的


```text
对列表：
{{list.0}}或者{{list[0]}}
字典：
{{dic.item}}
对象：
{{对象.属性}}
```


##### 语句块

循环的语句块：

if的语句块：

##### 过滤器

过滤器就是一个函数，不过是在模板里定义的自带的函数，

用法是：


```text
{{变量名 | 过滤器（参数）}}
```


参数可以有也可以没有

常用的过滤器：

safe、capitalize、upper、reverse、format、truncate

有字典的也有list的各种方法，基本上和python里面都差不多

在语句块里面也差不多，语句块里面可以直接使用方法

##### 自定义过滤器

方法一：

app.add\_template\_filter(在app.py里面的函数名，“你想要使用时候用的名字”)

方法二：

使用装饰器，在这个定义的函数前面写一个

@app.template\_filter(“你想要它叫的名字”)

#### 模板复用

##### 模块继承

要用一个语句块


```html
{% block 名字 %}

{% endblock %}
```


就是说这几个都是这个HTML里面可以改的地方

然后开始继承

在子模板里面


```text
{% extends ’index.html' %}
```


这个index.html是你想要继承的那个html

然后你现在改的也就只有父本里面的那些block的地方

然后这个时候要注意是写的那个自己的名字

也就是说在子模板里面是只有


```html
{% block 名字 %}

{% endblock %}
```


的形式的

##### 包含

这是一个include

格式是


```html
{% include '文件夹/xxx.html'%}
```


这个方法适用于在A,B,C中有一些共同的部分，但其他页面没有这个部分

所以A,B,C里面直接include就好了

##### 宏

宏有点像是python里面的函数，它的格式是这样的：


```html
{% macro 函数名(变量)%}
	。。。
{% endmacro %}
```


这个我感觉和include也有那么一点像

也就是说我可以把这个macro也就是这个像函数一样的东西放在一个HTML文件里面，然后在其他文件里面引用它，格式为：


```html
{% import '文件路径名' as 别名 %}
{{ 别名.方法(参数) }}
```


#### 引用static文件夹中的文件

这涉及到要使用url\_for

我们可以知道之前说url\_for是为了方便写各种各样的很长的路由，但是url\_for还有其他用法

比如说在要引入css文件的时候，我们使用url\_for


```html
<link rel="stylesheet" href="{{url_for('static',filename = 'css/style.css')}}"
```


这个是在flask里面的一个默认规定，它表示直接引用了static文件夹里面的css文件夹中的style.css

它将static作为了url\_for里面的一个特殊条件，这个条件后面必须要有filename, 将’css/style.css’变成非关键参数，使得关键参数只有‘static’这一个

### 蓝图

#### 视图

认识蓝图之前，我们首先要理清楚视图是个什么

视图就是在flask里面那些之前和路由联系在一起的函数，它们把路由连接起来返回数据传给浏览器

#### 蓝图是什么

蓝图是指将一些视图按照一些分类规矩分成的一个块

也就是说原本乱七八糟的视图函数们，在这里变成了稍微可以归类的一个个版块，里面有着一个个视图

蓝图对象连接着一些在一个主题里面的路由

通过蓝图对象注册在app对像来使得app对象中可以识别这些路由

##### 蓝图中的Flask(\_ *name* \_)

这个类的构造方法是把templates和static的路径设定好的，所以如果你是在做项目，需要把这个路径改一改


```python
蓝图对象名称 = Flask(__name__,template_folder='要改的路径',static_folder = '要改的路径')
```


#### 项目中的关于表的删除操作

通过js代码可以进行删除

js中location对象 location.href=’替换的一个路由’，还可以把参数用get方法的形式放在里面

这就进入了一个新的视图函数，这样就可以在那个视图函数里面进行表的删减

### flask-script

这个是用来和数据库做关系的一个模块

居然只能和flask1.1.2作一起使用，看来这个也是一件很老的东西了，唉，将就用吧

命令行中运行


```bat
python app.py runserver
```


这个命令行部分还可以自定义命令

在一个函数上面加上装饰器

@manager.command

就好了

### ORM

所谓ORM，指的是将数据库和类联系起来的一种映射关系

这个关系是

类<———>字段名

对象<———->一条数据

将这个映射关系的使用，这就是ORM的作用

#### 在flask中与之相关的库

##### SQLALchemy

这个是一个关于实现我们所谓ORM关系的库，是基础

##### flask-sqlalchemy

这是基于SQLAlchemy的一个库，由于SQLAlchemy的复杂性，flask中将其做了一步简化，使其比较方便

##### flask-migrate

用于实现ORM映射的命令

#### 配置文件

中间有一个和数据库进行连接的配置：


```python
SQLALCHEMY_DATABASE_URI='mysql+pymysql://user:password@hostip:port/db_name'
```


这里面的都是概念名字，用到了自己记得换

#### app和ORM

##### app和SQLAlchemy关联

这两个是需要关联的东西，app对象和db=SQLAlchemy()对象进行关联：

db是在ext文件夹中实现

然后在apps的\_ *init* \_.py中


```python
def create_app():
    app = Flask(__name__,template_folder='../templates',static_folder='../static')
	
    app.config.from_object(settings.DevelopmentConfig)
    db.init_app(app) #进行的绑定
  
    app.register_blueprint(user_bp)

```


注意其中的顺序问题，一定要是先配置了文件，然后在对db进行和app的连接

##### app和flask-migrate

migrate对象是和app和db对象都产生关联了

（flask-migrate要是2.5.3版本才能弄MigrateCommand太离谱了）

在app.py中


```python
migrate = Migrate(app=app,db=db)
manager.add_command('db',MigrateCommand)
```


### 模型

model模型，也就是类，在model.py中

也就是是和表相对应的那个类，大概的格式是


```python
class User(db.Model):
 	id = db.column(db.Integer, primary_key=True,autoincrement = True)
    username = db.column(db.String(15), nullable = False)
    password = db.column(db.String(12), nullabe = True)
    phone = db.column(db.String(11), unique = True)
    rdatetime = db.column(db.DateTime, default = datetime.now)
```


使用命令：

1. 记得创建了模型以后要导入模型
2. 在终端使用命令db init


```bat
python app.py db init
```


会生成一个migration文件夹

再弄一个命令


```python
python app.py db migrate
```


要记得先把数据库打开啊


```python
python app.py db upgrade
```


顺便一说这样确定了之后如果只是对这个表的增删改查好像就已经可以不用打开数据库了

##### db对象的一些方法

db.session.add(模型) 添加一个模型进db对象的缓存里面（感觉是这个意思）

db.session.commit() 提交这个缓存

##### 关于对数据库的操作

对数据库的操作在flask里面就是对model类的对象和db对象的一些操作

我们数据库的创建是用了上面的upgrade命令

插入和查询操作就是直接


```python
db.session.add()
db.session.commit() 	#添加行数据和提交

User.query.all()  #查找这个表的所有
User.query.filer_by(表中的参数名 = 函数中的参数名) #查找你想要的行，返回的是一个列表，可以说这个列表里面都是一个个数据对象
User.query.get(1) #按照主键来查询 返回一个用户对象
```



```python
User.qurey.filter(User.username == "想要查的变量").all() 	#返回的是一个列表，列表里面是对象
User.query.filter(User.username.startswith('z')).all()
User.query.filter(User.username.endswith('z')).all()
User.query.filter(User.username.contains('z')).all()
User.query.filter(User.username.like('z%')).all()
User.query.filter(or_(User.username.startwith('z'),User.username.startwith('z'))).all()
User.query.filter(and_(User.username.like('z%'),User.id.__gt__('2'))).all() # id>2 and username like 'z% ' 这个也可以直接用> 和 < 号的
```


or\_ 和and\_ 都是要import的

排序：order\_by


```text
user_list = User.query.filter(User.username.contains('z')).order_by(-User.rdatetime).all()  # 先筛选再排序
user_list = User.query.order_by(-User.id).all()  对所有的进行排序
注意：order_by(参数)：
1。 直接是字符串： '字段名'  但是不能倒序
2。 填字段名： 模型.字段    order_by(-模型.字段)  倒序

```


限制： limit


```text
limit的使用 + offset
user_list = User.query.limit(2).all()   默认获取前两条
user_list = User.query.offset(2).limit(2).all()   跳过2条记录再获取两条记录
```


### 关于直接在前端对后端数据库的操作

通过对标签的修改加上js的辅助，用JavaScript来使其进入另一个路由，在这个理由里面定义视图函数，用这个函数的返回值来表示响应

### 表与表之间的关联


```python
class Article(db.Model):
    ...
	uer_id =  db.Column(db.Integer,db.ForeignKey('user.id'),nullable = Flase)
    
class User(db.Model):
    ...
    articles = db.relationship('Article',backref='user')
    
```


上面这个是一对多关系的时候需要用。表示一个user对应多个article

如果是多对多的关系的话，要注意：要弄一个第三方的表，这个表来方便将两张多对多关系的表实现连接
