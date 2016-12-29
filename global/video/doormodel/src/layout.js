/*
* @Author: slashhuang
* @Date:   2016-11-9 18:40:08
* 滑动组件的户型导航图
*/
import { Component,PropTypes } from 'react';
import {findDOMNode,render} from 'react-dom';
import {Img} from 'HouseUtils';
// import classNames from 'classnames';
let classNames=require('classnames');

require('./layout.scss');
const staticUrl = pageConfig.staticUrl;
class SliderLayout extends Component{
    constructor(props){
        super();
        this.parentApi = props.parentApi;
        this.state={
            layoutPic:props.smallSrc,
            bigLayoutPic:props.bigSrc,
            size:props.size,//small/big中间还是右下角显示
            show:props.show,//是否显示
        }
    }
    /*参数说明 http://jamestw.logdown.com/posts/257890-257890-reactjs-prop*/
    static propTypes={
        parentApi:PropTypes.any.isRequired, //api接口层面
        bigSrc:PropTypes.string,
        smallSrc:PropTypes.string,
        size:PropTypes.oneOf(['small','big']), //小图还是大图
        show:PropTypes.bool.isRequired  //是否显示
    }
    renderImg(){
        let { layoutPic,bigLayoutPic,size } = this.state;
        // return size=='small'?layoutPic:bigLayoutPic;
        return bigLayoutPic;
    }
    /*关闭隐藏*/
    closeLayout(){
        this.setState({
            show:false
        },()=>{
            let callee = this.parentApi.calleeContext;
            if(callee.DomListener){
                 $(callee.DomListener).css({color:'#fff'})
            }
        });
        try{
            window.frames[0] && window.frames[0].postMessage({ent: 'closeDoor', type: 'close'}, '*');
        }catch(e){

        }

    }
    /*缩放小图或者中图*/
    zoomImg(){
        let { size } = this.state;
        let newSize = size=='small'?'big':'small';
        let parentNode =  $(findDOMNode(this.refs['house-layout'])).parent();
        let stateSetter = ()=>{
            this.setState({ size:newSize },function(){
                /*动态修改父节点的样式，增加动画*/
                let {size} = this.state;
                parentNode.removeClass('small big').addClass(size);
            })
        }
        /*大图组件增加动画*/
        let bigDom = parentNode.parents('.responsive-slider');
        if(bigDom && bigDom.hasClass('responsive-slider')){
            const CssAnimation = {
                small:{
                    right:0,
                    bottom: '48px',
                    width:'288px',
                    height:'192px'
                },
                big:{
                    right:(bigDom.width()-540)/2+'px',
                    bottom:(bigDom.height()-360)/2+'px',
                    width:'540px',
                    height:'360px'
                }
            }
            /*模拟位置变化*/
            parentNode.removeClass('small big')
                      .css(CssAnimation[size])
                      .animate(CssAnimation[newSize],50,function(){
                /*去除动画产生的辅助样式*/
                parentNode.removeAttr('style');
                stateSetter();
            })
        }else{
             stateSetter();
        }
    }
    componentDidMount(){
        /*注册对外接口*/
        this.parentApi.register(this);
    }
    render(){
        let { size,hosueSrc,show } = this.state;
        return <div className={ classNames('house-layout-s-c',size) }
                    ref='house-layout'
                    style={{display:show?'block':'none'}}>
                    <div className='s-c-mask'>
                    </div>
                    <div className='s-c-magnifier'
                         onClick={()=>this.zoomImg()}>
                         <div className={classNames('s-c-m-img',
                                    { 'magifier-small':size=='small' },
                                    { 'magifier-big':size=='big' })}>
                         </div>
                    </div>

                    <div className='iconfont if-delete s-c-close'
                         onClick={()=>this.closeLayout()}></div>
                    <img src={this.renderImg()}
                         className='s-c-img'
                         onClick={()=>this.zoomImg()}/>
                    {/*<div className='s-c-img-wrapper'
                        <Img  loadImg = {iwjw.loadingImg}
                              realSrc={this.renderImg()}
                              className='s-c-img' />
                    </div>*/}
               </div>
    }
};
export default
class VideoDoorModelApi {
        constructor(container,callee,options){
            this.context=null;
            this.calleeContext = callee;
            let self  = this;
            /*实例化节点*/
            let initProps = Object.assign({
                    parentApi:self,
                    bigSrc:'',
                    smallSrc: '',
                    size:'small',
                    show:false
            },options);
            render(<SliderLayout {...initProps} />,container);
        }
        //注册上下文
        register(context){
            this.context = context;
        }
        /*显示隐藏*/
        toggle(callback){
            if(!this.context) return;
            let {show} = this.context.state
            this.context.setState({
                show:!show
            },()=>{
                callback && callback(!show);
            })
        }
};








