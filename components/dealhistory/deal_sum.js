/*
 * @Author: wangnani
 * @Date:   2016-06-17 11:28:55
 * @Last Modified by:   wangnani
 * @Last Modified time: 2016-06-21 11:16:05
 */

'use strict';
require('./deal_sum.scss');
var house_sum_tpl = require('./house_sum_tpl.html');
var dealSum = {
    API: function(key) {
        var rootPath = '';
        // rootPath = 'http://fe.superjia.com:8080/s/api/debug/f6d9ef';
        return {

            houseSum: rootPath + '/ehSummary.action', //房屋数量统计

        }[key];
    },

    init: function(container, options) {
        var self = this;
        var o = {
            title: '', //标题
            showEstateName: false,
            houseData: {
                houseType: null,
                estateId: null,
                r: 0
            },
            callback: $.noop,
            clickCallback: $.noop
        }

        self.container = container;
        self.options = $.extend({}, o, options);
        self.getHouseSumList();

        self.events();

    },
    logField: {
        '0': 'all',
        '1': 'num1',
        '2': 'num2',
        '3': 'num3',
        '4': 'more4'
    },
    events: function() {
        var self = this,
            container = self.container,
            options = self.options;

        container.on('click', '.dh-lr:not(.dark-0)', function(event, flag) {
            var $dom = $(this),
                sum = $dom.data('sum'),
                r = $dom.data('r');
            $dom.addClass('active').siblings().removeClass('active');
            
            //手动点击筛选再埋点
            if (!flag) {
                var act_l = pageConfig.detail && pageConfig.detail.housecode ? 'house_detial' : 'estate_detial';
                $.jps.trigger('log', {
                    type: 'clickEvent',
                    act_k: 250,
                    act_v: self.logField[r],
                    act_l: act_l
                })
            }
            options.clickCallback($dom);
        })
    },

    //获取小区房屋结构统计
    getHouseSumList: function(callback) {
        var self = this,
            container = self.container,
            options = self.options;

        var param = null;
        param = $.extend({}, options.houseData);

        self.__dealSumAjax && self.__dealSumAjax.abort();
        self.__dealSumAjax = $.ajax({
            url: self.API('houseSum'),
            data: param,
            success: function(d) {
                if (d.status == 1) {
                    var resource = d.data;
                    var d_array = [];
                    resource.v_total = ' ' + resource.total + ' 套';
                    resource.v_r1 = ' ' + resource.r1 + ' 套';
                    resource.v_r2 = ' ' + resource.r2 + ' 套';
                    resource.v_r3 = ' ' + resource.r3 + ' 套';
                    resource.v_r4 = ' ' + resource.r4 + ' 套';
                    resource.title = options.title;
                    self.renderHouseSumList(resource);
                    var callback = options.callback;
                    callback && callback(resource);
                }
            }
        })
    },

    renderHouseSumList: function(data) {
        var self = this,
            container = self.container,
            options = self.options;
        var sum_html = template.draw(house_sum_tpl, {
            data: data
        });
        container.html(sum_html);
    }
}

module.exports = dealSum;
