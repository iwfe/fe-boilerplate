/*
 * @Author: wangnani
 * @Date:   2016-06-17 11:29:11
 * @Last Modified by:   yuqy
 * @Last Modified time: 2016-11-23 20:24:39
 */

'use strict';

require('./deal_list.scss');
var deal_history_tpl = require('./deal_history_tpl.html');
var house_list_tpl = require('./house_list_tpl.html');
//title 传进来 不传，title隐藏
// tab切换拿出去
// 房源详情页数据条数不满两条不显示
// 委托第二步骤:上月months =1
// isHide是干嘛的？等猜到坑再说吧
const actionName = pageConfig.staticTag == 'delegate_sub' ? '/delegate/ehs.action' : '/ehs.action';
var dealList = {
    API: function(key) {
        var rootPath = '';
        // rootPath = 'http://fe.superjia.com:8080/s/api/debug/f6d9ef';
        return {
            historyList: rootPath + actionName, //小区成交历史纪录
        }[key];
    },

    // 成交记录分页数据
    __dealPage: {
        page: 1,
        size: 5,
        total: 0
    },
    DECORATE: {
        1: '毛坯',
        2: '装修',
        3: '简装',
        4: '精装',
        5: '豪装'
    },

    init: function(container, options) {
        var self = this;
        // 上个月成交历史记录 months TODO
        // 
        var o = {
            title: '成交记录', //小区成交历史标题            
            houseData: {
                houseType: null,
                estateId: null,
                r: 0
            },
            dealPage: {
                page: 1,
                size: 5,
                total: 1
            }, //默认数据
            callback: $.noop
        }

        self.container = container;
        self.options = $.extend({}, o, options);
        self.initDom();
        self.getList(self.options);
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

        //新开页面点击查看更多
        container.on('click', '.history-loadmore', function() {
            var param = $.extend({}, options);
            self.getList(param);

        });

        container.on('click', '.dh-more-a', function() {
            var act_l = pageConfig.detail && pageConfig.detail.housecode ? 'house_detial' : 'estate_detial';
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 250,
                act_v: 'showAll',
                act_l: act_l
            })
        });
    },
    // 渲染外部Dom结构
    initDom: function() {
        var self = this,
            options = self.options,
            container = self.container;
        // 渲染外部模板，和总条数
        container.html(template.draw(deal_history_tpl, {
            data: options
        }))
    },

    //通用请求小区成交历史纪录的方法
    getList: function(param) {
        var self = this,
            options = self.options,
            container = self.container,
            $load_more = container.find('.history-loadmore');
        var params = {
            estateId: param.houseData.estateId,
            houseType: param.houseData.houseType,
            r: param.houseData.r,
            page: param.dealPage.page,
            size: param.dealPage.size,
            room: param.houseData && param.houseData.room || ''
        }
        if (param.months) {
            params.months = param.months;
        }
        $load_more.html('正在加载中');
        self.dealListAjax && self.dealListAjax.abort();
        self.dealListAjax = $.ajax({
            url: self.API('historyList'),
            data: params,
            success: function(d) {
                if (d.status == 1 && d.data && d.data.total > 0) {
                    var resource = {
                        total: d.data.total
                    };
                    resource.data = d.data.trades;
                    for (var i = resource.data.length - 1; i >= 0; i--) {
                        var decorateType = resource.data[i].decorateType;
                        if (decorateType) {
                            resource.data[i].decorateString = self.DECORATE[decorateType];
                        } else {
                            resource.data[i].decorateString = '—';
                        }
                    }
                    resource.estateId = options.houseData.estateId;
                    resource.houseType = options.houseData.houseType;
                    resource.r = options.houseData.r;
                    self.__dealPage.total = resource.totalPage = Math.ceil(resource.total / param.dealPage.size);
                    if(options.dealPage.page <= self.__dealPage.total){
                        options.dealPage.page += 1;
                    }
                    self.renderList(resource);
                } else {
                    self.renderList();
                }
                $load_more.html('查看更多');
            }
        })
    },
    renderList: function(list) {
        //todo 回调需要加个参数
        var self = this,
            options = self.options,
            container = self.container;
        if (list) {
            //渲染列表
            var list_html = template.draw(house_list_tpl, {
                data: list,
                page: options.dealPage.page,
                type: 'havedata'
            });
            container.find('.j-history-info').append(list_html);
            //总数量，当前页
            options.callback(list, options.dealPage.page);
        } else {
            //空提示
            var param = options.houseData.houseType == 1 ? '租房' : '二手房';
            container.html(template.draw(house_list_tpl, {
                data: param,
                type: 'nodata'
            }));
            options.callback(0);
        }

    }

}

module.exports = dealList;
