/*
 * Created by huangxiaogang on 16/7/27.
 * search组件本地存储管理，导出三个方法
 * |- __loadSearchStore
 * |- __storeSearchKey
 * |- __getSearchKey
 */
import { hintItemTpl } from './utils/tpl.js';
export default(nodes,options,UiController)=>{
    let  { $container,$hintPanel } = nodes;
    let  {provinceId,showHintHistory,__tipsTitle} = options;
    let __getSearchKey = function() {
        var houseType = $container.data('housetype');
        var provinceId = $container.data('provinceid') || provinceId;
        var keys = global.getLocalStore('searchkey' + houseType + provinceId) || '';
        return keys && keys.split(',');
    };
    let __storeSearchKey= function(key) {
        let self =this;
        if (!key) return false;
        if(typeof key=='string' && !key.replace(/\\/g,'')){
            return false;
        }
        var houseType = $container.data('housetype');
        var provinceId = $container.data('provinceid') || provinceId;
        var hk = [];
        var keytxt = '';

        if (!showHintHistory) return false;

        if (typeof key == 'object') {
            var $key = $(key);
            keytxt = $key.data('key');
            if ($key.length) key = keytxt + '/' + $key.data('grade') + '/' + $key.data('id') + '/' + $key.data('code');
        } else {
            keytxt = key;
        }

        var searchKey = self.__getSearchKey() || [];
        var searchKeyfb = [];

        // 将历史记录中已有的关键字清除掉
        _.map(searchKey, function(sitem, sindex) {
            if (sitem.split('/')[0] != keytxt && sitem != keytxt) {
                //移除因为失误导致的问题
                if(!(/object/i.test(sitem))||sitem!='///'){
                    searchKeyfb.push(sitem);
                }
            }
        });
        // 大于10条删除最后一条
        if (searchKeyfb.length >= 10) {
            searchKeyfb.pop();
        }
        searchKeyfb.unshift(key);
        global.setLocalStore('searchkey' + houseType + provinceId, searchKeyfb.join(','))
    }
    //从历史记录中获取数据
    let __loadSearchStore=function() {
        var self = this;
        var searchKeys = self.__getSearchKey();
        $hintPanel.empty();

        if (!showHintHistory) return false;
        if (searchKeys) {
            searchKeys=_.filter(searchKeys, function(_key){
                return !(/object/i.test(_key)) && _key!='' && _key!=='/';

            });
            var data = _.map(searchKeys, function(item) {
                var is = item.split('/');
                if (is.length > 1) item = is[0];
                return {
                    isHistory: true,
                    uikey: global.escapeHtml(item),
                    key: item,
                    g: is[1],
                    id: is[2],
                    code: is[3],
                    tipsTitle: __tipsTitle[is[1]],
                    queryType: 2 //查询类型：2浏览器历史
                };
            });
            if(data && data.length){
               var html = template.draw(hintItemTpl, {
                    hints: data
                });
                $hintPanel.html(html);
                UiController.dealHintPanel();
            }else{
                 $hintPanel.hide();
            }
        } else {
            $hintPanel.hide();
        }
    };
    return {
        __getSearchKey,
        __storeSearchKey,
        __loadSearchStore
    }
}
