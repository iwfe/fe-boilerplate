/**
 * Created by zyy on 15/4/28.
 */
'use strict'
var staticUrl = pageConfig.staticUrl;
// var wxStep1Img = staticUrl + require('../img/step1.png');
var wxStep1Img = staticUrl + require('../img/step_app1.png');
var wxStep2Img = staticUrl + require('../img/step1.png');

var houseTpl = require('./housetpl.html');
require('./house.scss');
import user_utils from 'user_utils';
import getAuthKey from './authkey/authkey.js';

var iwjw = {
    loadingGifImg: staticUrl + require('../img/load.gif'),
    bigLoadingGifImg: staticUrl + require('../img/load_big.gif'),
    loadingImg: staticUrl + require('../img/placeholder.png'),
    videoBtnImg: staticUrl + require('../img/videoBtn.png'),
    videoPanaromaBtnImg: staticUrl + require('../img/panaroma_play.png'),
    videoPanaromaBigBtnImg: staticUrl + require('../img/panaroma_play_big.png'),
    loadingSvg: staticUrl + require('../img/loading.svg'),
    loadingWhiteSvg: staticUrl + require('../img/loading_white.svg'),
    QRcodeImg: staticUrl + require('../img/QRcode.jpg'),
    QRcodeAppImImg: staticUrl + require('../img/QrCodeAppIm.png'),
    agentImg: staticUrl + require('../../components/tpls/agent.png'),
    // 图片加载成功时修改图片src
    changeSrc: function(item, opt) {
        if (item.data('src') && !item.data('loaderror')) {
            let errorFunc = function() {
                item.data('loaderror', 'true');
            };
            /*data-webp or data-src*/
            let loadFunc = function(type) {
                var self = this;
                item.attr('src', item.data(type)).removeAttr('data-src');
                item.siblings(".fe-sign,.fe-sourceuser").show();
                if (item.data('need-resize') != undefined) {
                    if (item.data('need-resize') == 'auto') {
                        setTimeout(function() {
                            var parentEl = item.parent();
                            var pH = parentEl.height();
                            var pW = parentEl.width();
                            var iH = self.height;
                            var iW = self.width;
                            var offset = 0;

                            if ((pH == iH) && (pW == iW)) {
                                return;
                            }
                            var pK = pH / pW; // 斜率
                            var iK = iH / iW; // 斜率
                            offset = pK - iK;
                            if (offset <= 0) {
                                item.css({
                                    width: '100%',
                                    height: 'auto',
                                    'margin-top': (pW * (pK - iK)) / 2 + 'px'
                                });
                            } else if (offset > 0) {
                                item.css({
                                    width: 'auto',
                                    height: '100%',
                                    'margin-left': (pH / pK - pH / iK) / 2 + 'px'
                                });
                            }
                        }, 0);
                    } else {
                        setTimeout(function() {
                            var resizeCode = ~~item.data('need-resize');
                            var parentEl = item.parent();
                            var pW = parentEl.width();
                            var pH = parentEl.height();
                            var offset = 0;

                            switch (resizeCode) {
                                case 0: //5:3;
                                    offset = (pH - pW / 5 * 3) / 2;
                                    break;
                                case 1: //4:3;
                                    offset = (pH - pW / 4 * 3) / 2;
                                    break;
                                case 2: //3:2
                                    break;
                            }

                            // item.addClass('img-resize').addClass('offset_' + item.data('need-resize'));
                            item.css('margin-top', offset + 'px');
                        }, 0)
                    }
                }
            };
            let  webpImg = new Image();
            webpImg.onerror = function() {
                /*webp加载失败则加载src*/
                let srcImg = new Image();
                srcImg.onerror =()=>errorFunc();
                srcImg.onload = function() {
                    loadFunc.call(this,'src');
                };
                srcImg.src = item.data('src');
            };
            webpImg.onload = function() {
               loadFunc.call(this,'webp')
            };
            /*切换为webp格式*/
            item.data('webp',item.data('src')+'.webp')
            webpImg.src = item.data('webp');//ie8兼容性，src属性一定要在onload之后否则IE出错

        }
    },

    // 获取反爬虫key
    getAuthKey: function(callback){
        getAuthKey((key)=>{
            callback(key())
        });
    },

    //iwjw.getQRImage({w:100,h:100})
    getQRImage: function(param){
        // let w = param && param.w || 100,
            // h = param && param.h || 100,
            let url= '/getDynamicQRImage.action';
        return url;
    },

    addYoukuPlayer: function(id, videoId, options) {
        var VideoClientId = '17f7d65e0b6fe662';
        videoId = encodeURI(videoId);
        options = $.extend({
            onplaystart: $.noop,
            onplayend: $.noop
        }, options || {});
        this.player = new YKU.Player(id, {
            styleid: '0',
            client_id: VideoClientId,
            vid: vid,
            autoplay: true,
            show_related: false,
            events: {
                onPlayStart: options.onplaystart,
                onPlayEnd: options.onplayend
            }
        });
    },

    // 切换城市
    selectCity: function(id, url) {
        var param = {
                p: id
            }
            // if (redirectCurrent) param.redirectCurrent = true;
        $.ajax({
            url: '/changeCity.action',
            data: param,
            success: function(d) {
                user_utils.clearVisitor();
                if (url) {
                    window.location.href = url;
                } else {
                    //window.location.reload();
                    global.locationReload('/');
                }
            }
        });
    },

    /**
     * @param  {[jquery dom]}
     * @param  {[string]}
     */
    lodingStyle: function(dom, type, text) {
        if (!dom) return;

        if (!type) type = 'l';
        if (!text) text = '……';

        dom.text(text);

        // loading
        if (type == 'l') dom.prop('disabled', true);

        // normal
        if (type == 'n') dom.prop('disabled', false);
    },

    /**
     * [houseLabel house标签管理]
     * @param  {[object]} data [house数据集]
     * @param  {[string]} flag [label or subway]
     * @return {[html]}      [description]
     */
    houseLabel: function(data, flag) {
        var html = '',
            subway = data.trafficInfo || data.subway;
            let {houseType,labels} = data;

        if(labels && labels.length && houseType==2){
                let dom = [];
                dom = labels.map(function(item,i) {
                    return '<em class="tag-item">'+item+'</em>';
                });
                html = dom.join('');
        }else{
            if (flag == 'complete') {
                if (houseType != 1) {
                    data.aboveFiveYear == 1 || (data.onlyOne != 1 && data.aboveFiveYear == 4) ? html += '<em class="fe-year tag-item">满二</em>' : '';
                    data.onlyOne == 1 && data.aboveFiveYear == 4 ? html += '<em class="fe-year tag-item">满五唯一</em>' : '';
                    data.ifSchool == 1 ? html += !data.schoolName ? '<em class="fe-school tag-item">学区</em>' : '<em class="fe-school tag-item">' + data.schoolName + '</em>' : '';
                }
                ((houseType == 1 && subway) || data.ifSubway == 1) ? (html += !subway ? '<em class="fe-subway tag-item">地铁</em>' : '<em class="fe-subway tag-item">' + subway + '</em>') : '';
            } else {
                // 租房
                if (houseType == 1) {
                    if (flag == 'label' && subway) html = '<span class="fe-subway tag-item">地铁</span>';
                    if (flag == 'subway' && subway) html = '<span class="fe-subway tag-item need-cut">' + subway + '</span>' || '';
                } else {
                    data.aboveFiveYear == 1 || (data.onlyOne != 1 && data.aboveFiveYear == 4) ? html += '<em class="fe-year tag-item">满二</em>' : '';
                    data.onlyOne == 1 && data.aboveFiveYear == 4 ? html += '<em class="fe-year tag-item">满五唯一</em>' : '';
                    data.ifSchool == 1 ? html += '<em class="fe-school tag-item">学区</em>' : '';
                    data.ifSubway == 1 ? html += '<em class="fe-subway tag-item">地铁</em>' : '';
                }
            }
        }

        return html;
    },
    /**
     * [wxshare 微信分享房源弹出框]
     * @param  {[1,2]} type [houseType]
     * @param  {[type]} code [我的委托管理传houseId,房源详情页传housecode]
     * @return {[type]}      [description]
     */
    wxshare: function(type, code, url, step1Img, step2Img, shareFrom, estate) {
        var urlStr = '';
        if (url) {
            urlStr = pageConfig.mobileSiteUrlHasProtocol + url;

        } else {
            urlStr = pageConfig.mobileSiteUrlHasProtocol + '/';
            urlStr += type == 1 ? 'chuzu/' : 'sale/';
            urlStr += code + '/';
        }
        urlStr = shareFrom ? urlStr + "?shareFrom=" + shareFrom : urlStr + "?shareFrom=weixin";
        urlStr = pageConfig.siteUrl + '/getImage.action' + '?w=200&h=200&&value=' + encodeURIComponent(urlStr);
        var estate = estate ? estate : '房源';

        var html = template.draw(houseTpl,{
            tplType: 'wxshare',
            urlStr: urlStr,
            step1Img: step1Img,
            wxStep1Img: wxStep1Img,
            step2Img: step2Img,
            wxStep2Img: wxStep2Img,
            estate: estate
        })
        var wxdialog = new dialog.Dialog({
            showTitle: false,
            showFooter: false,
            width: 484,
            height: 374,
            message: html,
            closeCallback: function() {
                wxanim && clearInterval(wxanim);
            }
        });
        var res = true;
        var wxanim = setInterval(function() {
            var left = '+=277';
            if (res) left = '-=277';
            res = !res;

            $('.wx-share ul').animate({
                "marginLeft": left
            }, "slow");
        }, 2000);
    },

    // 初始化滚动条
    // 兼容Ipad显示
    tinyscrollbar: function($warp, options) {
        if (!$warp) return;

        options = options || {};
        try {
            if (global.browser.isPad) {
                $warp.find('.scrollbar').addClass('hide');
                $warp.find('.viewport').css('overflow', 'scroll');
            } else {
                var scrollTo = 0;
                if (options && options.scrollTo) scrollTo = options.scrollTo;

                $warp.tinyscrollbar(options);
                $warp.data("plugin_tinyscrollbar").update(scrollTo);
            }
        } catch (e) {
            console.log('自定义滚动条初始化错误');
        }
    },

    /**
     * [houseDJLabel 独家和业主发布标签管理]
     * @param  {[object]} data [house数据集]
     * @param  {[string]} small [true or false]
     * @param  {[boolean]} reverse [true or false]
     * @return {[html]} [html]
     *
     * VM
     * #if ($!{house.sign} == 1)
     *     <i class="fe-sign mark"></i>
     * #elseif (${house.source} == 4)
     *     <i class="fe-sourceuser mark"></i>
     * #end
     */
    houseDJLabel: function(data, small, reverse) {
        var style = '',text,
            html = '';

        // 业主发布
        if (data.source == 4){ style = 'fe-sourceuser'; text = '业主发布';}

        // 置顶推荐
        if (data.sign == 1){ style = 'fe-sign'; text = '置顶推荐';}

        // 小体型
        if (small) style += ' djmark-small';

        // 反方向
        if (reverse) style += ' djmark-reverse';

        if (data.source == 4 || data.sign == 1) {
            html = '<i class="djmark ' + style + '">' + text + '</i>';
        }

        return html;
    },

    customScroll: function(options) {
        var opt = {
                wrapClass: '',
                overviewClass: '',
                contentTpl: '',
                tplType: "customScroll"
            },
            html = '';
        options = $.extend(opt, options);
        html = template.draw(houseTpl, options);
        return html;
    },
    /**
     * [格式化价格格式]
     * @param  {[type]} num [description]
     * @return {[type]}     [description]
     */
    formatPrice: function(num) {
        if (num == 0) return num;
        if (!num) return '';
        // 浮点型价格截取小数部分
        var splitNum = String(num).split('.');

        var arr = String(splitNum[0]).split(''),
            len = arr.length;
        var r = len % 3,
            c = Math.floor(len / 3); //余数、位数
        for (var i = 1; i <= c; i++) {
            arr.splice(r + (c - i) * 3, 0, ',');
        }
        if (!r) arr.shift();
        num = arr.join('');
        if (splitNum.length > 1) num += '.' + splitNum[1];
        return num;
    },

    getHouseImgHtml: function(item, options) {
        var self = this,
            html,
            opt = {
                itemClass: '', //单条class
                //invalMask: false, // 是否显示遮罩
                invalTag: false, // 是否显示失效标签
                djTag: true, // 是否显示独家标签
                videoTag: true, // 是否显示视频标签
                isBlank: false, // 是否在新窗口打开页面
                needLink: true
            };

        options = $.extend({}, opt, options);
        // var playBtn = self.videoPanaromaBtnImg;
        var playBtn = item.houseVideo && self.getVideoImg(item.houseVideo.videoType);
        html = template.draw(houseTpl, {
            house: item,
            tplType: 'houseimg',
            videoImg: playBtn,
            loadImg: self.loadingImg,
            options: options,
            staticUrl:pageConfig.staticUrl
        });

        return html;
    },

    getVideoImg: function(videoType){
        return videoType == 1 ? this.videoPanaromaBtnImg : this.videoBtnImg;
    },

    getHouseInfoHtml: function(item) {
        var html;

        html = template.draw(houseTpl, {
            house: item,
            tplType: 'houseinfo'
        });
        return html;
    },

    // 图表公共配置
    highChartConfig: {
        chart: {
            type: 'area',
            height: '300'
        },

        title: {
            text: ''
        },

        xAxis: {
            gridLineWidth: 0,
            categories: {},
            tickmarkPlacement: 'on',
            lineColor: '#eeeeee',
            labels: {
                formatter: function() {
                    return this.value;
                }
            },
            title: {
                enabled: false
            },
            allowDecimals: false
        },
        yAxis: {
            gridLineColor: '#eeeeee',
            title: {
                text: ''
            },
            labels: {
                formatter: function() {
                    return this.value;
                }
            }

        },
        tooltip: {
            shared: true
        },
        plotOptions: {
            area: {
                connectNulls: true,
                lineWidth: 2,
                events: {
                    legendItemClick: function() {
                        return false;
                    }
                }
            }
        },

        credits: {
            enabled: false
        }
    },

    // 判断浏览器类型，根据不同的类型跳转到合适的场景页面
    judgeBrowser: (function() {
        var location = window.location
        var url = location.href;
        var siteUrl = pageConfig.siteUrl;
        // 兼容未输入www的场景
        var compatibleUrl = siteUrl.indexOf('www.') ? siteUrl.split('www.').join('') : siteUrl;
        var mobileSiteUrl = pageConfig.mobileSiteUrl;
        var f = global.paramOfUrl(url).f
        if (f == '1') return false; //强制不跳转
        var browser = global.browser;

        //if (browser.isWeixin && url.indexOf('/wx/') > 0) return false;
        if (pageConfig.platform && pageConfig.platform == 'wxent') return false;
        if (browser.isPad) return false;

        if (browser.isMobile) {
            //如果是手机
            if (url.indexOf(siteUrl) != -1) {
                //如果访问的是PC的URL
                location.href = url.replace(siteUrl, mobileSiteUrl).replace('https','http');
            } else if (url.indexOf(compatibleUrl) != -1) {
                //如果访问的是PC的URL
                location.href = url.replace(compatibleUrl, mobileSiteUrl);
            }
        } else {
            //如果是PC
            if (url.indexOf(mobileSiteUrl) != -1) {
                //如果访问的是PC的URL
                location.href = url.replace(mobileSiteUrl, siteUrl);
            }
        }
    })()
};

