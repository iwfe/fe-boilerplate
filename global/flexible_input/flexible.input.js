/**
 * 可自定义长度的文本框
 * Created by lancui on 2015/7/7.
 * lancui@superjia.com
 * 使用：
 * <div class="unitbox1" style="border: 1px solid #ccc;width:107px;height:30px;">
 *   <span class="input-box" contenteditable="true" data-maxlen="6" autocomplete="off" style="white-space: nowrap;outline: none;"></span>
 * </div>
 *
 * 
 * <div class="unitbox house-info-dyh" data-maxlen="6" data-inputname="buildingDyh" data-unitname="单元" data-placeholder="输入单元号" data-notip="无楼号"></div>' +
 * 
 * js:
 * $('.unitbox').each(function () {
 *     new App.common.flexible($(this));
 * });
 * 
 */
'use strict'

require('./flexible.input.css');

var flexible = function(container, options) {
    var self = this;
    self.init(container, options);
};

flexible.prototype = {
    init: function(container, options) {
        var self = this;
        self.__container = container;
        //初始化参数
        var o = {
            useInput: !!container.data('use-input') ? container.data('use-input') : false, //是否需要input输入框,默认的span
            inputType: !!container.data('inputtype') ? container.data('inputtype') : 'text', //输入框类型
            maxlen: ~~container.data('maxlen'), //最大长度
            min: container.data('min'), //number的最小值
            max: container.data('max'), //number的最大值
            inputName: container.data('inputname'), //input框的名称
            unitName: container.data('unitname'), //单位显示
            placeholder: container.data('placeholder'), //placeholder显示
            noTip: container.data('notip'), //无数据时显示信息

            rule: container.data('rule'),
            reg: container.data('reg'),
            minvalue: container.data('minvalue'),
            maxvalue: container.data('maxvalue'),
            msg: container.data('msg'),

            renderCallback: $.noop, //渲染完元素的回调函数
            clickCallback: $.noop, //点击container的回调函数
            enabledCallback: $.noop, //setEnabled回调函数
            disabledCallback: $.noop //setDisabled回调函数
        };
        self.__options = $.extend({}, o, options);

        self.__initContent();

        self.__inputBox = container.find('.input-box');
        //绑定事件
        self.__bindEvent();
    },

    //初始化内部元素
    __initContent: function() {
        var self = this,
            $container = self.__container;
        var html = template.draw(unitBoxTpl, self.__options);
        $container.html(html);
        self.__options.renderCallback();
    },

    //绑定事件
    __bindEvent: function() {
        var self = this,
            $container = self.__container,
            $inputbox = self.__inputBox;

        $container.click(function(e) {
            $(this).find('.input-box').focus();
            return self.__options.clickCallback();
        });

        //input-box绑定输入事件
        var hasResize = 'onresize' in document.documentElement ? true : false;
        $container.find('.input-box, .input-box-span').keydown(function(e) {
            var kc = e.keyCode;
            if (kc == 13) { //回车
                return false;
            }
        }).bind('focus', function(e) {
            if (self.__options.useInput)
                self.__refresh(e);
            else
                self.__cursorEnd();
        }).on('keyup', function(e) {
            if (!hasResize) self.__refresh(e);
        }).on('input', function(e) { //适用除IE外的浏览器
            self.__refresh(e);
        }).on('blur', function(e) { //当blur再截取长度
            //self.__refresh(e);
            return false;
        }).on('resize', function(e) { //只适用IE
            if (hasResize) self.__refresh(e);
        });

        //绑定disabled事件
        $container.bind('setDisabled', function(e, v) {
            self.setDisabled(v);
        }).bind('setEnabled', function(e, v) {
            self.setEnabled(v);
        });
    },

    //监听设置UnitBoxs的长度
    __refresh: function(e) {
        var self = this,
            $unitbox = self.__container,
            $input = self.__inputBox;
        if (self.__options.useInput) { //输入框是input
            var $span = $unitbox.find('.input-box-span'),
                $pholder = $unitbox.find('.place-holder'),
                $unit = $unitbox.find('.unit');
            if (!!$input.val().length && $.trim($input.val()) != self.__options.noTip) { // 有内容
                if ($pholder) $pholder.hide();
                if ($unit) $unit.show();
            } else {
                if ($pholder && $span.css('display') != 'none') $pholder.show();
                if ($unit) $unit.hide();
            }

        } else if ($input.attr('contenteditable') != null) { //输入框不是input， contenteditable
            var text = $.trim($input.text()),
                kc = e.keyCode;
            //最大宽度
            var maxLen = self.__options.maxlen;
            if (text.length > maxLen - 1) {
                if (kc == 8 || kc == 46) return true;
                $input.text(text.substr(0, maxLen));
                self.__cursorEnd();
                return false;
            }

        }
    },

    //光标移动到最后
    __cursorEnd: function() {
        var self = this,
            range, selection, element = self.__inputBox[0];
        if (document.createRange) //Firefox, Chrome, Opera, Safari, IE 9+
        {
            range = document.createRange(); //Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(element); //Select the entire contents of the element with the range
            range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
            selection = window.getSelection(); //get the selection object (allows you to change selection)
            selection.removeAllRanges(); //remove any selections already made
            selection.addRange(range); //make the range you have just created the visible selection
        } else if (document.selection) //IE 8 and lower
        {
            range = document.body.createTextRange(); //Create a range (a range is a like the selection but invisible)
            range.moveToElementText(element); //Select the entire contents of the element with the range
            range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
            range.select(); //Select the range (make it the visible selection
        }
    },

    setDisabled: function(e, defaultVal) {
        this.__options.disabledCallback(defaultVal);
    },

    setEnabled: function(e, defaultVal) {
        this.__options.enabledCallback(defaultVal);
    }
};

var unitBoxTpl = '' +
    '{{if useInput}}' +
    '   <input type="{{inputType}}" name="{{inputName}}" class="input-box" {{if inputType=="number"}} min="{{min}}" max="{{max}}" {{/if}}  {{if inputType=="text"}} maxlength="{{maxlen}}" {{/if}}placeholder="{{placeholder}}" autocomplete="off" value=""  rule="{{rule}}" reg="{{reg}}" minvalue="{{minvalue}}" maxvalue="{{maxvalue}}" msg="{{msg}}">' +
    '   <span class="input-box-span"></span>' +
    '{{else}}' +
    '   <span class="input-box" contenteditable="true" data-maxlen="{{maxlen}}" autocomplete="off"></span>' +
    '   <input type="hidden" name="{{inputName}}" rule="{{rule}}" reg="{{reg}}" minvalue="{{minvalue}}" maxvalue="{{maxvalue}}" msg="{{msg}}">' +
    '{{/if}}' +
    '{{if placeholder}}<span class="place-holder">{{placeholder}}</span>{{/if}}' +
    '{{if unitName}}<span class="unit">{{unitName}}</span>{{/if}}' +
    '{{if noTip}}<span class="no-tip">{{noTip}}</span>{{/if}}';


module.exports = flexible;