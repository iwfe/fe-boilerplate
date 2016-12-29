/* 
 * @Author: liyaping
 * @Date:   2016-01-12 17:18:05
 * @Email:  liyaping@superjia.com
 * @Last Modified by:   liyaping
 * @Last Modified time: 2016-03-21 13:30:16
 */
'use strict';
var mapPoint = require('./point.js');
var tpl = require('./map.html');
require('./map.scss');

var surround = {
    inited: false,
    local: null,
    FLAG: 'surround',
    keyWord: {
        txt: null,
        icon: null
    },
    lastTxt: '',

    init: function(container, options) {
        var self = this;
        self.container = container;
        self.local = new BMap.LocalSearch(container, {
            pageCapacity: 100,
            onSearchComplete: function(data) {
                if (data.keyword == self.keyWord.txt) {
                    container.clearOverlays();
                    self.render(data);
                    // self.lastTxt = self.keyWord.txt;
                }
            }
        });
        self.inited = true;
        $.jps.trigger('map-surround-inited');
    },
    render: function(result) {
        var self = this;
        var nums = result.getCurrentNumPois(); //返回当前页的结果数
        for (var i = 0; i < nums; i++) {
            var obj = result.getPoi(i); //获取记录
            if (obj.address != 'null') {
                //添加标注
                var item = {
                    "index": i,
                    "title": obj.title,
                    "address": obj.address,
                    "lon": obj.point.lng,
                    "lat": obj.point.lat
                };
                // item.distant = self.Bmap.getDistance(self.curPoint, mPoint).toFixed(0);
                self.addOverlay(item);
            }
        }
        // 清除本次搜索结果，避免关键字没变，中心点改变的情况
        // self.local.clearResults();
    },
    addOverlay: function(item) {
        var self = this,
            map = self.container || localData.BMap;

        var point = new mapPoint.init(item, {
            defZ: 2, // 默认zIndex值
            activeZ: 16 // hover zIndex值
        });
        point.setContent(template.draw(tpl, {
            item: item,
            data: self.keyWord,
            tplType: self.FLAG
        }));
        point.layFlag = 'surround';
        point.setOffset(new BMap.Size(-14, -32));
        map.addOverlay(point);

        // 定位参考物
        // map.addOverlay(point.marker);
    },
    getSurround: function(param, center) {
        var self = this;
        if (param) self.keyWord = param;
        self.updateSurround(center);
    },

    updateSurround: function(center) {
        var self = this,
            param = self.keyWord,
            map = self.container;
        var cenPoint = center.lon && center.lat ? new BMap.Point(center.lon, center.lat) : map.getCenter()
        // var zoom = map.getZoom(),
        //     radius = 5000;
        // if (zoom > 15) radius = 1000;
        // 清除上次搜索结果，避免关键字没变，中心点改变的情况
        self.local.clearResults();
        if (param.txt && self.inited) {
            self.local.searchNearby(param.txt, cenPoint, 1000);
        } else {
            map.clearOverlays();
        }

    }

};
$.jps.on('add-surround', function(param, center) {
    center = center || {}
    surround.getSurround(param, center)
})

module.exports = surround;
