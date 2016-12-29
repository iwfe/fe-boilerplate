/*
* @Author: lizongqing
* @Date:   2016-11-02 15:04:55
* @Last Modified by:   lizongqing
* @Last Modified time: 2016-12-06 18:19:49
*/

'use strict';
const useGt = pageConfig.geetestFlag == 1 ? true : false;

var viewManager = {
  currentView: "login",
  __useGeetest: false,
  initView(){
    let self = this;
    self.__useGeetest = pageConfig.geetestFlag == 1 ? true : false;
    self.elem = {};
    self.elem.mod = $('#mod-login');
    self.elem.loginWrap = $('#login-wrap');
    self.elem.slider1 = $('#login-slider-one');
    self.elem.slider2 = $('#login-slider-two');
    self.elem.imgCode = $('#login-imgcode-panel');
    self.elem.smsCode = $('#login-code-panel');
    self.elem.codePanel = self.elem.smsCode.children('.panel-wrap');

    self.elem.slider2.show();
    if(self.__useGeetest){
      self.elem.loginWrap.removeClass('nogt');
      self.elem.slider2.show();
      self.elem.imgCode.hide();
      self.elem.codePanel.addClass('higher');
    }else{
      self.elem.loginWrap.addClass('nogt step2');
      self.elem.slider2.show();
      self.elem.slider1.hide();
      self.elem.imgCode.show();
      self.elem.codePanel.removeClass('higher');
    }
    self.addTransition();
    self.bindEvent();
  },
  bindEvent(){
    let self = this;
  },
  addTransition(){
    this.elem.slider1.addClass('login-transition');
    this.elem.slider2.addClass('login-transition');
    this.elem.loginWrap.addClass('login-transition');
  },
  removeTransition(){
    this.elem.slider1.removeClass('login-transition');
    this.elem.slider2.removeClass('login-transition');
    this.elem.loginWrap.removeClass('login-transition');
  },
  updateView(){
    self.removeTransition();
    if(self.__useGeetest){
      self.elem.loginWrap.removeClass('nogt');
      self.elem.slider2.show();
      self.elem.imgCode.hide();
      self.elem.codePanel.addClass('higher');
    }else{
      self.elem.loginWrap.addClass('nogt step2');
      self.elem.slider2.show();
      self.elem.slider1.hide();
      self.elem.imgCode.show();
      self.elem.codePanel.removeClass('higher');
    }
    self.addTransition();
  },

  changeType(){
    let self = this;
    if(self.__useGeetest){
      self.__useGeetest = false;
      self.elem.imgCode.show();
      self.elem.codePanel.removeClass('higher');
      self.elem.loginWrap.addClass('nogt');
    }else{
      self.__useGeetest = true;
      self.elem.imgCode.hide();
      self.elem.codePanel.addClass('higher');
      self.elem.loginWrap.removeClass('nogt');
    }
    $.jps.trigger('login-refresh-imgcode');

    self.nextView();
  },
  nextView(){
    let self = this;
    self.elem.loginWrap.addClass('step2');
    self.elem.mod.css('overflow','hidden');
  },
  jumpView(name,callback,beforeBack){
    
  }
}

module.exports = viewManager;