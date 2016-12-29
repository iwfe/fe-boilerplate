/**
 * Created by liyaping on 16/8/25.
 */

'use strict';

var followTpl = '' +
  '<div class="follow-success-wrap">' +
  '   <p class="follow-success">关注成功</p>' +
  '   <p class="simul-follow"><label class="mod-check-box checked" for=""><input class="required" name="complainType" type="checkbox">同时关注该小区{{if data.ht == 2}}二手房{{else}}租房{{/if}}</label></p>' +
  '</div>';

var okFn = function() {
  //如果选了同时关注该小区
  if ($('.mod-check-box').hasClass('checked')) {
    var itemObj = $('.est-follow').length ? $('.est-follow') : '';
    self.followEstate(itemObj, {
      estateId: param.estateCode,
      ht: param.ht
    }, function() {
      $.jps.trigger('followEst');
    });
  }
};


var html = template.draw(followTpl, {
  data: param
});

var d = dialog.alert(html, {
  okCallback: okFn
});
new Checkbox(d.find('.mod-check-box'), {});
