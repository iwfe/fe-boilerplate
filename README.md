# fe-boilerplate 前端模板项目

# 架构目录结构

|- build 构建目录
|- |- config_folder 提供给webpack的entry/alias/plugins配置
|- |- gulp4 gulp4任务文件夹
|- |- plugins gulp4及webpack插件
|- components 组件
|- deploy 上线部署和nginx相关配置
|- global 全局组件
|- |- lib 库
|- |- |- underscore/jquery等库
|- |- log 日志
|- |- iwjw 爱屋相关的全局工具
|- business 业务模块文件夹
|- |- static_pages 静态性质的页面
|- |- 其余页面

## 命令

```bash
    # 本地开发
    npm run dev

    # ugilify代码后本地测试
    npm run uglify

    # 准备上线开发
    npm run build

        #仅仅执行上传任务，使用场景一般是你虽然打包成zip了，但是又变卦不想上传
        npm run upload

        #仅仅执行打包+上传任务,使用场景。==kill掉npm run dev==，可以直接走npm run zipUpload
        npm run zipUpload

```

## usage[说明]

- 所有components文件夹的东西，将在webpack打包时，自动添加别名```alias```和```components```目录名称
- webpack.conf.js的ModuleAlias仅仅用于打包 ```global/lib```，非```components```下的公有组件相关

