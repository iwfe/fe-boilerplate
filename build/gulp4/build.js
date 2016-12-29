/**
 * Created by huangxiaogang on 16/8/4.
 * 生产环境编译任务
 */


var path = require('path'),
    gulp = require('gulp'),
    argv = require('yargs').argv,
    fse = require('fs-extra'),
    gutil = require('gutil'),
    zip = require('gulp-zip'),
    chalk =require('chalk');

var gulpWebpack = require("gulp-webpack"),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    WebpackNotifierPlugin = require('webpack-notifier'),
    webpackConfig = require('../webpack.conf'),
    webpack = require('webpack'),
    config = require('../config.json'),
    uploadDistFolder= path.resolve(process.cwd(),config.uploadDir),
    distFolder= path.resolve(process.cwd(),'./dist');


/**
 * 任务名称
 * 1. 打包
 * 2. 上传
 */
var zipTask = require('./zip').zipTask;
var uploadTask =require('./upload').uploadTask;

var WebpackTask = gulp.task('webpack', function() {
    fse.removeSync(uploadDistFolder);
    console.log(chalk.blue('\n------ 已删除原先的zip包 '));
    console.log(chalk.blue('\n以上任务打包完毕 ', new Date().toLocaleString()));
    console.log(chalk.blue('\n---- 开始执行webpack打包任务 '));
    var __stime = new Date().getTime();
    var minify = [
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            screw_ie8 : false
        },
        // mangle: false,
        // // mangle: {
        // //     except: ['$', 'm', 'webpackJsonpCallback','_m'],
        // //     screw_ie8 : false
        // //  },
        output: {
                // for IE8, keep keyword default -> "default"
                keep_quoted_props: true,
                quote_style: 3
            },
        mangle: {
            except: ['$', 'm', 'webpackJsonpCallback','_m'],
            screw_ie8 : false
         }
    }),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
        }),
    ];
    //如果用watch模式
    if(!argv.watch){
         webpackConfig.watch = false;
     }
    webpackConfig.devtool = false ;
    webpackConfig.plugins = webpackConfig.plugins.concat(minify);
    var isFirst = false; // 第一次编译的时候还是打印出来信息比较好,算了老大说不要打出来+—+
    return gulp.src(__dirname)
        .pipe(gulpWebpack(webpackConfig,null, function(err, stats) {
            gutil.log('[webpack]',stats.toString({
                chunks:isFirst,
                assets:isFirst,
                children:isFirst,
                colors:true
            }));
            isFirst=false;
            if (!(stats.hasErrors() || stats.hasWarnings())) {
                var __etime = new Date().getTime();
                var sec = parseInt((__etime - __stime)/1000);
                console.log(chalk.cyan('\n-------------^__^-----编译成功,共使用'+sec+'秒---------'));
                console.log(chalk.cyan('\nwebpack success at %s', new Date(stats.endTime).toLocaleString()));
            }
        }))
        .pipe(gulp.dest(distFolder));
});

console.log(chalk.cyan('正在处理 ====  打包文件'));
if(!argv.upload){
    fse.emptydirSync(distFolder);
    console.log(chalk.cyan('--- 已清空dist目录'));
}
gulp.task('zip',gulp.series('webpack',zipTask));
gulp.task('default', gulp.series('webpack',zipTask,uploadTask));
gulp.task('zipUpload', gulp.series(zipTask,uploadTask));
gulp.task('upload', gulp.series(uploadTask));
gulp.task('uglify',gulp.series('webpack'));


