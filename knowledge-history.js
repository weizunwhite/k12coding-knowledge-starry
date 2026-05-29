// 每个知识点的「源流」—— 知其所以然
// origin: 它从哪里来 / 为解决什么问题诞生
// story: 关键人物、有趣的历史、思想突破
// 命中 BANK 用专属内容，未命中走默认兜底。

const CODE_HISTORY_NOTES = {
  'variable-assign': ['"变量"的概念可以追溯到 19 世纪 Ada Lovelace 为分析机写的算法草稿——她已经在用符号代表"会变的数"。', '1957 年 Fortran 第一次让程序员**直接给变量起名字**（而不是用机器地址），编程从此从"机器的语言"走向"人的语言"。'],
  'data-types': ['早期机器只认 0/1，所有"数据类型"都是程序员自己约定的。', 'ALGOL（1958）和后来的 Pascal 推动了**严格的类型系统**——让编译器替程序员检查"把字符串当数加"这类错误。'],
  'if-else': ['条件分支的思想可以追溯到 Lovelace 的笔记：根据中间结果决定后续步骤。', '机器层面的 if 是"条件跳转"指令；高级语言把它包装成 if/else 这样接近自然语言的写法，门槛大降。'],
  'while-loop': ['"循环"概念早于电子计算机——巴贝奇分析机就支持把一组指令反复执行。', 'while 把"判断 + 跳回去"封装成一个结构，让人**不再需要手写跳转**，这是结构化编程运动的胜利。'],
  'for-loop': ['for 最早出现在 Fortran，叫 DO 循环，主要用来遍历数组下标。', 'Python 的 `for in` 推广到任何可迭代对象（列表、字符串、字典……），让"遍历"这件事极其干净直观。'],
  'function': ['现代意义的"函数/子程序"由 Maurice Wilkes 等人于 1950 年代在 EDSAC 上提出，是程序"复用"的开端。', '此后所有编程范式——结构化、面向对象、函数式——都建立在**函数能被反复调用**这个基础上。'],
  'recursion': ['递归思想在数学里历史悠久（数学归纳法），第一次大规模用于编程是 LISP（1958）。', '后来的 Algol 和 C 也支持递归，许多优雅的算法（树/图遍历、分治、回溯）都依赖它。'],
  'list': ['"线性表"是最基本的数据结构之一，早期靠数组实现，靠下标访问。', 'Python 的 list 把数组、动态扩容、混合类型合一，对新手友好——但要明白它在底层仍是一段数组。'],
  'dict': ['哈希表（字典背后的实现）由 IBM 的 Hans Peter Luhn 于 1953 年提出，最初为信息检索。', '平均 O(1) 的查、改、加让字典成为**现代编程最有效的工具之一**——很多看似复杂的问题加一个字典就秒解。'],
  'oop-class': ['面向对象在 Simula 67（1967）首次成型，由挪威的 Dahl 和 Nygaard 提出。', '1972 年 Alan Kay 在 Smalltalk 中把"对象+消息"推到极致，他后来说：**"I made up the term object-oriented, and I can tell you I didn\'t have C++ in mind."**'],
  'recursion-bonus': ['"To understand recursion, you must first understand recursion." —— 程序员圈子里最著名的循环梗。', '它道出了递归的精髓：定义可以"引用自己"，但必须有出口。'],
  'binary-search': ['二分查找的思想在数学里很早就有，第一次写成可正确运行的代码是 1962 年——而**第一个错误版本流传了 22 年才被发现**。', 'Donald Knuth 后来说："**虽然这个想法很简单，但要正确写出二分查找出乎意料地难。**"边界条件、整数溢出，至今仍是面试经典坑。'],
  'bubble-sort': ['冒泡排序由 Iverson 1962 年正式定名为 "bubble sort"。它效率不高，但**思路最直观**，几乎所有人学算法都从它开始。', '名字来自"较大的元素像气泡一样浮到顶端"——这种生动的比喻让它跨语言流传至今。'],
  'complexity': ['Donald Knuth 在 1960 年代系统化了"算法分析"，引入大 O 记号。', '从此程序员有了**比较算法效率的统一语言**——"我的算法是 O(n log n)" 一句话就传达了关键信息。'],
  'debugging': ['"bug" 这个词据说来自 1947 年 Grace Hopper 在继电器里捉到的一只**真飞蛾**，并在日志上贴了"first actual case of bug being found"。', '此后所有程序错误都叫 bug，找错误叫 debug。Grace Hopper 也是发明编译器、设计 COBOL 的传奇女程序员。'],
};

window.CODE_HISTORY = Object.fromEntries(
  window.CODE_NODES.map(node => {
    const item = CODE_HISTORY_NOTES[node.id] || [
      `${node.name}是编程语言和算法演化过程中沉淀下来的工具。它把人"想做的事"翻译成机器能执行的步骤。`,
      `学习${node.name}时，多想一下：在没有它之前，程序员是怎么做这件事的，它解决了什么麻烦。`,
    ];
    return [node.id, { origin: item[0], story: item[1] }];
  })
);
