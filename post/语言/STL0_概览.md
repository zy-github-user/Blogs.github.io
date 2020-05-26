## STL

Standard Template Library





 STL 由六大部件组成 ：

* 容器（Container）：各种数据结构
* 算法（Algorithm）：各种常用算法
* 迭代器（Iterator）：实现和容器相关，每种容器都有自己的迭代器，容器与算法的桥梁
* 仿函数（Functor）：行为类似函数
* 适配器（Adapter）：装饰其它部件接口，实现更多功能
* 空间配置器（Allocator）：负责空间配置与管理





## 空间配置器

从运用角度而言，空间配置器不需要过多关注(除了一些特殊场景)，他总是隐藏在组件背后工作。一般说空间会想到内存，但他也可以是其他地方的空间比如磁盘。当然用的最多还是内存。以下是空间配置器标准接口：

```cpp
allocator::value_type
allocator::pointer
allocator::const_pointer
allocator::reference
allocator::const_reference
allocator::rebind
	// 一个嵌套的class template。class rebind<U>拥有唯一成员other,那是一个typedef，代表allocator<U>
allocator::allocator() // 默认构造器
allocator::allocator(const allocator &) // 拷贝构造
template <class U> allocator::allocator(const allocator<U> &) // 泛化的拷贝构造
// 给移动构造留个坑
allocator::~allocator() // 析构
pointer allocator::address(reference x) const // 返回对象地址，a.address(x)等同于&x
pointer allocator::allocate(size_type n, const void*=0) 
	// 配置足以存储n个T对象的空间，第二个参数为实现保留，或者忽略它
void allocator::deallocate(pointer p, size_type n) // 归还之前配置的空间
size_type allocator::max_size() const // 返回可配置的最大值
void allocator::construct(pointer p, const T &x) 
	// 等同于 new((void*)p) T(u); 在指定位置构造T
void allocator::destroy(pointer p) // 等同于 ((T*)p)->~T()
```



可以参考gcc里的一个实现：`include/c++/ext/new_allocator.h`



一般非特殊场景，不用自己实现空间配置器。默认就可以了。



## 迭代器与traits技法

iterator的任务是提供一种方法，使之能够遍历某个容器中所含的各个元素，而又无需暴露细节。在stl中，iterator是连接容器和算法的桥梁，算法和容器无需知道对方的细节，也能合作。iterator是一种行为类似指针的对象。最重要的工作就是重载`operator*`和`operator->`



迭代器的相应型别，称为该迭代器的 value type，template参数推导机制只能推导传入参数，如果value type用于返回值就束手无策了，声明内嵌类型是一个好主意：func函数用到了内嵌类型

```cpp
template<class T>
struct MyIter {
    typedef T value_type; // 内嵌类型
    T* ptr;
    MyIter(T *p=0) : prt(p) {}
    T& operator*() const {return *ptr;}
    // ... 
};

template<class I>
typename I::value_type func(I ite){
    return *ite
}
//...
MyIter<int> ite(new int(8));
cout << func(ite); // 8
```

但并不是所有的迭代器都是class type，比如原生指针就不是，如果不是class type，就没法定义内嵌类型，所以上面的func不能传入原生指针。



### 模板偏特化：

```cpp
template<typename T>
class C{...} // 这个泛化版本允许T是任何类型

// 如果为他提供一个特化版本

template<typename T>
class C<T*> {...} // 如果T是原生指针，就使用这个特化版本

// T是原生指针，是T是任何类型的更进一步条件，因此编译器会使用特化版本
```



### iterator_traits

有了模板偏特化，就可以解决前面func不能传入原生指针的问题。我们引入一个专门的class template来“萃取”迭代器的特性，value_type便是特性之一：

```cpp
template<class T>
struct MyIter {
    typedef T value_type; // 内嵌类型
    // ... 
}; // 还是前面的迭代器类

template <class I>
struct iterator_traits { // traits 特性， 迭代器特性萃取类
    typedef typename I::value_type value_type;
};

template <class I>
struct iterator_traits<I*> { // 原生指针特化版本
    typedef typename I value_type;
};// 注意 如果I为int 传入 const int*  valur_type是 const int * 而不是 int*

template <class I>
struct iterator_traits<const I*> { // const 原生指针特化版本
    typedef typename I value_type;
}; // 对于const指针，我们提取出来还是 non-const 类型，因为一般我们声明临时变量都需要改变它

// 最后 ， 改进 func 完美解决问题
template <class I>
typename iterator_traits<I>::value_type  // 返回类型
func(I ite){
    return *ite;
}

// 
MyIter<int> ite(new int(8));
cout << func(ite); // 8
int a = 9;
const int *p = &a;
cout << func(&a); // 9
cout << func(p); // 9
```





