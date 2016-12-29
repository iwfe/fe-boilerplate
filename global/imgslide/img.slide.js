/**
 * Created by liyaping on 2015/7/17.
 * liyaping@superjia.com
 * @last modified by huangxiaogang 2016.6.23
 * @last modified content : 将left的计算值，兼容手动点击配置的left值
 */

'use strict';
require('./img.slide.css')
var pageConfig = window.pageConfig;
var IWJW = iwjw;
var imgSlide = function(container, options) {
    var self = this;
    self.__init(container, options);
};
var staticUrl = pageConfig.staticUrl;
var videoBtnImg = iwjw.videoBtnImg;
var paraVideoBtn = iwjw.videoPanaromaBtnImg;

var stop = true;

imgSlide.prototype = {
    __container: null,
    __options: null,
    __base: {
        baseWidth: null, // 单个幻灯片宽带与2张幻灯片之间的间距之和
        marginLeft: null, // 2张幻灯片之间的间距
        total: null, // 幻灯片集合中幻灯片数量
        totalPage: null, //幻灯片集合可滚动页数
        visWidth: null // 单次滚动的偏移像素
    },

    __init: function(container, options) {
        var self = this;
        self.__container = container;

        var o = {
            imgCss: '.house-img',
            showCount: 1,
            isLoop: false,
            sumCount: 0,
            items: null,
            index: 0,
            showVideo: false,
            showBtn: false,
            showPageTag: false,
            itemTpl: '',
            successCallback: $.noop,
            errorCallback: $.noop,
            clickCallback: $.noop
        }
        self.__options = $.extend({}, o, options);

        self.__events();

        if (self.__options.items) self.__render(self.__options.items);
        /**
         * return self，作为接口方便对外引用
         */
        return self;

    },

    __events: function() {
        var self = this;
        var container = self.__container;
        var options = self.__options,
            showCount = options.showCount,
            showVideo = options.showVideo,
            base = self.__base;

        container.on('click', '.pic-left', function() {

            var $dom = $(this);
            //临时fixed代码
            self.cntMoveVal($dom);

            var $slide = $dom.parent().find('.pic-slide');
            var left = parseInt($slide.css('left').split('px')[0], 10);

            if ((options.sumCount <= showCount) || (!options.isLoop && left == 0)) return;
            if (options.sumCount > showCount) {
                container.find('.pic-right').removeClass('hide');
            }

            if (stop) {
                stop = false;
                $('#youkuPlayer').hide();
                var visWidth = base.visWidth; //一次切换的移动量
                // console.log('左移动' + visWidth)
                // console.log(base)
                //需要循环时先移动到最后一页
                if (left == 0) {
                    left = -visWidth * (base.totalPage - 1);
                    $slide.css('left', left + 'px');
                }

                var index = Math.floor(-left / visWidth) + 1;

                var joinStr = showCount * (index - 2) == 0 ? ',' : '';
                //修改为第一次就替换所有的
                // $slide.find(options.imgCss).filter(':lt(' + showCount * (index - 1) + ')' + joinStr + ':gt(' + (showCount * (index - 2) - 1) + ')').each(function() {
                //     IWJW.changeSrc($(this), options);
                // });
                //兼容点击操作
                $slide.animate({
                    left: (left + visWidth)>0?0:(left + visWidth) + 'px'
                }, "normal", function() {
                    if ((left + visWidth == 0) && showVideo && $('#youkuPlayer').html() != '') $('#youkuPlayer').show();
                    if (options.showPageTag) container.find('.page-tag').find('.slide-cur-page').html(index - 1);
                    stop = true;
                });
            };

        });

        container.on('click', '.pic-right', function() {
            var $dom = $(this);

            //临时fixed代码
            self.cntMoveVal($dom);

            var $slide = $dom.parent().find('.pic-slide');

            $('#youkuPlayer').hide();
            var left = parseInt($slide.css('left').split('px')[0], 10),
                visWidth = base.visWidth, //一次切换的移动量
                sumCount = options.sumCount;

            var index = Math.floor(-left / visWidth) + 1;


            //totalPage为总的占屏数

            if (index >= base.totalPage - 1) {
                container.find('.pic-right').addClass('hide');
            } else {
                container.find('.pic-right').removeClass('hide');
            }

            if ((sumCount <= showCount) || (!options.isLoop && index == base.totalPage)) return;

            if (stop) {
                stop = false;

                /**
                 *   新增finalLeft优化滑动逻辑
                 *   如果差1屏，则用slider的总距离来滑动
                 */
                var sliderLength = $slide.width();

                var  finalLeft = index===base.totalPage-1 ? visWidth-sliderLength:left - visWidth;



                $slide.animate({
                    left: (finalLeft) + 'px'
                }, "normal", function() {
                    // 如果移动到显示的元素是复制出的则回到第一页
                    if (options.isLoop && index == base.totalPage - 1) {
                        // $slide.find(options.imgCss).filter(':lt(' + showCount + ')').each(function() {
                        //     IWJW.changeSrc($(this), options);
                        // });
                        $slide.css('left', 0);
                        if (options.showPageTag) container.find('.page-tag').find('.slide-cur-page').html(1);
                    } else {
                        if (options.showPageTag) container.find('.page-tag').find('.slide-cur-page').html(index + 1);
                    }
                    stop = true;
                });
            }
        });

        container.on('click', '.house-a', function() {
            var callback = options.clickCallback;
            callback && callback();
            if ($(this).find('.videoBtn').length) self.showPlayer();
        });
    },

    __render: function(data) {
        var self = this,
            options = self.__options,
            container = self.__container,
            base = self.__base,
            showCount = options.showCount,
            index = options.index;
        options.sumCount = data.length;
        if (options.itemTpl) imgItemTpl = options.itemTpl;
        var html = template.draw(imgItemTpl, {
            data: data,
            defaulfHouseImg: iwjw.loadingImg,
            videoBtnImg: videoBtnImg,
            paraVideoBtn: paraVideoBtn
        });
        container.html(wrapTpl);

        var $slide = container.find('.pic-slide');
        $slide.html(html);




        var $items = $slide.find('.slide-item');

        // 图片只有一页时隐藏左右按钮
        if (data.length <= showCount && !options.showBtn) {
            container.find('.pic-left').addClass('hide');
            container.find('.pic-right').addClass('hide');
        }

        // 如果幻灯片可轮播，复制元素
        if (options.isLoop && data.length > showCount) {
            // TODO 如果支持循环且总图片非单次显示图片的整数，在最后一页填充空白li占位
            var lastPageCount = data.length % showCount;
            if (lastPageCount != 0) {
                var addItem = '';
                for (var i = 0; i < (showCount - lastPageCount); i++) {
                    addItem += '<li class="slide-item"></li>';
                }
                $slide.append(addItem);
            }
            // 复制第一页至最后
            $items.filter(':lt(' + showCount + ')').clone().appendTo($slide);
        }

        var $item = $items.first();
        var width = $item.outerWidth();
        var ml = base.marginLeft = $item && $item.css('margin-left')?parseInt($item.css('margin-left').split('px')[0], 10):0;
        var total = base.total = $slide.find('.slide-item').length;
        base.baseWidth = width = width + ml;
        base.visWidth = width * showCount;
        var totalPage = total / showCount;
        base.totalPage = totalPage == Math.ceil(totalPage) ? totalPage : Math.ceil(totalPage)

        $item.addClass('ml0');

        //这里增加了可以添加border的距离
        $slide.width(width * total - ml+total*2);

        var curPage = Math.floor(index / showCount) + 1;
        $slide.css('left', -(curPage - 1) * base.visWidth);

        // 筛选项lt>0、gt<0 无结果,且必须选筛选lt再筛选gt
        var joinStr = showCount * (curPage - 1) == 0 ? ',' : '';
        container.find(options.imgCss).each(function() {
            IWJW.changeSrc($(this));
        });
        if (options.showPageTag) {
            container.append(pageTpl);
            var $page = container.find('.page-tag');
            var realTotalPage = options.sumCount / showCount;
            realTotalPage = realTotalPage == Math.ceil(realTotalPage) ? realTotalPage : Math.ceil(realTotalPage)
            $page.find('.slide-cur-page').html(curPage);
            $page.find('.slide-total-page').html(realTotalPage);
            $page.removeClass('hide');
        }
        if (options.showVideo) {
            container.prepend(youkuTpl)
            if (index == 0) self.showPlayer();
        }
    },

    // 播放视频
    showPlayer: function() {
        var self = this,
            options = self.__options,
            container = self.__container;
        var $video = container.find('.videoBtn');

        if (options.showVideo && $video.length) {
            var youkuId = 'youkuPlayer';
            $('#' + youkuId).show();
            IWJW.addYoukuPlayer(youkuId, $video.data('code'));
        }
    },
    cntMoveVal: function($dom) {
        var self = this;
        var options = self.__options,
            showCount = options.showCount,
            base = self.__base;
        var $picWrap = $dom.closest('.pic-slide-wrap').find('.pic-wrap');
        if ($picWrap.width() < 960) {
            if ($picWrap.width() == 640) {
                base.visWidth = 640;
                base.marginLeft = 0;
            } else {
                base.visWidth = 835;
                base.marginLeft = 7;
            }
            base.total = $picWrap.find('li').length;
            var totalPage = base.total / showCount;
            base.totalPage = totalPage == Math.ceil(totalPage) ? totalPage : Math.ceil(totalPage);
        }
    },
    getHtml: function() {
        return this.__container.html();
    }
};

