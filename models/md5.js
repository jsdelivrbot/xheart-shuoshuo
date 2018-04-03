/*
 * @Author: X_Heart
 * @Date: 2017-05-28 14:45:29
 * @Last Modified by: X_Heart
 * @Last Modified time: 2017-06-06 10:42:06
 * @description: md5加密
 */
const crypto = require('crypto')

module.exports = function(mingma) {
  const md5 = crypto.createHash('md5')
  const password = md5.update(mingma).digest('base64')
  return password
}