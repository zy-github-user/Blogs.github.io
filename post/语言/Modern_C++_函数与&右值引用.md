## Lambda表达式

Lambda 表达式是现代 C++ 中最重要的特性之一，而 Lambda 表达式，实际上就是提供了一个类似匿名函数的特性， 而匿名函数则是在需要一个函数，但是又不想费力去命名一个函数的情况下去使用的。这样的场景其实有很多很多， 所以匿名函数几乎是现代编程语言的标配。



### 基础

Lambda 表达式的基本语法如下：

```cpp
[捕获列表](参数列表) mutable(可选) 异常属性 -> 返回类型 {
// 函数体
}
```

上面的语法规则除了 `[捕获列表]` 内的东西外，其他部分都很好理解，只是一般函数的函数名被略去， 返回值使用了一个 `->` 的形式进行



### 参数捕获



所谓捕获列表，其实可以理解为参数的一种类型，lambda 表达式内部函数体在默认情况下是不能够使用函数体外部的变量的， 这时候捕获列表可以起到传递外部数据的作用。根据传递的行为，捕获列表也分为以下几种：

1. 值捕获

   与参数传值类似，值捕获的前提是变量可以拷贝，不同之处则在于，被捕获的变量在 lambda 表达式被创建时拷贝， 而非调用时才拷贝：

   ```cpp
   void lambda_value_capture() {
       int value = 1;
       auto copy_value = [value] {
           return value;
       };
       value = 100;
       auto stored_value = copy_value();
       std::cout << "stored_value = " << stored_value << std::endl;
       // 这时, stored_value == 1, 而 value == 100.
       // 因为 copy_value 在创建时就保存了一份 value 的拷贝
   }
   ```

2. 引用捕获

   与引用传参类似，引用捕获保存的是引用，值会发生变化。

   ```cpp
   void lambda_reference_capture() {
       int value = 1;
       auto copy_value = [&value] {
           return value;
       };
       value = 100;
       auto stored_value = copy_value();
       std::cout << "stored_value = " << stored_value << std::endl;
       // 这时, stored_value == 100, value == 100.
       // 因为 copy_value 保存的是引用
   }
   ```

3. 隐式捕获

   手动书写捕获列表有时候是非常复杂的，这种机械性的工作可以交给编译器来处理，这时候可以在捕获列表中写一个  `&` 或 `=` 向编译器声明采用引用捕获或者值捕获.

   * `[]` - 空捕获列表
   * `[name1,n2,...]` - 捕获一系列变量
   * [&] - 引用捕获, 让编译器自行推导捕获列表
   * [=] - 值捕获, 让编译器执行推导引用列表



C++14 给与了我们方便，允许捕获的成员用任意的表达式进行初始化，这就允许了右值的捕获， 被声明的捕获变量类型会根据表达式进行判断，判断方式与使用 `auto` 本质上是相同的：

```cpp
#include <iostream>
#include <utility>

int main() {
    auto important = std::make_unique<int>(1);
    auto add = [v1 = 1, v2 = std::move(important)](int x, int y) -> int {
        return x+y+v1+(*v2);
    };
    std::cout << add(3,4) << std::endl;
    return 0;
}
```

`important` 是一个独占指针，是不能够被捕获到的，这时候我们需要将其转移为右值， 在表达式中初始化。



### 泛型Lambda

从 C++14 开始， Lambda 函数的形式参数可以使用 `auto` 关键字来产生意义上的泛型：

```cpp
auto add = [](auto x, auto y) {
    return x+y;
};

add(1, 2);
add(1.1, 2.2);
```

### 编译器如何处理Lambda

对于如下代码

```cpp
#include <bits/stdc++.h>
using namespace std;

function<int()> foo;

int main()
{
	int a,b;
  	auto f = [a,b]() mutable->int{ return a+b;};
  	foo = f;
  	cout << f() << endl;
  	cout << foo() << endl;
}
```

编译器会展开Lambda为一个class

```cpp
#include <bits/stdc++.h>
using namespace std;

function<int ()> foo = std::function<int ()>();


int main()
{
  int a;
  int b;
    
  class __lambda_9_13
  {
    public: 
    inline int operator()()
    {
      return a + b;
    }
    
    private: 
    int a;
    int b;
    public: 
    // inline /*constexpr */ __lambda_9_13(const __lambda_9_13 &) noexcept = default;
    // inline /*constexpr */ __lambda_9_13(__lambda_9_13 &&) noexcept = default;
    __lambda_9_13(int _a, int _b)
    : a{_a}
    , b{_b}
    {}
    
  };
  
  __lambda_9_13 f = __lambda_9_13(__lambda_9_13{a, b});
  foo.operator=(f);
  std::cout.operator<<(f.operator()()).operator<<(std::endl);
  std::cout.operator<<(foo.operator()()).operator<<(std::endl);
}
```

