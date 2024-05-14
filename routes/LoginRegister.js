const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');

const SECRET_KEY = "jF44FzpQEuaUOMmYXtWhblIm5yTuMOewmUvrok68bkle-jHTXs2Fr3ddKSqxfCENxZYLLTJSmRgPWOlkJSWClg";
//注册路由
router.post('/register', (req, res) => {
	// 从请求体中获取用户数据
	const { username, password, name, sex, number, id, email, tel, en } = req.body;

	// SQL 插入语句
	const sqlInsert = 'INSERT INTO users (U_ACCOUNT, U_NUM, U_PASSWORD, U_NAME, U_SEX, U_ID, U_EMAIL, U_TEL, U_ET_NAME) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

	// 插入数据到数据库
	pool.query(sqlInsert, [username, number, password, name, sex, id, email, tel, en], (err, results) => {
		if (err) {
			// 如果是键值冲突
			if (err.code === 'ER_DUP_ENTRY') {
				res.status(409).send({ message: '账号或工号已存在。' });
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
router.post('/login', (req, res) => {
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

module.exports = router