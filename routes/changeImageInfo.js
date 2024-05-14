const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');

const app = express();
const pool = require('../db');


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

//router.post('/updateImageInfo', (res, req) => {



//})
