
# MySQL操作手册

* 此文为个人笔记，MySQL命令不区分大小写
* 空格符复制有时会出现格式错误，删掉空格再自己打一个
* \`(反引号)是转义字符，当你自定义名字和关键字冲突可以 \`name\` 括起来
* by [zsh](http://www.yesiare.cn)

## 1 MySQL安装

### 1.1 linux安装

* Ubuntu下用apt，Centos用yum

```shell
sudo apt‐get install mysql‐server
sudo apt‐get install mysql‐client
sudo apt‐get install libmysqlclient‐dev
```

配置文件目录  `  /etc/mysql/mysql.conf.d/mysqld.cnf`

### 1.2 密码修改

```shell
kirito@host:~$ mysqladmin ‐u用户名 ‐p旧密码 password 新密码
kirito@host:~$ mysqladmin ‐uroot ‐p111111 password 123456
```



* 如果修改不了，`sudo mysql -uroot`，进入数据库

```mysql
mysql> update mysql.user set authentication_string=PASSWORD('newPwd'), plugin='mysql_native_password' where user='root';
mysql> flush privileges;
```

### 1.3 MySQL登陆

```shell
kirito@host:~$ mysql ‐h数据库服务器安装的主机 ‐P数据库端口 ‐u账户 ‐p密码
kirito@host:~$ mysql ‐h127.0.0.1 ‐P3306 ‐uroot ‐p123456
```

## 2 数据库基础

### 2.1 库操作

```mysql
# 查看数据库服务器存在哪些数据库
SHOW  DATABASES;
# 使用指定的数据库
USE database_name;
# 查看指定的数据库中有哪些数据表
SHOW TABLES;

# 创建指定名称的数据库
CREATE DATABASE database_name;
# 删除数据库
DROP DATABASE database_name;
```

### 2.2 表操作

* 创建一个表

```mysql
CREATE TABLE 表名(
   列名1    列的类型   [属性约束],
   列名2    列的类型   [属性约束],
   ....
   列名N    列的类型   [属性约束]   
);
# 如果名字和命令名冲突，此时使用反引号(`)括起来
```

* 查看表结构

```mysql
DESC name;
```

* 查看表的详细定义

```mysql
SHOW CREATE TABLE name;
```

* 删除表

```mysql
DROP TABLE name;
```

* 往表中插入一行数据

```mysql
# 为所有表单项赋值，插入
CREATE TABLE test(id INT,_date DATE);
INSERT INTO test  VALUES(1,'2008‐12‐2');

# 选择赋值
CREATE TABLE  test4(id INT,_datetime DATETIME);
INSERT INTO test4(id, _datetime) VALUES(1, '1990‐02‐10');

/*
DATE可以通过CURDATE()来赋值当前的日期，
TIME可以通过CURTIME()来赋值当前的时间，
DATETIME与TIMESTAMP都可以通过函数NOW()来赋值当前的时间日期。
 */
```

* 修改已有表字符集

```mysql
ALTER TABLE 表名 CONVERT TO CHARACTER SET utf8; # or gbk
# 若想仅修改某一列的字符集 使用列操作添加约束属性 CHARACTER SET name
```

* 修改表名

```mysql
ALTER TABLE 表名 RENAME TO 新表名;
```



### 2.3 列操作

**列（字段）**

* 给表添加列

```mysql
ALTER TABLE 表名 ADD 列名 列的类型 [属性约束];
ALTER TABLE 表名 ADD 列名 列的类型 [属性约束] FIRST; /*放在第一位*/
ALTER TABLE 表名 ADD 列名 列的类型 AFTER 列名; /*放在某字段后面*/
```

* 修改已有列数据类型，约束

```mysql
ALTER TABLE 表名 MODIFY 列名 列的类型 [属性约束];
```

* 删除列

```mysql
ALTER TABLE 表名 DROP 列名;
```

* 修改列名，和类型

```mysql
ALTER TABLE 表名 CHANGE 列名 新_列名 列的类型 [属性约束]; # 列名不一定要新的，
```

### 2.4 列.属性约束

| MySOL关键字        | 含义                                                         |
| ------------------ | ------------------------------------------------------------ |
| NULL               | 数据列可包含NULL值 ，默认不填即为NULL。                      |
| NOT NULL           | 数据列不允许包含NULL值 ，在操作数据库时如果输入该字段的数据为NULL ，就会报错。 |
| DEFAULT            | 默认值，DATE，TIME不能使用函数默认值。DATETIME与TIMESTAMP可以使用NOW()函数默认值。 |
| PRIMARY KEY        | 主键 ，您可以使用多列来定义主键，列间以逗号分隔。主键不管有没NOT NULL修饰，都不能为NULL，主键值不能重复。主键可以由多个字段组成。例如：PRIMARY KEY (id, name) |
| AUTO_INCREMENT     | 定义列为自增的属性，数值会自动加1, 默认初始值为0。一个表只能有一个自增字段，并且该字段必须是主键或者索引。 |
| UNSIGNED           | 无符号                                                       |
| CHARACTER SET name | 指定一个字符集                                               |

#### 2.4.1 列默认值 DEFAULT

在未指定默认值的情况下，系统提供default null这样的约束。只有列中提供了default，在插入时，才可以省略。

```mysql
# 设置/删除 DEFAULT
ALTER TABLE 表名 ALTER 列名 SET DEFAULT 默认值;
ALTER TABLE 表名 ALTER 列名 DROP  DEFAULT;
```



#### 2.4.2  非空约束 NOT NULL

NULL存在的意义在于标志。
NULL类型特征:所有的类型的值都可以是null，包括int、float等数据类型,空字符串是不等于null，0也不等于null。
非空约束用于确保当前列的值不为空值，非空约束只能出现在表对象的列上。

```mysql
# 已有，设置
ALTER TABLE 表名 MODIFY 列名 INT NOT NULL DEFAULT 0;
# 创建表
mysql> CREATE TABLE stu2 (
  id INT DEFAULT NULL,
  sex CHAR(2) NOT NULL
)

