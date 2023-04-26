---
date: 2022-07-21
category:
  - 技术
tag:
  - Rust
---

# Rust 基础学习小记

### 字符串定义方法

**str 与&str**  
**str**是 `String` 和 `&str` 的底层数据类型，同时也是动态 `DST(dynamically sized types)` unsized 类型，无法直接被使用。只能通过`&str`进行定义成固定栈上的引用类型使用

```rust
let foo = "hello";
// 其中  "hello" 字面量本身类型就是str，将"hello"赋值给foo其实是创建一个栈来将指针指向对"hello"(str)地址的引用，所以foo就是&str类型。
```

**&str 与 String**  
一般情况下，str 用于定义不可变的字符串类型，比如可读的。

```rust
let foo = "hello";
// &foo 可以变成可变字符串
```

而 String 则用于定义可变的字符串类型。

```rust
let foo = String:from("hello");
// 等于 let foo: String = String:from("hello");
// 或者
let foo = "hello".to_string();
```

**char**
表示单个字节字符，大小为 4 个字节，比如`let foo: char = "a";`

**&mut str 是否等于 &mut String ?**

```rust
fn main () {
  let mut str_a = String::from("hello"); // String
  let mut str_aa = "hello"; // &str

  let str_bb = &mut str_aa;
  let str_b = &mut str_a;
//   println!("{}, {}", str_b, str_bb);
  assert_eq!(str_b, str_bb); // 结果是相等的... 具体为什么TODO
}
```

### 引用和所有权

1.   定义可变**mut**变量

```rust
let mut foo = String::from("haha");
// 传递和声明都要标注mut
let a = helper(&mut s);
// 修改【mut可变引用变量】要在前面加上*号
*a = String::from("+++fs");

fn bar(s: &mut String) -> &mut String {
    s
}
```

2.   引用`&`与解引用`*`
在 Rust 中，**引用表示允许你使用值但不获取其所有权**。  
在常规作用域中，在**变量前**加上`&`即可变成引用赋值。比如`let a = String::from("hello"); let b = &a;`  
在函数作用域中，在**变量类型**加上`&`符即可。比如`fn foo(a: &String)`  

而`*`号表示**指向的内存位置上存储的变量的值**，即指向原始值，也叫**解引用（dereferencing）操作符**。  
示例：

```rust
// 示例1：通过*操作符来定位到内存原始值位置，并将原始值5修改为0
fn main() {
  let mut a: i32 = 5;
  let b = &mut a;
  *b = 0;
 println!("{}", a); // output: 0
}

// 示例2：当一个变量使用了&进行引用后，值类型就变成了&[type]了，而如果想要变回纯粹的type，则需要使用*号解除引用。
fn main () {
  let a: i32 = 10;
  let b = &a;
  // 此时b的类型因为引用关系，变成了&i32
  // 所以a(i32)和b(&i32)是不相等的
  assert_eq!(a, b);  // error: expected `i32`, found `&i32`
  // 但是可以通过使用*号来解除引用，使其指向原始值
  assert_eq!(a, *b); // true
}
```

3.   借用
**借用(Borrowing)指是对引用的一种规则约束流程，非具体类型。**

在函数作用域中，将引用变量作为实参传入的过程就叫借用，借用的数据不可更改，借用后会还回来，不改变所有权。(有借有还，再借不难 😂)。  
而能体现借用的场景就是，函数引用形式传参，传(借)过去，调用(使用)完毕后，反还回来。  
（\*注意：但是如果传入和设置的是&mut 可变引用，那么是允许进行修改的。）  
**代码示例：**

