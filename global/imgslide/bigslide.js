/*
 * @Author: jade
 * @Date:   2016-03-07 14:55:50
 * @Last Modified by:   huangxiaogang
 * @Last Modified time: 2016-06-23 17:17:43
 * @Last Modified content:  移除播放器父节点必须有#imgslide的限制，在options中增加useOwnVideo接口,优化player播放
 */

'use strict';
var responsiveslide = require('responsiveslide');
var iwVideo = require('iwVideo');
var browser = global.browser;
var isIE8 = browser.msie && browser.version == '8.0';

var bigslide = {
    init: function(container, options) {
        var self = this;
        self.container = container;
        self.options = $.extend({
            closeCallback: $.noop
        }, options);
    },
    popUpPicLayer: function(index) {
        var imgLists = [];
        var self = this;
        var container = self.container;
        var options = self.options;

        //移除父节点必须是imgSlide的限制
        var hasVideo = container.find('.videoBtn').size() != 0;

        if(options.useOwnVideo && hasVideo){
           //
        }else {
            if (hasVideo) {
                index = index - 1;
            }
        }
        /**
         * 增加一个从原来图片数组中取数据的方式
         * 兼容房屋委托页面,将逻辑仅仅相关于委托详情页面
         */
        if(options['imgArr']){
            for(var i=0;i<options['imgArr'].length;i++){
                /*适配爱屋吉屋自己的播放器*/
                var cache = options['imgArr'][i];
                let isVideo = cache.houseVideo&&cache.houseVideo.url;
                let type = isVideo?'iwVideo':"image";
                let title= isVideo?'':"";// 去除视频文字
                let content = isVideo? cache:cache['defaultPic'];
                imgLists.push({
                    title:title,
                    type:type,
                    content:content
                });
            }
        }else{
            /**
             * 在没有后端数据源的情况下，渲染dom节点中的小图
             */
            container.find('.slide-item').each(function(index, ele) {
                var imgObj = {};
                var $this = $(this);
                imgObj.title = '';
                imgObj.type = "image";
                imgObj.content = $this.find('.house-img').attr('src');
                imgLists.push(imgObj);
            });
        }

        //var message = '键盘←、→可查看上（下）一张图片~';
        var message = '';
        //if (isBigPlayer && player && player.isPlayed() && index == 0) {
        //    message = '键盘←、→可控制视频的快进后退'
        //}
        /**
         * slideKey仅仅是对房源详情页，针对已经初始化的大图做的配置。在委托页面使用，可以直接设置为true
         */
        var slideKey =false;
        /**
         * 切换图片执行顺序说明
         * 0. isSupportKeyboard: 在点击左右键盘的时候是入口判断节点
         * 1. slide.prev()
         * 2. callback.slide()
         * 3. 动画执行
         *
         */
        var slide = self.slide = responsiveslide({
            startIndex: index + 1,
            autoGenerateHtml: true,
            asset: imgLists,
            isSupportKeyboard: slideKey,
            isLoop: false,
            tip: {
                active: true,
                message: message
            },
            pagination: {
                active: true,
                maxLength: 30
            },
            callBack: {
                //关闭大图模式，房源详图片定位到刚才关闭的图片
                closeCallback: function(data) {
                        if (hasVideo) {
                            //处理没有视频的情况
                            data++;
                        }
                    //下面的代码仅仅针对详情页面，点击缩小的操作，委托页面可以忽略
                        if (isIE8) {
                            //解决IE8下关闭大图情况下设置
                            //player && player.setOptions && player.setOptions({
                            //    isRootEle: true
                            //});
                        }
                    options.closeCallback(data);
                },
                /**
                 * 使用爱屋吉屋自己的播放器
                 * @param $item 视窗
                 * @param data  imgList中push 的数据
                 */
                iwVideoInit:function($item, data){
                    /**
                     * 修改为absolute布局
                     */
                    $item.prepend('<p style=" position: absolute;top: 0;left: 0;width: 100%;z-index: 990;height: 100%;background: black"><p>');
                    var containerNode = $item.find('p').eq(0);
                    var player = new iwVideo(containerNode, {
                        autoPlay: false,
                        rootEle: $('.responsive-slider'),//用于挂载进度条切换事件
                        // src: 'http://house-video.kssws.ks-cdn.com/14651978969256655266-transcoding?response-content-type=video/mp4'
                        src: data.content['houseVideo']['standardPlayUrl'],
                        type: 0,//全屏显示
                        isFirstPanoramic: 0,
                        FD_firstImg: data.content['defaultPic'],
                        /**
                         * 检测播放状态
                         * @param isPlay
                         */
                        playCallback: function(isPlay) {},
                    });
                    self.container.iwPlayer = player;
                },
                slide: function(index) {
                    /**
                     * 目前第一个是视频，只要是第一个就劫持掉keydown的冒泡事件
                     * 维持冒泡，去掉return
                     */
                    if(self.container.iwPlayer){
                        //第一个播放器节点为判断节点
                        var boolean = index==0;//是否是播放器
                        var _player = self.container.iwPlayer;
                        if(_player){
                            //不是播放器页面，则关闭播放器
                            (!boolean) && _player.pauseVideo();
                            //播放器左右键盘冒泡事件占第一页
                            _player.setOptions({
                                isRootEle: boolean
                            });
                        }
                    }
                }
            }
        });
    },

    playVideo: function(isPlay) {
        var self = this;

        if (!self.slide) return false;
        if (isPlay) {
            //如果是播放状态，则大图组件键盘操作失效
            self.slide.setOptions({
                isSupportKeyboard: false
            });
        } else {
            //如果是暂停状态，则大图组件键盘操作不失效
            self.slide.setOptions({
                isSupportKeyboard: true
            });
        }
    },

    close: function() {
        var self = this;
        if (!self.slide) return false;
        self.slide.close();
    }
};

module.exports = bigslide;