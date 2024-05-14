//根据中间页面输入的结果生成的sql查询条件来查找图片
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/getImageInfo', (req, res) => {
    
    let select = 'select Image_NAME, Stratum_NAME, Ima_START, Ima_END from ' +
                 'image_info i left join Stratums s ON i.image_SID = s.Stratum_ID'

    let whereConditions = [];
    let queryParams = [];

    if (req.query.imageSid) {
        whereConditions.push("Image_SID = ?");
        queryParams.push(req.query.imageSid);
    }

    if (req.query.imageStart) {
        whereConditions.push("Ima_START > ?");
        queryParams.push(req.query.imageStart);
    }

    if (req.query.imageEnd) {
        whereConditions.push("Ima_END < ?");
        queryParams.push(req.query.imageEnd);
    }

    if (req.query.imageDepth) {
        whereConditions.push("Ima_DEPTH = ?");
        queryParams.push(req.query.imageDepth);
    }

    if (req.query.imageType) {
        whereConditions.push("S_TYPE = ?");
        queryParams.push(req.query.imageType);
    }

    if (whereConditions.length > 0) {
        select += " WHERE " + whereConditions.join(" AND ");
    }


    pool.query(select, queryParams, (err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).send({ message: '查询数据库出错' });
        }
        res.status(200).json(results);
    })
})

module.exports = router
