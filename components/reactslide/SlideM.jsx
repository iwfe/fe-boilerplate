/*
* @Author: yuqy
* @Date:   2016-11-10 10:27:52
 * @Last Modified by: yuqy
 * @Last Modified time: 2016-11-18 18:04:11
* 我是react中图组件
    props: 
    mediumImageArr={数据数组}
    currentMIndex={中图当前index}
    eachMediumImgWidth = {每张中图图片宽度}
    videoObj={视频数组}
    callback={点击箭头中图切换回到}
*/
'use strict';
import Img from '../../house/preloadimg/preloadimg';
import classNames from 'classnames';
import './SlideM.scss';
export default class SlideM extends React.Component{
    constructor(props){
        super(props);
        this.state={
            currentMIndex: props.currentMIndex, //中图当前index
        }
    }
    componentWillReceiveProps(nextProps){
        let self = this,
            {mediumImageArr,videoCallback} = self.props,
            {currentMIndex} = nextProps;
        self.animateImage({offset: self.getOffset(currentMIndex),animateTime: 0},()=>{
            self.setState({
                currentMIndex: currentMIndex,
            })
        })
        //关闭大图的情况，回调出去，用来判断是否需要隐藏视频
        videoCallback && videoCallback(currentMIndex)
    }
    enterBig(){

    }
    getOffset(index){
        let self = this,
            {eachMediumImgWidth} = self.props;
        return - eachMediumImgWidth * index;
    }
    animateImage(params, callback){
        let self = this,
            {offset, animateTime} = params;
        $(self.refs.mediumImgUl).animate({
            "left": offset
        }, animateTime, ()=>{
            callback && callback();
        })
    }
    switchMImage(direction){
        let self = this,
            // isAnimating = true,//TODO 防止频繁点击
            {mediumImageArr,callback,eachMediumImgWidth} = self.props,
            dataLength = self.getDataLength(),
            {currentMIndex, left} = self.state,
            flag = direction == 'right' ? '-' : direction == 'left' ? '+' : '',
            totalWidth = eachMediumImgWidth * dataLength,
            curOffset=0;
            // if(!isAnimating) return;
        if(direction == 'right'){
            currentMIndex++;
        } else if(direction == 'left'){
            currentMIndex--;
        }
        curOffset = self.getOffset(currentMIndex);
        if (Math.abs(curOffset) > totalWidth ) return false;
        //这里left是绝对值：指定left值是多少，而不是每次移动多少
       self.animateImage({offset: curOffset, animateTime: 400},()=>{
            self.setState({
                currentMIndex: currentMIndex,
            })
            callback && callback(currentMIndex);
       })
    }
    //有视频时，数据长度加1
    getDataLength(){
        let self = this,
            {mediumImageArr,videoObj} = self.props,
            {hasVideo} = videoObj,
            mediumImageArrLength = mediumImageArr && mediumImageArr.length,
            res = hasVideo ? mediumImageArrLength + 1 : mediumImageArrLength;
        return res;
    }
    renderItem(){
        let self = this, jsxVideo = null,
            {mediumImageArr, videoObj} = self.props,
            {hasVideo,houseVideoUrl,defaultPic,videoType} = videoObj,
            dataLength = self.getDataLength();
        if (hasVideo){
            let videoClass = classNames({
                'videoBtn': true,
                'houseVideoBtn': true,
                'para-video-btn': videoType == 1
            })
                jsxVideo = 
                <li className="medium-img-li" key="video">
                    <i className={videoClass}>
                        {
                            videoType == 1 ?
                            <img className="simgs-panaroma-icon" src={iwjw.videoPanaromaBigBtnImg}/>
                            :
                            videoType == 0 ?  
                            <img className="simgs-video-icon" src={iwjw.videoBtnImg}/>
                            : null
                        }
                    </i>
                    <Img 
                        loadImg={iwjw.loadingImg}
                        realSrc={defaultPic}
                        className="medium-img videoimg"
                        needResize = {true}
                        isThereLable = {false}
                    />
                    {
                        videoType == 1 ? 
                        <i className="load-fullvideo-btn"></i>
                        : null
                    } 
                    <p className="desc-info">{pageConfig.staticTag == 'sale' ? '视频 ': null }{`1/${dataLength}`}</p>
                </li>
            }
        let arr = mediumImageArr.map((ele, index)=>{
            let displayIndex = hasVideo ? index + 2 : index + 1;
            return(
                <li 
                    className="medium-img-li" 
                    key={index} 
                    onClick={()=>{self.enterBig(index)}}>
                    <Img 
                        loadImg={iwjw.loadingImg}
                        realSrc={ele.url}
                        className="medium-img"
                        needResize = {true}
                        isThereLable = {false}
                        />
                    <p className="desc-info">{ele.description ? (ele.description+' '): null}{`${displayIndex}/${dataLength}`}</p>
                </li>
            )
        })
        return [jsxVideo,arr];
    }
    renderArrow(){
        let self = this, jsxprev=null, jsxnext=null,
            {mediumImageArr} = self.props,
            {currentMIndex} = self.state,
            dataLength = self.getDataLength();
        jsxprev = [
                <div className="switch-m-img switch-m-left" onClick={()=>{self.switchMImage('left')}}>
                    <i className="iconfont if-arrow-left"></i>
                </div>
            ];
         jsxnext = [
                <div className="switch-m-img switch-m-right" onClick={()=>{self.switchMImage('right')}}>
                    <i className="iconfont if-arrow-right"></i>
                </div>
            ];
        if(currentMIndex == 0){
            jsxprev = null;
        } 
        if (currentMIndex == dataLength - 1){
            jsxnext = null;
        }
        return [jsxprev,jsxnext];
    }
    render(){
        let self = this,
            {videoObj} = self.props,
            {hasVideo} = videoObj; 
        return(
            <div className="medium-img-wrap">
                {
                    hasVideo ? 
                    <div className="player-wrap">
                        <div id="IWJWplayer"></div>
                        <div id="IWJWplayer-FD"></div>
                    </div>
                    : null
                }
                <ul className="medium-img-ul clearfix" ref="mediumImgUl">
                    {self.renderItem()}
                </ul>
                {self.renderArrow()}
            </div>
        )
    }
}
