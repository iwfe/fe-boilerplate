/*
 * @Author: zhuxy
 * @Date:   2015-12-30 11:07:10
 * @Last Modified by:   zhuxy
 * @Last Modified time: 2016-03-24 12:43:01
 */

/**
 * 使用方法：
 * 重点是asset参数，具体数据结构详见组件。
    responsiveslide({
     startIndex:index + 1,
     autoGenerateHtml:true,
     asset: imgLists,
     isSupportKeyboard:true,
     tip:{
         active:true,
         message:'键盘←、→可查看上（下）一张图片~'
     },
     pagination:{
         active:true
     },
     callBack:{de
         closeCallback:function(data){

         }
     }
    });
 */
'use strict';

require('./responsiveslide.css');

var pluginName,
    defaults,
    supportsTransition;

pluginName = 'responsiveSlider';

defaults = {
    // 指定开始显示资源位置
    startIndex: 1,
    autoGenerateHtml: false,
    // 强制资源盛满屏幕
    forceSize: false,
    width: '',
    height: '',
    // 是否支持键盘
    isSupportKeyboard: false,
    // 是否支持触摸
    isSupportTouch: false,
    // 是否支持轮播
    isLoop: true,
    // 资源：图片，视频
    asset: [
        // {
        //     title: '图片说明',
        //     type: 'image',
        //     content: '123.jpg'
        // },
        // {
        //     title: '图片说明',
        //     type: 'video',
        //     content: '456.jpg'
        // },
        // {
        //     title:'文字说明',
        //     type:'txt',
        //     content:'这是文字内容'
        // },
        // {
        //     title:'文字说明',
        //     type:'txt',
        //     content:'img2.jpg'
        // },
        // {
        //     title:'文字说明',
        //     type:'html',
        //     content:'<p>this is html</p>'
        // },

    ],
    // 左右箭头
    navigation: {
        active: true,
        effect: "slide"
    },
    // 圆点页码导航
    pagination: {
        active: false,
        effect: "slide",
        maxLength: 0
    },
    pagenumber: {
        active: true,
        effect: "slide"
    },
    // 动画效果时间
    effect: {
        slide: {
            speed: 500
        },
        fade: {
            speed: 300
        }
    },
    tip: {
        active: false,
        messag: ''
    },
    callBack: {
        loaded: $.noop,
        start: $.noop,
        complete: $.noop,
        videoInit: $.noop,
        slide: $.noop,
        // 关闭弹窗回调
        closeCallback: function() {}
    }
};

// 检测是否支持transition
supportsTransition = (function() {
    var docBody = document.body || document.documentElement;
    var styles = docBody.style;
    var prop = "transition",
        vendors = [];

    if (typeof styles[prop] === "string") {
        return {
            isSupport: true,
            vendor: ''
        };
    }

    vendors = ["Moz", "webkit", "Khtml", "o", "ms"];
    // 转换transition -> Transition
    prop = prop.charAt(0).toUpperCase() + prop.substr(1);

    for (var i = 0; i < vendors.length; i++) {
        if (typeof styles[vendors[i] + prop] === "string") {
            return {
                isSupport: true,
                vendor: vendors[i]
            }
        }
    }
    return false;
})();

// 函数节流
function throttle(method, timer, context) {
    clearTimeout(method.flag);
    method.flag = setTimeout(function() {
        method.call(context);
    }, timer);
}

