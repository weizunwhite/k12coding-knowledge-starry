// 完整学习内容（深度版）— 编程
// 结构：intro[] / formulas[{name,latex,note}] / methods[] / worked[] / pitfalls[] / exercises[]
// 课程由 makeLesson 生成器统一产出：通用框架 + 各 BANK 的学科化内容，未命中 BANK 的节点走默认兜底。

const CODE_FORMULA_BANK = {
  'complexity': [
    { name:'常见复杂度对比', latex:'O(1) < O(\\log n) < O(n) < O(n\\log n) < O(n^2) < O(2^n)', note:'数据规模 n 增大时，越右边的算法越慢。' },
    { name:'嵌套循环 → 乘法', latex:'\\text{外循环}\\ a\\ \\text{次}\\times\\text{内循环}\\ b\\ \\text{次}=O(a\\cdot b)', note:'两层 n 循环就是 $O(n^2)$。' },
  ],
  'binary-search': [
    { name:'二分搜索复杂度', latex:'O(\\log_2 n)', note:'每次砍半，最多 $\\log_2 n$ 步就能找到或确认不存在。' },
  ],
  'recursion': [
    { name:'递归的两要素', latex:'\\text{基础情形（终止）}+\\text{递推关系（变小）}', note:'缺基础情形 → 无限递归爆栈；缺递推变小 → 永远收敛不到基础情形。' },
  ],
  'bubble-sort': [
    { name:'冒泡排序', latex:'O(n^2)\\ (\\text{最坏与平均})', note:'n 个元素至多 n-1 轮，每轮至多 n-1 次比较。' },
  ],
  'quick-merge-sort': [
    { name:'快排/归并平均复杂度', latex:'O(n\\log n)', note:'分治：每层 $O(n)$ 合并，共 $\\log n$ 层。' },
  ],
};

const CODE_PITFALL_BANK = {
  'variable-assign': ['**= 是赋值，== 是比较**：写 `if x = 5` 在 Python 里直接语法错；写 `if x == 5` 才是判断。', '**变量未定义就用**：必须先赋值再读取，否则 NameError。'],
  'data-types': ['**整数 + 字符串**会报错：要么都转成字符串拼接，要么都转成数字相加。', '**浮点数有精度误差**：0.1 + 0.2 不是 0.3，比较小数最好用差的绝对值小于一个阈值。'],
  'io-basic': ['**input() 总是返回字符串**：要用 int() 或 float() 转换才能做数学运算。', '**print 默认换行**：要避免换行加 `end=""`，要分隔多个值用 `sep=", "`。'],
  'operators': ['**优先级容易错**：用括号明确写出，比死记顺序可靠。', '**短路求值**：`and` 遇假就停，`or` 遇真就停——可以用来安全地访问可能为 None 的对象。'],
  'string': ['**字符串不可变**：`s[0] = "A"` 会报错；要修改只能新建。', '**+ 拼接很慢**：在循环里反复 + 会重复复制，大字符串用 join 更高效。'],
  'boolean-cond': ['**0、空串、空列表都是假**：`if data:` 等价于 `if len(data) > 0`。', '**比较链有陷阱**：`a == b == c` 在 Python 里成立，但在 C/Java 里不是这个意思。'],
  'if-else': ['**elif 不是 else if**：Python 写 `elif`，少写一个会变成嵌套，缩进就错。', '**else 跟在最近的 if 上**：嵌套时容易绑错，写括号或重构能避免。'],
  'while-loop': ['**忘了让条件变化 → 死循环**：循环体里一定要有让条件最终变假的语句。', '**off-by-one**：`while i <= n` 还是 `< n` 决定边界，初学者最常错。'],
  'for-loop': ['**range(n) 不包含 n**：`range(5)` 给 0,1,2,3,4；要包含 n 要写 `range(n+1)`。', '**循环中修改列表**：边遍历边删元素会跳元素，应该遍历副本或反向遍历。'],
  'list': ['**下标从 0 开始**：长度 5 的列表合法下标是 0..4，写 5 就 IndexError。', '**a = b 是同一个列表**：修改 a 也会改 b；要真正复制用 `list(b)` 或 `b.copy()`。'],
  'dict': ['**键不存在**直接取会 KeyError；安全用 `d.get(k, default)`。', '**字典是无序的（Python 3.7 前）**：3.7+ 保留插入顺序，但别依赖排序顺序。'],
  'function': ['**默认参数是可变对象时**会被共享：`def f(x=[]):` 多次调用共用同一个列表，是经典坑。', '**忘记 return**：函数没有 return 时，默认返回 None，调用方很容易困惑。'],
  'recursion': ['**忘了基础情形 → 爆栈**：必有一个条件让递归停下来。', '**递归深度上限**：Python 默认大约 1000 层；树/图很深时要改用迭代或显式栈。'],
  'binary-search': ['**前提是数据有序**，无序数据二分无意义，必须先排序。', '**边界条件**：`l <= r` 还是 `l < r`、`mid + 1` 还是 `mid`，决定能不能正确收敛。'],
  'complexity': ['**O 大记号忽略常数**：$O(n)$ 和 $O(100n)$ 同档；但常数大时实测仍可能慢。', '**最坏 ≠ 平均**：快排平均 $O(n\\log n)$、最坏可达 $O(n^2)$，要看场景。'],
  'exception': ['**别用 except 吞所有错**：`except:` 会把笔误也吞掉，导致定位 bug 极困难。', '**try 范围太大**：把可能错的那一行单独包，错误归属才清楚。'],
};

