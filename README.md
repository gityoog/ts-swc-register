# ts-swc-register

support esm and cjs

## 安装

```
$ npm install git+https://github.com/gityoog/ts-swc-register.git --save-dev
```

## 使用

```
$ node -r ts-swc-register entry.ts
```

## Changelog

- 2022-09-22 修复 paths 传参引起的解析错误
- 2022-09-20 修复 worker 新建 node 进程 空参数引起的报错
