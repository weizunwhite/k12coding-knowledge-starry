# GROK-MEDIA-REPORT · 编程知识星空 · 配图接线

**日期**：2026-07-19
**说明**：选图计划与代码接线由 Grok 子代理完成；skip 清单复审与本报告由编排方（Claude）收尾。

## 汇总

| 项 | 数值 |
|----|------|
| 节点总数 | 56 |
| 选图计划条数 | 56（`/tmp/k12coding-media-plan.json`） |
| 计划配图 | 41 |
| skip（宁缺毋滥） | 15 |
| 校验 | `node scripts/validate-data.cjs` ✅ |
| 构建 | `npm run build` ✅ |

## 改动清单

- `code-media.js` — 空注册表 `window.CODE_MEDIA = {}`（由下载器填充）
- `src/main.jsx` — 注册表接线
- `node-detail.jsx` — 详情面板配图区块（无条目不渲染，图题中文 + credit 灰色小字）
- `index.html` — 配图区块样式
- `scripts/validate-data.cjs` — 媒体校验（键↔文件双向、>5KB、credit 非空）

## 选图方向

计算机史照片（ENIAC/穿孔卡/早期个人电脑）、先驱人物肖像（图灵/Ada Lovelace/Grace Hopper/Knuth/Bellman/Liskov/Alan Kay/Gamma）、经典案例实物（八皇后棋盘、硬币找零、扑克牌排序）。

## skip 清单（15 个，均为纯语法/抽象概念，无有辨识度的公版实物影像）

operators、comments-style、while-loop、for-loop、nested-loop、break-continue、
set-type、linked-list、params-return、scope、complexity-advanced、divide-conquer、
heap、union-find、dp-advanced
