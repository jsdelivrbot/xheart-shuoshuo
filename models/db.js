/*
 * @Author: X_Heart
 * @Date: 2017-05-28 14:45:29
 * @Last Modified by: wangxiaoxin
 * @Last Modified time: 2018-04-03 15:30:36
 * @description: 封装了对数据库的常用操作
 */
const MongoClient = require('mongodb').MongoClient

const config = require('../config')
// 连接数据库
function _connectDB(callback) {
  const url = config.dburl
  // 连接数据库
  MongoClient.connect(url, function(err, db) {
    if (err) {
      callback(err, db)
      return
    }
    console.log('数据库连接成功！')
    callback(err,db)
  })
}
// 插入数据
exports.insertOne = function(collectionName, json, callback) {
  _connectDB((err, db) => {
    if (err) {
      callback(err, db)
      db.close()
      return
    }
    // 连接成功做的事情
    db.collection(collectionName).insertOne(json, (err,result) => {
      callback(err,result)
      db.close()
    })
  })
}
// 查找数据
exports.find = function(collectionName, json, _args, _callback) {
   // 结果数组
  let result = []
  // 应该省略的条数
  let skipnumber = 0
  // 数目限制
  let limit = 0
  // 排序方式
  let sort = {}
  // 回调函数
  let callback
  if (arguments.length == 3) {
    callback = _args
     // 应该省略的条数
    skipnumber = 0
    // 数目限制
    limit = 0
  } else if (arguments.length == 4) {
    callback = _callback
    let args = _args
    // 应该省略的条数
    skipnumber = args.pageamount * (args.page - 1) || 0
    // 数目限制
    limit = args.pageamount || 0
    // 排序方式
    sort = args.sort || {}
  } else {
    throw new Error('find函数接收4个参数或3个参数')
  }
  _connectDB((err, db) => {
    // 结果数组
    let cursor = db.collection(collectionName).find(json).skip(skipnumber).limit(limit).sort(sort)
    cursor.each(function(err, doc) {
      if (err) {
        callback(err, null)
        db.close()
        return
      }
      if (doc != null) {
        result.push(doc)
      } else {
        callback(null, result)
        db.close()
      }
    })
  })
}
// 删除数据
exports.deleteMany = function(collectionName, json, callback) {
  _connectDB((err, db) => {
    if (err) {
      callback(err, db)
      db.close()
      return
    }
    // 连接成功做的事情
    db.collection(collectionName).deleteMany(json, (err, results) => {
         callback(err, results)
         db.close()
      }
    )
  })
}
// 修改数据
exports.updateMany = function(collectionName, json1, json2, callback) {
    _connectDB((err, db) => {
      if (err) {
        callback(err, db)
        db.close()
        return
      }
      // 连接成功做的事情
      db.collection(collectionName).updateMany(json1, json2, (err, results) => {
          callback(err, results)
          db.close()
        }
      )
    })
}

// 获取数据数量
exports.getAllCount = function(collectionName, callback) {
   _connectDB((err, db) => {
      if (err) {
        callback(err, db)
        db.close()
        return
      }
      // 连接成功做的事情
      db.collection(collectionName).count({}).then((count) => {
          callback(null, count)
          db.close()
      })
    })
}
