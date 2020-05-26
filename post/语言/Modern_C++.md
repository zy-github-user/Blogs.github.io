## Modern_C++

[《现代c++教程》](https://changkun.de/modern-cpp) 笔记 - 项目[github](https://github.com/changkun/modern-cpp-tutorial)





从c++11开始被弃用的主要特性：

* 不允许字符串字面值常量赋给一个`char *`，应该使用`const char *`或`auto`
* c++98异常说明`unexpected_handler`,`set_unexpected()`等相关特性弃用，应该使用`noexcept`
* `auto_ptr`弃用，应该使用`unique_ptr`
* `register`关键字弃用
* `bool`类型`++`操作被弃用
* 如果一个类有析构函数，为其生成拷贝构造函数和拷贝赋值运算符的特性被弃用了。
* C语言风格类型转换被弃用，应使用`static_cast`,`reinterpret_cast`,`const_cast`
* c++17弃用了一些C标准库,如`<ccomplex>`,`<cstdalign>`,`cstdbool`,`ctgmath`



## 语言可用性强化

### 常量

###### nullptr

`nullptr`是为了替代`NULL`，C++不允许直接将`void *`隐式转换为其他类型，所以只能将`NULL`定义为`0`，这会在重载的时候出现问题：

```cpp
void foo(char*);
void foo(int);

foo(NULL); // 重载哪个？ 调用foo(int)，这在直觉上是错的，因为NULL代表空指针
```

在表示空指针的时候使用`nullptr`

###### constexpr

c++本身具有常量表达式的概念，比如`1+2,3*4`总是产生相同结果，编译器可以把这些表达式直接优化掉，但是必须是常量表达式：

```cpp
#define LEN 10 // LEN是常量表达式

int len = 10;	// 普通变量
// char arr[len] // 非法 数组大小必须常量表达式

const int len_2 = len+1; // const 常量  
// char arr[len_2] // 非法，常量不是常量表达式, 即便大多数编译器支持，这也是个非法表达式

constexpr int len_3 = 1 + 2 + 3; // c++11 关键字，常量表达式
constexpr int len_foo(){
    return 5;
}
arr[len_3]; // 合法
arr[len_foo() + 5]; // 合法

// constexpr 的函数可以使用递归
constexpr int fibonacci(const int n) {
    return n == 1 || n == 2 ? 1 : fibonacci(n-1)+fibonacci(n-2);
}
```

从 C++14 开始，`constexpr` 函数可以在内部使用局部变量、循环和分支等简单语句，例如下面的代码在 C++11 的标准下是不能够通过编译的：

```cpp
constexpr int fibonacci(const int n) {
    if(n == 1) return 1;
    if(n == 2) return 1;
    return fibonacci(n-1) + fibonacci(n-2);
}
```

### 变量及初始化

###### if/switch变量声明

C++17支持在`if/switch`语句中声明变量

```cpp
if (const std::vector<int>::iterator itr = std::find(vec.begin(), vec.end(), 3);
    itr != vec.end()) {
    *itr = 4;
}

switch(int c = f(); c) {
// ...
}
```

确实有go那味儿了



###### 初始化列表

在传统 C++ 中，不同的对象有着不同的初始化方法，例如普通数组、 POD （**P**lain **O**ld **D**ata，即没有构造、析构和虚函数的类或结构体） 类型都可以使用 `{}` 进行初始化，也就是我们所说的初始化列表。 而对于类对象的初始化，要么需要通过拷贝构造、要么就需要使用 `()` 进行。 这些不同方法都针对各自对象，不能通用。例如：

```cpp
#include <vector>

class Foo {
public:
    int value_a;
    int value_b;
    Foo(int a, int b) : value_a(a), value_b(b) {}
};

int main() {
    // before C++11
    int arr[3] = {1, 2, 3};
    Foo foo(1, 2);
    std::vector<int> vec = {1, 2, 3, 4, 5};
}
```

C++11 首先把初始化列表的概念绑定到了类型上，并将其称之为 `std::initializer_list`，允许构造函数或其他函数像参数一样使用初始化列表，这就为类对象的初始化与普通数组和 POD 的初始化方法提供了统一的桥梁，例如：

```cpp
#include <initializer_list>
#include <vector>

class MagicFoo {
public:
    std::vector<int> vec;
    MagicFoo(std::initializer_list<int> list) {
        for (std::initializer_list<int>::iterator it = list.begin(); 
             it != list.end(); ++it)
            vec.push_back(*it);
    }
};

// after C++11
MagicFoo magicFoo = {1, 2, 3, 4, 5};
```

初始化列表除了用在对象构造上，还能将其作为普通函数的形参，例如：

```cpp
public: 
    void foo(std::initializer_list<int> list) {
            for (std::initializer_list<int>::iterator it = list.begin();
                 it != list.end();
                 ++it) 
                vec.push_back(*it);
    }

magicFoo.foo({6,7,8,9});
```

C++11 还提供了统一的语法来初始化任意的对象，例如：

```cpp
Foo foo2 {3, 4};
```



###### 结构化绑定

结构化绑定提供了类似其他语言中提供的多返回值的功能。 C++11 新增了 `std::tuple` 容器用于构造一个元组，进而囊括多个返回值。但缺陷是，C++11/14 并没有提供一种简单的方法直接从元组中拿到并定义元组中的元素，尽管可以使用 `std::tie` 对元组进行拆包，但我们依然必须非常清楚这个元组包含多少个对象，各个对象是什么类型，非常麻烦。



C++17 完善了这一设定，给出的结构化绑定可以让我们写出这样的代码：

```cpp
#include <iostream>
#include <tuple>

std::tuple<int, double, std::string> f() {
    return std::make_tuple(1, 2.3, "456");
}

int main() {
    auto [x, y, z] = f(); //  auto 类型推导
    std::cout << x << ", " << y << ", " << z << std::endl;
    return 0;
}
```



### 类型推导

###### auto

```cpp
// 在 C++11 之前
for(vector<int>::const_iterator it = vec.cbegin(); itr != vec.cend(); ++it);

//  C++11 起
for (auto it = list.begin(); it != list.end(); ++it);

auto i = 5;              // i 被推导为 int
auto arr = new auto(10); // arr 被推导为 int *
```

`auto` 不能用于函数传参，还不能用于推导数组类型`auto auto_arr2[10] = arr;   // 错误`



###### decltype

`decltype` 关键字是为了解决 auto 关键字只能对变量进行类型推导的缺陷而出现的。它的用法和 `sizeof` 很相似：

```cpp
// decltype(表达式)
auto x = 1;
auto y = 2;
decltype(x+y) z;

// std::is_same<T, U> 用于判断 T 和 U 这两个类型是否相等
if (std::is_same<decltype(x), int>::value)
    std::cout << "type x == int" << std::endl;
if (std::is_same<decltype(x), float>::value)
    std::cout << "type x == float" << std::endl;
if (std::is_same<decltype(x), decltype(z)>::value)
    std::cout << "type z == type x" << std::endl;
```

###### 尾返回类型推导

考虑一个加法函数的例子，在传统 C++ 中我们必须这么写：

```cpp
template<typename R, typename T, typename U>
R add(T x, U y) {
    return x+y
}
```

在 C++11 中这个问题得到解决。虽然你可能马上会反应出来使用 `decltype` 推导 `x+y` 的类型，写出这样的代码：

```cpp
decltype(x+y) add(T x, U y)
```

但事实上这样的写法并不能通过编译。为此，C++11 还引入了一个叫做**尾返回类型（trailing return type**），利用 auto 关键字将返回类型后置：

```cpp
template<typename T, typename U>
auto add2(T x, U y) -> decltype(x+y){
    return x + y;
}
```

从 C++14 开始是可以直接让普通函数具备返回值推导

```cpp
template<typename T, typename U>
auto add3(T x, U y){
    return x + y;
}
```



###### decltype(auto)

`decltype(auto)` 是 C++14 开始提供的一个略微复杂的用法。



`decltype(auto)` 主要用于对转发函数或封装的返回类型进行推导，它使我们无需显式的指定 `decltype` 的参数表达式。考虑看下面的例子，当我们需要对下面两个函数进行封装时：

```cpp
std::string  lookup1();
std::string& lookup2();
```

在 C++11 中，封装实现：

```cpp
std::string look_up_a_string_1() {
    return lookup1();
}
std::string& look_up_a_string_2() {
    return lookup2();
}
```

而有了 `decltype(auto)`，我们可以让编译器完成这一件烦人的参数转发：

```cpp
decltype(auto) look_up_a_string_1() {
    return lookup1();
}
decltype(auto) look_up_a_string_2() {
    return lookup2();
}
```

(我说编译时间咋越来越长了（雾)）

### 控制流

###### if constexpr

C++11 引入了 `constexpr` 关键字，它将表达式或函数编译为常量结果。如果我们把这一特性引入到条件判断中去，让代码在编译时就完成分支判断，岂不是能让程序效率更高？（岂不是编译时间更高？哈哈）



C++17 将 `constexpr` 这个关键字引入到 `if` 语句中，允许在代码中声明常量表达式的判断条件

```cpp
#include <iostream>

template<typename T>
auto print_type_info(const T& t) {
    if constexpr (std::is_integral<T>::value) {
        return t + 1;
    } else {
        return t + 0.001;
    }
}
int main() {
    std::cout << print_type_info(5) << std::endl;
    std::cout << print_type_info(3.14) << std::endl;
}
```

编译器优化后

```cpp
int print_type_info(const int& t) {
    return t + 1;
}
double print_type_info(const double& t) {
    return t + 0.001;
}
int main() {
    std::cout << print_type_info(5) << std::endl;
    std::cout << print_type_info(3.14) << std::endl;
}
```

###### 区间for迭代

C++11 引入了基于范围的迭代写法

```cpp
std::vector<int> vec = {1, 2, 3, 4};

if (auto itr = std::find(vec.begin(), vec.end(), 3); itr != vec.end()) *itr = 4;

for (auto element : vec)
    std::cout << element << std::endl; // read only

for (auto &element : vec) 
    element += 1;                      // writeable

for (auto element : vec)
    std::cout << element << std::endl; // read only
```



### 模板



###### 外部模板

传统 C++ 中，模板只有在使用时才会被编译器实例化。换句话说，只要在每个编译单元（文件）中编译的代码中遇到了被完整定义的模板，都会实例化。这就产生了重复实例化而导致的编译时间的增加。并且，我们没有办法通知编译器不要触发模板的实例化。



为此，C++11 引入了外部模板，扩充了原来的强制编译器在特定位置实例化模板的语法，使我们能够显式的通知编译器何时进行模板的实例化：

```cpp
template class std::vector<bool>;          // 强行实例化
extern template class std::vector<double>; // 不在该当前编译文件中实例化模板
```

###### 尖括号>>

```cpp
std::vector<std::vector<int>> matrix; // c++11之前这么写是不合法的 当成了 >> 运算符
```



###### 类型别名模板

**模板是用来产生类型的。**在传统 C++ 中，`typedef`  可以为类型定义一个新的名称，但是却没有办法为模板定义一个新的名称。因为，模板不是类型。

```cpp
template<typename T, typename U>
class MagicType {
public:
    T dark;
    U magic;
};

// 不合法
template<typename T>
typedef MagicType<std::vector<T>, std::string> FakeDarkMagic;
```

C++11 使用 `using` 引入了下面这种形式的写法，并且同时支持对传统 `typedef` 相同的功效：

```cpp
typedef int (*process)(void *);
using NewProcess = int(*)(void *);

template<typename T>
using TrueDarkMagic = MagicType<std::vector<T>, std::string>;

int main() {
    TrueDarkMagic<bool> you;
}
```



###### 默认模板参数

我们可能定义了一个加法函数：

```cpp
template<typename T, typename U>
auto add(T x, U y) -> decltype(x+y) {
    return x+y;
}
```

但在使用时发现，要使用 add，就必须每次都指定其模板参数的类型。



在 C++11 中提供了一种便利，可以指定模板的默认参数：

```cpp
template<typename T = int, typename U = int>
auto add(T x, U y) -> decltype(x+y) {
    return x+y;
}
```



###### 变长参数模板

在 C++11 之前，无论是类模板还是函数模板，都只能按其指定的样子， 接受一组固定数量的模板参数；而 C++11 加入了新的表示方法， 允许任意个数、任意类别的模板参数，同时也不需要在定义时将参数的个数固定。

```cpp
template<typename... Ts> class Magic;
```

模板类 Magic 的对象，能够接受不受限制个数的 typename 作为模板的形式参数，例如下面的定义：

```cpp
class Magic<int,
            std::vector<int>,
            std::map<std::string,
            std::vector<int>>> darkMagic;

class Magic<> nothing;
```

除了在模板参数中能使用 `...` 表示不定长模板参数外， 函数参数也使用同样的表示法代表不定长参数

```cpp
template<typename... Args> void printf(const std::string &str, Args... args);
```

我们可以使用 `sizeof...` 来计算参数的个数

```cpp
template<typename... Ts>
void magic(Ts... args) {
    std::cout << sizeof...(args) << std::endl;
}
```

其次，对参数进行解包，到目前为止还没有一种简单的方法能够处理参数包，但有两种经典的处理手法：

1. 递归模板函数

   ```cpp
   #include <iostream>
   
   template<typename T0>
   void printf1(T0 value) {
       std::cout << value << std::endl;
   }
   
   template<typename T, typename... Ts>
   void printf1(T value, Ts... args) {
       std::cout << value << std::endl;
       printf1(args...); // 递归调用，慢慢展开
   }
   
   int main() {
       printf1(1, 2, "123", 1.1);
       return 0;
   }
   ```

   

2. 变参模板展开

   在 C++17 中增加了变参模板展开的支持，于是你可以在一个函数中完成 `printf` 的编写：

   ```cpp
   template<typename T0, typename... T>
   void printf2(T0 t0, T... t) {
       std::cout << t0 << std::endl;
       if constexpr (sizeof...(t) > 0) printf2(t...); // 其实还是递归
   }
   ```

3. 初始化列表展开

   递归模板函数是一种标准的做法，但缺点显而易见的在于必须定义一个终止递归的函数。这里介绍一种使用初始化列表展开的黑魔法：

   ```cpp
   template<typename T, typename... Ts>
   auto printf3(T value, Ts... args) {
       std::cout << value << std::endl;
       (void) std::initializer_list<T>{([&args] {
           std::cout << args << std::endl;
       }(), value)...};
   }
   ```

   通过初始化列表，`(lambda 表达式, value)...` 将会被展开。由于逗号表达式的出现，首先会执行前面的 lambda 表达式，完成参数的输出。 为了避免编译器警告，我们可以将 `std::initializer_list` 显式的转为 `void`。





###### 折叠表达式

C++ 17 中将变长参数这种特性进一步带给了表达式，考虑下面这个例子：

```cpp
#include <iostream>
template<typename ... T>
auto sum(T ... t) {
    return (t + ...);
}
int main() {
    std::cout << sum(1, 2, 3, 4, 5, 6, 7, 8, 9, 10) << std::endl;
}
```

###### 非类型模板参数推导

C++11

```cpp
template <typename T, int BufSize>
class buffer_t {
public:
    T& alloc();
    void free(T& item);
private:
    T data[BufSize];
}

buffer_t<int, 100> buf; // 100 作为模板参数
```

既然此处的模板参数 以具体的字面量进行传递，能否让编译器辅助我们进行类型推导? C++17 引入了这一特性，我们的确可以 `auto` 关键字，让编译器辅助完成具体类型的推导， 例如：

```cpp
template <auto value> void foo() {
    std::cout << value << std::endl;
    return;
}

int main() {
    foo<10>();  // value 被推导为 int 类型
}
```

### 面向对象

###### 委托构造

C++11 引入了委托构造的概念，这使得构造函数可以在同一个类中一个构造函数调用另一个构造函数，从而达到简化代码的目的：

```cpp
class Base {
public:
    int value1;
    int value2;
    Base() {
        value1 = 1;
    }
    Base(int value) : Base() { // 委托 Base() 构造函数
        value2 = value;
    }
};
```

###### 继承构造

在传统 C++ 中，构造函数如果需要继承是需要将参数一一传递的，这将导致效率低下。C++11 利用关键字 using 引入了继承构造函数的概念：

```cpp
class Base {
public:
    int value1;
    int value2;
    Base() {
        value1 = 1;
    }
    Base(int value) : Base() { // 委托 Base() 构造函数
        value2 = value;
    }
};

class Subclass : public Base {
public:
    using Base::Base; // 继承构造
};
int main() {
    Subclass s(3);
    std::cout << s.value1 << std::endl;
    std::cout << s.value2 << std::endl;
}
```

（感觉用不上啊，还是手写清晰）



###### 显式虚函数重载

在传统 C++中，经常容易发生意外重载虚函数的事情。例如：

```cpp
struct Base {
    virtual void foo();
};
struct SubClass: Base {
    void foo();
};
```

`SubClass::foo` 可能并不是程序员尝试重载虚函数，只是恰好加入了一个具有相同名字的函数。另一个可能的情形是，当基类的虚函数被删除后，子类拥有旧的函数就不再重载该虚拟函数并摇身一变成为了一个普通的类方法，这将造成灾难性的后果。



C++11 引入了 `override` 和 `final` 这两个关键字来防止上述情形的发生。



当重载虚函数时，引入 `override` 关键字将显式的告知编译器进行重载，编译器将检查基函数是否存在这样的虚函数，否则将无法通过编译：

```cpp
struct Base {
    virtual void foo(int);
};
struct SubClass: Base {
    virtual void foo(int) override; // 合法
    virtual void foo(float) override; // 非法, 父类没有此虚函数
};
```

`final` 则是为了防止类被继续继承以及终止虚函数继续重载引入的。

```cpp
struct Base {
    virtual void foo() final;
};
struct SubClass1 final: Base {
}; // 合法

struct SubClass2 : SubClass1 {
}; // 非法, SubClass1 已 final

struct SubClass3: Base {
    void foo(); // 非法, foo 已 final
};
```

(嗯，有java那味儿了)



###### 显示禁用默认函数

C++11

```cpp
class Magic {
    public:
    Magic() = default; // 显式声明使用编译器生成的构造
    Magic& operator=(const Magic&) = delete; // 显式声明拒绝编译器生成构造
    Magic(int magic_number);
}
```



###### 强类型枚举

在传统 C++中，枚举类型并非类型安全，枚举类型会被视作整数，则会让两种完全不同的枚举类型可以进行直接的比较（虽然编译器给出了检查，但并非所有），**甚至同一个命名空间中的不同枚举类型的枚举值名字不能相同**（枚举类型成员的作用域在上一级），这通常不是我们希望看到的结果。





C++11 引入了枚举类（enumeration class），并使用 `enum class` 的语法进行声明：

```cpp
enum class new_enum : unsigned int {
    value1,
    value2,
    value3 = 100,
    value4 = 100
};
```

这样定义的枚举实现了类型安全，首先他不能够被隐式的转换为整数，同时也不能够将其与整数数字进行比较， 更不可能对不同的枚举类型的枚举值进行比较。成员的作用域被限制在`new_enum::`