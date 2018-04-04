/*
 * @Author: X_Heart
 * @Date: 2017-06-07 09:08:00
 * @Last Modified by: wangxiaoxin
 * @Last Modified time: 2018-04-03 17:57:19
 * @description: 班级说说
 */

const express = require('express')
const ejs = require('ejs')
const app = express()
const session = require('express-session')
const sd = require('silly-datetime')
// 路由
const router = require('./router/router')
// 设置模板引擎
app.engine('html', ejs.__express)
app.set('view engine', 'html')
app.set('port', (process.env.PORT || 5000));
// 静态文件中间件
app.use(express.static('./public'))
app.use('/avatar', express.static('./avatar'))
// session配置
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))
// 解决favicon.ico请求问题
app.use((req, res, next) => {
  if(req.url == "/favicon.ico") {
    res.end()
  } else {
    next()
  }
})
app.locals.dateFormat = function(date){
    return sd.format(date, 'YYYY-MM-DD HH:mm')
}
// 主页
app.get('/', router.showIndex)
// 注册页
app.get('/regist', router.showRegist)
// 注册业务
app.post('/duregist', router.doRegist)
// 退出
app.get('/dropout', router.dropOut)
// 登录
app.get('/login', router.showLogin)
// 登录业务
app.post('/dulogin', router.doLogin)
// 设置头像
app.get('/setavatar', router.showSetavatar)
// 设置头像业务
app.post('/setavatar', router.doSetavatar)
// 执行切图
app.post('/docut', router.doCut)
// 发表说说
app.post('/dopost', router.doPost)
// 获取所有说说
app.get('/getallpost', router.getAllpost)
// 获取所有说说总数
app.get('/getallamount', router.getAllAmount)
// 获取用户信息
app.get('/userinfo', router.userInfo)
// 获取用户所有说说
app.get('/user/:user', router.showUser)
// 获取所有用户
app.get('/userlist', router.showUserlist)
// 404
app.use((req, res) => {
  res.render('err')
})
// 监听端口
app.listen(app.get('port'), function() {
  console.log('ShuoShuo is running on port', app.get('port'));
});