根据经验，常用到的迭代器相应性别有如下几种，如果你想开发的容器能与STL兼容，一定要支持如下型别:

```cpp
template <class I>
struct iterator_traits {
    typedef typename I::iterator_category	iterator_category;	// 迭代器类型
    typedef typename I::value_type			value_type;			// 所指对象类型
    typedef typename I::difference_type		difference_type;	// 表示俩迭代器距离，容量也可以用这个表示
    typedef typename I::pointer				pointer;			// 指针
    typedef typename I::reference			reference;			// 引用
};
// 还有特化版本...省略

// gcc 定义在头文件 <bits/stl_iterator_base_types.h> 
// iterator 是这样定义的
template<typename _Category, typename _Tp, typename _Distance = ptrdiff_t,
typename _Pointer = _Tp*, typename _Reference = _Tp&>
struct iterator
{
    /// One of the @link iterator_tags tag types@endlink.
    typedef _Category  iterator_category;
    /// The type "pointed to" by the iterator.
    typedef _Tp        value_type;
    /// Distance between iterators is represented as this type.
    typedef _Distance  difference_type;
    /// This type represents a pointer-to-value_type.
    typedef _Pointer   pointer;
    /// This type represents a reference-to-value_type.
    typedef _Reference reference;
};

```





迭代器类型：iterator_category

* input iterator - 迭代器所指对象，不允许外界改变，read only (operator++)
* output iterator - write only (operator++)
* forward iterator - 允许写入型算法（例如replace()）在此种迭代器形成的区间上进行读写操作 (operator++)
* bidirectional iterator - 可双向移动，某些算法需要逆向遍历原素 (operator++  operator--) 
* random access iterator - 除了前四种迭代器的功能(++ --)，还涵盖了所有指针算数能力(p+n, p-n, p[n], p1 < p2, p1 - p2)





在设计算法时，尽量针对上面某种迭代器提供一个明确的定义，并针对更强化的某种迭代器提供另一种定义。



以`advance(p,n)`为例，该函数功能为把迭代器p累进n次

```cpp
template <class InputIterator, class Distance>
void advance_II(InputIterator &i, Distance n)
{
    while (n--) ++i;
}

template <class BidirectionalIterator, class Distance>
void advance_BI(BidirectionalIterator &i, Distance n)
{ // 双向迭代器，可以前进负数次
    if (n >= 0)
    	while (n--) ++i;
    else
        while (n++) --i;
}

template <class RandomAccessIterator, class Distance>
void advance_RAI(RandomAccessIterator &i, Distance n)
{
    i += n; // 随机访问直接跳转
}

```

我们如何选择调用哪个版本的advance函数？

```c++
template <class InputIterator, class Distance>
void advance(InputIterator &i, Distance n)
{
    if (is_random_access_iterator(i)) // 此函数有待设计
        advance_RAI(i,n);
    else ....
}
```

像上面那样在执行期才能决定使用哪个版本，影响效率，上面几个版本的函数，都有两个模板参数，如果我们加上一个确定的参数，就能构成重载

```cpp
// 五个作为标记用的型别，越往下越增强
struct input_iterator_tag {};
struct output_iterator_tag {};
struct forward_iterator_tag : public input_iterator_tag {}; 
struct bidirectional_iterator_tag : public forward_iterator_tag {};
struct random_access_iterator_tag : public bidirectional_iterator_tag {};
```

然后重新实现`advance`函数

