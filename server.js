const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');

const app = express();
const pool = require('./db');

//中间件
app.use(express.json());
app.use(cors());

// 在 Node.js 中读取环境变量//服务器环境变量有问题，直接显式调用SECRET_KEY
const SECRET_KEY = "jF44FzpQEuaUOMmYXtWhblIm5yTuMOewmUvrok68bkle-jHTXs2Fr3ddKSqxfCENxZYLLTJSmRgPWOlkJSWClg";

//注册时从数据库找工程队
app.get('/getEngineeringTeamName', (req, res) => {
  pool.query('SELECT Engineering_Team_NAME FROM engineering_team', (error, results) => {
    if (error) {
      console.error('添加查找时出错：', error);
      return res.status(500).json({ error: '查找数据时出错' });
    }
    res.json(results);
  });
})



//注册路由
app.post('/register', (req, res) => {
  // 从请求体中获取用户数据
  const { username, password, name, sex, number, id, email, tel, en } = req.body;

  // SQL 插入语句
  const sqlInsert = 'INSERT INTO users (U_ACCOUNT, U_NUM, U_PASSWORD, U_NAME, U_SEX, U_ID, U_EMAIL, U_TEL, U_ET_NAME) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

  // 插入数据到数据库
  pool.query(sqlInsert, [username, number, password, name, sex, id, email, tel, en], (err, results) => {
      if (err) {
          // 如果是键值冲突
          if (err.code === 'ER_DUP_ENTRY') {
              res.status(409).send({ message: '账号已存在。' });
          } else {
            // 其他错误
            res.status(500).send({ message: '注册失败。' });
          }
      } else {
          // 成功插入
          res.status(200).send({ message: '注册成功。' });
      }
  });
});   //测试成功(^_^)



//登录路由
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // 
  const sql = `SELECT compare_userpsw(?, ?) AS result`;
  
  pool.query(sql, [username, password], (err, results) => {

      if (err) {
        // 发生错误时发送服务器错误响应
        res.status(500).send({ message: '登录时发生错误。' });
      } else if (results.length > 0 && results[0].result === 1) {

        const token = jwt.sign({ userId: username }, SECRET_KEY, { expiresIn: '1h' }); // 用用户的唯一标识创建 token
        res.status(200).send({ message: '登录成功。', token: token });
        
      } else {

        // 未找到匹配的用户
        res.status(401).send({ message: '用户名或密码错误。' });

      }
  });
});   //测试成功(^_^)


  
  // 启动服务器
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });