const api = '/getAuthKey.action';

export default (callback) => {
    $.ajax({
        url: api,
        data: {
            callback: 'authkeycallback',
            method: 'houseInfos'
        },
        success: (json) => {

            let authkeycallback = (f) => {
                callback(f)
            }

            if (json.data && eval) {
                // console.log(json.data);
                // json.data = 'eval(' + json.data + ')';
                eval(json.data)
            }
        }
    })
}