（这么一看其实这个闭包很容易理解，lambda+function+bind 简直就是神器）





## std::function

 `std::function` 是在 C++11 中新增的一个用于统一包装可调用对象的模板类型. 所谓统一包装, 就是无论被包装的内容的实际类型, 只要符合相应的函数调用签名, 都可以装入一个 `std::function` 对象中使用，比如普通函数，静态成员函数，函数对象。（非静态成员函数可以用lambda或bind包装传给function）

```cpp
#include <functional>
#include <iostream>

int foo(int para) {
    return para;
}

class Callable{
public:
    Callable(int a, int b):x(a),y(b){}
    int operator()(int arg){
        return arg+x+y;
    }
private:
	int x,y;    
};

int main() {
    // std::function 包装了一个返回值为 int, 参数为 int 的函数
    std::function<int(int)> func = foo;
    
    // 包装一个函数对象
    Callable c(1,2);
    std::function<int(int)> func2 = c;
	
    // 包装一个lambda，lambda本质也是函数对象
    int important = 10;
    std::function<int(int)> func3 = [&](int value) -> int {
        return 1+value+important;
    };
    
    std::cout << func(10) << std::endl;
    std::cout << func2(10) << std::endl;
    std::cout << func3(10) << std::endl;
}
/* 输出
10
13
21
*/
```

`std::bind`的实现位于`<std_function.h>`，它使用了模板偏特化的技巧来接收函数调用签名。

```cpp
// 默认特化没有实现
template<typename Signature>
class function;

// 实现有返回值类型和 任意 个参数类型的偏特化
template<typename Res, typename... ArgTypes>
class function<Res(ArgTypes...)>
    
// 类似函数签名的模板特化形式并不常见, 虽然它是 C++11 之前就一直存在的语法.
```

`std::function`可以捕获函数和任意大小的函数对象，函数对象的大小为未知的，而`std::function`得大小总是固定的，保存函数指针或函数对象的工作是由` _Function_base`这个类来实现的，它本身有一些固定空间，如果存不下，会从堆上分配内存。

### 实现细节说明

`std::function`在头文件中的定义

```cpp
template<typename _Res, typename... _ArgTypes>
class function<_Res(_ArgTypes...)>
	: public _Maybe_unary_or_binary_function<_Res, _ArgTypes...>, 
		// 如果是一元函数或二元函数，会加上一些trait信息，与STL更好的融合
      private _Function_base 
      	// 负责存储函数指针或函数对象，根据大小，选择存储方式
{
public:
          typedef _Res result_type; 
          
          // 构造器 ...
          
          // 重载 bool()
          explicit operator bool() const noexcept
          { return !_M_empty(); }
          
          // 重载 ()
          _Res operator()(_ArgTypes... __args) const
          {
              if (_M_empty()) // 如果_M_functor为空，就抛出异常
                  __throw_bad_function_call();
              return _M_invoker(_M_functor, std::forward<_ArgTypes>(__args)...);
          }
          
          // ... 省略
                  
private:
          using _Invoker_type = _Res (*)(const _Any_data&, _ArgTypes&&...);
          _Invoker_type _M_invoker; // 构造器里会初始化它，负责调用函数
          
};

```

暂略。。。

https://www.cnblogs.com/jerry-fuyi/p/std_function_interface_implementation.html



## std::bind

其实可以发现，**Lambda完全可以替代bind**



`std::bind` 则是用来绑定函数调用的参数的， 它解决的需求是我们有时候可能并不一定能够一次性获得调用某个函数的全部参数，通过这个函数， 我们可以将部分调用参数提前绑定到函数身上成为一个新的对象，然后在参数齐全后，完成调用：

```cpp
int foo(int a, int b, int c) {
    ;
}
int main() {
    // 将参数1,2绑定到函数 foo 上，但是使用 std::placeholders::_1 来对第一个参数进行占位
    auto bindFoo = std::bind(foo, std::placeholders::_1, 1,2);
    // 这时调用 bindFoo 时，只需要提供第一个参数即可
    bindFoo(1);
    
    // bindFoo 其实可以存在 std::function<int(int)> 中
}
```

再来点高阶的玩法，在`muduo`网络库里学到过，bind还能把一个class个成员函数与对象绑定，存在function中实现回调：

```cpp
#include <bits/stdc++.h>

class test {
public:
    test(int a=1, int b=0):_a(a),_b(b){}
    int get_sum_with(int x){
        std::cout << this << " get_sum_with " << x << std::endl;
        return _a+_b+x;
    }
private:
    int _a,_b;
};

std::function<int(int)> foo;

int main(){

    test obj(5,6);

    foo = std::bind(&test::get_sum_with, &obj, std::placeholders::_1);

    std::cout << foo(1) << std::endl;

    return 0;
}

/* 输出
0x60fdb8 get_sum_with 1
12
*/
```

