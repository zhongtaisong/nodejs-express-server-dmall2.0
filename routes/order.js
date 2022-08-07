const express = require("express");
const router = express.Router();
const pool = require("../pool");
const moment = require('moment');
const kit = require('./../kit');
const config = require('./../config');
const lodash = require('lodash');

/**
 * 订单 - 删除
 */
router.delete('/delete/:id', (req, res) => {
    const { id } = req.params || {};
    if(!id){
        return res.status(400).send({
            code: 1,
            msg: 'id不能为空！',
        });
    }

    pool.query(
        `DELETE FROM dm_order WHERE id=${ id }`, 
        null, 
        (err, result) => {
            if(err) {
                return res.status(503).send({
                    code: 2,
                    msg: err
                });
            };

            if(result.affectedRows){
                return res.send({
                    code: 200,
                    data: null,
                    msg: '删除订单成功！',
                });
            }

            return res.send({
                code: 3,
                msg: '操作失败！',
            })
        }
    );
})

/**
 * 订单 - 详情
 */
router.get('/detail/:id', async (req, res) => {
    const { id } = req.params || {};
    if(!id){
        return res.status(400).send({
            code: 1,
            msg: 'id不能为空！',
        });
    }

    const result01 = await new Promise((resolve, reject) => {
        pool.query(
            `SELECT ordernum, aid, pid, submitTime, num, totalprice, nums FROM dm_order WHERE id=${ id }`, 
            null, 
            (err, reuslt) => {
                if(err) return reject(err);

                resolve(reuslt?.[0] || {});
            }
        )
    });
    if(!result01 || !Object.keys(result01).length) {
        return res.send({
            code: 2,
            msg: '操作失败！',
        })
    };

    const [result02, result03] = await kit.promiseAllSettled([
        new Promise((resolve, reject) => {
            pool.query(
                `SELECT name, region, detail, phone FROM dm_address WHERE id=${ result01?.aid }`, 
                null, 
                (err, reuslt) => {
                    if(err) return reject(err);

                    resolve(reuslt?.[0] || {});
                }
            )
        }),
        new Promise((resolve, reject) => {
            pool.query(
                `SELECT mainPicture, description, spec, price, id FROM dm_products WHERE id IN (${ result01?.pid })`, 
                null, 
                (err, reuslt) => {
                    if(err) return reject(err);
    
                    resolve(reuslt);
                }
            )
        }),
    ]);

    return res.send({
        code: 200,
        data: {
            result01,
            result02,
            result03,
        },
    });
})

// 添加商品订单
router.post('/add', (req, res) => {
    const { uname } = req.headers || {};
    let { aid, pid, num, totalprice, nums } = req.body || {};
    if( !uname ){
        res.status(400).send({
            code: 1,
            msg: 'uname不能为空！'
        })
        return;
    }
    if( !aid ){
        res.status(400).send({
            code: 2,
            msg: 'aid不能为空！'
        })
        return;
    }
    if( !pid.length ){
        res.status(400).send({
            code: 3,
            msg: 'pid不能为空，且为数组！'
        })
        return;
    }else{
        pid = pid.join(',');
    }
    if( !num ){
        res.status(400).send({
            code: 4,
            msg: 'num不能为空！'
        })
        return;
    }
    if( !totalprice ){
        res.status(400).send({
            code: 5,
            msg: 'totalprice不能为空！'
        })
        return;
    }
    if( !nums ){
        res.status(400).send({
            code: 6,
            msg: 'nums不能为空！'
        })
        return;
    }
    let ordernum = moment(Date.now()).format('YYYYMMDDHHmmss');
    let submitTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    let sql = 'INSERT INTO dm_order VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    pool.query(sql, [uname, ordernum, 100, aid, pid, submitTime, num, totalprice, nums], (err, data) => {
        if(err) throw err;
        if( data.affectedRows ){
            // 提交订单成功后，删除购物车表被结算成功的数据
            sql = `DELETE FROM dm_cart WHERE pid IN (${pid})`;
            pool.query(sql, null, (err, result) => {
                if(err) throw err;
                res.send({
                    code: 200,
                    data: data.insertId,
                    msg: '提交订单成功'
                })
            })
        }else{
            res.send({
                code: 7,
                msg: '提交订单失败'
            })
        }
    })
})

