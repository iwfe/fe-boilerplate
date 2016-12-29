/**
 * Created by huangxiaogang on 16/7/28.
 * FuncController
 */

export default (nodes,options)=>{
    let { $hintPanel } = nodes;
    let { hintUrl,hintRequestCallback}=options;
    let pendingAjax = null;//用来表示ajax是否处于pending状态
    let changePanelData=(DataFactory,UiController)=>{
        let dbData =DataFactory.getData();
        let {provinceId,value,houseType}=dbData;
        if (!value || $.trim(value) == '') return false;
        pendingAjax && pendingAjax.abort();
        let data = {
            p: provinceId,
            kw: value,
            ht: houseType
        };
        //ajax用到了UIController
        pendingAjax = new $.ajax({
            url: hintUrl,
            data: data,
            dataType: 'json',
            type: 'get',
            cache: false,
            success: function(d) {
                if (d.status == 1) {
                    UiController.renderHintPanel(d,value);
                    hintRequestCallback && hintRequestCallback(d.data, $hintPanel);
                    DataFactory.setData({panelType:houseType})
                }
            },
            error: function(res, type) {
                if (type == 'abort') return false;
                $hintPanel.hide();
            }
        });
        return true;
    };
    /*g:1,区域，2板块，3小区，4地铁线路，5地铁站，6全部学区，7学区区域，8学区学校  9.新房*/
    let jumpLink=(dbData)=>{
        let { action,queryType,name,value,selectedItem,houseType} = dbData;
        let urlStr = '',
            pathUrl = '';
        if ($.trim(value)) {
            urlStr += (name + '=' + encodeURIComponent(value) + '&t=' + queryType + '&abtest=true');
        }
        if (selectedItem) {
            var grade = selectedItem.data('grade');
            var areaId = selectedItem.data('id');
            var code = selectedItem.data('code');
            //坐标
            var lon = selectedItem.data('lon');
            var lat = selectedItem.data('lat');
            if (grade && areaId) {

                //地图
                if(action === '/sale/map/' || action === '/chuzu/map/'){
                    //二手房或租房下的新房或者小区
                    if(grade==3||grade==9){
                        //grade3areaId11258lon121.257029lat31.126669/?kw=金地自在城
                            pathUrl += 'grade'+ grade;
                            pathUrl += 'areaId'+ areaId
                            pathUrl += 'lon'+ lon;
                            pathUrl += 'lat'+ lat
                        }else{
                            // 兼容新房
                            pathUrl += 'rg'+ grade;
                            pathUrl += 'rid'+ areaId;
                        }
                }else{
                    pathUrl += 'g'+ grade;
                    pathUrl += 'id'+ areaId;
                }
            }
        };
        let finalUrl = action + pathUrl + (urlStr ? ('?' + urlStr) : '');

        window.location.href = finalUrl;
    };

    return {
        changePanelData:_.debounce(changePanelData, 200),
        jumpLink
    }
}
