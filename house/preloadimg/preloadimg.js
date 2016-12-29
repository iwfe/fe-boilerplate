/*
* @Author: yuqy
* @Date:   2016-08-23 14:32:51
* @Last Modified by:   zoucong
* @Last Modified time: 2016-11-21 14:02:46
*/

/* 适用于先加载默认图，再加载图片的场景
使用：
<Img loadImg = 默认图
    realSrc= 真实src
    needResize = 是否需要进行自适应居中
    className = 图片样式
    isThereLable = 是否显示各种标签
    house={}  渲染标签需要的数据
    imgErrorCallback={} 图片加载失败的回调
    imgLoadCallback={} 图片加载成功的回调
*/

'use strict';
import classNames from 'classnames';
import './preloadimg.scss';
const defaultLoading = pageConfig.staticUrl +  require('../../components/tpls/agent.png');

export default class Img extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            ...props,
            showLabel: false,
            src: props.loadImg,
        }
        this._unmount = false;
        // loadImg
        // realSrc
        // needResize
        // className
        // isThereLabel
    }
    componentDidMount(){
        let self = this,
            {src, realSrc, needResize} = self.state;
        if (realSrc != ''){
            this.changeSrc();
        }
    }

    componentWillUnmount () {
        this._unmount = true;
    }

    componentWillReceiveProps(nextProps){
        let self = this,
            {src, realSrc,loadImg}  = self.state;
        if (nextProps.realSrc != realSrc){
            //更新的图片如果没有url，则Img应该加载默认图，否则将保持上一次的realSrc,从而导致bug
            if(!nextProps.realSrc){
                self.setState({
                    src: loadImg
                })
            }else{
                //更新的图片保存在state中，然后changeSrc
                self.setState({
                    realSrc: nextProps.realSrc
                }, ()=>{
                    self.changeSrc();
                })
            }
        }

        self.setState({
            house: nextProps.house,
            className: nextProps.className
        })
    }
    // >_<还是用了jquery方法
    resizeImg(newimg){
        let self = this;
        let item = $(self.refs.autoImg);
        setTimeout(function() {
            var parentEl = item.parent();
            var pH = parentEl.height();
            var pW = parentEl.width();
            var iH = newimg.height;
            var iW = newimg.width;
            var offset = 0;

            if ((pH == iH) && (pW == iW)) {
                return;
            }
            var pK = pH / pW; // 斜率
            var iK = iH / iW; // 斜率
            offset = pK - iK;
            if (offset <= 0) {
                item.css({
                    width: '100%',
                    height: 'auto',
                    'margin-top': (pW * (pK - iK)) / 2 + 'px'
                });
            } else if (offset > 0) {
                item.css({
                    width: 'auto',
                    height: '100%',
                    'margin-left': (pH / pK - pH / iK) / 2 + 'px'
                });
            }
        }, 0);
    }
    changeSrc(){
        let self = this,
            {src, realSrc, needResize,showLabel, loadImg} = self.state;
        let {imgLoadCallback, imgErrorCallback} = self.props;

        // undefined bug
        if(realSrc === undefined){
            return;
        };

        var img = new Image();
        img.onload = function(){
            // 组件已经被移除
            if(self._unmount){
                return false;
            }

            let newimg = this;
            self.setState({
                src: realSrc,
                showLabel: true
            })
            if(needResize){
                self.resizeImg(newimg);
            }

            imgLoadCallback && imgLoadCallback();
        }
        img.onerror = function(){
            // 组件已经被移除
            if(self._unmount){
                return false;
            }
            //更新的图片加载失败则替换为默认图
            self.setState({
                src: loadImg,
            })
            imgErrorCallback && imgErrorCallback();
        }

        // debugger;
        img.src = realSrc;
    }

    //独家房源 置顶推荐
    renderDJLabel(){
        let dj = null,self = this,text,
            {house,showLabel}= self.state;

        let djClass = classNames({
            'djmark': true,
            'fe-sourceuser': house.source == 4,
            'fe-sign': house.sign == 1,
            'show': showLabel
        })
        text = house.source == 4 ? '业主发布' : house.sign == 1 ? '置顶推荐' : '';
        if(house.source == 4 || house.sign == 1){
            dj = <i key="3" className={djClass}>{text}</i>
        }
        return dj;
    }

    //渲染放在图片上的各种标签：置顶推荐，独家房源，已成交，videoBtn 等。
    renderLabel(){
        let self = this, deal = null, video = null, dj = null,
            {house,showLabel}= self.state;
        // let videoClass = classNames({
        //     'video-btn': true,
        //     'para-video-btn': house.videoType == 1,
        //     'auto-show': 'true',
        //     'show': showLabel
        // })
        let dealClass = classNames({
            'inval-status': true,
            'show': showLabel
        })

        if (house.invalTag){
            deal = <em key = "0" className={dealClass}></em>
        } else {

            if (house.hasVideo){

                video =  house.videoType == 1 ? 
                    <i key="1" className="panaroma-play-icon-sm"/> : 
                    <i key="1" className="video-play-icon-sm" >
                        <img src={iwjw.videoBtnImg}/>
                    </i>;
                //video = <em key = "1" className = {videoClass}><img src = {house.videoType == 1 ? iwjw.videoPanaromaBtnImg : iwjw.videoBtnImg}/> </em>
            }
            dj = self.renderDJLabel()
        }
        return [deal, video, dj]
    }


    render(){
        let self = this,
            {src, className, isThereLabel } = self.state;
            if(!src) src = defaultLoading;
        return(
            <div className = "react-img-wrap">
                <img src= {src} className = {className} ref = "autoImg"/>
                {isThereLabel ? self.renderLabel() : null}
            </div>
        )
    }
}
