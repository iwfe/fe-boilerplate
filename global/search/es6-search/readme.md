## search组件类型
 |- link:链接刷新，
 |- form:表单提交刷新
 |- nosubmit: 不对form进行提交操作

## search组件组成部分
 |- input输入框
 |- hintPanel下拉框


### input框需要处理的事情
 |- cancelBtn:
 |   |- event:click
 |   |    |-  自身show/hide
 |   |    |-  input值置空
 |
 |- input文本框:
 |   |- event:
 |   |       |- focus:
 |   |       |    |- 获取后端数据【从本地storage取值】
 |   |       |- change:
 |   |       |    |- 改变cancelBtn的UI
 |   |       |- input
 |   |       |    |- 获取后端数据
 |   |       |- keydown      【====> 只处理上下、enter键】
 |   |       |    |- 上下键:  改变hintPanel的数据选中   ===>selectedItem
 |   |       |    |- enter键: 执行搜索
 |   |       |- keyup
 |   |       |    |- 【====> 处理和input一样的逻辑】
 |   |       |- blur
 |   |       |    |- 暂不明确

### hintPanel提示框需要处理的事情
 |- 整体:
 |  |- 隐藏
 |  |   |- input框有值，但是ajax后端无数据或者error
 |  |   |- input框无值，获取本地localStorage的值
 |  |   |- blur点击
 |  |- 显示
 |  |   |- 本地localStorage有值
 |  |   |- ajax后端有数据
 |
 |- 部分item:
 |  |- 点击
 |  |   |- type为submit或者link，执行跳转     ===>selectedItem
 |  |   |- type为nosubmit，仅仅存值


## search组件功能抽象

###### 处理input输入框的值   [方法名: digestInput,  处理UI相关: cancelBtn + input]
> 触发形式
1. cancelBtn  :click
2. input      :input
3. input      :keydown ===>把hintPanel的值带过来

```javascript
    /*type: 改变input的来源*/
   let digestInput = (type)=>{
        switch(type){
            case 'calcelClick': ===> 处理cancelBtn样式，input置空
                loadLocalData();
            case 'inputInput',  ===> 当前input已经满足条件
                loadLocalData || changePanelData
            case 'inputKeyDown' ===> 获取当前激活的hintPanel的item节点，渲染信息
                //donothing
            case 'switchTab': ====> 用户切换当前tab,然后focus
               loadLocalData || changePanelData
        }
    }
```

##### 处理input值的controller映射表  [处理UI相关+功能相关]
```javascript
    let centerController={
        'calcelClick':{
            ui:   dealCancelBtn,
            func: loadLocalData();
        },
        'inputInput':{
            ui:   dealCancelBtn,
            func: loadLocalData || changePanelData[ajax]
        },
        'inputKeyDown':{
            ui:   itemToInput
        }，
        'switchTab':{
            func: loadLocalData || changePanelData[ajax]
        }
    }
```


### 开发模块划分
1. store.js   ===> 本地存储模块，提供setter、getter等
``` Javascript
    api:{
        __getSearchKey,     //获取本地存储
        __storeSearchKey,   //存储进本地存储
        __loadSearchStore   //加载本地数据
    }
```
2. dataFactory.js  ===> 加工【submit,link模式下】的数据
>  [调用点]:  UI已显示完成，所有的数据都已经就绪
``` Javascript
    api:{
        getData, // 获取存储的数据
        setData   //设置数据
    }
```

3. uiController.js ===> 完成页面UI的处理
``` Javascript
    api:{

        dealCancelBtn, //处理cancelBtn相关模块
        itemToInput,   //处理点击下拉框相关
        dealHintPanel, //处理下拉框整体显示隐藏相关
        dealKeyHintPanel,//处理键盘上下按键
        renderHintPanel //AJAX渲染下拉框
    }
```

4. funcController.js ===> 处理hintPanel渲染
``` Javascript
    api:{
        jumpLink,       //执行跳转
        changePanelData[ajax]   //处理点击下拉框相关
    }
```

5. callback.js ===> 回调函数模块
``` Javascript
    api:{
        submitCallback,       //提交回调
        hintClickCallback,    //处理点击下拉框相关
        inputWorldCallback
    }
```

6. index.js ===> 组装所有这一切，执行最终的跳转等逻辑
``` Javascript
    # 使用
    new search({option});
```












