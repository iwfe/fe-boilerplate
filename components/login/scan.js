var pageConfig = window.pageConfig;

//check status：-1，失效；1可用；3绑定并授权登录；2已被浏览，但未被授权
const CHECKTIME = 3000;

var loginScan = {

    uuid: '',
    imgUrl: '',
    container: '',

    init: function(opt) {
        this.successCallback = opt.successCallback;
    },

    api: function(key) {
        var rootPath = '';

        return rootPath + {
            getCode: '/produceQRCode.action',
            check: '/checkQRCode.action'
        }[key];
    },

    initQRcode: function(container, callback) {
        var self = this,
            $login = container.find('.mod-login');

        self.container = container;
        self.__initQRcode(callback);

        container.find('.container-prelogin .link').click(function(){
            self.__initQRcode(callback);
            $login.removeClass('prelogin').addClass('scan');
        });
    },

    __initQRcode: function(callback) {
        var self = this,
            container = self.container;

        var ajaxGet = $.ajax({
            url: self.api('getCode')
        });

        ajaxGet.done(function(data){
            self.uuid = data['uuid'];

            if( data.status == 1 ) {
                self.imgUrl = pageConfig.siteUrl + '/getImage.action' + '?w=200&h=200&value=' + encodeURIComponent('http://' + document.domain + '/login/' + self.uuid);
                var img = new Image();
                img.onload = function() {
                    container.find('[data-role="QRCode"]').attr('src', self.imgUrl);
                    container.find('.overtime').hide();
                    self.checkQRCode();
                    callback && callback();
                }
                img.src = self.imgUrl;

            }else{
                smallnote('系统错误');
            }
        });
    },

    checkQRCode: function() {
        var self = this,
            container = self.container,
            $login = container.find('.mod-login');

        if(self.twork) self.clearCheck();

        self.twork = setInterval(function(){
            $.ajax({
                url: self.api('check'),
                data: {
                    code: self.uuid
                }
            })
            .done(function(d){
                // 这时login可能关闭了
                if(d.status == -1){  // 失效
                    if(!container) return;
                    self.clearCheck();
                    container.find('.overtime').show();
                    if($login.hasClass('prelogin')){
                        $login.removeClass('prelogin').addClass('scan');
                    }
                }else if(d.status == 2){ // 已扫码
                    if(!container) return;
                    if($login.hasClass('scan')){
                        $login.removeClass('scan').addClass('prelogin');
                    }
                }else if(d.status == 3){ // 登录
                    self.clearCheck();
                    self.successCallback(d);
                }
            });
        }, CHECKTIME);
    },

    clearCheck: function(){
        clearTimeout(this.twork);
    }

}

module.exports = loginScan;