// 这里是 getAuthKey.action?callback= 对应的一些加密算法


// 后端随机一个 authkey 10秒过期 使用一次也过期
// 从策略池 取两个策略

// authkey = encode_f1(authkey)
// authkey = encode_f2(authkey)
// result = to_unnicode_array(authkey)
// fun_arr = [decode_f2,decode_f1]

// 前端decode代码
;
! function() {
    var map = function(arr, f) {
        if (Array.prototype.map) {
            return Array.prototype.map.call(arr, f);
        }
        var result = [];
        for (var i = 0; i < arr.length; i++) { result.push(f(arr[i])); }
        return result;
    };
    // 删除 process 对node设障碍 不影响浏览器
    delete process;
    
    //下发的加密后的authkey
    var result = [32, 50, 103, ..., 312, 632];
    var fun_arr = [f1, f2];

    result = map(result, function(item){
        return String.fromCharCode(item);
    }).join('')

    result = fun_arr[0](result);
    result = fun_arr[1](result);

    callback(new Function('return "' + result + '";'));
}();
//

// 对上面所有代码进行unicode后返回
eval(
    function(arr, f) {
        if (typeof Array.prototype.map === "function") {
            return arr.map(f)
        }
        var res = [],
            j = 0;
        for (var i = 0, l = arr.length; i < l; i++) { res[j++] = f(arr[i], i, arr) }
        return res
    }(
        [38684, 38658, 38727, 38742, .........., 38735, 38724, 38741],
        function(item) {
            return String.fromCharCode(item - 38625)
        }).join('')
)

// ************* 算法池
// 算法一
function(list) {
    for (var i = 0, length = list.length; i < length; i++) {
        list[i] = list[i] + (true ? (-eval('19')) : (-eval('20')));
    }
    return list;
}