```rust
// 常规的借用，通过&将引用值传递，不转移所有权，在函数调用结束后会自动将引用值归还
fn main () {
	let v = vec![10,20,30]; // 声明一个数组，变量 v 具有数据的所有权
	print_vector(&v); // 把v借给print_vector函数(作用域)
	println!("{:?}", v); // print_vector函数(作用域)使用完毕，自动归还，输出: [10,20,30]
}
// print_vector借过来改了别名
fn print_vector(x: &Vec<i32>) {
    // 开始操作借过来的东西
	println!("borrow of moved values: {}", x);
}


// 非常规的借用 （不推荐）
fn main () {
	let mut v = vec![10,20,30]; // 声明一个数组，变量 v 具有数据的所有权
	v = print_vector(v); // v所有权转移给print_vector方法
	println!("{:?}", v); // [10,20,30]
}
fn print_vector(x: Vec<i32>) -> Vec<i32> {
	 x // 返回
}
```

4.   可变引用
写法：**&mut 变量名**

- 一个作用域下一个变量对象只能有一个可变引用，防止数据竞争造成的逻辑错乱问题。

```rust
fn main () {
  let mut a = String::from("hello");
  let b = &mut a;
  let c = &mut a;
  // error: cannot borrow `a` as mutable more than once at a time
  println!("b value: {}, c value: {}", b, c);
}
```

- 可变引用与不可变引用不能同时存在

```rust
fn main () {
  let mut a = String::from("hello");
  let b = &a;
  let c = &a;
  let d = &mut a;
  // 打印报错：cannot borrow `a` as mutable because it is also borrowed as immutable
  // 原因是因为 b和c已经将&a作为不可变引用了，d就无法再将其变为可变的引用了。（你跟别人共享的东西，你肯定不希望这个东西被其他人占有修改吧~🐸）
  println!("b value: {}, c value: {}, d value: {}", b, c, d);
}
```

### 类定义

`struct` 定义类的成员对象
`impl` 定义类的成员方法
<!-- ![Alt text](./1667061429088.png) -->

![图 3](/assets/posts/6cc6c7bab3889b5e285779d6f8b7ef99f75db20a3f081d84d1de06b0dfdc54ae.png)  



静态类方法，参数里不携带`&self`

```
struct Foo {
  y: u32
}

impl Foo {
  fn static_fn (x: u32) -> u32 {
    x
  }
}
```

元祖和枚举方式也能定义成结构体
接口(特征(trait))与结构体

```
// 接口
trait Bar {
  fn static_fn(&self) -> u32;
}
// 类
struct Foo {
  y: u32
}

// 为类实现接口
impl Bar for Foo {
  fn static_fn(&self) -> u32 {
	self.y
  }
}

fn main () {
  let foo = Foo { y: 30 };
  println!("foo.y is {}", foo.static_fn());
}
```

结构体同时也具有所有权转移特征

### match 匹配

`match`有点类似`switch`，都是根据当前值匹配的表达式进行相关的操作
match xx {
pattern: do something
pattern2: do something
}

### 数组、动态数组和切片

1. **数组 Array**
普通数组是**固定长度**，一组相同数据类型元素组成的集合。

```rust
let array: [i32; 3] = [1, 2, 3];
// or
let array = [1, 2, 3];
array.push(4); // error: 固定数组不允许动态添加元素
println!("{:?}", array );
// 普通数组的长度是固定的，存在栈(stack)内存中
|-----|
| 1     |
| ----- |
| 2     |
| ----- |
| 3     |
| ----- |
```

2.**动态数组 Vectors**
底层也是数组，多了引用指针来动态创建新的数组。  
本质上动态数组将数组的所有元素存储在堆内存中。当增加新元素时， 动态数组会检查数组是否还有剩余空间，如果没有，动态数组会重新生成一个更大的数组，复制所有的元素到新数组并释放之前的数组空间。  

```rust
// 传统实例化动态数组
let mut v: Vec<i32> = Vec::new();
v.push(1);
v.push(2);
v.push(3);
v.push(4);

// 使用vec!宏快捷创建动态数组，可以很方便设置初始数据
let mut v: Vec<i32> = vec![1, 2, 3];
v.push(4); // 可以任意添加元素
println!("{:?}", v);
```

