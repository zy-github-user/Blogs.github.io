## 智能指针



### RAII&引用计数

对于一个对象而言，我们在构造函数的时候申请空间，而在析构函数（在离开作用域时调用）的时候释放空间， 也就是我们常说的 **Resource Acquisition Is Initialization资源获取即初始化**技术。 



引用计数是为了防止内存泄露而产生的。 基本想法是对于动态分配的对象，进行引用计数，每当增加一次对同一个对象的引用，那么引用对象的引用计数就会增加一次， 每删除一次引用，引用计数就会减一，当一个对象的引用计数减为零时，就自动删除指向的堆内存。



C++11 引入了智能指针的概念，使用了引用计数的想法，让程序员不再需要关心手动释放内存。 这些智能指针就包括 `std::shared_ptr`/`std::unique_ptr`/`std::weak_ptr`，使用它们需要包含头文件 `<memory>`

### std::shared_ptr

`std::shared_ptr` 是一种智能指针，它能够记录多少个 `shared_ptr` 共同指向一个对象，从而消除显示的调用  `delete`，当引用计数变为零的时候就会将对象自动删除。



因为使用 `std::shared_ptr` 仍然需要使用 `new` 来调用，这使得代码出现了某种程度上的不对称。



使用`std::make_shared` 就能够用来消除显式的使用 `new`，



```cpp
std::shared_ptr<int> sp_i = std::make_shared<int>(10); // 用auto也行
std::shared_ptr<int> sp_j(new int(10)); 

std::cout << *sp_2.get() << std::endl;		// 获取原生指针
std::cout << *sp_2 << std::endl;			
std::cout << sp_2.use_count() << std::endl;	// 获取引用计数
sp_2.reset();	// 重置并减少引用计数, sp_2.reset(sp3)
```



两个对象如果通过`std::shared_ptr`互相引用，会出现循环引用的问题，需要`weak_prt`来解决

```cpp
struct A;
struct B;

struct A {
    std::shared_ptr<B> pointer;
    ~A() {
        std::cout << "A 被销毁" << std::endl;
    }
};
struct B {
    std::shared_ptr<A> pointer;
    ~B() {
        std::cout << "B 被销毁" << std::endl;
    }
};
int main() {
    auto a = std::make_shared<A>();
    auto b = std::make_shared<B>();
    
    // a b 互相引用
    a->pointer = b;
    b->pointer = a;
}
// 程序结束，并没有调用任何一个析构器,因为引用计数没有变成0
```

### std::weak_ptr

前面的例子里，正确的写法应该是：

```cpp
struct A;
struct B;

struct A {
    std::weak_ptr<B> pointer;  // A 使用 weak_ptr
    ~A() {
        std::cout << "~A()" << std::endl;
    }
};
struct B {
    std::shared_ptr<A> pointer;
    ~B() {
        std::cout << "~B()" << std::endl;
    }
};
int main() {
    auto a = std::make_shared<A>();
    auto b = std::make_shared<B>();
    a->pointer = b;
    b->pointer = a;
    
	// 判断资源是否已释放（过期返回true）
    std::cout << (bool)a->pointer.expired() << std::endl; 
    	
    auto c = a->pointer.lock(); // 如果资源没有过期，可以拿到 b 的智能指针， 否则返回空的智能指针
}
/*
0
~B()
~A()
*/
```



### std::unique_ptr

`std::unique_ptr` 是一种独占的智能指针，它禁止其他智能指针与其共享同一个对象，从而保证代码的安全：

```cpp
std::unique_ptr<int> up(new int(10));
std::unique_ptr<int> pointer = std::make_unique<int>(10); // make_unique 从 C++14 引入
std::unique_ptr<int> pointer2 = pointer; // 非法
```

不能拷贝，所以智能只能通过引用传参





## 并发



### 线程

C++11标准库支持了多程，开发经验与使用`pthread`是一样的。



`std::thread` 用于创建一个执行的线程实例，所以它是一切并发编程的基础，使用时需要包含`<thread>`头文件。

```cpp
void run(int x) {
    std::cout << x << std::endl;
}

// 线程将在创建新对象后立即开始
std::thread t([](){
    std::cout << std::this_thread::get_id() << std::endl; // 获取当前线程id
});
t.detach(); // 设置线程为分离态

std::thread t2(run, 5);
t2.join(); // 等待线程结束

std::this_thread::sleep_for(std::chrono::seconds(3)); // 睡眠3s
```



### 互斥锁&条件变量&once

头文件`<mutex>`

#### once

先说 `once`，和`pthread`里的`pthread_once`用法一样：

