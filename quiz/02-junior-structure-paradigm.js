// 初中 · 数据结构与程序设计 —— 离线选择题分片
// 覆盖：set-type / stack-queue / linked-list / tree-intro / graph-intro /
//       params-return / scope / module-lib / oop-class / exception / debugging 共 11 个节点，每节点 2 题。
// 题型轮换：概念辨析 / 读程序写结果 / 找 bug；干扰项取材各节点小课的易错点。
// 加载顺序：必须在 knowledge-quiz-seed.js 之后加载（追加合并，不覆盖已有题目）。

function __appendQuiz(bank) {
  const Q = window.CODE_QUIZ_SEED;
  for (const [id, qs] of Object.entries(bank)) {
    (Q[id] = Q[id] || []).push(...qs);
  }
}
__appendQuiz({

  'set-type': [
    { q: '执行 `print(len({1, 2, 2, 3, 3, 3}))` 的输出是（ ）',
      options: ['6', '3', '1', '报错'], correct: 1,
      explanation: '集合**自动去重**：{1,2,2,3,3,3} 实际只存 {1,2,3}，长度为 **3**。去重正是集合最常用的功能。' },
    { q: '`s = {10, 20, 30}; print(s[0])` 会报错，原因是（ ）',
      options: ['集合是无序的，不支持下标访问', '集合的下标从 1 开始', '集合只能存字符串', '应该先排序再取下标'], correct: 0,
      explanation: '集合**无序、无下标**，不能像列表那样 `s[0]` 取元素。要判断"在不在"用 `10 in s`，要逐个访问用 for 遍历。' },
  ],

  'stack-queue': [
    { q: '依次把 1、2、3 压入栈中，再依次弹出，弹出的顺序是（ ）',
      options: ['1, 2, 3', '3, 2, 1', '2, 1, 3', '1, 3, 2'], correct: 1,
      explanation: '栈是**后进先出**（LIFO）：最后压入的 3 最先弹出，顺序为 **3, 2, 1**。队列才是先进先出。' },
    { q: '下列场景与数据结构的配对，正确的是（ ）',
      options: ['浏览器"后退"用队列，打印任务排队用栈', '浏览器"后退"用栈，打印任务排队用队列', '两个场景都只能用栈', '两个场景都只能用队列'], correct: 1,
      explanation: '"后退"回到**最近**访问的页面 → 后进先出的**栈**；打印任务**先来先打** → 先进先出的**队列**。选结构看"取出顺序"的需求。' },
  ],

  'linked-list': [
    { q: '关于链表和数组（列表）的对比，正确的是（ ）',
      options: ['链表可以像数组一样用下标 O(1) 随机访问', '在已知节点后插入元素，链表只需改指针 O(1)，数组要搬移元素', '链表比数组更省内存', '链表必须连续存储'], correct: 1,
      explanation: '链表的优势是**已知位置的插入/删除只改指针** O(1)；代价是随机访问要从头一路走 O(n)。它靠指针链接、不要求连续内存，且每个节点要额外存指针（更费内存）。' },
    { q: '单链表中要删除节点 p 的下一个节点，正确的操作是（ ）',
      options: ['p = p.next', 'p.next = p.next.next', 'p.next = p', 'del p.next 就够了'], correct: 1,
      explanation: '让 p 的指针**绕过**要删的节点直接指向下下个：`p.next = p.next.next`。`p = p.next` 只是移动了自己的位置，链没有断开重接。' },
  ],

  'tree-intro': [
    { q: '一棵树有 n 个节点，那么它的边数是（ ）',
      options: ['n', 'n - 1', 'n + 1', '不确定'], correct: 1,
      explanation: '树中**除根外每个节点恰有一个父亲**，每个"父子关系"就是一条边，所以边数恒为 **n − 1**。多一条边必成环、少一条必不连通。' },
    { q: '二叉树：根 A，A 的左孩子 B、右孩子 C，B 的左孩子 D。前序遍历（根→左→右）的顺序是（ ）',
      options: ['A B D C', 'D B A C', 'A B C D', 'D B C A'], correct: 0,
      explanation: '前序：先访问根 A，再进左子树（B，然后 B 的左孩子 D），最后右子树 C，得 **A B D C**。"D B A C" 是中序（左→根→右）。' },
  ],

  'graph-intro': [
    { q: '关于树和图的关系，下列说法正确的是（ ）',
      options: ['图是特殊的树', '树是无环连通的特殊图', '图不能有环，树可以', '树和图没有任何关系'], correct: 1,
      explanation: '**树是"无环且连通"的图**——图更一般：可以有环、可以不连通、边还可以带方向和权重。' },
    { q: '一个无向图有 n 个顶点（无重边、无自环），最多能有多少条边（ ）',
      options: ['n', 'n - 1', 'n(n-1)/2', 'n²'], correct: 2,
      explanation: '任意两个顶点之间至多一条边，从 n 个顶点中任选 2 个，共 **n(n−1)/2** 种：这就是"完全图"的边数。n−1 是树（最少连通）的边数。' },
  ],

  'params-return': [
    { q: '执行下面代码后输出是（ ）\n`def f(a, b=2):`\n`    return a * b`\n`print(f(3))`',
      options: ['3', '5', '6', '报错：少一个参数'], correct: 2,
      explanation: 'b 有**默认值 2**：调用 f(3) 时 a=3、b 用默认值，返回 3 × 2 = **6**。默认参数让调用者可以省略常用取值。' },
    { q: '函数体里没有写 return，调用后 `print(f())` 会输出（ ）',
      options: ['0', '空字符串', 'None', '报错'], correct: 2,
      explanation: '没有 return（或 return 后面不写值）的函数默认返回 **None**。想输出结果，要么函数里 return 出来，要么直接在函数里 print——两者别混淆。' },
  ],

  'scope': [
    { q: '执行下面代码后输出是（ ）\n`x = 10`\n`def f():`\n`    x = 5`\n`f()`\n`print(x)`',
      options: ['5', '10', 'None', '报错'], correct: 1,
      explanation: '函数内 `x = 5` 创建的是**局部变量**，只在函数里有效、函数结束就消失，外面的全局 x 纹丝不动，输出 **10**。' },
    { q: '想在函数内部修改全局变量 count，正确的做法是（ ）',
      options: ['直接 count += 1 就行', '在函数里先声明 global count 再修改', '把 count 改名成大写', '函数里永远不可能改到全局变量'], correct: 1,
      explanation: '函数内直接对全局变量赋值会被当作**新建局部变量**（`count += 1` 还会报 UnboundLocalError）。要改全局须先声明 **`global count`**——但更推荐用参数传入、返回值传出。' },
  ],

  'module-lib': [
    { q: '写了 `import math` 之后，求 16 的平方根的正确写法是（ ）',
      options: ['sqrt(16)', 'math.sqrt(16)', 'import sqrt(16)', 'math->sqrt(16)'], correct: 1,
      explanation: '`import math` 导入的是**整个模块**，用其中的函数要带模块名前缀：`math.sqrt(16)`。直接写 `sqrt(16)` 需要 `from math import sqrt` 那种导入方式。' },
    { q: '关于两种导入方式的区别，正确的是（ ）',
      options: ['from random import randint 之后可以直接写 randint(1, 6)', 'import random 之后可以直接写 randint(1, 6)', '两种写法完全等价，随便用', 'from ... import 会把整个模块复制一份，更慢'], correct: 0,
      explanation: '`from 模块 import 名字` 把名字**直接引入当前命名空间**，可裸用 `randint(1,6)`；`import random` 则必须写 `random.randint(1,6)`。混用两种记法是初学常见报错来源。' },
  ],

  'oop-class': [
    { q: '类定义中 `__init__` 方法的作用是（ ）',
      options: ['销毁对象、释放内存', '创建对象时自动执行，给对象初始化属性', '把类转换成字符串', '比较两个对象是否相等'], correct: 1,
      explanation: '`__init__` 是**初始化方法**：`Dog("旺财")` 创建对象时自动被调用，把属性装到 self 上（如 `self.name = name`）。销毁对应的是 `__del__`。' },
    { q: '执行下面代码后输出是（ ）\n`class Dog:`\n`    def __init__(self, name):`\n`        self.name = name`\n`    def bark(self):`\n`        return self.name + "汪"`\n`d = Dog("旺财")`\n`print(d.bark())`',
      options: ['汪', '旺财汪', 'name汪', '报错：bark 少传了 self'], correct: 1,
      explanation: '创建时 `self.name = "旺财"`，调用 `d.bark()` 时 Python **自动把 d 作为 self 传入**，返回 "旺财" + "汪" = **旺财汪**。self 不需要手动传。' },
  ],

  'exception': [
    { q: '执行下面代码后输出是（ ）\n`try:`\n`    print(10 / 0)`\n`except ZeroDivisionError:`\n`    print("错误")`\n`finally:`\n`    print("结束")`',
      options: ['只输出"错误"', '先输出"错误"再输出"结束"', '只输出"结束"', '程序直接崩溃'], correct: 1,
      explanation: '10/0 抛出 ZeroDivisionError 被 except 接住打印"错误"；**finally 无论是否出错都会执行**，再打印"结束"。' },
    { q: '写成 `except:`（不写任何错误类型）承接所有异常，主要问题是（ ）',
      options: ['语法不合法，跑不起来', '会把变量名拼错等一切错误也悄悄吞掉，bug 极难定位', '只能接住除零错误', '会让程序变慢十倍'], correct: 1,
      explanation: '裸 `except:` **什么错都吞**——连 NameError 这类笔误也被"处理"掉，程序默默出错却不报。应捕获**具体的**异常类型，try 的范围也要尽量小。' },
  ],

  'debugging': [
    { q: '程序不报错但输出不对（逻辑错误），最有效的第一步排查方法是（ ）',
      options: ['把代码全部删掉重写', '在关键步骤 print 中间变量，对照自己预期的值找"从哪一步开始不对"', '多运行几次看看会不会自己变好', '把所有代码包进 try-except'], correct: 1,
      explanation: '定位逻辑错误的核心是**观察中间状态**：打印关键变量、和手算预期对比，第一处不一致的地方就是 bug 所在。逻辑错误不抛异常，try-except 帮不上忙。' },
    { q: '一段 100 行的程序中间某处算错了，用"二分定位法"调试的做法是（ ）',
      options: ['从第 1 行开始逐行读完全部代码', '在程序中间打印中间结果：对了说明 bug 在后半，错了在前半，继续对半缩小范围', '每次随机挑一行检查', '把程序拆成 100 个文件'], correct: 1,
      explanation: '**二分定位**：在中点检查中间结果，正确 → bug 在后半；错误 → 在前半。每次范围减半，几步就能锁定出错区间，比逐行读快得多。' },
  ],

});
