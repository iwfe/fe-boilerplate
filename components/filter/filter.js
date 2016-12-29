/*
 * @Author: yilizhang
 * @Date:   2016-4-19 18:52:51
 * @Email:  zhangyili.sh@superjia.com
 * @Last Modified by:   liyaping
 * @Last Modified time: 2016-06-21 11:10:25
 */
'use strict';
import ReactFilter from './reactFilter';

let myFilter;
const Filter = function(container, param) {

    // 默认参数
    let defaults = {
        ht: 2, // 1: rend, 2: sell
        p: 2, // 上海
        filter: {},
        needRender: true,
        filterAllHeightlight: false
    };

    this.container = container;
    this.options = $.extend(true, defaults, param);
    this.init();
};

Filter.prototype = {
    init: function() {
        let self = this,
            options = self.options;

        if (options.needRender) {
            // 渲染组件
            myFilter = ReactDOM.render(
                <ReactFilter filterAllHeightlight={options.filterAllHeightlight ? options.filterAllHeightlight : false}
                            ht={options.ht}
                            p={options.p}
                            filter={options.filter}
                            source={options.source}
                            isShowAll={options.isShowAll}
                            pageType={options.pageType}/>, self.container[0])
        }
        // else self.__setFilter(options.filter); // 渲染筛选条件面板
    },

    loadData: function(item) {
        $.jps.trigger('filter-load-data', item);
    },

    // 把数组 转为 文本值
    getKeyText: function(data, _origindata){
        return myFilter && myFilter.getKeyText(data, _origindata);
    }
}


module.exports = Filter;
