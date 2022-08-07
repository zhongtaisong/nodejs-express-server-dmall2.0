const express = require('express');
const router = express.Router();
const pool = require('../pool');
const moment = require('moment');
const fs = require('fs');
const kit = require('./../kit');

// multer上传图片相关设置
const multer  = require('multer');
const { default: axios } = require('axios');
const dest = 'public/img';
let upload = multer() // 文件储存路径

// 查询菜单 和 按钮权限
router.get('/select/uname', (req, res) => {
    const { uname } = req.headers || {};
    if( !uname ){
        res.status(400).send({
            code: 1,
            msg: 'uname不能为空！'
        })
        return;
    }
    let sql = 'SELECT * FROM dm_admin WHERE uname=?';
    pool.query(sql, [uname], (err, data) => {
        if(err){
            res.status(503).send({
                code: 2,
                msg: err
            })
        };
        res.send({
            code: 200,
            data: data[0] || {},
            
        });
    });
});

/**
 * 分页查询 - 权限
 */
router.post('/select', async (req, res) => {
	let { current, pageSize } = req.body || {};
    if(!current){
        return res.status(400).send({
            code: 1,
            msg: 'current不能为空,且大于0',
        })
    }

    current = current - 1;
    const [result01, result02] = await kit.promiseAllSettled([
        new Promise((resolve, reject) => {
            pool.query("SELECT COUNT(*) as total FROM dm_admin", null, (err, data) => {
                if(err){
                    return reject(err);
                };

                resolve(data?.[0]?.total || 0);
            });
        }),
        new Promise((resolve, reject) => {
            pool.query("SELECT * FROM dm_admin LIMIT ?, ?", [current * pageSize, pageSize], (err, data) => {
                if(err){
                    return reject(err);
                };

                resolve(data);
            });
        }),
    ]);

    Array.isArray(result02) && result02.forEach(item => {
        Object.entries(item).forEach(([key, value]) => {
            if(key.includes("Btn")) {
                item[key] = value?.split?.("|") || [];
            }
        });
    })

    res.send({
        code: 200,
        data: {
            current: current + 1,
            pageSize,
            total: result01,
            data: result02
        },
    });
});

/**
 * 添加 - 权限
 */
router.post('/add', (req, res) => {
    const current_uname = req?.headers?.uname;
    const bodyParams = req.body || {};
    const { role, uname } = bodyParams;

    if(!role){
        res.status(400).send({
            code: 1,
            msg: 'role不能为空！'
        })
        return;
    }

    if(!uname){
        res.status(400).send({
            code: 2,
            msg: 'uname不能为空！'
        })
        return;
    }

    if(current_uname && current_uname === uname) {
        return res.status(400).send({
            code: 3,
            msg: '已存在用户权限！',
        });
    }

    const params=[];

    let sql_key = "(id,";
    let sql_val = "(NULL, ";
    Object.entries(bodyParams).forEach(([key, val]) => {
        sql_key += `${ key },`;
        sql_val += `?,`

        if(key.includes("Menu")) {
            params.push(Number(val));
        }else if(key.includes("Btn") && Array.isArray(val)) {
            params.push(val.join("|"));
        }else if(["role"].includes(key)) {
            params.push(Number(val));
        }else {
            params.push(val);
        }
    });
    sql_key += "operator,handleTime)";
    sql_val += "?,?)";

    params.push(current_uname);
    params.push(moment().format('YYYY-MM-DD HH:mm:ss'));
    pool.query(`INSERT INTO dm_admin ${ sql_key } VALUES ${ sql_val }`, params, (err, data) => {
        if(err){
            return res.status(503).send({
                code: 4,
                msg: err
            });
        };

        if(data.affectedRows){
            pool.query(`UPDATE dm_user SET admin=? WHERE uname=?`, [1, uname], (err, result) => {
                if(err){
                    return res.status(503).send({
                        code: 5,
                        msg: err
                    })
                };

                if( result.affectedRows ){
                    res.send({
                        code: 200,
                        data: null,
                        msg: `添加权限成功`
                    })
                }else{
                    res.send({
                        code: 6,
                        msg: `添加权限失败`
                    })
                }
            });
        }

    });
})

