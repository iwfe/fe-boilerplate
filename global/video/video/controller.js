/*
 * @Author: jade
 * @Date:   2016-02-29 16:26:02
 * @Last Modified by:  huangxiaogang
 * @Last Modified time: 2016-06-27 17:28:03
 * @Last Modified content: 兼容时间的操作
 */

'use strict';
var util = require('../utils.js');
var browser = global.browser;
import {DEFINITION} from '../const.js'

var controller = function(container, options) {
    this.init(container, options);
};
controller.prototype = {
    init: function(container, options) {
        var self = this;
        self.container = container;
        self.options = options;
        self.tech = options.tech;
        var panel = self.panel = $('.mod-video', container);
        //播放按钮
        self.$playBtn = $('.video-play', container);
        self.$bigPlayBtn = $('.video-big-play', container);
        //重播按钮
        self.$replayBtn = $('.video-replay', container);

        //tip
        self.$tip = $('.video-tip', container);

        //当前时间
        self.$currentTime = $('.video-time-current', container);
        //播放进度条
        self.$playProgress = $('.video-play-progress', container);
        self.$playProgressWrap = $('.video-progress-wrap', container);
        self.playProgressWidth = self.$playProgressWrap.width();
        self.$playProgressBtn = $('.video-play-progress-pin', container);
        self.playProgressPinWidth = self.$playProgressBtn.width();
        //加载进度条
        self.$loadProgress = $('.video-load-progress', container);

        //声音滑块
        self.$volumePin = $('.video-volume-pin', container);
        self.volumePinHeight = self.$volumePin.height();
        self.$volume = $('.video-volume', container);
        self.volumeHeight = self.$volume.height();
        self.$volumeProgress = $('.video-volume-progress', container);
        self.$volumeTxt = $('.video-voice-txt', container);


        // 清晰度切换
        self.$lowDefinition = $('.video-low-definition', container);
        self.$highDefinition = $('.video-high-definition', container);

        //全局变量
        self.$fullScreen = $('.video-fullscreen', container);
        self.fullScreenFlag = false;
        self.definition = global.isMobile ? 'sd' : 'hd';
        self.events();
        self.setBarPosition();
        $(window).resize(()=>{
            self.setBarPosition();
        });
    },
    events: function() {
        var self = this;
        var container = self.container;
        var options = self.options;
        var tech = self.tech;
        var rootEle = options.rootEle;

        container.on('click', '.video-player-wrap', function() {
            if (!tech.ended() || browser.isMobile) {
                self.play();
                self.clickPlayCallback();
            }
        });

        //左右按钮是放在rootEle上，但是上下按钮只有hover视频上才能用
        rootEle.attr('tabindex', 0).focus();

        function keyDown(evt) {
            /**
             * 为了兼容IE8,初始化预先执行setter
             * 同时采用setTimeout处理事件
             */
            switch (evt.keyCode) {
                case 32:
                    //空格
                    self.play();
                    self.clickPlayCallback();
                    return false;
                case 37:
                    //左箭头
                    if(tech.currentTime()>=tech.duration()-0.5){
                        tech.currentTime(tech.duration()-0.5)
                    };
                    setTimeout(
                        function(){
                            self.setCurrentTime(tech.currentTime() - 5);
                        },200);
                    self.showTip('后退5s');
                    self.show();
                    return false;
                    break;
                case 39:
                    //右箭头
                    self.showTip('前进5s');
                    if(tech.currentTime()<=0.5){
                        tech.currentTime(0.5)
                    };
                    setTimeout(
                        function() {
                            self.setCurrentTime(tech.currentTime() + 5);
                        },200)
                    self.show();
                    return false;
                    break;
                // case 27:
                //     //esc
                //     if (self.fullScreenFlag) {
                //         self.fullScreen(false);
                //     }
                //     return false;
                //     break;
            }
            return true;
        }
        rootEle.on('keydown', function(evt) {
            if (options.isRootEle && (!self.fullScreenFlag || options.fullscreenSupport)) {
                return keyDown(evt);
            }
        });

        //上下按钮支持
        container.attr('tabindex', 1);
        container.on('keydown', function(evt) {
            var keyCode = evt.keyCode;
            switch (keyCode) {
                case 38:
                    //上箭头
                    self.setVolume(tech.volume() + 0.1);
                    return false;
                    break;
                case 40:
                    //下箭头
                    self.setVolume(tech.volume() - 0.1);
                    return false;
                    break;
            }

            if (self.fullScreenFlag && !options.fullscreenSupport) {
                //全屏并且自己实现支持全屏的情况下
                if(tech.paused() && (keyCode === 37 || keyCode === 39)) {
                    //如果是暂停状态，左右按钮不支持
                    //如果是大屏并且是自己处理大屏并且视频在播放状态的情况下
                    //虽然这种在组件处理业务逻辑很烂，但是都是产品逼的
                }else{
                    return keyDown(evt);
                }
            }
        });

        //点击播放
        container.on('click', '.video-play', function() {
            self.play();
            self.clickPlayCallback();
        });
        //点击重播
        container.on('click', '.video-replay', function() {
            self.setCurrentTime(0);
            self.play();
            self.clickReplayCallback();
        });
        container.on('click', '.video-big-play', function() {
            self.play();
            self.clickPlayCallback();
        });

        //点击声音
        container.on('click', '.video-volume', function(evt) {
            var volume = ($(evt.target).height() - evt.offsetY) / self.volumeHeight;
            self.setVolume(volume);
        });

        //点击进度条
        container.on('click', '.video-progress-wrap', function(evt) {
            var time = evt.offsetX / $(this).width() * tech.duration();
            options.clickProgressCallback(time);
            self.setCurrentTime(time);
        });

        container.on('click', '.video-play-progress-pin', function() {
            return false;
        });

        container.on('click', '.video-volume-pin', function() {
            return false;
        });

        // 点击清晰度切换
        container.on('click', '.video-definition', function() {
            var box = container.find('.video-definition-box');
            self.options.clickDefinitionCallback && self.options.clickDefinitionCallback();
            if(box.hasClass('hide')){
                box.removeClass('hide');
            }else{
                box.addClass('hide');
            }
        });

        container.on('click', '.video-high-definition,.video-low-definition,.video-super-definition', function() {
            self.changeDefinition($(this));
            container.find('.video-definition-box').addClass('hide');
            return false;
        });
        /*切换视频*/
        container.on('click', '.change-video', function() {
            if(self.fullScreenFlag){
                self.fullScreen();
            }
            self.tech.pause();
            util.changeVideo(0);
            self.options.changeVideoCallback();
        });

        $.jps.on('changeVideo-to-common', function(data){
            let def = data.def;
            container.find('.video-definition-box').find('[data-type="'+def+'"]').trigger('click');
            self.play();
        });

        //点击声音图标
        container.on('click', '.video-voice-txt', function() {
            if (tech.volume() == 0) {
                //静音
                self.setVolume(self.unMutedVolume || 0);
            } else {
                self.unMutedVolume = tech.volume();
                self.setVolume(0);
            }
        });

        //处理声音 IE8
        if (browser.msie && browser.version == '8.0') {
            var timer = null;
            container.on('mouseleave', '.video-voice-wrap', function() {
                timer = setTimeout(function() {
                    self.$volume.hide();
                }, 100);
            }).on('mouseenter', '.video-voice-wrap', function() {
                self.$volume.show();
                clearTimeout(timer);
            });

            container.on('mouseenter', '.video-volume', function() {
                clearTimeout(timer);
            });
        }


        //移动标示:none,time,volume
        var moveTag = 'none';
        var startLeft = 0;
        var startTop = 0;
        var tagLeft = 0;
        var tagTop = 0;
        var endLeft = 0;
        var endTop = 0;
        var width = self.playProgressWidth;
        var playerPaused = false;
        container.on('mousedown', '.video-play-progress-pin', function(evt) {
            moveTag = 'time';
            //记录下当前视频状态，如果是暂停状态，则拖动完不需要自动播放
            playerPaused = tech.paused();
            self.play(false);
            self.$bigPlayBtn.hide();
            startLeft = evt.clientX;
            tagLeft = self.$playProgress.width();
            width = self.playProgressWidth;
        });

        container.on('mousedown', '.video-volume-pin', function(evt) {
            moveTag = 'volume';
            startTop = evt.clientY;
            tagTop = self.$volumeProgress.height();
            self.$volume.addClass('active');
        });

        function mouseMove(evt) {
            var endLeft = evt.clientX;
            var endTop = evt.clientY;
            switch (moveTag) {
                case 'time':
                    var tagEnd = tagLeft + endLeft - startLeft;
                    var time = tagEnd / width * tech.duration();
                    self.setCurrentTime(time);
                    self.$bigPlayBtn.hide();
                    break;
                case 'volume':
                    var tagEnd = tagTop + startTop - endTop;
                    var volume = tagEnd / self.volumeHeight;
                    self.setVolume(volume);
                    break;
                default:
                    break;
            }
        }
        $(document.body).on('mousemove', function(evt) {
            mouseMove(evt);
        });

        $(document.body).on('mouseup', function(evt) {
            switch (moveTag) {
                case 'time':
                    if (!tech.ended() && !playerPaused) {
                        self.play(true);
                    }
                    var time = self.getCurrentTime();
                    options.clickProgressCallback(time);
                    break;
                case 'volume':
                    self.$volume.removeClass('active');
                    break;
                default:
                    break;
            }
            moveTag = 'none';
        });

        //控制控制层显示隐藏
        container.on('mouseenter', function(evt) {
            container.focus();
            self.show();
        }).on('mouseleave', function(evt) {
            /*兼容标题在视频区域产生的闪烁问题*/
            if(evt.toElement && $(evt.toElement).hasClass('s-t-container')){
                return ;
            }
            rootEle.focus();
            self.hide();
        }).on('mousemove', function(evt) {
            self.show();
        });

        //由于2s后控制栏隐藏后，会触发一次container的move事件，故需要采用这种方式来做
        container.find('.video-control-wrap').on('mousemove', function(evt) {
            self.show(false);
            mouseMove(evt);
            return false;
        });

        //全屏
        container.on('click', '.video-fullscreen', function() {
            self.fullScreen();
            return false;
        });
    },

    reset: function() {
        var self = this;
        var options = self.options;

        self.show();

        self.setBarPosition();
        if (options.autoPlay !== null) {
            self.play(options.autoPlay);
        }

        //全屏处理
        if (options.isFullscreen === true) {
            self.setFullscreenBtn(true);
            self.fullScreenFlag = true;
        }

        if (options.isFullscreen === false) {
            self.setFullscreenBtn(false);
            self.fullScreenFlag = false;
        }
        
        //时间处理
        if (options.currentTime !== null) {
            self.setCurrentTime(options.currentTime);
        }

        //声音处理
        if (options.volume !== null) {
            self.setVolume(options.volume, false);
        }

    },
    /*增加一个状态同步回调*/
    renderControl:function(action){
        this.panel[action]('active');
        //同步状态回调
        let {subscribeOptions}  = this.options;
        if(subscribeOptions){
            /*约定回调名字为uiCallback*/
            let { uiCallback } = subscribeOptions;
            uiCallback && uiCallback(action);
        }
    },

    //显示控制栏,isHide是否隐藏，false:不需要隐藏
    show: function(isHide) {
        var self = this;
        var panel = self.panel;
        // panel.addClass('active');
        self.renderControl('addClass');
        self.controlTimer && clearTimeout(self.controlTimer);
        if (isHide !== false) {
            self.controlTimer = setTimeout(function() {
                self.hide();
            }, 2000);
        }
        self.playProgressWidth = self.$playProgressWrap.width();
        self.playProgressPinWidth = self.$playProgressBtn.width();
    },

    //隐藏控制栏
    hide: function() {
        var self = this;
        var tech = self.tech;
        if (!tech || !tech.player) return false;
        self.controlTimer && clearTimeout(self.controlTimer);
        if (!tech.paused() && !tech.ended()) {
            self.renderControl('removeClass');
            // self.panel.removeClass('active');
        }
    },

    //播放/暂停,isplay:强制播放还是暂停，true:播放 false:暂停
    play: function(isPlay) {
        var self = this;
        var container = self.container;
        var tech = self.tech;
        if (!tech || !tech.player) return false;
        if (typeof isPlay === 'undefined' && tech.paused()) {
            isPlay = true;
        }
        if (isPlay) {
            tech.play();
            self.playProgress();
            self.showTip('播放');
        } else {
            tech.pause();
            clearInterval(self.playTimer);
            self.showTip('暂停');
        }

        self.updatePlayBtn();
        self.show();
        self.options.playCallback(isPlay);
    },

    //播放进度
    playProgress: function() {
        var self = this;
        var container = self.container;
        var tech = self.tech;
        // var timeId = _.uniqueId('iwvideo_time_');
        // window[timeId] = function(timeId) {
        //     var that = this;
        //     return function(){
        //         if(that.timeId) {
        //             //delete window[that.timeId];
        //         }
        //         that.timeId = timeId;
        //         that.setCurrentTime();
        //     }

        // }
        // window.updateCurrentTime = function() {
        //     var that = this;
        //     return function() {
        //         that.setCurrentTime();
        //     }
        // }
        function updateCurrentTime() {
            self.setCurrentTime();
            // return function() {
            //     self.setCurrentTime();
            // }
        }
        self.playTimer && clearInterval(self.playTimer);
        self.playTimer = setInterval(updateCurrentTime, 250);
        // self.playTimer = setInterval(window.updateCurrentTime.call(self), 100);
        // self.playTimer = setInterval(window[timeId].call(self, timeId), 100);
        updateCurrentTime();
        // window.updateCurrentTime.call(self)();
        // window[timeId].call(self, timeId)();
    },

    setDuration: function(duration) {
        $('.video-time-total', this.container).text(util.formatTime(~~duration));
    },
    setFullscreenBtn: function(isFullscreen) {
        var self = this;
        self.$fullScreen.removeClass('if-player-full-screen if-player-exit-full');
        if (isFullscreen) {
            self.$fullScreen.addClass('if-player-exit-full');
        } else {
            self.$fullScreen.addClass('if-player-full-screen');
        }
    },

    // 获取当前时间
    getCurrentTime: function() {
        return this.tech.currentTime();
    },

    //更新当前时间
    setCurrentTime: function(time) {
        var self = this;
        var options = self.options;
        var container = self.container;
        var tech = self.tech;
        var duration = tech.duration();
        var controller = self.controller;

        var currentTime = tech.currentTime();

        var percent = currentTime / duration;
        if (typeof time=='number') {
            if (time >= duration) {
                time = duration;
            }
            if (time <= 0) {
                time = 0;
            }
            tech.currentTime(time);
            currentTime=time;
            percent = time/duration;
        }

        self.setTimeProgress(percent);

        if (tech.ended()) {

            self.setTimeProgress(1);
            //完成回调
            options.completeCallback();
        }

        self.updatePlayBtn();

        // 回调参数 播放比例 和 当前时间
        options.getProgressCallback(percent, currentTime);
    },

    setTimeProgress: function(percent) {
        var self = this;
        var width = self.$playProgressWrap.width();// self.playProgressWidth;
        var playW = percent * width - self.playProgressPinWidth / 2;
        if (playW < 0) playW = 0;
        if (playW + self.playProgressPinWidth > width) {
            playW = width - self.playProgressPinWidth + 2;
        }
        self.$playProgress.width(playW);
        self.$currentTime.text(util.formatTime(~~self.tech.currentTime()));

        self.$playProgressBtn.css({
            left: playW
        });
    },

    setLoadProgress: function(percent) {
        var self = this;
        self.$loadProgress.width(percent);
    },
    //volume:音量，showTip：是否显示tip
    setVolume: function(volume, showTip) {
        var self = this;
        var tech = self.tech;

        if (typeof volume == 'undefined') {
            volume = tech.volume() || 0;
        }
        volume = ~~(volume * 100) / 100;
        if (volume < 0) volume = 0;
        if (volume > 1) volume = 1;
        tech.volume(volume);

        var bottom = self.volumeHeight * volume - self.volumePinHeight / 2;

        if (bottom < 0) bottom = 0;
        if (bottom + self.volumePinHeight > self.volumeHeight) {
            bottom = self.volumeHeight - self.volumePinHeight;
        }

        self.$volumePin.css({
            bottom: bottom
        });

        self.$volumeProgress.height(bottom);

        //判断音量图标
        self.$volumeTxt.removeClass('if-player-volume-up if-player-volume-down if-player-volume-off');
        if (volume == 0) {
            //静音
            self.$volumeTxt.addClass('if-player-volume-off');
        } else if (volume < 0.5) {
            self.$volumeTxt.addClass('if-player-volume-down');
        } else {
            self.$volumeTxt.addClass('if-player-volume-up');
        }


        if (showTip !== false) {
            //处理精度丢失问题
            var message = '音量' + (volume * 100 + '').replace(/(\d+)\.\d*/, '$1') + '%';
            if (volume == 0) {
                message = '静音';
            }
            self.showTip(message);
        }
    },
    //更新播放按钮状态
    updatePlayBtn: function() {
        var self = this;
        var tech = self.tech;
        var $playBtn = self.$playBtn;
        if (tech.paused()) {
            //如果是暂停
            if (!$playBtn.hasClass('if-player-play')) {
                $playBtn.removeClass('if-player-play if-player-pause if-player-replay');
                $playBtn.addClass('if-player-play');
            }
            self.$bigPlayBtn.show();
        } else {
            //如果是播放
            if (!$playBtn.hasClass('if-player-pause')) {
                $playBtn.removeClass('if-player-play if-player-pause if-player-replay');
                $playBtn.addClass('if-player-pause');
            }
            self.$bigPlayBtn.hide();
        }
        self.$replayBtn.hide();
        if (tech.ended()) {
            clearInterval(self.playTimer);
            if (browser.isMobile) {
                self.$bigPlayBtn.show();
            } else {
                $playBtn.removeClass('if-player-play if-player-pause if-player-replay');
                //如果是播放结束
                tech.pause();
                $playBtn.addClass('if-player-replay');
                self.$replayBtn.show();
                self.$bigPlayBtn.hide();
                self.show();
            }
        }
    },

    // 切换清晰度
    changeDefinition: function(item) {
        var self = this,
            container = self.container,
            options = self.options,
            type = item.data('type'),
            val = item.text();

        container.find('.video-definition-box .active').removeClass('active');
        item.addClass('active');

        // 保存当前时间
        var currentTime = self.getCurrentTime();
        var ispaused = self.tech.paused();
        var video_src = '';
        var tip_text = '';

        tip_text = ({
            'sd': '已切换到流畅',
            'hd': '已切换到高清',
            'sp': '已切换到超清'
        })[type];

        util.setDefinition(type);
        self.definition = type;
        video_src = self.options.src[type];
        options.changeDefinitionCallback(DEFINITION[type.toLocaleUpperCase()]);
        container.find('.video-definition .text').html(val);

        // 替换视频文件
        self.tech.setSrc(video_src);

        // 设置时间
        self.setCurrentTime(currentTime);

        if(!ispaused) self.play();

        // 给出提示文案切换成功
        self.showTip(tip_text);

    },

    //全屏,isFull是否强制全屏,true:全屏，false:退出全屏
    fullScreen: function(){
        let self = this;
        let options = self.options;
        let tech = self.tech;

        self.fullScreenFlag = !self.fullScreenFlag;
        options.fullscreenCallback({
            isFullscreen: self.fullScreenFlag,
            autoPlay: !tech.paused(),
            currentTime: tech.currentTime(),
            volume: tech.volume()
        });
        if (options.fullscreenSupport) {
            self._fullScreen();
        }
    },
    _fullScreen: function(isFull) {
        var self = this;
        var container = self.container;
        var options = self.options;
        var element = container[0];
        var tech = self.tech;
        if (typeof isFull !== 'undefined') {
            self.fullScreenFlag = !isFull;
        }
        if (options.fullscreenSupport) {
            self.$fullScreen.removeClass('if-player-full-screen if-player-exit-full');
            if (self.fullScreenFlag) {
                //退出全屏
                var doc = document;
                var exitMethod = doc.exitFullscreen || doc.msExitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.webkitCancelFullScreen;
                exitMethod.call(doc);
                self.$fullScreen.addClass('if-player-full-screen');
                self.container.css({
                    width: self.normalWidth,
                    height: self.normalHeight
                });
            } else {
                //全屏
                var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

                requestMethod.call(element);
                self.$fullScreen.addClass('if-player-exit-full');
                self.normalWidth = self.container.width();
                self.normalHeight = self.container.height();
                self.container.css({
                    width: '100%',
                    height: '100%'
                });
            }
        }
    },

    //显示tip
    showTip: function(message) {
        var self = this;
        var $tip = self.$tip;
        $tip.fadeIn ? $tip.html(message).fadeIn(500) : $tip.show();
        self.tipTimer && clearTimeout(self.tipTimer);
        self.tipTimer = setTimeout(function() {
            $tip.fadeOut ? $tip.fadeOut(500) : $tip.hide();
        }, 1000);
    },
    setOptions: function(o) {
        var self = this;
        self.options = $.extend(self.options, o);
    },

    clickPlayCallback: function(){
        var isplay = !this.tech.paused();
        if(this.options && this.options.clickPlayCallback){
            this.options.clickPlayCallback(isplay);
        }
    },

    clickReplayCallback: function(){
        if(this.options && this.options.clickReplayCallback){
            this.options.clickReplayCallback();
        }
    },

    setBarPosition: function(){
        let self = this;
        let wr = self.container.find('.video-control-right').width();
        let wp = self.container.width();

        self.container.find('.video-control-left').width(wp-wr-10);
    }
};

module.exports = controller;
