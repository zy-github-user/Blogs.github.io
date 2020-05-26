[官方文档](https://developers.google.com/protocol-buffers/docs/proto3)



## 安装
在github上下载release版本[link](https://github.com/protocolbuffers/protobuf/releases)

protoc 是命令行工具

protobuf 是具体runtime

两个都要安装

项目的readme里面有具体安装方法



```shell
# linux x86_64
# -x socks... 是我自己的代理，可以不加
curl -x socks5://192.168.0.103:1080 -LO https://github.com/protocolbuffers/protobuf/releases/download/v3.11.2/protobuf-all-3.11.2.zip
unzip protobuf-all-3.11.2.zip -d protobuf
cd protobuf/
cd protobuf-3.11.2/
./configure  # 默认安装在 /usr/local
make
sudo make install
su root
echo "/usr/local/lib" >> /etc/ld.so.conf  # 添加动态库的默认查找路径
ldconfig
```

## 在c++中使用
1. 在`.proto`文件中定义消息格式
2. 使用 protocol buffer 编译器编译生成代码
3. 在c++中使用

* 定义`.proto`文件



```protobuf
syntax = "proto2";

package tutorial; // 指定包名，防止命名冲突

message Person {
  required string name = 1;
  required int32 id = 2;        // 必须的
  optional string email = 3;    // 可选的

  enum PhoneType { // 枚举类型
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }

  message PhoneNumber {
    required string number = 1;
    optional PhoneType type = 2 [default = HOME];
  }

  repeated PhoneNumber phones = 4;
}

message AddressBook {
  repeated Person people = 1;    // 重复的 理解为数组
}
```

* 编译 protocol buffer

  

  

  目的是生成读写 AddressBook （以及 Person 和 PhoneNumber）的类
```shell
protoc -I=$SRC_DIR --cpp_out=$DST_DIR $SRC_DIR/addressbook.proto
```
得到文件 `addressbook.pb.h` `addressbook.pb.cc`



* 在代码中调用

  

  看起来是这样的：



```cpp
#include <iostream>
#include <fstream>
#include <string>
#include "addressbook.pb.h"
using namespace std;

tutorial::Person* person;
person->set_id(id);
getline(cin, *person->mutable_name());
person->set_email(email);
tutorial::Person::PhoneNumber* phone_number = person->add_phones();
phone_number->set_number(number);
phone_number->set_type(tutorial::Person::MOBILE);

tutorial::AddressBook address_book;
address_book.ParseFromIstream(&input);
address_book.SerializeToOstream(&output);

cout << "Person ID: " << person.id() << endl;
cout << "  Name: " << person.name() << endl;
for (int j = 0; j < person.phones_size(); j++) {
      const tutorial::Person::PhoneNumber& phone_number = person.phones(j);

```
具体代码见[github](https://github.com/zshorz/test_protobuf)



编译的时候请注意，系统可能存在老版本的`libprotobuf.so`文件，先用 `locate libprotobuf.so` 看一下，坑死我了

我安装的lib在`/usr/local/lib`下，而系统的在`/usr/lib`下，搜索优先级高，如果不卸载可以 `-L/usr/local/lib -lprotobuf`

不然可能报类似错误：`对‘google::protobuf::MessageLite::ParseFromIstream(std::istream*)’未定义的引用`



```shell
g++ -o test test_writing.cpp addressbook.pb.cc -lprotobuf
```

## 在go中使用
流程和c++一样



`addressbook.proto`文件：



```protobuf
syntax = "proto3";
package tutorial;

import "google/protobuf/timestamp.proto";

message Person {
  string name = 1;
  int32 id = 2;  // Unique ID number for this person.
  string email = 3;

  enum PhoneType {
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }

  message PhoneNumber {
    string number = 1;
    PhoneType type = 2;
  }

  repeated PhoneNumber phones = 4;

  google.protobuf.Timestamp last_updated = 5;
}

// Our address book file is just one of these.
message AddressBook {
  repeated Person people = 1;
}
```
编译，需要多安装一个为go生成代码的插件



```shell
export https_proxy=socks5://192.168.0.103:1080  # 这里我用了自己的代理，可以不加
go get github.com/golang/protobuf/protoc-gen-go
```
然后编译即可



```shell
protoc --go_out=. addressbook.proto
```
生成了`addressbook.pb.go`文件



go使用代码



```go
package main

import (
	"fmt"
	proto "github.com/golang/protobuf/proto"
	tutorial "github.com/zshorz/test_protobuf/test_go/tutorial"
	"io/ioutil"
	"log"
)

func main() {
	filename := "a.txt"
	fmt.Println("will write in", filename)

	// write
	person := tutorial.Person{
		Name:                 "zsh",
		Id:                   1,
		Email:                "adgadg",
		Phones:               nil,
	}
	people := make([]*tutorial.Person,1)
	people[0] = &person
	book := &tutorial.AddressBook{}
	book.People = people
	// ...

	out, err := proto.Marshal(book);

	if err != nil {
		log.Fatalln("Failed to encode address book:", err)
	}
	if err := ioutil.WriteFile(filename, out, 0644); err != nil {
		log.Fatalln("Failed to write address book:", err)
	}

	// read
	in, err := ioutil.ReadFile(filename)
	if err != nil {
		log.Fatalln("Error reading file:", err)
	}
	book2 := &tutorial.AddressBook{}
	if err := proto.Unmarshal(in, book2); err != nil {
		log.Fatalln("Failed to parse address book:", err)
	}
	fmt.Println(book2)
}

// out
// will write in a.txt
// people:<name:"zsh" id:1 email:"adgadg" > 
```


具体代码见[github](https://github.com/zshorz/test_protobuf)



## 定义消息类型



一个非常简单的例子。定义一个搜索请求消息格式，其中每个搜索请求都有一个查询字符串、您所感兴趣的结果的特定页面以及每个页面的多个结果。下面是用于定义消息类型的`.proto`文件。

```protobuf
syntax = "proto3";

message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 result_per_page = 3;
}
// 注释1
/*
注释2
*/
```

* 第一行指定使用`proto3`语法，否则默认使用`proto2`
* 消息体可以有多个字段，每个字段都是 类型 名称 编号 三元组

### 字段编号

每个字段都有一个唯一编号，这些编号用于在消息二进格式中标识字段，一旦投入使用就不应该再更改它。范围从1到15的编号需要一个字节进行编码，16到2047范围内的编号需要两个字节，应该尽可能把频繁出现得字段分配成1到15。编号最大可以取`2^29-1 (536,870,911)`。不要使用1900到19999的编号，他们是为protocol buffer实现保留的。

### 字段规则

* 单一的`singular ` - 表示目标字段可以有0个或1个，`proto3`默认规则
* `repeated` - 重复的，目标字段可以有任意个

### 保留字段

如果通过完全删除一个字段或将其注释掉来更新消息类型，那么将来的用户可以重复使用该字段的编号，如果以后加载同一个`.proto`的旧版本，这可能造成严重错误。正确方法是将删除的字段编号和名称指定为保留

```protobuf
message Foo {
  reserved 2, 15, 9 to 11;
  reserved "foo", "bar";
}
```

### `.proto`文件会生成什么

* `c++`  -  一个`.proto` 会生成一对`.h` 与 `.cc`文件
* `go` -   一个`.proto` 会生成一个 `.pb.go` 文件
* `java` -  一个`.proto` 会生成一个 `.java` 文件

## 标量值类型

| .proto Type | Notes                                                        | C++ Type | Java Type  | Go Type |
| ----------- | ------------------------------------------------------------ | -------- | ---------- | ------- |
| double      |                                                              | double   | double     | float64 |
| float       |                                                              | float    | float      | float32 |
| int32       | 使用可变长度编码。 负数编码效率低下，如果您的字段可能具有负值，请改用sint32。 | int32    | int        | int32   |
| int64       | 使用可变长度编码。 负数编码效率低下，如果您的字段可能具有负值，请改用sint64。 | int64    | long       | int64   |
| uint32      | 使用可变长度编码。                                           | uint32   | int[1]     | uint32  |
| uint64      | 使用可变长度编码。                                           | uint64   | long[1]    | uint64  |
| sint32      | 使用可变长度编码。 有符号的int值。 与常规int32相比，它们更有效地编码负数。 | int32    | int        | int32   |
| sint64      | 使用可变长度编码。 有符号的int值。 与常规int64相比，它们更有效地编码负数。 | int64    | long       | int64   |
| fixed32     | 始终为4个字节。 如果值通常大于2^28，则比uint32更有效。       | uint32   | int[1]     | uint32  |
| fixed64     | 总是8个字节。如果值经常大于2^56，则比uint64更有效。          | uint64   | long[1]    | uint64  |
| sfixed32    | 始终为4个字节。                                              | int32    | int        | int32   |
| sfixed64    | 始终为8个字节。                                              | int64    | long       | int64   |
| bool        |                                                              | bool     | boolean    | bool    |
| string      | 字符串必须始终包含UTF-8编码或7-bit ASCII文本，且长度不能超过2^32。 | string   | String     | string  |
| bytes       | 可以包含任何长度不超过2^32的字节序列                         | string   | ByteString | []byte  |

* [1] - 在Java中，无符号的32位和64位整数使用带符号的类型表示，最高位存储在符号位中。

### 默认值

解析消息时，如果编码的消息不包含特定的`singular `元素，则已解析对象中的相应字段将设置为该字段的默认值。 这些默认值是特定于类型的：

* string - 空串
* bytes - 空序列
* 数值类型 - 0
* bool - false
* enum - 默认值是第一个定义的enum值，它必须是0.
* 对于消息字段(自定义类型)，没有设置该字段。其确切值依赖于语言。
* 重复`repeated` 字段的默认值为空（通常为相应语言的空列表）。

请注意，对于标量消息字段，一旦解析了一条消息，就无法告诉该字段是被显式设置为默认值（例如，布尔值是否设置为false）。

### 枚举类型

```protobuf
message SearchRequest {
  string query = 1;
  int32 page_number = 2;
  int32 result_per_page = 3;
  enum Corpus {
    UNIVERSAL = 0; // 注意这是个常量，而非字段编号(字段编号总是从1开始)
    WEB = 1;
    IMAGES = 2;
    LOCAL = 3;
    NEWS = 4;
    PRODUCTS = 5;
    VIDEO = 6;
  }
  Corpus corpus = 4;
}
```

每个枚举定义必须包含一个映射为零的常量作为其第一个元素。 这是因为：

* 必须有一个零值，以便我们可以使用0作为数字默认值。
* 为了与proto2语义兼容，zero值必须是第一个元素，在proto2语义中，第一个enum值总是默认值





可以通过将相同的值分配给不同的枚举常量来定义别名，为此，您需要将`allow_alias`选项设置为`true`。否则，当发现别名时，协议编译器将生成错误消息。

```protobuf
message MyMessage1 {
  enum EnumAllowingAlias {
    option allow_alias = true;
    UNKNOWN = 0;
    STARTED = 1;
    RUNNING = 1;
  }
}
```

枚举数常数必须在32位整数的范围内。负值效率不高，因此不建议使用。  



可以在消息定义内定义枚举，如上例所示，也可以在外部定义-这些枚举可以在`.proto`文件中的任何消息定义中重复使用。  您还可以使用语法`MessageType.EnumType`将在一条消息中声明的枚举类型用作另一条消息中的字段类型。

### 枚举的保留值

同样再删除枚举字段时，正确方法应该时声明为保留，保证以后的字段不会使用相同的常量值和名字

```protobuf
enum Foo {
  reserved 2, 15, 9 to 11, 40 to max;
  reserved "FOO", "BAR";
}
```

注意，不能在同一个保留语句中混合字段名和数值。

## 自定义消息类型

您可以使用其他消息类型作为字段类型。

```protobuf
message SearchResponse {
  repeated Result results = 1;
}

message Result {
  string url = 1;
  string title = 2;
  repeated string snippets = 3;
}
```

### 导入定义

可以通过导入其他`.proto`文件使用其中的定义。 要导入另一个`.proto`的定义，可以在文件顶部添加一个`import`语句：

```proto
import "myproject/other_protos.proto";
```

默认情况下，只能使用直接导入的`.proto`文件中的定义。但是，有时可能需要将.proto文件移动到新的位置。

为了防止移动后，需要再每个导入的地方更新文件路径，现在，您可以在旧位置放置一个虚拟`.proto`文件，以使用`import public`概念将所有导入转发到新位置:

```protobuf
// new.proto
// 所有定义都移到这里
```

```protobuf
// old.proto
// 这是所有客户端都导入的协议。
import public "new.proto";
import "other.proto";
```

```protobuf
// client.proto
import "old.proto";
// You use definitions from old.proto and new.proto, but not other.proto
// 您使用来自old.proto和new.proto的定义，但不使用other.proto
```

协议编译器在使用`-I ` / `-proto_path`标志指定的一组目录中搜索导入的文件。如果没指定，默认在执行目录。

### 嵌套类型

```protobuf
message SearchResponse {
  message Result {
    string url = 1;
    string title = 2;
    repeated string snippets = 3;
  }
  repeated Result results = 1;
}
```

如果要在其父消息类型之外重用此消息类型，则将其称为`Parent.Type`：

```protobuf
message SomeOtherMessage {
  SearchResponse.Result result = 1;
}
```

### 更新消息类型

如果现有消息类型不再满足您的所有需求（例如，您希望消息格式具有一个额外的字段），但是您仍然希望使用以旧格式创建的代码，请不要担心！ 在不破坏任何现有代码的情况下更新消息类型非常简单。 只要记住以下规则：

* 不要更改任何现有字段的字段编号。
* 如果添加新字段，则仍可以使用新生成的代码来解析使用“旧”消息格式。 同样，由新代码创建的消息可以由旧代码解析：旧的二进制文件在解析时只会忽略新字段。
* 只要在更新的消息类型中不再使用字段号，就可以删除字段。 您可能想要重命名该字段，或者添加前缀“ OBSOLETE_”，或者保留该字段编号，以使.proto的将来用户不会意外重用该编号。
* int32，uint32，int64，uint64和bool都是兼容的–这意味着您可以将字段从这些类型中的一种更改为另一种，而不会破坏向前或向后的兼容性。
* sint32和sint64相互兼容，但与其他整数类型不兼容。
* string和bytes是兼容的,只要bytes是有效的UTF-8。
* fixed32与sfixed32兼容，fixed64与sfixed64兼容
* enum与int32、uint32、int64和uint64兼容（注意，如果值不合适，将被截断）
* Changing a single value into a member of a **new** `oneof` is safe and binary compatible.  Moving multiple fields into a new `oneof` may be safe if you are sure that no code sets more than one at a time.  Moving any fields into an existing `oneof` is not safe.



### 未知字段

## Any

Any消息类型允许您将消息作为嵌入类型使用，而不需要它们的.proto定义，使用Any类型需要导入`google/protobuf/any.proto`

```protobuf
import "google/protobuf/any.proto";

message ErrorStatus {
  string message = 1;
  repeated google.protobuf.Any details = 2;
}
```

不同的语言实现将支持运行时库帮助程序以类型安全的方式打包和解包Any

```cpp
// Storing an arbitrary message type in Any.
NetworkErrorDetails details = ...;
ErrorStatus status;
status.add_details()->PackFrom(details);

// Reading an arbitrary message from Any.
ErrorStatus status = ...;
for (const Any& detail : status.details()) {
  if (detail.Is<NetworkErrorDetails>()) {
    NetworkErrorDetails network_error;
    detail.UnpackTo(&network_error);
    ... processing network_error ...
  }
}
```



## Oneof

```protobuf
message SampleMessage {
  oneof test_oneof {
    string name = 4;
    SubMessage sub_message = 9;
  }
}
```



### oneof 特性

* 设置oneof字段将自动清除oneof的所有其他成员。 因此，如果您设置了几个字段，则只有您设置的最后一个字段仍具有值。

  ```cpp
  SampleMessage message;
  message.set_name("name");
  CHECK(message.has_name());
  message.mutable_sub_message();   // Will clear name field.
  CHECK(!message.has_name());
  ```

* 如果解析器遇到同一oneof的多个成员，则仅在解析的消息中使用最后看到的成员。

* A oneof cannot be `repeated`.

* Reflection APIs work for oneof fields.

* 如果您使用的是C ++，请确保您的代码不会导致内存崩溃。

  ```cpp
  SampleMessage message;
  SubMessage* sub_message = message.mutable_sub_message();
  message.set_name("name");      // Will delete sub_message
  sub_message->set_...            // Crashes here
      
  ```

  

## Maps

如果要在数据定义中创建关联映射，protocal buffer 提供了方便的快捷方式语法：

```protobuf
map<string, Project> projects = 3;
```

* `map` 字段不能是 `repeated`
* `map`是无序的
* 如果您为映射字段提供了一个键，但没有提供值，则该字段序列化时的行为是依赖于语言的
* ...



## Package

您可以向`.proto`文件中添加一个可选的包说明符，以防止协议消息类型之间的名称冲突。

```protobuf
package foo.bar;
message Open { ... }
```

然后，可以在定义消息类型的字段时使用包说明符：

```protobuf
message Foo {
  ...
  foo.bar.Open open = 1;
  ...
}
```

包说明符影响生成的代码的方式取决于您选择的语言：

* c++ - namespace like `foo::bar`
* go - 除非您在`.proto`文件中明确提供`option go_package`，否则该包将用作Go包名称。



## 定义服务

如果要将消息类型与RPC（远程过程调用）系统一起使用，则可以在`.proto`文件中定义RPC服务接口，并且编译器将以您选择的语言生成服务接口代码和stub

```protobuf
service SearchService {
  rpc Search (SearchRequest) returns (SearchResponse);
}
```



## Json映射

Proto3支持JSON中的规范编码，从而使在系统之间共享数据更加容易。



如果JSON编码的数据中缺少某个值，或者该值为null，则在解析为`protocol buffer`时，它将被解释为适当的默认值。  如果字段在`protocol buffer`具有默认值，则默认情况下会在JSON编码数据中将其省略以节省空间。

| proto3                 | JSON          | JSON example                              | Notes                                                        |
| ---------------------- | ------------- | ----------------------------------------- | ------------------------------------------------------------ |
| message                | object        | `{"fooBar": v, "g": null, …}`             | Generates JSON objects. Message field names are mapped to lowerCamelCase and become JSON object keys. If the `json_name` field option is specified, the specified value will be used as the key  instead. Parsers accept both the lowerCamelCase name (or the one  specified by the `json_name` option) and the original proto field name. `null` is an accepted value for all field types and treated as the default value of the corresponding field type. |
| enum                   | string        | `"FOO_BAR"`                               | The name of the enum value as specified in proto is used. Parsers accept both enum names and integer values. |
| map<K,V>               | object        | `{"k": v, …}`                             | All keys are converted to strings.                           |
| repeated V             | array         | `[v, …]`                                  | `null` is accepted as the empty list [].                     |
| bool                   | true, false   | `true, false`                             |                                                              |
| string                 | string        | `"Hello World!"`                          |                                                              |
| bytes                  | base64 string | `"YWJjMTIzIT8kKiYoKSctPUB+"`              | JSON value will be the data encoded as a string using standard base64  encoding with paddings. Either standard or URL-safe base64 encoding  with/without paddings are accepted. |
| int32, fixed32, uint32 | number        | `1, -10, 0`                               | JSON value will be a decimal number. Either numbers or strings are accepted. |
| int64, fixed64, uint64 | string        | `"1", "-10"`                              | JSON value will be a decimal string. Either numbers or strings are accepted. |
| float, double          | number        | `1.1, -10.0, 0, "NaN", "Infinity"`        | JSON value will be a number or one of the special string values "NaN",  "Infinity", and "-Infinity". Either numbers or strings are accepted.  Exponent notation is also accepted. |
| Any                    | `object`      | `{"@type": "url", "f": v, … }`            | If the Any contains a value that has a special JSON mapping, it will be converted as follows: `{"@type": xxx, "value": yyy}`. Otherwise, the value will be converted into a JSON object, and the `"@type"` field will be inserted to indicate the actual data type. |
| Timestamp              | string        | `"1972-01-01T10:00:20.021Z"`              | Uses RFC 3339, where generated output will always be Z-normalized and uses  0, 3, 6 or 9 fractional digits. Offsets other than "Z" are also  accepted. |
| Duration               | string        | `"1.000340012s", "1s"`                    | Generated output always contains 0, 3, 6, or 9 fractional digits, depending on  required precision, followed by the suffix "s". Accepted are any  fractional digits (also none) as long as they fit into nano-seconds  precision and the suffix "s" is required. |
| Struct                 | `object`      | `{ … }`                                   | Any JSON object. See `struct.proto`.                         |
| Wrapper types          | various types | `2, "2", "foo", true, "true", null, 0, …` | Wrappers use the same representation in JSON as the wrapped primitive type, except that `null` is allowed and preserved during data conversion and transfer. |
| FieldMask              | string        | `"f.fooBar,h"`                            | See `field_mask.proto`.                                      |
| ListValue              | array         | `[foo, bar, …]`                           |                                                              |
| Value                  | value         |                                           | Any JSON value                                               |
| NullValue              | null          |                                           | JSON null                                                    |
| Empty                  | object        | {}                                        | An empty JSON object                                         |

## Options

`.proto`文件中的各个声明可以使用许多选项进行注释。 选项不会改变声明的整体含义，但可能会影响在特定上下文中处理声明的方式。 可用选项的完整列表在`google/protobuf/descriptor.proto`中定义。



些选项是文件级选项，这意味着它们应在顶级范围内编写，而不是在任何消息，枚举或服务定义内。  一些选项是消息级别的选项，这意味着它们应该写在消息定义中。 一些选项是字段级选项，这意味着它们应在字段定义中编写。  选项也可以写在枚举类型，枚举值，字段，服务类型和服务方法中； 但是，目前没有针对这些选项的有用选项。



以下是一些最常用的选项:

* `java_package`(文件级) - 指定生成包的名字

  ```protobuf
  option java_package = "com.example.foo";
  ```

* ...

