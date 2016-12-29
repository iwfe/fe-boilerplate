
require('./reactive-slider.scss')
// import Plugin from './slider_index.js';
import Plugin from './Slider.js';
var pluginName = function(options) {

    var instance = null;
    // 调用弹窗组件
    var agentDialog = new dialog.Dialog({
        width: $(window).width(),
        height: $(window).height(),
        isConfirm: false,
        isAlert: true,
        isTransparent: true,
        isFullScreen: true,
        cssClass: 'dialog-responsiveslide',
        message: '',
        showTitle: false,
        showFooter: false,
        closeCallback: function() {
            instance && options.callBack && options.callBack.closeCallback(instance.currentIndex);
        }
    });

    options = $.extend(true, options, {
        dialog: agentDialog
    })

    var target = agentDialog.find('.dialog-content').get(0);
    instance = new Plugin(target, options);

    return instance;
}

if (window.IWJW) {
    window.IWJW.responsiveslide = pluginName;
}
module.exports = pluginName;