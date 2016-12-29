## pc-iwjw   [iwjw pc站]
## 命令
```bash
    # 本地开发
    npm run dev

        # 本地开发，添加entry，name为你的入口文件的key,可以在build/config_folder/[,main_files,static_files]中查看
        npm run dev -- --entry name,name1

        # ugilify代码后本地测试
        npm run uglify

    # 准备上线开发
    npm run build

        #仅仅执行上传任务，使用场景一般是你虽然打包成zip了，但是又变卦不想上传
        npm run upload

        #仅仅执行打包+上传任务,使用场景。==kill掉npm run dev==，可以直接走npm run zipUpload
        npm run zipUpload

    # 获取beta/test发布版本

        npm run info:test
        npm run info:beta


```

## 自动化配置文件
```
    cd ./build/

    ## 修改配置文件即可
    vim config.json
```

## usage[说明]
- 所有components文件夹的东西，将在webpack打包时，自动添加别名```alias```和```components```目录名称
- webpack.conf.js的ModuleAlias仅仅用于打包 ```global/lib```，非```components```下的公有组件相关



# fe-boilerplate
