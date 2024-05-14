const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');

const app = express();
const pool = require('./db');


//引入路由
const getImageInfo = require('./routes/getImageInfo')
const loginRegister = require('./routes/LoginRegister')
const uploadImage = require('./routes/upload')


//中间件
app.use(express.json());
app.use(cors());
//使用路由
app.use('/get', getImageInfo)
app.use('/post', loginRegister)
app.use('/post', uploadImage)


// 在 Node.js 中读取环境变量//服务器环境变量有问题，直接显式调用SECRET_KEY
const SECRET_KEY = "jF44FzpQEuaUOMmYXtWhblIm5yTuMOewmUvrok68bkle-jHTXs2Fr3ddKSqxfCENxZYLLTJSmRgPWOlkJSWClg";

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '/root/pictures')
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname)
	}
});

const upload = multer({ storage: storage });


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

//添加图片时从岩芯表获得岩芯信息
app.get('/getStratumName', (req, res) => {
	pool.query('SELECT Stratum_NAME, STRATUM_ID FROM stratums', (error, results) => {
		if (error) {
			console.error('添加查找时出错：', error);
			return res.status(500).json({ error: '查找数据时出错' });
		}
		res.json(results);
	});
})




//根据token来获取用户信息，请求头中包含token，请求体中包含
app.get('/userinfo', (req, res) => {

	const token = req.headers.authorization.split(' ')[1]; // 获得头部的token

	jwt.verify(token, SECRET_KEY, (err, decoded) => {
		if (err) {
			return res.status(401).send({ message: 'Token验证失败' });
		}   //验证失败
		const account = decoded.userId; //获得userID，即数据库中的account字段
		const sql = 'SELECT * FROM users WHERE username = ?';
		pool.query(sql, [info, account], (err, results) => {
			if (err) {
				return res.status(500).send({ message: '查询数据库出错' });
			}
			if (results.length > 0) {
				res.json(results);
			} else {
				res.status(404).send({ message: '未找到用户信息' });
			}
		});
	});
});	//待测试


app.post('/uploadimage', upload.single('picture'), (req, res) => {
	const filePath = req.file.path;
	res.send({ path: filePath });

});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});