# 效果 不能默认初始化
mysql> INSERT INTO stu2   VALUES();
ERROR 1364 (HY000): Field 'sex' doesn't have a default value
```



#### 2.4.3 唯一约束 UNIQUE KEY

唯一约束是指定table的列或列组合不能重复，保证数据的唯一性。虽然唯一约束不允许出现重复的值，但是可以有多个null，同一个表可以有多个唯一约束，多个列组合的约束。
在创建唯一约束的时候，如果不给唯一约束名称，就默认和列名相同。 MySQL会给唯一约束的列上默认创建一个唯一索引.

```mysql
mysql> CREATE  TABLE stu3(id INT UNIQUE, sex CHAR(2));
mysql> CREATE TABLE stu3(id INT, sex CHAR(2), UNIQUE(id)); # 第二种写法

# 效果 插入重复值报错
mysql> INSERT INTO  stu3 VALUES(1,'f');
Query OK, 1 row affected (0.00 sec)

mysql> INSERT INTO  stu3 VALUES(1,'f');
ERROR 1062 (23000): Duplicate entry '1' for key 'id'
```

#### 2.4.4  主键约束 PRIMARY KEY

每个表最多只允许一个主键，建立主键约束可以在列级别创建，也可以在表级别上创建。
MySQL的主键名总是PRIMARY KEY， 当创建主键约束时，系统默认会在所在的列或列组合上建立对应的唯一索引。

```mysql
#已有表，修改，删除
ALTER TABLE table_name ADD primary key(column_name); /*必须是不存在重复值的列*/
ALTER TABLE table_name DROP primary key;
# 创建时设置
mysql> CREATE TABLE stu4(id INT PRIMARY KEY, sex CHAR(2));
mysql> CREATE TABLE stu4(id INT, sex CHAR(2), PRIMARY KEY(id)); # 第二种写法

# 效果 只能有一个列为主键，且没有重复
mysql> INSERT INTO stu4(id,sex) VALUES(1,'f');
Query OK, 1 row affected (0.00 sec)

mysql> INSERT INTO stu4(id,sex) VALUES(1,'f');
ERROR 1062 (23000): Duplicate entry '1' for key 'PRIMARY'
```

#### 2.4.5 自增约束 AUTO_INCREMENT

MySQL的中AUTO_INCREMENT类型的属性用于为一个表中记录自动生成ID功能。一个表只能有一个自增字段，并且该字段必须是主键或者索引。

```mysql
ALTER TABLE 表名 CHANGE id id INT AUTO_INCREMENT; #必须先是索引
ALTER TABLE 表名 AUTO_INCREMENT=number; # 设置初始值
# 创建时
mysql> CREATE TABLE stu5(id INT AUTO_INCREMENT,sex CHAR(2)); # 错误，必须是索引
 ERROR 1075 (42000): Incorrect table definition; there can be only one auto column and it must be defined as a key
 
 mysql> CREATE TABLE stu5(id INT PRIMARY KEY AUTO_INCREMENT ,sex CHAR(2)); # 正确方式
 mysql> CREATE TABLE stu6(id INT UNIQUE KEY AUTO_INCREMENT ,sex CHAR(2)); # 正确方式
 
 # 效果  不提供初始值，自动递增分配， 提供重复的则报错
```

### 2.4 行操作

* 行增

```mysql
INSERT INTO 表名( 字段1, 字段2,... 字段N ) VALUES( value1, value2,... valueN );
# 字段（field）和值（value）都可以省略
```

* 行删

```mysql
DELETE FROM <表名> [WHERE <删除条件>]

# 栗子
delete from class where _id=9;
delete from class;
# 不跟条件表示删除整个表内容（不是整个表，框架还在），等价于
truncate table <表名>
```

* 行改

```mysql
UPDATE <表名> SET <列名=更新值> [WHERE <更新条件>]

# 栗子
update class SET score=100 WHERE name="郑同学";
```

## 3 行查询

### 3.1 全列查询/投影查询

```mysql
SELECT column_name0,column_name1...
FROM table_name0,table_name1...
[WHERE clause]
[LIMIT N] [OFFSET M ]

# 查询表phonelist所有字段信息
SELECT * FROM phonelist;
# 只查询名字（name）为小张的所有字段信息
SELECT * FROM phonelist WHERE name="小张";
```

### 3.2 消除重复

distinct 可用于一列，也可用于多列，使用后如果目标字段有重复的内容，只打印一个

```mysql
SELECT DISTINCT column_name0,column_name1...
FROM table_name0,table_name1...
[WHERE clause]
[LIMIT N] [OFFSET M ]

