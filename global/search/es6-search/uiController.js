/**
 * Created by huangxiaogang on 16/7/28.
 */

//引入HTML模板
import { hintItemTpl,loadingTpl,hintWrapTpl,cancelBtnTpl,hiddenInputTpl  } from './utils/tpl.js';
/**
 * UiController界面控制器
 * @param nodes dom节点
 * @param options: ['p','showClose','itemKeyName','appendEstateName','currentHouseType']
 */
export default (nodes,options)=>{

    let {exactMatch,appendEstateName,__tipsTitle} = options;
    let { $container,$input } = nodes;

    //初始化界面UI
    (function(){
        // 生成下拉框$hintPanel 和  $cancelBtn 节点
        $(hintWrapTpl).appendTo(options.hintContainer || $container);
        $(cancelBtnTpl).insertAfter($input);
        if (!$container.find('input[name="t"]').size()) {
            $(hiddenInputTpl).appendTo($container);
        }
    }());

    //获取生成的UI界面的dom节点
    let $hintPanel = $container.find('.hint-wrap'),
        $cancelBtn = $container.find('.search-close'),
        $typeInput = $container.find('input[name="t"]');
    /**
     *   处理cancelBtn相关模块。
     *   @param type 是否通过点击触发 'click'【点击触发】
     */
    let dealCancelBtn = function(type){
        if(type=='click' || $input.val()=='' ){
            $cancelBtn.hide();
            $input.val('');
        }else{
            $cancelBtn.show()
        }
    };
    //处理键盘上下,高亮等
    let dealKeyHintPanel = function(keyCode){
        var active = $hintPanel.find('.hint-item.active');
        active.removeClass('active');
        var hintItems = $hintPanel.find('.hint-item');
        if (keyCode == 38) {
            //上
            if (!active.size()) {
                hintItems.last().addClass('active');
            } else {
                var prev = active.prev();
                if (!prev.size()) {
                    //如果没有
                    hintItems.last().addClass('active');
                } else {
                    prev.addClass('active');
                }
            }
        } else {
            //下
            if (!active.size()) {
                hintItems.first().addClass('active');
            } else {
                var next = active.next();
                if (!next.size()) {
                    hintItems.first().addClass('active');
                } else {
                    next.addClass('active');
                }
            }
        }
        let newActive = $hintPanel.find('.hint-item.active');
        $input.val(newActive.data('key'));
        // 滚动条跟随
        if (newActive.index() >= 6) {
            $hintPanel.scrollTop(newActive.index() * newActive.height());
        } else {
            $hintPanel.scrollTop(0);
        }
    };
    //处理点击下拉框条目模块
    let itemToInput = function(item){
        $input.val( item.data('key') );
        $hintPanel.find('.hint-item').removeClass('active');
        item.addClass('active');
        $.fn.placeholderClean && $input.placeholderClean();
        $typeInput.val( item.data('querytype'));
        $hintPanel.hide();
    };
    //显示下拉框
    let dealHintPanel = function(){
        $hintPanel.find('.active').removeClass('active');
        if($hintPanel.children()){
           $hintPanel.show();
        }
        $(document).one('click', function() {
            if (exactMatch) {
                //如果是精确匹配
                if ($hintPanel.children().length !== 1) {
                    if ($hintPanel.is(':visible')) {
                        $hintPanel.find('.active').trigger('click');
                    }
                }
            }
            $hintPanel.hide();
        });
    };
    /**
     * AJAX渲染下拉框
     * @param d 后端传回的数据
     * @param inputValue  需要修改样式的关键字
     */
    let renderHintPanel = function(d,inputValue){
        if (d.data && d.data.length == 0) {
            $hintPanel.empty().hide();
        } else if (d.data) {
            $hintPanel.empty();
            var reg = new RegExp('(' + inputValue + ')', 'gi');
            _.each(d.data, function(item) {
                //为了兼容iw400的返回值{id:xxx,text:xxx}
                var itemKey = item[options.itemKeyName] || item.key || item.text;

                if (!itemKey) return true;

                item.key = itemKey;

                if (itemKey.length > 50) {
                    item.title = itemKey;
                }
                itemKey = itemKey.substr(0, 50);
                item.uikey = itemKey.replace(reg, function(str, key) {
                    return '<span class="bold">' + global.escapeHtml(key) + '</span>';
                });
                var itemTip = item.tip;
                if (itemTip) {
                    itemTip = itemTip.substr(0, 48 - itemKey.length);
                } else {
                    itemTip = '';
                }
                item.tip = itemTip;
                item.queryType = 3; //查询类型：3数据库Tips历史
                item.tipsTitle = __tipsTitle[item.grade]
            });
            var html = template.draw(hintItemTpl, {
                hints: d.data,
                isAppendEstateName: appendEstateName
            });
            $hintPanel.html(html);
            //存储input用于打点
            $hintPanel.data('inputWord',inputValue);
            dealHintPanel();
        }
        if (exactMatch) {
            //如果是精确匹配条数只有1的时候，输入值和查询值一样，则自动触发
            if ($hintPanel.children().length == 1) {
                if ($input.val() == $hintPanel.find('.key-txt').text()) {
                    $hintPanel.children().trigger('click');
                }
            }
        }
    };

    return {
        //通过初始化生成的节点
        genNodes:{
            $hintPanel,
            $cancelBtn,
            $typeInput
        },
        dealCancelBtn,
        itemToInput,
        dealHintPanel,
        dealKeyHintPanel,
        renderHintPanel
    }
}
