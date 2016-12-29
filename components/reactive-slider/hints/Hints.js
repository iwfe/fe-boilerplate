/*
* 进slider的提示
* @Author slashhuang
* 约定组件编写规范
 getBaseData
 ==>{
    options, 配置相关
    metaData 基础数据相关
 }
*/

import { Component } from 'react';
import {findDOMNode} from 'react-dom';
class Hints extends Component{
    constructor(){
        super();
        let { options }  = this.getBaseData();
        let { tip } = options;
        this.state={
            tip:tip
        }
    }
    componentDidMount(){
         // $(findDOMNode(this.refs['tip-dom'])).animate({
         //        top: 60
         //    }, 500).delay(1000).animate({
         //        top: -30
         //    }, 200);
        $(findDOMNode(this.refs['tip-dom'])).animate({
                top: 60
            }, 500).fadeOut();
    }
    render(){
        let { tip } = this.state;
        let xml = null;
        if(tip && tip.active && tip.message){
                xml = <div className = 'slide-tip animated' ref='tip-dom'>
                        <div className="slide-tip-in">
                            { tip.message}
                        </div>
                    </div>;
        }
        return  xml;
    }
}
export default{
    slideHints:Hints
}