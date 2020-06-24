const express=require("express");
const router=express.Router();
const pool=require("../pool");

// 加入收藏 / 加入购物车
router.post('/add', (req, res) => {
    const { ids, uname, collection } = req.body || {};
    if( !ids || !ids.length || !Array.isArray(ids) ){
        res.status(400).send({
            code: 1,
            msg: 'ids不能为空，且是一个数组！'
        })
        return;
    }
    if( !uname ){
        res.status(400).send({
            code: 2,
            msg: 'uname不能为空！'
        })
        return;
    }
    if( collection || (collection == 0 && typeof collection != 'boolean') ){
        if( collection != 0 && collection != 1 ){
            res.status(400).send({
                code: 3,
                msg: 'collection只能传0 或 1'
            })
            return;
        }
    }else{
        res.status(400).send({
            code: 4,
            msg: 'collection不能为空！'
        })
        return;
    }

    let sql;
    let msg = collection == 1 ? '收藏' : '加入购物车'
    ids.forEach(item => {
        sql = "SELECT * FROM dm_cart WHERE pid=( SELECT pid FROM dm_cart WHERE id=? AND uname=?) AND collection=? AND uname=?";
        pool.query(sql, [item, uname, collection, uname], (err, data) => {
            if(err) throw err;
            if( data.length ){
                sql = "DELETE FROM dm_cart WHERE id=?";
                pool.query(sql, [item], (err, result) => {
                    if(err) throw err;
                    if( result.affectedRows ){
                        res.send({
                            code: 200,
                            data: null,
                            msg: `${msg}成功`
                        })
                    }else{
                        res.send({
                            code: 5,
                            msg: `${msg}失败`
                        })
                    }
                    return;
                })
            }else{
                sql = "UPDATE dm_cart SET collection=? WHERE id=? AND uname=?";
                pool.query(sql, [collection, item, uname], (err, data) => {
                    if(err) throw err;
                    if( data.affectedRows ){
                        res.send({
                            code: 200,
                            data: null,
                            msg: `${msg}成功`
                        })
                    }else{
                        res.send({
                            code: 5,
                            msg: `${msg}失败`
                        })
                    }
                    return;
                })               
            }
        })
        
    })
})

module.exports=router;