// 关键节点的示意图（内联 SVG）
const CODE_FIGURE_BANK = {
  'binary-search': '<svg viewBox="0 0 300 130" xmlns="http://www.w3.org/2000/svg"><g font-family="monospace" font-size="13"><rect x="20" y="22" width="32" height="28" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6"/><text x="36" y="40" text-anchor="middle" fill="#e2e8f0">1</text><rect x="56" y="22" width="32" height="28" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6"/><text x="72" y="40" text-anchor="middle" fill="#e2e8f0">3</text><rect x="92" y="22" width="32" height="28" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6"/><text x="108" y="40" text-anchor="middle" fill="#e2e8f0">5</text><rect x="128" y="22" width="32" height="28" fill="rgba(139,92,246,0.35)" stroke="#fbbf24" stroke-width="2"/><text x="144" y="40" text-anchor="middle" fill="#fde68a">7</text><rect x="164" y="22" width="32" height="28" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6"/><text x="180" y="40" text-anchor="middle" fill="#e2e8f0">9</text><rect x="200" y="22" width="32" height="28" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6"/><text x="216" y="40" text-anchor="middle" fill="#e2e8f0">11</text><rect x="236" y="22" width="32" height="28" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6"/><text x="252" y="40" text-anchor="middle" fill="#e2e8f0">13</text><text x="144" y="14" text-anchor="middle" fill="#fbbf24" font-size="11">mid</text><text x="36" y="68" fill="#86efac" font-size="11">left</text><text x="252" y="68" fill="#fca5a5" font-size="11">right</text></g><text x="150" y="100" text-anchor="middle" fill="#94a3b8" font-size="12">每次比 mid，目标小→看左半；目标大→看右半</text><text x="150" y="118" text-anchor="middle" fill="#cbd5e1" font-size="11">最多 ⌈log₂ n⌉ 步</text></svg>',
  'list': '<svg viewBox="0 0 320 110" xmlns="http://www.w3.org/2000/svg"><g font-family="monospace" font-size="13"><rect x="20" y="22" width="40" height="32" fill="rgba(16,185,129,0.18)" stroke="#10b981"/><text x="40" y="42" text-anchor="middle" fill="#e2e8f0">85</text><text x="40" y="70" text-anchor="middle" fill="#94a3b8" font-size="11">[0]</text><rect x="64" y="22" width="40" height="32" fill="rgba(16,185,129,0.18)" stroke="#10b981"/><text x="84" y="42" text-anchor="middle" fill="#e2e8f0">92</text><text x="84" y="70" text-anchor="middle" fill="#94a3b8" font-size="11">[1]</text><rect x="108" y="22" width="40" height="32" fill="rgba(16,185,129,0.18)" stroke="#10b981"/><text x="128" y="42" text-anchor="middle" fill="#e2e8f0">78</text><text x="128" y="70" text-anchor="middle" fill="#94a3b8" font-size="11">[2]</text><rect x="152" y="22" width="40" height="32" fill="rgba(16,185,129,0.18)" stroke="#10b981"/><text x="172" y="42" text-anchor="middle" fill="#e2e8f0">63</text><text x="172" y="70" text-anchor="middle" fill="#94a3b8" font-size="11">[3]</text><rect x="196" y="22" width="40" height="32" fill="rgba(16,185,129,0.18)" stroke="#10b981"/><text x="216" y="42" text-anchor="middle" fill="#e2e8f0">100</text><text x="216" y="70" text-anchor="middle" fill="#94a3b8" font-size="11">[4]</text></g><text x="128" y="100" text-anchor="middle" fill="#94a3b8" font-size="12">下标从 0 开始；长度为 5 的合法下标是 0..4</text></svg>',
  'recursion': '<svg viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg"><g font-family="monospace" font-size="12"><rect x="30" y="20" width="220" height="26" rx="3" fill="rgba(13,148,136,0.18)" stroke="#0d9488"/><text x="140" y="38" text-anchor="middle" fill="#e2e8f0">f(4) = 4 × f(3)</text><rect x="50" y="50" width="180" height="26" rx="3" fill="rgba(13,148,136,0.18)" stroke="#0d9488"/><text x="140" y="68" text-anchor="middle" fill="#e2e8f0">f(3) = 3 × f(2)</text><rect x="70" y="80" width="140" height="26" rx="3" fill="rgba(13,148,136,0.18)" stroke="#0d9488"/><text x="140" y="98" text-anchor="middle" fill="#e2e8f0">f(2) = 2 × f(1)</text><rect x="90" y="110" width="100" height="26" rx="3" fill="rgba(251,191,36,0.25)" stroke="#fbbf24"/><text x="140" y="128" text-anchor="middle" fill="#fde68a">f(1) = 1 ← 基础情形</text></g><text x="140" y="160" text-anchor="middle" fill="#94a3b8" font-size="11">逐层展开，到基础情形开始回填 → 1×2×3×4 = 24</text></svg>',
  'complexity': '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"><line x1="30" y1="150" x2="300" y2="150" stroke="#94a3b8"/><line x1="30" y1="20" x2="30" y2="150" stroke="#94a3b8"/><text x="165" y="170" text-anchor="middle" fill="#94a3b8" font-size="11">数据规模 n</text><text x="14" y="85" fill="#94a3b8" font-size="11" transform="rotate(-90 14 85)">时间</text><path d="M30 145 L300 142" stroke="#22c55e" stroke-width="2"/><text x="240" y="135" fill="#86efac" font-size="11">O(log n)</text><path d="M30 145 L300 90" stroke="#3b82f6" stroke-width="2"/><text x="240" y="86" fill="#93c5fd" font-size="11">O(n)</text><path d="M30 145 Q150 100 300 30" stroke="#f97316" stroke-width="2" fill="none"/><text x="240" y="50" fill="#fdba74" font-size="11">O(n²)</text><path d="M30 145 Q60 145 130 25" stroke="#ef4444" stroke-width="2" fill="none"/><text x="115" y="40" fill="#fca5a5" font-size="11">O(2ⁿ)</text></svg>',
};

