/**
 * author: zhangyy-g@grandsoft.com.cn
 * description: small 
 */
/**提示smallnot**/
require('./smallnote.css');
var SmallNote = function(opt) {

    var self = this;
    this.timer = null;
    this.options = $.extend({
        top: 0,
        time: 3000,
        pattern: null,
        text: '加载中...',
        hold: false,
        remove: false,
        mask: false,
        callback: ''
    }, opt);

    var element = this.element = $('<div class="mod-smallnote">' + this.options.text + '</div>');

    if (global.browser.isMobile && !global.browser.isPad) element.addClass('smallnote-mobile');

    element.on('click', function() {
        self.__targetHide();
        self.options.callback && self.options.callback();
    });

    if (this.options.mask) {
        this.mask = $('<div id="mask" class="mask"></div>');
        $(document.body).append(this.mask)
        this.mask.on('click', function() {
            self.__targetHide();
            self.options.callback && self.options.callback();
        });
    }

    // 额外的定制样式 目前支持的只有一种： error
    // 如果传递额外的类型 需要自行定义style, 需要注意的是class会自动添加前缀：supernatant-[pattern]
    if (this.options.pattern !== null) {
        element.addClass('smallnote-' + this.options.pattern);
    }

    // 保持单例
    if (SmallNote.present) {
        clearTimeout(this.timer);
        SmallNote.present.__remove();
    }

    //remove:true，直接删掉
    if (!this.options.remove) {
        SmallNote.present = this;
        $(document.body).append(element);
        element.css({
            'margin-left': -element.width()/2
        });
        if (!this.options.hold) {
            // 启用销毁定时器
            this.__destroyTimer();
        }
    }
};
SmallNote.prototype = {
    __destroyTimer: function() {
        var that = this;
        this.timer = setTimeout(function() {
            that.__remove();
            that.options.callback && that.options.callback();
        }, this.options.time);
    },
    __remove: function() {
        this.mask && this.mask.remove();
        this.element && this.element.remove();
    },
    __targetHide: function() {
        clearTimeout(this.timer);
        var self = this;
        self.__remove();
    }

};

function smallnote(text, options) {
    var o;
    if (options) {
        options.text = text;
        o = options;
    } else {
        o = {
            text: text
        };
    }
    new SmallNote(o);
}

module.exports = smallnote;
