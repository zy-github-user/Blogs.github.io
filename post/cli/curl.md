## curl
`usage: curl [options...] <url>`
```shell
$ curl -h
-o, --output <file> 写入到文件，而不是输出到stdout
-O 写入到文件，文件名和远程文件一样
-L 跟随网站的跳转
-x, --proxy [protocol://][user:pwd@]host[:port] 使用代理
-v 打印过程
--trace <file> debug写入到文件,很详细包括二进制数据交换，file使用 - 表示打印到stdout
-c <file> 将服务器设置的cookie写入到文件
-b <data> 发送cookie,从 string/file 获取
-A <name> 发送 User-Agent <name> 到服务器
-e <url> 指定 Referer : <url> , 仿造referer，服务器会以为你是从 url 点击某个链接过来的
-H <header/@file> 将自定义标头传递到服务器
-X <command> 指定请求方法，不带任何参数的请求默认get方法
-s Silent mode 无声模式
-S Show error even when -s is used 即使使用 -s 也打印错误
-i 打印服务器回应的http标头
-I 只打印标头
-k 使用ssl时，允许不安全的服务器连接。跳过ssl检测
-d <data> http post data,使用post方法发送表单,自动添加标头Content-Type : application/x-www-form-urlencoded
-F <name=content> 指定 multipart MIME data , 可以上传二进制文件,自动添加Content-Type: multipart/form-data
-G 把 post data 放进 url 并使用 get 请求，与-d配合
-u <user:password> 指定服务器用户和密码
-T <file> 上传文件，使用 put 请求
```

## 例子
curl 也支持 ftp

下载文件：

`curl -LO https://github.com/x/releases/download/v3.0.1/xxx.AppImage`

`curl -LO http://www.example.com/pic[1-5].JPG` 循环下载

使用代理：

`curl -x socks5://127.0.0.1:1080 -LO   https://github.com/x/releases/download/v3.0.1/xxx.AppImage`

post请求：

`curl -d'login=kirito&password=123' https://google.com/login`

`curl -d'login=kirito' -d'password=123' https://google.com/login`

上传文件：

`curl -F 'file=@a.txt' https://example.com`
