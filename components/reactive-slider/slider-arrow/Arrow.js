/**
* 左右箭头
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
class SliderArrow extends Component{
    constructor(props,context){
        super();
        this.__setState();
    }
    /*数据类型说明*/
    static propTypes={
        currentIndex: PropTypes.number

    }
    /*组件内部的状态管理*/
    __setState(){
        let { options,metaData }  = this.getBaseData();
        let { navigation } = options;
        let { sliderTotal }=metaData;
        this.state={
            sliderTotal,
            options:options,
            needRender:navigation.active && (sliderTotal > 1)
        };

    }
    arrowSlider(adder){
         /*通知父组件*/
        let { currentIndex } = this.props;
        this.notify({
            currentIndex:currentIndex+adder,
            _direction:adder>0?'next':'prev'
        })
    }
    render(){
        let { currentIndex } = this.props;
        let { sliderTotal,needRender,options } = this.state;
        let { isLoop } = options;
        let xml = null;
        if(needRender) {
            xml = <div>
                    <a  className="slider-prev slide-navigation"
                        style={{
                            display:(currentIndex <= 0 && !isLoop)?'none':'block'
                        }}
                        href="javascript:void(0)"
                        onClick={()=>this.arrowSlider(-1)}
                        title="">
                    <span className="iconfont if-arrow-left"></span>
                    </a>
                    <a  className="slider-next slide-navigation"
                        style={{
                            display: (currentIndex >= (sliderTotal - 1) && !isLoop)?'none':'block'
                        }}
                        href="javascript:void(0)"
                        onClick={()=>this.arrowSlider(1)}
                        title="">
                    <span className="iconfont if-arrow-right"></span>
                    </a>
               </div>
           };
         return xml;
    }
}

export default {
  'sliderArrow':SliderArrow
}




