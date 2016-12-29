/**
 * Created by huangxiaogang on 16/7/28.
 * search组件的所有块状html
 */

export default  {
    hintItemTpl: '' +
            '{{each hints}}' +
            '<a class="hint-item" title="{{$value.title}}" data-grade="{{$value.g}}" data-id="{{$value.id}}" data-querytype="{{$value.queryType}}" data-key="{{$value.key}}" data-kw="{{$value.kw}}" data-lon="{{$value.lon}}" data-lat="{{$value.lat}}" data-code="{{$value.code}}">' +
            '    <em class="iconfont">' +
            '        {{if $value.isHistory}}' +
            '            &#xd64a;' +
            '        {{else}}' +
            '            {{if $value.g == 5 || $value.g == 4}} &#xd62d; {{else if $value.g == 2 || $value.g == 1}} &#xd605; {{else if $value.g == 7 || $value.g == 8}} &#xd655; {{else}} &#xd610; {{/if}}' +
            '        {{/if}}' +
            '    </em>' +
            '    <span class="txt-wrap">' +
            '        <span class="key-txt">{{#$value.uikey}}</span>' +
            '        {{if (isAppendEstateName && $value.name)}}' +
            '            <span class="key-estate">[ {{$value.name }} ]</span>' +
            '        {{/if}}' +
            '        {{if $value.tip}}' +
            '            <span class="tip-txt">{{$value.tip}}</span>' +
            '        {{/if}}' +
            '        {{if $value.kw}}' +
            '            <span class="kw-txt">{{$value.kw}}</span>' +
            '        {{/if}}' +
            '    </span>' +
            '    {{if $value.houseNum}}' +
            '       <span class="key-housenum">{{$value.houseNum}}套</span>' +
            '    {{/if}}' +
            '</a>' +
            '{{/each}}',
    loadingTpl : '' +
            '<div class="search-load">' +
            '   <img src="' + iwjw.loadingSvg + '" width="24" height="24" />' +
            '   <span>正在搜索&nbsp;&nbsp;“{{value}}”</span>' +
            '</div>',
    hintWrapTpl:
            '<p class="hint-wrap"></p>',
    cancelBtnTpl:
            '<i class="iconfont search-close" title="清除内容">&#xd648;</i>',
    hiddenInputTpl:
            '<input name="t" type="hidden" value="1" />'
};