/*
 * @Author: liyaping
 * @Date:   2015-08-24 11:27:25
 * @Email:  liyaping@superjia.com
 * @Last Modified by:   yuqy
 * @Last Modified time: 2016-11-16 10:44:36
 */
'use strict'
var staticUrl = pageConfig.staticUrl;
var Checkbox = require('checkbox')

var tpl = require('./util.html');
require('./util.scss');

var util = {
    API: {
        "addCollect": "/addHouseCollect.action", // 加入关注
        "delCollect": "/deleteHouseCollect.action", // 取消关注
        "addSeeList": "/addLookhouse.action" //加入看房清单
    },
    api: function(key) {
        // var rootPath = 'http://fe.superjia.com/s/api/debug/dac8fb';
        var rootPath = '';

        return rootPath + {
            "addCollect": "/addHouseCollect.action", // 房源加入关注
            "delCollect": "/deleteHouseCollect.action", // 房源取消关注
            "addSeeList": "/addLookhouse.action", //加入看房清单
            "followEstate": "/followEstate.action", // 关注小区
            "unfollowEstate": "/unfollowEstate.action", // 取消关注小区
            /*"followSchool": "/followSchool.action",  //关注学区
            "unfollowSchool": "/unfollowSchool.action"  //取消关注学区*/
            'updateFollow': '/updateFollow.action', // 关注搜索
            'unFollowObj':  '/unFollowObj.action'  //取消关注主体，取消关注新房(详情页，关注列表)
        }[key];
    },

    /**
     * [加入关注]
     * @param {[jquery object]}   item     [description]
     * @param {[json object]}   param    [{houseId:"",ht:""}]
     * @param {Function} callback [description]
     */
    addCollect: function(item, param, callback) {
        var self = this,
            addCollectAjax = self.addCollectAjax;
        var okFn = function() {
            //如果选了同时关注该小区
            if ($('.mod-check-box').hasClass('checked')) {
                var itemObj = $('.est-follow').length ? $('.est-follow') : '';
                self.followEstate(itemObj, {
                    estateId: param.estateCode,
                    ht: param.ht
                }, function() {
                    $.jps.trigger('followEst');
                });
            }
        };


        var html = template.draw(followTpl, {
            data: param
        });

        addCollectAjax && addCollectAjax.abort();
        self.addCollectAjax = $.ajax({
            type: 'get',
            url: self.API.addCollect,
            data: param,
            success: function(data) {

                switch (data.status) {
                    case -1:
                        smallnote("出错，请重试");
                        break;
                    case 1:
                    case -2:
                        if (data.status == -2) smallnote("您已关注过此房");
                        //未关注小区时弹框
                        if (data.ifCollectEst == 0) {
                            var d = dialog.alert(html, {
                                okCallback: okFn
                            });
                            new Checkbox(d.find('.mod-check-box'), {});
                        }
                        callback && callback();
                        if (item.data('showTip')) self.showCollectTip(item);

                        // header.refresh();
                        break;
                    case -3:
                        // header.refresh();
                        smallnote('已达到关注上限，无法再关注了', {
                            pattern: 'error'
                        });
                        break;
                    case 5:
                        header.clearLogin();
                        header.verifyLogin(function() {
                            item.click()
                        }, false, true);
                        break;
                }

            }
        });
    },

    /**
     * [取消关注]
     * @param  {[jquery object]}   item     [description]
     * @param  {[json object]}   param    [{"houseIds":"","ht":""}]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    delCollect: function(item, param, callback) {
        var self = this,
            delCollectAjax = self.delCollectAjax;

        delCollectAjax && delCollectAjax.abort();
        self.delCollectAjax = $.ajax({
            type: 'get',
            url: self.API.delCollect,
            data: param,
            success: function(data) {
                switch (data.status) {
                    case -1: // 异常
                        smallnote("取消关注失败");
                        break;
                    case 1: // 成功
                        callback && callback();
                        if (item.data('showTip')) self.showCollectTip(item, true);
                        // header.refresh();
                        break;
                    case 5: // 未登陆
                        header.clearLogin();
                        header.verifyLogin(function() {
                            item.click()
                        });
                        break;
                }
            }
        });
    },

    /**
     * [显示关注提示信息]
     * @param  {[jquery object]]}  item  [被点击的dom]
     * @param  {Boolean} isDel [是否为取消关注，true为取消，其他为新增]
     * @return {[type]}        [description]
     */
    showCollectTip: function(item, isDel) {
        $(".collect-tip").remove();
        var $dom = isDel ? '取消关注成功' : '关注成功';
        $dom = $('<div class="collect-tip arrow-bottom"><div class="favor-wrap">' + $dom + '</div></div>');
        item.append($dom);
        if (isDel) $dom.addClass('del-tip');
        $dom.fadeIn('slow'); //渐变显示
        setTimeout(function() {
            $dom.fadeOut('slow', function() {
                $dom.remove()
            }); //渐变隐藏
        }, 2000);
    },


    /**
     * [加入约看清单]
     * @param {[jquery object]} item  [description]
     * @param {[json object]} param [{houseId:"",ht:""}]
     * @param {[function]}]
     */
    // addSeeList: function(item, param, callback) {
    addSeeList: function(param, callback) {
        var self = this,
            addSeeAjax = self.addSeeAjax;

        var ht = param.ht;
        var act_value = param.houseId;

        // var okFn = function() {
        //     if (ht == '1') { //出租
        //         _hmt.push(['_trackPageview', '/chuzuyuekan']); //百度统计
        //         _hmt.push(['_trackEvent', 'Look_house', 'apply_now', 'zufang']); //百度统计
        //     } else if (ht == '2') { //出售
        //         _hmt.push(['_trackPageview', '/saleyuekan']); //百度统计
        //         _hmt.push(['_trackEvent', 'Look_house', 'apply_now', 'esf']); //百度统计
        //     }

        //     $.jps.trigger('log', {
        //         type: 'clickEvent',
        //         act_k: 141,
        //         act_v: act_value
        //     })

        //     location.href = '/seeHouseList/1/' + [act_value,ht].join('/');
        // };

        // var closeFn = function(btnType) {
        //     //日志
        //     if (btnType == 'closeBtn' && window.pageConfig.detail) {
        //         $.jps.trigger('log', {
        //             type: 'clickEvent',
        //             act_k: 142,
        //             act_v: act_value
        //         })
        //     }
        // };

        addSeeAjax && addSeeAjax.abort();
        self.addSeeAjax = $.ajax({
            type: 'get',
            url: self.API.addSeeList,
            data: param,
            success: function(data) {

                var act_key = param.isHover ? 146 : 140;
                $.jps.trigger('log', { //日志
                    type: 'clickEvent',
                    act_k: act_key,
                    act_v: act_value
                });
                let {status} = data;
                if( status == 1 || status == 2 || status == -4 )   {
                    header.refresh();
                }

                // TUDO
                // 地图页的提示为smallnote
                // if (param.point == 'dialog') {
                //     switch (data.status) {
                //         case -4:
                //             // dialog.alert("二手房业务暂未开放，不能提交！", {
                //             //         okText: '立即预约看房时间',
                //             //         okCallback: okFn,
                //             //         closeCallback: closeFn
                //             //     })
                //             dialog.successDialog('成功加入约看清单<p class="holiday-txt">过年怎么能少了家人的陪伴, 看房<br>我们2月15日再约哦～</p>', {
                //                 closeCallback: closeFn,
                //                 showFooter: false
                //             });
                //             break;
                //         case -1:
                //             dialog.alert("出错，请重试");
                //             break;
                //         case 1:

                //             dialog.successDialog("成功加入约看清单", {
                //                 okText: '立即预约看房时间',
                //                 okCallback: okFn,
                //                 closeCallback: closeFn
                //             })

                //             callback && callback(data);

                //             // item.prop('disabled', true).addClass('sellBtnView1').removeClass('sellBtnView').html('已加入约看清单');
                //             // item.siblings('.btn-to-see').remove();
                //             //item.prop('disabled', true).addClass('sellBtnView1').removeClass('sellBtnView').html('已加入约看清单');

                //             // callback && callback();


                //             //添加统计信息
                //             var _mvq = window._mvq || [];
                //             window._mvq = _mvq;
                //             _mvq.push(['$setAccount', 'm-80613-0']);
                //             _mvq.push(['$addOrder', 'ykqd' + Math.random(), '', '', '', '', '1']);
                //             _mvq.push(['custom', 'jzqu1', /*约看清单查看id*/ 'ykqd' + Math.random()]);
                //             _mvq.push(['$logConversion']);
                //             _mvq.push(['$setGeneral', 'cartview', '', /*用户名*/ data.mobile, /*用户id*/ data.userId]);
                //             _mvq.push(['$logConversion']);
                //             _mvq.push(['$addItem', '', /*房源商品id*/ data.houseId]);
                //             _mvq.push(['$logData']);

                //             //百度统计
                //             if (ht == 1) { //租房-我要看房
                //                 _hmt.push(['_trackEvent', 'Look_house', 'apply', 'zufang']); //百度统计
                //             } else if (ht == 2) { //二手房-我要看房
                //                 _hmt.push(['_trackEvent', 'Look_house', 'apply', 'esf']); //百度统计
                //             }

                //             break;
                //         case 2:
                //             dialog.successDialog("已加入约看清单", {
                //                     okText: '立即预约看房时间',
                //                     okCallback: $.noop(),
                //                     closeCallback: $.noop()
                //                 })
                //                 //item.prop('disabled', true).addClass('sellBtnView1').removeClass('sellBtnView').html('已加入约看清单');
                //                 //item.siblings('.btn-to-see').remove();
                //             break;
                //         case 3:
                //             dialog.alert("约看清单都满了，快去提交约看吧!", {
                //                 okText: '立即预约看房时间',
                //                 okCallback: $.noop(),
                //                 closeCallback: $.noop()
                //             })
                //             break;
                //         case 5:
                //             header.clearLogin();
                //             header.verifyLogin(function() {
                //                 //item.click()
                //             });
                //             break;
                //     }
                // } else {
                    callback && callback(data);
                // }


            }
        });
    },


    /**
     * [关注小区]
     * @param {[jquery object]}   item     [description]
     * @param {[json object]}   param    {"estateId":"","ht":""}
     * @param {Function} callback [description]
     */
    followEstate: function(item, param, callback) {
        var self = this,
            followEstateAjax = self.followEstateAjax;

        followEstateAjax && followEstateAjax.abort();
        self.followEstateAjax = $.ajax({
            type: "get",
            url: self.api('followEstate'),
            data: param,
            success: function(data) {
                if (data.status == 401) {
                    header.clearLogin();
                    header.verifyLogin(function() {
                        item.click()
                    });
                } else {
                    var d = data.data;
                    switch (d.result) {
                        case -1:
                            smallnote("关注失败");
                            break;
                        case 1:
                        case -2:
                            if (d.result == -2) smallnote("您已关注过此小区");
                            callback && callback(d);
                            if (item && item.data('showTip')) self.showCollectTip(item);
                            // header.refresh();
                            break;
                        case -3:
                            smallnote('已达到关注上限，无法再关注了', {
                                pattern: 'error'
                            });
                            // header.refresh();
                            break;
                    }
                }
            }
        });
    },

    /**
     * [取消关注小区]
     * @param  {[jquery object]}   item     [description]
     * @param  {[json object]}   param    {"estateId":"","ht":""}
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    unfollowEstate: function(item, param, callback) {
        var self = this,
            unfollowEstateAjax = self.unfollowEstateAjax;

        unfollowEstateAjax && unfollowEstateAjax.abort();
        self.unfollowEstateAjax = $.ajax({
            type: 'get',
            url: self.api('unfollowEstate'),
            data: param,
            success: function(data) {
                if (data.status == 401) {
                    header.clearLogin();
                    header.verifyLogin(function() {
                        item.click()
                    });
                } else {
                    switch (data.data.result) {
                        case -1: // 异常
                            smallnote("取消关注失败");
                            break;
                        case 1: // 成功
                            callback && callback();
                            if (item.data('showTip')) self.showCollectTip(item, true);
                            // header.refresh();
                            break;
                        case -2: // 已经取消关注
                            smallnote("已经取消关注");
                            break;
                    }

                }
            }
        });
    },
    /**
     * [关注学区]
     * @param {[jquery object]}   item     [description]
     * @param {[json object]}   param    {"schoolCode":""}
     * @param {Function} callback [description]
     */
    /*followSchool: function(item, param, callback){
        var self = this,
            followSchoolAjax = self.followSchoolAjax;

        followSchoolAjax && followSchoolAjax.abort();
        self.followSchoolAjax = $.ajax({
            type:'get',
            url: self.api('followSchool'),
            data: param,
            success: function(d){
                if (d.status == 401) {
                    header.clearLogin();
                    header.verifyLogin(function() {
                        item.click()
                    });
                } else {
                    switch (d.data.result){
                        case -1:
                        dialog.alert('关注失败');
                        break;

                        case 1:
                        callback && callback();
                        if (item.data('showTip')) self.showCollectTip(item, false);

                        break;

                        case -2:
                        dialog.alert('已关注过此学校');
                        break;

                        case -4:
                        dialog.alert('学校不存在');
                        break;

                        case -3:
                        dialog.alert('关注已满');
                        break;
                    }
                }
            }
        })
    },*/
    /**
     * [取消关注学区]
     * @param  {[jquery object]}   item     [description]
     * @param  {[json object]}   param    {"schoolCode":""}
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    /*unfollowSchool: function(item, param, callback){
        var self = this,
            unfollowSchoolAjax = self.unfollowSchoolAjax;

        unfollowSchoolAjax && unfollowSchoolAjax.abort();
        self.unfollowSchoolAjax = $.ajax({
            type:'get',
            url: self.api('unfollowSchool'),
            data: param,
            success: function(d){
                if (d.status == 401) {
                    header.clearLogin();
                    header.verifyLogin(function() {
                        item.click();
                    });
                } else {
                    switch (d.data.result){
                        case -1:
                        dialog.alert('关注失败');
                        break;

                        case 1:
                        callback && callback();
                        if (item.data('showTip')) self.showCollectTip(item, true);
                        break;
                    }
                }
            }
        })
    },*/

    /**
     * [房源列表模板输出]
     * @param  {[type]} item [description]
     * 数据个性化： {{house.itemClass}}单个房源自定义样式 house.itemDataTpl 单个房源个性化数据，需预编译成html
     *
     * @return {[type]}         [description]
     */
    getListItemHtml: function(item, options) {
        var html,
            opt = {
                itemClass: '', //单条class
                showCheckbox: false, // 是否显示复选框
                //invalMask: false, // 是否显示遮罩
                invalTag: false, // 是否显示失效标签
                djTag: true, // 是否显示独家标签
                videoTag: true, // 是否显示视频标签
                operateTpl: '', // 操作模板
                isBlank: false, // 是否在新窗口打开页面
                priceExtendTpl: '' //价格扩展html
            };

        options = $.extend({}, opt, options);

        html = template.draw(tpl, {
            house: item,
            options: options,
            tplType: 'houseItem',
            videoBtnImg: iwjw.videoBtnImg,
            paraVideoBtn: iwjw.videoPanaromaBtnImg,
            loadingImg: iwjw.loadingImg,
            operateTpl: template.draw(options.operateTpl, {
                house: item
            }),
            priceExtendTpl: template.draw(options.priceExtendTpl, {
                house: item
            }),
        });
        return html;
    },

    /**
     * [updateFollow description]
     * @param  {[type]} options [{param:param,item:$dom,successCallback:[Function],failCallback:[Function]}]
     * @return {[type]}         [description]
     */
    updateFollow: function(options) {
        var self = this,
            updateFollowAjax = self.updateFollowAjax,
            opt = {
                item: null,
                param: {},
                successCallback: null,
                failCallback: null
            };

        options = $.extend(opt, options);
        var param = options.param || {};
        var g = param.g;
        if (g != 2 && g != 3 && g != 4 && g != 5 && g!=9 && g!=7 ) return;

        updateFollowAjax && updateFollowAjax.abort();
        self.updateFollowAjax = $.ajax({
            type: 'post',
            contentType: 'application/json',
            url: self.api('updateFollow'),
            data: JSON.stringify(param),
            success: function(d) {
                //status:
                // -2:参数错误
                // -1：接口异常
                // 0：新增关注失败
                // 1：成功
                // 2：已存在
                // 3：当app上非新房和户型关注时，关注主体不存在提示
                // 4：频繁操作
                // 6：关注数量超过限制
                if (d.status == 401) {
                    header.clearLogin();
                    header.verifyLogin(function() {
                        let item = options.item;
                        if (item && item.length) item.click();
                    });
                } else {
                    if (options.noTip === true) {
                        return;
                    }
                    switch (d.status) {
                        case -1:
                            if (!options.failCallback) {
                                smallnote('关注失败,请稍后重试',{time:800});
                            }
                            break;
                        case 1:
                            if (options.successCallback) {
                                if(options.customizeHint){
                                    smallnote(options.customizeHint,{ time: 1000});
                                }else{
                                    smallnote('关注成功,可在关注列表查看最新上架房源',{ time: 1000});
                                }
                                // header.refresh();
                                options.successCallback && options.successCallback();
                            }
                            break;
                        case 6:
                            smallnote('已达到关注上限，无法再关注了', {
                                pattern: 'error'
                            });
                    }
                }
            }
        })
    },
    /**
     * 咨询置业顾问,进入页面就会在后台执行，并缓存结果
     * @param options
     * 401未登陆
     * 1成功
     * -1服务异常
     */
    getNewHouseAgent: function(options) {
        var self = this,
            opt = {
                item: null,
                param: {},
                successCallback: null,
                failCallback: null
            };

        options = $.extend(opt, options);
        var param = options.param || {};
        $.ajax({
            type: 'get',
            url: '/getNewHouseAgent.action',//咨询楼盘顾问
            data: param,
            success: function(d) {
                options.successCallback && opt.successCallback(d);
            }
        })
    },

    /**
     * [取消关注(新房，主体)]
     * @param  {[jquery object]}   item     [description]
     * @param  {[json object]}   param    [param:{g: g, ht: ht, id: id, code: code},callback: callback]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    unFollowObj: function(item, opt){
        let self = this, unFollowObjAjax = self.unFollowObjAjax;
        let options = {noTip: false}
        let opts = _.extend(options, opt);
        unFollowObjAjax && unFollowObjAjax.abort();
        self.unFollowObjAjax = $.ajax({
            url: self.api('unFollowObj'),
            data: JSON.stringify(opts.param),
            type: 'post',
            contentType: 'application/json',
            success: function(d) {
                switch (d.status){
                    case 0://数据库已经存储了相关结果
                        smallnote("取消关注成功",{time:1000});
                        opt.successCallback && opt.successCallback();
                        break;
                    case -1:
                        smallnote("出错，请重试");
                        break;
                    case 1:
                        if (!opts.noTip && item.data('showTip')) self.showCollectTip(item);
                        if(options.smallNote){
                            smallnote("取消关注成功",{time:1000});
                        }
                        opt.successCallback && opt.successCallback();
                        break;
                    case 401: // 未登陆
                        header.clearLogin();
                        header.verifyLogin(function() {
                            item.click()
                        });
                        break;
                }
            }
        });
    }
}


var followTpl = '' +
    '<div class="follow-success-wrap">' +
    '   <p class="follow-success">关注成功</p>' +
    '   <p class="simul-follow"><label class="mod-check-box checked" for=""><input class="required" name="complainType" type="checkbox">同时关注该小区{{if data.ht == 2}}二手房{{else}}租房{{/if}}</label></p>' +
    '</div>';

/**
 * 房屋标签模板
 * 使用方法,在模板文件中使用 {{#house | listHtml}}
 * @param  {[object]}
 * @return {[html]}
 */
template && template.helper('listHtml', function(data, options) {
    return util.getListItemHtml(data, options);
})

$.jps.on('update-follow', function(options) {
    util.updateFollow(options);
})

module.exports = util;
