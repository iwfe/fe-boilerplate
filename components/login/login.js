/**
 * Created by zyl on 16/6/6.
 */
var staticUrl = pageConfig.staticUrl
var gdialog = dialog;
var checkbox = require('checkbox');
var logoImg = staticUrl + require('../../global/img/logo.png');
var loginTpl = require('./login.html');
var typeTpl = require('./template.html');
var userUtils = require('../user_utils/utils.js');
var loginScan = require('./scan.js');
var geetest = require('./geetest/geetest.js');
var viewManager = require('./viewManager.js');
var loginLogger = require('./log.js'); //加入日志

import {getCursortPosition, setCaretPosition} from './utils';
require('./login.scss');


// 发送**次验证码后显示‘没收到？’ 
const CODESENDTIMES = 2;


var login = {

    visitor: {},
    user: {},
    __loginCallback: $.noop,
    __loginDialog: '',
    __resetSendNum: 0,
    __currentDragErrorTimes: 0,
    __maxErrorNum: 2,
    __isUseGeetest(){
        let isUseGeetest = false;
        if(viewManager && viewManager.__useGeetest){
          isUseGeetest = true;
        }
        return isUseGeetest;
    },

    /**
     * 验证是否登录
     * @param callback [function | {refererUrl,}]
     * @param isRefresh:是否要请求接口
     */
    init: function() {
        var self = this;
        loginScan.init({
            successCallback: function(d){
                self.loginSuccess(d);
            }
        });
        self.initVisitor();
    },

    // 验证是否登录 否则弹出登录框
    verifyLogin: function(callback, isRefresh, hideCouponDialog) {
        var self = this;
        var visitor = self.visitor;
        self.__loginCallback = callback;
        self.hideCouponDialog = hideCouponDialog;
        var back = function(cb) {
            //未登录弹登陆框
            if (!visitor || !visitor.user.uname) {
                self.showLoginDialog();
            //登录了执行回调
            } else {
                if (typeof callback == 'function') {
                    callback();
                }
                if (callback.refererUrl) global.locationReload(callback.refererUrl);
            }
        };

        if (isRefresh) {
            self.initVisitor(function() {
                back();
            });
        } else {
            back();
        }
    },

    //初始化访问者
    initVisitor: function(callback) {
        var self = this;

        userUtils.initVisitor({
            callback: function(d) {
                if (d.status != 1) {
                    return ;
                }

                var visitor = self.visitor = d.data;
                var user = visitor.user;
                user.billNum = (visitor.bills && visitor.bills.count) ? visitor.bills.count : '';

                // 如果用户未登录 并且 signin 为1 则自动弹出登录框
                if(d.data.user.userId == 0 && pageConfig.signin == 1){
                    self.verifyLogin();
                }

                // 发送日志
                $.jps.trigger('user-inited', self.visitor);

                self.visitorCallback(visitor);

                callback && callback();
            },
            errorCallback: function(e) {
                self.visitorCallback({});
            }
        });
    },

    refreshVisitor: function(callback){
        userUtils.clearVisitor();
        this.initVisitor(callback);
    },

    clearLogin: function(){
        var user = this.visitor.user = {};
        this.visitorCallback(user);
    },

    logout: function() {
        userUtils.logout().done(function(d) {
            if (d.status == 1) window.location.href = '/';
        });
    },

    visitorCallback: function(visitor){
        $.jps.trigger('visitor-change', visitor);
    },

    /*
     * 这个为私有函数， 想要打开登录窗统一调用verifyLogin
     */
    showLoginDialog: function() {
        var self = this;
        var visitor = self.visitor;
        if (visitor && visitor.user && visitor.user.uname) {
            return false;
        }
        var loginHtml = template.draw(loginTpl, {
            logoImg: logoImg
        });

        var dialog = self.__loginDialog = new gdialog.Dialog({
            width: 376,
            height: 440,
            showTitle: false,
            showFooter: false,
            message: loginHtml
        });
        /*添加打点*/
        self.loginLogger = loginLogger($('.mod-login'));

        self.mobileInput = self.__loginDialog.element.find('input[name=mobile]');
        //---------------------------------------
        //如果采用极验验证
        
        self.__resetSendNum = 0;
        // self.__maxErrorNum = 2;
        self.__currentDragErrorTimes = 0;
        let smscodeIpt = dialog.element.find('input[name="code"]');
        let callback = {
            cantFun(){
                viewManager.__useGeetest = false;
                viewManager.updateView();
            },
            error(errorTimes){
                self.loginLogger('login_slide');
                self.__currentDragErrorTimes = errorTimes;
                if(errorTimes >= self.__maxErrorNum){
                    self.printError('geetest','');
                    $('#login-change-tips').show();
                }
            },
            dragSuc(data){
                self.loginLogger('login_slide');
                let deffer = $.Deferred(),
                    phone = self.getMobileInputValue();
                if(!phone){
                    // self.printError('phone','请输入您的手机号码');
                    self.printError('geetest','请输入您的手机号码');
                    deffer.reject();
                }else if(!global.isMobile(phone)) {
                    // self.printError('phone','手机号码不正确');
                    self.printError('geetest','手机号码不正确');
                    deffer.reject();
                }else{
                    deffer.resolve();
                }
                return deffer;
            },
            verifySuc(data){
                setTimeout(function(){
                    self.mobileInput.prop('readonly', true);
                    smscodeIpt.focus();
                    viewManager.nextView();
                    self.__sendCode();
                },1200);
                $('.mod-login .send-btn').prop('disabled', false);
            }
        }
        
        if(pageConfig.geetestFlag == 1){
            let {cantFun,error,dragSuc,verifySuc} = callback;
            //******测试按钮
            // $('#click-it').click(function(){
            //     setTimeout(function(){
            //         // wrap.toggleClass('step2');
            //         // lw.toggleClass('step2');
            //         // self.mobileInput.prop('readonly', true);
            //         viewManager.changeType();
            //     },50);
            // });
            geetest.init({
                container: "#geetest-container",
                //第一次校验失败
                cantFun: cantFun,
                error: error,
                dragSuc: dragSuc,
                verifySuc: verifySuc
            });
        }
        viewManager.initView();


        //---------------------------------------


        dialog.find('input[placeholder]').placeholder(true);

        dialog.find('input[name=mobile]').focus();

        self.__bindLoginEvent();
    },

    getMobileInputValue: function() {
        return this.mobileInput.val().replace(/\s/g, '');
    },

    __bindLoginEvent: function() {
        var self = this;
        var dialog = self.__loginDialog;
        var element = self.__loginDialog.element;

        var error = element.find('.error');
        var mobileInput = self.mobileInput;
        var codeInput = element.find('input[name="code"]');
        var loginBtn = element.find('.dialog-login-btn');
        var sendCodeBtn = element.find('.send-btn');
        var changeBtn = element.find('.login-change-tips-con');

        mobileInput.keyup(function(e) {
            // self.error('');
            // self.printError('phone','');
            self.printError('all','');
            if (mobileInput.prop('readonly')) return false;
            var mobile = self.getMobileInputValue();

            if (mobile.length == mobileInput.attr('maxlength')) {
                if (!global.isMobile(mobile)) {
                    // self.error('手机号码不正确');
                    self.printError('phone','手机号码不正确');
                    return false;
                }
            } else if (!/^\d*$/.test(mobile)) {
                // self.error('手机号码只能为数字!');
                self.printError('phone','手机号码只能为数字!');
                return false;
            }

            if (global.isMobile(mobile)) {
                if(self.__isUseGeetest() || self.isVelidateImgCode()){
                    sendCodeBtn.removeAttr('disabled');
                }else{
                    sendCodeBtn.prop('disabled', true);
                }
                
            } else {
                sendCodeBtn.prop('disabled', true);
            }

        });

        mobileInput.keydown(function(e){
            if(e.keyCode == 8){
                // 删除
                let index = getCursortPosition(mobileInput[0]);
                if(index == 0) return;
                if(index == 4 || index == 9){
                    let oldVal = '';
                    let mobile = oldVal = mobileInput.val();
                    mobile = mobile.slice(0, index - 2) + mobile.slice(index);
                    mobile = self.formatMobile(mobile);
                    mobileInput.val(mobile);
                    self.setCaretPosition(index, oldVal, 1);
                    return false;
                }
            }
        });

        // 兼容ie8 会触发两次做一次val对比
        mobileInput.bind('input keyup', function(){
            var val = mobileInput.val();
            var r = self.formatMobile(val);
            if(r !== val){
                let index = getCursortPosition(self.mobileInput[0]);
                mobileInput.val(r);
                self.setCaretPosition(index, val, 0);
                // 号码改变时要隐藏
                self.hideVoice();
            }
            // 号码改变要清空
            // let loginBtn = self.__loginDialog.find('.dialog-login-btn');
            loginBtn.removeData('type');
        });

        element.on('click', '.send-btn', function() {
            self.hideVoice();
            if(self.__isUseGeetest()){
                self.__sendCode();
            }else{
                self.__submitImgCode()
                .done(function(res){//图形验证码校验成功
                    self.__sendCode();
                })
                .fail(function(res){//图形验证码校验失败
                    $.jps.trigger('login-refresh-imgcode');
                });
            }
            
        });

        codeInput.keyup(function(e) {
            // self.error('');
            // self.printError('smscode','');
            self.printError('all','');
            if (codeInput.prop('readonly')) return false;
            var code = $.trim(codeInput.val());
            var mobile = self.getMobileInputValue();


            if (self.__isCode(code) && global.isMobile(mobile)) {
                if(self.__isUseGeetest()){
                    loginBtn.prop('disabled', false);
                }else if(self.isVelidateImgCode()){
                    loginBtn.prop('disabled', false);
                }
            } else {
                loginBtn.prop('disabled', true);
                if (!/^\d*$/.test(code)) {
                    // self.error('请输入正确的验证码!');
                    self.printError('smscode','请输入正确的验证码!');
                }
            }
            if (e.keyCode == 13) {
                loginBtn.trigger('click');
                return false;
            }
        });

        element.on('click', '.dialog-login-btn', function() {
            //登录按钮
            var type = loginBtn.data('type');

            if(type === undefined){
                self.getLoginType(function(t){
                    self.__logReg(t);
                });
            }else{
                self.__logReg(type);
            }

            return false;
        });

        element.on('click', '.change-mode', function() {
            var d = element.find('.mod-login');
            var hasVoice = d.hasClass('hasVoice') ? ' hasVoice' : '';

            if (d.hasClass('main')){
                d.attr('class', 'mod-login scan' + hasVoice);
                loginScan.initQRcode(element);
            }else{
                d.attr('class', 'mod-login main'+ hasVoice);
            }

            return false;
        });

        element.on('click', '.overtime .btn', function(){
            loginScan.initQRcode(element);
        });

        element.on('click', '.send-voice-btn', function(){
            let elem = $(this);
            elem.prop("disabled",true);
            userUtils.sendVoiceCode({
                mobile: self.getMobileInputValue()
            })
            .done(function(d){
                elem.prop("disabled",false);
                if(!d) d = {};

                if(d.result == 1){
                    // 一分钟内不能重复发送
                    self.voiceSecondCountDown(d.seconds);
                }else if(d.result == -7){
                    // 已达获取上限，请获取短信验证码登录
                    self.showVoiceTip('已达获取上限，请获取短信验证码登录');
                }else if(d.result == 0){
                    self.showVoiceTip('电话已拨出，请注意接听来自1010-6622的电话');
                }
            })
            .fail(function(e){
                elem.prop("disabled",false);
            });
        });


        let validateBtn = $('.mod-login-validate-btn'),
            validateInput = $('#valiedate-input'),
            validateImg = $('#login-validate-img');

        //刷新验证码图片

        $.jps.remove('login-refresh-imgcode');
        $.jps.on('login-refresh-imgcode',function(){
            let src = '/imageCode.action?mobile=' + self.getMobileInputValue();
            validateInput.val('');
            validateInput.trigger('keyup').focus();
            validateImg.attr('src', src + '&v=' + new Date().getTime());
        });
        $.jps.trigger('login-refresh-imgcode');
        //换一换
        validateImg.click(function(){
            if(validateInput.prop("readonly"))return;
            let phoneNum = self.getMobileInputValue();
            if(global.isMobile(phoneNum)){
                $.jps.trigger('login-refresh-imgcode');
            }else{
                self.printError('phone','请填写正确的手机号')
            }
        });

        validateInput.on('keyup', function(e) {
            var val = this.value.replace(/'/g, '');
            var lg = val.length;
            var max = $(this).prop('maxlength');
            let mobile = self.getMobileInputValue();

            if (lg >= max && self.isVelidateImgCode() && global.isMobile(mobile)) {
                sendCodeBtn.prop('disabled', false);
            } else {
                sendCodeBtn.prop('disabled', true);
                // $validate.find('.error').html('');
            }

            if (e.keyCode == 13) {
                sendCodeBtn.trigger('click');
            }
        });
        // .on('click', function() {
        //     // setTimeout(function(){
        //     //      $validateInput.trigger('click');
        //     // }, 100);

        //     setInterval(function() {
        //         validateInput.trigger('keyup');
        //     }, 300)
        // });
        changeBtn.click(function(){
            viewManager.changeType();
        });
    },
    __submitImgCode: function(){
        let self = this,
            deffer = $.Deferred(),
            mobile = self.getMobileInputValue(),
            imageCode = $('#valiedate-input').val();

        self.printError('all','');

        if(!global.isMobile(mobile)){
            deffer.reject();
            return deffer.promise();
        }
        if (!$.trim(imageCode)) {
            self.printError('smscode','请填写验证码');
            deffer.reject();
            return deffer.promise();
        }
        if(!self.isVelidateImgCode()){
            self.printError('smscode','验证码格式不正确');
            deffer.reject();
            return deffer.promise();
        }
        userUtils.checkImageCode({
            mobile: mobile,
            image: imageCode,
            callback: function(d) {
                if (d.status == 1) {
                    self.printError('imgcode','');
                    deffer.resolve(d);
                } else {
                    self.printError('imgcode','验证码输入错误，请重新输入');
                    deffer.reject(d);
                }
            },
            errorCallback: function(d){
                self.printError('imgcode','验证码校验失败');
                deffer.reject(d);
            }
        });
        return deffer.promise();
    },
    __sendCode: function(isSecond) {
        var self = this;
        var dialog = self.__loginDialog;
        var sendBtn = dialog.find('.send-btn');
        var error = dialog.find('.error');
        var mobileInput = self.mobileInput;
        var mobile = self.getMobileInputValue();
        var loginBtn = dialog.find('.dialog-login-btn');
        const jiyanFlag = self.__isUseGeetest() ? 1 : 0;
        if (sendBtn.prop('disabled')) return false;

        // self.printError('phone','');
        self.printError('all','');
        // self.error('');

        if (!mobile) {
            mobileInput.focus();
            self.printError('phone','请输入您的手机号码!');
            // self.printError('phone','手机号码不能为空!');
            // self.error('手机号码不能为空!');
            return false;
        }

        if (!global.isMobile(mobile)) {
            mobileInput.focus();
            self.printError('phone','手机号码不正确!');
            // self.error('手机号码不正确');
            return false;
        }

        userUtils.sendCode({
                mobile: mobile,
                type: 0,
                jiyanFlag: jiyanFlag,
                beforeCallback: function() {
                    sendBtn.prop('disabled', true).html('正在提交...');
                    mobileInput.attr('readonly', true);
                }
            })
            .done(function(d) {
                if (d.status == 2 || d.status == 3) { //登录/注册

                    self.codeCountdown();

                    // dialog.find('.code-panel').find('input[name="code"]').focus();

                    if (d.status == 2) {
                        //登录
                        loginBtn.data('type', 'login');
                        //百度统计
                        _hmt.push(['_trackEvent', 'login', 'sign_up', 'old']);
                    }

                    if (d.status == 3) {
                        //注册
                        loginBtn.data('type', 'register');
                        dialog.find('.login-title').html('注册');
                        //百度统计
                        _hmt.push(['_trackEvent', 'login', 'sign_up', 'new']);
                    }
                } else if (d.status == 6) { // 发送验证码过于频繁，需要图形验证
                    self.codeCountdown();
                    // dialog.find('.code-panel').find('input[name="code"]').focus();
                    self.printError('smscode','发送短信过于频繁');
                } else {
                    mobileInput.prop('readonly', false);

                    sendBtn.html('发送验证码').prop('disabled', false);
                    if (d.status == 4) {
                        mobileInput.focus();
                        self.printError('smscode', '很抱歉，您的号码没有通过安全验证');
                        // self.error('很抱歉，您的号码没有通过安全验证');
                    } else {
                        mobileInput.focus();
                        self.printError('smscode', '未知错误!');
                        // self.error('未知错误!');
                    }
                }
            })
            .fail(function(e) {
                mobileInput.prop('readonly', false);
                sendBtn.prop('disabled', false).html('发送验证码');
                self.error('all','');
                // self.error('');
            });

        return false;
    },

    // 语音播出倒计时
    voiceSecondCountDown: function(seconds) {
        var self = this;
        if(!seconds) self.showVoice();

        var s = seconds;

        function countDown() {
            if(!self.__loginDialog.element){
                return ;
            }

            if (s <= 1) {
                self.showVoice();
            } else {
                s--;
                self.showVoiceTip('电话已拨出，请在' + s + '秒后获取');
                if(self.__loginDialog.find('.mod-login').hasClass('hasVoice')){
                    setTimeout(countDown, 1000);
                }
            }
        }
        countDown();
    },

    // 验证码倒计时
    codeCountdown: function() {
        var self = this;
        var dialog = self.__loginDialog;
        let codetips = dialog.find('.smscode-tips');

        var count = 60;

        var sendBtn = dialog.find('.send-btn').prop('disabled', true).html('重发验证码 ' + count);
        var mobileInput = dialog.find('input[name="mobile"]').prop('readonly', true);
        var codeInput = dialog.find('input[name="imgcode"]').prop('readonly', true);
        codetips.show();
        function countDown() {
            if(!dialog.element){
                codetips.hide();
                return ;
            }
            if (count <= 1) {
                self.__resetSendNum++;
                sendBtn.prop('disabled', false).html('发送验证码');
                codetips.hide();
                if(self.__resetSendNum === 2){
                    self.showVoice();
                }
                mobileInput.prop('readonly', false);
                codeInput.prop('readonly',false);
            } else {
                count--;
                // if(count == VOICE_SECOND){
                //     self.showVoice();
                // }
                sendBtn.html('重发验证码 ' + count);
                
                setTimeout(countDown, 1000);
            }
        }

        setTimeout(countDown, 1000);
    },

    showVoice: function(){
        this.__loginDialog.find('.mod-login').addClass('hasVoice');
        this.showVoiceTip('还没收到短信验证码？点击“没收到”接听来自1010-6622的电话获取验证码');
    },

    hideVoice: function(){
        this.__loginDialog.find('.mod-login').removeClass('hasVoice');
    },

    __isCode: function(code) {
        return /^\d{4}$/.test(code);
    },

    getLoginType: function(callback){
        let self = this;
        let mobile = this.getMobileInputValue();
        $.ajax({
            url: '/checkMobileExist.action',
            data: {
                mobile: mobile
            }
        })
        .done((d)=>{
            let type = 'login';
            if(d.status == 3){
                type = 'register';
            }else if(d.status == 2){
                type = 'login';
            }

            let loginBtn = self.__loginDialog.find('.dialog-login-btn');
            loginBtn.data('type', type);

            callback && callback(type);
        });
    },

    // 登录注册验证
    __logReg: function(type) {
        var self = this;
        var dialog = self.__loginDialog;
        var error = dialog.find('.error');
        var mobileInput = dialog.find('input[name="mobile"]');
        var sendBtn = dialog.find('.send-btn');
        var codeInput = dialog.find('input[name="code"]');
        var loginBtn = dialog.find('.dialog-login-btn');
        var mobile = self.getMobileInputValue();
        var tipText;
        if(type == 'login'){
            tipText = '登录';
        }else if(type == 'register'){
            tipText = '注册';
        }

        // var url = type == 'login' ? '/login.action' : '/register.action';
        var isRegister = type == 'register';
        var code = $.trim(codeInput.val());

        // self.error('');
        self.printError('all','');

        if (!code || !self.__isCode(code)) {
            // self.error('请输入正确的验证码!');
            self.printError('smscode','请输入正确的验证码!');
            return false;
        }

        mobileInput.prop('readonly', true);
        codeInput.prop('readonly', true);
        loginBtn.prop('disabled', true).html('正在' + tipText + '...');

        userUtils.logReg({
            mobile: mobile,
            code: code,
            type: type,
            errorCallback: function() {
                if (!sendBtn.prop('disabled')) mobileInput.prop('readonly', false);
                codeInput.prop('readonly', false).val('');
                loginBtn.prop('disabled', false).html(tipText);
                // self.error('系统错误,' + tipText + '失败!');
                self.printError('smscode','系统错误,' + tipText + '失败!');
            },
            callback: function(d) {
                if (!sendBtn.prop('disabled')) mobileInput.prop('readonly', false);
                codeInput.prop('readonly', false);
                loginBtn.html(tipText);
                if (d.status == 1) { //登录/注册成功

                    if (isRegister) {
                        //设置缓存,用于统计
                        localStorage.setItem('registMobile', mobile);
                        localStorage.setItem('registUserId', d.userId);
                        //百度统计
                        _hmt.push(['_trackEvent', 'Reg01', 'click']);
                    }
                    self.loginSuccess(d);
                    // } else if (d.status == 2) {
                    //     mobileInput.focus();
                    //     codeInput.val('');
                    //     self.error(tipText + '失败,用户已注册!');
                    // } else if (d.status == 3) {
                    //     codeInput.val('');
                    //     mobileInput.focus();
                    //     self.error(tipText + '失败,用户未注册!');
                    // } else if (d.status == 4) {
                    //     codeInput.val('');
                    //     mobileInput.focus();
                    //     self.error('很抱歉，您的号码没有通过安全验证');
                    // } else if (d.status == 5) {
                    //     codeInput.val('').focus();
                    //     self.error('验证码错误!');
                //发卡券活动
                } else if(d.status == 8 && isRegister){
                    delete d.reffer;
                    if (!self.hideCouponDialog){
                        setTimeout( function(){
                            var dialogCard =  new gdialog.Dialog({
                                width: 376,
                                height: 445,
                                showTitle: false,
                                showFooter: false,
                                message: template.draw(typeTpl, {
                                    type: 'send-coupon',
                                    qrcodeimg: iwjw.getQRImage({w:133,h:133})
                                }),
                                cssClass: 'animated zoomIn'
                            });
                        },0)
                    }
                    self.loginSuccess(d);
                //新注册用户上海北京佣金8折活动
                } else if(d.status == 9 && isRegister) {
                    delete d.reffer;
                    setTimeout( function(){
                        var dialogCard =  new gdialog.Dialog({
                            width: 376,
                            height: 454,
                            showTitle: false,
                            showFooter: false,
                            message: template.draw(typeTpl,{
                                type: 'commission-discount',
                                qrcode: iwjw.getQRImage()
                            }),
                            cssClass: 'animated zoomIn'
                        });
                    },0)
                    self.loginSuccess(d)
                } else {
                    codeInput.val('');
                    // self.error('登录失败,未知错误!');
                    // self.error(d.msg);
                    self.printError('smscode',d.msg);
                    self.loginLogger('error_verification')
                }
            }
        });
    },

    loginSuccess: function(d){
        var self = this;
        var dialog = self.__loginDialog;

        userUtils.clearVisitor();

        // 关闭 dialog 后 手机扫码可能触发 loginSuccess
        if(dialog.element){
            var loginBtn = dialog.find('.dialog-login-btn');

            dialog.close();
            loginBtn.prop('disabled', false);
        }

        var callback = self.__loginCallback;
        var reffer = d.reffer;

        if (callback instanceof Function) {
            reffer = '';
        }

        if (callback != null && callback.refererUrl != null) {
            reffer = callback.refererUrl;
        }

        d.reffer = reffer;
        if (reffer) {
            if (callback instanceof Function) {
                callback();
            }
            global.locationReload(reffer);
        } else {
            self.initVisitor(function() {
                if (callback instanceof Function) {
                    callback();
                }
            });
        }
    },

    formatMobile: function(mobile){
        mobile = mobile.replace(/\s/gi, "");
        var r = mobile.replace(/^(\w{3})(\w*)$/, "$1 $2");
        r = r.replace(/^(\w{3}\s)(\w{4})(\w*)$/, '$1$2 $3');
        return r;
    },

    setCaretPosition: function(index, val, type){
        var value = this.mobileInput.val();

        if(type == 0){ //增加
            if( index == 3 || index == 8 ) index ++;
        }

        if(type == 1){ //删除
            if( index == 4 || index == 9) index = index - 2;
        }

        setCaretPosition(this.mobileInput[0], index);
    },

    //为了使极验拖动报错和切换图片验证的tips互斥显示
    setGtError: function(str){
        let self = this,
            element = self.__loginDialog.element,
            gtError = element.find('#geetest-error'),
            gtTips = element.find('#login-change-tips');
        if(str == '' && self.__currentDragErrorTimes >= self.__maxErrorNum){
            gtTips.show();
            gtError.text(str);
        }else{
            gtTips.hide();
            gtError.text(str);
        }
    },

    error: function(str){
        var self = this;
        var element = self.__loginDialog.element;
        var error = element.find('.error');

        error.html(str);
        element.find('.voice-tips').hide();
    },

    printError: function(which,str){
        let self = this,
            element = self.__loginDialog.element,
            phoneError = element.find('#sp-error1'),
            imgCodeError = element.find('#sp-error2'),
            smsCodeError = element.find('#sp-error3'),
            error = element.find('#sp-default-error'),
            gtError = element.find('#geetest-error'),
            gtTips = element.find('#login-change-tips');
        switch(which){
            case 'phone':
                phoneError.text(str);
                break;
            case 'imgcode':
                imgCodeError.text(str);
                break;
            case 'smscode':
                smsCodeError.text(str);
                break;
            case 'geetest':
                self.setGtError(str);
                break;
            case 'all':
                phoneError.text(str);
                imgCodeError.text(str);
                smsCodeError.text(str);
                self.setGtError(str);
            default:
                error.text(str);
                break;
        }
        element.find('.voice-tips').hide();
    },

    showVoiceTip: function(str){
        var self = this;
        var element = self.__loginDialog.element;

        self.printError('all','');
        element.find('.smscode-tips').hide();
        element.find('.voice-tips').html(str).show();

        // element.find('.error').html('');
    },
    isVelidateImgCode(){
        let code = $('#valiedate-input').val();
        const reg = /^[0-9a-zA-Z]{4}$/
        if($.trim(code)){
            return reg.test(code);
        }else{
            return false;
        }
    }

};


module.exports = login;
