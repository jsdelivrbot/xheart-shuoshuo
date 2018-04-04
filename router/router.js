/*
 * @Author: X_Heart
 * @Date: 2017-06-07 09:09:30
 * @Last Modified by: wangxiaoxin
 * @Last Modified time: 2018-04-04 09:15:19
 * @description: 路由
 */
'use strict'
const formidable = require('formidable')
const db = require('../models/db')
const md5 = require('../models/md5')
const fs = require('fs')
const path = require('path')
const gm = require('gm')

// 首页
exports.showIndex = function (req, res, next) {
    if (req.session.login == '1') {
        var username = req.session.username
        var login = true
    } else {
        var username = ''
        var login = false
    }
    db.find("users", {
        "username": username
    }, (err, result) => {
        if (err) {
            console.log(err)
        }
        let avatar = result.length == 0 ? 'default.jpg' : result[0].avatar
        res.render('index',{
            "login": login,
            "username": username,
            "avatar": avatar,
            "active": 'index'
        })
    })
}
// 注册页
exports.showRegist = function (req, res, next) {
    res.render('regist',{
        "login": req.session.login == '1' ? true : false,
        "username": req.session.login == '1' ? req.session.username : '',
        "active": 'regist'
    })
}
// 注册业务
exports.doRegist = function (req, res, next) {
    // 得到用户提交数据
    var form = new formidable.IncomingForm()
    form.parse(req, function(err, fields) {
        // 查询数据库
        let username = fields.username
        let password = fields.password
        db.find("users", {
            "username": username
        }, (err, result) => {
            if (err) {
                res.send({
                    "code": 500,
                    "info": "服务器错误"
                })
            }
            if (result.length != 0) {
                res.send({
                    "code": 500,
                    "info": "用户名已存在"
                })
            } else {
                password = md5(md5(password) + 'xheart')
                db.insertOne("users", {
                     "username": username,
                     "password": password,
                     "avatar": "default.jpg"
                }, (err, result) => {
                    if (err) {
                        res.send({
                            "code": 500,
                            "info": "服务器错误"
                        })
                    }
                    req.session.login = '1'
                    req.session.username = username
                    res.send({
                        "code": 200,
                        "info": "注册成功"
                    })
                })
            }
        })
    })
}
// 退出
exports.dropOut = function (req, res, next) {
    req.session.login = '0'
    req.session.username = ''
    res.redirect('/')
}
// 登录页面
exports.showLogin = function (req, res, next) {
    res.render('login', {
        "login": req.session.login == '1' ? true : false,
        "username": req.session.login == '1' ? req.session.username : '',
        "active": 'login'
    })
}
// 登录业务
exports.doLogin = function(req, res, next) {
     // 得到用户提交数据
    var form = new formidable.IncomingForm()
    form.parse(req, function(err, fields) {
        // 查询数据库
        let username = fields.username
        let password = fields.password
        let passwordM = md5(md5(password) + 'xheart')
        db.find("users", {
            "username": username
        }, (err, result) => {
            if (err) {
                res.send({
                    "code": 500,
                    "info": "服务器错误"
                })
            }
            if (result.length == 0) {
                res.send({
                    "code": 500,
                    "info": "用户不存在"
                })
                return
            }
            if (passwordM == result[0].password) {
                req.session.login = '1'
                req.session.username = username
                res.send({
                    "code": 200,
                    "info": "登陆成功"
                })
            } else {
                res.send({
                    "code": 500,
                    "info": "密码错误"
                })
            }
            
        })
    })
}
// 设置头像
exports.showSetavatar = function (req, res, next) {
    if (req.session.login != '1') {
        // res.send('请先登陆！')
        res.redirect('/login')
        return
    }
    res.render('setavatar', {
        "login": req.session.login == '1' ? true : false,
        "username": req.session.login == '1' ? req.session.username : '',
        "active": 'setavatar',
        "isfile": false
    })
}
// 设置头像业务
exports.doSetavatar = function (req, res, next) {
    var form = new formidable.IncomingForm()
    form.uploadDir = path.join(__dirname, '../avatar')
    form.parse(req, function(err, fields, files) {
        if (err) {
            res.send('上传错误')
        }
        let oldpath = files.avatar.path
        let newpath = path.join(__dirname, '../avatar/temp', `${req.session.username}.jpg`)
        fs.rename(oldpath, newpath, (err) => {
            if (err) {
                res.send('上传错误')
                return
            }
            res.render('setavatar', {
                "login": req.session.login == '1' ? true : false,
                "username": req.session.login == '1' ? req.session.username : '',
                "active": 'setavatar',
                "isfile": true,
                "avatar": `${req.session.username}.jpg`
            })
        })
    })
}
// 执行切图
exports.doCut = function (req, res, next) {
  var form = new formidable.IncomingForm()
  form.parse(req, function(err, fields) {
    let filename = req.session.username + '.jpg'
    let w = fields.w
    let h = fields.h
    let x = fields.x
    let y = fields.y
    //接收前台POST过来的base64
    var imgData = fields.data;
    //过滤data:URL
    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    fs.writeFile(path.join(__dirname, '../avatar', filename), dataBuffer, function(err) {
        if (err) {
            res.send({
            "code": 500,
            "info": "剪裁失败!"
            })
            return
        }
        db.updateMany('users', {
            "username": req.session.username
        }, {
            $set: { "avatar": filename }
        }, (err, result) => {
            if (err) {
                res.send({
                    "code": 500,
                    "info": "剪裁失败!"
                })
            }
            res.send({
                "code": 200,
                "info": "剪裁成功!"
            })
        })
    });
    // fs.rename(path.join(__dirname, '../avatar/temp', filename), path.join(__dirname, '../avatar', filename), (err) => {
    //     if (err) {
    //         res.send({
    //         "code": 500,
    //         "info": "剪裁失败!"
    //         })
    //         return
    //     }
    //     db.updateMany('users', {
    //         "username": req.session.username
    //     }, {
    //         $set: { "avatar": filename }
    //     }, (err, result) => {
    //         if (err) {
    //             res.send({
    //                 "code": 500,
    //                 "info": "剪裁失败!"
    //             })
    //         }
    //         res.send({
    //             "code": 200,
    //             "info": "剪裁成功!"
    //         })
    //     })
    // })
    // // 缩略图 
    // gm(path.join(__dirname, '../avatar/temp', filename))
    //   .resize(500, 500)
    //   .noProfile()
    //   .write(path.join(__dirname, '../avatar/temp', filename), function (err) {
    //     gm(path.join(__dirname, '../avatar/temp', filename))
    //       .crop(w, h, x, y)
    //       .resize(250, 250, '!')
    //       .write(path.join(__dirname, '../avatar', filename), function (err) {
    //         console.log(err)
    //         if (err) {
    //           res.send({
    //             "code": 500,
    //             "info": "剪裁失败!"
    //           })
    //           return
    //         }
    //         db.updateMany('users', {
    //             "username": req.session.username
    //         }, {
    //             $set: { "avatar": filename }
    //         }, (err, result) => {
    //             if (err) {
    //                 res.send({
    //                     "code": 500,
    //                     "info": "剪裁失败!"
    //                 })
    //             }
    //             res.send({
    //                 "code": 200,
    //                 "info": "剪裁成功!"
    //             })
    //         })
    //     });
    // });
  })
}
// 发表说说
exports.doPost = function (req, res, next) {
    if (req.session.login != '1') {
        // res.send('请先登陆！')
        res.send({
            "code": 500,
            "info": "请先登陆！"
        })
        return
    }
    var form = new formidable.IncomingForm()
    form.parse(req, function(err, fields) {
        // 查询数据库
        let content = fields.content
        let avatar = fields.avatar || 'default.jpg'
        let username =  req.session.username
        db.insertOne("posts", {
            "username": username,
            "content": content,
            "avatar": avatar,
            "creatTime": new Date().getTime()
        }, (err, result) => {
            if (err) {
                res.send({
                    "code": 500,
                    "info": "服务器错误"
                })
            }
            res.send({
                "code": 200,
                "info": "发表成功"
            })
        })
    })
}
// 获取所有说说
exports.getAllpost = function (req, res, next) {
    let page = req.query.page
    db.find('posts', {}, {
        "pageamount": 12,
        "page": page,
        "sort": {"creatTime": -1}
    }, (err, result) => {
        if (err) {
            res.send({
                "code": 500,
                "info": "服务器错误"
            })
        }
        if (result.length == 0) {
            res.send({
                "code": 500,
                "info": "没有更多了"
            })
        } else {
            res.send({
                "code": 200,
                "data": result,
                "info": "成功"
            })
        }
    })
} 
// 获取所有说说总数
exports.getAllAmount = function (req, res, next) {
    db.getAllCount('posts', (err, count) => {
        res.send({
            "code": 200,
            "data": count,
            "info": "成功"
        })
    })
}
// 获取用户信息
exports.userInfo = function (req, res, next) {
    let username = req.query.username
    db.find('users', {"username": username}, (err, result) => {
        if (err) {
            res.send({
                "code": 500,
                "info": "服务器错误"
            })
        }
        let data = {
            "username": result[0].username,
            "avatar": result[0].avatar,
            "_id": result[0]._id,
        }
        res.send({
            "code": 200,
            "data": data,
            "info": "成功"
        })
    })
}
// 获取用户所有说说
exports.showUser = function (req, res, next) {
    let user = req.params['user']
    db.find('posts', {"username": user}, (err, result) => {
        if (err) {
            console.log(err)
            return
        }
        db.find('users', {"username": user}, (err, result2) => {
            if (err) {
                console.log(err)
                return
            }
            res.render('user',{
            "login": req.session.login == '1' ? true : false,
            "username": req.session.login == '1' ? req.session.username : '',
            "active": 'user',
            "user": user,
            "shuoshuolist": result,
            "avatar": result2[0].avatar,
            })
        })
    })
}
// 获取所有用户
exports.showUserlist = function (req, res, next) {
    let user = req.params['user']
    db.find('users',{},(err, result) => {
        if (err) {
            console.log(err)
            return
        }
        res.render('userlist',{
            "login": req.session.login == '1' ? true : false,
            "username": req.session.login == '1' ? req.session.username : '',
            "active": 'userlist',
            "userlist": result
        })
    })
}