// webpack 插件配置


var path = require('path'),
    webpack = require("webpack"),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    WebpackNotifierPlugin = require('webpack-notifier'),
    HappyPack = require('happypack');

var happyThreadPool = HappyPack.ThreadPool({ size: 2 });
//切换打包方式为manifest，给后端读取json文件
var ManifestPlugin = require('../plugins/manifest.js');

var webpackPluginList =[
            new CopyWebpackPlugin([
                    {
                        context: 'global/img',
                        from: '**/*',
                        to:'img/common'
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
                _: 'underscore',
                global: 'global',
                iwjw: 'iwjw',
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
            // // manifest上传方式配置，这边先不用 versionType==2
            // process.env['NODE_ENV']=='manifest'? new ManifestPlugin({
            //     hashNum:7,
            //     extractJsCss:true,
            //     versionDir:['html'] //递归抽取html下面的，也要加版本号
            // }):undefined
];

var webpackLoaders = [
            {
                test: /\.js[x]?$/,
                exclude: /(node_modules)|(global\/lib\/)/,
                loader: 'babel-loader',
                happy: { id: 'js' }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'happypack/loader?id=css')
            },
            {
                test: /\.rcss$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&sourceMap&-convertValues!sass-loader?sourceMap')
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?-convertValues!less-loader')
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap&-convertValues!sass-loader?sourceMap')
            },
            {
                test: /\.(png|jpg|gif|woff|woff2|ttf|eot|svg|swf)$/,
                loader: "file-loader?name=[name]_[sha512:hash:base64:7].[ext]"
            },
            {
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
];
module.exports = {
    plugins:webpackPluginList,
    loaders:webpackLoaders
}





