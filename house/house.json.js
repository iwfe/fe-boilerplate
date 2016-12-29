var filterData = {
    "rent": [{
        "name": "price",
        "alias": "ip",
        "text": "租金",
        "style": "single",
        "sorting": 0,
        "values": [{
            key: -1,
            txt: "全部"
        }, {
            key: 1,
            txt: "2000元以下"
        }, {
            key: 2,
            txt: "2000 - 3000元"
        }, {
            key: 3,
            txt: "3000 - 4000元"
        }, {
            key: 4,
            txt: "4000 - 5000元"
        }, {
            key: 5,
            txt: "5000 - 7000元"
        }, {
            key: 6,
            txt: "7000 - 10000元"
        }, {
            key: 7,
            txt: "10000元以上"
        }]
    }, {
        "name": "roomNum",
        "alias": "rn",
        "text": "户型",
        "style": "multi",
        "sorting": 1,
        "values": [{
            key: 1,
            txt: "一室"
        }, {
            key: 2,
            txt: "二室"
        }, {
            key: 3,
            txt: "三室"
        }, {
            key: 4,
            txt: "四室"
        }, {
            key: 5,
            txt: "四室以上"
        }]
    }, {
        "name": "decorate",
        "alias": "dt",
        "text": "装修",
        "style": "multi",
        "sorting": 2,
        "values": [{
            key: 1,
            txt: "毛坯"
        }, {
            key: 3,
            txt: "简装"
        }, {
            key: 4,
            txt: "精装"
        }, {
            key: 5,
            txt: "豪装"
        }]
    }, {
        "name": "floor",
        "alias": "fl",
        "text": "楼层",
        "style": "multi",
        "sorting": 3,
        "values": [{
            key: 1,
            txt: "低层"
        }, {
            key: 2,
            txt: "中层"
        }, {
            key: 3,
            txt: "高层"
        }]
    }, {
        "name": "feature",
        "alias": "fe",
        "text": "特色",
        "style": "multi",
        "sorting": 4,
        "values": [{
            key: 4,
            txt: "电梯房"
        }, {
            key: 5,
            txt: "地铁房"
        }]
    }],

    "sell": [{
        "name": "price",
        "alias": "ip",
        "text": "售价",
        "style": "single",
        "sorting": 0,
        "values": [{
            key: -1,
            txt: "全部"
        }, {
            key: 1,
            txt: "100万以下"
        }, {
            key: 2,
            txt: "100-150万"
        }, {
            key: 3,
            txt: "150-200万"
        }, {
            key: 4,
            txt: "200-300万"
        }, {
            key: 5,
            txt: "300-500万"
        }, {
            key: 6,
            txt: "500-700万"
        }, {
            key: 7,
            txt: "700-1000万"
        }, {
            key: 8,
            txt: "1000万以上"
        }]
    }, {
        "name": "roomNum",
        "alias": "rn",
        "text": "户型",
        "style": "multi",
        "sorting": 1,
        "values": [{
            key: 1,
            txt: "一室"
        }, {
            key: 2,
            txt: "二室"
        }, {
            key: 3,
            txt: "三室"
        }, {
            key: 4,
            txt: "四室"
        }, {
            key: 5,
            txt: "五室"
        }, {
            key: 6,
            txt: "五室以上"
        }]
    }, {
        "name": "acreage",
        "alias": "ia",
        "text": "面积",
        "style": "single",
        "sorting": 2,
        "values": [{
            key: -1,
            txt: "全部"
        }, {
            key: 1,
            txt: "50m²以下"
        }, {
            key: 2,
            txt: "50-70m²"
        }, {
            key: 3,
            txt: "70-90m²"
        }, {
            key: 4,
            txt: "90-110m²"
        }, {
            key: 5,
            txt: "110-130m²"
        }, {
            key: 6,
            txt: "130-150m²"
        }, {
            key: 7,
            txt: "150-200m²"
        }, {
            key: 8,
            txt: "200m²以上"
        }]
    }, {
        "name": "age",
        "alias": "ag",
        "text": "房龄",
        "style": "multi",
        "sorting": 3,
        "values": [{
            key: 1,
            txt: "5年以下"
        }, {
            key: 3,
            txt: "5-10年"
        }, {
            key: 4,
            txt: "10-20年"
        }, {
            key: 5,
            txt: "20年以上"
        }]
    }, {
        "name": "floor",
        "alias": "fl",
        "text": "楼层",
        "style": "multi",
        "sorting": 4,
        "values": [{
            key: 1,
            txt: "低层"
        }, {
            key: 2,
            txt: "中层"
        }, {
            key: 3,
            txt: "高层"
        }]
    }, {
        "name": "feature",
        "alias": "fe",
        "text": "特色",
        "style": "multi",
        "sorting": 5,
        "values": [
        // {
        //     key: 1,
        //     txt: "满二"
        // }, 
        // {
        //     key: 2,
        //     txt: "满五唯一"
        // }, 
        // {
        //     key: 3,
        //     txt: "学区房"
        // }, 
        {
            key: 4,
            txt: "电梯房"
        }, {
            key: 5,
            txt: "地铁房"
        }]
    }],
    "sort": [{
            "key": 0,
            "txt": "默认"
        },

        {
            "key": 1,
            "txt": "最新"
        },

        {
            "key": 3,
            "txt": "价格<b class='iconfont if-up'></b>"
        }
    ],
    "newhouse": [
        {
        "name": "price",
        "alias": "ip",
        "text": "售价",
        "style": "single",
        "sorting": 0,
        "values": [{
            key: -1,
            txt: "全部"
        }, {
            key: 1,
            txt: "100万以下"
        }, {
            key: 2,
            txt: "100-150万"
        }, {
            key: 3,
            txt: "150-200万"
        }, {
            key: 4,
            txt: "200-300万"
        }, {
            key: 5,
            txt: "300-500万"
        }, {
            key: 6,
            txt: "500-700万"
        }, {
            key: 7,
            txt: "700-1000万"
        }, {
            key: 8,
            txt: "1000万以上"
        }]
    },
        {
        "name": "roomNum",
        "alias": "rn",
        "text": "户型",
        "style": "single",
        "sorting": 2,
        "values": [
            {
                key: -1,
                txt: "全部"
            },
            {
            key: 1,
            txt: "一室"
        }, {
            key: 2,
            txt: "二室"
        }, {
            key: 3,
            txt: "三室"
        }, {
            key: 4,
            txt: "四室"
        }, {
            key: 5,
            txt: "五室"
        }, {
            key: 6,
            txt: "五室以上"
        }]
    },
        {
            "name": "estateTpe",//物业类型
            "alias": "wt",
            "text": "类型",
            "style": "single",
            "sorting": 2,
            "values": [
                {
                    key: -1,
                    txt: "全部"
                },{
                key: 1,
                txt: "住宅"
            }, {
                key: 2,
                txt: "别墅"
            }, {
                key: 3,
                txt: "商住"
            }, {
                key: 4,
                txt: "商铺"
            }]
        }]
};

module.exports = filterData;
