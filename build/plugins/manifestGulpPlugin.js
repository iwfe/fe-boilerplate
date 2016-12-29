
/*
 * built by slashhuang 16.11.30
 * 添加manifest管理相关的gulp插件
 * 参考文档
 * https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md
 * 暂时在项目中没有用到
 */
'use strict'
var exec = require('child_process').exec;
var chalk =require('chalk');
var confirm =require('gulp-confirm');
var lodashKeys = require('lodash.keys')
var fs=require('fs');
var config = require('../config.json');
var path=require('path')

/*gulp数据流*/
var through = require('through2');
/*gitCbk为提供外部的gulp回调*/
var gulpManifest= function() {
  return through.obj(function(file, encoding, resolver) {
    var manifestFile = fs.readFileSync(path.resolve(process.cwd(),'./dist','./manifest.json'),{encoding:'utf-8'})
    manifestFile=JSON.parse(manifestFile);
    /*获取分支信息并执行回调*/
    var versionFiles = manifestFile['versionFiles'];
    var assets=manifestFile['assets'];
    console.log(chalk.yellow(`you are using ** manifest ** to compile vesion num\n`));
    console.log(chalk.yellow(`you have ---- ${versionFiles.length} css + js files\n`))
    console.log(chalk.yellow(`you have ---- ${lodashKeys(assets).length} img and font files\n`))
    resolver(null,file)
  });

};
module.exports = gulpManifest;

/*单元测试demo*/

// var gulp =require('gulp')
// gulp.task('version', function(){
//     console.log(chalk.cyan('\n----------  准备上线  -----------'));
//        return gulp.src(__dirname)
//           .pipe(gitGulp())
//           .pipe(confirm({
//                 question: '是否立即发布? y/n',
//                 proceed: function (answer) {
//        return true
//                 }
//             }))
//       .pipe(gulp.dest('./test'));
// })

// gulp.task('default',gulp.series('version'))
