import request from '@/utils/request'


//增
export function terrainInsert(data) {
    return request({
        url: '/terrain_data/addTD',
        method: 'post',
        data: data,

    })
}

/**
 * 数据展示
 * @returns {*}
 */
export function terrainList() {
    return request({
        url: '/terrain_data/searchTD',
        method: 'post',
    })
}

/**
 * 搜索框查询
 * @param inputData
 * @returns {*}
 */
export function queryTerrainData(inputData) {
    return request({
        url: '/terrain_data/queryTD',  // 后端接口地址
        method: 'get',  // 使用 POST 方法
        params: {inputData}  // 如果没有传值，则为空字符串

    });
}

/**
 * 筛选
 * @param data
 * @returns {*}
 * @constructor
 */
export function terrainDataFilter(data) {
    return request({
        url: '/terrain_data/filterTD',
        method: 'post',
        data: data
    });
}

//改
export function terrainUpdate(data) {
    return request({
        url: '/terrain_data/updaTD',
        method: 'post',
        data: data
    })
}

//删
export function terrainRemoveById(query) {
    return request({
        url: '/terrain_data/removeTD',
        method: 'delete',
        params: query
    })
}
