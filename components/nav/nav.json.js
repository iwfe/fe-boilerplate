/* 
 * @Author: liyaping
 * @Date:   2015-12-02 18:34:06
 * @Email:  liyaping@superjia.com
 * @Last Modified by:   yuqy
 * @Last Modified time: 2016-04-19 12:37:49
 */
var myNavJson = [{
    key: 'payorder',
    txt: '我的订单',
    icon: '&#xd400;',
    url: '/order'
}, 
// {
//     key: 'follow',
//     txt: '我的关注',
//     icon: '&#xd644;',
//     url: '/collectHouseList'
// }, 
{
    key: 'agent',
    txt: '我的看房顾问',
    icon: '&#xd404;',
    url: '/agent'
}, {
    key: 'delegate_mng',
    txt: '我的委托管理',
    icon: '&#xd401;',
    url: '/delegateManage'
}, {
    key: 'complains',
    txt: '我的投诉',
    icon: '&#xd410;',
    url: '/complains'
}, {
    key: 'userinfo',
    txt: '我的账户',
    icon: '&#xd403;',
    url: '/userInfo'
}, {
    key: 'logout',
    txt: '退出登录',
    icon: '&#xd405;',
    url: ''
}];

module.exports = myNavJson;
