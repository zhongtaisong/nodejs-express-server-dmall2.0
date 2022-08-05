/**
 * 获取 - 请求成功后的数据
 */
exports.fnGetPromiseValue = (obj) => {
    if (!obj || !Object.keys(obj).length) return;
    if (!['fulfilled', 'rejected'].includes(obj?.status)) return;
    if (obj?.status === 'rejected') return;

    return obj.value;
};