```cpp
void init() {
    std::cout << "Initialing..." << std::endl;
    // Do something...
}

void worker(std::once_flag* flag) {
    std::call_once(*flag, init);
}

int main() {
    std::once_flag flag;

    std::thread t1(worker, &flag);
    std::thread t2(worker, &flag);
    std::thread t3(worker, &flag);

    t1.join();
    t2.join();
    t3.join();

    return 0;
}
// init 只会执行一次， 写单例模式会用这个
```

#### 互斥锁

```cpp
{
    std::mutex mtx;
    // ...
    {
        std::lock_guard<std::mutex> lock(mtx);  // 哨兵初始化即 lock, 析构即 unlock
        // 临界区
    }
    return;
}

// 不用哨兵手动操作
mtx.lock();
mtx.try_lock();
mtx.unlock();
```

建议使用哨兵，由于 C++ 保证了所有栈对象在声明周期结束时会被销毁，所以这样的代码也是异常安全的。如果不使用哨兵，在异常发生时，还没执行unlock，就没法再解锁了。



`std::unique_lock` 则是相对于 `std::lock_guard` 出现的，`std::unique_lock` 更加灵活，`std::unique_lock` 的对象会以独占所有权（没有其他的 `unique_lock` 对象同时拥有某个 `mutex` 对象的所有权） 的方式管理 `mutex` 对象上的上锁和解锁的操作。所以在并发编程中，推荐使用 `std::unique_lock`。

```cpp
void func(int change_v) {
    static std::mutex mtx;
    std::unique_lock<std::mutex> lock(mtx);
    // 执行竞争操作
    v = change_v;
    std::cout << v << std::endl;
    // 将锁进行释放
    lock.unlock();

    // 在此期间，任何人都可以抢夺 mtx 的持有权

    // 开始另一组竞争操作，再次加锁
    lock.lock();
    v += 1;
    std::cout << v << std::endl;
    // 哨兵销毁自动解锁
}
```



`std::lock_guard` 不能显式的调用 `lock` 和 `unlock`， 而 `std::unique_lock` 可以在声明后的任意位置调用， 可以缩小锁的作用范围，提供更高的并发度。



条件变量 `std::condition_variable::wait` 必须使用 `std::unique_lock` 作为参数。



#### 条件变量



`std::condition_variable`的 `notify_one()` 用于唤醒一个线程； `notify_all()` 则是通知所有线程。



一个生产者和消费者的例子

```cpp
#include <queue>
#include <chrono>
#include <mutex>
#include <thread>
#include <iostream>
#include <condition_variable>


int main() {
    std::queue<int> produced_nums;
    std::mutex mtx;
    std::condition_variable cv;
    bool notified = false;  // 通知信号

    // 生产者
    auto producer = [&]() {
        for (int i = 0; ; i++) {
            std::this_thread::sleep_for(std::chrono::milliseconds(900));
            std::unique_lock<std::mutex> lock(mtx);
            std::cout << "producing " << i << std::endl;
            produced_nums.push(i);
            notified = true;
            cv.notify_all(); // 此处也可以使用 notify_one
        }
    };
    // 消费者
    auto consumer = [&]() {
        while (true) {
            std::unique_lock<std::mutex> lock(mtx);
            while (!notified) {  // 避免虚假唤醒
                cv.wait(lock); // 先锁住，传给条件变量，条件变量会把自己挂在等待队列，然后解锁
                				// 当从wait返回时，mtx被重新上锁，和pthread是一样的，没啥好说
            }
            // 短暂取消锁，使得生产者有机会在消费者消费空前继续生产
            lock.unlock();
            std::this_thread::sleep_for(std::chrono::milliseconds(1000)); // 消费者慢于生产者
            lock.lock(); // 开始工作
            while (!produced_nums.empty()) {
                std::cout << "consuming " << produced_nums.front() << std::endl;
                produced_nums.pop();
            }
            notified = false;
            // 解锁
        }
    };

    // 分别在不同的线程中运行
    std::thread p(producer);
    std::thread cs[2];
    for (int i = 0; i < 2; ++i) {
        cs[i] = std::thread(consumer);
    }
    p.join();
    for (int i = 0; i < 2; ++i) {
        cs[i].join();
    }
    return 0;
}
```





### std::future

`std::future`，提供了一个访问异步操作结果的途径。



如果我们的主线程 A 希望新开辟一个线程 B 去执行某个我们预期的任务，并返回我一个结果。 而这时候，线程 A 可能正在忙其他的事情，无暇顾及 B 的结果， 所以我们会很自然的希望能够在某个特定的时间获得线程 B 的结果。



