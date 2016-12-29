/**
 * Created by zyy on 15/4/28.
 */
'use strict'
require('./gicon/gicon.css');
require('./find.list.scss');

var mapTmp = require('./mapcontent.html');
var firstTpl = require('./item.html');
var secondTpl = require('./seconditem.html');

var Find = function(param) {

    // 默认参数
    var defaults = {

        // 目标容器ID
        targetId: '',

        // 子集事件
        secondTrigger: 'mouseover',

        // line:地铁找房, area: 区域找房
        type: 'area',

        // 请求数据API
        api: '',

        // 图标
        icon: '',

        layout: '<div class="mod-find"><div class="find-first"></div><div class="find-second"></div></div>',

        // 截取过长字符串
        // 如果是false则不截取
        capture: 5,

        // 默认title
        dultText: '',

        provinceId: '2',

        ish5: false,

        // 数据源
        data: {},

        // 加载完数据后执行此函数
        callback: $.noop,

        // 选择事件之后会调用此事件
        select: $.noop,

        // 选择事件之后会调用此事件
        clickTitle: $.noop,

        map: false
    }

    this.options = $.extend(true, defaults, param);
    this.init();
}

// 原型函数
Find.prototype = {

    init: function() {
        // 接口
        var apis = {
            area: '/getCityAreas2.action',
            line: '/getCitySubwayLines.action',
            school: '/getCitySchool.action'
        };

        // 图标
        var icon = {
            area: '<div class="find-title"><i class="iconfont">&#xd605;</i>&nbsp;<span>区域</span></div>',
            line: '<div class="find-title"><i class="iconfont">&#xd62d;</i>&nbsp;<span>地铁</span></div>',
            school: '<div class="find-title"><i class="iconfont">&#xd62d;</i>&nbsp;<span>学区</span></div>'
        };

        var $target = '';
        var type = this.options.type || 'area';

        this.options.ht = pageConfig.ht;

        if (this.options.targetId) $target = $('#' + this.options.targetId);

        if (!this.options.icon) this.options.icon = icon[type];
        if (!this.options.api) this.options.api = apis[type];

        if (this.options.map) {
            this.options.layout = mapTmp;
            this.options.filter = pageConfig.map.filter;
        } else {
            this.options.filter = pageConfig[pageConfig.staticTag].filter;
        }

        this.$title = $(this.options.icon).prependTo($target);
        this.$list = $(this.options.layout).prependTo($target);

        // 第一层
        this.$first = this.$list.find('.find-first');

        // 第二层
        this.$second = this.$list.find('.find-second');

        if (this.options.map) {
            this.firstscroll = this.$first.find('.list-content');
            this.secondscroll = this.$second.find('.list-content');

            this.$first = this.$first.find('.list-wrap');
            this.$second = this.$second.find('.list-wrap');
        }

        this.childrenData = {};
        this.$target = $target;

        if (type == 'area') {
            this.options.fg = '1';
            this.options.eg = '2';
        }

        if (type == 'line') {
            this.options.fg = '4';
            this.options.eg = '5';
        }

        if (type == 'school') {
            this.options.fg = '7';
            this.options.eg = '8';
        }

        this.events();
        this.getData();
    },

    findItem: function(g, id) {
        try {
            var item = '';
            if (g) {
                g = g.toString();
                item = this.childrenData[g + id];
            }

            if (!item) {
                item = this.childrenData[this.options.fg + id];
            }

            if (!item) {
                item = this.childrenData[this.options.eg + id];
            }

            if (item) return item;
        } catch (e) {

        }

        return null;
    },

    active: function(id) {
        var $find = $('.mod-find');
        $find.find('.active').removeClass('active');
        $find.find('.item-hover').removeClass('item-hover');
        $find.parent().data('id', '');

        if (id) {
            this.$target.data('id', id);
            this.$first.find("li[data-id='" + id + "']").addClass('active').siblings().removeClass('active');
        } else {
            this.$first.find('active').removeClass('active');
        }

        return this;
    },

    upTitle: function(text, id) {
        if (text) this.$title.find('.find-title-txt').text(text);
        this.$target.data('id', id);
        return this;
    },

    showSecond: function(g, id) {
        var self = this;
        if (id) {
            setTimeout(function() {
                var item = self.childrenData[g + id];
                if (!item) return;

                if (item.pid) g = self.options.fg;
                var acid = item.pid || item.id;

                self.$target.data('id', id);
                self.renderDom(self.$list.find("li[data-gid='" + g + acid + "']"));
            }, 200);
        }
    },

    show: function(callback) {
        this.$list.show();
        callback && callback();
        return this;
    },

    hide: function(callback) {
        this.$list.hide();
        callback && callback();
        return this;
    },

    select: function(dom) {
        var self = this;
        var $dom = $(dom);
        var pid = $dom.data('pid');

        if ($dom.data('id') == 'all') {
            self.all = true;
            self.pid = pid;
            self.schoolAll = false;

            if ($dom.data('g') && $dom.data('g') == 6) {
                self.schoolAll = true;
            }
        } else {
            var title = '',
                id = '',
                isSub = false;

            if (this.options.type == 'line') {
                self.lineId = $dom.data('id');
                self.lineName = $dom.data('name');
                self.stationId = $dom.data('cid');
                self.stationName = $dom.data('cname');

                title = self.lineName;
                id = self.lineId;

                if (self.stationName) {
                    title = self.stationName;
                    id = self.stationId;
                    isSub = true;
                }

            }

            if (this.options.type == 'area') {
                self.areaId = $dom.data('id');
                self.areaName = $dom.data('name');
                self.townsId = $dom.data('cid');
                self.townsName = $dom.data('cname');

                title = self.areaName;
                id = self.areaId;

                if (self.townsName) {
                    title = self.townsName;
                    id = self.townsId;
                    isSub = true;
                }
            }

            if (this.options.type == 'school') {
                self.areaId = $dom.data('id');
                self.areaName = $dom.data('name');
                self.schoolId = $dom.data('cid');
                self.schoolName = $dom.data('cname');

                title = self.areaName;
                id = self.areaId;

                if (self.schoolName) {
                    title = self.schoolName;
                    id = self.schoolId;
                    isSub = true;
                }
            }

            self.all = false;
            self.lon = $dom.data('lon');
            self.lat = $dom.data('lat');
            self.isSub = isSub;
            self.selectName = title;

            this.upTitle(title, id);
        }

        this.options.select();
    },

    renderDom: function($dom) {
        var self = this;
        if (self.tim) clearTimeout(self.tim);

        if (self.options.map) {
            $dom.addClass('item-hover').siblings().removeClass('item-hover');
        } else {
            $dom.addClass('active').siblings().removeClass('active');
        }

        if ($dom.data('id') == 'all' && !$dom.data('pid')) {

            if (self.options.map) {
                self.$second.parents('.find-second').hide();
            } else {
                self.select(e.target);
                self.$second.hide();
            }
            return;
        }

        // if (e.target.nodeName == 'LI') {

        var index = $dom.index() - 1;
        var data = self.options.data[index];
        var dom = $dom.find('.fn-sublist');

        self.concealSublist();

        if (data) {
            var subdata = data.subList || data.list;
            if (data.branchList) {
                for (var i in data.branchList) {
                    var branch = data.branchList[i];
                    subdata = subdata.concat(branch.subList);
                }
            };

            self.secondRender($dom, subdata);
        }
        //}
    },

    // 事件绑定
    events: function() {
        var self = this;
        if (!this.$target) return;

        var $target = this.$target;

        $target.on('click', '.find-point', function(e) {
            self.select(e.target);
        });

        $target.on(self.options.secondTrigger, '.list-item', function(e) {
            if (!self.options.map) {
                self.select(e.target);
            } else {
                self.renderDom($(e.target));
            }
        });

        if (this.options.map && !self.options.mapAreaLine) {

            $target.on({
                'mouseover': function(e) {
                    if (self.tim) clearTimeout(self.tim);
                    if (!self.$list.is(":hidden")) return;
                    // var id = $target.data('id');
                    var filter = pageConfig.map.range;
                    var ops = self.options;

                    if (filter.rid && (filter.rg == ops.fg || filter.rg == ops.eg) ) {
                        var item = self.findItem(filter.rg, filter.rid);
                        if (item) {
                            var acid = item.pid || item.id;
                            self.$first.find("li[data-id='" + acid + "']").addClass('active').siblings().removeClass('active');
                        }
                    }

                    self.$list.show();
                    self.mapScrollbar('first');
                },

                'mouseout': function(e) {
                    self.tim = setTimeout(function() {
                        self.$list.hide();
                        if (self.options.map) {
                            $target.find('.item-hover').removeClass('item-hover');
                            self.$second.parents('.find-second').hide();
                        }
                    }, 200);
                }
            });

            $target.on('click', '.list-item', function(e) {
                var $dom = $(this);
                $target.find('.item-hover').removeClass('item-hover');
                $($dom).addClass('active').siblings().removeClass('active');
                self.select(e.target);
            });
        }

        if(self.options.mapAreaLine){

            $target.on({
                'mouseover': function(e) {
                    if (self.tim) clearTimeout(self.tim);
                },

                'mouseout': function(e) {
                    self.tim = setTimeout(function() {
                        if (self.options.map) {
                            $target.find('.item-hover').removeClass('item-hover');
                            self.$second.parents('.find-second').hide();
                        }
                    }, 200);
                }
            });

            $target.on('click', '.list-item', function(e) {
                var $dom = $(this);
                $target.find('.item-hover').removeClass('item-hover');
                $($dom).addClass('active').siblings().removeClass('active');
                self.select(e.target);
            });
        }


    },

    // 获取元数据
    getData: function() {
        var self = this;
        var data = {};

        // 临时兼容H5
        if (this.options.ish5) {
            data.provinceId = this.options.provinceId;
        } else {
            data.p = this.options.provinceId;
            data.ht = this.options.ht;
        }

        $.ajax({
            url: this.options.api,
            data: data,
            cache: true,
            dataType: 'json',
            success: function(res) {
                var data, type = self.options.type;

                if (res) {
                    if (type == 'area' || type == 'school') data = res;
                    if (type == 'line') data = res.data;

                    for (var i in data) {
                        var item = data[i];
                        self.childrenData[self.options.fg + item.id] = item;

                        // 判断是否有支线
                        if (item.branchList) {
                            for (var bl in item.branchList) {
                                var branch = item.branchList[bl];
                                for (var blsl in branch.subList) {
                                    branch.subList[blsl].pid = branch.parentId;
                                    self.childrenData[self.options.eg + branch.subList[blsl].id] = branch.subList[blsl];
                                }

                            }
                        };

                        if (self.options.type == 'area' || self.options.type == 'line') {
                            for (var c in data[i].subList) {
                                if (self.options.type == 'line') {
                                    self.childrenData[self.options.eg + data[i].subList[c].id] = data[i].subList[c];
                                } else {
                                    if (data[i].subList[c].towns) {
                                        for (var t in data[i].subList[c].towns) {
                                            data[i].subList[c].towns[t].pid = data[i].id;
                                            data[i].subList[c].towns[t].pname = data[i].name;
                                            self.childrenData[self.options.eg + data[i].subList[c].towns[t].id] = data[i].subList[c].towns[t];
                                        }
                                    };
                                }
                            }
                        }

                        // 学区
                        if (self.options.type == 'school') {
                            for (var s in data[i].list) {
                                self.childrenData[self.options.eg + data[i].list[s].id] = data[i].list[s];
                            }
                        }
                    }

                    self.options.data = data;
                    self.options.callback(data);
                    if (self.options.targetId) self.render();
                }
            }
        });
    },

    // 渲染主模板
    render: function() {

        var self = this;
        var html = template.draw(firstTpl, {
            data: this.options.data,
            type: this.options.type,
            list: !this.options.map,
            g: this.options.fg
        });

        this.$first.html(html);
    },

    // 渲染滚动条
    mapScrollbar: function(type) {
        if (!this.options.map) return;

        var self = this;
        _.delay(function(){
            if (type == 'first') {
                iwjw.tinyscrollbar(self.firstscroll);
            } else {
                iwjw.tinyscrollbar(self.secondscroll);
            }
        }, 200)
    },

    // 选择次模板
    secondRender: function($dom, data) {
        if (this.options.map) {
            this.$second.parents('.find-second').show();
        } else {
            this.$second.show();
        }

        // 添加全部
        var data = $.extend([], data);
        var ops = this.options;
        var self = this;
        var prtId = $dom.data('id');
        var dg = $dom.data('g');
        var prtName = $dom.data('name');

        var html = '';
        var filter = this.options.filter;

        // 兼容地图
        if (this.options.map) {
            filter = $.extend({}, pageConfig.map.range || {});
            filter.id = filter.rid;
            filter.g = filter.rg;
        }

        var acid = filter.id;
        // 如果当前的g不等于最后一级的g则清空
        if (filter.g != ops.eg && acid == prtId && (filter.g == ops.fg || filter.g == ops.eg)) {
            acid = '';
        }

        html = template.draw(secondTpl, {
            data: data,
            type: this.options.type,
            prtId: prtId,
            prtName: prtName,
            acid: acid,
            cg:filter.g,
            g: this.options.eg
        })

        this.$second.html(html);
        this.mapScrollbar('second');
    },

    concealSublist: function() {
        this.$list.find('.fn-sublist').hide();
    },

    mapReady: function(){
        let self = this;

        if(self.options.mapAreaLine){
            var filter = pageConfig.map.range;
            var ops = self.options;


            if (filter.rid && (filter.rg == ops.fg || filter.rg == ops.eg) ) {
                var item = self.findItem(filter.rg, filter.rid);
                if (item) {
                    var acid = item.pid || item.id;
                    self.$first.find("li[data-id='" + acid + "']").addClass('active').siblings().removeClass('active');
                }
            }

            self.mapScrollbar('first');
        }
    }
}

module.exports = Find;