3. **切片 Slices**
切片顾名思义，可以看成是数组或者动态数组切（截取）出来的一个片段。切片的元素保留与原始元素类型一致的使用方法，且不持有所有权。

```
// 数组切片
fn main () {
  let array: [i32; 3] = [1, 2, 3];
  let s = &array;
  println!("{:?}", s);
}
// 动态数组切片
fn main () {
  let mut v: Vec<i32> = vec![1, 2, 3];
  let sv = &mut v;
  sv.push(1);
  println!("{:?}", sv);
}
```

**数组和切片相关答疑：** 

切片的使用场景是什么?
1.   希望操作修改数组元素但是又不希望原始数据发生改变，可以用切片切出来单独操作。

切片与动态数组使用场景会重叠吗？
1.   需要小片段的时候，不会，切片只是对原始数据片段的截取。

数组有没有其它便捷的语法糖（或者宏？）目前只知道 iter()

遍历 iter()  
长度 len()  
克隆 clone()  
截取 splice()  

在 Rust 中想要实现跟 js 一样拿到遍历索引的话，需要 enumerate()来将元素拆分成元组，里面包含索引(索引是 usize 类型)元素

```rust
fn main () {
 let v: Vec<i32> = vec![1, 2, 3];
 for (index, &item) in v.iter().enumerate() {
    println!("index: {}, item: {}", index, item);
 }
}
```

### 内置运算方法

1.   min/max， `val.min()`
2.   round，`val.round()`
3.   floor，浮点数向下取整
4.   ceil
5.   abs
6.   trunc， 返回浮点数的整数部分，比如 1.2，拿到 1
7.   fract， 返回浮点数的小数部分，比如 1.2，拿到约等于 0.2。`(1.2f64).fract()`
8.   如果想要指定特定小数位数的数，需要结合 trunc+fract 来自己实现一个 round_fixed 方法获取，没有内置工具方法，只有输出打印时可以使用`println!("{:.2}"}`来指定输出小数位数值。

### 注意点

1.   在 Rust 中（所有静态语言），使用除法是会默认进行向下取整的。如果希望保留小数点，那么需要使用`断言`标注

```rust
fn main () {
  let a = 10;
  let b = 3;
  let result = a as f64 / b as f64
  println!("integer division: {}", result )
}
```

2.   整形和浮点型相加

```rust
fn main () {
  let a: u32 = 4;
  let b: f64 = 2.5;
  let result = a as f64 + b;
  println!("result: {}", result);
}
```

### 模块系统

在`Rust`中，程序项目分为`可运行（二进制crate）`和`库（库crate）`两种类型。

#### lib 库模块系统

**初始化创建**
初始化创建`库`项目：`cargo new --lib testlib`，创建完后会在`src`目录里发放置`lib.rs`根模块文件，**用于声明模块的导入和导出**。

```rust
[package]
name = "testlib"
version = "0.1.0"
edition = "2021"

// 这里可以设置别名
// [lib]
// name = "aliaselib"
```

**模块的组织结构**
同模块名称的文件 就自动引入  
同模快的目录 但是没有模块名称的文件， 就退回自动引入 mod.rs 文件 。  
模块作为目录的时候，模块目录下必须要有一个 mod.rs，告知 rust 这是个模块目录，mod.rs 也可以定义其它模块。  
非目录的化，那么直接定义文件名（文件名 = 模块名）就会被视为模块。  

推荐使用目录方式 避免改动频繁 也就是 `mod/mod.rs`or`mod/mod.rs mod2.rs` 方式  
组织结构图示例：  

<!-- ![Alt text](./1668415170244.png) -->

![图 2](/assets/posts/8626b920bb2558f5af44875298b98620cc2042d7ba314e8730c936dbe02591f2.png)  


**作用域**  
确保命名空间独立唯一 ，否则优先找谁呢？同名情况下~！  
默认私有只能在同一个 `mod` 下使用  

#### 运行库(main)模块系统

