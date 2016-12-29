var gulp = require('gulp');
var exec = require('child_process').exec;
var argv = require('yargs').argv;


// 读取参数
var p = '';
if(process.env.npm_config_myProject){
    p = 'img_sprites/sass/' + process.env.npm_config_myProject + '.scss';
}
console.log(process.env);

// 对应 config.rb 中的配置
var css_dir = 'img_sprites/css';
var sass_dir = 'img_sprites/sass/';
var images_dir = 'img_sprites/';

var cmd = 'compass compile '+p+' --relative-assets --no-line-comments --sass-dir=' + sass_dir + ' --css-dir=' + css_dir + ' --images-dir=' + images_dir;// + ;
console.log(p);
console.log(cmd);
gulp.task('compass', function(cb) {
    exec('compass clean', {}, function(){
        exec(cmd, {}, cb);
    });
});


// npm --myProject=webim run compass //单个文件
// npm run compass //所有文件