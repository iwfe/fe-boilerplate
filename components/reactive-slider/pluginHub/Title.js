 /**
* 滑动组件下面的页标
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
// require('./extend.scss'); //有标题的页面，视频控件贴底

let classNames=require('classnames');
import { Component,PropTypes } from 'react';
require('./title.scss');
class Pagination extends Component{
    constructor(props){
        super();
        //初始化数据
        this.__setState(props);
    }
    /*数据类型说明*/
    static propTypes={
        currentIndex: PropTypes.number

    }
    /*组件内部的状态管理*/
    __setState(){
        let { options,metaData }  = this.getBaseData();
        let { pagination } = options;
        /*需要传入houseTitle，来展示UED头部*/
        let { sliderTotal }=metaData;
        let { houseTitle } = options;
        this.state={
            pageLength:sliderTotal,
            houseTitle:houseTitle || '您需要在option里面传入houseTitle字段'
        };
    }
    componentDidMount(){
        $('.video-control-wrap').css({
            bottom:'0px !important'
        })
        $('#J_door_model_container').css({
            bottom:'48px'
        })
    }
    render(){
        let {
            pageLength,houseTitle
        } = this.state;
        /*props层面*/
        let { currentIndex } = this.props;
        return  <div className="s-t-container">
                   <span className='s-t-c-title'>
                        { houseTitle }
                   </span>
                   <span className='s-t-c-num'>
                        {currentIndex+1}/{pageLength}
                   </span>
                </div>
    }
}
export default {
  'sliderTitle':Pagination
}


