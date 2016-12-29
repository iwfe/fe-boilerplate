/*
 * @Author: jade
 * @Date:   2015-12-24 16:44:31
 * @Last Modified by:   lancui
 * @Last Modified time: 2016-08-10 16:39:46
 */
var staticUrl = pageConfig.staticUrl;
var util = require('../utils.js');
var panaromaGuideImg = staticUrl + require('./img/panaroma_guide.png');


var loadingImg = iwjw.loadingWhiteSvg;
var loadingIe8Img = iwjw.bigLoadingGifImg;
var browser = global.browser;
var tpl = require('./video.html');
var isIE8 = browser.msie && browser.version == '8.0';

import {DEFINITION} from '../const.js';
import fullVideo from './fullVideo.js';

require('./iwvideo.scss');
var iwVideo = function(container, options) {
    var self = this;
    self.container = container;
    let protocol = location.protocol;
    let staticData = pageConfig[pageConfig.staticTag];

    // 设置默认src
    options.initDef = util.getInitDefinition(options.src, 1);// 1 代表全景
    options.initSrc = options.src[options.initDef];
    options.hasFDVideo = staticData.hasFDVideo;
    options.hasCMVideo = staticData.hasCMVideo;

    if(options.type === 1){
        options.hasFDVideo = true;
    }else if(options.type === 0){
        options.hasCMVideo = true;
    }

    self.options = $.extend({
        autoPlay: false,
        hasFDVideo: false,
        ifChangeVideo: false, //是否支持视频切换
        isFullscreen: false,
        FD_initedCallback: $.noop, // 加载成功
        FD_initErrorCallback: $.noop, // 加载失败
        FD_fullscreenCallback: $.noop, //全屏
        FD_firstImg: '',
        FD_playCallback: $.noop, // 播放
        FD_pauseCallback: $.noop, //暂停
        FD_getProgressCallback: $.noop, // 获取进度条 50% 和 100% 会触发
        FD_rollCallback: $.noop, // 拖动滚动条
        FD_replayCallback: $.noop, // 重播
        FD_errorCallback: $.noop, // 出错
        FD_gyroscopeCallback: $.noop, // 陀螺仪和鼠标切换
        FD_changeDefinitionCallback: $.noop, // 清晰度切换
        FD_configmenuCallback: $.noop // 打开清晰度列表
    }, options);

    self.init();
};

iwVideo.prototype = {
    init: function() {
        var self = this;
        var container = self.container;
        var options = self.options;
        var data = {
            hasFDVideo: options.hasFDVideo,
            /*是否有户型图*/
            doorModel:{
                bool:options.doorModel || false,
            },
            /*初始化的清晰度*/
            isFirstPanoramic: options.isFirstPanoramic == 0 ? true : false,
            FD_firstImg: options.FD_firstImg,
            panaromaGuideImg: panaromaGuideImg,
            loadingImg: isIE8 ? loadingIe8Img : loadingImg
        };

        container.html(template.draw(tpl, data));

        if(!options.ifChangeVideo){
            fullVideo.init(options, container);
            container.show();
        }
        self.bindEvent();
    },

    bindEvent: function() {
        var self = this;
        var container = self.container;
        var options = self.options;


        $.jps.on('fullVideo-show', function(data){
            self.showFullVideo(data.def);
        });
    },



    playVideo: function() {
        /**
         * 发送给iframe,并播放视频
         */
        fullVideo.play();
    },

    pauseVideo: function() {
        fullVideo.pause();
    },

    setOptions: function(o) {
        var self = this;
        self.options = $.extend(self.options, o);
        self.controller && self.controller.setOptions(self.options);
    },

    fullVideoInited: false,

    showFullVideo: function(def) {
        let self = this;
        let options = self.options;
        let container = self.container;

        // 如果可切换
        if(!self.fullVideoInited && options.ifChangeVideo){
            self.fullVideoInited = true;
            fullVideo.init(options, container);
        }

        if(fullVideo.errorTime === 'error'){
            self.options.change2back();
            return;
        }

        if(fullVideo.isReady){
            container.show();
            fullVideo.changeDef(def);
            fullVideo.play();
        }else{
            container.show();
            //container.find('.video-loading').show();
        }

        $('#IWJWplayer').hide();
    }
};

module.exports = iwVideo;
