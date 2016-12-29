/*
* @Author: lizongqing
* @Date:   2016-11-02 11:43:32
* @Last Modified by:   lizongqing
* @Last Modified time: 2016-12-06 18:05:52
*/

'use strict';
require('./geetest.scss');

const __api = require('./api.js');

//最多多少次极验失败后显示提示
// const __maxErrorNum = 2;

// 滑动成功，但手机号格式不对，滑块延迟重置的时间
const __flashDelay = 800;


var geetest = {
  init(opts){
    let self = this;
    self.container = opts.container;
    // 当第二步验证成功时调用callback函数。
    self.verifySuc = opts.verifySuc;
    // 当验证失败时调用callback函数。
    self.error = opts.error;
    //拖动成功的回调
    self.dragSuc = opts.dragSuc;

    //滑动出现的错误次数
    self.errorNum = 0;
    self.verifyOne(opts.cantFun);
  },
  //geetest初始化后的回调
  handlerEmbed(captchaObj){
    let self = this;
    captchaObj.appendTo(self.container);
    // 当验证码DOM元素生成完毕时执行callback函数。
    captchaObj.onReady(function () {

    });

    let deffer = $.Deferred();

    //拖动验证成功后两秒(可自行设置时间)自动发生跳转等行为
    captchaObj.onSuccess(()=>{
      self.dragSuc()
      .done( () => {
        var validate = captchaObj.getValidate();
        self.verifyTwo(validate);
      })
      .fail( () => {
        setTimeout(function(){
          captchaObj.refresh();
        },__flashDelay);
      });
    });
    //拖动位置错误
    captchaObj.onFail(()=>{
      self.errorNum++;
      self.error(self.errorNum);
      // if(self.errorNum >= __maxErrorNum)self.showTips();
    });
    //网络错误
    captchaObj.onError(()=>{
      self.errorNum++;
      self.error(self.errorNum);
      // if(self.errorNum >= __maxErrorNum)self.showTips();
    });
    //刷新验证
    $.jps.remove('refresh-geetest');
    $.jps.on('refresh-geetest',function(){
      captchaObj.refresh();
    });
  },
  //第一步极验验证
  verifyOne(callback){
    let self = this;
    $.ajax({
      url: __api.getUrl('stepOne'),
      type: "get",
      dataType: "json",
      success: (d)=>{
        if(d.status == 1){
          //走极验
          let data = d.data;
          initGeetest({
            gt: data.gt,
            challenge: data.challenge,
            sandbox: false,
            product: "float", // 产品形式，包括：float，embed，popup。注意只对PC版验证码有效
            offline: !data.gt_server_status // 表示用户后台检测极验服务器是否宕机，一般不需要关注
          }, function(captchaObj){
            self.handlerEmbed(captchaObj);
          });
        }else{
          //TODO 走图片验证
          callback && callback(d);
        }
      }
    });
  },
  //第二步极验验证
  verifyTwo(validate){
    let self = this;
    $.ajax({
      url: __api.getUrl('stepTwo'),
      type: "get",
      dataType: "json",
      data: {
        "geetest_challenge": validate.geetest_challenge,
        "geetest_validate": validate.geetest_validate,
        "geetest_seccode": validate.geetest_seccode
      },
      success: (d)=>{
        if(d.status == 1){ //第二步极验校验成功
          self.verifySuc && self.verifySuc(d);
        }else{

        }
      }
    });
  }
}
module.exports = geetest;