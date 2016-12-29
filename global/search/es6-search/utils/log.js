/**
 * Created by huangxiaogang on 16/8/10.
 *
 * search 打点入口
 * @param type 打点的类型
 * @param dataSource  打点的数据来源【dataCenter】
 * @param _value  下拉框的数据来源
 */
export default (type,dataSource,_value)=>{
    let logData={};
    let {selectedItem,value,houseType} = dataSource;

    let queryType = selectedItem && selectedItem.data('querytype');
    let key = selectedItem && selectedItem.data('key');
    let code = selectedItem && selectedItem.data('code');
    let areaId = selectedItem && (selectedItem.data('areaid') ? selectedItem.data('areaid') :  selectedItem.data('id'));
    let index = selectedItem && selectedItem.index();
    let hintGrade = selectedItem && selectedItem.data('grade');

    /**
     * 点击下拉框的hintTip
     * queryType表明数据的来源
     * 3 点tips，2点历史，1是点地图找房button
     * @TODO
     * hintGrade标示 4地铁线+1区域+2版块+5地铁站+3小区+8学校+9新盘+7学校模式的区域+6学校模式的全部
     *  areaid ==>  不同的表下的新盘和小区可能ID相同
     */
    let ClickItem = {
        queryType: queryType ==2?0:hintGrade,
        key: key,
        inputVal: _value||value,
        cid: queryType ==2?0:areaId,
        tips: (index + 1),
        ht:houseType
    };
    /**
     * 按下enter键
     */
    let pressEnterKey = {
        inputVal: value,
        ht:houseType
    };
    switch (type){
        case 'click':
            logData= ClickItem;
            break;
        case 'enter':
            logData= pressEnterKey;
            break;
        default :
            logData= pressEnterKey;
    };
    $.jps.trigger('log',$.extend({type:'search'},logData));
}

