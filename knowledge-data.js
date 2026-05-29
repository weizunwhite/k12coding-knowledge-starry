// 编程知识体系 — 全骨架（以 Python 风格为主，思想跨语言通用）
// 用「依赖关系」组织，不分先后年级，只看知识依赖
// theme: basics（编程基础）| control（控制结构）| structure（数据结构）| paradigm（程序设计）| algorithm（算法）
// level: 在依赖图中的深度（用于星空自动布局）

window.CODE_THEMES = {
  basics:    { name: '编程基础',   short: '基础', color: '#3b82f6', soft: '#dbeafe', deep: '#1e40af' },
  control:   { name: '控制结构',   short: '控制', color: '#f97316', soft: '#ffedd5', deep: '#c2410c' },
  structure: { name: '数据结构',   short: '结构', color: '#10b981', soft: '#d1fae5', deep: '#065f46' },
  paradigm:  { name: '程序设计',   short: '设计', color: '#0d9488', soft: '#ccfbf1', deep: '#0f766e' },
  algorithm: { name: '算法',       short: '算法', color: '#8b5cf6', soft: '#ede9fe', deep: '#5b21b6' },
};

window.CODE_NODES = [
  // ───── 编程基础 ─────
  { id:'variable-assign', name:'变量与赋值', theme:'basics', level:1, prereqs:[],
    concept:'用一个名字保存数据，以后可以反复使用和修改',
    explanation:'变量是程序里的「带名字的盒子」。赋值用等号 = ，左边写变量名、右边写值。变量可以被重新赋值，旧值就被覆盖。理解"变量是引用而不是值本身"是后续函数、对象等概念的基础。',
    example:'age = 14 把 14 装进 age；之后写 age = age + 1，age 就变成 15。变量名要见名知意：用 score 而不是 a。',
    connections:['data-types','operators','io-basic','function'] },
  { id:'data-types', name:'数据类型', theme:'basics', level:1, prereqs:[],
    concept:'整数、小数、字符串、布尔等不同种类的数据',
    explanation:'不同类型的数据可以做的事不一样：数能加减乘除，字符串能拼接、切片，布尔只有 True/False。在 Python 里类型是动态的，但仍要心里清楚每个变量是什么类型，避免"数字加字符串"这类错误。',
    example:'10 是整数 int，3.14 是浮点数 float，"hello" 是字符串 str，True 是布尔 bool。可用 type(x) 查看 x 的类型。',
    connections:['operators','string','list','error-types'] },
  { id:'io-basic', name:'输入与输出', theme:'basics', level:2, prereqs:['variable-assign'],
    concept:'用 input 从键盘读入数据、用 print 把结果显示到屏幕',
    explanation:'程序通过输入获取数据、通过输出展示结果——这是和用户对话的基本方式。注意 input 读到的永远是字符串，做数学运算前要用 int() 或 float() 转换类型。',
    example:'name = input("你叫什么？") 读一行；print("你好", name) 输出问候。age = int(input("年龄：")) 把输入转成整数。',
    connections:['operators'] },
  { id:'operators', name:'运算符与表达式', theme:'basics', level:2, prereqs:['data-types'],
    concept:'算术（+−*/）、比较（== != < >）、逻辑（and or not）等组合数据的符号',
    explanation:'运算符把数据组合成表达式，得到新值。优先级与数学类似，乘除先于加减，比较运算返回布尔值。除法有 / （得小数）和 // （取整）两种，取模 % 用来判断整除/奇偶。',
    example:'(3+4)*2 等于 14；7 // 2 等于 3，7 % 2 等于 1；5 > 3 and 2 < 4 等于 True。',
    connections:['boolean-cond','if-else'] },
  { id:'comments-style', name:'注释与代码风格', theme:'basics', level:1, prereqs:[],
    concept:'用 # 写说明、给变量起有意义的名字、保持缩进与排版整洁',
    explanation:'代码是写给人看的，机器只是顺带执行。好的注释解释"为什么这么做"，不重复"做了什么"。Python 用缩进表示代码块——同一层缩进必须一致，否则报错。',
    example:'# 计算总分\\nscore = math + english + chinese  # 注释解释做什么\\n好的命名：student_count 比 n 易懂。',
    connections:['debugging'] },
  { id:'string', name:'字符串', theme:'basics', level:3, prereqs:['data-types','operators'],
    concept:'用引号包起来的一串字符，可以拼接、切片、查找',
    explanation:'字符串是最常用的非数值数据。它「不可变」——任何修改都会创建新字符串。常用操作：长度 len()、切片 s[1:3]、拼接 +、格式化 f"{x}"、查找 in。掌握字符串就掌握了文本处理的入口。',
    example:'s = "Hello"；s[0] 是 "H"，s[1:3] 是 "el"，len(s) 是 5；"Hi " + name；f"成绩：{score}" 把变量插入文本。',
    connections:['list','linear-search'] },
  { id:'error-types', name:'常见错误类型', theme:'basics', level:2, prereqs:['variable-assign'],
    concept:'语法错误、运行时错误、逻辑错误三大类',
    explanation:'**语法错误**程序根本跑不起来（括号没配对、缩进错）；**运行时错误**跑到一半崩溃（除零、找不到的变量、类型不匹配）；**逻辑错误**最难发现——程序能跑，但结果是错的。读懂报错信息是初学者的第一关。',
    example:'SyntaxError: invalid syntax 是语法错；NameError: name "x" is not defined 是用了没定义的变量；输出与预期不符就是逻辑错。',
    connections:['exception','debugging'] },

  // ───── 控制结构 ─────
  { id:'boolean-cond', name:'布尔与条件判断', theme:'control', level:2, prereqs:['operators'],
    concept:'用 True/False 和比较、逻辑运算判断条件是否成立',
    explanation:'条件判断是程序"做选择"的前提。比较运算（< == >）返回布尔值；and、or、not 把多个条件组合成更复杂的判断。注意：== 是比较，= 是赋值，初学者最容易混。',
    example:'age = 15；is_teen = age >= 13 and age <= 19 → True；not (5 > 3) → False。',
    connections:['if-else','while-loop','for-loop'] },
  { id:'if-else', name:'if-else 分支', theme:'control', level:3, prereqs:['boolean-cond'],
    concept:'根据条件真假执行不同代码块',
    explanation:'if 后面的条件为真就执行它的代码块，否则走 else 或 elif（"否则如果"）。多个条件按顺序判断，第一个为真的就执行，其余都跳过。这是程序"做决定"的基本机制。',
    example:'if score >= 60:\\n    print("及格")\\nelif score >= 40:\\n    print("差点")\\nelse:\\n    print("加油")',
    connections:['nested-loop','recursion'] },
  { id:'while-loop', name:'while 循环', theme:'control', level:3, prereqs:['boolean-cond'],
    concept:'只要条件为真就反复执行循环体',
    explanation:'while 适合"次数不确定"的重复——只要条件成立就继续。务必让条件最终能变假，否则成为死循环。常和"累加器""计数器"一起用。',
    example:'i = 0\\nwhile i < 5:\\n    print(i)\\n    i = i + 1   # 别忘了让 i 增加，否则死循环',
    connections:['break-continue'] },
  { id:'for-loop', name:'for 循环', theme:'control', level:3, prereqs:['boolean-cond'],
    concept:'对序列中的每个元素依次执行循环体',
    explanation:'for 用于"已知次数"或"遍历集合"。range(n) 生成 0..n-1，常用来重复 n 次；也可以直接遍历列表、字符串、字典。它比 while 更不容易写错。',
    example:'for i in range(5):\\n    print(i)  # 输出 0 1 2 3 4\\nfor ch in "Hi":\\n    print(ch)  # 输出 H i',
    connections:['nested-loop','break-continue','linear-search','complexity'] },
  { id:'nested-loop', name:'嵌套循环', theme:'control', level:4, prereqs:['for-loop'],
    concept:'循环体里再写一个循环，外循环每走一步，内循环完整跑一遍',
    explanation:'嵌套循环常用来处理二维数据（矩阵、表格、打印图形）和"两两组合"问题。注意：嵌套层数越多，运行次数是乘法关系，复杂度上升很快。',
    example:'for i in range(3):\\n    for j in range(3):\\n        print(i, j)  # 9 行输出，覆盖所有 (i,j) 组合',
    connections:['bubble-sort','complexity'] },
  { id:'break-continue', name:'break 与 continue', theme:'control', level:4, prereqs:['while-loop','for-loop'],
    concept:'break 立刻跳出当前循环；continue 跳过本轮、进入下一轮',
    explanation:'用 break 提前结束循环（如找到目标后不再继续找）；用 continue 跳过这一轮（如遇到坏数据时跳过它）。它们只影响最近一层的循环，嵌套时要注意。',
    example:'for x in nums:\\n    if x < 0:\\n        continue   # 跳过负数\\n    if x == 0:\\n        break      # 遇到 0 停止',
    connections:['linear-search'] },

  // ───── 数据结构 ─────
  { id:'list', name:'列表', theme:'structure', level:3, prereqs:['data-types'],
    concept:'有序、可修改的元素序列，用方括号表示',
    explanation:'列表是最常用的数据结构。元素按位置存放，下标从 0 开始；可以增删改查、可以装任何类型。掌握 append/索引/切片/len 是入门必备。',
    example:'scores = [85, 92, 78]；scores[0] 是 85；scores.append(100) 在末尾加；scores[1] = 95 改第 2 个。',
    connections:['dict','set-type','stack-queue','linked-list','linear-search','bubble-sort'] },
  { id:'dict', name:'字典', theme:'structure', level:4, prereqs:['list'],
    concept:'键-值对的集合，用键快速查到对应的值',
    explanation:'字典就像"现实中的电话本"——给一个名字（键）找一个号码（值）。查、改、加都是 O(1) 平均时间，非常快。键必须唯一且不可变；常用于统计、分组、配置。',
    example:'student = {"name": "小明", "age": 14, "score": 92}；student["age"] 取出 14；student["score"] = 95 改分数。',
    connections:['graph-intro'] },
  { id:'set-type', name:'集合', theme:'structure', level:4, prereqs:['list'],
    concept:'无序、不重复的元素集合',
    explanation:'集合自动去重、检查"在不在"也是平均 O(1)。常用于去重、判断重复、求交集/并集/差集。代价是元素没有顺序、不能用下标。',
    example:'s = {1, 2, 2, 3, 3, 3} 实际只存 {1, 2, 3}；3 in s → True；{1,2,3} & {2,3,4} → {2, 3}。',
    connections:[] },
  { id:'stack-queue', name:'栈与队列', theme:'structure', level:5, prereqs:['list'],
    concept:'栈是"后进先出"（LIFO），队列是"先进先出"（FIFO）',
    explanation:'栈像盘子摞起来，只能从顶端取；队列像排队买票，先来先服务。它们都是抽象模型——用列表就能模拟。栈用于函数调用、撤销、括号匹配；队列用于任务调度、广度优先搜索。',
    example:'栈：stack.append(x) 入栈，stack.pop() 出栈（取最后一个）。\\n队列：queue.append(x) 入队，queue.pop(0) 出队（取最早的）。',
    connections:['recursion'] },
  { id:'linked-list', name:'链表', theme:'structure', level:5, prereqs:['list'],
    concept:'每个节点存数据 + 指向下一个节点的引用',
    explanation:'链表的元素散落在内存里，靠"指针"串起来。在中间插入/删除很快（不用搬数据），但随机访问慢（要从头找）。它是理解树、图等更复杂结构的入门。',
    example:'节点 = (数据=5, 下一个→) → (数据=3, 下一个→) → (数据=8, 下一个→None)。要找第 3 个，必须从头数过去。',
    connections:['tree-intro'] },
  { id:'tree-intro', name:'树', theme:'structure', level:6, prereqs:['linked-list'],
    concept:'像家谱一样的分层结构：每个节点有 0 个或多个子节点',
    explanation:'树有唯一的根、没有环。常见的二叉树每个节点最多 2 个子。树用于文件系统、家谱、表达式解析、二分搜索树等。遍历方式包括前序、中序、后序、层序。',
    example:'文件夹结构就是树：根目录下若干子目录，每个子目录又有自己的子目录或文件。',
    connections:['graph-intro','recursion'] },
  { id:'graph-intro', name:'图', theme:'structure', level:6, prereqs:['tree-intro','dict'],
    concept:'节点 + 边的集合，可以有环，是树的更一般形式',
    explanation:'图能描述很多东西：朋友关系、地图、互联网。常用字典存"邻接表"：键是节点，值是它的邻居列表。理解图为后面的搜索算法（DFS、BFS、最短路）打基础。',
    example:'好友关系：{"小明": ["小红", "小华"], "小红": ["小明"], ...}。从一个人出发能找到所有他认识/认识的认识。',
    connections:[] },

  // ───── 程序设计 ─────
  { id:'function', name:'函数', theme:'paradigm', level:3, prereqs:['variable-assign'],
    concept:'把一段可重复使用的代码打包起来，用名字调用',
    explanation:'函数是程序的"乐高积木"——避免重复代码、让逻辑清晰。用 def 定义、用名字 + 括号调用。一个函数最好只做一件事，做完得有清楚的"结果"或"效果"。',
    example:'def add(a, b):\\n    return a + b\\nadd(2, 3) 返回 5。重复使用同一段加法逻辑，不必每次都重写。',
    connections:['params-return','scope','recursion','module-lib','oop-class'] },
  { id:'params-return', name:'参数与返回值', theme:'paradigm', level:4, prereqs:['function'],
    concept:'参数是函数的"输入"，return 是函数的"输出"',
    explanation:'参数让函数能处理不同输入；返回值让调用者拿到结果。Python 支持默认参数、关键字参数、可变参数（*args, **kwargs），灵活但要节制使用，保持函数接口简单。',
    example:'def greet(name, greeting="你好"):  # greeting 有默认值\\n    return f"{greeting}, {name}"\\ngreet("小明") → "你好, 小明"；greet("Tom", "Hi") → "Hi, Tom"。',
    connections:['oop-class'] },
  { id:'scope', name:'作用域', theme:'paradigm', level:4, prereqs:['function'],
    concept:'变量"在哪里可见"——局部、全局、内置',
    explanation:'函数内定义的变量是"局部的"，外面看不到、函数结束就消失。函数能读外面的全局变量但不能直接修改它（需用 global 声明）。理解作用域可以避免"为什么我的变量没生效"。',
    example:'x = 10  # 全局\\ndef f():\\n    x = 20  # 这是新的局部 x，不影响外面\\n    print(x)  # 20\\nf(); print(x)  # 还是 10',
    connections:[] },
  { id:'recursion', name:'递归', theme:'paradigm', level:5, prereqs:['function','if-else'],
    concept:'函数在自己内部再调用自己',
    explanation:'递归用"自己解决一个小问题"的方式解决大问题。**必须有终止条件（基础情形）**，否则会无限递归直到爆栈。它是树、图、分治算法的核心思想。',
    example:'def factorial(n):\\n    if n <= 1: return 1   # 基础情形\\n    return n * factorial(n - 1)   # 自己调用自己\\nfactorial(5) = 5×4×3×2×1 = 120。',
    connections:['binary-search','quick-merge-sort','dp-intro'] },
  { id:'module-lib', name:'模块与库', theme:'paradigm', level:4, prereqs:['function'],
    concept:'用 import 把别人写好的代码拿来用',
    explanation:'不必所有功能从零写——Python 有强大的标准库（math, random, datetime…）和海量第三方库（numpy, pandas, requests…）。学会"用现成的轮子"是工程能力的重要一面。',
    example:'import math\\nmath.sqrt(16) → 4.0；math.pi → 3.14...\\nimport random\\nrandom.randint(1, 6) 模拟掷骰子。',
    connections:[] },
  { id:'oop-class', name:'面向对象（类与对象）', theme:'paradigm', level:5, prereqs:['function','params-return'],
    concept:'用「类」定义一种"东西"的属性和行为，用对象表示具体的实例',
    explanation:'面向对象把"数据"和"操作数据的函数"绑在一起。类是模板（如"狗"），对象是具体的（如"我家的小白"）。它带来了封装、继承、多态这些组织大程序的强力工具。',
    example:'class Dog:\\n    def __init__(self, name):\\n        self.name = name\\n    def bark(self): return f"{self.name} 汪汪！"\\nDog("小白").bark() → "小白 汪汪！"',
    connections:[] },
  { id:'exception', name:'异常处理', theme:'paradigm', level:4, prereqs:['error-types','function'],
    concept:'用 try / except 接住运行时错误，避免程序崩溃',
    explanation:'有些错误防不胜防（用户乱输入、网络中断、文件不存在）。用 try 把可能出错的代码包起来，用 except 处理对应类型的异常。原则：只处理你知道怎么应对的异常，别用 except 吞掉所有错误。',
    example:'try:\\n    n = int(input("输入一个数："))\\nexcept ValueError:\\n    print("不是合法的数字！")  # 输入字母时不会崩，给个友好提示',
    connections:['debugging'] },
  { id:'debugging', name:'调试方法', theme:'paradigm', level:3, prereqs:['error-types'],
    concept:'用 print、断点、查看变量值等手段找出 bug',
    explanation:'调试是程序员的核心能力。最基础的方式是"打印调试"：在关键处 print 变量值，看是否符合预期。更高级用 IDE 断点单步、看调用栈。每修一个 bug 都问一句"我假设了什么没成立"。',
    example:'# 算总和算错了，先打印中间变量\\nfor x in nums:\\n    total += x\\n    print("加完", x, "后 total =", total)  # 哪一步开始错就清楚了',
    connections:[] },

  // ───── 算法 ─────
  { id:'complexity', name:'时间复杂度（大 O）', theme:'algorithm', level:4, prereqs:['for-loop'],
    concept:'用 O(...) 描述算法运行时间随数据规模增长的趋势',
    explanation:'两台同样性能的电脑跑同一个程序时间差不多，但程序 A 100 万数据 1 秒、程序 B 要 1 小时——差距来自算法的"增长趋势"。O(1) 常数、O(log n) 二分、O(n) 一遍、O(n²) 双层循环、O(2ⁿ) 暴搜。',
    example:'for x in nums: print(x)  → O(n)\\nfor i in nums:\\n    for j in nums:\\n        print(i, j)  → O(n²)',
    connections:['linear-search','binary-search','bubble-sort','greedy','dp-intro'] },
  { id:'linear-search', name:'线性查找', theme:'algorithm', level:4, prereqs:['for-loop','list'],
    concept:'从头到尾依次比较，直到找到目标或走完',
    explanation:'最直白的查找方法，对未排序数据是唯一选择。最坏 O(n)。优化也很有限，主要适用于数据规模小或数据无序的情况。',
    example:'def find(nums, target):\\n    for i, x in enumerate(nums):\\n        if x == target: return i\\n    return -1',
    connections:['binary-search'] },
  { id:'binary-search', name:'二分查找', theme:'algorithm', level:5, prereqs:['list','recursion'],
    concept:'每次把搜索范围对半砍——前提是数据已排序',
    explanation:'查电话簿不会一页一页翻，会先翻到中间。二分查找正是这种思路，O(log n) 时间。前提：数据必须有序。每次比较中间元素：相等就找到、小了往右、大了往左。',
    example:'在 [1,3,5,7,9,11] 里找 7：先看中间 5，目标更大→看右半 [7,9,11]；中间 9，目标更小→看左半 [7]；找到，返回下标。',
    connections:[] },
  { id:'bubble-sort', name:'冒泡排序', theme:'algorithm', level:4, prereqs:['nested-loop','list'],
    concept:'反复比较相邻两个，逆序就交换，让大的"冒"到后面',
    explanation:'最容易理解的排序算法。每轮把最大的元素"冒"到最后；n 个元素跑 n-1 轮即可。时间 O(n²)，效率不高，但思路清晰，适合做入门。',
    example:'[5, 3, 8, 1] 第一轮：(5,3)交换→3,5,8,1；(5,8)不换；(8,1)交换→3,5,1,8。继续两轮，结果 [1,3,5,8]。',
    connections:['selection-insertion-sort','quick-merge-sort'] },
  { id:'selection-insertion-sort', name:'选择排序与插入排序', theme:'algorithm', level:5, prereqs:['bubble-sort'],
    concept:'选择：每轮选出最小放到最前；插入：把每个元素插到前面已排好的合适位置',
    explanation:'两种和冒泡同级（O(n²)）但思路不同的排序。**插入排序**对"几乎有序"的数据非常快，是很多语言内置排序的小数据优化分支。理解它们也帮你看懂高级排序的思路。',
    example:'插入排序 [5,3,8,1]：取 3 插到 5 前→[3,5,8,1]；取 8 在 5 后→[3,5,8,1]；取 1 插到最前→[1,3,5,8]。',
    connections:[] },
  { id:'quick-merge-sort', name:'快速排序与归并排序', theme:'algorithm', level:7, prereqs:['recursion','selection-insertion-sort'],
    concept:'分治思想：把大问题拆成小问题，分别解决再合起来',
    explanation:'**快排**：选一个基准，比它小的放左、大的放右，左右递归排好。**归并**：先把数组对半拆到只剩 1 个，再两两合并成有序序列。两者平均都是 O(n log n)，是工业级排序的主流方案。',
    example:'快排：[5,3,8,1,4] 以 5 为基准 → 左 [3,1,4]、右 [8]，递归排左 → [1,3,4]，最终 [1,3,4,5,8]。',
    connections:[] },
  { id:'greedy', name:'贪心算法', theme:'algorithm', level:6, prereqs:['complexity','if-else'],
    concept:'每一步都选当前看起来最好的——简单但不一定能得全局最优',
    explanation:'贪心适合具有"局部最优 → 全局最优"性质的问题，如找零钱、活动选择、最小生成树。它不像动态规划那样穷举所有路径，因此非常快，但用错时机会得到次优解。',
    example:'找零 25 元：贪心先用 20，再用 5，得 2 张；总比一张一张试快得多。但货币体系不规则时贪心可能不是最优。',
    connections:[] },
  { id:'dp-intro', name:'动态规划入门', theme:'algorithm', level:7, prereqs:['recursion','complexity'],
    concept:'把大问题分解为重复子问题，用一张表保存答案避免重复计算',
    explanation:'纯递归（如计算斐波那契）会重复算很多遍同一个子问题——动态规划把每个子问题的答案记下来下次直接查表。它是算法竞赛、最优化问题的核心方法之一，也是面试常考。',
    example:'斐波那契 fib(n) = fib(n-1) + fib(n-2)，纯递归 O(2ⁿ)；记忆化后变 O(n)：建一张表，第一次算完就存，下次直接读。',
    connections:[] },
];