const CODE_WORKED_BANK = {
  'for-loop': [{ title:'例题 · 求 1~100 之和', problem:'用 for 循环求 1 加到 100 的和。', steps:['初始化累加器：total = 0', 'for i in range(1, 101):  # 1 到 100', '    total = total + i', 'print(total)  # 5050', '关键：range(1, 101) 是左闭右开，要写 101 才包含 100。'] }],
  'while-loop': [{ title:'例题 · 数位反转', problem:'用 while 把整数 1234 反转成 4321。', steps:['n = 1234；result = 0', 'while n > 0:', '    result = result * 10 + n % 10   # 取末位拼到结果末尾', '    n = n // 10                       # 去掉末位', '依次得到 4 → 43 → 432 → 4321。'] }],
  'binary-search': [{ title:'例题 · 二分查找', problem:'在已排序列表 [1,3,5,7,9,11,13] 中查找 7。', steps:['l=0, r=6；mid=3，nums[3]=7 ← 命中，返回下标 3。', '若找 8：mid=3，8>7，l=4；mid=5，8<11，r=4；mid=4，8<9，r=3；l>r，未找到。', '复杂度 $O(\\log n)$。'] }],
  'recursion': [{ title:'例题 · 阶乘', problem:'用递归实现 $n! = n \\times (n-1) \\times \\cdots \\times 1$。', steps:['def factorial(n):', '    if n <= 1:  return 1     # 基础情形', '    return n * factorial(n - 1)', 'factorial(5) = 5×factorial(4) = 5×4×factorial(3) = … = 120。'] }],
  'bubble-sort': [{ title:'例题 · 冒泡排序一遍', problem:'对 [5, 3, 8, 1] 执行一遍冒泡排序。', steps:['比较 (5,3)：5>3 交换 → [3,5,8,1]', '比较 (5,8)：5<8 不换 → [3,5,8,1]', '比较 (8,1)：8>1 交换 → [3,5,1,8]', '本轮把最大的 8 "冒"到了最后。整体需要 n-1 轮。'] }],
  'complexity': [{ title:'例题 · 判断复杂度', problem:'下面这段代码的时间复杂度是多少？\\nfor i in range(n):\\n    for j in range(n):\\n        print(i, j)', steps:['外循环跑 n 次，内循环每次也跑 n 次。', '总执行次数 = n × n = $n^2$。', '所以时间复杂度是 $O(n^2)$，属于平方级——n 翻倍，时间变为 4 倍。'] }],
};

