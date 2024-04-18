const mysql = require('mysql2');

// 创建连接池
const pool = mysql.createPool({
  host: '60.205.90.139',
  user: 'hhu_sang',
  password: 'sang12131',
  database: 'geology_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 导出连接池
module.exports = pool;
