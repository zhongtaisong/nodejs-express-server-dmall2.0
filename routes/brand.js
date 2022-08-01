const express = require('express');
const router = express.Router();
const pool = require('../pool');

// 查询所有品牌
router.post('/select', (req, res) => {
	let { current=1, pageSize } = req.body || {};
    if( !current ){
        res.status(400).send({
            code: 1,
            msg: 'current不能为空,且大于0'
        })
        return;
    }

	let sql = "SELECT * FROM dm_brands ORDER BY id DESC";
	pool.query(sql, [], (err, data) => {
        if( err ){
            res.status(503).send({
                code: 3,
                msg: err
            })
        }else{
            let result = {
                // current - 当前页
                current: current - 1,
                // 一页多少条数据
                pageSize: pageSize ? parseInt(pageSize) : data.length,
                // 数据总数
                total: data.length
            };           
            
            result.products = data.slice(result.current * result.pageSize, result.current * result.pageSize + result.pageSize);
            result.current = result.current + 1;
            res.send({
                code: 200,
                data: result,
                
            });
        }
	});
});

// 添加品牌
router.post('/add', (req, res) => {
    const { brandName } = req.body || {};
    if( !brandName ){
        res.status(400).send({
          code: 1,
          msg: '品牌名称不能为空！'
        })
        return;
    }
	let sql = "INSERT INTO dm_brands VALUES (NULL, ?)";
	pool.query(sql, [ brandName ], (err, data) => {
        if( err ){
            res.status(503).send({
                code: 2,
                msg: err
            })
        }else{
            if( data.affectedRows ){
                res.send({
                    code: 200,
                    data: null,
                    msg: '添加品牌成功'
                })
            }else{
                res.send({
                    code: 3,
                    msg: '添加品牌失败'
                })
            }
        }
	});
});

// 修改品牌
router.put('/update', (req, res) => {
    const { id, brandName } = req.body || {};
    if( !id ){
        res.status(400).send({
          code: 1,
          msg: 'fid不能为空！'
        })
        return;
    }
    if( !brandName ){
        res.status(400).send({
          code: 2,
          msg: '品牌名称不能为空！'
        })
        return;
    }
	let sql = "UPDATE dm_brands SET brandName=? WHERE id=?";
	pool.query(sql, [brandName, id], (err, data) => {
        if( err ){
            res.status(503).send({
                code: 3,
                msg: err
            })
        }else{
            if( data.affectedRows ){
                res.send({
                    code: 200,
                    data: null,
                    msg: '修改品牌成功'
                })
            }else{
                res.send({
                    code: 4,
                    msg: '修改品牌失败'
                })
            }
        }
	});
});

// 删除品牌
router.delete('/delete/:id', (req, res) => {
    const { id } = req.params || {};
    if( !id ){
        res.status(400).send({
          code: 1,
          msg: 'id不能为空！'
        })
        return;
    }
	let sql = "DELETE FROM dm_brands WHERE id=?";
	pool.query(sql, [id], (err, data) => {
        if( err ){
            res.status(503).send({
                code: 2,
                msg: err
            })
        }else{
            if( data.affectedRows ){
                res.send({
                    code: 200,
                    data: null,
                    msg: '删除品牌成功'
                })
            }else{
                res.send({
                    code: 3,
                    msg: '删除品牌失败'
                })
            }
        }
	});
});

module.exports = router;