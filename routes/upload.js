const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');

const SECRET_KEY = "jF44FzpQEuaUOMmYXtWhblIm5yTuMOewmUvrok68bkle-jHTXs2Fr3ddKSqxfCENxZYLLTJSmRgPWOlkJSWClg";
//上传图片的功能实现
router.post('/upload', (req, res) => {

	const token = req.headers.authorization.split(' ')[1]; // 获得头部的token

	// 解码 Token，提取用户 ID
	jwt.verify(token, SECRET_KEY, (err, decoded) => {
		if (err) {
			return res.status(401).send({ message: 'Token验证失败' });
		}   //验证失败
		const account = decoded.userId; //获得userID，即数据库中的account字段
		const sql = 'SELECT U_NUM FROM users WHERE U_ACCOUNT = ?';
		pool.query(sql, [account], (err, results) => {
			if (err) {
				console.error('错误信息：', err);
				return res.status(500).send({ message: '查询数据库出错' });
				
			}
			if (results.length > 0) {

				const userNum = results[0].U_NUM;
				const { IMAGE_NAME, IMAGE_PATH, IMAGE_SID, IMA_START, IMA_END, IMA_DEPTH, S_TYPE } = req.body;
				//获取body中的json信息

				const sql1 = "INSERT INTO image_info (image_name, image_path, uploader_num, image_sid, ima_start, ima_end, ima_depth, s_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

				//拼接出sql语句
				pool.query(sql1, [IMAGE_NAME, IMAGE_PATH, userNum, IMAGE_SID, IMA_START, IMA_END, IMA_DEPTH, S_TYPE], (err, results) => {
					if (err) {
						// 如果是键值冲突
						if (err.code === 'ER_DUP_ENTRY') {
							res.status(409).send({ message: '图片名称已存在。' });
						} else {
							// 其他错误
							res.status(500).send({ message: '数据库插入失败。' });
						}
					}

					res.status(200).json({ message: '数据库插入成功' });

				});


			} else {
				return res.status(404).send({ message: '未找到用户信息' });
			}
		});
	});
});   //验证成功(^_^)

module.exports = router