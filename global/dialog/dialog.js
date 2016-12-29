/**
 * author: zhangyy-g@grandsoft.com.cn
 * description: dialog
 */
require('./dialog.css');

var Dialog = function(options) {
    var self = this
    self.__options = {
        width: 380,
        height: null,
        title: '',
        left: null,
        top: null,
        isScrollVisible: true,
        isTransparent: false,
        isFullScreen: false,
        showTitle: true,
        showFooter: true,
        cssClass: '',
        showClose: true,
        maskClickClose: false,
        message: '你木有事做吗？你真的木有事做吗？缅怀青春吧~',
        isFixed: true,
        denyEsc: false,
        modal: true,
        isMobile: false, //是否是移动端的弹层
        isAlert: false,
        isConfirm: false,
        okText: '确&nbsp;&nbsp;定',
        cancelText: '取&nbsp;&nbsp;消',
        okClass: '',
        cancelClass: '',
        okCallback: $.noop,
        cancelCallback: $.noop,
        closeCallback: $.noop
    };

    $.extend(self.__options, options);
    self.init();
}
Dialog.prototype = {
    init: function() {
        var self = this;
        //获得渲染页面
        var element = self.element = self.__getElement();
        this.bindEvent();

        //保持单例
        DialogManager.keepSingle(self);

        // 添加到页面
        $(document.body).append(element);

        // 定位
        this.__offset();

        //拖动
        this.__dragable();

        //是否显示关闭图标
        if (!self.__options.showClose) {
            self.find('.dialog-close').hide();
        }

        // 显示
        self.show();
    },

    //获得渲染页面
    __getElement: function() {
        var self = this;
        var options = self.__options;
        var message = options.message;

        var element = $(template.draw(tpl, options));
        var $content = element.find('.dialog-content');

        if (typeof message == 'string') {
            $content.html(message);
        } else {
            $(message).appendTo($content);
        }

        // 设置样式
        element.css({
            width: options.width
        });

        if (options.height !== null) {
            $content.css({
                height: options.height
            });
        }
        if (options.isFixed !== true) {
            element.css({
                position: 'absolute'
            });
        }

        options.cssClass && element.addClass(options.cssClass);

        if (options.isTransparent) {
            //如果要求透明
            element.addClass('dialog-transparent')
        }

        if (options.isMobile) {
            element.addClass('dialog-mobile');
        }

        return element;
    },

    //重新定位
    reLocation: function() {
        // 定位
        this.__offset();
    },

    __dragable: function() {
        var element = this.element
        element.draggable && element.draggable({
            containment: 'window',
            handle: '.header'
        });
    },

    //居中
    __offset: function() {
        var self = this,
            element = self.element,
            top = self.__options.top,
            left = self.__options.left,
            isFullScreen = self.__options.isFullScreen;

        if (isFullScreen) {
            self.element.width($(window).width());
            self.element.height($(window).height());
            self.element.find('.dialog-content').height($(window).height())
        }

        if (left == null) {
            left = ($(window).width() - self.element.width()) / 2;
            left = Math.max(0, left);
        }

        // 如果TOP没有指定 那么垂直居中
        if (top == null) {
            top = ($(window).height() - self.element.height()) / 3;
            top = Math.max(0, top);
        }

        // 如果元素不是fixed定位 那么加上滚动条距离
        if (this.element.css('position') != 'fixed' && self.isScrollVisible) {
            left += $(document).scrollLeft();
            top += $(document).scrollTop();
        }

        element.css({
            left: left,
            top: top
        });
    },

    //设置宽度
    setWidth: function(width) {
        var self = this
            // 设置样式
        self.element.css({
            width: width
        });
        self.__options.width = width;

        self.__offset();
    },

    //获得头部
    getHeader: function() {
        return this.find('.dialog-title');
    },

    //获得尾部
    getFooter: function() {
        return this.find('.dialog-footer');
    },

    //获得遮罩
    getMaskLayer: function() {
        return MaskLayer.getElement(this.__options);
    },

    //显示
    show: function() {
        var self = this
        if (self.__options.modal === true) MaskLayer.show(self.__options);
        self.__offset();
    },

    //关闭
    close: function(keepMask, btnType) {
        var self = this;
        !keepMask && MaskLayer.hide();
        var element = self.element;
        if (!element) return false;
        self.__options.closeCallback.call(self, btnType);
        element.remove();
        self.element = null;
    },

    //查找元素
    find: function(rule) {
        return this.element.find(rule);
    },

    //确认
    confirm: function() {
        var self = this;
        self.element.find('.footer .ok').trigger('click');
    },


    bindEvent: function() {
        var self = this
        self.find('.dialog-close').click(function() {
            self.close(false, 'closeBtn');
            return false;
        });

        self.find('.dialog-ok').click(function() {
            if (self.__options.okCallback.call(self) !== false) {
                self.close(false, 'okBtn');
            }
            return false
        });

        self.find('.dialog-cancel').click(function() {
            if (self.__options.cancelCallback.call(self) !== false) {
                self.close(false, 'cancelBtn');
            }
            return false
        });

        var contextProxy = function() {
            // 防止销魂元素后导致内存泄露（因为RESIZE事件是注册在WINDOW对象上 而不是ELEMENT元素上）
            if (!self.element || self.element.parent().size() === 0) {
                $(window).unbind('resize', contextProxy)
            } else if (self.element.is(':visible')) {
                self.__offset()
            }
        }
        $(window).resize(contextProxy)
    }
}

