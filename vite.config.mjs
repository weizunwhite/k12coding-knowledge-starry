import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// 注：这里原本有一整套 DeepSeek 转发中间件（readJsonBody / sendJson /
// 生产是 Vercel 静态托管，没有这层中间件，/api/ai/* 一律 404 ——
// 于是「AI 答疑」在线上必然失败。整层已于 2026-08-20 拆除。


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // 挂载到官网子路径 www.0oneup.com/courses/coding。
    // 必须用绝对 base 而不是 './'：相对路径依赖尾斜杠，在 /courses/coding（无尾斜杠）下
    // ./assets/x.js 会解析成 /courses/assets/x.js 少一级而 404；Next 默认又会剥掉尾斜杠，
    // 靠重定向补会死循环。老域名直接访问的兼容由 vercel.json 的 rewrite 兜住。
    base: '/courses/coding/',
    plugins: [
      react({
        jsxRuntime: 'classic',
      }),
    ],
    server: {
      port: 4175,
      strictPort: false,
    },
  };
});