要注意的是，`bind`非静态成员函数是，以一个参数一定是对象函数地址。

## 右值引用

右值引用是 C++11 引入的与 Lambda 表达式齐名的重要特性之一。它的引入解决了 C++ 中大量的历史遗留问题， 消除了诸如 `std::vector`、`std::string` 之类的额外开销， 也才使得函数对象容器 `std::function` 成为了可能。



### 左值，右值

要弄明白右值引用到底是怎么一回事，必须要对左值和右值做一个明确的理解。



* **左值(lvalue, left value)** - 顾名思义就是赋值符号左边的值，一个占据内存中某个可识别的位置（也就是一个地址）的对象
* **右值(rvalue, right value)** - 等号右边的值，是指表达式结束后就不再存在的临时对象。一个表达式不是 *左值* 就是 *右值* 。

C++11 中为了引入强大的右值引用，将右值的概念进行了进一步的划分，分为：纯右值、将亡值。

* **纯右值(prvalue, pure rvalue)** - 纯粹的右值，要么是纯粹的字面量，例如 `10`, `true`； 要么是求值结果相当于字面量或匿名临时对象，例如 `1+2`。非引用返回的临时变量、运算表达式产生的临时变量、 原始字面量、Lambda 表达式都属于纯右值。
* **将亡值(xvalue, expiring value)** - 是 C++11 为了引入右值引用而提出的概念（因此在传统 C++中， 纯右值和右值是同一个概念），也就是即将被销毁、却能够被移动的值。





将亡值理解：

```cpp
std::vector<int> foo() {
    std::vector<int> temp = {1, 2, 3, 4};
    return temp;
}

std::vector<int> v = foo();
```

函数 `foo` 的返回值 `temp` 在内部创建然后被赋值给 `v`， 然而 `v` 获得这个对象时，会将整个 temp 拷贝一份，然后把 `temp` 销毁，如果这个 `temp` 非常大， 这将造成大量额外的开销（这也就是传统 C++ 一直被诟病的问题）。



在 C++11 之后，编译器为我们做了一些工作，此处的左值 `temp` 会被进行此隐式右值转换， 等价于 `static_cast<std::vector<int> &&>(temp)`，进而此处的 `v` 会将 `foo` 局部返回的值进行移动。 也就是移动语义。

### 右值引用

需要拿到一个将亡值，就需要用到右值引用的申明：`T &&`，其中 `T` 是类型。 右值引用的声明让这个临时值的生命周期得以延长、只要变量还活着，那么将亡值将继续存活。



C++11 提供了 `std::move` 这个方法将左值参数无条件的转换为右值， 有了它我们就能够方便的获得一个右值临时对象，例如：

```cpp
#include <iostream>
#include <string>

void reference(std::string& str) {
    std::cout << "左值" << std::endl;
}
void reference(std::string&& str) {
    std::cout << "右值" << std::endl;
}

int main()
{
    std::string lv1 = "string,"; // lv1 是一个左值
    // std::string&& r1 = lv1; // 非法, 右值引用不能引用左值
    std::string&& rv1 = std::move(lv1); // 合法, std::move可以将左值转移为右值
    std::cout << rv1 << std::endl; // string,

    const std::string& lv2 = lv1 + lv1; // 合法, 常量左值引用能够延长临时变量的生命周期
    // lv2 += "Test"; // 非法, 常量引用无法被修改
    std::cout << lv2 << std::endl; // string,string

    std::string&& rv2 = lv1 + lv2; // 合法, 右值引用延长临时对象生命周期
    rv2 += "Test"; // 合法, 非常量引用能够修改临时变量
    std::cout << rv2 << std::endl; // string,string,string,Test

    reference(rv2); // 输出左值

    return 0;
}
```

`rv2` 虽然引用了一个右值，但由于它是一个引用，所以 `rv2` 依然是一个左值。



### 移动语义

传统 C++ 通过拷贝构造函数和赋值操作符为类对象设计了拷贝/复制的概念，但为了实现对资源的移动操作， 调用者必须使用先复制、再析构的方式，否则就需要自己实现移动对象的接口。



传统的 C++ 没有区分『移动』和『拷贝』的概念，造成了大量的数据拷贝，浪费时间和空间。 右值引用的出现恰好就解决了这两个概念的混淆问题:



