/**
 * Created by zyy on 15/4/28.
 */
'use strict'
var staticUrl = pageConfig.staticUrl;
// var wxStep1Img = staticUrl + require('../img/step1.png');
var wxStep1Img = staticUrl + require('../img/step_app1.png');
var wxStep2Img = staticUrl + require('../img/step1.png');
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




