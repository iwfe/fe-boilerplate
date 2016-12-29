/*
 * @Author: yilizhang
 * @Date:   2016-4-19 18:52:51
 * @Email:  zhangyili.sh@superjia.com
 * @Last Modified by:   lizongqing
 * @Last Modified time: 2016-11-16 19:50:58
 */
'use strict';
var FilterData = require('houseJson');
var tpl = require('./filter.html');
require('./filter.scss');
import filterKey from './key.js';
var ORIGINDATA;

var Filter = function(container, param) {

    // 默认参数
    var defaults = {
        ht: 2, // 1: rend, 2: sell
        p: 2, // 上海
        filter: {},
        needRender: true,
        filterAllHeightlight: false
    };

    this.container = container;
    this.options = $.extend(true, defaults, param);
    this.init();
};

Filter.prototype = {
    // 这里没有kw
    modFilterKey: filterKey, // filter组件相关key
    rendered: false,
    init: function() {
        var self = this,
            options = self.options;

        self.events();


        if (options.needRender) self.render(); // 渲染组件
        else self.__setFilter(options.filter); // 渲染筛选条件面板
    },

    // 渲染组件
    render: function() {
        let self = this,
            more,
            container = self.container,
            options = self.options,
            prices = pageConfig[pageConfig.staticTag].prices;

        let ht = self.ht = options.ht;
        let source = FilterData.rent;


        if (ht == 1) {
            more = source.slice(3);
            source = source.slice(0, 3);
        } else {
            source = FilterData.sell;

            if (prices) {
                let pSource = prices[options.p];
                if (pSource) source[0].values = pSource;

            }
            more = source.slice(4);
            source = source.slice(0, 4);
        }

        source.push({
            "name": "more",
            "alias": "more",
            "text": "更多",
            "style": "more",
            "values": more
        });

        ORIGINDATA = source;

        var html = template.draw(tpl, {
            tplType: 'filter',
            data: source,
            ht: ht
        });

        container.html(html);
        self.rendered = true;
        self.$saInp = container.find('[name=sa]');
        self.$eaInp = container.find('[name=ea]');
        self.$more = container.find('.filter-more');

        self.__setFilter(self.filter);
    },

    events: function() {
        var self = this;
        var timer;
        var container = self.container;

        //自定义输入框 焦点事件
        container.on('focus click', '.custom-input', function() {
            $(this).siblings('.custom-btn').show();
        });

        container.on('blur', '.custom-input', function() {
            var $dom = $(this),
                val = $dom.val(),
                filter = self.options.filter,
                $btn = $dom.siblings('button');

            if (!global.isNum(val) || (val != 0 && ~~val == 0)) $dom.val('');

            var $inp = $dom.parent().find('.custom-input');

            var inpVal1 = ~~($.trim($inp.eq(0).val())),
                inpVal2 = ~~($.trim($inp.eq(1).val()));

            if (inpVal2 && inpVal1 > inpVal2) {
                $dom.siblings('input').val('');
            }

            if (inpVal1 == '' && inpVal2 == '' && !filter.sa && !filter.ea) {
                $dom.siblings('button').hide();
            }

            $(document).one('click', function(evt) {
                let $target = $(evt.target),
                    parentAlias = $btn.data('parent');
                // 非input和button
                if ($target.data('parent') != parentAlias && !$target.siblings('button[data-parent=' + parentAlias + ']').length) $btn.hide();
            });

        });

        //自定义值 提交事件
        container.on('click', '.custom-btn', function() {
            var $dom = $(this),
                data = {},
                name;
            var $input = $dom.siblings('.custom-input');
            // var $wrap = $dom.closest('.filter-select'),

            for (var i = 0; i < $input.length; i++) {
                var $curInput = $input.eq(i),
                    val = $.trim($curInput.val());
                name = $curInput.attr('name');
                data[name] = val;
            }

            // 自定义价格时清空ip
            if (name == 'sp' || name == 'ep') {
                data['ip'] = -1;
            }


            $.jps.trigger('filter-data-result', $.extend({}, data, { alias: (name == 'sp' || name == 'ep') ? 'sp' : 'sa' }));

            self.setFilter(data);
        });

        // 下拉框点击
        container.on('click', '.select-item', function() {
            var $dom = $(this),
                data = {},
                $wrap = $dom.closest('.filter-select'),
                alias = $wrap.data('alias'),
                val = $dom.data('value'),
                filter = self.options.filter;

            data[alias] = val > 0 ? val : '';

            // 选中价格清除自定义价格
            if (alias == 'ip') {
                if (filter.sp) data.sp = '';
                if (filter.ep) data.ep = '';
            }

            // 选中面积清除自定义面积
            if (alias == 'ia') {
                if (filter.sa) data.sa = '';
                if (filter.ea) data.ea = '';
            }

            $.jps.trigger('filter-data-result', $.extend({}, data, { alias: alias, txt: $.trim($dom.text()) }));
            self.setFilter(data);
        });

        // 复选框点击
        container.on('click', '.checkbox-item', function() {
            var $dom = $(this),
                data = {},
                $wrap = $dom.closest('.filter-multi'),
                alias = $wrap.data('alias'),
                arr = [];

            //日志
            var selectTxtArr = [];

            if ($dom.hasClass('checked')) {
                $dom.removeClass('checked').find('.iconfont').toggleClass('if-box if-check-bold');
            } else {
                $dom.addClass('checked').find('.iconfont').toggleClass('if-box if-check-bold'); //.find('.iconfont').html('&#xd615;');
            }

            $wrap.find('.checked').each(function(_, i) {
                arr.push($(i).data('value'));
                selectTxtArr.push($.trim($(i).text()));
            });

            if (!arr.length) arr = [];

            // self.checkBoxActive(sel.index('.filter .filter-multi'), arr.join(','));

            data[alias] = arr.join(',');

            $.jps.trigger('filter-data-result', $.extend({}, data, { txt: selectTxtArr.toString(), alias: alias }));
            self.setFilter(data);
        });

    },

    loadData: function(item, opts) {
        let self = this,
            options = self.options,
            oldFilter = options.filter,
            newFilter = item.filter,
            keys = [];

        options.ht = item.ht || options.ht;
        options.p = item.p || options.p;
        opts = opts || {};

        if (opts.needRender || (!self.rendered && opts.needRender === undefined)) {
            options.filter = newFilter || oldFilter;
            self.render();
            return;
        }

        // 对比router更新前后有变化的key值
        _.each(_.intersection(self.modFilterKey, _.union(_.keys(oldFilter), _.keys(newFilter))), function(key) {
            // 新增key、移除key、值改变key
            if (oldFilter[key] != newFilter[key]) {
                keys.push(key);
            }
        });
        if (keys.length) {
            options.filter = $.extend({}, newFilter);
            self.processRouter(keys);
        }
    },

    setFilter: function(data) {
        var self = this;

        $.jps.trigger('filter_change', data);
        self.__setFilter(data);
    },

    __setFilter: function(data) {
        var self = this,
            filter = self.options.filter;

        filter = $.extend(true, filter, data);

        var keys = [],
            filterKey = _.keys(filter);

        _.each(self.modFilterKey, function(key) {
            if (filterKey.indexOf(key) != -1) keys.push(key)
        });

        if (keys.length) self.processRouter(keys);
    },

    processRouter: function(keys) {
        var self = this,
            filter = self.options.filter,
            container = self.container,
            // kw = filter.kw,
            ip = filter.ip ? parseInt(filter.ip) : -1,
            sp = filter.sp ? parseInt(filter.sp) : '',
            ep = filter.ep ? parseInt(filter.ep) : '',
            // ia = filter.ia,
            sa = filter.sa || '',
            ea = filter.ea || '',
            arr = ['ip', 'sp', 'ep', 'ia', 'sa', 'ea'];

        if (!keys || keys.length) {
            // 售价筛选
            if (_.intersection(keys, ['ip', 'sp', 'ep']).length) {
                if (ip > 0) {
                    sp = '', ep = '';
                }

                self.selectActive('ip', ip, sp, ep);
            }

            // 面积清空筛选
            if (_.intersection(keys, ['ia', 'sa', 'ea']).length){
                self.clearCustomIa(sa, ea);
            }
            // if (_.intersection(keys, ['ia', 'sa', 'ea']).length) {
            //     self.clearCustom('ia', ia, sa, ea);
            // }

            // 其他筛选
            _.each(_.difference(keys, arr), function(key) {
                var $dom = container.find('.ft-' + key);
                if (!$dom[0]) return;
                var fnName = $dom.hasClass('filter-single') ? 'selectActive' : 'checkBoxActive',
                    val = filter[key],
                    val = val ? val : '';
                self[fnName](key, val);
            });
        }

        container.find('[name=sa]').val('' || sa);
        // self.$eaInp.val('' || ea);
    },

    /**
     * @param key 索引key,对应alias
     * @param val 当前筛选条件value
     * @param start 自定义区间最小值
     * @param end 自定义区间最大值
     */
    selectActive: function(key, val, start, end) {
        var self = this,
            ht = self.options.ht,
            txt;
        var $item = $('.filter-single.ft-' + key, this.container);
        if (!$item.length) return;
        //if (val == '') return false;
        var $dt = $item.find('.filter-dt');

        if (!(start == '' && end == '') && (start >= 0 || end >= 0)) {

            //售价单位万，面积单位m²
            var unit = ht == 2 ? '万' : '元';
            if (key == 'ia') unit = 'm²';

            //自定义区间，格式为xx-yy万(m²)或者xx万(m²)以上
            txt = (!start && start != 0) ? '0' : start;
            txt += (!end && end != 0) ? unit + '以上' : '-' + end + unit;
            val = -1;
            $item.addClass('selected');

        } else {
            if (val == -1 || !val) { //选择全部
                txt = $dt.data('txt');
                $item.removeClass('selected').find('.filter-opts').children().removeClass('active');
                if (self.options.filterAllHeightlight)
                    $item.addClass('selected').find('.filter-item[data-value=' + val + ']').addClass('active');
            } else {
                var $selected = $item.addClass('selected').find('.filter-item[data-value=' + val + ']');
                txt = $selected.text();
                // $item.addClass('selected');
                $selected.addClass('active').siblings().removeClass('active');
            }
        }

        $dt.text(txt);
    },

    /**
     * @param key 索引key,对应alias
     * @param opts 当前筛选条件value
     */
    checkBoxActive: function(key, opts) {
        var opt = opts ? opts.toString().split(',') : opts;
        var $item = $('.filter-multi.ft-' + key, this.container),
            $dd = $item.find('.filter-num');

        if (!$item.length) return;

        if (!opt || opt == -1) {
            $item.removeClass('selected');
            $dd.html('');
            $item.find('.checkbox-item.checked').each(function(index, el) {
                $(this).removeClass('checked').find('.iconfont').addClass('if-box').removeClass('if-check-bold ');
            });
        } else if (opt.length) {
            $item.find('.checkbox-item').each(function(i, el) {
                let $chk = $(this);
                if (opt.indexOf($chk.data('value').toString()) != -1) {
                    $chk.addClass('checked').find('.iconfont').addClass('if-check-bold').removeClass('if-box');
                } else {
                    $chk.removeClass('checked').find('.iconfont').addClass('if-box').removeClass('if-check-bold');
                }
            });

            $item.addClass('selected');
            $dd.html('(' + opt.length + ')');
        }
    },

    clearCustomIa: function(sa, ea){
        var self = this,
            ht = self.options.ht;
        var $item = $('.ft-ia', this.container);
        if (!$item.length) return;

        if(sa == ''){
            $('.custom-input[name="sa"]', this.container).val('');
        }

        if(ea == ''){
            $('.custom-input[name="ea"]', this.container).val('');
        }

        // if(sa == '' || ea == ''){
        $item.find('.custom-btn').hide();
        // }

    }
}

// 把数组 转为 文本值
Filter.prototype.getKeyText = function(data, _origindata){
    let newData = {};
    var odata = {};
    if(_origindata){
        ORIGINDATA = _origindata;
    }

    if(data.ea > 0 && data.sa>=0) {
        newData['saea'] = data.sa + '-' + data.ea;
    }

    if(!data.sa && data.ea > 0){
        newData['saea'] = "不限-" + data.ea;
    }

    if(data.sa > 0 && !data.ea){
        newData['saea'] = data.sa + "-不限";
    }

    if(data.ep > 0 && data.sp>=0) {
        newData['ip'] = data.sp + '-' + data.ep + '万';
        delete data.ip;
    }

    if(data.ep > 0 && !data.sp) {
        newData['ip'] = data.ep + '万以下';
        delete data.ip;
    }

    if(!data.ep && data.sp > 0) {
        newData['ip'] = data.sp + '万以上';
        delete data.ip;
    }

    // 转为obj
    ORIGINDATA.map(function(item){
        if(item.alias == 'more'){
            item.values.map(function(item){
                odata[item.alias] = {};
                item.values.map(function(i){
                    odata[item.alias][i.key] = i.txt;
                });
            });
        }else{
            odata[item.alias] = {};
            item.values.map(function(i){
                odata[item.alias][i.key] = i.txt;
            });
        }
    });

    function isNone(str){
        return (str === '' || str === undefined || str === null)
    }

    function getVal(str, list){
        str = '' + str;
        if(!list) return ;
        var l = str.split(',');
        return l.map(function(item){
            if(list[item])
                return list[item];
            else
                return
        }).join(',')
    };

    for(var key in data){
        if(!isNone(data[key])){
            newData[key] = getVal(data[key], odata[key]);
        }
    }
    return newData;
}

$.jps.on('filter-data-result', function(data) {
    let alias = data.alias,
        txt = data.txt;

    // for log
    switch (alias) {
        case 'ia':
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 61,
                act_v: txt
            });
            break;
        case 'sa':
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 61,
                act_v: data.sa + '-' + data.ea
            });
            break;
        case 'ip':
            $.jps.trigger('log', {
                type: 'filter',
                rental: txt
            });
            break;
        case 'rn':
            $.jps.trigger('log', {
                type: 'filter',
                bedroom: txt
            })
            break;
        case 'fl':
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 65,
                act_v: txt
            })
            break;
        case 'dt':
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 63,
                act_v: txt
            })
            break;
        case 'ag':
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 64,
                act_v: txt
            })
            break;
        case 'fe':
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 62,
                act_v: txt
            });
            break;
    }

});
module.exports = Filter;
