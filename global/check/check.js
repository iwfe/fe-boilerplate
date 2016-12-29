/**
 * Created by lancui on 2015/7/13.
 * lancui@superjia.com
 * <label class="mod-check-box"><input type="checkbox"/></label>
 * <label class="mod-check-box"><input type="radio"/></label>
 * checkbox 使用说明：
 * $('.mod-check-box', self.container).each(function () {
 *     new checkbox($(this),callback); callback为选中之后的回调
 * })
 * 
 */

'use strict'

require('./check.css');
var checkbox = function(container, options) {
    var self = this;
    self.init(container, options);
}

checkbox.prototype = {
    icons: {
        radio_false: '&#xd650;',
        radio_true: '&#xd646;',
        checkbox_false: '&#xd651;',
        checkbox_true: '&#xd615;',
        // 实心的checkbox
        checkbox_solid_true:'&#xd436;',
        checkbox_solid_false:'&#xd651;'
    },

    init: function(container, options) {
        var self = this,
            $input = container.find('input');
        self.__container = container;
        var o = {
            type: $input.attr('type'),
            eventName: 'click', //注册的事件名称
            isChecked: $input.attr('checked'),
            isDisabled: container.hasClass('disabled') ? true : false,
            isSolid:false,
            callback: $.noop
        };
        options = self.__options = $.extend({}, o, options);


        if (o.isChecked) container.addClass('checked');
        if (!container.find('em').size()) container.prepend('<em class="iconfont">' + self.__getIcon() + '</em>');

        self.__initEvent();
    },

    __getIcon: function() {
        var self = this,
            container = self.__container,
            solid = '';

        solid = self.__options.isSolid ? 'solid_' : solid;

        return self.icons[self.__options.type + '_' + solid + container.hasClass('checked')];
    },

    __initEvent: function() {
        var self = this,
            container = self.__container,
            options = self.__options,
            eventName = options.eventName,
            $input = container.find('input');
        container.bind(eventName, function() {
            if (container.hasClass('disabled') || container.attr('disabled') == 'disabled') return false;

            //radio,先将所有选项不选
            if (self.__options.type == 'radio') {
                $('.mod-check-box.checked input[name="' + $input.attr('name') + '"]').each(function() {
                    var $box = $(this).parent();
                    $box.removeClass('checked');
                    $box.find('em').html(self.__getIcon());
                    $box.find('input').prop('checked',false);
                    // $box.find('input').removeAttr('checked');
                });
            }

            container.toggleClass('checked');
            container.find('em').html(self.__getIcon());
            container.hasClass('checked') ? $input.prop('checked', true) : $input.prop('checked',false);
            // container.hasClass('checked') ? $input.attr('checked', 'checked') : $input.removeAttr('checked');

            options.callback(container);
            return false;

        }).bind('checked', function(e, isChecked) {
            !!isChecked ? container.addClass('checked') : container.removeClass('checked');
            container.find('em').html(self.__getIcon());
            container.hasClass('checked') ? $input.attr('checked', 'checked') : $input.removeAttr('checked');
        });
    }
};

module.exports = checkbox;
