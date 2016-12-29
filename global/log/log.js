var logUrl = pageConfig.datacollectUrl;
var hasReportLct = false;
var log = {
    init: function( options) {
        var self = this;
        self.__options = options || {};
        // self.__container = container;
        self.__switchLog();
    },
    __switchLog: function() {
        var self = this;
        $.jps.on('log', function(options) {
            self.__resetLogData(options); //重置数据
            var logData = self.resetErrorLog();  //错误日志数据
            switch (options.type) {
                case 'http-error':
                    $.extend(logData, options);
                    self.sendErrorLogData(logData);
                    break;

                case 'map-error':
                    $.extend(logData, options);
                    self.sendErrorLogData(logData);
                    break;

                case 'map-loaded-time':
                    $.extend(logData, options);
                    self.sendErrorLogData(logData);
                    break;

                case 'http-success':
                    $.extend(logData, options);
                    self.sendErrorLogData(logData);
                    break;

                case 'search':
                    // self.__logdata.clt = options.queryType > 2 ? 1 : 2;
                    self.__logdata.clt = options.queryType;
                    self.__logdata.ck = options.key;
                    self.__logdata.sk = options.inputVal;
                    self.__logdata.cid = options.cid;
                    self.__logdata.tips = options.tips;
                    self.__sendLogData();
                    break;

                case 'filter':
                    self.__logdata.sw_le = $.trim(options.line);
                    self.__logdata.sw_st = $.trim(options.station);
                    self.__logdata.dt_rg = $.trim(options.region);
                    self.__logdata.dt_ae = $.trim(options.area);
                    self.__logdata.ret = $.trim(options.rental);
                    self.__logdata.bdr = $.trim(options.bedroom);
                    self.__sendLogData();
                    break;

                case 'detail':
                    self.__logdata.hos = options.currentCode;
                    self.__logdata.rem = options.remCodes;
                    self.__logdata.act_k = options.act_k;
                    self.__logdata.act_v = options.act_v;
                    self.__logdata.title = options.title;
                    self.__logdata.est = options.est;
                    self.__logdata.postition = options.postition;
                    self.__logdata.place = options.place;
                    if (options.ht){
                        self.__logdata.vtp = options.ht;
                    }
                    self.__sendLogData();
                    break;

                case 'sch-detail':
                    self.__logdata.sch = options.sch;
                    self.__sendLogData();
                    break;

                case 'basic':
                    self.__sendLogData();
                    break;

                case 'clickEvent':
                    self.__logdata.act_k = options.act_k;
                    self.__logdata.act_v = options.act_v;
                    self.__logdata.act_l = options.act_l || '';
                    self.__logdata.title = options.title || '';
                    self.__logdata.place = options.place || '';
                    self.__sendLogData();
                    break;
                case 'reach':
                    self.__logdata.act_k = options.act_k;
                    self.__logdata.act_v = options.act_v;
                    self.__logdata.act_l = options.act_l;
                    self.__sendLogData();
                    break;
                case 'map_suggest':
                    delete options.type;
                    self.__logdata = $.extend({}, self.__logdata, options)
                    self.__sendLogData();
                    break;
            }
        });
    },

    __resetLogData: function(options) {

        var self = this;
        var options = $.extend({},self.__options, options);
        self.__logdata = {};
        if (!pageConfig.visitor) return false;
        var user = pageConfig.visitor.user || {};
        var provinceId = pageConfig.provinceId || {};

        //检查当前页面是否被其他页面嵌入
        var eurl = '';
        if (window.parent != window && document.referrer.indexOf('iwjw.com') == -1){
            eurl =  document.referrer;
        }

        self.__logdata = {
            uid: user.uuid, // 获取uuid
            usid: user.userId, // 获取用户id
            ct: provinceId, // 城市id
            ss: screen.width + '*' + screen.height, // 屏幕显示大小
            bs: $(window).width() + '*' + $(window).height(), // 浏览器显示大小
            url: encodeURI(window.location.href), // 当前url
            // 用户上一页面url（仅限通过链接过来的）
            ref: encodeURI(document.referrer),
            //1：租房，2：二手房，3：新房
            vtp: options.vtp || options.ht || 0,
            pf: 'pc-web',
            //页面唯一标识
            lct: hasReportLct ? '' : encodeURI(window.location.pathname),
            bs_zoom: Math.round(window.outerWidth/window.innerWidth*100)/100 || 1,
            eurl: eurl
        };

        hasReportLct = true;
    },

    resetErrorLog: function(){
        var logdata = {
            logTime: new Date().strftime('%Y-%m-%dT%H:%M:%S'),
            logLevel: 'ERROR',
            projectName: 'iwjw-pc',
            IMEI: '',
            OS: 'web'
        }
        return logdata;
    },

    __sendLogData: function() {
        var self = this;
        // var container = self.__container;
        // var LogUrl = container.attr('url');
        if(_.isObject(self.__logdata.act_v)){
            self.__logdata.act_v = JSON.stringify(self.__logdata.act_v);
        }
        $.ajax({
            url: logUrl + 'track/user/web.do',
            data: self.__logdata,
            dataType: 'jsonp'
        })
    },

    sendErrorLogData: function(logData){

        // if (logUrl.indexOf('iwjw.com') == -1) return false;

        var self = this;
        $.ajax({
            url: logUrl + 'errorlog.do',
            data: JSON.stringify(logData),
            type: 'post',
            global: false
        })

    },

    getKeyFromIdG: function(id, g){
        if(!id || !g) return {};
        var data = {};
        var keys = {
            1: 'dt_rg',
            2: 'dt_ae',
            3: 'eid',
            4: 'sw_le',
            5: 'sw_st',
            7: '81',
            8: '82',
            9: 'eid'

        }

        data[keys[g]] = id;
        return data;
    }

};

module.exports = log;

// $(function() {
log.init(pageConfig);
// });

/**
 * 外部来源webPV统计
 * 报表系统显示：http://report.fyb365.com/reporter/main.jsp, 爱屋Web统计-->爱屋WebPV统计
 */
if (!!global.paramOfUrl(location.href).tpa) {
    $.ajax({
        url: 'iwStatistics.action',
        data: {
            tpa: global.paramOfUrl(location.href).tpa,
            ref: document.referrer
        }
    });
};

//监控注册的统计，了解下原委
if (localStorage.getItem("registMobile") && localStorage.getItem("registUserId")) {
    var _mvq = window._mvq || [];
    window._mvq = _mvq;
    _mvq.push(['$setAccount', 'm-80613-0']);
    _mvq.push(['$setGeneral', 'registered', '', localStorage.getItem("registMobile"), localStorage.getItem("registUserId")]);
    _mvq.push(['$logConversion']);
    //删除缓存
    localStorage.removeItem("registMobile");
    localStorage.removeItem("registUserId");
};