```cpp
template <class InputIterator, class Distance>
inline void __advance(InputIterator &i, Distance n, input_iterator_tag)
{
    while (n--) ++i;
}

// 这个函数可以不提供，根据forward_iterator_tag的继承关系，如果没有匹配到将自动匹input_iterator_tag
template <class ForwardIterator, class Distance> 
inline void __advance(ForwardIterator &i, Distance n, forward_iterator_tag)
{
    while (n--) ++i; // 与input_iterator_tag实现一样
}

template <class BidirectionalIterator, class Distance>
inline void __advance(BidirectionalIterator &i, Distance n, bidirectional_iterator_tag)
{
    if (n >= 0)
    	while (n--) ++i;
    else
        while (n++) --i;
}

template <class RandomAccessIterator, class Distance>
inline void __advance(RandomAccessIterator &i, Distance n, random_access_iterator_tag)
{
    i += n; // 随机访问直接跳转
}

// advace 对外表示函数，用traits机制实现
// stl 一般以算法能接受的最低级迭代器命名模板参数
template <class InputIterator, class Distance>
inline void advance(InputIterator &i, Distance n)
{
    __advance(i, n, iterator_traits<InputIterator>::iterator_category());
}
```



STL 提供了一个 iterator class 如下，如果每个新设计的迭代器都继承自它，就可以保证符合STL规范

```cpp
template <class Category,
          class T,
          class Distance = ptrdiff_t,
          class Pointer = T*,
          class Reference = T&>
struct iterator {
    typedef Category	iterator_category;
    typedef T			value_type;
    typedef Distance	difference_type;
    typedef Pointer		pointer;
    typedef Reference	reference;
};


// 如果我们要自定义迭代器
template <class Item>
struct MyIter :
	public std::iterator<std::forward_iterator_tag, Item>
{
	// ...
}
```



迭代器具体实现跟容器相关，所以每个容器的迭代器一般和容器放在一起。





## 仿函数

仿函数也叫函数对象，已经有函数指针了，为什么还需要函数对象，使用函数对象有如下优点：

* 封装可以内部修改，不影响外部接口，设计灵活
* 可以存储先前调用结果的数据成员，而不需要保存在全局变量或本地静态变量
* 在函数对象中编译器能实现内联调用，增强性能



函数对象都重载了`operator()`

```cpp
greater<int> ig;
cout << ig(4,6); // false
cout << greater<int>()(6,4); // true
```

STL仿函数和STL算法通常是这样的关系：

```cpp
algorithm(first, last, ..., functorObj)
{
    //...
	functorObj(...);
    //...
}
```

仿函数若以操作数的个数划分，可以分为**一元**和**二元**仿函数。若以功能划分，可分为**算数运算**，**关系运算**，**逻辑运算**。任何应用欲使用STL的内建仿函数，需要头文件`<functional>`





STL仿函数应该有能力被函数配接器修饰，彼此像搭积木一样的串接，为了拥有配接能力，每个仿函数必须定义自己的相应型别，就像迭代器那样。



仿函数的相应型别主要用来表现函数参数型别和返回值型别，为了方便，`<stl_function.h>`定义了两个class，分别代表一元仿函数和二元仿函数（STL不支持三元仿函数），任何仿函数，只要继承他们其中一个就可以了：

```cpp
// 一元仿函数基类
template <class Arg, class Result>
struct unary_function {
	typedef Arg	argument_type;
    typedef Result result_type;
};

// 二元仿函数基类
template <class Arg1, class Arg2, class Result>
struct binary_function {
    typedef Arg1 first_argument_type;
    typedef Arg2 second_argument_type;
    typedef Result result_type;
};

// 实现一个求负值函数
template <class T>
struct negate : public unary_function<T,T> {
	T operator()(const T &x) const { return -x; }
};

// 以下配接器用来表示某个仿函数的逻辑负值
template <class Predicate> // Predicate 谓语
class unary_negate {
public:
	bool operator(const typename Predicate::argument_type &x) const {
        // ...
    }    
    // ...
};
    

// 二元

```





### 算术类仿函数

支持加法，减法，乘法，除法，模数，否定，除了否定为一元运算，其余都为二元。

* 加法 - `plus<T>`
* 减法 - `minus<T>`
* 乘法 - `multiplies<T>`
* 除法 - `divides<T>`
* 取模 - `modulus<T>`
* 否定 - `negate<T>`

```cpp
template <class T>
struct plus : public binary_function<T,T,T> {
    T operator()(const T &x, const T &y) const { return x + y; }
};

template <class T>
struct minus : public binary_function<T,T,T> {
    T operator()(const T &x, const T &y) const { return x - y; }
};

template <class T>
struct multiplies : public binary_function<T,T,T> {
    T operator()(const T &x, const T &y) const { return x * y; }
};

template <class T>
struct divides : public binary_function<T,T,T> {
    T operator()(const T &x, const T &y) const { return x / y; }
};

template <class T>
struct modulus : public binary_function<T,T,T> {
    T operator()(const T &x, const T &y) const { return x % y; }
};

template <class T>
struct plus : public unary_function<T,T> {
    T operator()(const T &x) const { return -x; }
};
```