var youkuTpl = '<div id="youkuPlayer"></div>'

var wrapTpl = '' +
    '<div class="pic-slide-wrap">' +
    '   <em class="pic-left unselectable iconfont">&#xd620;</em>' +
    '   <em class="pic-right unselectable iconfont">&#xd628;</em>' +
    '   <div class="pic-wrap">' +
    '       <ul class="pic-slide clearfix"></ul>' +
    '   </div>' +
    '</div>';

var pageTpl = '<div class="page-tag hide"><i class="slide-cur-page"></i>/<i class="slide-total-page"></i></div>';

var imgItemTpl = '' +
    '{{each data as item i}}' +
    '   <li class="slide-item">' +
    '       <a {{if item.houseDetailUrl}}href="/{{item.houseDetailUrl}}"{{/if}} data-code="{{item.houseCode}}" data-title="{{data.title}}" target="_blank" class="house-a">' +
    '           <img src="' + iwjw.loadingImg + '"' +
    '               data-src="{{item.defaultPic}}" alt="{{item.estateName}}" class="house-img" data-need-resize = "auto">' +
    '           {{if item.houseVideo && item.houseVideo.videoType == 0}}' +
    '               <i class="videoBtn">' +
    '                   <img src="' + videoBtnImg + '"></i>' +
    '           {{/if}}' +
    '           {{if item.houseVideo && item.houseVideo.videoType == 1}}' +
    '               <i class="videoBtn para-video-btn">' +
    '                   <img src="' + paraVideoBtn + '"></i>' +
    '           {{/if}}' +
    '       </a>' +
    '   </li>' +
    '{{/each}}';

module.exports = imgSlide;
