/*
* @Author: yuqy
* @Date:   2016-06-28 14:16:59
 * @Last Modified by: yuqy
 * @Last Modified time: 2016-11-17 16:07:47
*/
 
'use strict';
import HouseLabel from './house_label';
import Img from './preloadimg/preloadimg';
import './house_item.scss';
import classNames from 'classnames';

export default class HouseItem extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
    }

    renderTitle(house){
        let dom = null;
        if(house.houseType == 2){
            dom= <span>{house.estateName}  {house.floorTypeOnTitle} {house.bedroomSum}室 {house.spaceArea}平 {house.orientation? '朝'+house.orientation : null}</span>
        }else{
            dom= [
            <i className="house-item-title" key="shi">{house.estateName} </i>,
            <i className="house-item-unit" key="ting"><em className="bedroom-num">{house.bedroomSum}</em>室<em className="liveroom-num">{house.livingRoomSum}</em>厅<em className="wc-num">{house.wcSum}</em>卫</i>,
            <i className="house-item-area" key="wei"><em className="space-area"> {house.spaceArea}</em>m²</i>
            ];
        }
        return dom;
    }

    //楼层，建造年代，装修
    renderHouseDetail(house){
        let floor = null,room = null,cont = null,deco = null,number = null,dom=null;
        if(house.floorStr){
            floor = <i key="1" className="house-info house-floor">{house.floorStr}</i>
        }
        if(house.houseType == 2){
            room = <i key="0" className="house-info">{house.bedroomSum}室{house.livingRoomSum}厅{house.wcSum}卫</i>;
            if (house.contract > 0){
                cont = <i key="2" className="house-info">{house.contract}年建造</i>
            }
            let {numPerFloor,elevatorNum} = house,
                bool1 = elevatorNum > 0,
                bool2 = numPerFloor > 0;
            if(bool1){
                if(bool2){
                    number = <i key="4" className="house-info">{elevatorNum}梯{numPerFloor}户</i>
                }else{
                    number = <i key="4" className="house-info">每层{elevatorNum}梯</i>
                }
            }else{
                if(bool2){
                    number = <i key="4" className="house-info">每层{numPerFloor}户</i>
                }
            }
            dom =  [room,floor,number,cont];
        }else{
            if (house.decorateTypeStr){
                deco = <i key="3" className="house-info house-decorate">{house.decorateTypeStr}</i>
            }
            dom =  [floor,cont,deco];
        }
        return dom;
    }

    handleClick(clickOpt){
        let {clickCallback} = this.props;
        clickCallback && clickCallback (clickOpt)
    }

    render(){
        let self = this;
        let house = self.props.listData;
        let clickOpt = {code: house.houseCode, id: house.houseId};
        return (
            <div>
                <div className="list-info">
                    <a href={`/${house.houseDetailUrl}`}
                       alt={house.estateName} className="house-a"
                       target= {house.isBlank ? "_blank" : "_self"}
                       onClick = {()=>{self.handleClick(clickOpt)}}>
                        <Img loadImg = {iwjw.loadingImg}
                            realSrc={house.pic}
                            className="house-img"
                            needResize = {true}
                            isThereLabel = {true}
                            house = {house}/>
                        {/*<img src={iwjw.loadingImg} key = {house.pic} data-src={house.pic} className="house-img" data-need-resize = "auto"/>
                        {this.renderLabel(house)*/}
                    </a>
                    <div className="list-info-r">
                        <h3 className="house-title need-cut">
                            <a className="house-title-a"
                            href={`/${house.houseDetailUrl}`}
                            alt={house.estateName}
                            title = {house.estateName}
                            target= {house.isBlank ? "_blank" : "_self"}
                            onClick = {()=>{self.handleClick(clickOpt)}}>
                                {this.renderTitle(house)}
                            </a>
                        </h3>
                        <p className="house-detail">
                           {this.renderHouseDetail(house)}
                        </p>
                        <p className="house-address">{house.cityName} - {house.townName} {house.subEstateName}</p>
                        <p className="house-feature">
                            <HouseLabel
                                data = {house}
                                flag = "complete"/>
                        </p>
                    </div>
                </div>
                <div className="list-detail">
                    <div className="house-item-price">
                        <span className="price-total"><b className="price-num">{house.price}</b>{house.houseType == 1 ? "元/月":"万"}</span>
                        { house.houseType != 1 ? <p className="price-avg">{house.unitPrice}</p> : null }
                    </div>
                </div>
            </div>
        )
    }
}