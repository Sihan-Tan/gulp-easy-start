### npm install
安装环境

### npm run dev
生产实时更新

### npm run build
打包

### npm run start
打包并在当前目录运行

### npm run sprites
将图片合并成精灵图

### npm run webp
将图片转成webp

### 资源引用:
1. 模板的继承关系 和 css 中的资源引用 使用相对路径
2. js 文件 和 css 文件 使用绝对路径引用, 根路径为 src

### 需要全局安装的包
1. 如果需要单元测试 请运行  npm i -g karma
2. 如果需要接口测试 请运行  npm i -g mocha
3. 如果需要UI测试   请运行  npm i -g backstopjs --ignore-scripts
   npm i --save-dev puppeteer --ignore-scripts
   npm i --save-dev chromium
   npm i --save-dev backstopjs
4. 如果需要功能测试 请运行  npm i -D selenium-webdriver <已集成>

具体支持请看 todo

### 注意
在 window7 上安装包时,有可能会出现 
```
Error: UNABLE_TO_VERIFY_LEAF_SIGNATURE
request to https://registry.npmjs.org/yarn failed, reason: unable to verify the first certificate
```
这个错误, 请设置 npm config set strict-ssl false 将包安装完成后 修改为 true