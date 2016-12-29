/*
 * Created by zyy on 15/5/26.
 * zhangyuyu@superjia.com
 */

require('./search.css')
var search = function(container, options) {
    this.__init(container, options);
};

search.prototype = {

    container: null,
    options: null,
    __logType: null,
    $hintPanel: null, //  模糊搜索列表 dom
    $keyInput: null, // input dom
    selectedHintItem: '', // 选中的提示项
    __searchKeyDebounce: null, // Key模糊搜索

    __tipsTitle: {
        '2': '板块',
        '5': '地铁'
    },

    __init: function(container, options) {
        var self = this;
        self.container = container;

        var o = {
            isMobile: false, //是否是移动端
            p: '', //省份ID
            showClose: true, //是否显示关闭按钮
            showHintHistory: true, //是否显示提示的历史记录
            exactMatch: false, //精确匹配，如果搜索只有一条就用一条来进行搜索
            inputName: 'kw', //input的name值
            itemKeyName: 'text', //显示所要取的字段
            isAnchor: false, //是否是用锚点打开
            appendEstateName: true, //列表项后面是否显示小区名称
            urlParam: {}, //链接刷新需要在url上加的字段
            hintSubmit: 'form', //link:链接刷新，form:表单提交刷新, nosubmit: 不对form进行提交操作
            autoSubmit: true, //如果是form的话是否要自动提交，默认是true，地图页的搜索form但是不让提交，才加该字段
            hintUrl: '/getSuggestions.action', //提示URL
            template: '',
            hintContainer: null, //提示面板容器
            inputWorldCallback: $.noop, //输入文字回调
            hintRequestCallback: $.noop, //提示请求结束
            hintClickCallback: $.noop, //点击提示条目回调
            submitCallback: $.noop, //提交表单回调
            extendEvent: null, //{'event  element': function}
            needInitEvent: true,
            currentHouseType: 1, //当前serch key 的类型，默认是租房
            $submitBtn: ''
        };

        var options = self.options = $.extend({}, o, options);

        if (!container.hasClass('mod-search') && options.needInitEvent) {
            container.addClass('mod-search');
        }

        if (options.isMobile && options.needInitEvent) {
            container.addClass('search-mobile');
            options.itemKeyName = 'estateName';
        }

        self.__initEle();
        self.__searchKeyDebounce = _.debounce(self.__searchKey, 200);
        self.options.isMobile ? self.__logType = 'h5Search' : self.__logType = 'search';
    },

    setOptions: function(options) {
        var self = this;
        return $.extend(self.options, options);
    },

    search: function() {
        var self = this;
        var keyInput = self.$keyInput;
        self.showHintLoading();
        self.__loadSearchAjax($.trim(keyInput.val()));
    },

    __initEle: function() {
        var self = this;
        var container = self.container;
        var options = self.options;

        var keyInput = self.$keyInput = container.find('input[name="' + options.inputName + '"]');

        if (options.template.length <= 0) {
            $('<p class="hint-wrap"></p>').prependTo(options.hintContainer || container);
            $('<i class="iconfont search-close" title="清除内容">&#xd648;</i>').insertAfter(keyInput);
            if (!container.find('input[name="t"]').size()) {
                $('<input name="t" type="hidden" value="1" />').appendTo(container);
            }
        } else {
            container.append(options.template);
        }

        if (container.find('.hint-wrap').size() > 0) {
            self.$hintPanel = container.find('.hint-wrap');
        } else {
            self.$hintPanel = container.find('.js_about_list');
        }

        if (options.needInitEvent) {
            self.__bindEvent();
        }
        if (!!options.extendEvent) {
            self.__extendEvent();
        }
    },

    // 扩展自定义事件
    __extendEvent: function() {
        var self = this;
        var container = self.container;
        var options = self.options;
        var key, _event, _elements, temp = options.extendEvent,
            _matchKey = /([a-z]+)\s(.+)$/,
            tempArr = [];
        for (key in temp) {
            tempArr = key.match(_matchKey);
            if (tempArr.length === 3) {
                _event = tempArr[1];
                _elements = tempArr[2];
                container.on(_event, _elements, options[temp[key]]);
            }
        }
    },

    // 事件
    __bindEvent: function() {
        var self = this;
        var container = self.container;
        var options = self.options;

        var keyInput = self.$keyInput;
        var hintPanel = self.$hintPanel;
        var $submitBtn = options.$submitBtn;
        var oldvalue = '';

        keyInput
            .on("focus", function(evt) {
                //填写内容时
                var item = $(this);
                var value = oldvalue = item.val();

                if (!!value) {
                    self.showClose();
                    // 是否已有hintPanel, 对比 housetype 和原来是否一致, 不一致就重新获取
                    var isEqual = options.currentHousetype == container.data('housetype');
                    if (!!hintPanel.find('.hint-item').size() && isEqual) {
                        self.showHintPanel();
                    } else {
                        self.__searchKeyDebounce(evt);
                    }
                } else {
                    self.__hideClose();
                }
                return false;
            })
            .bind('change', function() {
                return self.valChange();
            })
            .bind('input', function(evt) {
                // 当input有placeholder属性时，ie10/11 首次加载时会触发input事件, 相关原文
                // https://connect.microsoft.com/IE/feedback/details/885747/ie-11-fires-the-input-event-when-a-input-field-with-placeholder-is-focused
                return self.__searchKeyDebounce(evt);
            })
            .keydown(function(evt) {
                //预搜索按键
                if (hintPanel.is(':visible')) {
                    return self.__updownHint(evt.keyCode);
                }
            })
            .keyup(function(evt) {
                return self.__searchKeyDebounce(evt);
            })
            .click(function() {
                var item = $(this);
                var value = item.val();
                if (!value) {
                    self.__hideClose();
                    self.__loadSearchStore();
                }
                return false;
            })
            .blur(function() {
                if (options.exactMatch) {
                    //如果是精确匹配
                    if (hintPanel.children().length == 1) {
                        hintPanel.children().trigger('click');
                    }
                }
            });

        container
            .on('click', '.search-close', function() {
                keyInput.val('').focus();
                self.__hideClose();
                return false;
            })
            .on('click', '.hint-item', function() {
                var item = $(this);
                var queryType = item.data('querytype');
                var key = item.data('key');
                var inputVal = keyInput.val();
                var hintGrade = item.data('grade');
                var code = item.data('code');
                var index = item.index();

                var areaid;
                item.data('areaid') ? areaid = item.data('areaid') : areaid = item.data('id')

                hintPanel.find('.hint-item').removeClass('active');
                self.__clearHintStyle();
                item.addClass('active');
                keyInput.val(key);

                $.fn.placeholderClean && keyInput.placeholderClean();

                container.find('input[name="t"]').val(queryType);
                options.hintClickCallback(item);

                hintPanel.hide();

                /*log*/
                if (queryType == 2) {
                    areaid = 0;
                } else {
                    queryType = hintGrade;
                }

                if (hintGrade == 3) {
                    areaid = item.data('code');
                }

                //日志 记录点击关键词的位置 从1开始
                $.jps.trigger('log', {
                    type: self.__logType,
                    queryType: queryType == 2 ? 0 : queryType,
                    key: key,
                    inputVal: inputVal,
                    cid: areaid,
                    tips: (index + 1)
                });
                /*end of log*/

                self.selectedHintItem = item;

                if (options.hintSubmit !== 'nosubmit') {
                    container.submit();
                }

                self.selectedHintItem = null;
                return false;
            });

        $.jps.on('localStoreSerchKey', function(key) {
            self.__storeSearchKey(key);
        });

        if (options.hintSubmit !== 'nosubmit') {
            container.submit(function() {
                var queryType = container.find('input[name="t"]').val();
                var key = self.selectedHintItem ? self.selectedHintItem : $.trim(keyInput.val());

                self.__storeSearchKey(key);
                if (options.hintSubmit === 'form') {
                    if (options.submitCallback(keyInput, self.selectedHintItem) === false) {
                        return false;
                    }
                    return true;
                } else {
                    var url = self.__linkUrl(queryType);
                    window.location.href = url;
                    return false;
                }
            });
        }

        if ($submitBtn && ($submitBtn.attr('type') != 'submit')) {
            $submitBtn.click(function() {
                var key = $.trim(keyInput.val());
                self.__storeSearchKey(key);
            });
        }
    },

    __linkUrl: function(queryType) {
        var self = this;
        var container = self.container;
        var keyInput = self.$keyInput;
        var options = self.options;
        var hintItem = self.selectedHintItem;
        var keyVal = keyInput.val();
        keyVal = keyVal.replace(/<|>|&lt;|&gt/g, '');

        var urlStr = '',
            pathUrl = '';

        if ($.trim(keyVal)) {
            urlStr += (keyInput.attr('name') + '=' + encodeURIComponent(keyVal) + '&t=' + queryType);
        }

        _.each(options.urlParam, function(item, key) {
            urlStr += '&' + key + '=' + encodeURIComponent(item);
        });

        if (hintItem) {
            var grade = hintItem.data('grade');
            var areaId = hintItem.data('id');
            var code = hintItem.data('code');
            /*目前都是跳转列表、或者地图页面*/

            //if (grade == 9) {
            //    return '/estate/new/' + code;
            //}

            if (grade && grade != 3 && grade!=9 && areaId) {
                pathUrl += 'rg' + grade;
                pathUrl += 'rid' + areaId;
            }

        }
        return container.attr('action') + pathUrl + (urlStr ? ((options.isAnchor ? '#' : '?') + urlStr) : '');
    },

    __searchKey: function(evt) {
        evt = evt || window.event;

        var self = this;
        var container = self.container;
        var options = self.options;
        var keyInput = self.$keyInput;
        var hintPanel = self.$hintPanel;

        var kc = evt.keyCode;
        if (kc == 27 || kc == 38 || kc == 40) return false; //忽略ESE 上 下键

        if (kc == 13) {

            // 委托管理中没有form的情况
            if (hintPanel.find('.active').length == 0 && keyInput.val() == hintPanel.children().first().find('.key-txt').text()) {
                if(location.href.match('newhouse') ){//暂时先做新房的兼容
                    $('.mod-search .form-btn').trigger('click');
                }else{
                    hintPanel.children().first().trigger('click');
                }
                return false;
            }

            if (options.exactMatch) {
                //如果是精确匹配
                if (hintPanel.children().length == 1) {
                    hintPanel.children().trigger('click');
                } else {
                    hintPanel.find('.active').trigger('click');
                }
            }

            options.inputWorldCallback(keyInput, evt);
            if (options.hintSubmit === 'nosubmit') return false;
            if (!container.find('button[type="submit"], input[type="submit"]').size()) {
                container.submit();
            }

            return false;
        }

        self.selectedHintItem = null; //清空选中的提示条目

        var key = $.trim(keyInput.val());

        options.inputWorldCallback(keyInput, evt);

        if (key == '') {
            self.__hideClose();
            hintPanel.empty().hide();
            self.__loadSearchStore();
            return false;
        }

        self.showClose();
        self.__loadSearchAjax(key);

        return true;
    },

    //上下选中
    __updownHint: function(keyCode) {
        var self = this;
        var options = self.options;
        var keyInput = self.$keyInput;
        var hintPanel = self.$hintPanel;
        var inputVal = keyInput.val();

        switch (keyCode) {
            case 27:
            case 13:
                //ESC|回车
                // 避免延迟弹出 hintPanel
                self.__searchAjax && self.__searchAjax.abort();
                hintPanel.hide();
                $.jps.trigger('log', { //日志
                    type: self.__logType,
                    inputVal: inputVal
                });
                if (!options.autoSubmit) {
                    return false;
                }
                break;
            case 38:
            case 40:
                var active = hintPanel.find('.hint-item.active');
                active.removeClass('active');
                var hintItems = hintPanel.find('.hint-item');
                if (keyCode == 38) {
                    //上
                    if (!active.size()) {
                        hintItems.last().addClass('active');
                    } else {
                        var prev = active.prev();
                        if (!prev.size()) {
                            //如果没有
                            hintItems.last().addClass('active');
                        } else {
                            prev.addClass('active');
                        }
                    }
                } else {
                    //下
                    if (!active.size()) {
                        hintItems.first().addClass('active');
                    } else {
                        var next = active.next();
                        if (!next.size()) {
                            hintItems.first().addClass('active');
                        } else {
                            next.addClass('active');
                        }
                    }
                }

                var active = hintPanel.find('.hint-item.active');
                keyInput.val(active.data('key'));
                self.selectedHintItem = active;
                self.__clearHintStyle();

                // 滚动条跟随
                if (active.index() >= 6) {
                    hintPanel.scrollTop(active.index() * active.height());
                } else {
                    hintPanel.scrollTop(0);
                }

                break;
        }
        return true;
    },

    // 清除高亮 <span class="bold"></span>
    __clearHintStyle: function() {
        var self = this;
        var hintPanel = self.$hintPanel;
        hintPanel.find('.key-txt').each(function() {
            var $dom = $(this);
            $dom.text($dom.text());
        });
    },

    //从后台请求key数据
    __loadSearchAjax: function(searchName) {
        var self = this;
        var options = self.options;
        var container = self.container;
        var searchAjax = self.__searchAjax;
        var hintPanel = self.$hintPanel;
        var keyInput = self.$keyInput;
        var provinceId = container.data('provinceid') || options.provinceId;
        var mobileData = {};

        if (!searchName || $.trim(searchName) == '') return false;
        searchAjax && searchAjax.abort();

        var data = {
            p: provinceId,
            kw: searchName,
            ht: container.data('housetype')
        }

        if (options.isMobile) {
            mobileData.provinceId = data.p;
            mobileData.searchName = data.kw;
            mobileData.houseType = data.ht;
            data = mobileData;
        }

        self.__searchAjax = new $.ajax({
            url: options.hintUrl,
            data: data,
            dataType: 'json',
            type: 'get',
            cache: false,
            success: function(d) {
                if (d.status == 1) {
                    if (d.data && d.data.length == 0) {
                        hintPanel.empty().hide();
                    } else if (d.data) {
                        hintPanel.empty();
                        var reg = new RegExp('(' + searchName + ')', 'gi');
                        _.each(d.data, function(item) {
                            //为了兼容iw400的返回值{id:xxx,text:xxx}
                            var itemKey = item[options.itemKeyName] || item.key || item.text;

                            if (!itemKey) return true;

                            item.key = itemKey;

                            if (itemKey.length > 50) {
                                item.title = itemKey;
                            }

                            itemKey = itemKey.substr(0, 50);
                            item.uikey = itemKey.replace(reg, function(str, key) {
                                return '<span class="bold">' + global.escapeHtml(key) + '</span>';
                            });

                            var itemTip = item.tip;

                            if (itemTip) {
                                itemTip = itemTip.substr(0, 48 - itemKey.length);
                            } else {
                                itemTip = '';
                            }

                            item.tip = itemTip;
                            item.queryType = 3; //查询类型：3数据库Tips历史
                            item.tipsTitle = self.__tipsTitle[item.grade]
                        });
                        var html = template.draw(hintItemTpl, {
                            hints: d.data,
                            isAppendEstateName: options.appendEstateName
                        });
                        hintPanel.html(html);
                        options.currentHousetype = container.data('housetype');

                        self.showHintPanel();
                    }
                    if (options.exactMatch) {
                        //如果是精确匹配条数只有1的时候，输入值和查询值一样，则自动触发
                        if (hintPanel.children().length == 1) {
                            if (keyInput.val() == hintPanel.find('.key-txt').text()) {
                                hintPanel.children().trigger('click');
                            }

                        }
                    }
                    options.hintRequestCallback(d.data, hintPanel);
                }
            },
            error: function(res, type) {
                if (type == 'abort') return false;
                hintPanel.hide();
            }
        });
    },

    //从历史记录中获取数据
    __loadSearchStore: function() {
        var self = this;
        var options = self.options;
        var hintPanel = self.$hintPanel;
        var searchKeys = self.__getSearchKey();
        hintPanel.empty();

        if (!options.showHintHistory) return false;

        if (searchKeys) {
            var data = _.map(searchKeys, function(item) {
                var is = item.split('/');
                if (is.length > 1) item = is[0];

                return {
                    isHistory: true,
                    uikey: global.escapeHtml(item),
                    key: item,
                    g: is[1],
                    id: is[2],
                    code: is[3],
                    tipsTitle: self.__tipsTitle[is[1]],
                    queryType: 2 //查询类型：2浏览器历史
                };
            });

            var html = template.draw(hintItemTpl, {
                hints: data
            });

            hintPanel.html(html);
            self.showHintPanel();
        } else {
            self.hideHintPanel();
        }
    },

    __storeSearchKey: function(key) {
        if (!key) return false;
        var self = this;
        var container = self.container;
        var options = self.options;
        var houseType = container.data('housetype');
        var provinceId = container.data('provinceid') || options.provinceId;
        var hk = [];
        var keytxt = '';

        if (!options.showHintHistory) return false;

        if (typeof key != 'string') {
            var $key = $(key);
            keytxt = $key.data('key');

            //if ($key.data('code')) return false;
            if ($key.length) key = keytxt + '/' + $key.data('grade') + '/' + $key.data('id') + '/' + $key.data('code');
        } else {
            keytxt = key;
        }

        var searchKey = self.__getSearchKey() || [];
        var searchKeyfb = [];

        // 将历史记录中已有的关键字清除掉
        _.map(searchKey, function(sitem, sindex) {
            if (sitem.split('/')[0] != keytxt && sitem != keytxt) {
                searchKeyfb.push(sitem);
            }
        });

        // 大于10条删除最后一条
        if (searchKeyfb.length >= 10) {
            searchKeyfb.pop();
        }

        searchKeyfb.unshift(key);
        global.setLocalStore('searchkey' + houseType + provinceId, searchKeyfb.join(','))
    },

    __getSearchKey: function() {
        var self = this;
        var container = self.container;
        var options = self.options;
        var houseType = container.data('housetype');
        var provinceId = container.data('provinceid') || options.provinceId;
        var keys = global.getLocalStore('searchkey' + houseType + provinceId) || '';
        return keys && keys.split(',');
    },

    showClose: function() {
        var self = this;
        var container = self.container;
        var options = self.options;
        var keyInput = self.$keyInput;

        if (!options.showClose) return false;

        if (!keyInput.val()) return false;

        container.find('.search-close').show();

        $(document).one('click', function() {
            self.__hideClose();
        });
    },

    __hideClose: function() {
        var self = this;
        var keyInput = self.$keyInput;

        if (!!keyInput.val()) return false;
        self.container.find('.search-close').hide();
    },

    hideHintPanel: function() {
        var self = this;
        // setTimeout(function() {
        self.$hintPanel.hide();
        // }, 200);
    },

    showHintPanel: function() {
        var self = this;
        var options = self.options;
        var hintPanel = self.$hintPanel;
        hintPanel.find('.active').removeClass('active');
        hintPanel.show();

        $(document).one('click', function() {
            //以前是用blur方式来触发，但是很坑。
            if (options.exactMatch) {
                //如果是精确匹配
                if (hintPanel.children().length !== 1) {
                    if (hintPanel.is(':visible')) {
                        hintPanel.find('.active').trigger('click');
                    }
                }
            }
            hintPanel.hide();
        });
    },

    showHintLoading: function() {
        var self = this;
        var hintPanel = self.$hintPanel;
        var value = $.trim(self.$keyInput.val());
        if (!value) return false;
        hintPanel.html(template.draw(loadingTpl, {
            value: value
        }));

        self.showHintPanel();
    },

    valChange: function(){
        var self = this;
        var keyInput = self.$keyInput;
        var val = keyInput.val();
        if(!!val){
            self.showClose();
        }else{
            self.__hideClose();
        }
    }
};