module.exports = iwjw;

/**全局配置**/
$(document).ajaxError && $(document).ajaxError(function(e, xhr, ajaxSettings, thrownError) {
    if (~~xhr.status < 400) return false;
    smallnote('服务异常，请重试', {
        pattern: 'error'
    });
    $.jps.trigger('log', { //日志
        type: 'http-error',
        http: {
            status: xhr.status,
            url: ajaxSettings.url,
            type: ajaxSettings.type,
            contentType: ajaxSettings.contentType,
            dataType: ajaxSettings.dataType
        }
    });
});

$(document).ajaxSuccess && $(document).ajaxSuccess(function(e, xhr, ajaxSettings) {
    try {
        $.jps.trigger('log', { //日志
            type: 'http-success',
            http: {
                status: xhr.status,
                url: ajaxSettings.url,
                type: ajaxSettings.type,
                contentType: ajaxSettings.contentType,
                dataType: ajaxSettings.dataType,
                totalTime: new Date().getTime() - xhr.startTime
            }
        });
        var data = JSON.parse(xhr.responseText);
        if (data.status == 500) smallnote(data.msg || '服务异常，请重试', {
            pattern: 'error'
        });
    } catch (e) {

    }
});

$.ajaxSetup && $.ajaxSetup({
    dataType: 'json',
    type: 'get',
    cache: false,
    beforeSend: function(xhr) {
        xhr.startTime = new Date().getTime();
    }
});