# 不出现重复打印班级里的同学名字
SELECT DISTINCT name FROM class;
```

### 3.3 算术操作符

* 对NUMBER型数据可以使用算数操作符创建表达式（+ - * /）
* 对DATE型数据可以使用算数操作符创建表达式（+ -）

```mysql
# 吧所有同学学号乘以10再打印
SELECT id*10 FROM class;
```

### 3.4 空值判断 IS NULL/IS NOT NULL

1. 空值是指不可用、未分配的值,也就是没有值。
2. 空值不等于零或空格
3. 任意类型都可以支持空值，也就是说任何类型的字段都可以允许空值作为值的存在
4. 空字符串和字符串为null的区别
5. 包括空值的任何算术表达式都等于空，使用IFNULL(expr1,expr2)来处理, expr1为NULL就用expr2替代。

```mysql
# 查询班级所有name字段不为空的所有信息
SELECT * FROM class WHERE name IS NOT NULL;
# 计算 学分 = 成绩/10，成绩为NULL的按0分算
SELECT IFNULL(score,0)/10 FROM class;
```

### 3.5 比较运算符

| 比较运算符               | 表达式              | 用法                                        |
| ------------------------ | ------------------- | ------------------------------------------- |
| 等于，不等于，大于，小于 | =,!=,<>,<,<=,>,>=   | WHERE num>=0 AND num<=10                    |
| 在两值之间（闭区间）     | BETWEEN ... AND ... | WHRER num BETWEEN 0 AND 10                  |
| 不在两值之间             | NOT BETEWEEN ...    | 同上，BETWEEN 前加 NOT                      |
| 匹配在集合中的值         | IN（list）          | WHERE name IN('abc','efg','h')              |
| 匹配不在集合中的值       | NOT IN（list）      | 同上                                        |
| 模糊匹配                 | LIKE                | WHRER name LIKE '%abc'  OR name LIKE 'abc_' |

* LIKE运算符必须使用通配符才有意义： 匹配单个字符` _ `匹配任意多个字符` % `

### 3.6 逻辑运算符

| 逻辑运算符 | 意义                                |
| ---------- | ----------------------------------- |
| AND        | 如果组合的条件都是true,返回true.    |
| OR         | 如果组合的条件 之一是true,返回true. |
| NOT        | 如果下面的条件是false,返回true.     |

### 3.7 结果排序

使用ORDER BY 子句将记录排序，ORDER BY 子句出现在SELECT语句的最后，ORDER BY 可以使用别名。ASC: 升序。DESC: 降序。缺省:升序。

```mysql
# 查询所有信息，按id降序排序
SELECT * FROM phonelist ORDER BY id DESC;
```

## 4 进阶

### 4.1 索引

#### 4.1.1 索引介绍

* 索引分单列索引和组合索引。

* 单列索引，即一个索引只包含单个列，一个表可以有多个单列索引，但这不是组合索引。

* 组合索引，即一个索引包含多个列。
* 创建索引时，你需要确保该索引是应用在SQL查询语句的条件(一般作为 WHERE 子句的条件)。
* 索引提高查询速度，降低更新表的速度。空间换时间

#### 4.1.2 索引操作

* 查看索引

```mysql
SHOW INDEX FROM 表名;
```

* 创建索引
  * 自动创建的索引，当在表上定义一个`PRIMARY KEY`时，自动创建一个对应的唯一索引。当在表上定义一个外键时，自动创建一个普通索引；
  * 手动创建的索引，用户可以创建索引以加速查询，在一列或者多列上创建索引。如果多列在一起，就叫做复合索引；在很多情况下，复合索引比单个索引更好。

```mysql
CREATE INDEX index_name ON 表名(列名); 			# index_name 自定义
CREATE UNIQUE INDEX index_name ON 表名(列名);   # unique 表示唯一索引
ALTER TABLE 表名 ADD INDEX index_name(列名);    # 列名有多个就是组合索引
CREATE TABLE `news`(                   	   
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `title` varchar(255) NOT NULL,
    `content` varchar(255) NULL,
    `time` varchar(20) NULL DEFAULT NULL,
    PRIMARY KEY (`id`), 
    INDEX index_name (title(255))
)# 创建表同时建立索引，PRIMARY KEY 其实也是索引
```

* 删除索引

```mysql
ALTER TABLE 表名 DROP INDEX index_name;
```

* 检查语句是否使用索引
  * 并不是所有情况下都会使用索引，只有当MySQL认为索引足够能够提升查询性能时才会使用；

```mysql
EXPLAIN select * from table_name where clause;
```

### 4.2 分页查询

* 分页查询：一般情况下，客户端通过传递 pageNo（页码）、pageSize（每页条数）两个参数去分页查询数据库中的数据，在数据量较小（元组百/千级）时使用 MySQL自带的 `limit` 来解决这个问题：

```mysql
# 从第n行开始，打印m条数据，行数从0开始，可以不加offset，默认从0开始
SELECT * FROM 表名 LIMIT m OFFSET n;

