# ts-swc-register

support esm and cjs

## INSTALL

```
$ npm install ts-swc-register --save-dev
```

## USE

```
$ node -r ts-swc-register entry.ts
```

## Changelog
- 2024-04-07 add register config
- 2024-04-07 rewrite for config file
- 2023-11-07 add sourcemap support
- 2022-09-22 修复 paths 传参引起的解析错误
- 2022-09-20 修复 worker 新建 node 进程 空参数引起的报错
