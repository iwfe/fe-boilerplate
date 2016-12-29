'use strict';

var followTpl = '' +
  '<div class="follow-success-wrap">' +
  '   <p class="follow-success">关注成功</p>' +
  '   <p class="simul-follow"><label class="mod-check-box checked" for=""><input class="required" name="complainType" type="checkbox">同时关注该小区{{if data.ht == 2}}二手房{{else}}租房{{/if}}</label></p>' +
  '</div>';

export default {
  getUrl(key) {
    let root = '';
    // root = 'http://fe.iwjw.com:8080/s/api/debug/1ed38e';
    return root + {
        "addCollect": "/addHouseCollect.action", // 房源加入关注
        "delCollect": "/deleteHouseCollect.action", // 房源取消关注
        "followEstate": "/followEstate.action", // 关注小区
        "unfollowEstate": "/unfollowEstate.action" // 取消关注小区
      }[key];
  },
  
  followHouse(options) {
    let self = this,
      addCollectAjax = self.addCollectAjax;
    let {param,successCb,noLoginCb} =options;
    
    addCollectAjax && addCollectAjax.abort();
    self.addCollectAjax = $.ajax({
      url: self.getUrl('addCollect'),
      data: param,
      success: function (data) {
        switch (data.status) {
          case -1:
            smallnote("出错，请重试");
            break;
          case -3:
            // header.refresh();
            smallnote('已达到关注上限，无法再关注了', {
              pattern: 'error'
            });
            break;
          case 5:
            self.noLogin(noLoginCb);
            break;
          case 1:
          case -2:
            if (data.status == -2) smallnote("您已关注过此房");
            successCb && successCb(data);
            // header.refresh();
            break;
        }
        
      }
    });
  },
  
  /**
   * [取消关注]
   * @param  {[jquery object]}   item     [description]
   * @param  {[json object]}   param    [{"houseIds":"","ht":""}]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  unfollowHouse(options) {
    var self = this,
      delCollectAjax = self.delCollectAjax;
  
    let {param,successCb,noLoginCb} =options;
    
    delCollectAjax && delCollectAjax.abort();
    self.delCollectAjax = $.ajax({
      url: self.getUrl('delCollect'),
      data: param,
      success: function (data) {
        switch (data.status) {
          case -1: // 异常
            smallnote("取消关注失败");
            break;
          case 1: // 成功
            successCb && successCb(data);
            // header.refresh();
            break;
          case 5: // 未登陆
            self.noLogin(noLoginCb);
            break;
        }
      }
    });
  },
  
  /**
   * [关注小区]
   * @param {[jquery object]}   item     [description]
   * @param {[json object]}   param    {"estateId":"","ht":""}
   * @param {Function} callback [description]
   */
  followEstate(options) {
    var self = this,
      followEstateAjax = self.followEstateAjax;
    let {param,successCb,noLoginCb} =options;
  
    followEstateAjax && followEstateAjax.abort();
    self.followEstateAjax = $.ajax({
      url: self.getUrl('followEstate'),
      data: param,
      success: function (data) {
        if (data.status == 401) {
          self.noLogin(noLoginCb);
        } else {
          var d = data.data;
          switch (d.result) {
            case -1:
              smallnote("关注失败");
              break;
            case 1:
            case -2:
              if (d.result == -2) smallnote("您已关注过此小区");
              successCb && successCb(data);
              // header.refresh();
              break;
            case -3:
              smallnote('已达到关注上限，无法再关注了', {
                pattern: 'error'
              });
              // header.refresh();
              break;
          }
        }
      }
    });
  },
  
  /**
   * [取消关注小区]
   * @param  {[jquery object]}   item     [description]
   * @param  {[json object]}   param    {"estateId":"","ht":""}
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  unfollowEstate(options) {
    var self = this,
      unfollowEstateAjax = self.unfollowEstateAjax;
    let {param,successCb,noLoginCb} =options;
  
    unfollowEstateAjax && unfollowEstateAjax.abort();
    self.unfollowEstateAjax = $.ajax({
      url: self.getUrl('unfollowEstate'),
      data: param,
      success: function (data) {
        if (data.status == 401) {
          self.noLogin(noLoginCb)
        } else {
          switch (data.data.result) {
            case -1: // 异常
              smallnote("取消关注失败");
              break;
            case 1: // 成功
              successCb && successCb(data);
              // header.refresh();
              break;
            case -2: // 已经取消关注
              smallnote("已经取消关注");
              break;
          }
          
        }
      }
    });
  },
  //登陆完再执行操作
  noLogin(clickCallback){
    header.clearLogin();
    header.verifyLogin(function () {
      clickCallback && clickCallback();
    })
  },
  
}
