import {DEFINITION} from '../const.js';
import util from '../utils.js';
let iwVideoUtils = require('iwVideoUtils')

var browser = global.browser;
var isIE8 = browser.msie && browser.version == '8.0';
let isReady = false;
let pageConfig = window.pageConfig;
/*增加户型图*/
import DoorModelApi from '../doormodel/index.js';

export default {

    errorTime: null,
    isReady: false,

    init: function(options, container) {
        var self = this;
        self.container = container,
        self.options = options;
        // 是否全屏
        self.isfullscreen = false;
        /**
         * 初次即初始化
         */
        self.initIframe();
        self.initEvents();
    },
    initEvents: function(){
        let self = this,
            container = self.container,
            options = self.options;
         iwVideoUtils=iwVideoUtils();

        if(container.find('.btn-iknow')[0]){
             container.on('click', '.btn-iknow', function() {

                if(!self.hasTriggerDoor){
                    self.initDoorGuide();
                    self.hasTriggerDoor=true
                }
                container.find('.fullvideo-guide').remove();
                self.options.isFirstPanoramic = 1;
                self.play();
                $.ajax({
                    url: '/setQJCookie.action',
                    type: 'get',
                    success: function(d){
                    }
                });
            });
        }

        container.on('click', '.video-player-fullclose', function() {
            self.fullscreen();
            options.FD_fullscreenCallback();
        });

        //function keyDown(evt) {
            /**
             * 为了兼容IE8,初始化预先执行setter
             * 同时采用setTimeout处理事件
             */
            //switch (evt.keyCode) {
                 //case 27:
                     //console.log(27);
                     ////esc
                     //if (self.isfullscreen) {
                         //self.fullscreen();
                     //}
                     //return false;
                     //break;
            //}
            //return true;
        //}

        //$('html').on('keydown', function(evt) {
            //console.log(evt);
            //return keyDown(evt);
        //});


        var vrevt = {
            part: function(){
                // 进度50%
                options.FD_getProgressCallback(50);
            },
            seek: function(){
                // 拖动进度条
                options.FD_rollCallback();
            },
            ended: function(){
                // 播放结束
                options.FD_getProgressCallback(100);
            },
            close: function(){

                if(self.isfullscreen){
                    self.fullscreen();
                }
                util.changeVideo(1);
                self.options.changeVideoCallback();
            },
            controls: function(){
                // 陀螺仪和鼠标切换
                options.FD_gyroscopeCallback();
            },
            replay: function(){
                // 重新播放
                options.FD_replayCallback();
            },
            videoError: function() {
                // 播放失败
                options.FD_errorCallback();
            },
            fullscreen: function() {
                self.fullscreen();
                options.FD_fullscreenCallback();
            },
            configmenu: function() {
                options.FD_configmenuCallback();
            },
            video1: function(){
                // 流畅播放
                options.FD_changeDefinitionCallback(DEFINITION.SD);
                util.setDefinition('sd');
            },
            video2: function(){
                // 高清播放
                options.FD_changeDefinitionCallback(DEFINITION.HD);
                util.setDefinition('hd');
            },
            video3: function(){
                // 超清播放
                options.FD_changeDefinitionCallback(DEFINITION.SP);
                util.setDefinition('sp');
            },
            videoReady: function(){
                container.find('.video-loading').hide();

                if(self.isReady){
                    return;
                }

                // 如果是切换过来的直接播放
                if(self.options.ifChangeVideo){
                    self.play();
                }

                self.isReady = true;
                if(self.errorTime == 'error'){
                    options.FD_initedCallback(options.ifChangeVideo);
                    return;
                }

                clearTimeout(self.errorTime);
                options.FD_initedCallback(options.ifChangeVideo);
            },
            play: function(){
                options.FD_playCallback();
            },
            pause: function(){
                options.FD_pauseCallback();
            }
        };

        if(isIE8){
            options.FD_initedCallback();
        }else{
            // 定时10秒
            self.errorTime = setTimeout(function(){
                self.errorTime = 'error';
                if(self.options.ifChangeVideo){
                    util.changeVideo();
                    options.FD_initErrorCallback(true);
                }else{
                    options.FD_initErrorCallback();
                }
                container.find('.video-loading').hide();
            }, 10000);
        }

        try{
            window.addEventListener('message',function(event){
                var val = event.data;
                if (val) {
                    vrevt[val.ent] && vrevt[val.ent]();
                }
            },false);
        }catch(e){

        }
    },

    initIframe: function(){
        let self = this,
            options = self.options,
            protocol = location.protocol;

        //@todo url地址
        // var url = 'http://video.iwjw.com/pc/play.html?';
        // var url ='http://video.iwjw.com/prev/pc/play.html?';

        // var url ='http://video.iwjw.com/test/pc/play.html?';
        // var url = 'http://10.7.248.83:8010/videopano/pc/play.html';

        let parentConfig= window.pageConfig||{},
            doorModelConfig = parentConfig.doormodel||{};
        let  hasDoorModel = parentConfig.layoutPic && parentConfig.layoutPic.transparentLayoutPic,
             needChangeVideoType = doorModelConfig.hasCMVideo && doorModelConfig.hasFDVideo;
        var param = 'v480=' + (options.src.f_sd && protocol + options.src.f_sd) + '&' +
            'v720=' + (options.src.f_hd && protocol + options.src.f_hd) + '&' +
            'v960=' + (options.src.f_sp && protocol + options.src.f_sp) + '&' +
            'videoType=' + util.getDefinition(1)+'&' +
            'hasDoorModel=' + !!hasDoorModel+'&' +
            'needChangeVideoType=' + !!needChangeVideoType
            ;


        $('#iwVrVideo').attr('src', protocol + pageConfig.videoSerUrl + '?' + encodeURIComponent(param));
        /**
         * 初次设置iframe隐藏
         */
        $('#iwVrVideo').css({
            display:'none'
        });
    },

    IE_PLAY_REG: /全景playvideo=(true||false)/,

    play: function(){
        let self = this;
        $('#iwVrVideo').css({'display':'block'});
        if(this.options.isFirstPanoramic === 0) return ;

        if(isIE8){
            //if($('#iwVrVideo').attr('src').test(this.IE_PLAY_REG)){
                //$('#iwVrVideo').attr('src',$('#iwVrVideo').attr('src').replace(this.IE_PLAY_REG))
            //}else{
                $('#iwVrVideo').attr('src',$('#iwVrVideo').attr('src')+'&playvideo=true')
            //}
        }else{
            /*非IE8*/
            window.frames[0] && window.frames[0].postMessage({ent: 'playvideo'}, '*');
        }
        /*无全景引导*/
        if(!self.hasTriggerDoor &&  self.options.isFirstPanoramic == 1){
            self.initDoorGuide();
            self.hasTriggerDoor=true
        };
    },
    initDoorGuide(){
         // 户型引导
        let self = this;
        let options = self.options;
        if(options.doorModel){
            let cacheFSfn = self.fullscreen;
            self.fullscreen=()=>{
                let node = iwVideoUtils.getDoorNode();
                let parentNode = iwVideoUtils.getParent();
                if(self.container.hasClass('FD-fullscreen')){
                     node.appendTo(parentNode);
                }else{
                     node.appendTo(self.container);
                };
                cacheFSfn.call(self);
            };
            if(pageConfig.layoutPic && pageConfig.layoutPic.ifVideoLayoutNeedYD==0){
                     DoorModelApi.showGuide(true);
            }
            DoorModelApi.addDomListener();
            DoorModelApi.showLayout();
        };
    },
    pause: function(){
        if(isIE8){
            $('#iwVrVideo').attr('src',$('#iwVrVideo').attr('src')+'&playvideo=false')
        }else{
            /*非IE8*/
            window.frames[0] && window.frames[0].postMessage({ent: 'pausevideo'}, '*');
        }
    },

    changeDef: function(def){
        window.frames[0] && window.frames[0].postMessage({ent: 'upvideo', type: def}, '*');
    },

    fullscreen: function(){
        if(this.container.hasClass('FD-fullscreen')){
            this.isfullscreen = false;
            this.container.removeClass('FD-fullscreen');
            this.container.css({
                'z-index': '990',
                height: '100%',
                width: '100%',
                position: 'absolute'
            })
        }else{
            this.isfullscreen = true;
            this.container.addClass('FD-fullscreen');
            this.container.parent().css({'z-index': '1099'});
            this.container.css({
                'z-index': '9999',
                height: '100%',
                width: '100%',
                position: 'fixed'
            })
        }
    },
}
