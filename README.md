# 物理知识星空 · k12Physical

> **线上地址**：https://physics.0oneup.com （上线后生效，目前规划中）
> **NavRibbon**：已接入（`data-site="physics"` · `data-name="物理知识星空"` · full 模式）
> **隶属**：[零一优创产品矩阵](https://0oneup.com/#product-matrix)

初中物理知识图谱可视化 — 概念演化路径、变式题型生成、AI 辅导评测。结构与 [k12math](../k12math/) 同源。

## 技术栈

- Vite + React 19
- KaTeX
- 单页面应用，无后端

## 开发

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # 产物在 dist/
```

## 部署

Vercel · Framework Preset: Vite · Output: `dist/` · 域名绑定 `physics.0oneup.com`

## NavRibbon

`index.html` 已注入站间导航条脚本。详情见 [k12math README](../k12math/README.md) 的 NavRibbon 段落。

## 相关项目

- [数学知识星空](https://math.0oneup.com) — `k12math/`
- [AI 课程时间轴](https://ai.0oneup.com) — `AI_course/`
