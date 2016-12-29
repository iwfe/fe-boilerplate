/*
 * @Author: vavid
 * @Date:   2015-11-25 15:25:30
 * @Last Modified by:   yuqy
 * @Last Modified time: 2016-05-06 11:35:12
 */
'use strict';

require('./nav.css');
var navData = require('./nav.json.js');
var navTpl = require('./nav.html');

var nav = function(container, options) {
    var self = this;
    self.__init(container, options);
    return {
        leftPanel: self.leftPanel,
        rightPanel: self.rightPanel
    };
};

nav.prototype = {
    top: 16,
    leftPanel: null,
    rightPanel: null,
    __init: function(container, options) {
        var self = this;
        var o = {
            data: navData, // 导航数据
            activeFilter: pageConfig.staticTag, // 高亮条目
            navClass: '', // 导航样式
            needRender: true //是否需要渲染模板
        }
        self.container = container;
        self.options = $.extend({}, o, options);
        self.__events();
        self.__render();
    },
    __events: function() {
        var self = this,
            container = self.container;

        container.on('mouseenter', '.left-nav-item', function() {

            var $dom = $(this);
            self.moveNavPanel($dom.index());

        }).on('mouseleave', '.left-nav-item', function() {

            var $dom = $('.left-nav-item.active');
            self.moveNavPanel($dom.index());

        }).on('click', '.nav-logout', function() {

            $('.user-item-logout').trigger('click');

        });

        $(window).on('scroll', function() {
            var scrTop = $(this).scrollTop(),
                leftPanel = self.leftPanel,
                modTop = container.offset().top,
                modHeight = container.height(),
                leftHeight = self.leftPanel.outerHeight();

            if (scrTop > modTop) {
                if ((scrTop + leftHeight) >= (modHeight + modTop)) {
                    leftPanel.removeClass('nav-fixed').addClass('nav-abs');
                } else {
                    if (leftPanel.hasClass('nav-fixed')) return;
                    leftPanel.addClass('nav-fixed').removeClass('nav-abs');
                }
            } else if (scrTop == modTop) {
                leftPanel.removeClass('nav-fixed nav-abs');
            } else {
                leftPanel.removeClass('nav-fixed');
            }

        });

        container.on('click', '.nav-payorder', function(){
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 220,
                act_v: 'myorder'
            })
        })
    },

    __render: function() {
        var self = this,
            container = self.container,
            options = self.options,
            $dom;

        if (options.needRender) {
            container.html(template.draw(navTpl, {
                data: options.data,
                filter: options.activeFilter
            }));
        }
        self.leftPanel = container.find('.iwjw-left');
        self.rightPanel = container.find('.iwjw-right');

        self.moveNavPanel($('.left-nav-item.active', container).index('.left-nav-item'));

    },
    moveNavPanel: function(index) {
        var self = this;
        $('.j-nav-label', self.container).removeClass('hide').css('top', self.top + index * 65 + 'px');
    }
}



module.exports = function(container, options) {
    return new nav(container, options);
}