//发送日志
let logReported = false;
user_utils.onReady(function(){
    if (!logReported){
        $.jps.trigger('log', { //日志
            type: 'basic'
        });
    }
    logReported = true;
});

/**
 * 房屋标签模板
 * 使用方法,在模板文件中使用 {{#house | houseLabel}}
 * @param  {[object]}
 * @return {[html]}
 */
template && template.helper('houseLabel', function(data, flag) {
    return iwjw.houseLabel(data, flag);
})

template && template.helper('houseDJLabel', function(data, site, small) {
    return iwjw.houseDJLabel(data, site, small);
})

template && template.helper('customscroll', function(options) {
    return iwjw.customScroll(options);
});
/**
 * 价格格式化
 * 使用方法,在模板文件中使用 {{price | formatPrice}}
 * @param  {[object]}
 * @return {[html]}
 */
template && template.helper('formatPrice', function(price) {
    return iwjw.formatPrice(price);
})


/**
 * 房屋图片标签模板
 * 使用方法,在模板文件中使用 {{#house | houseImgHtml}}
 * @param  {[object]} link传true为不要link，默认是需要link
 * @return {[html]}
 */
template && template.helper('houseImg', function(data, link) {
        var options = {};
        if (link) {
            options.needLink = false;
        }
        return iwjw.getHouseImgHtml(data, options);
    })
    /**
     * 房屋室厅卫、平米、单价、装修标签模板
     * 使用方法,在模板文件中使用 {{#house | houseInfoHtml}}
     * @param  {[object]}
     * @return {[html]}
     */
template && template.helper('houseInfo', function(data, options) {
    return iwjw.getHouseInfoHtml(data, options);
})

$(function() {

    if (!global.browser.isMobile && $.fn.placeholder) {
        //全局替换placeholder，仅页面上已有元素，非js插入元素
        $('input[placeholder], select[placeholder], textarea[placeholder]').placeholder(true);
    }


    $('img').each(function(index, el) {
        var $item = $(this);
        if ($item.data('src')) iwjw.changeSrc($item);
    });

});
