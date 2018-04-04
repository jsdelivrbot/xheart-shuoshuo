/*
 * @Author: X_Heart
 * @Date: 2017-05-28 14:45:29
 * @Last Modified by: wangxiaoxin
 * @Last Modified time: 2018-04-04 09:16:14
 * @description: md5加密
 */
'use strict'
const crypto = require('crypto')

module.exports = function(mingma) {
  const md5 = crypto.createHash('md5')
  const password = md5.update(mingma).digest('base64')
  return password
}