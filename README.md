# ts-swc-register

support esm and cjs

## INSTALL

```
$ npm install ts-swc-register --save-dev
```

or

```
$ npm install git+https://github.com/gityoog/ts-swc-register.git --save-dev
```

## USE

```
$ node -r ts-swc-register entry.ts
```

## Changelog

- 2022-09-22 修复 paths 传参引起的解析错误
- 2022-09-20 修复 worker 新建 node 进程 空参数引起的报错
