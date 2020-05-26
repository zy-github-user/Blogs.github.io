## gdb
usage:

直接调试程序 调试coredump 附加到已有进程

`gdb [options] [executable-file [core-file or porcess-id]]`

调试程序 并传递命令行参数给程序

`gdb [options] --args executable-file [arg...]`

也可以通过这些参数启动
```text
  --args             Arguments after executable-file are passed to inferior
  --core=COREFILE    Analyze the core dump COREFILE.
  --exec=EXECFILE    Use EXECFILE as the executable.
  --pid=PID          Attach to running process PID.
  --directory=DIR    Search for source files in DIR.
  --se=FILE          Use FILE as symbol file and executable file.
  --symbols=SYMFILE  Read symbols from SYMFILE.
  --readnow          Fully read symbol files on first access.
  --readnever        Do not read symbol files.
  --write            Set writing into executable and core files.

```

交互命令：括号里是命令简写，交互模式下回车默认执行上一条命令
```shell
# 运行
run (r) 运行程序，当遇到断点后，程序会在断点处停止运行
continue (c) 继续执行，到下一个断点处（或运行结束）
next (n) 单步跳过，当遇到函数调用时，不进入此函数体
setp (s) 单步跳入，当遇到函数调用时，进入此函数体
until 不想一个循环体内单步跟踪时，这个命令可以运行程序直到退出循环体。
until <行号> 执行到行号
finish 运行，直到当前函数完成返回，并打印函数返回时的堆栈地址和返回值及参数值等信息
call <func> 调用一个程序中的可见函数 例如： call printf("123")
quit (q) 退出gdb

# 断点
break <n> (b) 在第n行设置断点，也可以带路径：b test.cpp:20
break <func> (b) 在函数入口设置断点 
    条件断点 break main if argc > 1, b test.c:34 if (x == 1 && b), b 44 if strlen(str) == 0
delete <num> 删除断点好为num的断点
disable <num> 禁用断点好为num的断点
enable <num> 启用断点好为num的断点
clear <n> 清楚第n行的断点
info breakpoints (info b) 显示断点设置信息
delete breakpoints 清除所有断点

# 查看源代码 编译时 gcc -g 选项打开
list (l) 列出程序源代码，默认10行，可以连续按
list <n> 显示以第n行为中心的前后10行代码
list <func> 显示函数名所在的函数的源代码

# 打印
print <表达式> (p) 其中“表达式”可以是任何当前正在被测试程序的有效表达式, 如 c
    print a  打印变量a
    p str 打印字符串
    print func(a) 调用函数，打印返回值
display <表达式> 设置一个表达式，每次单步执行后，都会输出表达式的值
watch <表达式> 设置监视点，一旦值改变，停止程序执行，打印信息
whatis <arg> 打印变量或函数类型
info function 查询函数
info locals 打印当前堆栈页所有变量
info <display/watchpoints> 查看对应的断点号码
delete <n> 删除指定号码

# 运行信息
backtrace (bt) 查看调用栈 where，info stack都是bt的别名，功能一样 
frame <n> (f) bt出来的信息前面有编号，用frame查看某一帧的信息
info args 查看当前桢中的参数
info locals 查看当前桢中的局部变量
set args <arg...> 设置程序参数，命令行里用 --args 方式指定也行
show args 查看程序参数
info program 来查看程序的是否在运行，进程号，被暂停的原因

# 窗口分割
layout src 显示源代码窗口
layout asm 显示汇编窗口
layout regs 显示源代码/汇编和寄存器窗口
layout split 显示源代码和汇编窗口
layout next 显示下一个layout
layout prev 显示上一个layout
Ctrl + L 刷新窗口
Ctrl + x 再按1 单窗口模式，显示一个窗口
Ctrl + x 再按2 双窗口模式，显示两个窗口
Ctrl + x 再按a 回到传统模式，即退出layout，回到执行layout之前的调试窗口。
```

## 设置coredump
`ulimit -a` 显示当前限制
`ulimit -c 100` 设置core文件最大 100k
`ulimit -c 0` 禁止coredump
`ulimit -c unlimited` 不限制
修改只在当前shell有效，永久修改放进 `/etc/profile` 里

设置core命名方式，默认在程序所在目录生成core
在 `/etc/sysctl.conf` 追加两行
```text
# %c 转储文件的大小上限                 %e 所dump的文件名
# %g 所dump的进程的实际组ID             %h 主机名
# %p 所dump的进程PID                   %s 导致本次coredump的信号
# %t 转储时刻(由1970年1月1日起计的秒数)  %u 所dump进程的实际用户ID
kernel.core_pattern = /var/core/core_%e_%p
kernel.core_uses_pid = 0 # 为1是会强制加pid,我们自己指定设置为0
```
立即生效 `sysctl –p /etc/sysctl.conf` 

`SIGQUIT`，`SIGABRT`, `SIGFPE`和`SIGSEGV` 都可以让该进程产生coredump文件