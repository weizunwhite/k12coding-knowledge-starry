// 静态种子题库 —— 每个知识点的离线选择题（编程）
// 作用：测验默认用题库出题（免费、即时、离线可用），AI 作为「换一批」的增强项。
// 格式与 AI 返回一致：{ q, options[4], correct(下标), explanation }，支持纯文本与 **加粗**。
window.CODE_QUIZ_SEED = {
  'variable-assign': [
    { q: 'Python 中下列哪一行是给变量 x 赋值为 5（ ）', options: ['x == 5', '5 = x', 'x = 5', 'let x = 5'], correct: 2,
      explanation: '赋值用 **=**，左边变量名、右边值。`==` 是比较；Python 不需要 `let`。' },
    { q: '执行 `x = 3; x = x + 2; print(x)` 后输出是（ ）', options: ['3', '5', 'x', '6'], correct: 1,
      explanation: '`x = x + 2` 把 x 改为 3+2=5。变量可以反复赋值，旧值被覆盖。' },
  ],
  'data-types': [
    { q: '在 Python 中 `type("3")` 返回的是哪种类型（ ）', options: ['int', 'float', 'str', 'bool'], correct: 2,
      explanation: '加了引号的 "3" 是**字符串**（str），不是数字。' },
    { q: '下列表达式结果为浮点数（float）的是（ ）', options: ['3 + 2', '3 / 2', '3 // 2', '3 % 2'], correct: 1,
      explanation: 'Python 的 `/` 总是返回 **float**（3 / 2 = 1.5）；`//` 是整除、`%` 是取余，结果都是 int。' },
  ],
  'io-basic': [
    { q: '`x = input("年龄：")` 后，x 的类型是（ ）', options: ['int', 'float', 'str', '由用户输入决定'], correct: 2,
      explanation: '`input()` **永远返回字符串**，要做数学运算必须先用 `int()` 或 `float()` 转换。' },
    { q: '`print("Hello", "World")` 输出是（ ）', options: ['HelloWorld', 'Hello, World', 'Hello World', '"Hello" "World"'], correct: 2,
      explanation: 'print 用空格分隔多个参数，输出 **"Hello World"**（中间一个空格）。' },
  ],
  'operators': [
    { q: '表达式 `7 % 2` 的结果是（ ）', options: ['3', '3.5', '1', '0'], correct: 2,
      explanation: '`%` 是取余：7 ÷ 2 商 3 余 **1**。常用来判断奇偶。' },
    { q: '下列表达式结果为 True 的是（ ）', options: ['3 > 5 and 2 < 4', '3 < 5 or 2 > 4', 'not (1 == 1)', '"a" == "A"'], correct: 1,
      explanation: '`or` 任一为真即真：3<5 是 True，所以整体 True。其他都是 False。' },
  ],
  'boolean-cond': [
    { q: '若 `x = 5`，`x > 0 and x < 10` 的值是（ ）', options: ['True', 'False', '5', '错误'], correct: 0,
      explanation: '5>0 是 True，5<10 是 True，True and True 还是 **True**。' },
    { q: '在 Python 中，下列哪个值被当作"假"（ ）', options: ['1', '"0"', '0', '"False"'], correct: 2,
      explanation: '0、空字符串 ""、空列表 [] 等被当作假；非空字符串 "0"、"False" 都是真。' },
  ],
  'if-else': [
    { q: '执行 `x = 7; if x % 2 == 0: print("偶") else: print("奇")` 输出（ ）', options: ['偶', '奇', '7', '什么都不输出'], correct: 1,
      explanation: '7 % 2 = 1，不等于 0，所以走 **else 输出 "奇"**。' },
    { q: 'Python 中"否则如果"的关键字是（ ）', options: ['else if', 'elseif', 'elif', 'elsif'], correct: 2,
      explanation: 'Python 用 **`elif`**，是 else+if 的缩写。' },
  ],
  'while-loop': [
    { q: '下列代码会执行多少次循环？\\n`i = 0`\\n`while i < 3:`\\n`    print(i); i = i + 1`', options: ['2 次', '3 次', '4 次', '死循环'], correct: 1,
      explanation: 'i 从 0、1、2 满足 i<3，各输出一次共 **3 次**；i=3 后退出。' },
    { q: '导致死循环最常见的原因是（ ）', options: ['条件永远成立', '循环体里没改变条件相关的变量', '使用了 while 而不是 for', '答案 A 和 B 都对'], correct: 3,
      explanation: '两者本质相同：**循环体没让条件变假**就死循环。' },
  ],
  'for-loop': [
    { q: '`for i in range(5): print(i, end=" ")` 输出（ ）', options: ['1 2 3 4 5', '0 1 2 3 4', '0 1 2 3 4 5', '1 2 3 4'], correct: 1,
      explanation: '`range(5)` 是 0,1,2,3,4，**不包含 5**。' },
    { q: '要打印 1 到 10（含 10），应写（ ）', options: ['range(10)', 'range(1, 10)', 'range(1, 11)', 'range(0, 10)'], correct: 2,
      explanation: '`range(start, stop)` 是左闭右开：要含 10，stop 写 **11**。' },
  ],
  'list': [
    { q: '`nums = [10, 20, 30]`，`nums[1]` 是（ ）', options: ['10', '20', '30', '错误'], correct: 1,
      explanation: '下标从 0 开始：nums[0]=10，**nums[1]=20**，nums[2]=30。' },
    { q: '`a = [1,2,3]; b = a; b.append(4); print(a)` 输出（ ）', options: ['[1,2,3]', '[1,2,3,4]', '[4,1,2,3]', '报错'], correct: 1,
      explanation: '`b = a` 让 a、b 指向**同一个列表**，改 b 等于改 a。真复制要用 `b = a.copy()` 或 `list(a)`。' },
  ],
  'dict': [
    { q: '`d = {"name": "Tom", "age": 14}`，`d["age"]` 是（ ）', options: ['"Tom"', '14', '"age"', '错误'], correct: 1,
      explanation: '字典用键查值：`d["age"]` 返回对应的值 **14**。' },
    { q: '安全获取字典中可能不存在的键，推荐用（ ）', options: ['d[key]', 'd.get(key)', 'try/except', 'd.get(key) 或 try/except 都可，前者更简洁'], correct: 3,
      explanation: '`d.get(key, default)` 不存在时返回默认值，不报错；try/except 也行但啰嗦。' },
  ],
  'function': [
    { q: 'Python 定义函数用哪个关键字（ ）', options: ['function', 'def', 'func', 'define'], correct: 1,
      explanation: 'Python 用 **`def`** 定义函数，如 `def add(a, b): return a + b`。' },
    { q: '函数没有 return 语句时，调用它返回（ ）', options: ['0', '空字符串', 'None', '报错'], correct: 2,
      explanation: '没有 return 时，函数**默认返回 None**——这常导致"为什么我的函数好像没结果"的困惑。' },
  ],
  'recursion': [
    { q: '下列递归函数缺少什么会爆栈（ ）\\n`def f(n): return f(n-1)`', options: ['返回值', '基础情形（终止条件）', '参数', '括号'], correct: 1,
      explanation: '少了 **基础情形**（让递归停下来的 if 语句），就会无限递归直到爆栈。' },
    { q: '`def f(n): return 1 if n<=1 else n * f(n-1)`，`f(4)` 等于（ ）', options: ['4', '10', '24', '120'], correct: 2,
      explanation: '$4 \\times 3 \\times 2 \\times 1 = 24$，这是阶乘的标准递归实现。' },
  ],
  'complexity': [
    { q: '下面循环的时间复杂度是（ ）\\n`for i in range(n):`\\n`    for j in range(n):`\\n`        print(i, j)`', options: ['O(1)', 'O(n)', 'O(n²)', 'O(2ⁿ)'], correct: 2,
      explanation: '两层 n 循环，共执行 $n \\times n = n^2$ 次，是 **$O(n^2)$**。' },
    { q: '对 n 个元素的有序数组用二分查找，最坏复杂度是（ ）', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct: 1,
      explanation: '每次砍半，最多 $\\log_2 n$ 步，**$O(\\log n)$**。' },
  ],
  'binary-search': [
    { q: '二分查找的**必要前提**是（ ）', options: ['数据是字符串', '数据已排序', '数据长度是 2 的幂', '数据存在目标'], correct: 1,
      explanation: '二分查找依赖"中间元素与目标比较来缩半"，必须数据**已排序**。' },
    { q: '在 [1,3,5,7,9] 中二分查找 7，第一次比较的中间元素是（ ）', options: ['1', '3', '5', '7'], correct: 2,
      explanation: '中间下标 mid = (0+4)//2 = 2，对应的元素是 **5**。' },
  ],
};
