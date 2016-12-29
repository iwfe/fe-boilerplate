'use strict';
/**
 * Created by zyy on 15/5/8.
 * zhangyuyu@superjia.com
 */
var staticUrl = pageConfig.staticUrl
var downTpl = require('./down.html');
var headerTpl = require('./header.html');
var navData = require('../../components/nav/nav.json.js');
import login from '../../components/login/login.js';
import headerLog from './log.js';
import user_utils from 'user_utils';
import Message from './message';
import './header.scss';

var header = {
    init: function(container) {
        var self = this;
        self.container = container;
        login.init(container);
        self.__bindEvent();
        user_utils.onUserChange(function(visitor){
            self.initLogin(visitor.user || {});
            self.initProvince(visitor.province);
        });
        headerLog.init(container);
    },

    __bindEvent: function() {
        var self = this;
        var container = self.container,
            $right = $('.header-right'),
            $headWrap = $(".iwjw-wrap");

        // 全局判断登录
        // 前提条件 [data-url] [.login-require]
        $headWrap.on('click', '.login-require,.login', function(evt) {
            var $this = $(this);
            var url = $this.data('url');
            var hideCoupon = false;
            if ($this.hasClass('j-collect-list') || $this.hasClass('see-list')){
                hideCoupon = true;
            }
            self.verifyLogin({
                refererUrl: url
            }, true, hideCoupon);

            return false;
        });

        //为了兼容全局登录按钮，以后加个login-btn就可以弹出登陆框
        $('.login-btn').click(function() {
            login.verifyLogin();
        });

        // 全局判断是否登录
        // 如果没有登录则跳出弹出框
        // 如果登录则跳转该URL的地址
        // 后侧悬浮反馈
        $headWrap.on('click', '.suspend-report', function(event) {
            var visitor = window.pageConfig.visitor;
            var $this = $(this);
            var url = $this.data('url');
            var hideCoupon = $this.hasClass('j-feedback') ? true : false;
            if (!visitor || !visitor.user.userId) {
                self.verifyLogin({
                    refererUrl: url
                }, true, hideCoupon);

                return false;
            }
        });
        //登录
        // $right.on('click', '.login', function() {
        //     login.showLoginDialog();
        // });
        //登出
        $right.on('click', '.user-item-logout', function() {
            self.logout();
        });
    },

    //初始化登录信息
    initLogin: function(user) {
        var self = this,hasLogged = false;
        var container = self.container;
        if (user && user.status == 1) {
            var mineDownHtml = template.draw(downTpl, {
                data: navData,
                user: user,
                type: 'mine-down'
            });
            var tripDownHtml = template.draw(downTpl, {
                user: user,
                type: 'trip-down'
            })
            //如果登录了，获取该用户的消息
            if (user.uname) {
                hasLogged = true;
            }
            if (user.reffer) global.locationReload(user.reffer);
        } else {
            $('.login', container).addClass('none').html('<em class="iconfont if-login-register"></em><i class="nav-item-txt">登录/注册</i>');
            $('#Itinerary .user-num,#Showings .shape-circle', container).addClass('hide');
        };

        //重绘header
        var headerRedraw = function() {
            var headerRedrawHtml = template.draw(headerTpl, {
                user: user || {},
                flag: pageConfig.flag,
                mineDown: mineDownHtml, //我的下拉模板
                tripDown: tripDownHtml //看房行程下拉模板
                //地图页列表页（不包含新房列表页）头部不展示汉字只展示icon
                // showName: window.pageConfig.staticTag == 'map' ? false : window.pageConfig.staticTag == 'list' ? false : true
            })
            $('.header-right').html(headerRedrawHtml);
            ReactDOM.render(<Message hasLogged = {hasLogged} callback = {(param)=>self.verifyLogin(param)}/>, document.getElementById('message-nav'));
        }

        //当一个页面调用了两次checklogin接口时（例如header.refresh），
        //为避免两次重绘导致体验差，对比两次接口的返回值是否相等，不相等再进行重绘。
        if (self.user) {
            var noEqual = false;
            _.map(user, function(val, key) {
                if (self.user[key] != val) {
                    noEqual = true;
                }
            });

            if (noEqual) headerRedraw();

        } else {
            headerRedraw();
        }
        //保存上一次的user对象
        self.user = user;
    },

    //初始化城市
    initProvince: function(province) {
        if(!province) return;
        var self = this;
        var container = self.container;
        var provincePanel = container.find('.province');

        if (provincePanel.size() > 0) {
            provincePanel.parent('.city').removeClass('none');
            provincePanel.attr({
                'provinceId': province.id,
                'provincePy': province.py
            }).html(province.text + '<i class="iconfont">&#xd619;</i>');
        }
    },

    verifyLogin: function() {
        login.verifyLogin.apply(login, arguments);
    },

    refresh: function() {
        login.refreshVisitor.apply(login, arguments);
    },

     // 用户打开多张页面，在其中一张页面退出登录，
    // 在其他页面做需要登录的操作并接口返回未登录状态时调用verifyLogin前可以先clearLogin
    clearLogin: function() {
        login.clearLogin();
    },

    logout: function() {
        login.logout();
    }
};

// header是后端渲染时直接init
let $header = $('.mod-header');

//地图页没有mod-header
if($header.length == 0){
    $(function() {
        header.init($('.mod-header'));
        $('.header-city-wrap.wrap-iframe').height($('.header-city-wrap.wrap-b').height());
    });
}else{
    header.init($('.mod-header'));
}

export default header;