// 查询结算页，收货地址，商品详情
router.post('/select/settlement', (req,res) => {
    const { uname } = req.headers || {};
    let { id, type } = req.body || {};
    if( !uname ){
        res.status(400).send({
            code: 1,
            msg: 'uname不能为空！'
        })
        return;
    }
    if( !type ){
        res.status(400).send({
            code: 2,
            msg: 'type不能为空！'
        })
        return;
    }
    if( type == 'cart' ){
        if( !id.length ){
            res.status(400).send({
                code: 3,
                msg: 'id不能为空，且是个id数组！'
            })
            return;
        }
    }else if( type == 'detail ' ){
        if( !id ){
            res.status(400).send({
                code: 4,
                msg: 'id不能为空！'
            })
            return;
        }
    }

    (async () => {
        let result = {};
        await new Promise((resolve, reject) => {
            let sql = 'SELECT * FROM dm_address WHERE uname=?';
            pool.query(sql, [uname], (err, data)=>{
                if(err) throw err;
                result['address'] = data;
                resolve();
            })
        })
        await new Promise((resolve, reject) => {
            let sql, params=null;
            if( type == 'detail' ){
                sql = 'SELECT id, mainPicture, description, spec, price FROM dm_products WHERE id=?';
                params = [id];
            }else if( type == 'cart' ){
                sql = 'SELECT c.*, p.mainPicture, p.description, p.spec, p.price FROM dm_cart c, dm_products p WHERE c.pid=p.id AND c.uname=? AND p.id IN (?) AND collection=0';
                params = [uname, id];
            }
            pool.query(sql, params, (err, data)=>{
                if(err) throw err;
                result['productsInfo'] = data;
                resolve();
            })
        })
        res.send({
            code: 200,
            data: result            
        })
    })()
})

/**
 * 分页查询 - 当前用户订单
 */
