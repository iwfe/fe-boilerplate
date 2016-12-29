/*
* @Author: yuqy
* @Date:   2016-10-14 10:27:52
 * @Last Modified by: yuqy
 * @Last Modified time: 2016-11-16 11:35:33
 * 我是中图小图组合组件
 * props: 
    parentApi={self 用于将外部this传进来，将内部this挂载在外部this.context变量上,外部可对这里进行setState} 
    smallImageArr={小图数组数据}
    mediumImageArr={中图数组数据}
    eachSmallImgWidth={每张小图宽度}
    eachMediumImgWidth = {每张中图宽度}
    videoObj={视频数组}
    videoCallback={点击小图回调给外层，供外层判断显示或隐藏视频}
*/
'use strict';
import SlideM from './SlideM.jsx';
import SlideS from './SlideS.jsx';
import './SlideMS.scss';
export default class SlideMS extends React.Component{
    constructor(props){
        super(props);
        this.state={
            currentMIndex: 0,
            currentSIndex: 0
        }
    }
    componentWillReceiveProps(nextProps){
        let self = this,
            {currentSIndex,currentMIndex} = nextProps;
        self.setState({
           currentSIndex: currentSIndex,
           currentMIndex: currentMIndex
        })
    }
    //this传递 组件与外部通信
    componentDidMount(){
        let {parentApi} = this.props;
        parentApi.context = this;
    }
    //大图轮播，修改小图currentSIndex
    setSmallIndex(index){
        let self = this;
        self.setState({
           currentSIndex: index,
           currentMIndex: index
        })
    }
    //小图点击，切换大图currentMIndex
    setMediumIndex(index){
        let self = this,
            {videoCallback} = self.props;
        self.setState({
            currentMIndex: index,
            currentSIndex: index
        })
        videoCallback && videoCallback(index);
    }
    render(){
        let self = this,
        {smallImageArr,mediumImageArr,eachMediumImgWidth,eachSmallImgWidth,videoObj,videoCallback} = self.props,
        {currentMIndex,currentSIndex} = self.state;
        return (
            <div className="slidems-wrap">
                <SlideM 
                    mediumImageArr={mediumImageArr}
                    currentMIndex={currentMIndex}
                    eachMediumImgWidth = {eachMediumImgWidth}
                    videoObj={videoObj}
                    videoCallback={videoCallback}
                    callback={(index)=>{self.setSmallIndex(index)}}
                />
                <SlideS
                    smallImageArr={smallImageArr}
                    currentSIndex={currentSIndex}
                    eachSmallImgWidth={eachSmallImgWidth}
                    eachMediumImgWidth = {eachMediumImgWidth}
                    videoObj={videoObj}
                    callback={(index)=>{self.setMediumIndex(index)}}
                />
            </div>
        )
    }
}