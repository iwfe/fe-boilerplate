/*
 * @Author: liyaping
 * @Date:   2016-03-18 11:46:52
 * @Last Modified by:   huangxiaogang
 * @Last Modified time: 2016-07-8 18:33:13
 * @Last Modified content: 增加初始化的callback回调
 */

'use strict';
var mapPoint = require('./point.js');
var surround = require('./surround.js');
var tpl = require('./map.html');

var bdmap = {
    inited: false,
    BMap: null,
    init: function(container, options,callback) {
        var self = this,
            mapOpt = {
                mapContainer: 'map',
                defaultZoom: 13, // 默认13
                minZoom: 12,
                maxZoom: 19,
                lon: null,
                lat: null,
                needSurround: false,
                addOverlay: { content: '', canClear: true, style: '', flag: '', lon: '', lat: '' }, // TODO flag为暂留字段，可不传
                zoomendCallback: $.noop,
                dragendCallback: $.noop
            };
        self.container = container;
        options = self.options = $.extend({}, mapOpt, options);

        if (!BMap) {
            $.jps.trigger('log', {
                type: 'map-error',
                status: 404,
                message: '地图js加载失败'
            })
        }

        var map = self.BMap = new BMap.Map(options.mapContainer, {
            enableMapClick: false,
            minZoom: options.minZoom,
            maxZoom: options.maxZoom
        });

        if (BMAP_STATUS_PERMISSION_DENIED != 6) {
            $.jps.trigger('log', { //日志
                type: 'map-error',
                status: 500,
                code: 6,
                message: '没有权限'
            });
        }
        if (BMAP_STATUS_SERVICE_UNAVAILABLE != 7) {
            $.jps.trigger('log', { //日志
                type: 'map-error',
                status: 500,
                code: 7,
                message: '服务不可用'
            });
        }
        if (BMAP_STATUS_TIMEOUT != 8) {
            $.jps.trigger('log', { //日志
                type: 'map-error',
                status: 500,
                code: 8,
                message: '超时'
            });
        }

        // map.enableScrollWheelZoom();
        map.disableDoubleClickZoom();
        map.enableKeyboard();
        map.disableInertialDragging();
        map.disableContinuousZoom();
        // map.disablePinchToZoom();

        // 解决报错：Cannot read property 'Te'
        // map.setCurrentCity(staticJson.provincePy)

        // 兼容IE8处理
        // setTimeout(function() {
        var center = (options.lon && options.lat) ? new BMap.Point(options.lon, options.lat) : pageConfig.provincePy;
        map.centerAndZoom(center, options.defaultZoom)
            // }, 300);


        // 地图加载完成
        map.addEventListener('tilesloaded', function() {
            if (!self.inited) {
                // 控件的添加需放在load之后 完成后再添加比例尺控件，不然初始化时标尺会变形，体验比较糟糕
                map.addControl(new BMap.ScaleControl({
                    anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
                    offset: new BMap.Size(20, 20)
                }));
                $.jps.trigger('map-inited');
                self.events();
                container.before(template.draw(tpl, { tplType: 'zoom' }));
                self.inited = true;
                callback && callback.apply(self);
            }
        });
        // 缩放
        map.addEventListener('zoomend', function() {
            setTimeout(function() {
                if (self.inited) {
                    options.zoomendCallback();
                }
            }, 200)
        });

        // 拖移
        map.addEventListener('dragend', function() {
            options.dragendCallback();
        });

        $.jps.on('map-inited', function() {
            if (options.needSurround) surround.init(self.BMap);
            if (options.addOverlay.content) {
                var mark = new mapPoint.init(options.addOverlay, {
                    defZ: 9
                });
                mark.setContent(options.addOverlay.content);
                if (!options.addOverlay.canClear) mark.disableMassClear();
                map.addOverlay(mark);
                // setTimeout(()=>{
                //     map.addOverlay(mark.marker);
                // },500)

            }
        });
    },
    events: function() {
        var self = this;
        var container = self.container;

        container.parent().on('click', '.zoom-btn', function() {
            var $dom = $(this),
                zoomFlag = $dom.hasClass('zoom-in') ? 'zoomIn' : 'zoomOut';
            self.BMap[zoomFlag]();
        });

        $(document).on('click', function(event) {
            var $et =  $(event.target);
            var map = $et.parents('#' + self.options.mapContainer).length;
            var surItem = $et.parents('.surround-item').length;
            //点击了地图或者公交，地铁等则开启滚轮缩放
            if (map || surItem) self.BMap.enableScrollWheelZoom();
            else self.BMap.disableScrollWheelZoom();
        });

    }
}

module.exports = bdmap;
