/*
 * @Author: yilizhang
 */

'use strict';

import userStore from './userStore.js';

var utils = {
    api: function(key) {
        var rootPath = '';

        return rootPath + {
            'checkLoginAndProvinceId': '/checkLoginAndProvinceId.action',
            'login': '/login.action',
            'register': '/register.action',
            'loginout': '/loginout.action',
            'checkImageCode': '/checkImageCode.action',
            'getToken': '/getToken.action',
            'sendCode': '/sendCode.action',
            'checkCode': '/checkCode.action',
            'isAgentMobile': '/isAgentMobile.action',
            'getVoiceNum': '/getVoiceNum.action',
            'getVoiceVerifyCode': '/getVoiceVerifyCode.action'
        }[key];
    },

    //验证登录 => 初始化访问者
    initVisitor: function(param = {}) {
        var self = this,
            callback = param.callback,
            errorCallback = param.errorCallback,
            deferred = $.Deferred(),
            data = null;

        let cookieUserId = window.pageConfig.cookieUserId

        // 已登录 则获取localstorage的user
        if(cookieUserId > 0){
            data = userStore.getUser();
        }

        // 对比省份 和 用户是否一致
        if(data && (data.data.user.userId == cookieUserId) && (data.data.province.id == window.pageConfig.provinceId)){
            window.pageConfig.visitor = data.data;
            callback && callback(data);
            deferred.resolve(data);

            return deferred.promise();
        }

        $.ajax({
            type: 'get',
            url: self.api('checkLoginAndProvinceId'),
            error: function(e) {
                errorCallback && errorCallback(e);
            },
            success: function(d) {
                if (d.status == 1) {
                    window.pageConfig.visitor = d.data;
                    userStore.setUser(d);
                }

                deferred.resolve(d);
                callback && callback(d);
            }
        });

        return deferred.promise();
    },

    /**
     * 登录注册
     * @param param {mobile, code, type, callback, errorCallback}
     */
    logReg: function(param) {
        if (!param) return false;

        var self = this,
            callback = param.callback,
            errorCallback = param.errorCallback,
            mobile = param.mobile,
            code = param.code,
            url = '';

        if (param.type === 'login') {
            url = self.api('login')
        } else {
            url = self.api('register')
        }

        return $.ajax({
            type: 'post',
            url: url,
            data: {
                mobile: mobile,
                code: code
            },
            error: function(e) {
                errorCallback && errorCallback(e);
            },
            success: function(d) {
                self.clearVisitor();
                callback && callback(d);
            }
        });
    },

    // 登出
    logout: function(param = {}) {
        var self = this,
            callback = param.callback,
            errorCallback = param.errorCallback;

        self.clearVisitor();

        return $.ajax({
            type: 'get',
            url: self.api('loginout'),
            error: function(e) {
                errorCallback && errorCallback(e);
            },
            success: function(d) {
                callback && callback(d);
            }
        });
    },

    /**
     * 验证图片验证码
     * @param param {mobile, image, callback, errorCallback}
     */
    checkImageCode: function(param) {
        if (!param) return false;

        var self = this,
            callback = param.callback,
            errorCallback = param.errorCallback,
            mobile = param.mobile,
            image = param.image;

        return $.ajax({
            url: self.api('checkImageCode'),
            type: 'get',
            data: {
                mobile: mobile,
                image: image
            },
            success: function(d) {
                callback && callback(d);
            },
            error: function(e) {
                errorCallback && errorCallback(e);
            }
        });
    },

    /**
     * 发送手机验证码
     * @param param {mobile, flag, type, callback, beforeCallback, errorCallback}
     * @ type 0 登录注册 1修改手机验证当前手机 2修改手机验证新手机
     */
    sendCode: function(param) {
        if (!param) return false;

        var self = this,
            mobile = param.mobile,
            type = param.type,
            //1极验，0非极验
            jiyanFlag = param.jiyanFlag ? param.jiyanFlag : 0,
            callback = param.callback,
            beforeCallback = param.beforeCallback,
            errorCallback = param.errorCallback,
            deferred = $.Deferred();

        //百度统计：发送验证码
        _hmt.push(['_trackEvent', 'login', 'send_code']);

        var ajax = $.ajax({
            type: 'post',
            dataType: 'text',
            url: self.api('getToken'),
            data: {
                mobile: mobile
            }
        });

        ajax.done(function(d) {
            if (d == '') return;

            beforeCallback && beforeCallback();

            var data = {
                mobile: mobile,
                uuid: d,
                type: type,
                jiyanFlag: jiyanFlag
            };

            if (param.flag !== undefined) data.flag = param.flag;

            $.ajax({
                type: 'post',
                url: self.api('sendCode'),
                data: data,
                error: function(e) {
                    errorCallback && errorCallback(e);
                    deferred.reject(e);
                },
                success: function(d) {
                    callback && callback(d);
                    deferred.resolve(d);
                }
            });
        });

        return deferred.promise();
    },

    /**
     * 验证手机验证码
     * @param param {mobile, checkCode, callback, errorCallback}
     */
    checkCode: function(param) {
        if (!param) return false;

        var self = this,
            mobile = param.mobile,
            checkCode = param.checkCode,
            callback = param.callback,
            type = param.type,
            errorCallback = param.errorCallback;

        return $.ajax({
            type: 'post',
            url: self.api('checkCode'),
            data: {
                mobile: mobile,
                checkCode: checkCode,
                type: type
            },
            success: function(d) {
                callback && callback(d);
            },
            error: function(e) {
                errorCallback && errorCallback(e);
            }
        });
    },

    /**
     * 检测是否经纪人手机号
     * @param param {mobile, callback, errorCallback}
     */
    isAgentMobile: function(param) {
        if (!param) return false;

        var self = this,
            mobile = param.mobile,
            callback = param.callback,
            errorCallback = param.errorCallback;

        return $.ajax({
            type: 'post',
            url: self.api('isAgentMobile'),
            data: {
                mobile: mobile
            },
            success: function(d) {
                callback && callback(d);
            },
            error: function(e) {
                errorCallback && errorCallback(e);
            }
        });
    },

    /**
     * 发送语音验证码
     * @param param {mobile, callback, beforeCallback, errorCallback}
     */
    sendVoiceCode: function(param) {
        if (!param) return false;

        var self = this,
            mobile = param.mobile,
            callback = param.callback,
            beforeCallback = param.beforeCallback,
            errorCallback = param.errorCallback,
            deferred = $.Deferred();

        var ajax = $.ajax({
            type: 'get',
            url: self.api('getVoiceNum'),
            data: {
                mobile: mobile
            }
        });

        ajax.done(function(d) {
            if (d == '') return;

            beforeCallback && beforeCallback();

            var data = {
                mobile: mobile,
                account: d.account,
            };

            $.ajax({
                type: 'get',
                url: self.api('getVoiceVerifyCode'),
                data: data,
                error: function(e) {
                    errorCallback && errorCallback(e);
                    deferred.reject(e);
                },
                success: function(d) {
                    callback && callback(d);
                    deferred.resolve(d);
                }
            });
        });

        return deferred.promise();
    },

    // 获取用户之后
    onReady(callback){
        if(pageConfig.visitor && pageConfig.visitor.user){
            callback && callback(pageConfig.visitor);
        }else{
            $.jps.on('user-inited', function(param){
                callback && callback(param);
            });
        }
    },

    // 第一次有会执行 之后变化还会执行
    onUserChange(callback){
        if(pageConfig.visitor && pageConfig.visitor.user){
            callback && callback(pageConfig.visitor);
        }

        $.jps.on('visitor-change', function(param){
            callback && callback(param);
        });
    },

    clearVisitor(){
        userStore.clear();
    },

    ifLogin(){
        return (pageConfig.visitor && pageConfig.visitor.user && pageConfig.visitor.user.uname);
    },

    /*
     * data: {}
     *     - gender 1男 2女
     *     - name
     */
    updateUserInfo: function(data, callback, errorCallback) {
        let self = this;
        $.ajax({
            url: '/updateUserInfo.action',
            type: 'post',
            cache: false,
            data: data,
            success: function(d) {
                if (d.status == 1) {
                    self.clearVisitor();
                    callback && callback();
                    // dialog.successDialog('修改成功!');
                } else {
                    // dialog.alert('修改失败!');
                    errorCallback && errorCallback();
                }
            }
        });
    }
};

module.exports = utils;
