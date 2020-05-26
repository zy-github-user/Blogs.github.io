## tcpdump
```shell
$ tcpdump -h
Usage: tcpdump [-aAbdDefhHIJKlLnNOpqStuUvxX#] [ -B size ] [ -c count ]
		[ -C file_size ] [ -E algo:secret ] [ -F file ] [ -G seconds ]
		[ -i interface ] [ -j tstamptype ] [ -M secret ] [ --number ]
		[ -Q in|out|inout ]
		[ -r file ] [ -s snaplen ] [ --time-stamp-precision precision ]
		[ --immediate-mode ] [ -T type ] [ --version ] [ -V file ]
		[ -w file ] [ -W filecount ] [ -y datalinktype ] [ -z postrotate-command ]
		[ -Z user ] [ expression ]
```
命令选项：
```shell
-n 不要将一些数字解析成名字，如80转换成http
-i <interface> 指定网卡，缺省则监听所有网卡
-c <count> 抓取 count 个包后停止
-s <len> 数据包长度， 超出会被截断， 0表示不限制长度
-S 默认每个包的sequence是显示相对的值, 如果想显示绝对值, 通过此选项打开.
-w <file> 保存到文件，.cap格式， 可以用wireshark分析
-v 当分析和打印的时候，产生详细的输出。
-vv 产生比-v更详细的输出
```
表达式：
```shell
表达式由一个或多个"单元"组成，每个单元一般包含ID的修饰符和一个ID(数字或名称)

# 修饰符
类型 .type host/net/port/portrange 默认为 host 例如："host foo"，"net 128.3"，"port 20"，"portrange 6000-6008"
方向 .dir src / dst / src or dst / src and dst 默认为 src or dst
协议 .proto tcp/udp/arp/ip/ether/icmp 等， 默认匹配所有

一个基本的表达式单元格式为 "proto dir type ID"
表达式单元之间可以使用操作符" and(&&)，or(||), not (!)"进行连接，从而组成复杂的条件表达式
```
## 例子
抓取20个来自百度的tcp包

`tcpdump -c 20 -n -i enp0s3 tcp and src host www.baidu.com`

所有tcp协议且非20端口

`tcpdump -i enp0s3 tcp and not port 22`

可以用括号组合复杂的表达式

`tcpdump -i enp0s3 'src www.baidu.com and (dst port 80 or 441)'`

抓取带有SYN标准的数据， tcp[13]表示tcp数据包头中取第14个字节数据 支持比较 < <= > >= != =

`tcpdump -i enp0s3 'host www.baidu.com and tcp[13]&2!=0'`

写入文件

`tcpdump -c 20 -n -i enp0s3 -w file.cap tcp and src host www.baidu.com`