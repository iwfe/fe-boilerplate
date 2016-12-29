/*
 * @Author: jade
 * @Date:   2015-12-24 16:44:31
 * @Last Modified by:   lancui
 * @Last Modified time: 2016-08-10 16:39:46
 */
var staticUrl = window.pageConfig.staticUrl;
var util = require('../utils.js');
var flash = require('./flash.js');
var html5 = require('./html5.js');
var controller = require('./controller.js');
var bigPlayImg = staticUrl + require('./play.png');
var bigPlayOpacitasImg = staticUrl + require('./play_opacitas.png');
let pageConfig = window.pageConfig;

/*增加户型图*/
import DoorModelApi from '../doormodel/index.js';

var loadingImg = iwjw.loadingWhiteSvg;
var loadingIe8Img = iwjw.bigLoadingGifImg;
var browser = global.browser;
var tpl = require('./video.html');
var errorTpl = require('./error.html');
var isIE8 = browser.msie && browser.version == '8.0';

import {DEFINITION} from '../const.js';

require('./iwvideo.scss');
var iwVideo = function(container, options) {
    var self = this;
    self.container = container;

    // 兼容以前直接传 src 的情况
    if(typeof options.src == 'string'){
        options.src = {hd: options.src};
    }

    let protocol = location.protocol;
    if(protocol !='http:'){
        options.src = _.mapObject(options.src,(val,key)=>{
            return (val && val.indexOf('//ksvideo.iwjw.com')!= -1) ? val.replace('http:' , protocol): val
        })
    }

    // 设置默认src
    options.initDef = util.getInitDefinition(options.src, 0);
    options.initSrc = options.src[options.initDef];

    if(options.src.sp || options.src.hd || options.src.sd){
        options.hasVideo = true;
    }else{
        options.hasVideo = false;
    }

    self.options = $.extend({
        autoPlay: false,
        hasVideo: true,
        ifChangeVideo: false, //是否支持视频切换
        poster: null,
        rootEle: $(document),
        isRootEle: true,
        isFullscreen: false,
        currentTime: null,
        volume: null,
        fullscreenSupport: false,
        clickProgressCallback: $.noop,
        completeCallback: $.noop,
        playCallback: $.noop,
        clickPlayCallback: $.noop,
        clickReplayCallback: $.noop,
        errorCallback: $.noop,
        successCallback: $.noop,
        fullscreenCallback: $.noop,
        getProgressCallback: $.noop,
        changeDefinitionCallback: $.noop,
    }, options);

    self.init();
};

