// 初中 · 编程基础与控制结构 —— 离线选择题分片
// 作用：为知识星空的测验功能扩充静态题库（免费、即时、离线可用）。
// 覆盖：comments-style / string / error-types / nested-loop / break-continue 共 5 个节点，每节点 2 题。
// 题型轮换：概念辨析 / 读程序写结果 / 找 bug；干扰项取材各节点小课的易错点。
// 加载顺序：必须在 knowledge-quiz-seed.js 之后加载（追加合并，不覆盖已有题目）。
// 格式与 AI 返回一致：{ q, options[4], correct(下标), explanation }，支持行内代码与 **加粗**。

function __appendQuiz(bank) {
  const Q = window.CODE_QUIZ_SEED;
  for (const [id, qs] of Object.entries(bank)) {
    (Q[id] = Q[id] || []).push(...qs);
  }
}
__appendQuiz({

  'comments-style': [
    { q: 'Python 中单行注释使用的符号是（ ）',
      options: ['//', '#', '<!-- -->', '/* */'], correct: 1,
      explanation: 'Python 用 **#** 写单行注释；`//` 是 C/Java 的注释（在 Python 里是整除运算符），`<!-- -->` 是 HTML 注释。' },
    { q: '下列哪个变量名最符合"见名知意 + snake_case"的命名规范（ ）',
      options: ['a', 'StudentCount', 'student_count', 'sc'], correct: 2,
      explanation: 'Python 变量推荐**小写 + 下划线**的 snake_case 风格且要见名知意：`student_count` 一眼能看懂。`a`、`sc` 看不出含义，`StudentCount` 是类名风格。' },
  ],

  'string': [
    { q: '执行 `s = "Hello"; print(s[1:3])` 的输出是（ ）',
      options: ['He', 'el', 'ell', 'Hel'], correct: 1,
      explanation: '切片 `s[1:3]` 是**左闭右开**：取下标 1、2 两个字符，即 "e" 和 "l"，输出 **el**。' },
    { q: '`s = "cat"; s[0] = "b"` 会报错，原因是（ ）',
      options: ['下标 0 越界了', '字符串是不可变的，不能按位修改', '应该写成 s(0) = "b"', '只有列表才能用下标读取'], correct: 1,
      explanation: '字符串**不可变**：任何"修改"都必须创建新字符串，如 `s = "b" + s[1:]`。下标 0 合法、读取没问题，错在赋值修改。' },
  ],

  'error-types': [
    { q: '程序能正常运行、不报任何错，但算出的结果和预期不符。这属于哪类错误（ ）',
      options: ['语法错误', '运行时错误', '逻辑错误', '编码错误'], correct: 2,
      explanation: '**逻辑错误**最隐蔽：程序"跑得起来"但"算得不对"。语法错误根本跑不起来，运行时错误会中途崩溃报错。' },
    { q: '运行时出现 `NameError: name "total" is not defined`，最可能的原因是（ ）',
      options: ['total 的值太大溢出了', '使用了一个还没赋值定义的变量（或名字拼错了）', '缩进不一致', '括号没有配对'], correct: 1,
      explanation: 'NameError 表示**用了没定义的名字**：要么忘了先赋值，要么变量名拼错（如 totle）。缩进和括号问题会报 SyntaxError / IndentationError。' },
  ],

  'nested-loop': [
    { q: '执行下面代码后输出是（ ）\n`count = 0`\n`for i in range(3):`\n`    for j in range(2):`\n`        count += 1`\n`print(count)`',
      options: ['5', '6', '8', '9'], correct: 1,
      explanation: '外层跑 3 次，每次内层都完整跑 2 次，总次数 = 3 × 2 = **6**。嵌套循环的总次数是**外层次数 × 内层次数**。' },
    { q: '想打印九九乘法表（第 1 行 1 列、第 2 行 2 列……），正确的循环设计是（ ）',
      options: ['一个循环跑 81 次就够，不需要嵌套', '外层控制行 i，内层控制列 j 且 j 的范围随 i 变化', '两层循环的范围必须完全一样', '内层循环变量也用 i，省一个变量'], correct: 1,
      explanation: '典型嵌套结构：**外层管行、内层管列**，第 i 行有 i 个式子，所以内层写 `for j in range(1, i+1)`。内外层共用变量名 i 会互相干扰，是嵌套循环经典 bug。' },
  ],

  'break-continue': [
    { q: '执行下面代码后输出是（ ）\n`for i in range(5):`\n`    if i == 3: break`\n`    print(i, end="")`',
      options: ['0123', '012', '01234', '3'], correct: 1,
      explanation: 'i 取到 3 时 **break 立即终止整个循环**，3 本身没被打印，输出 **012**。注意 break 在 print 之前执行。' },
    { q: '执行下面代码后输出是（ ）\n`for i in range(5):`\n`    if i % 2 == 0: continue`\n`    print(i, end="")`',
      options: ['024', '13', '1234', '02413'], correct: 1,
      explanation: '**continue 只跳过本次循环**剩余语句、直接进入下一次：偶数 0、2、4 被跳过，只打印奇数 **13**。它和 break（整个循环结束）是最容易混的一对。' },
  ],

});