var tpl = '' +
    '<div class="mod-dialog">' +
    '   {{if showTitle}}<div class="dialog-title">{{title}}</div>{{/if}}' +
    '   {{if showClose}}<div class="dialog-close"></div>{{/if}}' +
    '   <div class="dialog-content"></div>' +
    '   {{if showFooter}}' +
    '       <div class="dialog-footer clearfix {{if isAlert}} footer-alert {{/if}}">' +
    '           {{if isConfirm}}' +
    '               <span class="dialog-ok {{okClass}}">{{okText}}</span>' +
    '               <span class="dialog-cancel {{cancelClass}}">{{cancelText}}</span>' +
    '           {{/if}}' +
    '           {{if isAlert}}' +
    '               <span class="dialog-ok {{okClass}}">{{okText}}</span>' +
    '           {{/if}}' +
    '       </div>' +
    '   {{/if}}' +
    '</div>';

//遮罩层
var MaskLayer = {
    getElement: function(options) {
        var self = this;
        options && self.element.attr('class', function(i, cls) {
            return 'mod-dialog-masklayer ' + options.cssClass + '-mask' });
        if (!self.element) {
            self.element = $('.mod-dialog-masklayer');
            if (self.element.size() == 0) {
                self.element = $('<div class="mod-dialog-masklayer"><iframe frameborder="0" width="100%" height="100%" style="z-index:1; position:absolute;"></iframe></div>').appendTo($(document.body));
            }
        }
        return self.element
    },
    show: function(options) {
        this.getElement(options).show()
    },
    hide: function() {
        this.getElement().hide()
    }
}

// 弹窗单例管理
var DialogManager = {
    present: null,

    keepSingle: function(dialog) {
        if (this.present instanceof Dialog) {
            this.present.close();
            this.present = null;
        }
        this.present = dialog;
        this.bindEvent();
    },

    escCancel: function(e) {
        if (e.keyCode == 27 && DialogManager.present) {
            var dialog = DialogManager.present;
            dialog.close();
        }
    },

    bindEvent: function() {
        $(document.body).keydown(this.escCancel);
        var iframe = MaskLayer.getElement().find('iframe');
        if (iframe.size() > 0) {
            var iframeBody = $(MaskLayer.getElement().find('iframe')[0].contentWindow.document.body);
            iframeBody.keydown(this.escCancel);
            var dialog = this.present;
            if (dialog && dialog.__options.maskClickClose) {
                iframeBody.click(function(event) {
                    dialog.close(false, 'mask');
                });
            } else {
                iframeBody.unbind('click');
            }
        }

        // this.bindEvent = $.noop;
    }
}

// export public method

var smallWidth = 320;

var alert = function(message, options) {
    var options = $.extend({
        width: smallWidth,
        isConfirm: false,
        isAlert: true,
        cssClass: 'dialog-alert',
        message: message
    }, options)
    return new Dialog(options);
}

var confirm = function(message, options) {
    var options = $.extend({
        width: smallWidth,
        isConfirm: true,
        cssClass: 'dialog-confirm',
        message: message
    }, options)
    return new Dialog(options);
}

var successDialog = function(message, options) {
    var message = '' +
        '<div class="success-wrap">' +
        '   <div class="success-bg"></div>' +
        '   <div class="success-txt">' + message + '</div>' +
        '</div>';
    var options = $.extend({
        showTitle: false
    }, options)
    return new alert(message, options);
}

var deleteDialog = function(message, options) {
    var message = '' +
        '<div class="delete-wrap">' +
        '   <div class="delete-bg"></div>' +
        '   <div class="delete-txt">' + (message || '您确定要删除吗？') + '</div>' +
        '</div>';
    var options = $.extend({
        showTitle: false,
        okClass: 'delete-btn'
    }, options);
    options.message = message;
    return new confirm(message, options);
}

var mobileDialog = function(options) {
    return new Dialog($.extend({
        isMobile: true,
        width: '2.44rem'
    }, options));
}
module.exports = {
    Dialog: Dialog,
    alert: alert,
    confirm: confirm,
    successDialog: successDialog,
    deleteDialog: deleteDialog,
    mobileDialog: mobileDialog
};
//使用方法
/*var dialog = new App.common.Dialog({
    //showTitle: false,
    //showFooter: false,
    //showTitle:false,
    //width: 800,
    title: '输入手机号',
    isConfirm: true,
    isAlert: false,
    message: '我是message,ssss',
    okText: '下一步',
    okClass: 'test',
    cancelText: '上一步',
    cancelClass: 'cancel',
    showFooter: true,
    showTitle: false,
    okCallback: function () {
        alert('ok')
        return false
    },
    cancelCallback: function () {
        alert('cancel')
    }
})*/
/*setTimeout(function() {
    dialog.close();
}, 2000)*/

/*new App.common.confirm('我是message',{
    //showTitle: false,
    //showFooter: false,
    showTitle: false,
    title: '输入手机号',
    okCallback: function () {
        alert('ok')
        return false
    },
    cancelCallback: function () {
        alert('cancel')
    }
})*/

/*new App.common.alert('我是message',{
    //showTitle: false,
    //showFooter: false,
    showTitle: false,
    title: '输入手机号',
    okCallback: function () {
        alert('ok')
        return false
    },
    cancelCallback: function () {
        alert('cancel')
    }
})*/

/*new App.common.successDialog('操作成功操作成功操作成功操作成功操作成功操作成功操作成功', {
    okCallback: function () {
        alert('ok')
        return false
    },
    cancelCallback: function () {
        alert('cancel')
    }
})*/

/*new App.common.deleteDialog({
    okCallback: function () {
        alert('ok')
        return false
    },
    cancelCallback: function () {
        alert('cancel')
    }
})*/