router.post('/select', async (req, res) => {
	const { 
        current = 0, 
        pageSize = config?.PAGE_SIZE, 
        id, 
        oIndex,
    } = req.body || {};
    const { uname } = req.headers || {};
    const setErrCode = kit.joinErrCode("RDER-SELECT");

    if(!uname) {
        return res.status(400).send({
            code: setErrCode("001"),
            msg: '请求头必须携带uname, 且不能为空!',
        });
    }

    if(typeof current !== 'number'){
        return res.status(400).send({
            code: setErrCode("002"),
            msg: 'current是Number类型!',
        });
    }

    if(current < 0) {
        return res.status(400).send({
            code: setErrCode("003"),
            msg: 'current大于等于0!',
        });
    }

    if(typeof pageSize !== 'number'){
        return res.status(400).send({
            code: setErrCode("004"),
            msg: 'pageSize是Number类型!',
        });
    }

    if(pageSize < 1) {
        return res.status(400).send({
            code: setErrCode("005"),
            msg: 'pageSize大于等于1!',
        });
    }

    const [total, order_list] = await kit.promiseAllSettled([
        new Promise((resolve, reject) => {
            pool.query(
                `SELECT COUNT(*) as total FROM dm_order WHERE uname="${ uname }"`,
                null, 
                (err, reuslt) =>!err ? resolve(reuslt?.[0]?.total || 0) : reject(err),
            );
        }),
        new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM dm_order WHERE uname="${ uname }" ORDER BY submitTime DESC LIMIT ${ current }, ${ pageSize }`,
                null, 
                (err, reuslt) =>!err ? resolve(reuslt) : reject(err),
            );
        }),
    ]);

    if(!Array.isArray(order_list)) {
        return res.status(400).send({
            code: setErrCode("006"),
            msg: '操作失败!',
        });
    }

    const promise_list = [];
    order_list.forEach(item => {
        promise_list.push(
            new Promise((resolve, reject) => {
                pool.query(
                    `SELECT id, mainPicture, description, spec, price FROM dm_products WHERE id IN (${ item?.pid })`, 
                    null, 
                    (err, reuslt) =>!err ? resolve(reuslt) : reject(err),
                )
            })
        );
    });

    let goods_infos_all = await kit.promiseAllSettled(promise_list);
    if(!Array.isArray(goods_infos_all)) {
        return res.status(400).send({
            code: setErrCode("007"),
            msg: '操作失败!',
        });
    }else {
        goods_infos_all = lodash.uniqBy(goods_infos_all.flat(), "id");
    }

    order_list.forEach(item => {
        const pids = item?.pid?.split?.(",") || [];
        const nums = item?.nums?.split?.(",") || [];
        const temp_map = Array.isArray(pids) && Array.isArray(nums) && pids.reduce((prev, item, index) => {
            prev[item] = nums[index] || '0';
            return prev;
        }, {});

        if(Array.isArray(pids) && pids.length) {
            const arr = goods_infos_all.filter(item02 => pids?.includes?.(String(item02?.id)));
            arr.forEach(item03 => {
                item03['buyCount'] = Number(temp_map[item03?.id]);
            })
            item['goods_infos'] = arr;
        }
    });

    res.send({
        code: 200,
        data: {
            content: order_list,
            current,
            pageSize,
            total,
        },
    });
})
// router.post('/select', (req, res) => {
// 	const { current, pageSize, id, oIndex, uname } = req.body || {};
//     if(!id) {
//         if( !current ){
//             res.status(400).send({
//                 code: 1,
//                 msg: 'current不能为空,且大于0'
//             })
//             return;
//         }

//         (async () => {
//             let sql, params=null;
//             let result = {
//                 // current - 当前页
//                 current: current - 1
//             };
//             if( !uname ){
//                 await new Promise((resolve, reject) => {
//                     sql = "SELECT id, uname, ordernum, submitTime, num, totalprice FROM dm_order ORDER BY submitTime DESC";
//                     pool.query(sql, null, (err, data) => {
//                         if(err) throw err;
//                         // 一页多少条数据
//                         result['pageSize'] = pageSize ? parseInt(pageSize) : (data.length ? data.length : current);
//                         // 数据总数
//                         result['total'] = data.length;
//                         // 结果
//                         result.products = data.slice(result.current * result.pageSize, result.current * result.pageSize + result.pageSize);
//                         resolve();
//                     })
//                 })
//             }else{
//                 const orders = await new Promise((resolve, reject) => {
//                     sql = "SELECT * FROM dm_order WHERE uname=? ORDER BY submitTime DESC";
//                     params = [uname];
//                     pool.query(sql, params, (err, data) => {
//                         if(err) throw err;
//                         resolve(data);
//                     })
//                 })
    
//                 const arr = await new Promise((resolve, reject) => {
//                     let res = [];
//                     if(orders.length) {
//                       orders.map((item, index) => {
//                           sql = `SELECT id, mainPicture, description, spec, price FROM dm_products WHERE id IN (${item.pid})`;
//                           pool.query(sql, null, (err, data) => {
//                               if(err) throw err;
//                               let nums = item.nums ? item.nums.split(',') : [];
//                               data.map((d, i) => {
//                                   d['ordernum'] = item.ordernum;
//                                   d['num'] = Number(nums[i]);
//                                   d['totalprice'] = d['num'] * d['price'];
//                                   d['orderId'] = item.id;
//                               });
//                               res.push(data);
//                               res.length == orders.length && resolve(res);
//                           })
//                       })
//                     }else{
//                       resolve(res);
//                     }
//                 })
    
//                 let obj = [];
//                 orders.forEach((o, n) => {
//                     arr.forEach((a, i) => {
//                         if(o.ordernum == a[0].ordernum){
//                             obj.push({
//                                 id: o.id,
//                                 ordernum: o.ordernum,
//                                 submitTime: o.submitTime,
//                                 nums: o.nums,
//                                 pid: o.pid,
//                                 content: arr[i]
//                             })
//                         }
//                     })
//                 })
//                 // 一页多少条数据
//                 result['pageSize'] = pageSize ? parseInt(pageSize) : (obj.length ? obj.length : current);
//                 // 数据总数
//                 result['total'] = obj.length;
//                 // 结果
//                 result.products = obj.slice(result.current * result.pageSize, result.current * result.pageSize + result.pageSize);
//             }    
    
//             result.current = result.current + 1;
//             res.send({
//                 code: 200,
//                 data: result
//             });
//         })()
//     }else {
//         if(!uname){
//             res.status(400).send({
//                 code: 2,
//                 msg: 'uname不能为空！'
//             })
//             return;
//         }

//         let sql = "SELECT * FROM dm_order WHERE id=? AND uname=?";
//         pool.query(sql, [id, uname], (err, data01) => {
//             if(err) throw err;
//             if(data01.length) {
//                 let d = data01[0];
//                 let { nums, pid } = d || {};
//                 nums = nums.split(',');
//                 d.num = !isNaN(nums[oIndex]) ? Number(nums[oIndex]) : 1;
//                 pid = pid.split(',');
//                 delete d.nums;
//                 delete d.pid;
//                 delete d.aid;
//                 delete d.id;
//                 sql = "SELECT id, mainPicture, price, description, spec FROM dm_products WHERE id=?";
//                 pool.query(sql, [ pid[oIndex] ], (err, data02) => {
//                     if(err) throw err;
//                     if(data02.length) {
//                         const { price } = data02[0] || {};
//                         d.totalprice = price * d.num;
//                         let obj = {...d, ...data02[0]};
//                         res.send({
//                             code: 200,
//                             data: [obj]
//                         });
//                     }else{
//                         res.send({
//                             code: 200,
//                             data: []
//                         });
//                     }
//                 })

//             }else {                
//                 res.send({
//                     code: 200,
//                     data: []
//                 });
//             }
//         })
//     }
// })


module.exports = router;