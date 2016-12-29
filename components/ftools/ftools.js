/*
 * @Author: enzo
 * @Date:   2016-03-08 16:25:40
 * @Last Modified by:   yuqy
 * @Last Modified time: 2016-08-29 15:46:18
 */
 /*目前地图页、二手房租房新房列表页使用此组件*/
'use strict';
var tpl = require('./ftools.html');
var FilterData = require('houseJson');
require('./ftools.scss');

var tools = {
    singleKeys: {}, // 单选key集合
    multiKeys: {}, // 多选key集合
    init: function(container, options) {
        var self = this;
        self.container = container;
        self.options = options;
        var map={
            '1':'rent',
            '2':'sell',
            '3':'newhouse'
        };
        var sourceData = self._sourceData = FilterData[map[options.ht]];
        _.map(sourceData, function(obj, index) {
            self[obj.style + 'Keys'][obj.alias] = index;
        });
        self.events();
    },
    events: function() {
        var self = this;
        // 清除筛选条件
        self.container.on('click', '.fo-del', function() {
            var $dom = $(this).closest('.ftools-dd')
            var alias = $dom.data('alias');
            var data = {};

            data[alias] = '';

            if (alias == 'rg') {
                data.rid = '';
            }

            if (alias == 'ia') {
                data.sa = '';
                data.ea = '';
            }

            if (alias == 'kw') {
                data.rg = '';
                data.rid = '';
                data.g = '';
                data.id = '';
            }

            if (alias == 'ip') {
                data.sp = '';
                data.ep = '';
            }

            if(alias == 'g'){
                data.id = '';
            }

            if (alias == 'fe') {
                let delVal = $dom.data('bv');
                let options = self.options;
                data.fe = options[options.staticTag].filter[alias].split(',').filter(item => item != delVal).toString();
                // var bvl = $('.checkbox-item.checked').length;
                // if (bvl > 1) data[alias] = $(this).data('bv') == 1 ? 2 : 1;
                // $('.checkbox-item[data-value=' + $dom.data('bv') + '].checked').trigger('click');

                // $.jps.trigger('log', {
                //     type: 'clickEvent',
                //     act_k: 68,
                //     act_v: $dom.find('span').html(),
                //     act_l: 'map'
                // });
                // return;
            }

            var act_v = $dom.find('span').html();
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 68,
                act_v: act_v,
                act_l: pageConfig.staticTag && pageConfig.staticTag == 'map' ? 'map' : 'list'
            });

            $.jps.trigger('router-go', data);
        });

        self.container.on('click', '.ftools-follow', function() {
            // 同一条件不能重复点击
            var $dom = $(this);

            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 360,
                act_v: JSON.stringify({
                    type: self.followParam.g,
                    id: pageConfig.map && pageConfig.map.filter && pageConfig.map.filter.id,
                    act: 1
                }),
                act_l: 'map'
            });
            // 按钮被隐藏、已点过、用户未登录都不可点
            // if ($dom.hasClass('hide') || $dom.hasClass('disable') || !(pageConfig.visitor && pageConfig.visitor.user && pageConfig.visitor.user && pageConfig.visitor.user.uname)) return false;
            if ($dom.hasClass('hide') || $dom.hasClass('disable')) return false;

            $.jps.trigger('update-follow', {
                item: $dom,
                param: self.followParam,
                successCallback: function() {
                    $dom.addClass('disable');
                    if (self.followId) {
                        $.jps.trigger('list-est-follow', self.followId, true);
                        $.jps.trigger('map-est-follow', self.followId, true);
                    }
                    // smallnote('关注成功,可在关注列表查看最新上架房源');
                    $('.mine-item-follow').append('<i class="mine-follow-suc">+1</i>');
                    setTimeout(function() {
                        $('.mine-follow-suc').addClass('animate');
                        setTimeout(function() {
                            $('.mine-follow-suc').remove();
                        }, 1000)
                    }, 100);
                }
            });
        });

        // 清除所有筛选条件
        self.container.on('click', '.ftools-remove', function() {

            var selectArr = self.select;
            var collectSel = [];
            if (selectArr) {
                for (var i = 0; i < selectArr.length; i++) {
                    collectSel.push(selectArr[i].txt);
                }
            }

            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 69,
                act_v: JSON.stringify(collectSel),
                act_l: pageConfig.staticTag && pageConfig.staticTag == 'map' ? 'map' : 'list'
            })

            $.jps.trigger('router-go');
        });
    },
    make: function(options, findItem, kwResult) {

        var self = this;

        options = self.options = options || self.options;
        findItem = self.findItem = findItem || {};
        kwResult = self.kwResult = kwResult || {};

        var staticJson = options[options.staticTag];
        var filter = staticJson.filter;
        var range = staticJson.range;
        self.select = []; // 初始化时重置已选择参数
        // self.followParam ={}; // 初始化时重置follow参数
        if((/^[\\|\/]$/g).test(staticJson['highLight'])){
            return false;
        }
        if (filter.kw) {
            self._search(filter.kw);
        } else {
            self._find(options);
        }
        self.setFollowParam();
        self._single(filter);

        self._multi(staticJson);

        self._inputs(filter);

        self._render();

    },

    setFollowParam: function() {
        var self = this;
        var options = self.options;
        var staticTag = options.staticTag;
        var staticJson = options[staticTag];
        var filter = staticJson.filter;

        var follow = self.followParam = { p: options.provinceId, ht: options.ht };
        self.canFollow = false;
        self.followId = null;

        if (staticTag == 'map') {
            var range = staticJson.range,
                rg = range.rg;


            if (!_.isEmpty(filter)) {
                follow.filter = $.extend({}, filter);
                delete follow.filter.g;
                delete follow.filter.id;
                delete follow.filter.kw;
                delete follow.filter.o;
                delete follow.filter.nos;
            }

            if ((rg == 2 || rg == 4 || rg == 5) && range.rid) {
                self.canFollow = true;
                follow.g = rg;
                // follow.id = range.rid;
                follow.code = self.findItem.code;
                follow.name = self.findItem.name;

                if (rg == 5) {
                    follow.parentId = self.findItem.pid;
                    follow.parentName = self.findItem.pname;
                }

                if (rg == 2) follow.parentName = self.findItem.pname;

            } else if (filter.kw && !rg) {
                var kwResult = self.kwResult;
                if (kwResult && kwResult.code && kwResult.g == 3) {
                    self.canFollow = true;
                    follow.g = kwResult.g;
                    // follow.id = kwResult.id;
                    self.followId = kwResult.id;
                    follow.code = kwResult.code;
                    follow.name = kwResult.name;
                }
            }
        } else if (staticTag == 'list') {
            var g = filter.g,
                id = filter.id;

            var estateName = options[staticTag].rightMessage.estateName;
            var name = options[staticTag].name;

            if (!_.isEmpty(filter)) {
                follow.filter = $.extend({}, filter);
                delete follow.filter.g;
                delete follow.filter.id;
                delete follow.filter.kw;
                delete follow.filter.o;
                delete follow.filter.p;
            }

            if (!filter.kw && (g == 2 || g == 4 || g == 5) && id) {
                tools.canFollow = true;
                follow.g = g;
                follow.code = self.findItem.scode || self.findItem.fcode;
                follow.name = self.findItem.sname || self.findItem.fname;

                if (g == 5) {
                    follow.parentId = self.findItem.fid;
                    follow.parentName = self.findItem.fname;
                }

                if (g == 2) {
                    follow.parentName = self.findItem.fname;
                }
            }

        }
    },

    _render: function(argument) {
        var self = this;
        if (self.select.length) {
            // var canFollow = false;
            // if (pageConfig.visitor) {
            //     canFollow = !!(pageConfig.visitor.user && pageConfig.visitor.user && pageConfig.visitor.user.uname && self.canFollow);
            // } else {
            //     $.jps.on('user-inited', function() {
            //         canFollow = !!(pageConfig.visitor.user && pageConfig.visitor.user && pageConfig.visitor.user.uname && self.canFollow);
            //         if (canFollow) self.container.find('.ftools-follow').removeClass('hide');
            //     });
            // }
            var html = template.draw(tpl, { data: self.select, canFollow: self.canFollow });
            self.container.html(html).removeClass('hide');
        } else {
            self.container.html('').addClass('hide');
        }
    },

    _search: function(kw) {
        var self = this;
        self.select.push({
            alias: 'kw',
            title: '搜索',
            txt: kw
        });
    },

    _find: function(options) {
        let self = this,
            staticTag = options.staticTag;
        let obj = self.findItem;
        let data, ft;

        if (staticTag == 'map') {
            ft = options[staticTag].range;
            data = { alias: 'rg' };
            if (!ft.rg) {
                return;
            }

            // 区域
            if (ft.rg == 1 || ft.rg == 2) {
                data.title = '区域';
                if (ft.rg == 2) {
                    data.title = '板块';
                }
            }

            // 地铁
            if (ft.rg == 4 || ft.rg == 5) {
                data.title = '地铁';
            }

            // 学区
            if (ft.rg == 7 || ft.rg == 8) {
                data.title = '学区';
            }
            data.txt = obj.name || '';

            if (ft.rg == 6) {
                data.title = '学区';
                data.txt = options[staticTag].provinceName;
            }

            if (data.txt) {
                this.select.push(data);
                this.tools = data;
            }
        }

        if (staticTag == 'list' || staticTag == 'newhouselist') {
            ft = options[staticTag].filter;
            data = { alias: 'g' };

            var estateName = options[staticTag].rightMessage.estateName;
            var name = self.findItem.sname || self.findItem.fname;

            // 区域
            if (ft.g == 1 || ft.g == 2) {
                data.title = '区域';
                if (ft.g == 2) {
                    data.title = '板块';
                }
            }
            // 地铁
            if (ft.g == 4 || ft.g == 5) {
                data.title = '地铁';
            }

            // 学区
            if (ft.g == 7 || ft.g == 8) {
                data.title = '学区';
            }

            // 小区，特殊对待
            if (ft.id && ft.g == 3) {
                data.txt = estateName || ft.kw;
                tools.select.push(data);
                this.tools = data;
            }else if(ft.id){
                data.txt = name;
            }

            if (data.txt) {
                this.select.push(data);
                this.tools = data;
            }
        }
    },

    _single: function(ft) {
        var self = this,
            sd = self._sourceData,
            sk = self.singleKeys,
            as = _.intersection(_.keys(ft), _.keys(sk));

        _.map(as, function(item) {
            let val = ft[item];
            if (val == -1) return;
            // 选项的所有值
            _.map(sd[sk[item]].values, function(velem, vindex) {
                if (velem.key == val) {
                    self.select.push({
                        alias: item,
                        txt: velem.txt
                    });
                }
            });
        });

    },

    _multi: function(options) {
        var self = this,
            ft = options.filter,
            mode = options.rangeMode,
            sd = self._sourceData,
            sk = self.multiKeys,
            as = _.intersection(_.keys(ft), _.keys(sk));

        _.map(as, function(item) {
            let val = ft[item];
            if (val == -1 || !val) return;

            val = val.split(',');
            let txtArr = [];

            // 选项的所有值
            _.map(sd[sk[item]].values, function(velem, vindex) {
                let key = velem.key;
                if (val.indexOf(key.toString()) != -1) {
                    if (item == 'fe') {
                        if (!(mode == 'school' && key == 3) && !(mode == 'subway' && key == 5)) {
                            self.select.push({
                                alias: 'fe',
                                txt: velem.txt,
                                bv: key
                            });
                        }
                    } else {
                        txtArr.push(velem.txt)
                    }
                }
            });
            if (item != 'fe') {
                self.select.push({
                    alias: item,
                    txt: txtArr.join('，')
                });
            }

        });
    },

    _inputs: function(options) {
        var ip = {},
            ap = {};

        var uc = '万';
        var ht = pageConfig.ht;
        ht == 1 ? uc = '元' : uc = '万';

        // 自定义价格
        if (options.sp && !options.ep) {
            ip.alias = 'sp';
            ip.txt = options.sp + uc + '以上';
        } else if (!options.sp && options.ep) {
            ip.alias = 'ep';
            ip.txt = options.ep + uc + '以下';
        } else if (options.sp && options.ep) {
            ip.alias = 'ip';
            ip.txt = options.sp + uc + ' - ' + options.ep + uc;
        }

        // 自定义面积
        if (options.sa && !options.ea) {
            ap.alias = 'sa';
            ap.txt = options.sa + 'm²以上';
        } else if (!options.sa && options.ea) {
            ap.alias = 'ea';
            ap.txt = options.ea + 'm²以下';
        } else if (options.sa && options.ea) {
            ap.alias = 'ia';
            ap.txt = options.sa + 'm² - ' + options.ea + 'm²';
        }

        if (ip.alias) this.select.push(ip);
        if (ap.alias) this.select.push(ap);
    }

}

module.exports = tools;
