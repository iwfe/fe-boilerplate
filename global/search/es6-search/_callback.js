/**
 * Created by huangxiaogang on 16/7/28.
 * 专门的callback管理
 */


export default   function(nodes,options) {
    let { $input }=nodes;
    let { inputWorldCallback,submitCallback,hintClickCallback } = options;
    /**
     * 以上均为options的key键。
     * inputWorldCallback, //输入文字回调
     * hintRequestCallback, //提示请求结束
     * hintClickCallback, //点击提示条目回调
     * submitCallback //提交表单回调
     */

    return {
        submitCallback: (dataSource)=>{
            let {$input,selectedItem} = dataSource;
            if(submitCallback){
                return submitCallback($input,selectedItem);
            }
        },
        hintClickCallback:(item)=>{
            $input.blur();
            if(hintClickCallback){
                return hintClickCallback(item);
            }
        },
        inputWorldCallback:inputWorldCallback
    }
}