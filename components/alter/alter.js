/* 
* @Author: zhuxy
* @Date:   2016-01-12 14:20:53
* @Last Modified by:   liyaping
* @Last Modified time: 2016-04-13 12:55:54
*/

'use strict';
require('./alter.scss');

var alterTpl = require('./alter.html');

var staticUrl = pageConfig.staticUrl;

var logoImg = staticUrl + require('../../global/img/logo_wx.png');

var alter = {

    api: function(key) {
        var rootPath = '/api/api';
        return rootPath + {
            list: ''
        }[key];
    },

    init: function(container, options) {
        var self = this,
            renderData = null,
            businessType;

        self.container = container;
        self.options = options;

        businessType = self.options.ht == 1 ? '租房' : self.options.ht == 2 ? '二手房' : self.options.ht == 3 ? '新房' : '';

        var page = self.options.map;
        if (self.options.flag == 3 || self.options.flag == 2 ) {
            page = self.options.list;
        } else if (self.options.flag == 31){
            page = self.options.newhouselist;
        }
        renderData = {
            currentBusiness:businessType,
            currentCity: page.provinceName,
            currentCityPy: page.provincePy,
            hasRent: page.province.rent,
            hasSale: page.province.sale,
            hasNew: page.province.new,
            logo: logoImg
        };

        self.container.html( template.draw(alterTpl,renderData) );

        self.events();
    },
    
    setOptions: function(options) {
        this.options = options;
    },

    events: function() {
        var self = this;
        var container = self.container;
        var msg = '',
            renderData = null;

        // container.on('click', '.j-alter-city', function(e) {
        //    // ht业务类型：1 出租， 2 出售
        //    renderData = self.options.ht == 1 ? self.options.map.province.rents : self.options.map.province.sales;
        //    msg = template.draw( cityTpl,{citys:renderData} );
        
        //    var cityDialog = new dialog.Dialog({
        //        showTitle: true,
        //        title:'选择所在城市',
        //        showFooter: false,
        //        cssClass: 'city-dialog',
        //        showClose: true,
        //        message: msg,
        //        isFixed: true,
        //        modal: true
        //    });
        
        //    $('.city-item',cityDialog.element).on('click',function(e){
        //        var $this = $(this),
        //            pid = $this.data('pid');
        
        //        $this.addClass('active').siblings().removeClass('active');
        
        //        e.preventDefault();
        
        //        $.jps.trigger('log', {
        //            type: 'clickEvent',
        //            act_k: 150,
        //            act_v: pid
        //        });
        
        //        iwjw.selectCity(pid,'/' + self.options.htText+'/map/');
        //    });
        // });

        container.on('click', '.map-homepage', function(){
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 151,
                act_v: 'homepage'
            })
        });

        container.on('click', '.map-sale', function(){
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 151,
                act_v: 'secondhouse'
            })
        });

        container.on('click', '.map-chuzu', function(){
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 151,
                act_v: 'rent'
            })
        });

        container.on('click', '.map-service', function(){
            $.jps.trigger('log', {
                type: 'clickEvent',
                act_k: 151,
                act_v: 'entrust'
            })
        });
    }
};

module.exports = alter;