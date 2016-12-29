/*
* @Author: yuqy
* @Date:   2016-06-29 13:04:15
* @Last Modified by:   yuqy
* @Last Modified time: 2016-10-17 10:30:06
*/

'use strict';
import classNames from 'classnames';

export default class HouseLabel extends React.Component{

    constructor (props) {
        super(props);
        this.state = {
            ...props.data
        }
    }

    //满二
    renderTwo(data){
        let jsx = null, {aboveFiveYear, onlyOne} = data;
        if (aboveFiveYear == 1 || onlyOne != 1 && aboveFiveYear == 4){
            jsx = <em key="0" className="fe-year tag-item">满二</em>
        }
        return jsx;
    }

    //满五唯一
    renderFiveOnly(data){
        let jsx = null, {aboveFiveYear, onlyOne} = data;
        if (onlyOne == 1 && aboveFiveYear == 4 ){
            jsx = <em key="1" className="fe-year tag-item">满五唯一</em>
        }
        return jsx;
    }

    //学区
    renderSchool(data){
        let jsx = null, name = null,
            {flag} = this.props,
            {ifSchool, schoolName, houseType} = data;

        if (flag == 'complete'){
            if(houseType != 1 && ifSchool == 1){
                name = schoolName != '' ? schoolName : '学区'
            }
        } else {
            if (houseType != 1){
                name = ifSchool == 1 ? '学区' : null;
            }
        }
        if (name) jsx = <em key="2" className="fe-school tag-item">{name}</em>
        return jsx;
    }

    //地铁
    renderSubway(data){
        let jsx = null, name = null,
            {flag} = this.props,
            {ifSubway, houseType} = data,
            subway = data.trafficInfo || data.subway,
            subClass = classNames ({
                'tag-item': true,
                'fe-subway': true,
                'need-cut': houseType == 1 && flag == 'subway' && subway
            })

        if (flag == "complete") {
            if (houseType == 1 && subway || ifSubway == 1){
                name = subway ? subway : '地铁';
            }
        } else {
            // 租房
            if (houseType == 1) {
                if (flag == 'label' && subway) name = '地铁';
                if (flag == 'subway' && subway) {
                    name = subway ? subway : '地铁';
                }
            } else {
                name = ifSubway == 1 ? '地铁' : null;
            }
        }

        if (name) jsx = <em key="3" className={subClass}>{name}</em>
        return jsx;
    }

    renderVentilation(data){
        let {ventilation,houseType} = data;
        debugger
        return (ventilation == 1 && houseType==2) ? <em key="4" className="tag-item">南北通透</em> : null;
    }

    renderTime(data){
        let {ventilation,houseType} = data;
        return (ventilation == 1 && houseType==2) ? <em key="5" className="tag-item">随时看房</em> : null;
    }

    renderHL(){
        let {data} = this.props;
        let dom = null;
        let {houseType,labels} = data;
        if(houseType == 2){
            if (labels&&labels.length){
                dom = labels.map(function(item,i) {
                    return (<em key={"tag-"+i} className="tag-item">{item}</em>);
                });
            };
        }else{
            dom = [this.renderSubway(data)];
        }
        return dom;
    }

    render(){
        return (
                <em>{this.renderHL()}</em>
            )
    }
}