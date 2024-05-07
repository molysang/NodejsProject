const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');

const app = express();
const pool = require('./db');


//引入路由
const getImageInfo = require('./routes/getImageInfo')


//中间件
app.use(express.json());
app.use(cors());
//使用路由
app.use('/get', getImageInfo)


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

//上传图片的功能实现
app.post('/upload', (req, res) => {

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