// 「先想一想」引入题：每个知识点讲解前先抛一道"猜输出/你会怎么写"的诊断题，让学生先意识到本节在考察什么
const CODE_WARMUP_BANK = {
  'variable-assign': { q: '执行 `x = 5`，再执行 `x = x + 3`，最后 x 是多少？它还记得原来的 5 吗？', hint: '右边先算出来，再装回左边的盒子。', answer: 'x 是 8——`x = x + 3` 先算 5+3，再覆盖旧值。变量就是个**带名字、可改写的盒子**。本节学变量与赋值。' },
  'data-types': { q: '`"3" + "4"` 和 `3 + 4` 都用了加号，结果会一样吗？', hint: '一个是数字，一个是带引号的字符串。', answer: '不一样——`3 + 4` 得 7，`"3" + "4"` 得 "34"（字符串拼接）。**数据类型**不同，同一个符号行为也不同。本节学数据类型。' },
  'io-basic': { q: '用 `age = input("年龄：")` 读入 18，再写 `age + 1`，程序会算出 19 吗？', hint: 'input 读进来的到底是数字还是文字？', answer: '不会，反而会报错——`input()` 返回的永远是**字符串**，要先 `int()` 转换才能做算术。本节学输入与输出。' },
  'operators': { q: '`7 // 2` 和 `7 % 2` 分别等于多少？一个管"商"，一个管什么？', hint: '// 是整除，% 是取余。', answer: '`7 // 2` = 3（整除取商），`7 % 2` = 1（取余）。取余常用来判断奇偶、整除。本节学运算符与表达式。' },
  'comments-style': { q: '这两行哪行更好读：`a = m + e + c` 还是 `total = math + english + chinese`？为什么？', hint: '变量名能不能让人一眼看懂在算什么？', answer: '后者更好——代码是写给人看的。**见名知意的命名 + 必要的注释**让程序易读易改。Python 还用缩进表示代码块。本节学注释与代码风格。' },
  'string': { q: '有个字符串 `s = "Python"`，你能取出第一个字母、最后一个字母、和中间的 "tho" 吗？', hint: '下标从 0 开始，还能用切片 s[a:b]。', answer: '`s[0]`→"P"，`s[-1]`→"n"，`s[2:5]`→"tho"。字符串是字符序列，能索引、切片、拼接，但**不可变**。本节学字符串。' },
  'error-types': { q: '程序"能跑但结果不对"和"直接崩溃报错"，是同一种 bug 吗？哪种更难发现？', hint: '想想括号没写完、和算法想错了，哪个编译器会替你指出来。', answer: '不是——语法/运行时错误程序会报错提示，而**逻辑错误**程序照跑、结果却错，最难发现。读懂报错信息是第一关。本节学常见错误类型。' },
  'boolean-cond': { q: '`age = 15`，表达式 `age >= 13 and age <= 19` 的结果是 True 还是 False？', hint: '两个条件都满足，and 才为真。', answer: 'True——两个条件都成立。比较运算返回布尔值，and/or/not 把条件组合起来，是程序"做判断"的前提。本节学布尔与条件判断。' },
  'if-else': { q: '要根据分数输出"及格/不及格"，60 分该算哪一类？程序怎么"做选择"？', hint: '用 if 判断条件，真走一支、假走另一支。', answer: '用 **if-else 分支**：`if score >= 60: 及格 else: 不及格`。多条件用 elif 按顺序判断。本节学 if-else 分支。' },
  'while-loop': { q: '想让程序"不停地问密码，直到输对为止"，但你事先不知道要问几次，该用什么循环？', hint: '次数不确定、只要条件成立就继续。', answer: '用 **while 循环**——只要条件为真就反复执行。务必让条件最终能变假，否则死循环。本节学 while 循环。' },
  'for-loop': { q: '`for i in range(5):` 会让 i 依次取哪几个值？包含 5 吗？', hint: 'range(5) 是从 0 开始的。', answer: 'i 依次是 0、1、2、3、4，**不包含 5**。for 适合已知次数或遍历集合，比 while 更不容易写错。本节学 for 循环。' },
  'nested-loop': { q: '要打印一张九九乘法表（每行每列都要走一遍），一层循环够吗？', hint: '行里套列——循环里再放一个循环。', answer: '不够——要用**嵌套循环**：外层管行、内层管列。注意嵌套层数越多，运行次数是乘法关系，复杂度上升很快。本节学嵌套循环。' },
  'break-continue': { q: '在一堆数里查找某个目标，一旦找到就不必再往下找了，怎么让循环"提前退出"？', hint: '还有一个是"跳过这一轮"。', answer: '用 **break** 立刻跳出循环；用 **continue** 跳过本轮进入下一轮。它们只影响最近一层循环。本节学 break 与 continue。' },
  'list': { q: '`nums = [10, 20, 30]`，`nums[1]` 取到的是 10 还是 20？为什么？', hint: '下标是从 0 还是 1 开始数的？', answer: '取到 20——下标**从 0 开始**，nums[0]=10、nums[1]=20。列表是有序、可改的元素序列，能增删改查。本节学列表。' },
  'dict': { q: '要存全班同学的"姓名→分数"，用列表按下标存方便，还是用"名字直接查分数"方便？', hint: '想象查电话本：你是按页码找，还是按名字找？', answer: '按名字直接查更方便——这正是**字典**：用键查值，平均 O(1) 极快。键唯一，用于统计、分组、配置。本节学字典。' },
  'set-type': { q: '有一串可能重复的数字 `[1,2,2,3,3,3]`，想快速去掉重复、只留下不同的，用什么最省事？', hint: '有一种结构天生不允许重复。', answer: '用**集合**——它自动去重、判断"在不在"也很快，但元素无序、不能用下标。常用于去重、求交并差集。本节学集合。' },
  'stack-queue': { q: '浏览器的"后退"总是回到最近访问的一页，排队买票总是最早来的先买，这两种"顺序"一样吗？', hint: '一个后进先出，一个先进先出。', answer: '不一样——后退是**栈**（后进先出 LIFO），排队是**队列**（先进先出 FIFO）。它们用列表就能模拟。本节学栈与队列。' },
  'linked-list': { q: '在一长串数据的中间插入一个元素，用数组要把后面的全往后挪，有没有"不用搬家"的办法？', hint: '让每个元素记住"下一个在哪"。', answer: '有——**链表**：每个节点存数据 + 指向下一个的引用，中间插入/删除很快（不用搬数据），但随机访问慢。本节学链表。' },
  'tree-intro': { q: '电脑里的文件夹，一层套一层、有总根目录、不会绕成圈，这种结构像什么？', hint: '像家谱：一个祖先，往下分叉。', answer: '像**树**——有唯一的根、没有环，每个节点有若干子节点。文件系统、二分搜索树都是树。本节学树。' },
  'graph-intro': { q: '要表示"谁和谁是朋友"这种可以互相、还能成圈的关系，树够用吗？', hint: '朋友关系会有环（A↔B↔C↔A），树不允许环。', answer: '树不够——要用**图**：节点 + 边，可以有环。常用字典存"邻接表"。它能描述社交网络、地图、互联网。本节学图。' },
  'function': { q: '同一段"求两个数之和"的代码，在程序里要用十次，难道要复制十遍吗？', hint: '把它打包起来，起个名字反复调用。', answer: '不用——把它写成**函数**：`def add(a, b): return a + b`，以后用名字调用。函数让代码复用、逻辑清晰。本节学函数。' },
  'params-return': { q: '一个"打招呼"的函数，怎么让它对不同的人说不同的话、还能把结果交回给调用者？', hint: '输入靠参数，输出靠 return。', answer: '**参数**是函数的输入（决定对谁打招呼），**return** 是输出（把结果交回）。本节学参数与返回值。' },
  'scope': { q: '在函数里新建了一个变量 x，函数外面还能用到这个 x 吗？为什么常听说"变量没生效"？', hint: '函数内的变量"活"在函数里。', answer: '用不到——函数内定义的是**局部变量**，外面看不到、函数结束就消失。理解**作用域**能避免"变量没生效"的困惑。本节学作用域。' },
  'recursion': { q: '求 5 的阶乘 5×4×3×2×1，能不能让一个函数"调用它自己"来算？这样会不会停不下来？', hint: '必须有个让它停下来的"出口"。', answer: '能——这就是**递归**：用更小的自己求解。但**必须有基础情形（终止条件）**，否则无限递归爆栈。本节学递归。' },
  'module-lib': { q: '要算一个数的平方根、或生成一个随机数，难道都要自己从零写算法吗？', hint: 'Python 自带很多现成的"工具箱"。', answer: '不用——`import math` 用 `math.sqrt()`，`import random` 掷骰子。学会用现成的库（轮子）是工程能力的一面。本节学模块与库。' },
  'oop-class': { q: '游戏里有成百上千只"怪物"，每只都有血量、攻击力、会移动，怎么用一套"模板"批量造出来？', hint: '先定义"怪物"是什么，再造出一个个具体的。', answer: '用**类**定义模板（怪物的属性和行为），用对象表示具体实例。这就是**面向对象**，带来封装、继承、多态。本节学类与对象。' },
  'exception': { q: '让用户输入一个数字，可他偏偏输了字母，程序当场崩溃——能不能让它"接住"错误、友好提示？', hint: '用 try 把可能出错的代码包起来。', answer: '能——用 **try / except** 接住运行时错误：`except ValueError:` 提示重输，程序就不会崩。但别用 except 吞掉所有错误。本节学异常处理。' },
  'debugging': { q: '你写的求和程序结果总是不对，但又不报错，你会怎么找出是哪一步算错了？', hint: '最朴素的办法：把中间值打印出来看。', answer: '用**打印调试**：在关键处 `print` 变量值，对照预期，哪一步开始不对就清楚了。每修一个 bug 都问"我假设了什么没成立"。本节学调试方法。' },
  'complexity': { q: '两个程序都能给一百万个数排序，一个 1 秒、一个要一小时，电脑一样快，差距从哪来？', hint: '差在运行次数随数据增长的"趋势"。', answer: '差在**算法的时间复杂度**——用大 O 描述运行时间随规模增长的趋势：O(n) 远快于 O(n²)。本节学时间复杂度（大 O）。' },
  'linear-search': { q: '在一叠没排序的卡片里找某一张，除了从头一张张翻，还有更快的办法吗？', hint: '数据无序时，你能跳着找吗？', answer: '没有——只能**线性查找**：从头到尾依次比较，最坏 O(n)。数据无序时这是唯一选择。本节学线性查找。' },
  'binary-search': { q: '查一本厚厚的字典找某个词，你会从第一页开始翻吗？还是有更聪明的办法？', hint: '先翻到中间，看目标在前半还是后半。', answer: '当然翻中间——这就是**二分查找**：每次把范围对半砍，O(log n)。**前提是数据已排序**。本节学二分查找。' },
  'bubble-sort': { q: '要把一串数字从小到大排好，最直观的办法是什么？怎么让大的数一点点"挪"到最后？', hint: '反复比较相邻两个，逆序就交换。', answer: '最直观的是**冒泡排序**：反复比较相邻两数、逆序就交换，让大的"冒"到后面。O(n²)，效率不高但思路清晰。本节学冒泡排序。' },
  'selection-insertion-sort': { q: '整理一手扑克牌时，你是"每次抽出最小的放最前"，还是"把新牌插到合适位置"？这两种都能排好吗？', hint: '前者是选择，后者是插入。', answer: '都能——**选择排序**每轮选最小放前面，**插入排序**把每张插到已排好的合适位置（对几乎有序的数据很快）。本节学选择排序与插入排序。' },
  'quick-merge-sort': { q: '冒泡排序排一百万个数太慢了，有没有"分而治之"、快得多的排序办法？', hint: '把大问题拆成小问题，分别解决再合起来。', answer: '有——**快排**（按基准分左右）和**归并**（对半拆再合并），平均都是 O(n log n)，是工业级排序的主流。本节学快速排序与归并排序。' },
  'greedy': { q: '找零 36 元，你会先拿最大面额、再拿次大的吗？这种"每步都拿当前最好"的策略总是最优吗？', hint: '多数情况好用，但不一定全局最优。', answer: '这就是**贪心算法**：每步选当前看起来最好的，简单快速，但只在特定问题上能得全局最优。本节学贪心算法。' },
  'dp-intro': { q: '用纯递归算斐波那契 fib(n)，会发现同一个 fib 被重复算了很多遍，怎么避免做无用功？', hint: '把算过的答案记下来，下次直接查。', answer: '用**动态规划**：把子问题的答案存进表里，避免重复计算，把 O(2ⁿ) 降到 O(n)。它是最优化问题的核心方法。本节学动态规划入门。' },
};

