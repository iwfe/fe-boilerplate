/**
* 滑动组件右下角描述区域
* @Author slashhuang
* 约定组件编写规范
 getBaseData
 ==>{
    options, 配置相关
    metaData 基础数据相关
 }
 notify(object)
 ==>{
    通知父组件
 }
*/
let classNames  =require('classnames');
import { Component,PropTypes } from 'react';
class SliderDesc extends Component{
    constructor(props,context){
        super();
        this.__setState(props);
    }
    __setState(props){
        let { options,metaData }  = this.getBaseData();
        let { pagenumber } = options;
        let { sliderTotal }=metaData;
        this.state={
            sliderTotal,
            asset:options.asset
        };
    }
     /*数据类型说明*/
    static propTypes={
        currentIndex: PropTypes.number

    }
    /*
     * {title:'string'}
     */
    renderDesc(currentIndex){
        let { asset }  = this.state;
        return asset[currentIndex];
    }
    render(){
        let { sliderTotal } = this.state;
        let { currentIndex } = this.props;
        let descData = this.renderDesc(currentIndex);
        return <p className="slider-desc">
                    <span className="slider-title">
                        { descData&&descData['title'] ||''}
                    </span>
                    <span className="slider-index">
                        { currentIndex+1 }
                    </span>
                    /
                    <span className="slider-total">
                    { sliderTotal }</span>
               </p>
    }
}

export default {
    sliderDesc:SliderDesc
}