**初始化创建**  
初始化创建`可运行`项目：`cargo new --bin test`，创建完后会在`src`目录里发放置`main.rs`根模块文件，**用于作为运行程序的主入口**。

在`Cargo.toml`里引入自定义库模块依赖

```rust
[dependencies]
testlib = "1.0.0" # crates.io包
testlib = { git = "https://github.com/rust-lang-nursery/rand" } # 远程仓库
testlib = { path = "../testlib" } # path在本地调试允许使用绝对路径
```

在`main.rs`里使用`testlib`库模块

```rust
// 使用同个项目的模块，不需要extern和crate关键字
mod module;
// 使用extern来引入依赖包
extern crate testlib;

fn main() {
  testlib::test();
  testlib::mpdtest();
}
```

使用`use`关键字来将命名空间加入到当前 scope 作用域，方便快捷调用该作用域下的方法，避免每次额外书写作用域名。

```rust
extern crate testlib;

use testlib::test;
// 如果存在同名命名空间 可以使用as关键字来取别名
use testlib2::test as aliase_test;
// 还可以配合{}语法一次性引入多个
use testlib::{test, test2};
// 甚至还能*号引入全部
use testlib::*

fn main() {
  test();
  // aliase_test();
}
```

**其它相关关键字：**  
`super`表示父根级模块，用在同模块作用域里子模块引用外部父模块的方法时。
`self` 表示自身模块

问题：

[文件或目录同名情况下引入优先级？](https://blog.csdn.net/cacique111/article/details/126430863)

- as 别名引用

### 疑惑

1. {:?} 是什么？ 遍历打印 结构体 or 数组，需要配合#[derive(Debug)]使用
2. Typscript 里的 interface 接口相当于 Rust 里的`struct(约束属性) + trait（约束方法）`吗 ？
3. unwrap 是什么？表示处理正确的 match 的断言？
4. 类型上加上&的意义是什么？表示引用 + 具体类型 = 引用类型？或者是借用类型？

### 练习项目

1.   视频解码器？
2.   画布渲染器？
3.   音频解码器

### 相关参考

1. [Rust 中的 String 和 &str](https://blog.csdn.net/quicmous/article/details/118220399)

2. [Rust 入门系列之引用和借用](https://segmentfault.com/a/1190000041364649)

3. [Sized 和不定长类型 DST](https://course.rs/advance/into-types/sized.html#%E5%8A%A8%E6%80%81%E5%A4%A7%E5%B0%8F%E7%B1%BB%E5%9E%8B-dst)

4. [Rust 语言基础学习: Rust 中的字符串](https://blog.frognew.com/2020/07/rust-strings.html)

5. [剖析 Rust 中的 str 和 String 之间的区别与共性](https://hyiker.com/2021/03/05/%E5%89%96%E6%9E%90Rust%E4%B8%AD%E7%9A%84str%E5%92%8CString%E4%B9%8B%E9%97%B4%E7%9A%84%E5%8C%BA%E5%88%AB%E4%B8%8E%E5%85%B1%E6%80%A7/)

6. [Dividing two integers doesn't print as a decimal number in Rust](https://stackoverflow.com/questions/35097710/dividing-two-integers-doesnt-print-as-a-decimal-number-in-rust)

7. 数组、动态数组、切片：
   - [数组、动态数组、切片在 Rust 中的应用](http://aqrun.oicnp.com/2020/10/25/array-vector-slice-in-rust.html)
   - [What are the differences between &[T] and Vec\<T\>?](https://stackoverflow.com/questions/57848114/what-are-the-differences-between-and-vec)

8. Rust 基础教程：
   1. [简单教程](https://www.twle.cn/c/yufei/rust/rust-basic-index.html)
   2. [通过例子学习 Rust（推荐）](https://rustwiki.org/zh-CN/rust-by-example/)
   3. [Rust 语言圣经（不太推荐，讲复杂了，习题也是超纲）](https://course.rs/)

9. [Rust 模块系统](https://magiclen.org/rust-module/)

