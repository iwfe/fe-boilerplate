 /*
  * @Author: zhuxy
  * @Date:   2015-08-04 11:45:10
  * @Email:  zhuxinyong.sh@superjia.com
  * @Last Modified by:   jade
  * @Last Modified time: 2015-11-23 00:20:35
  */
 'use strict';
 require('./page.css');

 function Pagination(container, options) {

     var defaults = {
         totalNums: 0, //数据总条数
         pageSize: 10, //每页显示条数
         currentPage: 1, //当前页码
         href: '', //页面路径
         delta: 3, //当前页码左右阀值
         pageClass: 'mod-page', //分页容器样式
         prevText: '&gt;', //前一页文案
         nextText: '$lt;', //后一页文案
         pageClickCallBack: $.noop //回调函数
     };


     this.options = $.extend({}, defaults, options);
     this.$container = container;

     //总页数小于等于零不处理
     if (this.options.totalNums <= 0) {
         return;
     }

     this.init();
 }

 Pagination.prototype = {
     init: function() {
         this.$page = $('<div></div>');
         this.$page.addClass(this.options.pageClass);

         this.$container.append(this.$page);
         this.renderPage();
         this.bindEvent();
     },
     /**
      * 返回总页数和当前页数
      * @param  {[Number]} totalNums [总条目数]
      * @param  {[Number]} pageSize   [每页显示条目数]
      * @return {[Number]}           [总页数]
      */
     getPages: function(currentPage, totalNums) {
         var totalNums = totalNums ? totalNums : this.options.totalNums ? this.options.totalNums : this.preTotalNums;

         var totalPages = Math.ceil(totalNums / this.options.pageSize),
             currentPage = currentPage || this.options.currentPage;

         return {
             'currentPage': parseInt(currentPage),
             'totalPages': parseInt(totalPages)
         };
     },

     renderPage: function(page, totalNums, href) {
         var self = this;

         if (!self.$page) {
             self.init();
             // return;
         }
         self.$page.empty();
         self.$page.append(self.renderPageItem(page, totalNums, href));
     },
     renderPageItem: function(page, totalNums, href) {
         var self = this,
             pageHtml = '',
             pages = self.getPages(page, totalNums);

         pages.list = [];

         self.options.href = href || self.options.href;
         pages.href = href || self.options.href;
         // 左右阀值
         pages.delta = self.options.delta;
         pages.isRouter = self.options.isRouter;

         // 判断是否显示页码
         for (var i = 0; i < pages.totalPages; i++) {
             pages.list.push({
                 isShow: Math.abs(i + 1 - pages.currentPage) < pages.delta
             });
         }

         pageHtml = template.draw(self.pageItemTpl, pages);

         return pageHtml;
     },
     bindEvent: function() {
         var self = this;

         self.$page.on('click', 'a', function(event) {
             var $dom = $(this),
                 page = $dom.data('page');

             !self.options.href && event.preventDefault();

             self.reFreshPage(page);

             // 点击之后执行回调函数
             self.options.pageClickCallBack(page);
         });
     },
     reFreshPage: function(page) {
         this.renderPage(page);
     },
     outReFreshPage: function(page, totalNums, href) {
         // if(this.preTotalNums != totalNums){
         this.preTotalNums = totalNums;
         this.renderPage(page, totalNums, href);
         // }
     },
     pageItemTpl: '' +
         '{{if currentPage > 1}}' +
         '    <a class="page-item stateful" href="{{href}}/{{currentPage - 1}}" data-page="{{currentPage - 1}}" >&lt;</a>' +
         '{{/if}}' +

         '{{if currentPage == 1}}' +
         '   <i class="act">1</i>' +
         '{{else}}' +
         '   <a class="page-item stateful" data-page="1" href="{{href}}/1">1</a>' +
         '{{/if}}' +

         '{{if (currentPage - delta) == 2}}' +
         '  <a class="page-item stateful" data-page="2" href="{{href}}/2">2</a>' +
         '{{else if (currentPage - delta) > 2}}' +
         '  <i class="out">...</i>' +
         '{{/if}}' +

         '{{each list}}' +
         '     {{if $index >= 1 && $index < totalPages - 1}}' +
         '       {{if $value.isShow }}' +
         '           {{if currentPage == $index + 1}}' +
         '               <i class="act">{{$index + 1}}</i>' +
         '           {{else}}' +
         '               <a class="page-item stateful" data-page="{{$index + 1}}" href="{{href}}/{{$index + 1}}">{{$index + 1}}</a>' +
         '           {{/if}}' +
         '       {{/if}}' +
         '     {{/if}}' +
         '{{/each}}' +

         '{{if (totalPages - currentPage - 1) == delta}}' +
         '  <a class="page-item stateful" data-page="{{$totalPages - currentPage}}" href="{{href}}/{{$totalPages - currentPage}}">{{totalPages - currentPage}}</a>' +
         '{{else if (totalPages - currentPage - 1) > delta}}' +
         '  <i class="out">...</i>' +
         '{{/if}}' +

         '{{if totalPages > 1}}' +
         '   {{if totalPages == currentPage}}' +
         '       <i class="act">{{totalPages}}</i>' +
         '   {{else}}' +
         '      <a class="page-item stateful" data-page="{{totalPages}}" href="{{href}}/{{totalPages}}">{{totalPages}}</a>' +
         '   {{/if}}' +
         '{{/if}}' +
         '{{if currentPage != totalPages}}' +
         '    <a class="page-item stateful" data-page="{{currentPage + 1}}" href="{{href}}/{{currentPage + 1}}">&gt;</a>' +
         '{{/if}}'
 };

 module.exports = Pagination;


 // Demo

 /*
     page(container,options);

     container:分页容器，必填

     options:配置参数（如下）

     var defaults = {
         totalNums: 0,//数据总条数，必填
         pageSize: 10,//每页显示条数
         currentPage: 1,//当前页码
         href: '',//页面路径
         delta:3,//当前页码左右阀值
         pageClass:'mod-page',//分页容器样式
         prevText: '&gt;',//前一页文案
         nextText: '$lt;',//后一页文案
         pageClickCallBack: $.noop//回调函数
     };

     使用方法：

     callBack(1);

     var Page = new page($('#j-page'),{pageClickCallBack:callBack});

     function callBack(page){

         //总页数发生变化则需要刷新分页。
         if(preTotalNums !== currTotalNums){
             Page.outReFreshPage(page);
         }
     }
 */
