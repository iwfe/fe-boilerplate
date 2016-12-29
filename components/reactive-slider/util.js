// 检测是否支持transition
var supportsTransition = (function() {
    var docBody = document.body || document.documentElement;
    var styles = docBody.style;
    var prop = "transition",
        vendors = [];

    if (typeof styles[prop] === "string") {
        return {
            isSupport: true,
            vendor: ''
        };
    }

    vendors = ["Moz", "webkit", "Khtml", "o", "ms"];
    // 转换transition -> Transition
    prop = prop.charAt(0).toUpperCase() + prop.substr(1);

    for (var i = 0; i < vendors.length; i++) {
        if (typeof styles[vendors[i] + prop] === "string") {
            return {
                isSupport: true,
                vendor: vendors[i]
            }
        }
    }
    return false;
})();

// 函数节流
function throttle(method, timer, context) {
    clearTimeout(method.flag);
    method.flag = setTimeout(function() {
        method.call(context);
    }, timer);
};
let defaultOption = {
    // 指定开始显示资源位置
    startIndex: 1,
    autoGenerateHtml: false,
    // 强制资源盛满屏幕
    forceSize: false,
    width: '',
    height: '',
    // 是否支持键盘
    isSupportKeyboard: false,
    // 是否支持触摸
    isSupportTouch: false,
    // 是否支持轮播
    isLoop: true,
    // 资源：图片，视频
    asset: [
        // {
        //     title: '图片说明',
        //     type: 'image',
        //     content: '123.jpg'
        // }
    ],
    // 左右箭头
    navigation: {
        active: true,
        effect: "slide"
    },
    // 圆点页码导航
    pagination: {
        active: false,
        effect: "slide",
        maxLength: 0
    },
    pagenumber: {
        active: true,
        effect: "slide"
    },
    // 动画效果时间
    effect: {
        slide: {
            speed: 500
        },
        fade: {
            speed: 300
        }
    },
    tip: {
        active: false,
        messag: ''
    },
    callBack: {
        loaded: $.noop,
        start: $.noop,
        complete: $.noop,
        videoInit: $.noop,
        slide: $.noop,
        // 关闭弹窗回调
        closeCallback: function() {}
    }
};

module.exports={
    supportsTransition,
    throttle,
    defaultOption
}
