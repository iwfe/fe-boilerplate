/*
* @Author: yuqy
* @Date:   2016-08-18 16:41:55
* @Last Modified by:   yuqy
* @Last Modified time: 2016-10-13 15:06:31
*/

'use strict';
import classNames from 'classnames';
import 'tinyscrollbar';
import ImList from '../../webim/ImList.js';
import imStore from '../../webim/store/index.js';
import { Provider } from 'react-redux';
import {get_chatlist} from '../../webim/action/index.js';

const flag = pageConfig.flag;
//列表页地图页只显示icon不显示消息二字
// const showName = window.pageConfig.staticTag == 'map' ? false : window.pageConfig.staticTag == 'list' ? false : true;

export default class Message extends React.Component{

    constructor(props){
        super(props);
        this.state ={
            totalNum: 0, //总消息数量，包含IM
            msgNum:0,  //消息中心数量，不包含IM
            hasLogged: this.props.hasLogged   //用户是否已登录
        }
    }

    api(key) {
        let rootPath = '';
        // let rootPath = 'http://fe.iwjw.com:8888/api/fete_api/FF9SaW/mock'
        return rootPath + {
            getNoteiceNums: '/getNoteiceNums.action', //获取消息数目（不包含IM）
            getCellAgents: '/getCellAgents.action' //获取微聊消息列表
        }[key];
    }

    getChatList(callback){
        return $.ajax({
            url: this.api('getCellAgents'),
        }).done((d)=>{
            // if(d.status == 1){
            //     callback && callback(d)
            // }
        }).fail(()=>{
            console.log('error');
        })
    }

    getNoticeNum(callback){
        return $.ajax({
            url: this.api('getNoteiceNums'),
            type: 'GET',
            dataType: 'json',
            context: this,
            data: {
                platform: 1
            },
        })
        .done(function(d) {
            // if(d.status == 1){
            //     callback && callback(d);
            // }
        })
        .fail(function(e) {
            console.log('error');
        });
    }

    componentDidMount(){
        let self = this,
            {totalNum, msgNum, hasLogged}  = self.state;

        if (hasLogged) {
            $.when(self.getChatList(), self.getNoticeNum())
            .done((d1,d2)=>{
                let msgNum = d2[0].data && d2[0].data.totalNum;
                let agentNoReadNum = d1[0].data && d1[0].data.noReadNum;
                self.setState({
                    msgNum: msgNum,
                    totalNum: msgNum + agentNoReadNum
                })
                imStore.dispatch(get_chatlist(d1[0].data.agents));
                // iwjw.tinyscrollbar($('.j-scrollbar'));
            })
        }
    }
    //更新
    componentWillReceiveProps(props){
        this.setState({
            hasLogged: props.hasLogged,
            totalNum: props.totalNum
        })
    }

    //渲染消息总数量气泡（含IM）
    renderBadge(count){
        let self = this, jsx = null;
        let badgeClass = classNames({
            'msg-badge': true,
            'ellipse-num': count >= 100,
        })
        if (count > 0){
            jsx = <span className={badgeClass}>{count < 100 ? count : '99+'}</span>
        }
        return jsx;
    }

    handleHeadClick(){
        let self = this, {hasLogged} = self.state;
        if(hasLogged) return false;
        self.props.callback && self.props.callback({},true);
    }

    //新消息来了加1，点击以后减1
    handleNumChange(n, flag){
        let self = this, 
            {msgNum,totalNum} = self.state, 
            newNum = 0;
        if (flag == 'minus' && totalNum >= n) {
            newNum = totalNum - n;
        } else if (flag = 'plus'){
            newNum = msgNum + n;
        }
        self.setState({
            totalNum: newNum
        })
    }

    renderHasLogged(){
        let self = this, jsx = null,
            {totalNum, msgNum, hasLogged} = self.state,
            msgClass = classNames({
                "nav-item-a": true,
                "message": true,
                "active": flag == 33,
                "show-msg-down": hasLogged
            }),
            iconClass=classNames({
                'iconfont': true,
                'if-im-message-solid': flag ==33,
                'if-im-message': flag!=33
            });
        jsx = [
            <a key = "1" className={msgClass}>
                <i className={iconClass}></i>
                <i className="nav-item-txt">
                    <i>消息</i>
                    {self.renderBadge(totalNum)}
                </i>
            </a>,
            <div key = "2" id="message-down-wrap" className="message-down-wrap nav-down-wrap arrow-top ">
                <div className = "message-list-wrap">
                    <div className = "msg-center-wrap">
                        <a className = "msg-center-a clearfix" href="/message/activity/">
                            <div className = "bell-bg f-l">
                                <i className = "iconfont if-bell"></i>
                            </div>
                            <p className="msg-center-tt f-l bold">消息中心</p>
                            {msgNum > 0 ? <div className="msg-num">{msgNum}</div> : null}
                        </a>
                    </div>
                    <Provider store={imStore}>
                        <ImList numChangeCallback = {(n, flag)=>{self.handleNumChange(n, flag)}}/>
                    </Provider>
                </div>
            </div>
        ]
        return jsx;
    }

    renderNotLogged(){
        let self = this,
            msgClass = classNames({
                "nav-item-a": true,
                "message": true,
                "active": flag == 33,
            }),
            iconClass = classNames({
                'iconfont': true,
                'if-im-message-solid': flag==33,
                'if-im-message': flag!=33
            })
        let msg =<a key="1" className={msgClass} onClick={()=>self.handleHeadClick()}>
                    <i className={iconClass}></i>
                    <i className="nav-item-txt">消息</i>
                </a>
        return msg;
    }

    render(){
        let self = this, {hasLogged} = self.state;
        return (
            <div className = "nav-message-wrap">
                {
                    hasLogged == true ? self.renderHasLogged() : self.renderNotLogged()
                }
            </div>
        )
    }
}