# 另一种写法，从第n行开始打印m条
select * from 表名 limit n,m;
```

### 4.3 函数

`select func();`可以查看函数效果；

#### 4.3.1 字符函数

| 函数               | 功能                     |
| ------------------ | ------------------------ |
| LOWER/UPPER        | 大小写转换               |
| CONCAT             | 字符连接                 |
| CHAR_LENGTH/LENGTH | 求字符串长度             |
| LPAD/RPAD          | 左/右 填充               |
| LTRIM/RTRIM/TRIM   | 去除 全部/左边/右边 空格 |
| REPLACE            | 替换                     |
| SUBSTRING          | 获取子串                 |

```mysql
SELECT LOWER("ABC"); # abc
SELECT UPPER("abc"); # ABC
SELECT CONCAT("china","is",UPPER("greate"));# china is GREATE

SELECT CHAR_LENGTH("abc"); # 3
SELECT LENGTH("china"); # 5
SELECT RPAD("abc",6,"xyz"); # abcxyz 
SELECT LPAD("abc",6,"X"); # XXXabc

SELECT  TRIM("  abc   ");

SELECT REPLACE("abc","b","BB"); # aBBc

SELECT SUBSTRING("abcchina",3); # cchina
SELECT SUBSTRING("abcchina",3,4); # cchi
SELECT SUBSTRING("abcchina",‐3); # ina
```

#### 4.3.2 数学函数

| 函数       | 功能          |
| ---------- | ------------- |
| ABS        | 求绝对值      |
| MOD        | 求模          |
| FLOOR/CEIL | 向下/向上取整 |
| ROUND      | 四舍五入      |
| TRUNCATE   | 按位数截断    |

```mysql
SELECT ABS(‐100); # 100
SELECT MOD(100,3); # 1

#一下都是对浮点型数字进行操作
SELECT FLOOR(1.23); # 1
SELECT CEIL(1.23); # 2

SELECT ROUND(3.145); # 3
SELECT ROUND(3.145,2);  # 3.15 保留俩位小数
SELECT TRUNCATE(3.14,1); # 3.1 截取小数点后1位
```

#### 4.3.3 日期函数

| 函数              | 功能                         |
| ----------------- | ---------------------------- |
| NOW               | 当前时间 2017-08-06 22:33:39 |
| YEAR              | 年                           |
| MONTH             | 月                           |
| DAY               | 日                           |
| HOUR              | 时                           |
| MINUTE            | 分                           |
| SECOND            | 秒                           |
| CURRENT_DATE      | 年-月-日                     |
| CURRENT_TIME      | 时：分：秒                   |
| LAST_DAY          | 所在月份的最后一天           |
| DATE_ADD/DATE_SUB | 增减                         |
| DATEDIFF          | 日期差                       |

```mysql
SELECT NOW(); # 2019-02-13 12:51:39
SELECT YEAR(NOW()); # 2019
SELECT MONTH(NOW()); # 2
SELECT DAY(NOW()); # 13
# HOUT MINUTE SECOND 用法同上

SELECT CURRENT_DATE(); # 2019-02-13  简写CURDATE()
SELECT CURRENT_TIME(); # 12:56:20  简写CURTIME()

SELECT LAST_DAY(NOW()); # 2019-02-28
SELECT LAST_DAY(str_to_date('2019-12-01 00:00:00','%Y-%m-%d %H:%i:%s')); # 2019-12-31

SELECT DATE_ADD(NOW(),INTERVAL 2 DAY); # 2019-02-15 13:02:01 
SELECT DATE_SUB(NOW(),INTERVAL 3 HOUR);

SELECT DATEDIFF(LAST_DAY(NOW()),NOW()); # 15 
```

#### 4.3.4 转换函数

| 函数        | 功能               |
| ----------- | ------------------ |
| FORMAT      | 数字到字符串的转化 |
| DATE_FORMAT | 时间到字符串       |
| STR_TO_DATE | 字符串到时间       |

```mysql
SELECT FORMAT(235235.346326,2); # 小数点保留2位 235,235.35

SELECT DATE_FORMAT(NOW(),'%b %d %Y %h:%i %p'); # Feb 13 2019 01:16 PM
SELECT DATE_FORMAT(NOW(),'%m-%d-%Y'); # 02-13-2019  

