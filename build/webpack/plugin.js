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

module.exports = webpackPluginList;