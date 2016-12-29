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
let classNames=require('classnames');
import { Component,PropTypes } from 'react';
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
        let { sliderTotal }=metaData;
        this.state={
            paginationLength:sliderTotal,
            active:pagination.active
        };

    }
    renderPagination(length){
        let [i,pagination]=[0,[]];
        let {currentIndex}= this.props;
        let self = this;
        while (i<length){
            pagination.push(
                <li className={ classNames("pagination-item",{'slider-active':i==currentIndex}) }
                        slide-item-index={i}
                        onClick={(function(i){
                                return ()=>self.notify({currentIndex:i})
                            }(i))}
                        key={i}>
                        <a href="#"></a>
                    </li>);
            i++;
        };
        return pagination;
    }
    render(){
        let {
            paginationLength,active
        } = this.state;
        /*props层面*/
        let { currentIndex } = this.props;
        let xml = null;
        if(active){
            xml = <ul className="slide-pagination">
                    {
                        this.renderPagination(paginationLength)
                    }
                </ul>
        }
        return xml;
    }
}
export default {
  'sliderPagination':Pagination
}


