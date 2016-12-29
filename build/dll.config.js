var webpack = require('webpack');
var utils = require('./util');
var extend = require('extend'),
    path= require('path');
//组件打包入口,以require的形式引入组件,放入alias目录,添加components目录名称
var components_files = utils.add_prefix(require('./config_folder/component_files'),'./components/');
//业务打包入口
var main_files = require('./config_folder/main_files');
//设定别名
var moduleAlias=require('./config_folder/alias');

var vendors = [
    'jquery',
    'underscore',
    'react',
    'react-dom',
    'ES6shim',
    // path.resolve(process.cwd(), 'webim/lib/easemob.im-1.1.1.js'),
    // path.resolve(process.cwd(), 'webim/lib/strophe.js')
    // 'set.js'
    // ...其它库
];

module.exports = {
    output: {
        path: path.resolve(process.cwd(),'build/lib/'),
        filename: '[name].js',
        library: '[name]',
    },
    entry: {
        "lib": vendors,
    },
    resolve: {
        alias: utils.addResolve(extend(moduleAlias,components_files))
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.resolve(process.cwd(),'build/lib/manifest.json'),
            name: '[name]',
            context: __dirname,
        }),
    ],
};