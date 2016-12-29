/*
 * @Author: jade
 * @Date:   2016-02-29 16:25:42
 * @Last Modified by:   jade
 * @Last Modified time: 2016-03-23 10:37:22
 */

'use strict';
var videoFlash = pageConfig.staticUrl + require('./video.swf');
var utils = require('../utils.js');
var flash = function(container, options) {
    this.init(container, options);
};

window.videojs = {
    Flash: {
        onReady: function(objId) {
            var swf = $('#' + objId)[0];
            var instance = swf.instance;
            instance.checkReady(function() {
                instance.initSrc();
            });
        },
        onEvent: function(objId, eventName) {
            var swf = $('#' + objId)[0];
            var instance = swf.instance;
            if (eventName == 'canplay') {
                instance.loadedmetadata();
            }
            if (eventName == 'stageclick') {
                instance.stageclick();
            }
        },
        onError: function(objId, eventName) {
            var swf = $('#' + objId)[0];
            var instance = swf.instance;
            instance.error(eventName);
        }
    }
};

flash.prototype = {
    init: function(container, options) {
        var self = this;
        self.container = container;
        self.options = options;

        var $playerWrap = self.$playerWrap = container.find('.video-player-wrap');
        self.player = self.createEl();
        $playerWrap.append(self.player);
    },

    stageclick: function() {
        this.$playerWrap.trigger('click');
    },

    error: function(eventName) {
        var error = {};
        error = {
            eventName: eventName,
            type: 'flash',
            errorCode: 3
        };
        this.container.trigger('video-error', error);
    },

    loadedmetadata: function() {
        this.container.trigger('loading-hide');
    },

    checkReady: function(callback) {
        var self = this;
        var container = self.container;
        var player = self.player;
        var options = self.options;
        (function waitForSWF() {
            if (!!player['vjs_getProperty']) {
                callback && callback();
            } else {
                setTimeout(waitForSWF, 100);
            }
        })();
    },

    initSrc: function() {
        this.player.vjs_src(this.options.initSrc);
    },

    setSrc: function(video_src) {
        var self = this;
        self.player.vjs_src(video_src);

        setTimeout(function(){
            console.log(self.currentTime());
        }, 500);
    },

    createEl: function() {
        var self = this;
        var options = self.options;
        var container = self.container;

        var swf = videoFlash;
        var objId = _.uniqueId('video_');

        var flashVars = {
            // SWF Callback Functions
            //'readyFunction': 'iwvideo.flash.onReady',
            //'readyFunction': 'onReady'
            poster: options.poster,
            preload: 'preload',
        };

        var params = {
            'wmode': 'opaque', // Opaque is needed to overlay controls, but can affect playback performance
            'bgcolor': '#000000' // Using bgcolor prevents a white flash when the object is loading
        };

        var attributes = {
            'id': objId,
            'name': objId, // Both ID and Name needed or swf to identify itself
            'class': 'iwjw-video-flash'
        };

        self.el = $(self.getEmbedCode(swf, flashVars, params, attributes))[0];
        self.el.instance = self;

        return self.el;
    },

    getEmbedCode: function(swf, flashVars, params, attributes) {
        var objTag = '<object type="application/x-shockwave-flash" ';
        var flashVarsString = '';
        var paramsString = '';
        var attrsString = '';

        // Convert flash vars to string
        if (flashVars) {
            Object.getOwnPropertyNames(flashVars).forEach(function(key) {
                flashVarsString += key + '=' + flashVars[key] + '';
            });
        }

        // Add swf, flashVars, and other default params
        params = $.extend({
            'movie': swf,
            'flashvars': flashVarsString,
            'allowScriptAccess': 'always', // Required to talk to swf
            'allowNetworking': 'all' // All should be default, but having security issues.
        }, params);

        // Create param tags string
        Object.getOwnPropertyNames(params).forEach(function(key) {
            paramsString += '<param name="' + key + '" value="' + params[key] + '" />';
        });

        attributes = $.extend({
            // Add swf to attributes (need both for IE and Others to work)
            'data': swf,

            // Default to 100% width/height
            'width': '100%',
            'height': '100%'

        }, attributes);

        // Create Attributes string
        Object.getOwnPropertyNames(attributes).forEach(function(key) {
            attrsString += key + '="' + attributes[key] + '" ';
        });
        return objTag + attrsString + '>' + paramsString + '</object>';
    },

    duration: function() {
        return this.getProperty('duration');
    },
    paused: function() {
        return this.getProperty('paused');
    },

    play: function() {
        var self = this;
        if (self.ended()) {
            self.currentTime(0);
        }
        self.checkReady(function() {
            self.player.vjs_play();
        });
    },

    pause: function() {
        var self = this;
        self.checkReady(function() {
            self.player.vjs_pause();
        });
    },
    ended: function() {
        return this.getProperty('ended');
    },
    currentTime: function(time) {
        if (typeof time !== 'undefined') {
            this.setProperty('currentTime', time);
        } else {
            return this.getProperty('currentTime');
        }
    },
    volume: function(volume) {
        if (typeof volume !== 'undefined') {
            this.setProperty('volume', volume);
        } else {
            return this.getProperty('volume');
        }
    },
    bufferedPercent: function() {
        var self = this;
        var player = self.player;
        var buffered = self.getProperty('buffered'),
            duration = self.duration();

        if(!buffered || buffered.length == 0) return '0%';

        var end = buffered[buffered.length - 1][1];

        if (end > duration) {
            end = duration;
        }

        return utils.percentify(end, duration);
    },

    getProperty: function(property) {
        var self = this;
        if(self.isReady()){
            return self.player.vjs_getProperty(property);
        }
        return null;
    },
    setProperty: function(property, value) {
        var self = this;
        self.checkReady(function() {
            self.player.vjs_setProperty(property, value);
        });
    },
    isReady: function() {
        return !!this.player['vjs_setProperty'];
    }
};

module.exports = flash;
