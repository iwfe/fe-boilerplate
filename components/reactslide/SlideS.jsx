/*
* @Author: yuqy
* @Date:   2016-10-14 10:27:52
 * @Last Modified by: yuqy
 * @Last Modified time: 2016-11-16 16:03:34
* 我是react小图组件
    props: 
    smallImageArr={小图数组数据}
    currentSIndex={小图当前index}
    eachSmallImgWidth={每张小图宽度}
    eachMediumImgWidth = {每张中图宽度}
    videoObj={视频数组}
    callback={点击小图回调函数}
*/
'use strict';
import Img from '../../house/preloadimg/preloadimg';
import classNames from 'classnames';
import './SlideS.scss';
export default class SlideS extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            currentSIndex: props.currentSIndex, //小图当前index,
            currentSPage: 0  //小图当前页(页：比如7张算一页)
        }
    }
    componentWillReceiveProps(nextProps){
        let self = this,
            {currentSPage} = self.state,
            {currentSIndex} = nextProps,
            cspage = self.whichPage(currentSIndex),
            offset = self.getOffset(cspage);
        if (cspage != currentSPage){
            self.animateImage(offset);
        }
        self.setState({
            currentSIndex: currentSIndex,
            currentSPage: self.whichPage(currentSIndex)
        })
    }
    clickSmallImage(index){
        let self = this,
            {callback} = self.props;
            callback && callback(index);
    }
    //根据给定index计算当前小图处于第几页
    whichPage(index){
        let self = this, currentSPage = 0,
            {eachMediumImgWidth,eachSmallImgWidth} = self.props,
            numPerPage = self.getNumPerPage();
        currentSPage = Math.floor(index / numPerPage);
        return currentSPage;
    }
    //计算一张大图的宽度能容纳几张小图
    getNumPerPage(){
        let self = this,
            {eachMediumImgWidth,eachSmallImgWidth} = self.props;
        return  Math.floor(eachMediumImgWidth / eachSmallImgWidth); 
    }
    //计算小图有几页
    getTotalPage(){
        let self = this,
            {smallImageArr} = self.props,
            dataLength = self.getDataLength();
        return Math.ceil(dataLength / self.getNumPerPage());
    }
    //根据小图页数计算应该偏移多少
    getOffset(curpage){
        let self = this,
            {eachSmallImgWidth} = self.props;
        return - curpage * (eachSmallImgWidth * self.getNumPerPage());
    }
    switchPage(direction){
        let self = this,
            {smallImageArr, callback, eachSmallImgWidth} = self.props,
            {currentSIndex, currentSPage} = self.state,
            totalPage = self.getTotalPage(),
            curOffset = 0;
        if(direction == 'left'){
            currentSPage --;
        } else if(direction == 'right'){
            currentSPage ++;
        }
        if (currentSPage > totalPage) return false;
        self.animateImage(self.getOffset(currentSPage), ()=>{
            self.setState({
                currentSPage: currentSPage
            })
        })
    }
    //有视频时，小图数组数据长度加1
    getDataLength(){
        let self = this,
            {smallImageArr,videoObj} = self.props,
            {hasVideo} = videoObj,
            smallImageArrLength = smallImageArr && smallImageArr.length,
            res = hasVideo ? smallImageArrLength + 1 : smallImageArrLength;
        return res;
    }
    animateImage(offset, callback){
        let self = this;
        $(self.refs.smallImgUl).animate({
            "left": offset
        }, 400,()=>{
            callback && callback();
        });
    }
    renderItem(){
        let self = this, jsxvideo = null,
            {smallImageArr, videoObj} = self.props,
            {hasVideo, videoType, defaultPic, defaultSmallPic} = videoObj,
            {currentSIndex} = self.state,
            getFirstImage = smallImageArr && smallImageArr[0] && smallImageArr[0].url || '';
        //如果有视频，小图第一张视频封面图，如果有defaultSmallPic字段，取defaultSmallPic字段，没有则取第一张小图
        defaultSmallPic = defaultSmallPic ? defaultSmallPic : getFirstImage;
        //如果有视频
        if (hasVideo){
            let livClass = classNames({
                'small-img-li': true,
                'current': 0 == currentSIndex
            }) 
            jsxvideo = 
            <li className={livClass} key='svideo' onClick={()=>{self.clickSmallImage(0)}}>
                <Img 
                    loadImg={iwjw.loadingImg}
                    realSrc={defaultSmallPic}
                    className="small-img simgsVideo video-start active"
                    needResize = {true}
                    isThereLable = {false}
                    />
                <div className="simgs-icon-area">
                {
                 videoType == 1 ? 
                  <img className="simgs-panaroma-icon" src={iwjw.videoPanaromaBtnImg}/>
                 : videoType == 0 ? 
                  <img className="simgs-video-icon" src={iwjw.videoBtnImg}/>
                 : null
                }
                </div>
            </li>
        }
        let arr = smallImageArr.map((ele, index)=>{
            let compareIndex = hasVideo ? index+1 : index;
            let liClass = classNames({
                'small-img-li': true,
                'current': compareIndex == currentSIndex
            })
            return(
                <li 
                    className={liClass} 
                    key={index}
                    onClick={()=>{self.clickSmallImage(compareIndex)}}>
                    <Img 
                        loadImg={iwjw.loadingImg}
                        realSrc={ele.url}
                        className="small-img"
                        needResize = {true}
                        isThereLable = {false}
                        />
                </li>
            )
        })
        return [jsxvideo,arr];
    }
    renderArrow(){
        let self = this, jsxprev=null, jsxnext=null,
            {smallImageArr} = self.props,
            {currentSIndex, currentSPage} = self.state;
        jsxprev = [
                <div className="switch-s-img switch-s-left" onClick={()=>{self.switchPage('left')}}>
                    <i className="iconfont if-arrow-left"></i>
                </div>
            ];
        jsxnext = [
                <div className="switch-s-img switch-s-right" onClick={()=>{self.switchPage('right')}}>
                    <i className="iconfont if-arrow-right"></i>
                </div>
            ];
        if(currentSPage == 0){
            jsxprev = null;
        } 
        if (currentSPage == self.getTotalPage() - 1){
            jsxnext = null;
        }
        return [jsxprev,jsxnext];
    }
    render(){
        let self = this;
        return(
            <div className="small-img-wrap">
                <ul className="small-img-ul clearfix" ref="smallImgUl">
                    {self.renderItem()}
                </ul>
                    {self.renderArrow()}
            </div>
        )
    }
}