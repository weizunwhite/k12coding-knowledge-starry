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
    figure: CODE_FIGURE_BANK[node.id],
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

window.CODE_LESSON = Object.fromEntries(
  window.CODE_NODES.map(node => [node.id, makeLesson(node)])
);