C++11 提供的 `std::future` 简化了这个流程，可以用来获取异步任务的结果。 自然地，我们很容易能够想象到把它作为一种简单的线程同步手段，即屏障（barrier）(屏障可以看APUE)



`future `对象可以异步返回共享状态的值，或者在必要的情况下阻塞调用者并等待共享状态标志变为 ready，然后才能获取共享状态的值。



使用 `std::packaged_task`，它可以用来封装任何可以调用的目标，从而用于实现异步的调用。 举例来说：

```cpp
#include <iostream>
#include <future>
#include <thread>

int main() {
    // 将一个返回值为7的 lambda 表达式封装到 task 中
    // std::packaged_task 的模板参数为要封装函数的类型
    std::packaged_task<int()> task([](){return 7;});
    // 获得 task 的 future` 
    std::future<int> result = task.get_future(); 
    // 在一个线程中执行 task
    std::thread(std::move(task)).detach();
    std::cout << "waiting...";
    //result.wait(); // 在此设置屏障，阻塞到期物的完成, 及时不设置等待，调用get()时也会等待
    // 输出执行结果
    std::cout << "done!" << std:: endl << "future result is " << result.get() << std::endl;
    return 0;
}
```



`std::shared_future` 与 `std::future` 类似，但是 `std::shared_future` 可以拷贝、多个  `std::shared_future` 可以共享某个共享状态的最终结果(即共享状态的某个值或者异常)。



`shared_future` 可以通过某个 ` std::future` 对象隐式转换，或者通过 ` std::future::share() `显示转换，无论哪种转换，被转换的那个 `std::future `对象都会变为无效.



### std::promise

`std::promise `对象是异步 Provider，它可以在某一时刻设置共享状态的值。

```cpp
#include <iostream>  
#include <functional>     
#include <thread>  
#include <future>       

void print_int(std::future<int>& fut) {
    int x = fut.get(); // 获取共享状态的值.
    std::cout << "value: " << x << '\n'; // 打印 value: 10.
}

int main ()
{
    std::promise<int> prom; // 生成一个 std::promise<int> 对象.
    std::future<int> fut = prom.get_future(); // 和 future 关联.
    std::thread t(print_int, std::ref(fut)); // 将 future 交给另外一个线程t.
    prom.set_value(10); // 设置共享状态的值, 此处和线程t保持同步.
    t.join();
    return 0;
}
```

 `std::promise `对象是禁止拷贝的，`operator=` 只有 move 语义



### std::packaged_task

`std::packaged_task`  包装一个可调用的对象，并且允许异步获取该可调用对象产生的结果，从包装可调用对象意义上来讲，`std::packaged_task` 与  `std::function` 类似，只不过 `std::packaged_task `将其包装的可调用对象的执行结果传递给一个 `std::future `对象



与 `std::promise` 类似， `std::packaged_task` 也禁用了普通的赋值操作运算，只允许 `move` 赋值运算。

```cpp
std::packaged_task<int()> task([](){return 7;});
task(); // 执行任务，可以放在别的线程
auto f = task.get_future();
std::cout << f.get() << std::endl;
```



### std::async

c++11提供了异步接口`std::async`，通过这个异步接口可以很方便的获取线程函数的执行结果。



`std::async`会自动创建一个线程去调用线程函数，它返回一个`std::future`，这个`future`中存储了线程函数返回的结果，当我们需要线程函数的结果时，直接从`future`中获取，非常方便。



`std::async`先将异步操作用`std::packaged_task`包装起来，然后将异步操作的结果放到`std::promise`中。外面再通过`future.get/wait`来获取这个结果



使用：

```cpp
// std::async(std::launch::async | std::launch::deferred, f, args...)
// 参数1可以从两个中选一个，前者是立即创建线程，后者延迟到调用了future的get或者wait时才创建线程
// 参数2 线程函数   后面跟函数参数
std::future<int> f1 = std::async(std::launch::async, [](){ 
        					return 8;  
						}); 

std::cout << f1.get( ) << std::endl; //output: 8
```



如果`std::async`返回的`future`没有被绑定到变量上，那么`future`的析构器将为阻塞，直到异步操作完成

```cpp
std::async(std::launch::async, []{ f(); }); // 返回的future会等待f()执行完成
std::async(std::launch::async, []{ g(); }); // does not start until f() completes
```









参考了这几个博客

https://www.cnblogs.com/haippy/p/3284540.html



https://www.cnblogs.com/qicosmos/p/3534211.html

