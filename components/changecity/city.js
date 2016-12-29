/* 
 * @Author: zhuxinyong
 * @Date:   16/3/3
 * @Email:  zhuxinyong.sh@superjia.com
 * @Last Modified by:   yuqy
 * @Last Modified time: 2016-11-22 14:44:53
 */
'use strict';
require('./city.scss');

var cityTpl = require('./city.html');

var city = {
    init:function(){
        var self = this;

        self.bindEvent();
    },
    bindEvent:function(){
        var self = this,
            pageConfig = window.pageConfig,
            selectCity = pageConfig.selectCity;

        $(document.body).on('click','.province',function(){
            self.changeCity();
        });

        if(selectCity){
            self.changeCity();
        }
    },
    changeCity:function(){
        var self = this;

        var pageConfig = window.pageConfig,
            staticTag = pageConfig.staticTag,
            selectCity = pageConfig.selectCity,
            houseType = pageConfig.ht,
            flag = pageConfig.flag,
            htText = '',
            msg = '',
            cityDatas = null;
        //爱理财首页禁止城市切换 
        if (flag == 30){
            return false;
        }

        if(houseType == 1){
            htText = 'chuzu';
        }else if(houseType == 2){
            htText = 'sale';
        } else if (houseType == 3){
            htText = 'newhouse';
        }

        //只有地图页根据当前业务显示相应的城市
        if(staticTag == 'map' || staticTag == 'list' || staticTag == 'newhouselist'){
            cityDatas = houseType == 1 ? pageConfig[staticTag].province.rents : houseType == 2 ? pageConfig[staticTag].province.sales : pageConfig[staticTag].province.news;
        }else{
            cityDatas = pageConfig.map.province;
        }

        msg = template.draw( cityTpl,{
            citys:cityDatas,
            currentCityId:pageConfig.provinceId
        });

        var cityDialog = new dialog.Dialog({
            showTitle: true,
            title:'选择所在城市',
            showFooter: false,
            cssClass: 'city-dialog',
            showClose: true,
            message: msg,
            isFixed: true,
            modal: true,
            closeCallback:function(){
                if(selectCity){
                    self.selectCity({staticTag:staticTag,pid:2,htText:htText,pinyin:'shanghai'})
                }
            }
        });

        $('.city-item',cityDialog.element).on('click',function(e){
            var $this = $(this),
                pid = $this.data('pid'),
                pinyin = $this.data('pinyin');

            $this.addClass('active').siblings().removeClass('active');

            e.preventDefault();

            self.selectCity({staticTag:staticTag,pid:pid,htText:htText,pinyin:pinyin});
        });
    },
    selectCity:function(options){
        var staticTag = options.staticTag,
            pid = options.pid,
            htText = options.htText,
            pinyin = options.pinyin;

        $.jps.trigger('log', {
            type: 'clickEvent',
            act_k: 150,
            act_v: pid
        });

        if(staticTag == 'map') {
            iwjw.selectCity(pid, '/' + htText + '/map/');
        }else if(staticTag == 'list'){
            iwjw.selectCity(pid,'/' + htText + '/' + pinyin + '/');
        }else if (staticTag == 'newhouselist'){
            iwjw.selectCity(pid,'/' + htText + '/' + pinyin + '/');
        }else{
            iwjw.selectCity(pid);
        }
    }
};

city.init();

module.exports = city;