```cpp
#include <iostream>
class A {
public:
    int *pointer;

    A():pointer(new int(1)) {
        std::cout << "构造" << pointer << std::endl;
    }

    A(A& a):pointer(new int(*a.pointer)) {
        std::cout << "拷贝" << pointer << std::endl;
    } // 深拷贝

    A(A&& a):pointer(a.pointer) {
        a.pointer = nullptr;
        std::cout << "移动" << pointer << std::endl;
    } // 移动语义会破坏传入对象，

    ~A(){
        std::cout << "析构" << pointer << std::endl;
        delete pointer;
    }
};

// 防止编译器优化
A return_rvalue(bool test) {
    A a,b;
    if(test) return a; // 等价于 static_cast<A&&>(a);
    else return b;     // 等价于 static_cast<A&&>(b);
}

int main() {
    A obj = return_rvalue(false);  // 函数返回一个右值，除法移动构造
    std::cout <<std::endl;
    std::cout << "obj:" << std::endl;
    std::cout << obj.pointer << std::endl;
    std::cout << *obj.pointer << std::endl<<std::endl;

    A obj2(std::move(obj));
    std::cout <<std::endl;
    std::cout << "obj2:" << std::endl;
    std::cout << obj2.pointer << std::endl;
    std::cout << *obj2.pointer << std::endl;

    std::cout <<std::endl;
    std::cout << "obj:" << std::endl;
    std::cout << obj.pointer << std::endl;
    //std::cout << *obj.pointer << std::endl<<std::endl; //崩溃

    return 0;
}

/* 输出
构造0x1d1750
构造0x1d1770
移动0x1d1770
析构0
析构0x1d1750

obj:
0x1d1770
1

移动0x1d1770

obj2:
0x1d1770
1

obj:
0
析构0x1d1770
析构0
*/
```



首先函数里构造了两个个对象`a`,`b`，`a`析构了，`b`当做右值返回先移动构造了`obj`，然后析构了。此时`obj`内容就是`b`的内容。



然后把`obj`强行转换成了右值引用，去移动构造了`obj2`, 此时`obj`的内容已被破坏。（`std::move`本来就是对不再使用的变量使用的）



移动构造直接把将亡值或不用的值里的内容抢过来用，而不是自己再深拷贝一份，提高了性能

### 完美转发

前面我们提到了，一个声明的右值引用其实是一个左值。这就为我们进行参数转发（传递）造成了问题：

```cpp
void reference(int& v) {
    std::cout << "左值" << std::endl;
}

void reference(int&& v) {
    std::cout << "右值" << std::endl;
}

template <typename T>
void pass(T&& v) {
    std::cout << "传参:";
    reference(v); // 始终调用 reference(int&)
}



int main() {
    std::cout << "传递右值:" << std::endl;
    pass(1); // 1是右值, 但输出是左值

    std::cout << "传递左值:" << std::endl;
    int l = 1;
    pass(l); // l 是左值, 输出左值

    return 0;
}
/* 输出
传递右值:
传参:左值
传递左值:
传参:左值
*/
```

对于 `pass(1)` 来说，虽然传递的是右值，但由于 `v` 是一个引用，所以同时也是左值。 因此 `reference(v)` 会调用 `reference(int&)`，输出『左值』。



而对于`pass(l)`而言，`l`是一个左值，为什么会成功传递给 `pass(T&&)` 呢？



这是基于**引用坍缩规则**的：在传统 C++ 中，我们不能够对一个引用类型继续进行引用， 但 C++ 由于右值引用的出现而放宽了这一做法，从而产生了引用坍缩规则，允许我们对引用进行引用， 既能左引用，又能右引用。但是却遵循如下规则：

| 函数形参类型 | 实参参数类型 | 推导后函数形参类型 |
| ------------ | ------------ | ------------------ |
| T&           | 左引用       | T&                 |
| T&           | 右引用       | T&                 |
| T&&          | 左引用       | T&                 |
| T&&          | 右引用       | T&&                |

因此，模板函数中使用 `T&&` 不一定能进行右值引用，当传入左值时，此函数的引用将被推导为左值。 更准确的讲，**无论模板参数是什么类型的引用，当且仅当实参类型为右引用时，模板参数才能被推导为右引用类型**。





所谓完美转发，就是为了让我们在传递参数的时候， 保持原来的参数类型（左引用保持左引用，右引用保持右引用）。 为了解决这个问题，我们应该使用 `std::forward` 来进行参数的转发（传递）：

```cpp
#include <bits/stdc++.h>
void reference(int& v) {
    std::cout << "左值" << std::endl;
}

void reference(int&& v) {
    std::cout << "右值" << std::endl;
}

template <typename T>
void pass(T&& v) {
    std::cout << "传参:";
    reference(std::forward<T>(v)); // 使用完美转发
}


int main() {
    std::cout << "传递右值:" << std::endl;
    pass(1); // 1是右值, 输出是右值

    std::cout << "传递左值:" << std::endl;
    int l = 1;
    pass(l); // l 是左值, 输出左值

    return 0;
}
/*
传递右值:
传参:右值
传递左值:
传参:左值
*/
```



传入参数为右值时，v（v是一个引用，所以是左值）被成功转发为`T&&`