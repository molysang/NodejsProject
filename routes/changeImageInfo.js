const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const pool = require('../db');
const SECRET_KEY = "jF44FzpQEuaUOMmYXtWhblIm5yTuMOewmUvrok68bkle-jHTXs2Fr3ddKSqxfCENxZYLLTJSmRgPWOlkJSWClg";

router.get('/showImageInfo', (req, res) => {

    const imageName = req.query.imageName;

    const select = "select * from image_info where Image_NAME = ?"

    pool.query(select, [imageName], (error, results) => {
        if (error) {
			// 发生错误时发送服务器错误响应
			res.status(500).send({ message: '发生错误。' });
            console.log(error);

		} else {
            res.json(results);
		}
    });

})

router.get('/updateImageInfo', (req, res) => {

    const uploadNum = req.query.uploadNum;
    const token = req.headers.authorization.split(' ')[1]; // 获得头部的token

	// 解码 Token，提取用户 ID
	jwt.verify(token, SECRET_KEY, (error, decoded) => {

        if (error) {
            return res.status(401).send({ message: 'Token验证失败' });
        }

        const account = decoded.userId; //获取ID
        const select = 'select * from users where U_ACCOUNT = ? AND U_NUM = ?'
        pool.query(select, [account, uploadNum], (err, results) => {
            if (err) {
                console.error('错误信息：', err);
                return res.status(500).send({ message: '查询数据库出错' });
            }

            res.json(results);
        });

    });

})



router.post('/updateSubmit', (req, res) => {

    const { imageName, imageSid, imageStart, imageEnd, imageDepth, imageType, imageNameOld } = req.body;

    const update = 'update image_info set IMAGE_NAME = ?, IMAGE_SID = ?, IMA_START = ?, IMA_END = ?, IMA_DEPTH = ?, S_TYPE = ? where IMAGE_NAME = ?'

    pool.query(update, [imageName, imageSid, imageStart, imageEnd, imageDepth, imageType, imageNameOld], (err, results) => {

        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
				res.status(409).send({ message: '图片名称已存在' });
			} else {
				// 其他错误
                console.error('错误信息', err);
				res.status(500).send({ message: '输入数据不符合规范' });
			}
        } else {
            res.status(200).send({ message: '修改成功' })
        }

    })

})

module.exports = router
