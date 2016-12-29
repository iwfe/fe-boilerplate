/* 
 * @Author: liyaping
 * @Date:   2015-12-21 11:15:21
 * @Email:  liyaping@superjia.com
 * @Last Modified by:   lancui
 * @Last Modified time: 2016-06-21 17:59:01
 */
'use strict';
var fontFamily = '"helvetica", "arial", "PingHei", "Hiragino Sans GB", "Microsoft Yahei", "STHeiti", "sans-serif"'

var mapPoint = {
    init: function(item, options) {
        var self = this,
            opt = {
                defZ: 8, // 默认zIndex值
                activeZ: 16, // hover zIndex值
                changeFontFamily:false
            },
            mPoint = new BMap.Point(item.lon, item.lat),
            point = new BMap.Label(' ', {
                position: mPoint
            });

        options = self.options = $.extend(opt, options);

        point.id = item.id;
        point.index = item.index;
        point.setStyle({
            background: '',
            border: 'none',
            zIndex: 1,
            padding: 0,
            display: 'block',
            fontSize: '14px'
        });
        if(options.changeFontFamily) point.setStyle({fontFamily: fontFamily});

        point.defZ = options.defZ;
        point.activeZ = options.activeZ;
        if (item.style == "active") {
            point.active = true;
            point.setZIndex(options.activeZ);
        } else {
            point.active = false;
            point.setZIndex(options.defZ);
        }
        // hover 层级向上
        point.addEventListener('mouseover', function() {
            mapPoint.enterIcon(point);
        });
        point.addEventListener('mouseout', function() {
            mapPoint.leaveIcon(point);
        });

        // // 定位参考物 ————别删
        // var marker = point.marker = new BMap.Label('<div class="point-reference"></div>', {
        //     position: mPoint,
        //     offser: new BMap.Size(-2, -2)
        // });

        // marker.setStyle({
        //     background: '',
        //     border: 'none'
        // });
        // marker.setZIndex(20);
        return point;
    },
    enterIcon: function(point) {
        point.setZIndex(point.activeZ + 1);
        // 改变zIndex未必马上生效，需要重绘
        point.draw();
    },
    leaveIcon: function(point) {
        if (!point.active) {
            point.setZIndex(point.defZ)
        } else {
            point.setZIndex(point.activeZ);
        }
        point.draw();
    }

};

module.exports = mapPoint;
