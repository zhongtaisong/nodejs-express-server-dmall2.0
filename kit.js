/**
 * 获取 - 请求成功后的数据
 */
exports.fnGetPromiseValue = (obj) => {
    if (!obj || !Object.keys(obj).length) return;
    if (!['fulfilled', 'rejected'].includes(obj?.status)) return;
    if (obj?.status === 'rejected') return;

    return obj.value;
};

/**
 * 拼接 - 异常code
 */
exports.joinErrCode = (prefix) => (code) => {
    if(!prefix || !code) return;

    return `${prefix}-${ code }`;
}

/**
 * 二次封装 - Promise.allSettled
 */
exports.promiseAllSettled = (data) => {
    if(!Array.isArray(data)) return Promise.resolve([]);
    if(data.some(item => typeof item?.then !== 'function')) return Promise.resolve([]);

    return Promise.allSettled(data).then((result) => {
        if (!Array.isArray(result)) return [];

        return result.map((item) => this.fnGetPromiseValue(item)) || [];
    });
}
