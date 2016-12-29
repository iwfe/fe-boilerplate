 let subscribe =(player)=>{
            /*注册UI同步*/
            if(player && typeof player.subscribe=='function'){
                 player.subscribe({
                        uiCallback:function(action){
                            let titleDom= $('#slider-plugin-container').find('.s-t-container');
                            if(titleDom.attr('timer')){
                                clearTimeout(titleDom.attr('timer'));
                                titleDom.attr('timer',0)
                            }
                            switch(action){
                                case 'removeClass':
                                    titleDom.hide();
                                    break;
                                case 'addClass':
                                    titleDom.show();
                                    break;
                                default:
                                    break;
                            }
                        }
                    });
            }
        };
let unSubscribe =(player)=>{
             /*取消注册*/
             if(player && typeof player.unSubscribe=='function'){
                    player&& player.unSubscribe();
             }
};
export default
{
    subscribe,
    unSubscribe
}