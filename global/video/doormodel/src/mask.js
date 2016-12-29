/*
* @Author: slashhuang
* @Date:   2016-11-10 11:40:08
* 户型图视频引导部分
*/
require('./mask.scss');
let guideMask = function(){
    let hasGuided =false;
    let timeoutId = null;
    let template=[`<div class='guide-l-mask'></div>`,
            `<div class='guide-l-hint'>为你自动打开户型图，你可以手动关闭`,
            `<div class="iconfont if-triangle-down g-l-arrow"></div>`,
            `<div class="iconfont if-video-huxing fake-icon"></div>`,
            `</div> `];
    let init = (boolean)=>{
        if(boolean){
            template[3]='';
            template[2]= `<div class="iconfont if-triangle-down g-l-arrow" style="right:46px"></div>`;
        };
        let $frag = $(template.join(''));
        $('.player-wrap').append($frag);
        if(!timeoutId){
            timeoutId = setTimeout(function(){
                $frag.fadeOut(800,function(){
                     $frag.remove();
                })
            },2200);
        };
    }
    return {
        /*true为全景视频*/
        init(boolean){
            if(!hasGuided){
                init(boolean);
                let self = this;
                setTimeout(()=>{
                    /*将假的icon也推送进监听队列*/
                   self.addDomListener($('.fake-icon.if-video-huxing')[0])
                },0);
            }
        },
        hide(){
            $frag.hide();
        }
    }
}
let maskSingleton = guideMask();
/*引导单例*/
export default {
    show:maskSingleton.init,
    hide:maskSingleton.hide
}

