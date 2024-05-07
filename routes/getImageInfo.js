//根据中间页面输入的结果生成的sql查询条件来查找图片
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/getImageInfo', (req, res) => {
    
    let select = 'select Image_NAME, Stratum_NAME, Ima_START, Ima_END from ' +
                 'image_info i left join Stratums s ON i.image_SID = s.Stratum_ID ' +
                 'where ${req.body.condition}'

    if (!req.body.condition) {
        select = 'select Image_NAME, Stratum_NAME, Ima_START, Ima_END from ' +
        'image_info i left join Stratums s ON i.image_SID = s.Stratum_ID'
    }

    pool.query(select, (err, results) => {
        if (err) {
            return res.status(500).send({ message: '查询数据库出错' });
        }
        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).send({ message: '没有满足条件的图片信息！' });
        }
    })

})

module.exports = router