iwVideo.prototype = {
    init: function() {
        var self = this;
        var container = self.container;
        var options = self.options;
        var isFlash = !global.supportVideo();
        var data = {
            src: options.src,
            /*是否可切换*/
            ifChangeVideo: options.ifChangeVideo,
            hasVideo: options.hasVideo,
            /*是否有户型图*/
            doorModel:{
                bool:options.doorModel || false,
            },
            initSrc: options.initSrc,
            /*初始化的清晰度*/
            initDef: options.initDef,
            isFlash: isFlash,
            isMobile: browser.isMobile,
            isIphone: browser.isIphone,
            isWeixin: browser.isWeixin,
            poster: options.poster,
            bigPlayImg: !browser.isWeixin ? bigPlayImg : bigPlayOpacitasImg,
            loadingImg: isIE8 ? loadingIe8Img : loadingImg
        };
        container.show();
        container.html(template.draw(tpl, data));
        /*户型图*/
        if(options.doorModel){
            // /*获取基础数据*/
            DoorModelApi.addDomListener($('.if-video-huxing')[0]);
            let c_cbk = self.options.completeCallback ;
            let e_cbk = self.showError;
            let playVideo = self.playVideo ;
            let isTriggered = false;
            self.options.completeCallback =function(){
                /*通知组件视频播放完成*/
                if(!isTriggered){
                    DoorModelApi.videoComplete();
                    c_cbk && c_cbk();
                };
                isTriggered = true;
            };
            self.playVideo = ()=>{
                playVideo.call(self);
                /*通知组件视频开始播放*/
                DoorModelApi.videoPlay();
            };
            self.showError=(error)=>{
                e_cbk.call(self,error);
                DoorModelApi.videoError();
            }
        }

        var panel = self.panel = $('.mod-video', container);
        self.containerHeight = container.height();

        var tech = html5;

        if (isFlash) {
            tech = flash;
            if (!util.hasFlash()) {
                self.showError({
                    type: 'flash',
                    errorCode: 4
                });
                return false;
            }
        }

        options.tech = self.tech = new tech(container, options);
        self.controller = new controller(container, options);
        self.bindEvent();

        self.inited = false;
        self.error = false;
    },

    reset: function() {
        var self = this;
        var options = self.options;
        var controller = self.controller;

        if(self.error) return false;
        controller.reset();
    },
    /*增加一个注册接口*/
    subscribe:function(subscribeOptions){
        let self = this;
        if(subscribeOptions && typeof subscribeOptions=='object'){
            $.extend(self.options,{subscribeOptions:subscribeOptions});
        };
    },
    /*取消注册*/
    unSubscribe:function(){
        let self = this;
        if(self.options.subscribeOptions){
            delete self.options.subscribeOptions
        };
    },
    bindEvent: function() {
        var self = this;
        var container = self.container;
        var options = self.options;
        var $player = self.$player;
        var player = self.player;
        var controller = self.controller;
        var tech = self.tech;

        container.on('loading-hide', function() {
            if(self.inited) {
                return false;
            }

            self.hideLoading();
            if (browser.isMobile) {
                //如果是移动端，则强制全屏
                //self.fullScreen(true);
                if (options.autoPlay) {
                    //self.controller.play();
                }
            } else {
                self.reset();
            }
            controller.setDuration(tech.duration());

            options.successCallback();
            self.loadProgress();
            controller.setVolume(undefined, false);
            self.inited = true;
        });

        container.on('video-error', function(evt, error) {
            self.showError(error);
        });
    },


    setFullScreenFlag: function(flag) {
        this.controller.fullScreenFlag = flag;
    },

    hideLoading: function() {
        var self = this;
        var container = self.container;
        container.find('.video-loading').hide();
        container.find('.CMVideo-wrap').show();
    },


    //兼容优酷的方法
    pauseVideo: function() {
        if(!this.controller || this.error) return false;
        this.controller.play(false);
    },

    playVideo: function() {
        let self = this;
        if(!this.controller || this.error) return false;

        /*户型图结束*/
        /*视频切换提示3s消失*/
        if(this.options.ifChangeVideo){
            setTimeout(function(){
                self.container.find('.change-video-tips').fadeOut();
            }, 3000);
        }

        if (!this.tech.ended()) {
            this.controller.play(true);
        }
    },

    isPlayed: function() {
        return !this.tech.paused();
    },

    getCurrentTime: function() {
        return this.tech.currentTime();
    },

    //load进度
    loadProgress: function() {
        var self = this;
        var container = self.container;
        var tech = self.tech;
        var duration = tech.duration();

        function updateLoad() {
            var percent = tech.bufferedPercent();

            if (percent === '100%' || !tech) {
                self.loadTimer && clearInterval(self.loadTimer);
            }
            self.controller.setLoadProgress(percent);
        }
        self.loadTimer && clearInterval(self.loadTimer);
        self.loadTimer = setInterval(updateLoad, 200);
        updateLoad();
    },

    //type:错误类型，network:网络异常，decode:解析异常
    showError: function(error) {
        var self = this;
        var container = self.container;
        var controller = self.controller;
        var options = self.options;
        if(self.error) return false;
        self.error = true;
        var type = {
            2: 'network',
            3: 'decode',
            4: error.type
        }[error.errorCode];
        options.errorCallback(error);
        // if (controller && controller.play) {
        //     controller.play(false);
        // }
        var $error = $('.video-error', container);
        $error.html(template.draw(errorTpl, {
            tplType: type
        })).show();
        self.hideLoading();
        container.find('.video-control-wrap').remove();
        //h5下需要隐藏大的播放按钮
        $('.video-big-play', container).hide();
    },

    containerFocus: function() {
        this.container.focus();
    },

    setOptions: function(o) {
        var self = this;
        self.options = $.extend(self.options, o);
        self.controller && self.controller.setOptions(self.options);
    }
};

if (window.IWJW) {
    window.IWJW.iwVideo = iwVideo;
}
module.exports = iwVideo;
