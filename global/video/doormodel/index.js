/*
* @Author: slashhuang
* @Date:   2016-11-10 11:40:08
* 滑动组件的户型导航图
*/

import LayoutModel from './src/layout.js';
import layoutMask from './src/mask.js';

let pageConfig = window.pageConfig;
/*让不同的文件共享同一个上下文*/
module.exports =(function(){
    let closureContext = {
        DomListener:[],  /*监听队列*/
        layoutComponent:null
    };
    return  {
        init:function(containerDom){
            let {
                bigTransparentLayoutPic,
                transparentLayoutPic
            } = pageConfig.layoutPic;
            let initOptions={
                bigSrc:bigTransparentLayoutPic||iwjw['loadingImg'],
                smallSrc: transparentLayoutPic||iwjw['loadingImg'],
                size:'small'
            };
            /*渲染组件*/
            closureContext.layoutComponent = new LayoutModel(containerDom,closureContext,initOptions);
        },
        /*同步按钮的颜色状态*/
        btnCbk(isShow){
            let _css={ color:isShow?'#FF5722':'#fff'};
            if(closureContext.DomListener&&closureContext.DomListener.length){
                /*同步UI状态*/
                closureContext.DomListener.forEach((listener)=>{
                    $(listener).css(_css);
                })
            }
        },
        showLayout(bool=true){
            closureContext.layoutComponent.context.setState({
                 show:bool
            });
        },
        /*boolean为true则为全景视频过*/
        showGuide(boolean){
            layoutMask.show.call(this,boolean);
        },
        toggleView(){
             closureContext.layoutComponent.toggle((isShow)=>{
                   this.btnCbk(isShow);
                })
        },
        /*添加普通和全景事件监听*/
        addDomListener(dom){
            let self = this;
            /*普通视频*/
            if(dom){
                closureContext.DomListener.push(dom);
                $(dom).click(()=> {
                    self.toggleView();
                });
            };
              /*全景视频*/
                try{
                    let vrevt = {
                        'roomshow': function(){
                           /*显示户型图*/
                           self.showLayout();
                        },
                        'roomhide': function(){
                           /*隐藏户型图*/
                            self.showLayout(false);
                        }
                    };
                    window.addEventListener('message',function(event){
                        var val = event.data;
                        if (val) {
                            vrevt[val.ent] && vrevt[val.ent]();
                        }
                    },false);
                }catch(e){}
        },
        /*同步播放器事件*/
        videoCallback(){
            closureContext.layoutComponent.context.setState({
                 show:false
            });
            this.btnCbk(false);
        },
        videoComplete(){
            if(!closureContext.layoutComponent.context) return;
            this.videoCallback();
        },
        videoError(){
            if(!closureContext.layoutComponent.context) return;
            this.videoCallback();
            layoutMask.hide();
        },
        videoPlay(){
            let {
                ifVideoLayoutNeedYD
            } = pageConfig.layoutPic;
            /*如果需要显示引导的话*/
            ifVideoLayoutNeedYD=='0' &&  layoutMask.show.call(this);
            let self = this;
            let singletonDoorShow=(function(){
                let init=false;
                return ()=>{
                    if(!init)
                        self.showLayout();
                     init=true
                }
            }());
            singletonDoorShow();
        }
    }
}());