SELECT STR_TO_DATE('2019-12-01 00:00:00','%Y-%m-%d %H:%i:%s'); # 2019-12-01 00:00:00
```

#### 4.3.5 聚合函数

| 函数    | 功能                                     |
| ------- | ---------------------------------------- |
| COUNT() | 返回指定列中（满足条件的）非NULL值的个数 |
| AVG()   | 返回指定列（满足条件的）的平均值         |
| SUM()   | 返回指定列（满足条件的）的所有值之和     |
| MAX()   | 返回指定列（满足条件的）的最大值         |
| MIN()   | 返回指定列（满足条件的）的最小值         |

```mysql
# 计算班级 50分以上同学的分数最大差
SELECT MAX(score)‐MIN(score) FROM class WHERE;
```

### 4.4 分组查询

#### 4.4.1 GROUP BY

在对数据表中数据进行统计时，可能需要按照一定的类别分别进行统计，

如score字段中，值相同的行被视作一类（分组）

单独使用GROUP BY关键字，查询的是每个分组中的一条记录，意义不大。

一般情况下，GROUP BY都和聚合函数一起使用

```mysql
# 统计60分以上，各个分数的人数
SELECT COUNT(*),score FROM class WHERE score>60 GROUP BY score;
```

#### 4.4.2 HAVING

HAVING关键字和 `WHERE` 关键字的作用相同，都是用于设置条件表达式，对查询结果进行过滤。

两者的区别，HAVING关键字后，可以跟聚合函数，而WHERE关键字不能，通常情况下，HAVING关键字，都是和GROUP BY一起使用，用于对分组后的结果进行过滤

```mysql
## 统计60分以上，各个分数的人数, 并且只筛选相同分数的人数小于10人的分组
SELECT COUNT(*),score FROM class WHERE score>60 GROUP BY score HAVING count(*)<10;
```

### 4.5 多表查询

* 补充 可以给表起别名

```mysql
# 这里给表 phonelist 起了别名 p，多表操作别名很方便
SELECT p.name  FROM phonelist p where p.id=2;
```

* 多表查询,如果没有连接条件,则会产生笛卡尔积，实际运行环境下，应避免使用全笛卡尔集。

* 笛卡儿积，即如果有两个表，拿第一个表的一条数据跟第二个表每条数据都关联，这样的数据没有意义

* 在WHERE加入有效的连接条件（等值连接）。注意连接 n张表，至少需要 n-1个连接条件。

[这个博客讲的很清楚](https://blog.csdn.net/wei_cheng18/article/details/80718222)

```mysql
SELECT a.t1 b.msg FROM a,b WHERE a.id=b.id; #这里id就是连接条件，id相同才会被关联
```

### 4.6 主键和外键

* 主键约束(PRIMARY KEY): 约束在当前表中,指定列的值非空且唯一。

* 外键约束(FOREIGN KEY): A表中的外键列的值必须引用于于B表中的某主键列。

```mysql
ALTER TABLE `A` ADD FOREIGN KEY(`myid`) REFERENCES `B`(`id`);
```

* 如果建立外键后，要删除B中数据的时候，需要先删除A中相关的数据。
* 可以看作表A是B的附属，没有B，A就没有意义了；

### 4.7 子查询

* 子查询指的就是在一个查询之中嵌套了其他的若干查询。

* 在使用select语句查询数据时,有时候会遇到这样的情况，在where查询条件中的限制条件不是一个确定的值，而是一个来自于另一个查询的结果。

* 子查询一般出现在FROM和WHERE子句中。

#### 4.7.1 子查询返回单行单列

* 单行单列子查询：只包含一个字段的查询，返回的查询结果也只包含一行数据, 看做是一个值. 使用在WHERE之后。

```mysql
# 查询分数高于班级平均分的同学的姓名
SELECT name FROM class WHERE score>(SELECT AVG(score) FROM class);
```

#### 4.7.2 子查询返回多行单列

* 多行单列子查询：只包含了一个字段，但返回的查询结果可能多行或者零行，看做是多个值，使用在WHERE之后。

| 关键字 | 含义                         |
| ------ | ---------------------------- |
| IN     | 与列表中的任意一个值相等     |
| ANY    | 与子查询返回的任意一个值比较 |
| ALL    | 与子查询返回的每一个值比较   |

```mysql
# 查询工资等于部门经理的员工信息.
SELECT * FROM emp WHERE sal IN (SELECT sal FROM emp WHERE JOB='manager');
SELECT * FROM emp WHERE sal > ANY (SELECT sal FROM emp WHERE JOB='manager');
SELECT * FROM emp WHERE sal > ALL (SELECT sal FROM emp WHERE JOB='manager');
```

#### 4.7.3 子查询返回多行多列

* 多行多列子查询：包含多个字段的返回，查询结构可能是单行或者多行，看做是临时表，使用在FROM之后，临时表需要有别名。

```mysql
# tmp是临时表别名
SELECT tmp.* FROM (SELECT deptno,AVG(sal) avg_sal FROM emp GROUP BY deptno) tmp WHERE tmp.avg_sal > 2000;
```

### 4.8 备份与回复

* 备份

```bash
kirito@host:~$ mysqldump ‐u账户 ‐p密码 数据库名称>文件存储地址
# 栗子
kirito@host:~$ mysqldump ‐uroot ‐p123456 testDB> /home/kirito/testDB_bak.sql
```

* 恢复

```shell
kirito@host:~$ mysql ‐u账户 ‐p密码 数据库名称< 文件存储地址 （数据库要已存在）
# 栗子
kirito@host:~$ mysql ‐uroot ‐p123456 testDB< /home/kirito/_bak.sql
```

```mysql
# 也可以进入数据库导入
CREATE DATABASE testdb;
USE testdb;
SOURCE /home/kirito/_bak.sql;
```

### 4.9 SQL语句执行顺序

* 书写顺序

```mysql
SELECT [DISTINCT] [聚合函数]
FROM
WHERE
GROUP BY
HAVING
ORDER BY
```

* 执行顺序

```mysql
FROM
WHERE
GROUP BY   #从这里开始可以使用别名
聚合函数
HAVING
SELECT
DISTINCT
ORDER BY
```

## 5 事务处理(transaction)

在数据库中，所谓事务是指一组逻辑操作单元，使数据从一种状态变换到另一种状态。为确保数据库中数据的一致性，数据的操纵应当是离散的成组的逻辑单元:当它全部完成时，数据的一致性可以保持，而当这个单元中的一部分操作失败，整个事务应全部视为错误，所有从起始点以后的操作应全部回退到开始状态。

事务的操作:先定义开始一个事务，然后对数据作修改操作，这时如果提交(COMMIT)，这些修改就永久地保存下来，如果回退(ROLLBACK)，数据库管理系统将放弃您所作的所有修改而回到开始事务时的状态。

### 5.1 事务的ACID属性

1. 原子性（Atomicity）原子性是指事务是一个不可分割的工作单位，事务中的操作要么都发生，要么都不发生。
2. 一致性（Consistency）事务必须使数据库从一个一致性状态变换到另外一个一致性状态。(数据不被破坏).
3. 隔离性（Isolation）事务的隔离性是指一个事务的执行不能被其他事务干扰，即一个事务内部的操作及使用的数据对并发的其他事务是隔离的，并发执行的各个事务之间不能互相干扰,每一个事务都存在一个事务空间,彼此不干扰。
4. 持久性（Durability）持久性是指一个事务一旦被提交，它对数据库中数据的改变就是永久性的，接下来的其他操作和数据库故障不应该对其有任何影响.

### 5.2 事务语句

```mysql
BEGIN 	 # 开启一个事务
COMMIT 	 # 提交事务
ROLLBACK # 回滚事务

