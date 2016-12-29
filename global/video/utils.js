/*
* @Author: jade
* @Date:   2016-02-29 18:32:58
* @Last Modified by:   jade
* @Last Modified time: 2016-03-04 20:38:56
*/

'use strict';
var util = {
    percentify: function(time, end) {
        var percent = time / end || 0; // no NaN
        return (percent >= 1 ? 1 : percent) * 100 + '%';
    },

    formatTime: function(time) {
        var result = '';
        var second = time % 60;
        var minute = ~~(time / 60);

        if (minute < 10) {
            result += '0';
        }
        result += minute + ':';
        if (second < 10) {
            result += '0';
        }
        result += second;
        return result;
    },

    hasFlash: function() {
        if (document.all) {
            try {
                var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                return true;
            } catch (e) {
                return false;
            }
        } else {
            try {
                var swf = navigator.plugins['Shockwave Flash'];
                if (swf == undefined) {
                    return false;
                } else {
                    return true;
                }
            } catch (e) {
                return false;
            }
        }
    },

    setDefinition: function(def) {
        let d = {};
        d.def = def;
        d.__expired = new Date().getTime() + 1000 * 60 * 30;
        global.setLocalStore('IWJW_Definition', d);
    },

    getDefinition: function() {
        let data = global.getLocalStore('IWJW_Definition') || {def: 'hd'};
        return data.def;
    },

    getInitDefinition: function(srcs, type){
        let def = this.getDefinition();

        if(type === 0){
            if(srcs[def]){
                return def;
            }else{
                if(srcs['hd']){
                    this.setDefinition('hd');
                    return 'hd';
                }

                if(srcs['sd']){
                    this.setDefinition('sd');
                    return 'sd';
                }
            }
        }else{
            let fdef = 'f_' + def;
            if(srcs[fdef]){
                return def;
            }else{
                if(srcs['f_hd']){
                    this.setDefinition('hd');
                    return 'hd';
                }

                if(srcs['f_sd']){
                    this.setDefinition('sd');
                    return 'sd';
                }
            }
        }

    },

    clearDefinition: function() {
        global.setLocalStore('IWJW_Definition', null);
    }, 

    changeVideo: function(curType) {
        let def = this.getDefinition();
        if(curType === 0){
            $.jps.trigger('fullVideo-show', {def: def});
        }else{
            $('#IWJWplayer').show();                     
            $('#IWJWplayer-FD').hide();                     
            $.jps.trigger('changeVideo-to-common', {def: def});
        }
    },
};

module.exports = util;