仿函数主要用途是为了搭配算法，如对vector中的每个元素进行乘法运算：

```cpp
accumulate(iv.begin(), iv.end(), 1, multiplies());
// res = 1 * iv[0] * iv[1] ...
```





### 关系运算类仿函数

```cpp
template <class T>
struct equal_to : public binary_function<T,T,bool> {
    bool operator()(const T &x, const T &y) const { return x == y; }
};

template <class T>
struct not_equal_to : public binary_function<T,T,bool> {
    bool operator()(const T &x, const T &y) const { return x != y; }
};

template <class T>
struct greater : public binary_function<T,T,bool> {
    bool operator()(const T &x, const T &y) const { return x > y; }
};

template <class T>
struct less : public binary_function<T,T,bool> {
    bool operator()(const T &x, const T &y) const { return x < y; }
};

template <class T>
struct greater_equal : public binary_function<T,T,bool> {
    bool operator()(const T &x, const T &y) const { return x >= y; }
};

template <class T>
struct less_equal : public binary_function<T,T,bool> {
    bool operator()(const T &x, const T &y) const { return x <= y; }
};


// sort 的例子
sort(iv.begin(), iv.end(), greater<int>());
```

### 逻辑运算类仿函数

```cpp
template <class T>
struct logical_and : public binary_function<T,T,bool> {
    bool operator()(const T &x, const T &y) const { return x && y; }
};

template <class T>
struct logical_or : public binary_function<T,T,bool> {
    bool operator()(const T &x, const T &y) const { return x || y; }
};

template <class T>
struct logical_not : public unary_function<T,bool> {
    bool operator()(const T &x) const { return !x; }
};
```

### 证同、选择、投射

```cpp
// 证同，任何数值通过此函数后，不会有任何改变
// 运用于<stl_set.h>, 用来指定RB-tree所需的KeyOfValue op
// 因为set元素的键值即实际值，所有直接用证同操作取得
template <class T>
struct identity : public unary_function<T,T> {
    const T& operator()(const T &x) const { return x; }
};

// 选择，接收一个pair，传回其第一个元素
// 用于<stl_map.h> , 用来指定RB-tree所需的KeyOfValue op
// map以pair元素的第一元素为其键值,第二元素为value
template <class Pair>
struct select1st : public unary_function<Pair, typename Pair::first_type> {
    const typename Pair::first_type& operator()(const Pair &x) const { return x.first; }
};

template <class Pair>
struct select2nd : public unary_function<Pair, typename Pair::second_type> {
    const typename typename Pair::second_type& operator()(const Pair &x) const 
    { return x.second; }
};

// 投射，传回第一参数，忽略第二参数
template <class Arg1, class Arg2>
struct project1st : public binary_function<Arg1,Arg2,Arg1> {
    Arg1 operator()(const Arg1 &x, const Arg2 &y) const { return x; }
};
// 投射，传回第二参数，忽略第一参数
template <class Arg1, class Arg2>
struct project2nd : public binary_function<Arg1,Arg2,Arg2> {
    Arg2 operator()(const Arg1 &x, const Arg2 &y) const { return y; }
};
```

## 算法

STL算法的一般形式：所有泛型算法的前两个参数都是一对迭代器，通常称为`[first，last)`，用于标识算法的操作区间。必要条件是，必须能够经由累加操作符的反复运用，从first到达last，如果条件不成立，会导致不可预测的结果。



## 容器

1. 序列式容器
   * `array(c++11) `- 定长数组
   * `vector` - 动态数组
   * `forward_list(c++11)` - 单链表
   * `list` - 双向链表
   * `deque` - 双端动态数组，相较于`vector`,支持`push_front() pop_front()`
2. 关联式容器 - 查找`O(logn)`
   * `set(multiset)` - 有序集合，红黑树
   * `map(multimap)` - 有序字典，红黑树
3. 哈希表(c++11) - `查找O(1)`
   * `unordered_set(unordered_multiset)` - 无序集合
   * `unordered_map(unordered_multimap)` - 无序字典
