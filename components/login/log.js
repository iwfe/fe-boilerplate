/*登录埋点，built by slashhuang 11.18*/

const provinceId=window.pageConfig.provinceId;
const LoginLogger = {
    /* 登录框展示次数*/
    login_show:{
        type: 'clickEvent',
        act_k:200,
        act_v:'login_show',
        ct:provinceId
    },
    /*发送验证码按钮,点击上报*/
    'send_verification':{
        type: 'clickEvent',
        ct:provinceId,
        act_k:200,
        act_v:'login_send_verification'
    },
    /*没收到按钮点击次数*/
    noReceive:{
         type: 'clickEvent',
         ct:provinceId,
         act_k:622,
         act_v:'noReceive'
    },
    /*填写上报（只要填写，不论几位）*/
    'set_verification':{
         type: 'clickEvent',
         ct:provinceId,
         act_k:200,
         act_v:'login_set_verification'
    },
    /*登录按钮点击次数,二涛说已有埋点，麻烦check下*/
     'login_count':{
         type: 'clickEvent',
         ct:provinceId,
         act_k:200,
         act_v:2
    },
    /*验证码错误展示次数*/
     'error_verification':{
         type: 'clickEvent',
         ct:provinceId,
         act_k:200,
         act_v:'login_error_verification'
    },
    /* 登录弹窗用户在拖动验证滑块（无论是否成功）*/
    'login_slide': {
        type: 'clickEvent',
        ct:provinceId,
        act_k:200,
        act_v:'login_slide'
    }
}
export default (loginContainer)=>{
    let {
        login_show,
        send_verification,
        noReceive,
        set_verification,
        login_count,
        error_verification,
        login_slide
    } = LoginLogger;
    /*打开填写登录信息的panel*/
    $.jps.trigger('log',login_show);
    /*发送验证码按钮,点击上报*/
    loginContainer.on('click','.send-btn',()=>{
        $.jps.trigger('log',send_verification);
    });
    /*没收到按钮点击次数*/
    loginContainer.on('click','.send-voice-btn',()=>{
        $.jps.trigger('log',noReceive);
    });
    /*填写上报（只要填写，不论几位）*/
    loginContainer.on('input','.code-panel .login-input',function(){
        if($(this).val().length>3){
            $.jps.trigger('log',set_verification);
        }
    });
    /*登录按钮点击次数,二涛说已有埋点，麻烦check下*/
    loginContainer.on('click','.dialog-login-btn',()=>{
        $.jps.trigger('log',login_count);
    });

    return (topic)=>{
        /*error_verification goes here*/
        
         $.jps.trigger('log',LoginLogger[topic]);
    }
}






