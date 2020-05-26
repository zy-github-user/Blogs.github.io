## git
[wiki](https://git-scm.com/book/zh/v2)
## git 结构
`Workspace`:工作区 ，可以`add`到`index`

`Index/Stage`:暂存区 ，可以`commit`到`Repository`

`Repository`:本地仓库 ，可以`push`到  `Remote`，`checkout`到`Workspace`

`Remote`:远程仓库 ，可以`pull`到`Workspace`，`clone`到`Repository`

## 创建一个本地仓库
选择一个文件夹`testgit`作为仓库

`pwd` : `/home/kirito/testgit`

`git init` : `已初始化空的 Git 仓库于 /home/kirito/testgit/.git/`

上面命令会在目录下生成一个`.git/`文件夹，不要去动它

在目录下创建一个文件`readme.md`

`cat readme.md` : `##test1`

`git add readme.md` : 没有输出，成功把文件加入暂存区，使用`git status`查看当前状态

提交到本地仓库需要使用`git commit readme.md`

不过在此之前，需要先设置身份（这其实是第一件要做的事）

`git config --global user.email  "you@example.com"`

`git config --global user.name  "Your Name"`

`--global`参数表示全局，如果仅在本仓库设置身份标识，则省略 --global 参数。

设置完成后

`git commit readme.md -m "提交的备注"`，也可以不加-m，会让你编辑一个文件提交信息

然后就提交到本地仓库了

如果我们这时候再修改readme.md的内容，然后执行`git status`

```
位于分支 master
尚未暂存以备提交的变更：
  （使用 "git add <文件>..." 更新要提交的内容）
  （使用 "git checkout -- <文件>..." 丢弃工作区的改动）

	修改：     readme.md

修改尚未加入提交（使用 "git add" 和/或 "git commit -a"）
```
会提示有一个没有缓存的变更，

使用`git diff readme.md`会打印文件有什么改动，确定改动可以执行`git add readme.md`和`git commit readme.md`

##版本回退
使用`git log`查看所有版本
```
commit 163ba2ae27e4d5408eef9d8dbe0deca8d8c578dc (HEAD -> master)
Author: kirito <1026860069@qq.com>
Date:   Thu Jan 31 19:37:39 2019 +0800

    hahahh

commit 474e3ecbed1d328325537413abf321d56bedf833
Author: kirito <1026860069@qq.com>
Date:   Thu Jan 31 18:14:16 2019 +0800

    2cm

commit 0885da8a228a626322f34e60c288c33b3871dfa3
Author: kirito <1026860069@qq.com>
Date:   Thu Jan 31 18:12:26 2019 +0800

    test commit 1
```
head指向的是当前版本，如果想回退到上一个版本

`git reset --hard HEAD^`

回退到上上个`git reset --hard HEAD^^`,上上上个`git reset --hard HEAD^^^`.....

回退到上100个`git reset --hard HEAD~100`

你会发现回退过后。`git log`里面就没有以前的记录了，

如果后悔了，执行`git reflog`找到以前版本的版本号，使用版本号回退到你想要的版本

`git reset --hard 版本号`

##远程仓库

本地Git仓库和`github`仓库之间的传输是通过SSH加密的

创建`ssh key`，在`~/.ssh`目录下

`ssh-keygen -t rsa –C “youremail@example.com”`

`id_rsa`是私钥，`id_rsa.pub`是公钥

登陆你的`github`，`设置`，`添加sshkey`,复制公钥，创建

完成后再github上创建一个新的仓库，

他会提示可以从这个仓库克隆出新的仓库，也可以把一个已有的本地仓库与之关联，然后，把本地仓库的内容推送到GitHub仓库。我们使用后者。

`git remote add origin https://github.com/zshorz/testgit.git`

`git push -u origin master`

如果出现remote: error: GH007: Your push would publish a private email address.

进入你github setting email，把 keep my email address private 的勾去掉

使用https地址每次都有输入密码，可使用ssh方式`git@github.com:zshorz/testgit.git`

##创建合并分支

HEAD实际上指向的是分支，以上都只有一个分支`master`主分支。

使用`git checkout -b newline`创建并切换到新分支

或者`git branch newline` `git checkout newline`

使用`git branch`会列出所有分支，前面带`*`号的是HEAD的指向，即当前分支

在一个分支上做改动不会影响另一个分支

`git merge <name>` 合并指定分支到当前分支

把newline合并到master上并删除newline

`git checkout master`

`git merge newline`

 `git branch -d newline` 
 
通常合并分支时，git一般使用”Fast forward”模式，在这种模式下，删除分支后，会丢掉分支信息，现在我们来使用带参数 –no-ff来禁用”Fast forward”模式。首先我们来做demo演示下：

##分支切换问题

当你在一个分支工作时，不得不切换到另一个分支去，但你当前分支的工作没有完成，你不想提交他们，就可以使用`git stash`储藏工作目录状态

`git stash save "some message"`

在需要的时候`git stash pop`恢复工作，帮助`git stash -h`

##远程仓库

分支推送

`git push origin <name>`

创建新分支并跟踪远程分支

`git checkout –b dev origin/dev`

删除远程分支

`git push origin <name>`