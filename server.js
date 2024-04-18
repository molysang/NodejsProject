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
//app.use(body_Parser.urlencoded({ extended: true }));


app.get('/getEngineeringTeamName', (req, res) => {
  pool.query('SELECT Engineering_Team_NAME FROM engineering_team', (error, results) => {
    if (error) {
      console.error('添加查找时出错：', error);
      return res.status(500).json({ error: '查找数据时出错' });
    }
    res.json(results);
  });
})

// 添加数据的路由
app.post('/addData', (req, res) => {
  const { id, name, age } = req.body;
  // 插入数据到数据库(测试代码)
  pool.query('INSERT INTO student (id, name, age) VALUES (?, ?, ?)', [id, name, age], (error, results, fields) => {
    if (error) {
      console.error('添加数据时出错：', error);
      res.status(500).json({ error: '添加数据时出错' });
    } else {
      res.json({ message: '数据已成功添加' });
    }
  });      
      
});


  
  // 启动服务器
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });