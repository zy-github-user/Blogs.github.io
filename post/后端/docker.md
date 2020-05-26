[官方文档](https://docs.docker.com/engine)

## 安装环境

### ubuntu

需要64位的ubuntu系统，支持：

* Ubuntu Eoan 19.10
* Ubuntu Bionic 18.04
* Ubuntu Xenial 16.04

我的环境：

```shell
$ lsb_release  -a
No LSB modules are available.
Distributor ID:	Ubuntu
Description:	Ubuntu 18.04.4 LTS
Release:	18.04
Codename:	bionic
```

卸载老版本，老版本叫做`docker`，`docker.io`，`docker-engine`

```shell
$ sudo apt-get remove docker docker-engine docker.io containerd runc
```

通过APT安装

```shell
$ sudo apt-get install \
apt-transport-https \
ca-certificates \
curl \
software-properties-common

# 添加软件源的 GPG 密钥
$ curl -fsSL https://mirrors.ustc.edu.cn/docker-ce/linux/ubuntu/gpg | sudo apt-key add -
# $ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# 添加docker源
$ sudo add-apt-repository \
"deb [arch=amd64] https://mirrors.ustc.edu.cn/docker-ce/linux/ubuntu \
$(lsb_release -cs) \
stable"
# 官方源
# $ sudo add-apt-repository \
# "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
# $(lsb_release -cs) \
# stable"

# 安装
$ sudo apt-get install docker-ce
# 设置开机启动
$ sudo systemctl enable docker
# 验证是否安装完成
$ sudo docker run --rm hello-world
```



通过deb包安装，[下载列表找到系统版本](https://download.docker.com/linux/ubuntu/dists/)

```shell
$ curl -LO https://download.docker.com/linux/ubuntu/dists/bionic/pool/stable/amd64/docker-ce_18.06.1~ce~3-0~ubuntu_amd64.deb
$ sudo dpkg -i docker-ce_18.06.1~ce~3-0~ubuntu_amd64.deb
$ sudo systemctl enable docker 
$ sudo systemctl start docker 
```





默认情况下，docker 命令会使用 Unix socket 与 Docker 引擎通讯，一般只有root用户和docker组的用户才能访问引擎的Unix socket文件`/var/run/docker.sock`，可以建立docker组并把非root用户加入其中

```shell
$ sudo groupadd docker
$ sudo usermod -aG docker $USER
# 退出终端并重新登录生效
```





### centos

就是包管理器变成yum了

```shell
$ sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine

$ sudo yum install -y yum-utils \
device-mapper-persistent-data \
lvm2

$ sudo yum-config-manager \
--add-repo \
https://mirrors.ustc.edu.cn/docker-ce/linux/centos/docker-ce.repo
# 官方源
# $ sudo yum-config-manager \
# --add-repo \
# https://download.docker.com/linux/centos/docker-ce.repo

$ sudo yum-config-manager --enable docker-ce-edge
$ sudo yum makecache fast
$ sudo yum install docker-ce
```

### 镜像加速

编辑文件`/etc/docker/daemon.json`，没有则创建

```json
{
    "registry-mirrors": [
    	"https://registry.docker-cn.com"
    ]
}
```

重启服务

```shell
$ sudo systemctl restart docker
# 下面命令可以查看修改
$ docker info
# Registry Mirrors:
#  https://registry.docker-cn.com/
```



## docker使用

```text
$ docker help

Usage:	docker [OPTIONS] COMMAND

A self-sufficient runtime for containers

Options:
      --config string      Location of client config files (default
                           "/home/kirito/.docker")
  -c, --context string     Name of the context to use to connect to the
                           daemon (overrides DOCKER_HOST env var and
                           default context set with "docker context use")
  -D, --debug              Enable debug mode
  -H, --host list          Daemon socket(s) to connect to
  -l, --log-level string   Set the logging level
                           ("debug"|"info"|"warn"|"error"|"fatal")
                           (default "info")
      --tls                Use TLS; implied by --tlsverify
      --tlscacert string   Trust certs signed only by this CA (default
                           "/home/kirito/.docker/ca.pem")
      --tlscert string     Path to TLS certificate file (default
                           "/home/kirito/.docker/cert.pem")
      --tlskey string      Path to TLS key file (default
                           "/home/kirito/.docker/key.pem")
      --tlsverify          Use TLS and verify the remote
  -v, --version            Print version information and quit

Management Commands:
  builder     Manage builds
  config      Manage Docker configs
  container   Manage containers
  context     Manage contexts
  engine      Manage the docker engine
  image       Manage images
  network     Manage networks
  node        Manage Swarm nodes
  plugin      Manage plugins
  secret      Manage Docker secrets
  service     Manage services
  stack       Manage Docker stacks
  swarm       Manage Swarm
  system      Manage Docker
  trust       Manage trust on Docker images
  volume      Manage volumes

Commands:
  attach      Attach local standard input, output, and error streams to a running container
  build       Build an image from a Dockerfile
  commit      Create a new image from a container's changes
  cp          Copy files/folders between a container and the local filesystem
  create      Create a new container
  diff        Inspect changes to files or directories on a container's filesystem 
  				查看容器文件的变动
  events      Get real time events from the server
  exec        Run a command in a running container
  export      Export a container's filesystem as a tar archive
  history     Show the history of an image
  images      List images
  import      Import the contents from a tarball to create a filesystem image
  info        Display system-wide information
  inspect     Return low-level information on Docker objects 返回有关Docker对象的底层信息 
  kill        Kill one or more running containers
  load        Load an image from a tar archive or STDIN
  login       Log in to a Docker registry
  logout      Log out from a Docker registry
  logs        Fetch the logs of a container
  pause       Pause all processes within one or more containers
  port        List port mappings or a specific mapping for the container
  ps          List containers
  pull        Pull an image or a repository from a registry
  push        Push an image or a repository to a registry
  rename      Rename a container
  restart     Restart one or more containers
  rm          Remove one or more containers
  rmi         Remove one or more images
  run         Run a command in a new container
  save        Save one or more images to a tar archive (streamed to STDOUT by default)
  search      Search the Docker Hub for images
  start       Start one or more stopped containers
  stats       Display a live stream of container(s) resource usage statistics
  stop        Stop one or more running containers
  tag         Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE
  top         Display the running processes of a container
  unpause     Unpause all processes within one or more containers
  update      Update configuration of one or more containers
  version     Show the Docker version information
  wait        Block until one or more containers stop, then print their exit codes

Run 'docker COMMAND --help' for more information on a command.

```

### 操作镜像

#### 拉取镜像

```text
$ docker help pull

Usage:	docker pull [OPTIONS] NAME[:TAG|@DIGEST]

Pull an image or a repository from a registry

Options:
  -a, --all-tags                Download all tagged images in the repository
      --disable-content-trust   Skip image verification (default true)
  -q, --quiet                   Suppress verbose output
```



`$ docker pull [选项] [Docker Registry 地址[:端口号]/]仓库名[:标签]`

* 仓库地址的格式一般是  `<域名/IP>[:端口号] `，默认使用 Docker
  Hub
* 仓库名是两段式名称，即 ` <用户名>/<软件名> ` , 不给出用户名，默认官方镜像
* 标签如果省略，默认拉取标签`latest`

```shell
$ docker pull alpine
```

#### 查看镜像

```text
$ docker help  image 

Usage:	docker image COMMAND

Manage images

Commands:
  build       Build an image from a Dockerfile 
  history     Show the history of an image 可以看到镜像如何组成
  import      Import the contents from a tarball to create a filesystem image
  inspect     Display detailed information on one or more images
  load        Load an image from a tar archive or STDIN
  ls          List images 列出
  prune       Remove unused images 修剪，删除没用过的镜像
  pull        Pull an image or a repository from a registry
  push        Push an image or a repository to a registry
  rm          Remove one or more images 删除镜像
  save        Save one or more images to a tar archive (streamed to STDOUT by default)
  tag         Create a tag TARGET_IMAGE that refers to SOURCE_IMAGE

Run 'docker image COMMAND --help' for more information on a command.
```

```shell
$ docker image ls -a
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
alpine              latest              f70734b6a266        2 weeks ago         5.61MB
hello-world         latest              bf756fb1ae65        4 months ago        13.3kB
```



由于 Docker 镜像是多层存储结构，并且可以继承、复用，因此不同镜像可能会因为使用相同的基础镜像，从而拥有共同的层。使用`docker system df`可以查看镜像、容器、数据卷所占用的空间



#### 运行镜像

```text
$ docker help run 

Usage:	docker run [OPTIONS] IMAGE [COMMAND] [ARG...]

Run a command in a new container

Options:
	-i		Keep STDIN open even if not attached 常用组合 -it
	-t		分配伪终端
	--rm	运行完就删除容器实例	
	--name string	指定容器名称
	--entrypoint string	指定或覆盖ENTRYPOINT
	-d 		后台运行容器，并打印容器idv
	-v list	绑定volume 绑定一个卷
	--mount mount	挂载文件系统到容器 和-v功能差不多，推荐使用--mount代替-v
	-p <宿主端口>:<容器端口>	映射端口
	-P	将所有EXPOSE声明的端口映射到随机端口
	--network network 加入docker网络
	--link list	链接其他容器
```

```bash
$ docker run -it --rm alpine sh
/ # ls
bin    dev    etc    home   lib    media  mnt    opt    proc   root   run    sbin   srv    sys    tmp    usr    var
/ # exit
$
```



#### commit

```text
$ docker help commit 

Usage:	docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]

Create a new image from a container's changes 从一个容器创建新镜像

Options:
  -a, --author string    Author (e.g., "John Hannibal Smith <hannibal@a-team.com>")
  -c, --change list      Apply Dockerfile instruction to the created image
  -m, --message string   Commit message
  -p, --pause            Pause container during commit (default true)
```

不要使用  `docker commit`  定制镜像，定制镜像应该使用  `Dockerfile`  来完成。`commit`可以用来保护现场





### 定制镜像

镜像的定制实际上就是定制每一层所添加的配置、文件。我们可以把每一层修改、安装、构建、操作的命令都写入一个脚本，用这个脚本来构建、定制镜像。这个脚本就是`Dockerfile`

### Dockerfile

Dockerfile 是一个文本文件，其内包含了一条条的指令，每一条指令构建一层，因此每一条指令的内容，就是描述该层应当如何构建。注意镜像的层数是有限制的

```dockerfile
FROM golang:1.13-alpine
WORKDIR /
RUN apk --no-cache add git \
	&& git clone https://github.com/zshorz/shadowsocks.git
WORKDIR /shadowsocks/
RUN GOPROXY=https://goproxy.io GO111MODULE="on" go build -o server ./ss-server/
FROM alpine:latest
WORKDIR /app/
COPY --from=0 /shadowsocks/server .
ENTRYPOINT ["./server"]
```

```dockerfile
# 多级构建 这里给这一级的镜像起了个名字 builder
FROM golang:1.7.3 AS builder
WORKDIR /go/src/github.com/alexellis/href-counter/
RUN go get -d -v golang.org/x/net/html  
COPY app.go    .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM alpine:latest  
RUN apk --no-cache add ca-certificates
WORKDIR /root/
# 用名字而不是数字指定从哪一级拷贝
COPY --from=builder /go/src/github.com/alexellis/href-counter/app .
CMD ["./app"]  
```



#### FROM 指定基础镜像

所谓定制镜像，那一定是以一个镜像为基础，在其上进行定制。基础镜像是必须指定的。因此一个  Dockerfile  中  FROM  是必备的指令，并且必须是第一条指令。



Docker 还存在一个特殊的镜像，名为  `scratch`  。如果你以  `scratch ` 为基础镜像的话，意味着你不以任何镜像为基础，接下来所写的指令将作为镜像第一层开始存在。不以任何系统为基础，直接将可执行文件复制进镜像的做法并不罕见。尤其是go程序，似乎天生就是为了这么干。



#### RUN 执行指令

RUN  指令是用来执行命令行命令的。由于命令行的强大能力， RUN  指令在定制镜像时是最
常用的指令之一。其格式有两种：



* shell 格式 - 就像直接在命令行中输入的命令一样
* exec 格式 -  `RUN ["可执行文件", "参数1", "参数2"] ` 比如 `RUN ["ls", "-a"]`

为了降低层数，尽量使用`&&`执行多条命令，而不是每个命令写一个RUN

#### COPY 复制文件

格式：

* `COPY <源路径1>... <目标路径>`
* `COPY ["<源路径1>", ... "<目标路径>"]`

源路径可以有通配符，目标路径可以是容器内绝对路径，也可是工作路径，目标路径不需要事先创建



使用  COPY  指令，源文件的各种元数据都会保留。比如读、写、执行权限、文件变更时间等。



`--form=`多级构建时会使用，从别的层复制文件而非上下文

#### ADD 增强版COPY

比如  <源路径>  可以是一个  URL 。下载后的文件权限自动设置为  600。

如果  `<源路径>`  为一个  `tar`  压缩文件的话，压缩格式为 ` gzip ` ,`  bzip2`  以及 ` xz  `的情况下， ADD  指令将会自动解压缩这个压缩文件到  `<目标路径> ` 去。

官方并不鼓励使用ADD, 仅在需要自动解压的场合使用

#### CMD 容器启动命令

格式：

* `shell`格式 - `CMD <命令>`
* `exec`格式 - `CMD ["可执行文件", "参数1", "参数2"...]`
* 参数列表格式 - `CMD ["参数1", "参数2"...]`，在指定了 ` ENTRYPOINT  `指令后，用  `CMD`  指
  定具体的参数。

推荐使用第二种格式，执行过程比较明确。第一种格式实际上在运行的过程中也会自动转换成第二种格式运行，并且默认可执行文件是 `sh -c`。如`CMD ls`变成`CMD ["sh","-c","ls"]`



在启动容器的时候，需要指定所运行的程序及参数。 CMD  指令就是用于指定默认的容器主进程的启动命令的。在容器运行时可以指定新的命令来替代镜像设置中的这个默认命令。Docker 不是虚拟机，容器中的应用都应该以前台执行。

#### ENTRYPOINT 入口点

类似于 CMD 指令，但其不会被 docker run 的命令行参数指定的指令所覆盖，而且这些命令行参数会被当作参数送给 ENTRYPOINT 指令指定的程序。



但是, 如果运行 docker run 时使用了 `--entrypoint` 选项，此选项的参数可当作要运行的程序覆盖 ENTRYPOINT 指令指定的程序。



当指定了  ENTRYPOINT  后， CMD  的含义就发生了改变，不再是直接的运行其命令，而是将
CMD  的内容作为参数传给  ENTRYPOINT  指令



可以搭配 CMD 命令使用：一般是变参才会使用 CMD ，这里的 CMD 等于是在给 ENTRYPOINT 传参:

```dockerfile
FROM nginx

ENTRYPOINT ["nginx", "-c"] # 定参
CMD ["/etc/nginx/nginx.conf"] # 变参 
```



使用 ENTRYPOINT 

* 可以让镜像运行起来像直接执行命令一样，镜像名字就像命令名，后边都是参数
* 可以执行应用运行前的准备工作，直接执行写好的脚本，后面参数会被传进去



#### ENV 设置环境变量

格式：

* `ENV <key> <value>`
* `ENV <key1>=<value1> <key2>=<value2> ...`

```dockerfile
ENV VERSION=1.0 DEBUG=on \
	NAME="Happy Feet"
```

下列指令可以支持环境变量展开：
ADD  、 COPY  、 ENV  、 EXPOSE  、 LABEL  、 USER  、 WORKDIR  、 VOLUME  、 STOPSIGNAL  、 ONBUILD  。

#### ARG 构建参数

格式：

* `ARG <参数名>[=<默认值>]`

构建参数和  `ENV`  的效果一样，都是设置环境变量。所不同的是， `ARG ` 所设置的构建环境的
环境变量，在将来容器运行时是不会存在这些环境变量的。但是不要因此就使用  `ARG`  保存密
码之类的信息，因为  `docker history`  还是可以看到所有值的。



`Dockerfile`  中的  `ARG`  指令是定义参数名称，以及定义其默认值。该默认值可以在构建命令
`docker build`  中用 ` --build-arg <参数名>=<值>`  来覆盖

#### VOLUME 定义匿名卷

格式：

* `VOLUME ["<路径1>", "<路径2>"...]`
* `VOLUME <路径>`

容器运行时应该尽量保持容器存储层不发生写操作，对于数据库类需要保存动态数据的应用，其数据库文件应该保存于卷(volume)中



为了防止运行时用户忘记将动态文件所保存目录挂载为卷，在`Dockerfile`  中，我们可以事先指定某些目录挂载为匿名卷，这样在运行时如果用户不指定挂载，其应用也可以正常运行，不会向容器存储层写入大量数据。

```dockerfile
VOLUME /data
```

这里的 ` /data ` 目录就会在运行时自动挂载为匿名卷，任何向 ` /data ` 中写入的信息都不会记
录进容器存储层，从而保证了容器存储层的无状态化。当然，运行时可以覆盖这个挂载设置。比如：

```shell
docker run -d -v mydata:/data xxxx
# 使用命名卷mydata代替替代Dockerfile中定义的匿名卷的挂载配置
```

#### EXPOSE 声明端口

格式：

* `EXPOSE <端口1> [<端口2>...]`

`EXPOSE`  指令是声明运行时容器提供服务端口，这只是一个声明，在运行时并不会因为这个声明应用就会开启这个端口的服务。在 `Dockerfile `中写入这样的声明有两个好处，一个是帮助镜像使用者理解这个镜像服务的守护端口，以方便配置映射；另一个用处则是在运行时使用随机端口映射时，也就是  `docker run -P  `时，会自动随机映射  `EXPOSE`  的端口。

#### WORKDIR 指定工作目录

格式：

* `WORKDIR <工作目录路径>`

用来避免下面的错误

```dockerfile
RUN cd /app
RUN echo "hello" > world.txt
```

这两行RUN命令的执行环境不同，是两个完全不同的容器，不在一层

#### USER 指定当前用户

格式：

* `USER <用户名>`

这个用户必须是事先建立好的，否则无法切换

#### HEALTHCHECK 健康检查

#### ONBUILD

格式：

* `ONBUILD <其它指令>`

`ONBUILD  `是一个特殊的指令，它后面跟的是其它指令，比如  `RUN ` , ` COPY ` 等，而这些指令，在当前镜像构建时并不会被执行。只有当以当前镜像为基础镜像，去构建下一级镜像的时候才会被执行。

### 构建镜像

```text
$ docker help build

Usage:	docker build [OPTIONS] PATH | URL | -

Build an image from a Dockerfile

Options:
	-t	指定镜像名称，tag是可选项 name[:tag]
	-f filename 指定构建脚本文件，默认为当前目录下名为Dockerfile的文件
```



在 Dockerfile 所在目录执行

```shell
$ docker build -t myimg:v1 ./
```

注意路径`./`并非是指定 Dockerfile 所在的路径，docker分客户端和服务端，客户端会把整个指定目录都传给服务端，然后在服务端执行镜像构建，这个目录叫上下文目录。在使用`COPY ./package.json /app/`这样的 COPY 命令时，会从上下文目录里拷贝文件到镜像。在默认情况下，如果不额外指定  Dockerfile  的话，会将上下文目录下的名为  Dockerfile  的文件作为Dockerfile。总之记住这里路径是指定上下文，而非指定Dockerfile所在路径。



如果不想指定上下文，可以指定通过标准输入获取Dockerfile，这样就没有上下文了。会忽略`-f`参数

```shell
$ docker build - < Dockerfile
$ cat Dockerfile | docker build -
# 两种方式都行
# 如果输入一个压缩包，那么会把压缩包展开，当作上下文
```



还可以指定url为上下文，比如可以直接指定上下文为github仓库，再比如url是个压缩包

```shell
$ docker build https://github.com/zshorz/shadowsocks.git#master:v1.2.3
#上面的#不是注释 是指定分支和tag
```

### 多级构建

`multistage builds` 



最开始的例子里就是用的多级构建



### 操作容器

```text
$ docker help container

Usage:	docker container COMMAND

Manage containers

Commands:
  attach      Attach local standard input, output, and error streams to a running container
  commit      Create a new image from a container's changes
  cp          Copy files/folders between a container and the local filesystem
  create      Create a new container
  diff        Inspect changes to files or directories on a container's filesystem
  exec        Run a command in a running container
  export      Export a container's filesystem as a tar archive
  inspect     Display detailed information on one or more containers
  kill        Kill one or more running containers
  logs        Fetch the logs of a container 后台运行时，用来查看容器输出
  ls          List containers
  pause       Pause all processes within one or more containers
  port        List port mappings or a specific mapping for the container
  prune       Remove all stopped containers
  rename      Rename a container
  restart     Restart one or more containers
  rm          Remove one or more containers
  run         Run a command in a new container
  start       Start one or more stopped containers
  stats       Display a live stream of container(s) resource usage statistics
  stop        Stop one or more running containers
  top         Display the running processes of a container
  unpause     Unpause all processes within one or more containers
  update      Update configuration of one or more containers
  wait        Block until one or more containers stop, then print their exit codes

Run 'docker container COMMAND --help' for more information on a command.
```



#### 启动

* 新建并启动 - `docker run`
* 启动已终止容器 - `docker container start`

当利用  docker run  来创建容器时，Docker 在后台运行的标准操作包括：

* 检查本地是否存在指定的镜像，不存在就从公有仓库下载
* 利用镜像创建并启动一个容器
* 分配一个文件系统，并在只读的镜像层外面挂载一层可读写层
* 从宿主主机配置的网桥接口中桥接一个虚拟接口到容器中去
* 从地址池配置一个 ip 地址给容器
* 执行用户指定的应用程序
* 执行完毕后容器被终止





```text
$ docker container start --help

Usage:	docker container start [OPTIONS] CONTAINER [CONTAINER...]

Start one or more stopped containers

Options:
  -a, --attach               Attach STDOUT/STDERR and forward signals
      --detach-keys string   Override the key sequence for detaching a container
  -i, --interactive          Attach container's STDIN

```

#### 终止容器

* 终止 - `docker container stop`
* 终止后重启- `docker container restart`

#### 进入容器

在使用  `-d ` 参数时，容器启动后会进入后台。某些时候需要进入容器进行操作，可以使用：

* `docker attach` - 附加到容器运行的进程
* `docker exec` - 容器里执行命令，推荐使用这个





```text
$ docker help attach 

Usage:	docker attach [OPTIONS] CONTAINER

Attach local standard input, output, and error streams to a running container
连接到容器标准输入输出和标准错误

Options:
      --detach-keys string   Override the key sequence for detaching a container
      --no-stdin             Do not attach STDIN
      --sig-proxy            Proxy all received signals to the process (default true)
```

注意如果从attach的stdin中exit,会导致容器退出



```text
$ docker help exec

Usage:	docker exec [OPTIONS] CONTAINER COMMAND [ARG...]

Run a command in a running container

Options:
  -d, --detach               Detached mode: run command in the background
      --detach-keys string   Override the key sequence for detaching a container
  -e, --env list             Set environment variables
  -i, --interactive          Keep STDIN open even if not attached 链接标准输入
      --privileged           Give extended privileges to the command
  -t, --tty                  Allocate a pseudo-TTY 分配伪终端
  -u, --user string          Username or UID (format: <name|uid>[:<group|gid>])
  -w, --workdir string       Working directory inside the container
```

从exec的stdin中exit,容器不会停止，这是推荐的原因

#### 导入导出删除

* 导出 - `docker export 7691a814370e > ubuntu.tar`
* 导入快照为镜像 - `cat ubuntu.tar | docker import - test/ubuntu:v3.0`
* 删除 - `docker container rm name`
  * 如果要删除一个运行中的容器，可以添加`  -f  `参数。`Docker` 会发送  `SIGKILL`  信号给容器。

* 清理所有终止容器 - `docker container prune`

### 数据管理

#### 数据卷

`数据卷 Volumes`  是一个可供一个或多个容器使用的特殊目录，它绕过 UFS，可以提供很多有用的特性：

* 可以在容器之间共享和重用
* 对  `数据卷`  的修改会立马生效
* 对 ` 数据卷`  的更新，不会影响镜像
* 默认会一直存在，即使容器被删除



创建一个数据卷

```shell
$ docker volume create my-vol
my-vol

$ docker volume ls
DRIVER              VOLUME NAME
local               my-vol

$ docker volume inspect my-vol 
[
    {
        "CreatedAt": "2020-05-09T14:32:47+08:00",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/my-vol/_data",
        "Name": "my-vol",
        "Options": {},
        "Scope": "local"
    }
]
```





启动一个挂载数据卷的容器

```shell
$ docker run -it \
	--name test-vol \
	--mount source=my-vol,target=/data \
	alpine \
	/bin/sh

# -v my-vol:/data \  也可以，推荐使用mount
```

删除数据卷 - `docker volume rm my-vol`



#### 挂载主机目录



```shell
$ docker run -it \
	--name test-vol \
	--mount type=bind,source=/var/data,target=/opt/data \
	alpine \
	/bin/sh

# -v /var/data:/opt/data \ 也可以，推荐使用mount
# --mount type=bind,source=/var/data,target=/opt/data,readonly \    加个只读属性
```



### docker网络

可以将容器加入自定义的 Docker 网络来连接多个容器

```shell
# 创建网络
$ docker network create -d bridge my-net
# -d  参数指定 Docker 网络类型  有  bridge   overlay  

$ docker run -it --rm --name busybox1 --network my-net busybox sh
$ docker run -it --rm --name busybox2 --network my-net busybox sh

# ping
/ # ping busybox2
PING busybox2 (172.19.0.3): 56 data bytes
64 bytes from 172.19.0.3: seq=0 ttl=64 time=0.072 ms
64 bytes from 172.19.0.3: seq=1 ttl=64 time=0.118 ms
```



### 仓库

Docker 官方维护了一个公共仓库 [Docker Hub](https://hub.docker.com/)，也可以自己搭建私有仓库

* 登录 - `docker login`
* 退出登录 - `docker logout`
* 推送镜像 - `docker push`



```shell
$ docker tag ubuntu:17.10 username/ubuntu:17.10

$ docker image ls
REPOSITORY TAG IMAGE ID CREATED SIZE
ubuntu 17.10 275d79972a86 6 days ago 94.6MB
username/ubuntu 17.10 275d79972a86 6 days ago 94.6MB

$ docker push username/ubuntu:17.10

$ docker search username
NAME DESCRIPTION STARS OFFICIAL AUTOMATED
username/ubuntu
```







## 推荐些镜像

* `busybox` - 有linux常用命令，非常小巧
* `alpine` - 功能比`busybox`完善，还有转的的包管理`apk`，我喜欢用这个做基础镜像
* `scratch` - 空镜像，用来从0构建镜像，go语言生成的可执行文件直接放进去，不要太爽