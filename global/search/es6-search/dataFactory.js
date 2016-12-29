/**
 * Created by huangxiaogang on 16/7/28.
 * search组件前端数据库
 */

export default (nodes,options)=>{
    let  {$typeInput,$container,$input} = nodes;
    /**
     * 存储search组件需要对外导出的所有数据
     * searchDB
     * @param selectedItem:
     * data-grade="3" data-id="70794" data-querytype="3"
     * data-key="国和路111弄小区" data-kw="" data-lon="121.52625"
     * data-lat="31.311373" data-code="iCG2WJF8xiE"
     */
    let database={
        selectedItem:null,//当前选择的下拉菜单节点
        $input:$input,
        panelType:$container.data('housetype')//当前panel产生的来源,会在set过程中动态修改
       };
    let getData=(name)=>{
        let  {provinceId} = options;
        let metaData={
            action:$container.attr('action')||'',//form表单的action属性值
            queryType: $typeInput.val()||'',//隐藏的input中存储的查询类型 @TODO 后期移除
            houseType:$container.data('housetype'),//目前所在的tab区域，房源类型
            name:$input.attr('name')||'',//input框的name属性
            provinceId:$container.data('provinceid') || provinceId,
            value:$input.val().replace(/<|>|&lt;|&gt/g,'').replace(/\\/g,'').trim()//input框的值
        };
        let finalData = $.extend(metaData,database);
        if(name){
            return finalData[name]
        }else{
            return finalData
        }
    };
    let setData=(opt)=>{
        $.extend(database,opt);
    };
    return {
        getData,
        setData
    }

}