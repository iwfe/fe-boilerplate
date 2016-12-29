var chalk = require('chalk');
var request =require('request');
var argv = require('yargs').argv;
var url = (function(env) {
    switch(env){
        case 'test':
            return '192.168.1.75';
        case "beta":
            return '121.41.34.206:8150'
        default:
            console.log(chalk.red('请指定版本环境'));
            process.exit(1);
    }
}(argv.env))

console.log(chalk.red(`正向${argv.env}服务器${url}发送请求中...\n`))
request.post({
        url:`http://${url}/resource/getResourceVersion.do`,
        formData:{folderName:'iwjw-pc'}
    },function(err,httpResponse,body){
        if (err || !body) {
                    console.log(chalk.red('\n接口出错或网络异常-------'));
                    process.exit(1);
        } else{ 
                    _body = JSON.parse(body)['data'];
                    var $name = _body.name;
                    var $version= _body.version;
                    var $property = _body.propertiesPath;
                    var $updateTime = _body.updateTime;
                    console.log(chalk.cyan(`--- ${$name}版本获取成功\n`));
                    console.log(chalk.blue(`---------- 数据信息展示区域 -------`));
                    console.log(chalk.cyan(`- 数据环境为${argv.env}`));
                    console.log(chalk.cyan(`- 版本号为: ${$version}`));
                    console.log(chalk.cyan(`- 上次更新时间为:${new Date($updateTime)}`));
                    console.log(chalk.cyan(`- java后端拉取的property地址为\n${$property}`));
                    process.exit();
        }
});