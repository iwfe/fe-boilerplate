/*视频组件基础配置*/

let cacheDom=()=>{
    let node = $('#IWJWplayer');
    let doorNode = $('#J_door_model_container');
    let cachedParent = node.parent();

    return {
        getNode:()=>{
            return node
        },
        getParent:()=>{
             return cachedParent;
        },
        getDoorNode:()=>{
            return doorNode
        }
    }
};
module.exports = cacheDom;