/**
 * 更新 - 权限
 */
router.post('/update', (req, res) => {
    const current_uname = req?.headers?.uname;
    const bodyParams = req.body || {};
    const { id, role } = bodyParams;

    if(!id){
        return res.status(400).send({
            code: 1,
            msg: 'id不能为空！'
        });
    }

    if(!role){
        return res.status(400).send({
            code: 2,
            msg: 'role不能为空！'
        });
    }

    let sql = "";
    Object.entries(bodyParams).forEach(([key, val]) => {
        let value = val;
        if(key.includes("Menu")) {
            value = Number(val);
        }else if(key.includes("Btn") && Array.isArray(val)) {
            value = val?.join?.("|") || '';
        }else if(["role"].includes(key)) {
            value = Number(val);
        }
        sql += `${ key }=${ val },`;
    });
    sql += `operator=${ current_uname },handleTime=${ moment().format('YYYY-MM-DD HH:mm:ss') }`;
    pool.query(`UPDATE dm_admin SET ${ sql } WHERE id=${ id }`, null, (err, data) => {
        if(err){
            return res.status(503).send({
                code: 4,
                msg: err
            });
        };

        if(data.affectedRows){
            res.send({
                code: 200,
                data: null,
                msg: `更新权限成功！`,
            })
        }

    });
})

/**
 * 删除 - 权限
 */
router.delete('/delete/:id', (req, res) => {
    const { uname } = req.headers || {};
    const { id } = req.params || {};
    if(!id){
        return res.status(400).send({
            code: 1,
            msg: 'id不能为空'
        });
    }
    if(!uname){
        return res.status(400).send({
            code: 2,
            msg: 'uname不能为空'
        });
    }

    pool.query("DELETE FROM dm_admin WHERE id=?", [id], (err, data) => {
        if( err ){
            return res.status(503).send({
                code: 3,
                msg: err,
            });
        }

        if( data.affectedRows ){
            pool.query("UPDATE dm_user SET admin=? WHERE uname=?", [0, uname], (err, result) => {
                if(err){
                    return res.status(503).send({
                        code: 4,
                        msg: err
                    })
                };

                if( result.affectedRows ){
                    res.send({
                        code: 200,
                        data: null,
                        msg: '删除用户权限成功'
                    })
                }else{
                    res.send({
                        code: 6,
                        msg: '删除用户权限失败'
                    })
                }
            });

        }else{
            res.send({
                code: 5,
                msg: '删除用户权限失败'
            })
        }
    })
});

/**
 * 查询 - 当前用户角色下可操作的用户
 */
router.get("/select/role/uname", async (req, res) => {
    const { uname } = req.headers || {};

    const [result01, result02, result03] = await kit.promiseAllSettled([
        new Promise((resolve, reject) => {
            pool.query("SELECT uname FROM dm_user", null, (err, data) => {
                if(err){                    
                    return reject(err);
                };
        
                resolve(data?.map?.(item => item?.uname) || []);
            });
        }),
        new Promise((resolve, reject) => {
            pool.query("SELECT uname FROM dm_admin", null, (err, data) => {
                if(err){                    
                    return reject(err);
                };
        
                resolve(data);
            });
        }),
        new Promise((resolve, reject) => {
            pool.query(`SELECT role FROM dm_admin WHERE uname="${ uname }"`, null, (err, data) => {
                if(err){                    
                    return reject(err);
                };

                resolve({
                    100: [100, 10, 1],
                    10: [10, 1],
                    1: [1],
                }[data?.[0]?.role] || [1]);
            });
        }),
    ]);

    const uname_list = result01.filter(item => !result02.some(item02 => item02?.uname === item));
    res.send({
        code: 200,
        data: {
            uname_list,
            role_list: result03,
        },
    });
})

module.exports = router;