/**
 * Created by huangxiaogang on 16/7/28.
 * search主程序入口
 * 移除的参数
 * [
 *  template, //自定义模板
 *  hintContainer,//提示面板容器
 *  urlParam: {}, //链接刷新需要在url上加的字段
 *  extendEvent: null, //{'event  element': function}
 *  isAnchor: false, //是否是用锚点打开
 *  ]
 */
import FuncController from './funcController.js';
import UiController from './uiController.js';
import DataFactory from './dataFactory.js';
import Callback from './_callback.js';
import Store from './store.js';
import Logger from './utils/log.js';
require('../search.css');
export default class Search {
    static basicOptions= {
        provinceId: '', //省份ID
        showClose: true, //是否显示关闭按钮
        showHintHistory: true, //是否显示提示的历史记录
        exactMatch: false, //精确匹配，如果搜索只有一条就用一条来进行搜索
        inputName: 'kw', //input的name值
        itemKeyName: 'text', //显示所要取的字段
        appendEstateName: true, //列表项后面是否显示小区名称
        hintSubmit: 'form', //link:链接刷新，form:表单提交刷新, nosubmit: 不对form进行提交操作
        autoSubmit: true, //如果是form的话是否要自动提交，默认是true，地图页的搜索form但是不让提交，才加该字段
        hintUrl: '/getSuggestions.action', //提示URL
        inputWorldCallback: $.noop, //输入文字回调
        hintRequestCallback: $.noop, //提示请求结束
        hintClickCallback: $.noop, //点击提示条目回调
        submitCallback: $.noop, //提交表单回调
        currentHouseType: 1, //当前serch key 的类型，默认是租房
        $submitBtn: '',
        __tipsTitle:  {
            '2': '板块',
            '5': '地铁'
        }
    };
    constructor(container,options){
        //参数配置
        this.options = $.extend(Search.basicOptions,options);
        //获取前端已渲染好的dom节点
        this.initNodes = {
            $container: container,
            $input:container.find('input[name="' + this.options.inputName + '"]')
        };
        //初始化UiController，绘制所需dom
        this.initUiController();
        //存储组件生成的dom节点
        this.nodes = $.extend(this.UiController.genNodes,this.initNodes);
        delete this.initNodes;
        //初始化所有的功能 FuncController
        this.initFuncController();
        //绑定事件
        this.bindEvents();
    }
    initUiController(){
        this.UiController = UiController(this.initNodes,this.options);
    }
    initFuncController(){
        let options = this.options;
        /*生成所有的控制组件*/
        this.DataFactory= DataFactory(this.nodes,options);
        this.FuncController = FuncController(this.nodes,options);
        this.Callback = Callback(this.nodes,options);
        /*@TODO*/
        this.Store = Store(this.nodes,options,this.UiController);
    }
    setOptions(options) {
        $.extend(this.options, options);
    }
    bindEvents(){
        let { hintSubmit,exactMatch,hintClickCallback } = this.options;
        let { UiController,FuncController,DataFactory,Callback,Store}=this;
        let  {$container,$input,$hintPanel,$cancelBtn} = this.nodes;
        let triggerCount = 0;
        $input.on("focus", function() {
               if(triggerCount>0){
                    let dbData = DataFactory.getData();
                    UiController.dealCancelBtn();
                    if(dbData.panelType == dbData.houseType
                        && !!$hintPanel.find('.hint-item').size()
                        && $.trim(dbData.value)!='') {
                        UiController.dealHintPanel();//如果不需要改动的话，就只处理UI
                    }else{
                        if($.trim(dbData.value)==''){
                            Store.__loadSearchStore();;//加载本地数据
                            DataFactory.setData({panelType:dbData.houseType})
                        }else{
                            FuncController.changePanelData(DataFactory,UiController);//加载ajax数据
                        }
                    }
                    DataFactory.setData({
                       selectedItem : null //清空选中的提示条目
                    })
               }
               triggerCount++;
            })
            // .bind('input', function(evt) {    // 当input有placeholder属性时，ie10/11 首次加载时会触发input事件, 相关原文https://connect.microsoft.com/IE/feedback/details/885747/ie-11-fires-the-input-event-when-a-input-field-with-placeholder-is-focused
            //     console.log('input');
            //     UiController.dealCancelBtn();//处理界面UI
            //     let {value} = DataFactory.getData();
            //     if(value==''){
            //         Store.__loadSearchStore();
            //     }else{
            //         FuncController.changePanelData(DataFactory,UiController); //根据数据处理功能
            //     }
            // })
            .click(function(){
                if(triggerCount == 1 ){ //进页面点击click触发下拉框
                    triggerCount++;
                    $input.trigger('focus');
                    return false;
                }else{
                    return false;//劫持one click
                }
            })
            .keyup(function (evt) {
                  let keyCode = evt.keyCode;
                  if(keyCode!=38 && keyCode!=40){
                    UiController.dealCancelBtn();//处理界面UI
                    let {value} = DataFactory.getData();
                    $hintPanel.scrollTop(0);
                    if(value==''){
                        Store.__loadSearchStore();
                    }else{
                        FuncController.changePanelData(DataFactory,UiController); //根据数据处理功能
                    }
                  }

            })
            .keydown(function(evt) {
                let keyCode = evt.keyCode;
                //按enter键就提交
                let collectData = DataFactory.getData();
                let {selectedItem,value} = collectData;
                Callback.inputWorldCallback($input, evt);
                if ($hintPanel.is(':visible')) {
                    switch (keyCode) {
                        case 27://ESC|回车
                        case 13://enter
                            //兼容input框的值和下拉菜单的第一项保持一致的情况
                            if ($hintPanel.find('.active').length == 0
                                &&value== $hintPanel.children().first().find('.key-txt').text()
                                &&(!!value.trim())
                                ) {
                                 //存储数据
                                DataFactory.setData({selectedItem:$hintPanel.children().first()});

                            }

                            $hintPanel.hide();
                            Callback.inputWorldCallback(value, evt);
                            if (hintSubmit === 'nosubmit') return false;
                            if (!$container.find('button[type="submit"], input[type="submit"]').size()) {
                                $container.submit();
                            }
                            break;
                        case 38:// 向上
                        case 40://向下
                            UiController.dealKeyHintPanel(keyCode);
                             //存储数据
                            DataFactory.setData({selectedItem:$hintPanel.find('.hint-item.active')});
                            break;                               
                    }
                };
            })
            .blur(function() {
                if (exactMatch) {
                    //如果是精确匹配
                    if ($hintPanel.children().length == 1) {
                        $hintPanel.children().trigger('click');
                    }
                }
            });
        //点击取消叉叉
        $cancelBtn.on('click',function(){
            UiController.dealCancelBtn('click');
        });
        //点击每个条目
        $container.on('click', '.hint-item', function(e) {
            var item = $(this);
            //存储数据
            DataFactory.setData({selectedItem:item});
            let _noInputCollectData = DataFactory.getData();
             //执行打点,保持input输入框不变
            Logger('click',_noInputCollectData,$hintPanel.data('inputWord'));
             //修正界面
            UiController.itemToInput(item);
            //取出数据
            let collectData = DataFactory.getData();
            let {selectedItem,$input,value}=collectData;

            //存储本地数据
            let _key = selectedItem ? selectedItem : value.trim();
            _key && Store.__storeSearchKey(_key);
            //执行回调
           let callbackState =Callback.hintClickCallback(item);
            if(callbackState){
                //如果执行完click就完事的话
               return false
            }
            //执行逻辑
            switch (hintSubmit){
                case 'nosubmit':
                    return false;
                case 'form':
                    //form类型仅仅依赖submitCallback
                    Callback.submitCallback(collectData)
                    break;
                case "link":
                    FuncController.jumpLink(collectData);
                    break;
            }
        });
        /*点击右侧按钮提交*/
        $container.submit(function(e){


            if ($hintPanel.find('.active').length == 0
                    &&$input.val()== $hintPanel.children().first().find('.key-txt').text()
                    && $input.val().trim()) {
                     //修正界面
                    DataFactory.setData({selectedItem:$hintPanel.children().first()});
                    // $hintPanel.children().first().trigger('click');
                                // return false;
             }
             $hintPanel.hide();
              //取出数据
            let collectData = DataFactory.getData();

             //存储本地数据
            let {selectedItem,value}=collectData;
            let key = selectedItem ? selectedItem : value.trim();

            if(key) {Store.__storeSearchKey(key);}
            Logger('enter',collectData);
            //执行逻辑
            switch (hintSubmit){
                 case 'nosubmit':
                    return false;
                case 'form':
                //form类型仅仅依赖submitCallback
                Callback.submitCallback && Callback.submitCallback(collectData)
                break;
                case "link":
                FuncController.jumpLink(collectData);
                break;
             };
             return false;
        });
    }
}