/*
* @Author: lizongqing
* @Date:   2016-11-02 15:50:43
* @Last Modified by:   lizongqing
* @Last Modified time: 2016-11-02 15:56:16
*/

'use strict';
var API = {
  getUrl(step){
    return {
      "stepOne": "/startCaptcha.action", //极验第一步
      "stepTwo": "/verifyLogin.action"  //极验第二步
    }[step];
  }
}
module.exports = API;