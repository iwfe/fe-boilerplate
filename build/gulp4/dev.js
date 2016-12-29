/**
 * Created by huangxiaogang on 16/8/4.
 * 开发环境配置
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
    distFolder= path.resolve(process.cwd(),'./dist');

var WebpackTask = gulp.task('webpack',function() {
    var isFirst = true; // 第一次编译的时候还是打印出来信息比较好
    console.log(chalk.blue('\n开始执行webpack任务 ', new Date().toLocaleString()));
    var __stime = new Date().getTime();
    var initEntry = webpackConfig.entry;
    var  finalEntry = {};
    if(argv.entry){
        console.log(chalk.cyan('\n-------------开始编译' + argv.entry + '-------------'));
        argv.entry.split(',').forEach(function(val){
            finalEntry[val]= initEntry[val];
        });
        finalEntry['common']=initEntry['common'];
        webpackConfig.entry = finalEntry
    }
    return gulp.src(__dirname)
        .pipe(gulpWebpack(webpackConfig,null, function(err, stats) {
            gutil.log('[webpack]',stats.toString({
                chunks: false,//isFirst,
                assets: false,//isFirst,
                children: false,//isFirst,
                colors:true
            }));
            if (!(stats.hasErrors() || stats.hasWarnings())) {
                var __etime = new Date().getTime();
                var sec = parseInt((__etime - __stime)/1000);
                if(isFirst){
                    console.log(chalk.cyan('\n-------------^__^-----编译成功,共使用'+sec+'秒---------'));
                }else{
                    console.log(chalk.cyan('\n-------------^__^-----编译成功---------'));
                }
                console.log(chalk.cyan('\nwebpack success at ', new Date(stats.endTime).toLocaleString()));
            }
            isFirst=false;
        }))
        .pipe(gulp.dest(distFolder));
});

console.log(chalk.cyan('正在处理 ==== 本地环境'));
fse.emptydirSync(distFolder);
gulp.task('default', gulp.series('webpack'));


// npm run dev -- --entry index 单个模块
