/* 
* @Author: enzo
* @Date:   2016-01-13 10:32:06
* @Last Modified by:   lancui
* @Last Modified time: 2016-08-18 10:59:18
*/

'use strict'

require('./nav.scss');

var navtpl = require('./rightnavtpl.html');

(function() {
    var flag = window.pageConfig.flag;

    // 地图页不需要导航
    if (flag == 15 || flag == 16 || flag == 30) return;

    // 二维码
    $(".iwjw-wrap").append(navtpl);
    $(".suspend-wrap .suspend-code").find('img').attr('src', iwjw.getQRImage({w:144,h:144}));

    // 修改跳转地址
    var form = window.encodeURIComponent(location.href);
    var targetUrl = '/gofeedback';

    // 当前页面为反馈且目标页面也是反馈页
    if (flag == 27) {
        targetUrl += '#' + window.encodeURIComponent(location.href.replace(location.hash, ''));
    } else if (flag != 27) {
        targetUrl += '#' + form;
    }

    $(".suspend-report").attr('href', targetUrl);

    // 
    var wh = $(window).height();
    var timer = null;
    $(window).scroll(function(event) {
        if (timer) return false;
        timer = setTimeout(function() {
            var top = $(window).scrollTop();
            if (top > wh) {
                $('.suspend-top').show();
                $('.suspend-wrap').css('bottom', '16px');
            } else {
                $('.suspend-top').hide();
                $('.suspend-wrap').css('bottom', '64px');
            }

            timer = null;
        }, 1000);
    });

})()
