/**
 * 生成PC主站的common模块的动态链接库，供爱理财使用
 * @Author     SUNXG
 * @CreateTime 2016-11-07T18:35:56+0800
 */
var webpack = require("webpack"),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    WebpackNotifierPlugin = require('webpack-notifier'),
    utils = require('./util'),
    extend = require('extend'),
    fse = require('fs-extra'),
    path= require('path');

var HappyPack = require('happypack');
var happyThreadPool = HappyPack.ThreadPool({ size: 2 });

fse.emptydirSync(path.resolve(process.cwd(),'build/comlib'));

//静态页面打包入口, 自动加上static_pages目录
var static_files= utils.add_prefix(require('./config_folder/static_files'),'./static_pages/');
//组件打包入口,以require的形式引入组件,放入alias目录,添加components目录名称
var components_files = utils.add_prefix(require('./config_folder/component_files'),'./components/');
//业务打包入口
var main_files = require('./config_folder/main_files');
//设定别名
var moduleAlias=require('./config_folder/alias');

var comlib = [
    'jquery',
    'underscore',
    'template',
    'store',
    'ES6shim',
    'global',
    'jps',
    'router',
    'iwjwLog',
    './global/module/reset.css',
    './sass/base/index.scss',
    'dialog',
    'smallnote',
    'placeholder',
    './global/iconfont/iconfont.css',
    './global/footer/footer.css',
    './global/iwjw/iwjw.scss',
    'changecity',
    'iwim',
    'iwjw',
    'header',
    'rightnav'
];

//webpack配置文件
module.exports =  {
    watch: false,
    entry: {
        comlib: comlib
    },
    debug: true,
    // devtool: 'source-map',
    devtool: false,
    output: {
        path: path.resolve(process.cwd(),'build/comlib/'),
        filename: '[name].js',
        library: '[name]',
        publicPath: ''
    },
    resolve: {
        alias: utils.addResolve(extend(moduleAlias,components_files))
    },
    module: {
        loaders: [{
            test: /\.js[x]?$/,
            exclude: /(node_modules)|(global\/lib\/)/,
            loader: 'babel-loader',
            happy: { id: 'js' }
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract('happypack/loader?id=css')
        },{
            test: /\.rcss$/,
            loader: ExtractTextPlugin.extract('css-loader?minimize&modules&-convertValues!sass-loader')
        }, {
            test: /\.less$/,
            loader: ExtractTextPlugin.extract('css-loader?minimize&-convertValues!less-loader')
        }, {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract('css-loader?minimize&-convertValues!sass-loader')
        }, {
            test: /\.(png|jpg|gif|woff|woff2|ttf|eot|svg|swf)$/,
            loader: "file-loader?name=[name]_[sha512:hash:base64:7].[ext]"
        }, {
            test: /\.html/,
            loader: "html-loader?" + JSON.stringify({
                minimize: false,
                attrs:false
            })
        },
            {
             test: /\.json$/,
             loader: "json"
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: 'html',
            to: 'html'
        }, {
            context: 'global/img',
            from: '**/*',
            to: 'img/common'
        }, {
            from: 'img',
            to: 'img'
        }, {
            from: 'global/lib/es5-shim-sham.js'
        }, {
            context: 'global/lib/swfupload',
            from: '**/*',
            to: 'swfupload'
        }]),

        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            template: 'template',
            store: 'store',
            _: 'underscore',
            global: 'global',
            smallnote: 'smallnote',
            iwjw: 'iwjw',
            iwim: 'iwim',
            iwjwLog: 'iwjwLog',
            router: 'router',
            dialog: 'dialog',
            header: 'header',
            React: 'react',
            ReactDOM: 'react-dom'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                screw_ie8: false,
                drop_console: true,
                drop_debugger: true
            },
            sourceMap: false
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.DedupePlugin(),
        new WebpackNotifierPlugin({
            title: '公共DLL编译成功',
            contentImage: path.resolve(process.cwd(), './global/img/logo.png'),
            alwaysNotify: true
        }),
        new ExtractTextPlugin("[name].css"),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'comlib',
            minChunks: Infinity
        }),
        new HappyPack({
            id: 'js',
            threadPool: happyThreadPool
        }),
        new HappyPack({
          id: 'css',
          threadPool: happyThreadPool,
          loaders: [ 'css-loader?minimize&sourceMap&-convertValues' ]
        }),
        new webpack.DllPlugin({
            path: path.resolve(process.cwd(),'build/comlib/manifest.json'),
            name: '[name]',
            context: process.cwd(),
        })
    ]
};