4. 容器适配器 - 底层容器选择比较灵活
   * `stack` - 栈，默认底层`vector`
   * `queue` - 队列 ，默认底层容器`deque`
   * `priority_queue` - 优先队列，底层容器可以是`vector`,完全二叉树建立的大顶堆或小顶堆
   * `bitset` - 表示一个`N`位的固定大小序列。可以用标准逻辑运算符操作位集，底层容器`vector<bool>`







### vector

STL对vector的实现，看他如何实现容器和迭代器。

```cpp
// alloc是一个默认的空间配置器
template <class T, class Alloc = alloc>
class vector {
public:
	// vector 嵌套型别定义
    typedef T			value_type;
    typedef value_type*	pointer;
    typedef value_type* iterator; 
    	// 可以看到迭代器就是指针，所以不用重载 * -> ++ 之类的运算符了
    	// iterator_traits提取出来的iterator_category将是random_access_iterator_tag
    typedef value_type& reference;
    typedef size_t		size_type;
    typedef ptrdiff_t	difference_type;
protected:
    // simple_alloc 是对空间配置器简单的包装，STL很多地方都用这个
    typedef simple_alloc<value_type, Alloc> data_allocator;
    iterator start; // 目前使用的空间头
    iterator finish; // 目前使用的空间尾
    iterator end_of_storage; // 目前可用空间尾部
    // ....
    iterator begin(){ return start; } // 迭代器直接返回指针
    // ...
};
```

## 适配器

Adapter概念，实际上是一种设计模式。将一个class的接口转换为另一套class接口

* 应用于容器
  * `stack` 和 `queue` 其实只是个适配器
* 应用于迭代器
  * `insert iterator`,`reverse iterator`,`iostream iterator`,改变iterator行为
  * 由`<iterator>`提供
* 应用于仿函数
  * 绑定(bind)，否定(negate)，组合(compose)或 修饰一般函数或成员函数
    * `bind(fn, args...)` - 把参数绑定到函数上，个人感觉这个绝逼是c++11的神器
    * `mem_fn(fn)` - 像调用成员函数一样调用fn
    * `not1(fn)` - `!fn(arg)`
    * `not2(fn)` - `!fn(arg1,arg2)`
    * `bind1st(fn,arg)`,`bind2nd(arg)` - 绑定第一个参数，绑定第二个参数
    * `ptr_fun(fn)` - 用来包装函数指针，这样就有借配能力了
  * c++11推出了`bind`以及`lambda`表达式，c++98中的一些用于实现函数组合的函数适配器已经deprecated
  * 由`<functional>`提供





### 函数适配器



对返回值进行逻辑否定：`not1`,`not2`

```cpp
template <class Predicate>
class unary_negate
    : public unary_function<typename Predicate::argument_type, bool>
{
protected:
    Predicate pred;
public:
    explicit unary_negate(const Predicate &x) : pred(x) {}
    bool operator()(const typename Predicate::argument_type &x) const
    {
        return !pred(x);
    }
};

// 辅助函数
template <class Predicate>
inline unary_negate<Predicate> not1(const Predicate &pred) {
    return unary_negate<Predicate>(pred);
}

// not2实现类似
```



对参数进行绑定：`bind1st`,`bind2nd`  c++11之后，bind完爆这俩

```cpp
template <class Operation>
class binder1st
    : public unary_function<typename Operation::second_argument_type,
 							typename Operation::result_type>
{
protected:
	Operation op; // 包装的函数
    typename Operation::first_argument_type value; // 存储绑定的参数
public:
    binder1st(const Operation &x,
              const typename Operation::first_argument_type &y)
        : op(x), value(y)
    {
    }
	
	typename Operation::result_type
    operator()(const typename Operation::second_argument_type &x){
        return op(value, x);
    }
}

// 辅助函数
template <class Operation, class T>
inline binder1st<Operation> bind1st(const Operation &op, const T &x){
    typedef typename Operation::first_argument_type arg1_type;
    return binder1st<Operation>(op, arg1_type(x));
}

// bind2nd 同理
```





#### std::bind

`std::bind` 是一个函数模板, 它就像一个函数适配器，可以把一个原本接收N个参数的函数，通过绑定一些参数，返回一个接收M个参数的函数，同时还可以实现参数顺序调整等操作。c++11大杀器(bind可以被Lambda完美替代)

