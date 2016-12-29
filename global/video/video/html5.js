/*
 * @Author: jade
 * @Date:   2016-02-29 16:25:54
 * @Last Modified by:   vavid
 * @Last Modified time: 2016-04-11 15:37:51
 */

'use strict';
var browser = global.browser;
var utils = require('../utils.js');
var html5 = function(container, options) {
    this.init(container, options);
};

html5.prototype = {
    init: function(container, options) {
        var self = this;
        self.container = container;
        self.options = options;

        // 视频
        self.$player = $('.video-player', container);

        self.player = self.$player[0];
        self.events();
    },
    events: function() {
        var self = this;
        var container = self.container;
        var player = self.player;
        var $player = self.$player;

        $player.bind('loadedmetadata', function() {
            container.trigger('loading-hide');
        });

        // 1 = MEDIA_ERR_ABORTED - fetching process aborted by user
        // 2 = MEDIA_ERR_NETWORK - error occurred when downloading
        // 3 = MEDIA_ERR_DECODE - error occurred when decoding
        // 4 = MEDIA_ERR_SRC_NOT_SUPPORTED - audio/video not supported
        player.addEventListener('error', function(evt) {
            var errorCode = -1;
            try {
                switch (evt.target.error.code) {
                    case 2:
                        //网络错误
                        errorCode = 2;
                        break;
                    case 3:
                        //视频解析错误
                        errorCode = 3;
                        break;
                    default:
                        errorCode = 3;
                        break;
                }
            } catch (e) {
                //归于视频解析错误
                errorCode = 3;
            }
            container.trigger('video-error', {
                type: 'html5',
                errorCode: errorCode
            });
        }, true);
    },
    duration: function() {
        return this.player.duration;
    },
    paused: function() {
        return this.player.paused;
    },

    play: function() {
        this.player.play();
    },

    pause: function() {
        this.player.pause();
    },

    setSrc: function(video_src) {
        this.$player.attr('src', video_src);
    },

    ended: function() {
        var tag = Math.abs(this.currentTime() - this.duration()) < 0.9;
        var test = 1;
        test++;
        if(tag) {
            this.currentTime(this.duration())
        }
        return tag;
    },
    currentTime: function(time) {
        if (typeof time !== 'undefined') {
            this.player.currentTime = time;
        } else {
            return this.player.currentTime;
        }
    },
    volume: function(volume) {
        if (typeof volume !== 'undefined') {
            this.player.volume = volume;
        } else {
            return this.player.volume;
        }
    },
    bufferedPercent: function() {
        var self = this;
        var player = self.player;
        var buffered = player.buffered,
            duration = player.duration;
        if(buffered.length == 0) return false;
        var end = buffered.end(buffered.length - 1);

        if (end > duration) {
            end = duration;
        }

        return utils.percentify(end, duration);
    }
};

module.exports = html5;
