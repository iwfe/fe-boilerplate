
'use strict'
const fs = require('fs');
const exec =require('child_process').exec;
let ip = '121.40.69.179',
    user = 'staticuser',
    pwd = 'KS94X7EoS4Ik82dH';

const argv = require('yargs').argv;

let { version,fileName} = argv;
if(!version || !fileName){
    process.exit('1')
}

console.log('上传版本号---'+version+'\n文件名-------'+fileName)
let textStr = `
    open ${ip} \n
    user  ${user}   ${pwd} \n
    cd /iwjw-pc/ \n
    mkdir ${version}\n
    put ./test.js /iwjw-pc/${version}/${fileName}
`;

fs.createWriteStream('ftp.txt').write(textStr,function(){
    console.log('writing end')
});

console.log('writing');

exec(`ftp -n < ./ftp.txt`,function(err,stdout,stderr){
    if(err){
        console.log('error');
        process.exit(1);
    };
    fs.unlink('ftp.txt',function(err){
        if(err){
            console.log('remove ftp.txt failed')
        }else{
            console.log('ftp.txt removed')
        }
    });
    console.log('上传成功')
})
// node test 5.6.9 iwjw-pc.zip