class Plugin{
    constructor(element, options) {
        var self = this,
            $slideLayout;

        self.options = $.extend(true, {}, defaults, options);
        self.element = element;
        self.$element = $(element);

        // 自动生成查看图片的骨架
        if (self.options.autoGenerateHtml) {
            $slideLayout = $(self.generateLayout());
            self.$element.append($slideLayout);
        }

        this.init();
    }
    init(){
        var self = this,
            width,
            height,
            left,
            top;

        self.animating = false;
        self.$sliderControl = self.$element.find('.slider-control');
        self.sliderTotal = self.$element.find('.slider-control').children().length;
        self.currentIndex = self.options.startIndex - 1;
        self.sliderWidth = self.$element.find('.slider-control').width();
        self.sliderHeight = self.$element.find('.slider-control').height();

        // 当前如果maxLength不为默认值0，则取得maxLength和本来数目的最小值，反之取本来数目
        var sliderLen = self.options.pagination.maxLength ?
            Math.min.call(self, self.options.pagination.maxLength, self.sliderTotal) :
            self.sliderTotal;

        self.sliderLen = sliderLen;

        width = self.options.width;
        height = self.options.height;

        top = height ? (self.sliderHeight - height) / 2 : 0;
        left = width ? (self.sliderWidth - width) / 2 : 0;

        // 全部隐藏
        var $sliderControl = $('.slider-control', self.$element),
            $sliderItems = $sliderControl.children();

        $sliderItems
            .css({
                position: 'absolute',
                zIndex: 0,
                display: 'none',
                top: 0,
                left: 0
            })
            .children()
            .css({
                width: width,
                height: height,
                position: 'absolute',
                top: top,
                left: left
            });

        $sliderItems
            .eq(self.currentIndex)
            .show()
            .css({
                zIndex: 5
            });


        self.loadContent(self.currentIndex);

        self.generateStuff();
        self.setActive();
        self.bindEvent();

        self.slideSwitch(self.currentIndex);
    }
    bindEvent() {
        var self = this,
            $sliderControl;

        $sliderControl = self.$sliderControl;

        // 方向键控制图片，只有一个图片时不绑定键盘事件
        if (self.sliderTotal > 1) {

            $(document).on('keydown', function(e) {
                if (!self.options.isSupportKeyboard) {
                    return false;
                }
                var keyValue = e.which;
                switch (keyValue) {
                    case 37:
                        self.prev();
                        break;
                    case 39:
                        self.next();
                        break;
                }
            });
        }

        // 只有一个图片时不绑定touch事件
        if (self.sliderTotal > 1 && self.options.isSupportTouch) {

            $sliderControl.on("touchstart", function(e) {
                return self.touchstart(e);
            });
            $sliderControl.on("touchmove", function(e) {
                return self.touchmove(e);
            });
            $sliderControl.on("touchend", function(e) {
                return self.touchend(e);
            });
        }

        if (self.options.isSupportTouch) {
            $sliderControl.on('click', function(e) {
                self.close();
            })
        }

        $(window).on('resize', function() {
            throttle(self.update, 1000, self);
        });
    }
    close() {
        this.options.dialog.close();
    }
    hidePagination() {
        var self = this,
            $sliderControl,
            $desc,
            $sliderPage;

        if (!self.options.pagenumber.active) {
            return
        }
        $sliderControl = self.$sliderControl;
        $desc = self.$pagenumber;
        $sliderPage = self.$element.find('.slide-pagination li');

        $sliderPage.each(function(index, element) {
            if ($(element).offset().left + $(element).width() > $desc.offset().left) {
                // if ($(element).offset().left + $(element).outerWidth() > $desc.offset().left) {
                $(element).addClass('hidden');
            } else {
                $(element).removeClass('hidden');
            }
        });
    }
    next() {
        var self = this;

        self.direction = 'next';
        self.slide();
    }
    prev() {
        var self = this;

        self.direction = 'prev';
        self.slide()
    }
    goto(index) {
        var self = this,
            $element,
            effect;

        $element = $(self.element);
        effect = self.options.pagination.effect;

        // 确保指定图片在合理区间
        if (typeof index === 'number') {
            if (index > self.sliderTotal) {
                index = self.sliderTotal;
            } else if (index < 1) {
                index = 1;
            }
        }

        self.slide(index);
    }
    slide(index) {
        var self = this,
            // 当前下标
            currentIndex,
            value,
            // 位移距离
            stepSize,
            // 下一个下标
            nextIndex,
            $sliderControl,
            prefix = '',
            timing,
            touches,
            transform,
            duration,
            css3slide;

        var time = 500;
        $sliderControl = self.$sliderControl;
        currentIndex = self.currentIndex;
        var options = self.options;
        var $element = self.$element;

        // 动画开关：指定位置与当前下标相等 或者 当前正在动画 则 return
        if (index === currentIndex + 1 || self.animating) {
            return
        }

        self.animating = true;

        if (index >= 1) {
            index = index - 1;
            value = index > currentIndex ? 1 : -1;
            stepSize = index > currentIndex ? -self.sliderWidth : self.sliderWidth;
            nextIndex = index;
        } else {
            value = self.direction == 'next' ? 1 : -1;
            stepSize = self.direction == 'next' ? -self.sliderWidth : self.sliderWidth;
            nextIndex = currentIndex + value;
        }

        self.slideSwitch(nextIndex);

        // 不轮播
        if (!self.options.isLoop && (nextIndex === -1 || nextIndex === self.sliderTotal)) {
            // 归位
            transform = prefix + "-webkit-transform";
            $sliderControl[0].style[transform] = "translateX(0px)";
            self.animating = false;
            return
        }

        if (nextIndex === -1) {
            nextIndex = self.sliderTotal - 1;
        }

        if (nextIndex === self.sliderTotal) {
            nextIndex = 0;
        }

        // 设置当前页面高亮
        self.setActive(nextIndex);

        // 把下一个图片放到指定位置：下一张放到当前图片右边，上一张放到当前图片左边
        self.$sliderControl.find('li').eq(nextIndex).css({
            display: 'block',
            left: value * self.sliderWidth,
            zIndex: 5
        });

        options.callBack.slide.call(self, nextIndex);
        if (supportsTransition.isSupport && self.options.isSupportTouch) {
            prefix = '';
            transform = prefix + "-webkit-transform";
            duration = prefix + "transitionDuration";
            timing = prefix + "transitionTimingFunction";

            $sliderControl[0].style[transform] = "translateX(" + stepSize + "px)";
            $sliderControl[0].style[duration] = time + "ms";

            // var tiemr = setTimeout(function(){
            //     if (!tiemr) return;
            // $sliderControl.on("transitionend webkitTransitionEnd",function() {
            css3slide = function() {
                // 动画完成之后加载内容
                self.loadContent(nextIndex);

                $sliderControl[0].style[transform] = "";
                $sliderControl[0].style[duration] = "";
                $sliderControl[0].style[timing] = "";

                $sliderControl.children().css({
                    // $sliderControl.children().eq(currentIndex).css({
                    display: "none",
                    left: 0,
                    zIndex: 0
                });

                $sliderControl.children().eq(nextIndex).css({
                    display: 'block',
                    left: 0
                });

                self.currentIndex = nextIndex;
                self.animating = false;

                $sliderControl.off('transitionend webkitTransitionEnd');

                self.setuptouch();
            }

            throttle(css3slide, 500, self);
            // });
        } else {
            $sliderControl.stop(true, true).animate({
                    left: stepSize
                },
                self.options.effect.slide.speed,
                function() {

                    // 动画完成之后加载内容
                    self.loadContent(nextIndex);

                    $sliderControl.css({
                        left: 0
                    });

                    $sliderControl.find('li').eq(nextIndex).css({
                        left: 0
                    });

                    $sliderControl.find('li').eq(currentIndex).css({
                        display: 'none',
                        left: 0,
                        zIndex: 0
                    });
                    self.animating = false;
                    self.currentIndex = nextIndex;
                }
            );
        }
    }
    slideSwitch(index) {
        var self = this;
        var $element = self.$element;
        var options = self.options;
        if (!options.isLoop) {
            if (index <= 0) {
                $element.find('.slider-prev').hide();
            } else {
                $element.find('.slider-prev').show();
            }

            if (index >= self.sliderTotal - 1) {
                $element.find('.slider-next').hide();
            } else {
                $element.find('.slider-next').show();
            }
        }
    }
    loadContent(index) {


        var self = this,
            items,
            $item,
            $currentItem,
            options = self.options;

        $currentItem = self.$sliderControl.children().eq(index);
        items = options.asset;
        if (!$currentItem.hasClass('slider-loaded')) {
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

                // $item.on('load', function() {
                //     $currentItem.addClass('slider-loaded');
                // });

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

                    // $cImg.on('load', function() {
                    //     $cItem.addClass('slider-loaded');
                    // });
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
    generateLayout() {
        var html = '',
            self = this,
            index,
            items,
            title;

        items = self.options.asset;

        html = '' +
            '<div class="responsive-slider">' +
            '    <div class="slider-container">' +
            '        <ul class="slider-control">';

        for (var i = 0, len = items.length; i < len; i++) {
            index = i + 1;
            title = items[i].title || '';

            html += '<li class="slider-item" ><div class="slide-content-wrap"></div></li>';
            // html += '<li class="slider-item"><p class="slider-desc"><span class="slider-title">' + title + '</span><span>' + index + '/' + len + '</span></p></li>';
        }

        html += '</ul></div></div>';

        return html;
    }
    setActive(index) {
        var self = this,
            $element,
            currentIndex,
            sliderLen,
            currentSlider;

        $element = $(self.element);
        sliderLen = self.sliderLen;
        currentIndex = index >= 0 ? index : self.currentIndex;
        $element.find('.slider-active').removeClass('slider-active');
        currentSlider = self.options.asset[currentIndex];

        self.$pagenumber && self.$pagenumber.find('.slider-title').text(currentSlider.title)
        self.$pagenumber && self.$pagenumber.find('.slider-index').text(currentIndex + 1);

        if (index > sliderLen - 1) {
            return
        }

        $element.find('.slide-pagination li:eq(' + currentIndex + ')').addClass('slider-active');
    }
    generateStuff() {
        var self = this,
            $element,
            $prevButton,
            $nextButton,
            $pagination,
            $pagenumber,
            $tip,
            sliderLen;

        $element = $(self.element);

        // 生成图片查看器提示
        if (self.options.tip.active && self.options.tip.message) {
            $tip = $('<div>', {
                    "class": 'slide-tip animated',
                    "html": '<div class="slide-tip-in">' + self.options.tip.message + '</div>'
                })
                .appendTo($element);

            // if (supportsTransition.isSupport) {
            //     $tip.addClass('bounceOutDown');

            //     setTimeout(function() {
            //         $tip.addClass('fadeOutUp');
            //     }, 2000);
            // } else {
            $tip.animate({
                top: 24
            }, 500).delay(1000).animate({
                top: -30
            }, 500);
            // }

        }

        // 生成左右箭头
        if (self.options.navigation.active && !self.options.isSupportTouch && self.sliderTotal > 1) {

            $prevButton = $('<a>', {
                    "class": 'slider-prev slide-navigation',
                    "href": '#',
                    "title": '',
                    "html": '<span class="iconfont">&#xd620;</span>'
                })
                .appendTo($element)
                .on('click', function(e) {
                    e.preventDefault();
                    return self.prev(self.options.navigation.effect)
                });

            $nextButton = $('<a>', {
                    "class": 'slider-next slide-navigation',
                    "href": '#',
                    "title": '',
                    "html": '<span class="iconfont">&#xd628;</span>'
                })
                .appendTo($element)
                .on('click', function(e) {
                    e.preventDefault();
                    return self.next(self.options.navigation.effect)
                });
        }

        // 生成圆点页码导航
        if (self.options.pagination.active) {
            // // 当前如果maxLength不为默认值0，则取得maxLength和本来数目的最小值，反之取本来数目
            sliderLen = self.options.pagination.maxLength ?
                Math.min.call(self, self.options.pagination.maxLength, self.sliderTotal) :
                self.sliderTotal;

            $pagination = $("<ul>", {
                "class": 'slide-pagination'
            }).appendTo($element);

            $.each(new Array(sliderLen), function(i) {
                var $paginationItem,
                    $paginationLink;

                $paginationItem = $('<li>', {
                        "class": 'pagination-item',
                        "slide-item-index": i
                    })
                    .appendTo($pagination)
                    .on('click', function(e) {
                        e.preventDefault();
                        self.goto($(this).attr('slide-item-index') * 1 + 1);
                    });

                $paginationLink = $("<a>", {
                        href: "#"
                    })
                    .appendTo($paginationItem)
            })
        }

        // 生成页码导航
        if (self.options.pagenumber.active) {
            self.$pagenumber = $pagenumber = $('<p class="slider-desc"><span class="slider-title"></span><span class="slider-index"></span>/<span class="slider-total">' + self.sliderTotal + '</span></p>')
            $pagenumber.appendTo($element);
        }

    }
    setuptouch() {
        var self = this,
            $element,
            currentIndex,
            next,
            previous,
            $sliderControl;

        currentIndex = self.currentIndex;
        $sliderControl = self.$sliderControl;

        next = currentIndex + 1;
        previous = currentIndex - 1;

        // 前一个越过第一个则重置为最后一个
        if (previous < 0) {
            // previous = self.sliderTotal - 1;
            $sliderControl.children().eq(next).css({
                display: "block",
                left: self.sliderWidth
            });
            return
        }
        // 后一个越过最后一个则重置为第一个
        if (next > self.sliderTotal - 1) {
            // next = 0;
            $sliderControl.children().eq(previous).css({
                display: "block",
                left: -self.sliderWidth
            });
            return
        }

        $sliderControl.children().eq(next).css({
            display: "block",
            left: self.sliderWidth
        });

        $sliderControl.children().eq(previous).css({
            display: "block",
            left: -self.sliderWidth
        });
    }
    update() {
        var self = this,
            $element = $(self.element);

        self.sliderWidth = $element.find('.slider-control').width();

        self.setuptouch();
        self.hidePagination();
    }
    setOptions(o) {
        this.options = $.extend(this.options, o);
    }
}

pluginName = function(options) {

    var instance = null;
    // 调用弹窗组件
    var agentDialog = new dialog.Dialog({
        width: $(window).width(),
        height: $(window).height(),
        isConfirm: false,
        isAlert: true,
        isTransparent: true,
        isFullScreen: true,
        cssClass: 'dialog-responsiveslide',
        message: '',
        showTitle: false,
        showFooter: false,
        closeCallback: function() {
            instance && options.callBack && options.callBack.closeCallback(instance.currentIndex);
        }
    });

    options = $.extend(true, options, {
        dialog: agentDialog
    })

    var target = agentDialog.find('.dialog-content').get(0);
    instance = new Plugin(target, options);

    return instance;
}

if (window.IWJW) {
    window.IWJW.responsiveslide = pluginName;
}
module.exports = pluginName;