// 推导：边集合（由 prereqs 自动生成）
window.CODE_EDGES = window.CODE_NODES.flatMap(n =>
  (n.prereqs || []).map(p => ({ from: p, to: n.id }))
);

// 节点查询
window.CODE_NODE_BY_ID = Object.fromEntries(window.CODE_NODES.map(n => [n.id, n]));

// 每条边的「教学理由」——为什么先学 A 才能学 B（自动生成中性表述）
function edgeReason(fromId, toId) {
  const from = window.CODE_NODE_BY_ID[fromId];
  const to = window.CODE_NODE_BY_ID[toId];
  if (!from || !to) return '';
  const cross = from.theme === to.theme ? '' : '跨主题地';
  return `${from.name}提供了${to.name}所需的概念、语法或工具基础，先理解它，才能${cross}把${to.name}里的代码、结构和算法说清楚。`;
}

window.CODE_EDGE_WHY = Object.fromEntries(
  window.CODE_EDGES.map(e => [`${e.from}→${e.to}`, edgeReason(e.from, e.to)])
);

// 难度档（入门/进阶/高阶）：复用 NODE_GRADE / GRADE_RANK 的接口，但语义改成难度
window.CODE_NODE_GRADE = {
  // 入门（level 1-2，新手能直接上手）
  'variable-assign':'入门','data-types':'入门','io-basic':'入门','operators':'入门','comments-style':'入门','error-types':'入门',
  'boolean-cond':'入门',
  // 进阶（level 3-5，有循环、函数后能驾驭）
  'string':'进阶','if-else':'进阶','while-loop':'进阶','for-loop':'进阶','nested-loop':'进阶','break-continue':'进阶',
  'list':'进阶','dict':'进阶','set-type':'进阶','stack-queue':'进阶','linked-list':'进阶',
  'function':'进阶','params-return':'进阶','scope':'进阶','recursion':'进阶','module-lib':'进阶','oop-class':'进阶','exception':'进阶','debugging':'进阶',
  'complexity':'进阶','linear-search':'进阶','binary-search':'进阶','bubble-sort':'进阶','selection-insertion-sort':'进阶',
  // 高阶（level 6-7，思想/工程性更深）
  'tree-intro':'高阶','graph-intro':'高阶','quick-merge-sort':'高阶','greedy':'高阶','dp-intro':'高阶',
};
window.CODE_GRADE_RANK = { '入门':1, '进阶':2, '高阶':3 };