var hintItemTpl = '' +
    '{{each hints}}' +
    '<a class="hint-item" title="{{$value.title}}" data-grade="{{$value.g}}" data-id="{{$value.id}}" data-querytype="{{$value.queryType}}" data-key="{{$value.key}}" data-kw="{{$value.kw}}" data-lon="{{$value.lon}}" data-lat="{{$value.lat}}" data-code="{{$value.code}}">' +
    '    <em class="iconfont">' +
    '        {{if $value.isHistory}}' +
    '            &#xd64a;' +
    '        {{else}}' +
    '            {{if $value.g == 5 || $value.g == 4}} &#xd62d; {{else if $value.g == 2 || $value.g == 1}} &#xd605; {{else if $value.g == 7 || $value.g == 8}} &#xd655; {{else}} &#xd610; {{/if}}' +
    '        {{/if}}' +
    '    </em>' +
    '    <span class="txt-wrap">' +
    '        <span class="key-txt">{{#$value.uikey}}</span>' +
    '        {{if (isAppendEstateName && $value.name)}}' +
    '            <span class="key-estate">[ {{$value.name }} ]</span>' +
    '        {{/if}}' +
    '        {{if $value.tip}}' +
    '            <span class="tip-txt">{{$value.tip}}</span>' +
    '        {{/if}}' +
    '        {{if $value.kw}}' +
    '            <span class="kw-txt">{{$value.kw}}</span>' +
    '        {{/if}}' +
    '    </span>' +
    '    {{if $value.houseNum}}' +
    '       <span class="key-housenum">{{$value.houseNum}}套</span>' +
    '    {{/if}}' +
    '</a>' +
    '{{/each}}';

var loadingTpl = '' +
    '<div class="search-load">' +
    '   <img src="' + iwjw.loadingSvg + '" width="24" height="24" />' +
    '   <span>正在搜索&nbsp;&nbsp;“{{value}}”</span>' +
    '</div>';

module.exports = search;
