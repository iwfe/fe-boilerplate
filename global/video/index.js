let iwFDVideo = require('./fullVideo/index.js');
let iwCMVideo = require('./video/iwvideo.js');
/*通用户型图*/
import DoorModelApi from './doormodel/index.js';
export default function(container, options){
    /*通配户型*/
    $('.player-wrap').append("<div id='J_door_model_container' class='small'></div>");
    if(options.doorModel){
        /*获取基础数据*/
        DoorModelApi.init($('#J_door_model_container')[0]);
    };
    if(options.type === 1){
        return new iwFDVideo($('#IWJWplayer-FD'), options);
    }else{
        if(pageConfig.staticTag === 'caichan'){
            return new iwCMVideo(container, options);
        }
        return new iwCMVideo($('#IWJWplayer'), options);
    };
}
