/************************************************
 * Write：Star
 * Date： 2014-08-03
 * Mail： stargao@superjia.com
 * Note： 表单校验
 ************************************************/

//设置error内容
var setRr = function(error, html) {
    error.html(html);
    error.parent().find('input[type="text"], select, .select-panel .filter-dl, textarea, .unitbox').addClass('err-inp');
}
var notSetRr = function(error, html) {
        error.html(html);
        error.parent().find('input[type="text"], select, .select-panel .filter-dl, textarea, .unitbox').removeClass('err-inp');
    }
    /**
     * 校验表单元素
     * @param d 校验元素，如果不传，则为所有$('.ver')
     * @param t 是否不显示提示信息：true：隐藏
     */

$.Verify = function(d, t) {
    var dl = d || $('.ver');
    var focus;
    dl.each(function(_, d) {
        var d = $(d),
            fs = d.find('input,select,textarea'),
            ib = d.find('.i-b'),
            rr = d.find('.error');
        fs.each(function(_, s) {
            if (($(this).is(":hidden") && !$(this).hasClass('ver')) || $(this).hasClass('not-ver')) return; //隐藏的，返回
            var tag = s.tagName,
                name = s.name
                //,frm=s.form()
                ,
                s = $(s),
                rule = s.attr('rule') || s.data('rule'),
                type = s.attr('type'),
                msg = s.attr('msg') || s.data('msg'),
                html = ib.html(),
                val = '';
            if (html == undefined) return;
            //log(tag + ' ' + name + ' ' + html)
            html = html.replace(new RegExp(/(　)/g), '').replace(new RegExp(/(&nbsp;)/g), '').replace(new RegExp(/(：)/g), '');
            if (type == 'radio' || type == 'checkbox') {
                var chk = d.find(tag + '[name=' + name + ']:checked');
                chk.each(function(_, i) {
                    if (val != '') val += ',';
                    val += i.value;
                });
            } else {
                if ($.trim(s.attr('key')) != '') {
                    val = $.trim(s.attr('key'));
                } else {
                    val = $.trim(s.val());
                }
            };
            notSetRr(rr, '');
            //log(tag + ' ' + html + ' ' + val)
            if (val == '') {
                if (!focus) focus = s;
                if (tag == 'INPUT' && (type == 'text' || type == 'tel' || type == 'email' || type == 'hidden' || type == '') && !s.hasClass('datetime')) {
                    html = '请输入' + html;
                } else {
                    html = '请选择' + html;
                };
                html = '<em class="dot iconfont">&#xd61d;</em>' + html;
                if (!t) setRr(rr, html);
                return false;
            } else {
                if (!rule) return true;
                rule = rule.split(',');
                if (msg != null) { //自定义提示信息
                    html = '<em class="dot iconfont">&#xd61d;</em>' + msg;
                } else {
                    html = '<em class="dot iconfont">&#xd61d;</em>' + html;
                }
                for (var i = 0; i < rule.length; i++) {
                    if (rule[i] == 'minlength') {
                        if (val.length < s.attr('minlength')) {
                            if (!focus) focus = s;
                            html = msg == null ? (html + '字符数过短') : html;
                            if (!t) setRr(rr, html);
                            break;
                            return false;
                        };
                    } else if (rule[i] == 'maxlength') {
                        if (val.length > s.attr('maxlength')) {
                            if (!focus) focus = s;
                            html = msg == null ? (html + '字符数过长') : html;
                            if (!t) setRr(rr, html);
                            break;
                            return false;
                        };
                    } else if (rule[i] == 'reg') {
                        if (!new RegExp(s.attr('reg') || s.data('reg')).test(val)) {
                            if (!focus) focus = s;
                            html = msg == null ? (html + '不正确') : html;
                            if (!t) setRr(rr, html);
                            break;
                            return false;
                        };
                    } else if (rule[i] == 'minvalue') {
                        var hasErr = false;
                        if (isNaN(val)) {
                            html = msg == null ? html + '请输入数字' : html;
                            hasErr = true;
                        } else if (Number(val) < Number(s.attr('minvalue'))) {
                            html = msg == null ? (html + '不能小于' + s.attr('minvalue')) : html;
                            hasErr = true;
                        }
                        if (hasErr) {
                            if (!focus) focus = s;
                            if (!t) setRr(rr, html);
                            return false;
                        }
                    } else if (rule[i] == 'maxvalue') {
                        var hasErr = false;
                        if (isNaN(val)) {
                            html = msg == null ? html + '请输入数字' : html;
                            hasErr = true;
                        } else if (Number(val) > Number(s.attr('maxvalue'))) {
                            html = msg == null ? (html + '不能大于' + s.attr('maxvalue')) : html;
                            hasErr = true;
                        }
                        if (hasErr) {
                            if (!focus) focus = s;
                            if (!t) setRr(rr, html);
                            return false;
                        }
                    };
                };
            };
        });
    });
    if (focus) {
        if (!t) focus.focus();
        return false;
    } else {
        return true;
    };
};
