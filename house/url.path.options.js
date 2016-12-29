/* 
 * @Author: liyaping
 * @Date:   2015-12-23 15:34:39
 * @Email:  liyaping@superjia.com
 * @Last Modified by:   huangxiaogang
 * @Last Modified time: 2016-07-13 20:34:12 新增物业类型
 */
'use strict';
var pageConfig = window.pageConfig;
var urlPathOpt = {
    // 基础数据 城市、业务
    basic: {
        p: null,
        ht: null,
    },
    // router 拼接url排序  要按照顺序
    filterIndex: {
        g: 0, // 0： 城市，1：区域，2：板块，3：小区，4：地铁线，5：地铁站，6：学区全部，7：学区区域，8：学校，9：新盘
        id: 1, //唯一，学校和新盘id可能会与g1-7的id重复
        o: 2, //排序 
        ip: 3, //  后端已经定义好的价格范围
        ia: 4, //无用，后端定义好的面积范围
        rn: 5, // 户型筛选,多选
        fe: 6, //特色，*售*，满二1、满五唯一2、学区房3、电梯房4、地铁房5
        ag: 7, //房龄，*售*，多选
        dt: 8, //装修，*租*
        sp: 9, //start price 
        ep: 10, //end price
        sa: 11, //start area
        ea: 12, //end area 
        fl: 13, // 楼层，*租、售*都有       
        p: 14, //page  分页第几页 默认是1 第一页没有 
        nos: 15, // 地图页专用，noSearch，是否需要进行关键字搜索，默认为0，即需要搜索
        wt:16//物业类型
    },
    //地图页面用
    lastIndex: {
        grade: 0,
        areaId: 1,
        lon: 2,
        lat: 3
    },
    //地图页面用
    rangeIndex: {
        rg: 0,
        rid: 1
    },
    filter: null, // 筛选条件，含搜索关键字
    last: null, // 最后一次点击，小区级别定位
    init: function(options) {
        var self = this,
            rUrl = options.rUrl,
            filter = rUrl.filter,
            last = rUrl.last,
            range = rUrl.range,
            params = rUrl.params;

        self.basic.p = options.provinceId;
        self.basic.ht = options.ht;

        self.analyzeFilter(filter);
        self.analyzeLast(last);
        self.analyzeRange(range);

        if ($.trim(params.kw)) self.filter.kw = params.kw;

        $.extend(pageConfig[pageConfig.staticTag], {
            basic: self.basic,
            filter: self.filter,
            last: self.last,
            range: self.range
        });
        // delete pageConfig.rUrl;
        // return pageConfig;
    },
    //http://127.0.0.1:8080/sale/map/g2id5757/grade3areaId6352lon121.36717174916lat31.236159079865/
    // g2id2383o1ip4ia3rn5fe2,3ag3dt1
    /**
     * []
     * @param  {[type]} param [description]
     * @return {[type]}       [description]
     */
    analyzeFilter: function(param) {
        var self = this;
        if (param) {
            // var reg = new RegExp(['^((g)([0-9]+))?',
            //     '((id)([0-9]+))?',
            //     '((o)([0-9]+))?',
            //     '((ip)(\-?[0-9]+))?((ia)(\-?[0-9]+))?((rn)(\-?[0-9]+))?((fe)([0-9,]*[0-9]+))?((ag)(\-?[0-9]+))?((dt)(\-?[0-9]+))?((sp)([0-9]+))?((ep)([0-9]+))?((sa)([0-9]+))?((ea)([0-9]+))?((p)([0-9]+))?((nos)([0|1]))?$'].join(''));
            var reg = new RegExp(['^',
                '((g)([0-9]+))?',
                '((id)([0-9]+))?',
                '((o)([0-9]+))?',
                '((ip)([0-9]+|\-1))?',
                '((ia)([0-9]+|\-1))?',
                '((rn)((?:(?:[0-9],)*[0-9]+)|\-1))?',
                '((fe)((?:(?:[0-9],)*[0-9]+)|\-1))?',
                '((ag)((?:(?:[0-9],)*[0-9]+)|\-1))?',
                '((dt)((?:(?:[0-9],)*[0-9]+)|\-1))?',
                '((sp)([0-9]+))?',
                '((ep)([0-9]+))?',
                '((sa)([0-9]+))?',
                '((ea)([0-9]+))?',
                '((fl)((?:(?:[0-9],)*[0-9]+)|\-1))?',
                '((p)([0-9]+))?',
                '((nos)([0|1]))?',
                '$'
            ].join(''));
            param = decodeURIComponent(param);

            self.filter = self.getArgs(param, reg);
        } else {
            self.filter = {};
        }
    },

    // grade3areaId6352lon121.36717174916lat31.236159079865/
    analyzeLast: function(param) {
        var self = this;
        if (param) {
            var reg = new RegExp(['^',
                '((grade)([0-9]+))?',
                '((areaId)([0-9]+))?',
                '((lon)([0-9]+\.?[0-9]+))?',
                '((lat)([0-9]+\.?[0-9]+))?',
                '$'
            ].join(''));

            param = decodeURIComponent(param);

            self.last = self.getArgs(param, reg);
        } else {
            self.last = {};
        }
    },
    // rg1rid2
    analyzeRange: function(param) {
        var self = this;
        if (param) {
            var reg = new RegExp(['^',
                '((rg)([0-9]+))?',
                '((rid)([0-9]+))?',
                '$'
            ].join(''));
            param = decodeURIComponent(param);
            self.range = self.getArgs(param, reg);
        } else {
            self.range = {};
        }
    },

    getArgs: function(str, reg) {
        var self = this,
            obj = {};
        if (reg.test(str)) {
            str.replace(reg, function() {
                // console.log(arguments)
                var args = _.initial(arguments, 2),
                    keys = [],
                    values = [];
                _.each(args, function(arg, i) {
                    if (arg && i) {
                        if (i % 3 == 2) {
                            keys.push(arg);
                        } else if (i % 3 == 0) {
                            values.push(arg)
                        }
                    }
                });
                obj = _.object(keys, values);
            })
        }
        return obj;
    },

    /**
     * [对象拼接成字符串]
     * @param  {[type]} obj     [description]
     * @param  {[type]} joinChr [description]
     * @param  {[type]} flag [description]
     * @return {[type]}         [description]
     */
    joinObj: function(obj, joinChr, flag) {
        var self = this,
            arr,
            sortIndex;
        // if (flag == 'filter') {
        //     sortIndex = this.filterIndex;
        //     arr = new Array(9);
        // }
        sortIndex = self[flag + 'Index'];
        arr = new Array(_.keys(sortIndex).length); //TODO

        _.reduce(obj, function(memo, num, key) {
            if (num && num != -1 && num != 0) {
                if (flag == 'filter') {
                    arr[sortIndex[key]] = key + num;
                } else {
                    arr.push(key + num);
                }
            }

        }, 0);
        return arr.join(joinChr);
    },
    /**
     * [拼接url]
     * @param  {[type]} flag [是否为切换列表，list为切换到列表]
     * @return {[type]}      [description]
     */
    getUrl: function(options, flag) {
        var self = this,
            staticTag = options.staticTag,
            staticJson = options[staticTag],
            filter = staticJson.filter,
            last = staticJson.last || {},
            range = staticTag == 'list' ? {} : staticJson.range || {},
            filterParam = $.extend(true, {}, filter),
            urlStr = [],
            kw = filter.kw,
            g = filterParam.g;
        delete filterParam.kw;

        // if (!filter.nos || filter.nos == 0) filter.nos = 0;

        if (flag == 'list' && staticTag == 'map') {
            delete filterParam.nos; // 该参数为地图页专用
        }

        if (flag != 'list' && staticTag == 'list') {
            if ((filter.g != 6 && !filter.id) || (!filter.g && filter.id)) {
                delete filterParam.g;
                delete filterParam.id;
            }
            if (g == 3) {
                last.grade = g;
                last.areaId = filterParam.id;
                last.lon = staticJson.rightMessage.lon;
                last.lat = staticJson.rightMessage.lat;
                delete filterParam.g;
                delete filterParam.id;
            }
            if (g && g != 3) {
                range.rg = filterParam.g;
                range.rid = filterParam.id;
            }
        }

        if ((staticTag == 'map' && flag == 'list') || (staticTag != 'map' && flag != 'list')) urlStr = [''];

        urlStr.push(options.htText);
        if (flag == 'list') {
            urlStr.push(staticJson.provincePy);
        } else {
            urlStr.push('map');
        }

        // var filterStr = encodeURIComponent(self.joinObj(filterParam, '', 'filter'));
        // if (filterStr) urlStr.push(filterStr);

        // if (flag != 'list') {
        //     if (last.areaId) urlStr.push(encodeURIComponent(self.joinObj(last, '', 'last')));
        //     if (range.rg) urlStr.push(encodeURIComponent(self.joinObj(range, '', 'range')));
        // }

        var filterStr = self.joinObj(filterParam, '', 'filter');
        if (filterStr) urlStr.push(filterStr);

        if (flag != 'list') {
            if (last.areaId) urlStr.push(self.joinObj(last, '', 'last'));
            if (range.rg) urlStr.push(self.joinObj(range, '', 'range'));
        }


        urlStr = urlStr.join('/');
        urlStr += '/';

        var urlSearch = [];
        if (kw) urlSearch.push('kw=' + encodeURIComponent(kw));
        // if (staticTag == 'list' && flag == 'map') urlSearch.push('p=' + options.provinceId);
        urlSearch = urlSearch.length ? '?' + urlSearch.join('&') : '';
        return urlStr + urlSearch;
    }

};

module.exports = urlPathOpt;