function nodePrereqNames(node) {
  return (node.prereqs || [])
    .map(id => window.CODE_NODE_BY_ID[id]?.name)
    .filter(Boolean);
}

function defaultPitfalls(node) {
  const prereqs = nodePrereqNames(node);
  return [
    `**只背语法不写代码**：${node.name}必须亲手敲、亲手报错、亲手改才能真正掌握。`,
    `**复制示例不动脑**：抄能跑过，但不算学会；要能解释为什么这样写。`,
    prereqs.length ? `**前置没打牢**：${prereqs.join('、')}不熟时，学习${node.name}容易把概念搞混。` : `**忽略报错信息**：报错信息几乎总在告诉你哪里错了，先把它读一遍再问别人。`,
  ];
}

function defaultFormulas(node) {
  return [
    { name:'核心思想', latex:'\\text{问题}\\rightarrow\\text{拆解}\\rightarrow\\text{语法表达}\\rightarrow\\text{验证}', note:`${node.name}先想清楚步骤，再用代码表达，最后用例子验证。` },
  ];
}

function makeLesson(node) {
  const prereqs = nodePrereqNames(node);
  const formulas = CODE_FORMULA_BANK[node.id] || defaultFormulas(node);
  const firstFormula = formulas[0]?.latex || '\\text{思考}\\rightarrow\\text{代码}\\rightarrow\\text{验证}';
  const prereqLine = prereqs.length ? `它的前置知识是 **${prereqs.join('、')}**，这些内容提供了必要的语法或概念基础。` : '它是整张星图的入口知识，可以从最简单的例子和动手敲代码开始。';

  return {
    warmup: CODE_WARMUP_BANK[node.id],
    intro: [
      `**${node.name}**：${node.concept}。`,
      node.explanation,
      `${prereqLine}学习编程要做三件事：看懂示例、亲手敲、再变着花样改一遍。`,
    ],
    formulas,
    methods: [
      {
        name:'三步学习法',
        when:`遇到关于「${node.name}」的概念题、写代码题或调试题时`,
        steps:[
          '先把问题用自己的话描述清楚：输入是什么，要得到什么，过程中要做什么。',
          '再用最少的代码把它表达出来：能用基础语法就别堆复杂结构。',
          '最后用具体的例子跑一遍，对照结果验证是否符合预期；不符合就回到第一步。',
        ],
        example:{
          problem:`用「${node.name}」解决一个小问题`,
          solution:[
            `情境：${node.example}`,
            `核心思路：$${firstFormula}$。`,
            `把上面思路写成代码并跑一次，看输出是否符合预期。`,
          ],
        },
      },
    ],
    worked: CODE_WORKED_BANK[node.id] || [
      {
        title:'例题 · 从问题到代码',
        problem:`请用「${node.name}」解决：${node.example}`,
        steps:[
          `第一步，读懂问题：它要的输入、输出、约束是什么。`,
          `第二步，调出概念：${node.concept}。`,
          `第三步，写代码：核心思路 $${firstFormula}$。`,
          '第四步，验证：用 print 或单元测试看输出是否符合预期。',
        ],
      },
    ],
    pitfalls: CODE_PITFALL_BANK[node.id] || defaultPitfalls(node),
    exercises: [
      {
        problem:`判断：学完「${node.name}」只看示例就够了，不用自己动手写。`,
        hint:'想一想看视频学游泳能学会游泳吗？',
        answer:'错误。编程必须自己写、自己报错、自己改才能掌握。看示例只能让你"看起来懂"，亲手写过的代码才是真的会。',
      },
      {
        problem:`写出「${node.name}」最核心的一个语法或思想关键词。`,
        hint:'可以从概念或公式卡片里找。',
        answer:`核心可写为：${node.concept}。若有公式或结构，可参考 $${firstFormula}$。`,
      },
      {
        problem:`为什么「${node.name}」在知识星图中要接在它的前置知识之后？`,
        hint:'看它依赖哪些概念或工具。',
        answer: prereqs.length
          ? `因为它需要先用到 ${prereqs.join('、')} 中的概念或语法，前置不清楚，后面的代码就会处处卡住。`
          : '因为它是入口知识，用来建立后续学习所需的语法基础和编程意识。',
      },
    ],
  };
}

// 示意图独立注册表：与小课分离，lessons/ 分片整条覆盖 CODE_LESSON 时不会把图冲掉
// （node-detail.jsx 渲染时取 lesson.figure || CODE_FIGURES[nodeId]）
window.CODE_FIGURES = CODE_FIGURE_BANK;

window.CODE_LESSON = Object.fromEntries(
  window.CODE_NODES.map(node => [node.id, makeLesson(node)])
);
