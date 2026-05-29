// 子知识点 · 把"枢纽星"细分成可操作的"子点"
// 每个 sub-topic: { name, summary, detail }
// 命中 BANK 用专属内容，未命中走默认兜底。

const CODE_SUBNODE_BANK = {
  'variable-assign': [
    { name:'命名规范', summary:'见名知意、用小写下划线', detail:'Python 习惯用 `student_count` 这种小写+下划线（snake_case）。变量名只能用字母/数字/下划线，不能以数字开头，不能用关键字（if、for 等）。' },
    { name:'多重赋值', summary:'一次给多个变量赋值', detail:'`a, b = 1, 2` 同时给 a、b 赋值；`a, b = b, a` 可以**交换**两个变量的值，不用临时变量。' },
    { name:'is 与 ==', summary:'同一对象 vs 相等', detail:'`a == b` 比较"值是否相等"；`a is b` 比较"是不是同一个对象"。小整数和短字符串可能被复用，结果可能让人意外。' },
  ],
  'data-types': [
    { name:'数值类型', summary:'int 与 float', detail:'int 是任意精度的整数；float 是浮点数（有精度误差）。除法 / 总返回 float，整除 // 返回 int。' },
    { name:'布尔类型', summary:'True / False', detail:'布尔值常来自比较或逻辑运算，也是 if 的判断依据。`True` 在数学上等于 1，`False` 等于 0。' },
    { name:'类型转换', summary:'int() / str() / float() / bool()', detail:'显式转换：`int("123")` → 123；`str(3.14)` → "3.14"。要注意 `int("3.14")` 会报错，得先转 float 再转 int。' },
  ],
  'if-else': [
    { name:'if / elif / else', summary:'按顺序找第一个为真', detail:'多个 elif 按顺序判断，**只执行第一个为真**的分支。else 兜底，可以省略。' },
    { name:'嵌套 if', summary:'if 里再写 if', detail:'当条件依赖另一个条件时使用。注意缩进——缩进决定 else 跟谁配对，是经典 bug 来源。' },
    { name:'三元表达式', summary:'a if cond else b', detail:'写法 `value = x if x > 0 else -x`，相当于"如果 x>0 就用 x，否则用 -x"。简单条件时更紧凑。' },
  ],
  'for-loop': [
    { name:'range', summary:'生成数字序列', detail:'`range(stop)` 从 0 到 stop-1；`range(start, stop)` 从 start 到 stop-1；`range(start, stop, step)` 加步长。常用来重复 n 次。' },
    { name:'遍历集合', summary:'for x in iterable', detail:'可以直接遍历列表、字符串、字典、文件等任何可迭代对象。比 C 语言风格的 `for(i=0;i<n;i++)` 简洁得多。' },
    { name:'enumerate', summary:'同时拿下标和元素', detail:'`for i, x in enumerate(nums)` 既得到下标 i 又得到元素 x。比手动维护计数器更优雅。' },
  ],
  'list': [
    { name:'索引与切片', summary:'用下标和范围取元素', detail:'`nums[0]` 第一个；`nums[-1]` 最后一个；`nums[1:3]` 取下标 1、2 两个；`nums[::-1]` 反转整个列表。' },
    { name:'常用方法', summary:'append / pop / sort', detail:'`append(x)` 末尾加、`pop()` 末尾弹出、`sort()` 原地排序、`reverse()` 原地反转。这些方法**改变原列表**。' },
    { name:'列表推导式', summary:'一行生成新列表', detail:'`squares = [x*x for x in range(10)]` 直接得到 0..9 的平方列表。比写 for 循环 append 更 Pythonic。' },
  ],
  'function': [
    { name:'定义与调用', summary:'def 与 ()', detail:'`def f(x): return x * 2` 定义；`f(3)` 调用，返回 6。**定义不执行函数体**，调用才会执行。' },
    { name:'文档字符串', summary:'三引号写说明', detail:'函数第一行用 `"""..."""` 写说明（docstring），可以用 `help(f)` 查看。是写"自带说明书"代码的基本功。' },
    { name:'单一职责', summary:'一个函数只做一件事', detail:'好的函数像积木——只做一件事、做完就有清楚的输出。这样易于复用、易于测试、易于读懂。' },
  ],
  'recursion': [
    { name:'基础情形', summary:'让递归停下来', detail:'必须有一个 `if 条件: return 直接答案` 的出口。没有它，函数会无限调用自己直到栈空间用完。' },
    { name:'递推关系', summary:'用更小的自己求解', detail:'函数体里要把问题"变小一点"再交给自己。如阶乘：`n! = n * (n-1)!`。每次都更小，最终触达基础情形。' },
    { name:'递归 vs 迭代', summary:'两种解决问题的方式', detail:'很多递归问题可以用循环改写。递归代码更短更接近思路，但占用栈空间；循环常常更高效但写起来更绕。' },
  ],
  'binary-search': [
    { name:'循环写法', summary:'用 left/right 指针', detail:'初始化 `l=0, r=len(nums)-1`；循环 `while l <= r`：取 `mid=(l+r)//2`，比较 nums[mid] 与 target，调整 l 或 r。' },
    { name:'递归写法', summary:'每次砍半递归', detail:'`def bs(nums, t, l, r)`：基础情形 l>r 返回 -1；mid 处命中就返回，否则递归左半或右半。思路最清晰但占栈。' },
    { name:'边界陷阱', summary:'最容易写错的地方', detail:'`l < r` 还是 `l <= r`？`r = mid` 还是 `r = mid - 1`？答案取决于循环不变量，初学者建议先记住一种标准写法再变化。' },
  ],
  'complexity': [
    { name:'大 O 表示法', summary:'描述增长趋势', detail:'O(...) 忽略常数和低阶项，只看 n 大时谁主导。$3n^2 + 100n + 5 \\to O(n^2)$。' },
    { name:'常见档次', summary:'从快到慢', detail:'O(1) → O(log n) → O(n) → O(n log n) → O(n²) → O(2ⁿ)。每往后一档，数据规模增大时的差距可能是几个数量级。' },
    { name:'识别复杂度', summary:'数循环层数和操作', detail:'每加一层 n 循环是 ×n；二分/分治通常加 log n；递归看递推式（如 T(n)=2T(n/2)+n → O(n log n)）。' },
  ],
  'oop-class': [
    { name:'类与实例', summary:'模板 vs 具体', detail:'类是模板（如 Dog），实例是具体对象（如小白）。一个类可以创建任意多个实例。' },
    { name:'self', summary:'指代当前实例', detail:'方法的第一个参数固定写 self，调用时自动传入。`d.bark()` 实际是 `Dog.bark(d)`。' },
    { name:'继承', summary:'复用父类的属性和方法', detail:'`class Puppy(Dog):` 让 Puppy 自动继承 Dog 的能力，再加上自己特有的。是组织大程序的有力工具。' },
  ],
};

function defaultSubnodes(node) {
  const prereqText = (node.prereqs || [])
    .map(id => window.CODE_NODE_BY_ID[id]?.name)
    .filter(Boolean)
    .join('、') || '动手敲一段最小可运行的代码';
  return [
    { name:'核心定义', summary:'先说清它是什么', detail:`${node.name}的核心是：${node.concept}。学习时先抓定义中的关键词，再亲手写一段最小可运行的代码。` },
    { name:'典型情境', summary:'从一段代码识别它', detail:`可以从这个例子入手：${node.example} 看到类似情境时，就要意识到该用${node.name}。` },
    { name:'前后联系', summary:'它在知识网中的位置', detail:`${node.name}通常需要先掌握${prereqText}。学会后，再把它用于更复杂的问题或更大的程序。` },
  ];
}

window.CODE_SUBNODES = Object.fromEntries(
  window.CODE_NODES.map(node => [node.id, CODE_SUBNODE_BANK[node.id] || defaultSubnodes(node)])
);
