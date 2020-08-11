// 使用express构建web服务器
const express = require('express');
const path = require('path');
let app = express();

// 默认是vue页面
app.use('/', express.static(path.join(__dirname, 'public/dist/vue')));
// react页面
app.use('/react', express.static(path.join(__dirname, 'public/dist/vue')));

app.listen(9000, () =>{
	console.log('服务器创建成功9000！！！');
});