# 栗子
BEGIN;
SELECT * FROM class WHERE id=1;
UPDATE class SET score=100 WHERE id=1;
COMMIT;
```

### 5.3 事务并发问题

* 数据库的事务并发问题: 存在五种问题:脏读，不可重复读，幻读，第一类丢失更新，第二类丢失更新。
* 详细见附录

### 5.4 锁机制

* mysql中使用repeatable read模式，只存在第二类丢失更新，通过加锁的方式可以避免。

```mysql
for update # 加锁  锁释放发生在回滚和提交。
# lock in share mode # 共享锁
/*
for update仅适用于InnoDB，且必须在事务块(BEGIN/COMMIT)中才能生效。在进行事务操作时，通过“for
update”语句，MySQL会对查询结果集中每行数据都添加排他锁，其他线程对该记录的更新与删除操作都会阻塞。排他锁包含行锁、表锁。
*/

# 栗子
BEGIN;
SELECT * FROM class WHERE id=1 FOR UPDATE; # 加锁
UPDATE class SET score=100 WHERE id=1;
COMMIT; # 释放
```



## 附录

### A 数据类型

#### A.1 数值类型

MySQL支持所有标准SQL数值数据类型。

这些类型包括严格数值数据类型(INTEGER、SMALLINT、DECIMAL和NUMERIC)，以及近似数值数据类型(FLOAT、REAL和DOUBLE PRECISION)。

关键字INT是INTEGER的同义词，关键字DEC是DECIMAL的同义词。

 BIT数据类型保存位字段值，并且支持MyISAM、MEMORY、InnoDB和BDB表。 

 作为SQL标准的扩展，MySQL也支持整数类型TINYINT、MEDIUMINT和BIGINT。下面的表显示了需要的每个整数类型的存储和范围。 

| 类型         | 大小                                     | 范围（有符号）                                               | 范围（无符号）                                               | 用途            |
| ------------ | ---------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | --------------- |
| TINYINT      | 1 字节                                   | (-128，127)                                                  | (0，255)                                                     | 小整数值        |
| SMALLINT     | 2 字节                                   | (-32 768，32 767)                                            | (0，65 535)                                                  | 大整数值        |
| MEDIUMINT    | 3 字节                                   | (-8 388 608，8 388 607)                                      | (0，16 777 215)                                              | 大整数值        |
| INT或INTEGER | 4 字节                                   | (-2 147 483 648，2 147 483 647)                              | (0，4 294 967 295)                                           | 大整数值        |
| BIGINT       | 8 字节                                   | (-9,223,372,036,854,775,808，9 223 372 036 854 775 807)      | (0，18 446 744 073 709 551 615)                              | 极大整数值      |
| FLOAT        | 4 字节                                   | (-3.402 823 466 E+38，-1.175 494 351 E-38)，0，(1.175 494 351 E-38，3.402 823 466 351 E+38) | 0，(1.175 494 351 E-38，3.402 823 466 E+38)                  | 单精度 浮点数值 |
| DOUBLE       | 8 字节                                   | (-1.797 693 134 862 315 7 E+308，-2.225 073 858 507 201 4 E-308)，0，(2.225 073 858 507 201 4 E-308，1.797 693 134 862 315 7 E+308) | 0，(2.225 073 858 507 201 4 E-308，1.797 693 134 862 315 7 E+308) | 双精度 浮点数值 |
| DECIMAL      | 对DECIMAL(M,D) ，如果M>D，为M+2否则为D+2 | 依赖于M和D的值                                               | 依赖于M和D的值                                               | 小数值          |

#### A.2 日期和时间类型

表示时间值的日期和时间类型为DATETIME、DATE、TIMESTAMP、TIME和YEAR。

每个时间类型有一个有效值范围和一个"零"值，当指定不合法的MySQL不能表示的值时使用"零"值。

TIMESTAMP类型有专有的自动更新特性，将在后面描述。

| 类型      | 大小 (字节) | 范围                                                         | 格式                | 用途                     |
| --------- | ----------- | ------------------------------------------------------------ | ------------------- | ------------------------ |
| DATE      | 3           | 1000-01-01/9999-12-31                                        | YYYY-MM-DD          | 日期值                   |
| TIME      | 3           | '-838:59:59'/'838:59:59'                                     | HH:MM:SS            | 时间值或持续时间         |
| YEAR      | 1           | 1901/2155                                                    | YYYY                | 年份值                   |
| DATETIME  | 8           | 1000-01-01 00:00:00/9999-12-31 23:59:59                      | YYYY-MM-DD HH:MM:SS | 混合日期和时间值         |
| TIMESTAMP | 4           | 1970-01-01 00:00:00/2038   结束时间是第 **2147483647** 秒，北京时间 **2038-1-19 11:14:07**，格林尼治时间 2038年1月19日 凌晨 03:14:07 | YYYYMMDD HHMMSS     | 混合日期和时间值，时间戳 |

#### A.3 字符串类型

字符串类型指CHAR、VARCHAR、BINARY、VARBINARY、BLOB、TEXT、ENUM和SET。该节描述了这些类型如何工作以及如何在查询中使用这些类型。 

| 类型       | 大小                | 用途                            |
| ---------- | ------------------- | ------------------------------- |
| CHAR       | 0-255字节           | 定长字符串                      |
| VARCHAR    | 0-65535 字节        | 变长字符串                      |
| TINYBLOB   | 0-255字节           | 不超过 255 个字符的二进制字符串 |
| TINYTEXT   | 0-255字节           | 短文本字符串                    |
| BLOB       | 0-65 535字节        | 二进制形式的长文本数据          |
| TEXT       | 0-65 535字节        | 长文本数据                      |
| MEDIUMBLOB | 0-16 777 215字节    | 二进制形式的中等长度文本数据    |
| MEDIUMTEXT | 0-16 777 215字节    | 中等长度文本数据                |
| LONGBLOB   | 0-4 294 967 295字节 | 二进制形式的极大文本数据        |
| LONGTEXT   | 0-4 294 967 295字节 | 极大文本数据                    |

CHAR 和 VARCHAR 类型类似，但它们保存和检索的方式不同。它们的最大长度和是否尾部空格被保留等方面也不同。在存储或检索过程中不进行大小写转换。

BINARY 和 VARBINARY 类似于 CHAR 和 VARCHAR，不同的是它们包含二进制字符串而不要非二进制字符串。也就是说，它们包含字节字符串而不是字符字符串。这说明它们没有字符集，并且排序和比较基于列值字节的数值值。

BLOB 是一个二进制大对象，可以容纳可变数量的数据。有 4 种 BLOB 类型：TINYBLOB、BLOB、MEDIUMBLOB 和 LONGBLOB。它们区别在于可容纳存储范围不同。 

 有 4 种 TEXT 类型：TINYTEXT、TEXT、MEDIUMTEXT 和 LONGTEXT。对应的这 4 种 BLOB 类型，可存储的最大长度不同，可根据实际情况选择。 

ALTER TABLE table_name DRO P INDEX index_name;

### B 并发问题

#### B.1 脏读（dirty read

A事物读取B事物尚未提交更改的数据，并在这个数据的基础上操作。如果B事物恰巧回滚，那么A事物读取到的事物是根本不被承认的。如下列：

| 时间 | 事物A                    | 事物B                    |
| ---- | ------------------------ | ------------------------ |
| T1   |                          | 开始事物                 |
| T2   | 开始事物                 |                          |
| T3   |                          | 查询余额1000元           |
| T4   |                          | 取出500元，余额改为500元 |
| T5   | 查询余额500元（脏读）    |                          |
| T6   |                          | 撤销事物余额1000元       |
| T7   | 汇入100元，余额改为600元 |                          |
| T8   | 提交事物                 |                          |

在这个场景中B希望取出500元，而后又撤销了动作，而A往相同账户转入100元，就因为A读取到了B未提交更改数据，造成账户白白丢失500元。（注：在oracal数据库中，不会发生脏读的情况）

#### B.2 不可重复读（unrepeatable read）

不可重复读是指：A事物读取到B事物已提交的更改数据。假设A在取款事物过程中，B往账户转入100元，A两次读取到的余额不一致。

| 时间 | 事物A                               | 事物B                      |
| ---- | ----------------------------------- | -------------------------- |
| T1   |                                     | 开始事物                   |
| T2   | 开始事物                            |                            |
| T3   |                                     | 查询账户余额为1000元       |
| T4   | 查询账户余额位1000元                |                            |
| T5   |                                     | 取出100元，修改余额为900元 |
| T6   |                                     | 提交事物                   |
| T7   | 查询账户余额900元（和T4查询不一致） |                            |

同一事务中两次查询账户余额不一致

#### B.3 幻读（phantom read）

A事物读取B事物提交的新增数据，这时A事物将出现幻读

| 时间 | 事物A                         | 事物B                         |
| ---- | ----------------------------- | ----------------------------- |
| T1   |                               | 开始事物                      |
| T2   | 开始事物                      |                               |
| T3   | 统计账户总存款为10000元       |                               |
| T4   |                               | 新增一个存款账户，并转入100元 |
| T5   |                               | 提交事物                      |
| T6   | 再次统计存款为10100元（幻读） |                               |

如果新增数据刚好满足查询条件，这个数据就会进入事物的视野，因而产生两次统计结果不一致的情况

注：幻读和不可重复读的区别在于前者读取到的是已提交的新增数据，后者读取到的是已提交的更新数据（或者删除的数据）。为了避免这两种情况，采取的策略是不同的，防止读到更改操作，只需要对操作数据添加行级锁，阻止操作中的数据发生变化；而防止读到新增数据，则往往添加表级锁--将整张表锁定，防止新增数据（Oracal通过多版本数据的方式实现）

#### B.4 第一类丢失更新

A事物撤销时，覆盖掉 B事物已提交的更新数据。

| 时间 | 事物A                        | 事物B                       |
| ---- | ---------------------------- | --------------------------- |
| T1   |                              | 开始事物                    |
| T2   | 开始事物                     |                             |
| T3   | 查询账户为1000元             |                             |
| T4   |                              | 查询账户为1000元            |
| T5   |                              | 转入100元，修改余额为1100元 |
| T6   |                              | 提交事物                    |
| T7   | 取出100元，修改余额为900元   |                             |
| T8   | 撤销事物（或提交事物）       |                             |
| T9   | 余额回复为1000元（丢失更新） |                             |

A事物在撤销时，将B事物转入的100元抹去了

#### B.5 第二类丢失更新

A事物覆盖B事物已提交的数据，造成B事物所有的操作丢失

| 时间 | 事物A                        | 事物B                      |
| ---- | ---------------------------- | -------------------------- |
| T1   |                              | 开始事物                   |
| T2   | 开始事物                     |                            |
| T3   | 查询账户为1000元             |                            |
| T4   |                              | 查询账户为1000元           |
| T5   |                              | 取出100元，修改余额为900元 |
| T6   |                              | 提交事物                   |
| T7   | 转入100元                    |                            |
| T8   | 提交事物                     |                            |
| T9   | 修改余额为1100元（丢失更新） |                            |

#### B.6 隔离级别

为了解决上述的问题，提出了隔离级别的概念，不同的隔离级别可以处理的并发问题是不一样的。使用不同的隔离级别就可以阻止自己所期望的并发问题。

| 隔离级别         | 脏读 | 不可重复度 | 幻读 | 第一类丢失更新 | 第二类丢失更新 |
| ---------------- | ---- | ---------- | ---- | -------------- | -------------- |
| READ UNCOMMITED  | √    | √          | √    | ×              | √              |
| READ COMMITTED   | ×    | √          | √    | √              | √              |
| REPREATABLE READ | ×    | ×          | √    | √              | √              |
| SERIALIZABLE     | ×    | ×          | ×    | ×              | ×              |

* √ 表示可能出现的情况， × 号表示不会出现

* SQL92推荐使用REPREATABLE READ，用户可自定义

### C 使用libmysqlclient库

`g++ a.cpp -lmysqlclient -o a.out `

``` cpp
//a.cpp 简单示例
#include <stdio.h>
#include <mysql/mysql.h>

