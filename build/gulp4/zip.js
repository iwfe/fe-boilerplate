/**
 * Created by huangxiaogang on 16/8/4.
 * 打包代码成zip包
 */

//线上服务器配置
var config = require('../config.json'),
    gulp=require('gulp'),
    fse = require('fs-extra'),
    zip = require('gulp-zip'),
    path=require('path'),
    chalk =require('chalk');
var server = config.server,
    project= config.project,
    version = config.version,
    uploadDir = config.uploadDir,
    distFolder= path.resolve(process.cwd(),'./dist'),
    tmpDistFolder =  path.resolve(process.cwd(),uploadDir);

gulp.task('zip', function() {
    console.log(chalk.magenta('\n-------- 开始打包 -------'));
    fse.removeSync(distFolder+ path.sep + project + '.zip');
    fse.emptydirSync(tmpDistFolder);
    return gulp.src(distFolder+'/**')
        .pipe(zip(project + '.zip'))
        .pipe(gulp.dest(tmpDistFolder));
});

gulp.task('zip-clean',function(done) {
    console.log(chalk.cyan(`\n-------- 打包完成，迁移zip包至${tmpDistFolder}目录 -------`));
    // fse.emptydirSync(distFolder);
    // fse.copySync(tmpDistFolder+path.sep + project + '.zip', distFolder+path.sep+ project + '.zip');
    // fse.removeSync(tmpDistFolder);
    console.log(chalk.cyan('\n---------- 迁移完成 --------'));
    done();
});
exports.zipTask = gulp.series('zip','zip-clean');