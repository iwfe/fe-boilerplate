/**
* 采用插件形式加载大图滑动组件
* 改造初衷: 增强组件的可扩展性
* @Author slashhuang
* 约定组件编写规范
*/
import {throttle,supportsTransition,defaultOption} from './util.js';
/**
*组件的构造函数相关,所有的子组件都会拥有以下两个方法
 getBaseData
 ==>{
    options, 配置相关
    metaData 基础数据相关
 }
 notify(object)
 ==>{
    通知父组件
 }
*/
import C_Pagination from './pagination/Pagination.js';
import C_SliderArrow from './slider-arrow/Arrow.js';
import C_SliderDesc from './slider-desc/Desc.js';
import C_hints from './hints/Hints.js';
import React,{Component} from 'react';
import ReactDom from 'react-dom';
//基础组件，可以通过options覆盖
let basePluginSet ={
   ...C_Pagination,
   ...C_SliderArrow,
   ...C_SliderDesc,
   ...C_hints,
};
export default class BigSlder{
    //初始化
    constructor(container,options){
        this.observers = {};//注册发布模块

        this.options = $.extend(true, {}, defaultOption, options);
        this.element = $(container);

        //自动生成查看图片的骨架
        if (this.options.autoGenerateHtml) {
            this.element.append(this.generateLayout());
            this.$sliderControl= this.element.find('.slider-control');
        }
        //初始化元数据
        this.initMetaData();
        //组件构造函数列表,在原来options的基础上增加plugins字段，用于覆盖或增加功能
        this.pluginList = Object.assign({},basePluginSet,options.plugins);
        //初始化组件状态
        this.initContent();
    }
    //注册发布机制
    register(topic,callback){
      if(!this.observers[topic]){
        this.observers[topic]=[];
      }
      this.observers[topic].push(callback);
    }
    publish(topic,data){
      this.observers[topic] && this.observers[topic].forEach((callback)=>callback && callback(data));
    }
    //初始化组件及内容区域
    initContent(){
      //组件数据
       let {metaData,element,options,$sliderControl}=this;
      //内容区域初始化
       let {currentIndex}=metaData;
       let $sliderItems = $sliderControl.children();
       $sliderItems
       .css({
            position: 'absolute',
            zIndex: 0,
            display: 'none',
            top: 0,
            left: 0
        })
       .eq(currentIndex)
       .show()
       .css({ zIndex: 5});

       //组件的方法
       let pluginApi ={
          notify:(data)=>this.notify(data),
          getBaseData:()=>this.getBaseData(),
        };
       //渲染页标、箭头等插件,传递api方法

       this.renderPlugins(currentIndex,pluginApi);

       this.loadContent(currentIndex);
       this.bindEvent();
    }
    renderPlugins(currentIndex,pluginApi){
        let self = this;
         //传递数据同步方法给组件,生成react实例数组
        let _PluginList = _.values(this.pluginList).map((Plugin)=>{
           Plugin && Plugin.prototype && Object.assign(Plugin.prototype,pluginApi);
           return Plugin
       });
        class PluginList extends Component{
          constructor(props){
            super();
            this.state={
              currentIndex:currentIndex
            }
          }
          componentDidMount(){
             //注册父组件的通知
              self.register('pluginList',(currentIndex)=>{
                    this.setState({
                      currentIndex:currentIndex
                    })
              });
          }
          render(){
            let {currentIndex} = this.state;
            return <div>
                    {
                      _PluginList.map((Plugin,index)=>{
                         return typeof Plugin=='function' && <Plugin currentIndex={currentIndex} key={index}/>
                        })
                    }
                  </div>
          }
        };
        ReactDom.render(<PluginList/>,document.getElementById('slider-plugin-container'));
    }
    //初始化展示的内容区域
    generateLayout(){
        let items = this.options.asset;
        let _length = items.length;
        let html = '<div class="responsive-slider">\
                    <div class="slider-container">\
                    <ul class="slider-control">'
        while(_length>0){
          html += '<li class="slider-item" ><div class="slide-content-wrap"></div></li>';
          _length--;
        }
        html += '</ul></div></div><div id="slider-plugin-container"></div>';
        return html;
    }
    //获取组件需要的数据
    initMetaData(){
      let $sliderControl=this.$sliderControl;
      let currentIndex = this.options.startIndex - 1;
      if(currentIndex<0){
        currentIndex=0;
      }
      this.currentIndex = currentIndex;//兼容之前的responsiveS
      //存储组件目前的状态数据
       this.metaData={
          sliderTotal:$sliderControl.children().length,
          currentIndex:currentIndex,
          sliderWidth:$sliderControl.width(),
          sliderHeight:$sliderControl.height(),
       };
       //存储组件上次的状态数据
       this.prevMetaData={ prevIndex:currentIndex };
    }
    /*复用之前的逻辑*/
    setOptions(o){
      this.options = $.extend(this.options, o);
    }
    close(){
      this.options.dialog && this.options.dialog.close();
    }
    /*更新数据，通知*/
    notify(data){
        let { options,metaData,prevMetaData } =this;
        let { sliderTotal } = metaData;
        let { prevIndex } = prevMetaData;
        //数据上次和下次一致，或者正在动画中，直接return;
        let { currentIndex,_direction } = data;
        if(currentIndex == prevIndex || this.animating){
           return;
        }else{
          //如果循环播放，处理边界值
          let goToFirst = currentIndex === -1;
          let goToLast = currentIndex === sliderTotal;
          let pos = currentIndex;
          //处理循环条件
          if(options.isLoop){
              if(goToFirst){
                  pos = sliderTotal - 1;
              };
              if(goToLast){
                  pos = 0;
              }
          }else if(goToLast||goToFirst){ //不循环播放，又处于最后一张或者第一张的情况下，直接返回
              this.animating = false;
              return;
          }
          this.metaData.currentIndex = pos;
          //定义动画方向
          this.metaData.direction = this.metaData.currentIndex>prevIndex?'next':'prev';
          //对循环动画做特殊处理

          /*到达第一张*/
          if(this.metaData.currentIndex==0 && prevIndex ==sliderTotal-1 && _direction=='next'){
            this.metaData.direction ='next'
          }
          /*到达最后一张*/
          if(this.metaData.currentIndex==sliderTotal-1 && prevIndex == 0 &&  _direction=='prev'){
            this.metaData.direction ='prev'
          }
          //同步UI
          this.slideSync();
          //兼容使用responsiveSlider的组件
          this.currentIndex = pos
        };
    }
    /*获取数据*/
    getBaseData(){
        return {
          metaData: this.metaData,
          options:this.options
        }
    }
    /**
     * 主逻辑==>滑动逻辑
     */
    slideSync(){
      let {currentIndex}= this.metaData;
      //内容【功能】区域
      this.slide(currentIndex);
    }
    /*内容区复用老的逻辑，基本没改动*/
    loadContent(index) {
        var self = this,
            items,
            $item,
            $currentItem,
            options = self.options;

        $currentItem = self.$sliderControl.children().eq(index);
        items = options.asset;
        if (!$currentItem.hasClass('slider-loaded') && items[index] && items[index].type  ) {
            if (items[index].type === 'video') {
                options.callBack.videoInit($currentItem.find('.slide-content-wrap'), items[index]);
                $currentItem.addClass('slider-loaded');
                self.hasVideo = true;
            } else if (items[index].type === 'iwVideo'){
                if(self.hasVideo){
                    return
                }
                options.callBack.iwVideoInit($currentItem.find('.slide-content-wrap'), items[index]);
                self.hasVideo = true;
            }
            else if (items[index].type === 'txt') {

            } else if (items[index].type === 'image') {
                // 加时间戳解决ie8下无法触发load事件
                $item = $('<img class="slide-img">');

                $currentItem.find('.slide-content-wrap').prepend($item);

                $currentItem.addClass('slider-loaded');

                $item.attr('src', items[index].content);

            } else if (items[index].type == 'html') {
                $currentItem.addClass('slider-loaded').find('.slide-content-wrap').prepend(items[index].content);
            }
        }

        function loadItem(item, index) {
            if (item && item.type === 'image') {
                var $cItem = self.$sliderControl.children().eq(index);
                if (!$cItem.hasClass('slider-loaded')) {
                    var $cImg = $('<img class="slide-img">');
                    $cItem.find('.slide-content-wrap').prepend($cImg);
                    $cItem.addClass('slider-loaded');
                    $cImg.attr('src', item.content);
                }
            }
        }
        var next = items[index + 1];
        var pre = items[index - 1];
        loadItem(next, index + 1);
        loadItem(pre, index - 1);
    }
    // 具体动画逻辑,index为第几张图片
    slide(index) {
      var self = this;

      let time = 500;
      let {element,options,$sliderControl} = this;
      let {sliderTotal,currentIndex,direction,sliderWidth}=this.metaData;
      let {prevIndex} = this.prevMetaData;
      let  value = direction == 'next' ? 1 : -1;
      let  stepSize = (value==-1)? sliderWidth:-1*sliderWidth;
      self.animating = true;

      //把下一个图片放到指定位置：下一张放到当前图片右边，上一张放到当前图片左边
      let preCss = {
          display: 'block',
          left: value*sliderWidth,
          zIndex: 5
      };
      //更新插件
      setTimeout(()=>self.publish('pluginList',currentIndex),self.options.effect.slide.speed/5);
      $sliderControl.find('li').eq(currentIndex).css(preCss);
      //展示内容
      $sliderControl.stop(true, true).animate({left: stepSize},
              self.options.effect.slide.speed,
              function() {
                  // 动画完成之后加载内容
                  self.loadContent(currentIndex);
                  //滑动回调
                  options.callBack.slide.call(self, currentIndex);

                  $sliderControl.css({
                      left: 0
                  });
                  $sliderControl.find('li').eq(currentIndex).css({
                      left: 0
                  });
                  $sliderControl.find('li').eq(prevIndex).css({
                      display: 'none',
                      left: 0,
                      zIndex: 0
                  });
                  self.animating = false;
                  self.prevMetaData.prevIndex = currentIndex;
              }
          );
  }
  bindEvent() {
      let self = this;
      let {$sliderControl,metaData } = this;
      let {sliderTotal} = metaData;


      // 方向键控制图片，只有一个图片时不绑定键盘事件
      if (sliderTotal > 1) {
          $(document).on('keydown', function(e) {
            let {currentIndex} = metaData;
              if(self.animating){
                return;
              }
              if (!self.options.isSupportKeyboard) {
                  return false;
              }
              var keyValue = e.which;
              switch (keyValue) {
                  case 37:
                      self.notify({
                        currentIndex:--currentIndex,
                         _direction:'prev'
                      })
                      break;
                  case 39:
                       self.notify({
                        currentIndex:++currentIndex,
                         _direction:'next'
                      })
                      break;
              }
          });
      }
  }
}
