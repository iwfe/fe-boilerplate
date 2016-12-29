/**
 * Created by huangxiaogang on 16/8/3.
 * webpack打包相关
 */
var webpack = require("webpack"),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    WebpackNotifierPlugin = require('webpack-notifier'),
    utils = require('./util'),
    extend = require('extend'),
    path= require('path'),
    configJSON = require('./config.json');
var versionType = configJSON['versionType'];


var HappyPack = require('happypack');
var happyThreadPool = HappyPack.ThreadPool({ size: 2 });
//切换打包方式为manifest，给后端读取json文件
var ManifestPlugin = require('./plugins/manifest.js');

//静态页面打包入口, 自动加上static_pages目录
var static_files= utils.add_prefix(require('./config_folder/static_files'),'./static_pages/');
//组件打包入口,以require的形式引入组件,放入alias目录,添加components目录名称
var components_files = utils.add_prefix(require('./config_folder/component_files'),'./components/');
//业务打包入口
var main_files = require('./config_folder/main_files');
//设定别名
var moduleAlias=require('./config_folder/alias');
var common={
    common: [
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
    ]
};
var entry_file = extend(
    main_files,
    static_files,
    common
);
var webpackPluginList =[
            new CopyWebpackPlugin([
                    {
                        from :'html',
                        to:'html'
                    },
                    {
                        context: 'global/img',
                        from: '**/*',
                        to:'img/common'
                    },
                    {
                        from: 'img',
                        to:'img'
                    },
                    {
                        from :'global/lib/es5-shim-sham.js'
                    },
                    {
                        context :'global/lib/swfupload',
                        from: '**/*',
                        to:'swfupload'
                    }
            ]),
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
            new webpack.optimize.DedupePlugin(),
            new WebpackNotifierPlugin({
                title: 'Webpack 编译成功',
                contentImage: path.resolve(process.cwd(), './global/img/logo.png'),
                alwaysNotify: true
            }),
            new ExtractTextPlugin("[name].css"),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'common',
                minChunks: Infinity
            }),
            new HappyPack({
                id: 'js',
                threadPool: happyThreadPool
            }),
            new HappyPack({
              id: 'css',
              threadPool: happyThreadPool,
              loaders: [ 'css-loader?sourceMap&-convertValues' ]
            }),
            // new webpack.DllReferencePlugin({
            //     context: __dirname,
            //     manifest: require('./lib/manifest.json')
            // })
        ];
if(versionType==2){
    webpackPluginList.unshift(
         new ManifestPlugin({
                hashNum:7,
                extractJsCss:true,
                versionDir:['html'] //递归抽取html下面的，也要加版本号
    }));
}
//webpack配置文件
module.exports =  {
        watch: true,
        entry: entry_file,
        debug: true,
        devtool: 'source-map',
        output: {
            path: path.resolve(process.cwd(),'dist/'),
            filename: '[name].js',
            chunkFilename: '[name].min.js',
            publicPath: ''
        },
        resolve: {
            alias: utils.addResolve(extend(moduleAlias,components_files))
        },
        plugins: webpackPluginList,
        module: {
            loaders: [{
                test: /\.js[x]?$/,
                exclude: /(node_modules)|(global\/lib\/)/,
                loader: 'babel-loader',
                happy: { id: 'js' }
            }, {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'happypack/loader?id=css')
            },{
                test: /\.rcss$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&sourceMap&-convertValues!sass-loader?sourceMap')
            }, {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?-convertValues!less-loader')
            }, {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap&-convertValues!sass-loader?sourceMap')
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
        }
    };
