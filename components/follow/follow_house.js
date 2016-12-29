/**
 * 组件功能:房源的关注和取消关注
 * 接口: /addHouseCollect.action {houseId:KUglrjfyVD0,ht:2,estateCode:MhU_9tHX2CY}
 *      /deleteHouseCollect.action {houseIds:KUglrjfyVD0,ht:2}
 * 日期: react-2016-0701
 * 差异: 约看清单文本(空心 关注 / 红色实心 已关注);我关注的房源(黑色实心 取消关注)
 *      关注操作:弹框显示同时关注该小区
 *      如果未登录,关注和取消关注操作要在登录完成后自动触发
 *      hasCollect:1 已关注
 * 使用: 以关注为例:<FollowHouse {...{houseId:houseId,ht:ht,estateCode:estateCode,cancelText:cancelText}} f ></FollowHouse>
 * 取消关注:<FollowHouse callback="this.unfolloCallback"></FollowHouse>
 */
'use strict';

import Api from './api.js';

import './follow.scss';
const followTpl = `
<div class="follow-success-wrap">
     <p class="follow-success">关注成功</p>
     <p class="simul-follow">
       <label class="estate-follow checked" for="">
     <em class="iconfont if-checkbox"></em>同时关注该小区{{if ht == 2}}二手房{{else}}租房{{/if}}</label>
 </p>
  </div>`;

var FollowHouse = React.createClass({
  getDefaultProps(){
    return {
      showTip: true
    }
  },
  
  getInitialState(){
    return {
      hasCollect: this.props.hasCollect
    }
  },
  
  followEstate(data){
    const self = this;
    let fnName = 'followEstate';
    let {ht, estateCode} = self.props;
    
    let html = template.draw(followTpl, {ht});
    
    //未关注小区时弹框
    if (data.ifCollectEst == 0) {
      var $d = dialog.alert(html, {
        okCallback: function () {
          //如果选了同时关注该小区
          if ($('.follow-success-wrap .estate-follow').hasClass('checked')) {
            // var itemObj = $('.est-follow').length ? $('.est-follow') : '';
            Api[fnName](Object.assign({
              param: {
                estateId: estateCode,
                ht: ht
              }
            }, self.callbacks(fnName)));
          }
        }
      });
      $d.element.on('click', '.estate-follow', function (evt) {
        $(this).toggleClass('checked').find('.iconfont').toggleClass('if-checkbox if-box');
        ;
      });
    }
  },
  callbacks(key){
    const self = this;
    let noLoginCb = self.handleClick;
    let {showTip} = self.props;
    let {hasCollect} = self.state;
    return {
      unfollowHouse: {
        successCb: (d)=> {
          let {unfCallback} = self.props;
          self.setState({
            hasCollect: !hasCollect
          });
          if (showTip) {
            self.showCollectTip(1)
          }
          unfCallback && unfCallback(1);
        },
        noLoginCb
      },
      followHouse: {
        successCb: (d)=> {
          let {fhCallback} = self.props;
          self.setState({
            hasCollect: !hasCollect
          });
          self.followEstate(d)
          if (showTip) {
            self.showCollectTip()
          }
          fhCallback && fhCallback(d);
        },
        noLoginCb
      },
      followEstate: {
        successCb: (d)=> {
          let {feCallback} = self.props;
          feCallback && feCallback(d);
        },
        noLoginCb
      }
    }[key]
  },
  
  handleClick(){
    const self = this;
    
    let {houseIds, ht, estateCode} = self.props;
    let {hasCollect} = this.state;
    
    let param = hasCollect ? {
      houseIds: houseIds,
      ht: ht,
    } : {
      houseId: houseIds,
      ht: ht
    };
    
    if (estateCode && hasCollect) param.estateCode = estateCode;
    
    let fnName = hasCollect ? 'unfollowHouse' : 'followHouse';
    
    Api[fnName](Object.assign({param}, self.callbacks(fnName)));
    
  },
  
  showCollectTip: function (isDel) {
    let {followHouseItem, unfollowHouseItem} = this.refs;
    $(".collect-tip").remove();
    let item = isDel ? $(followHouseItem) : $(unfollowHouseItem);
    let $dom = isDel ? '取消关注成功' : '关注成功';
    let domClass = isDel ? ' del-tip' : ''
    $dom = $('<div class="collect-tip arrow-bottom' + domClass + '"><div class="favor-wrap">' + $dom + '</div></div>');
    item.append($dom);
    $dom.fadeIn('slow'); //渐变显示
    setTimeout(function () {
      $dom.fadeOut('slow', function () {
        $dom.remove()
      }); //渐变隐藏
    }, 2000);
  },
  
  componentWillReceiveProps(nextProps){
    let self = this;
    self.setState({
      hasCollect: nextProps.hasCollect
    })
  },
  render(){
    let {hasCollect} = this.state;
    let {cancelText} = this.props;
    let renderTpl;
    if (hasCollect) {
      renderTpl = (
        <a className="h-follow-unfollow" ref="unfollowHouseItem" onClick={()=> {
          this.handleClick()
        }}>
          <i className="iconfont if-heart"></i>{cancelText}
        </a>
      )
    } else {
      renderTpl = (
        <a className="h-follow-unfollow" ref="followHouseItem" onClick={()=> {
          this.handleClick()
        }}>
          <i className="iconfont if-favourite"></i>关注
        </a>
      )
    }
    return renderTpl;
  }
  
})
export default FollowHouse;