MYSQL mysql,*sock;  //连接要用到

int main(){
	const char * host = "127.0.0.1"; 	//主机名
	const char * user = "root";
	const char * passwd = "123456";
	const char * db = "zsh";     		//数据库名字
	unsigned int port = 3306; 			//不改动默认就是这个
	const char * unix_socket = NULL;
	unsigned long client_flag = 0; 		//一般0

	const char * i_query = "select * from phonelist"; //查询语句

	int ret;
	MYSQL_RES * result;
	MYSQL_ROW row;

	mysql_init(&mysql); 	//必须

	if((sock = mysql_real_connect(&mysql,host,user,passwd,db,port,unix_socket,client_flag)) == NULL){
		ret = mysql_errno(&mysql);
		printf("connect error,errno %d\n",ret);
		//fprintf(stderr,"%s\n",mysql_error(&mysql));
		exit(1);
	}else{
		fprintf(stderr,"connect success\n");
	}

	mysql_query(&mysql,"set names utf8");//在连接后使用，中文显示正常
    /*
      这一句等于
      SET character_set_client = utf8;
      SET character_set_results = utf8;
      SET character_set_connection = utf8; 
     */

	if(mysql_query(&mysql,i_query) != 0){
		fprintf(stderr,"query error\n");
		exit(1);
	}else{
		if((result = mysql_store_result(&mysql)) == NULL){
			fprintf(stderr,"save result error\n");
			exit(1);
		}else{

			int field_num = mysql_field_count(&mysql); //获得列数
			MYSQL_FIELD * fields = mysql_fetch_fields(result); //列名

			for(int i=0; i<field_num; i++){
				printf("%s \t",fields[i].name);
			}putchar('\n');

			while((row = mysql_fetch_row(result)) != NULL){
				for(int i=0; i<field_num; i++){
					printf("%s \t",row[i]);
				}putchar('\n');
			}

		}
	}

	mysql_free_result(result);
	mysql_close(sock);
	exit(EXIT_SUCCESS);
}
```





