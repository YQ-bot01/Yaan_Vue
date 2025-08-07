import request from '@/utils/request'

export function getEmergency(query) {
    return request({
        url: '/emergencyResources/getEmergency',
        method: 'get',
        params: query
    })
}

export function getFeaturesLayer(query) {
    return request({
        url: '/emergencyResources/getFeaturesLayer',
        method: 'get',
        params: query
    })
}


export function suppliesReservesList() {
    return request({
        url: '/emergencyResources/suppliesReservesList',
        method: 'get',
    })
}

// ----应急物资储备---

export function reservesList() {
    return request({
        url: '/emergencyResources/reservesList',
        method: 'get',
    })
}


export function searchDisasterReserves(inputData) {
    return request({
        url: '/emergencyResources/searchDisasterReserves',
        method: 'post',
        params: {'inputData':inputData}
    })
}


export function addDisasterReserves(data) {
    return request({
        url: '/emergencyResources/addDisasterReserves',
        method: 'post',
        data: data
    })
}


export function updateDisasterReserves(data) {
    return request({
        url: '/emergencyResources/updateDisasterReserves',
        method: 'put',
        data: data
    })
}


/**
 * 删除功能
 * @param uuid
 * @returns {*}
 */
export function deleteDisasterReserves(uuid) {
    return request({
        url: `/emergencyResources/deleteDisasterReserves/${uuid}`,
        method: 'delete'
    });
}

//紧急联系人
export function unitContactList() {
    return request({
        url: '/unitContact/unitContactList',
        method: 'get',
    })
}
export function searchUnitContact(inputData) {
    return request({
        url: '/unitContact/searchUnitContact',
        method: 'post',
        params: {'inputData':inputData}
    })
}
export function deleteUnitContact(uuid) {
    return request({
        url:  `/unitContact/deleteUnitContact/${uuid}`,
        method: 'delete',
    })
}
export function addUnitContact(data) {
    return request({
        url: '/unitContact/addUnitContact',
        method: 'post',
        data: data
    })
}
export function updateUnitContact(data) {
    return request({
        url: '/unitContact/updateUnitContact',
        method: 'put',
        data: data
    })
}


//  -----------------------------------------------



// --------------避难场所---------------
export function sheltersList() {
    return request({
        url: '/emergencyResources/sheltersList',
        method: 'get',
    })
}


export function searchEmergencyShelters(inputData) {
    return request({
        url: '/emergencyResources/searchEmergencyShelters',
        method: 'post',
        params: {'inputData':inputData}
    })
}

//    避难场所页面--增加功能
export function addEmergencyShelters(data) {
    return request({
        url: '/emergencyResources/addEmergencyShelters',
        method: 'post',
        data: data
    })
}

//    避难场所页面--修改功能
export function updateEmergencyShelters(data) {
    return request({
        url: '/emergencyResources/updateEmergencyShelters',
        method: 'put',
        data: data
    })
}

//    避难场所页面--删除功能
export function deleteEmergencyShelters(uuid) {
    return request({
        url: `/emergencyResources/deleteEmergencyShelters/${uuid}`,
        method: 'delete'
    });
}


// -------------------------------------------------




// --------------应急救援队伍---------------
export function rescueTeamList() {
    return request({
        url: '/emergencyResources/rescueTeamList',
        method: 'get',
    })
}

export function searchEmergencyTeam(inputData) {
    return request({
        url: '/emergencyResources/searchEmergencyTeam',
        method: 'post',
        params: {'inputData':inputData}
    })
}

//救援队伍页面--增加功能
export function addEmergencyTeam(data) {
    return request({
        url: '/emergencyResources/addEmergencyTeam',
        method: 'post',
        data: data
    })
}

//救援队伍页面--修改功能
export function updateEmergencyTeam(data) {
    return request({
        url: '/emergencyResources/updateEmergencyTeam',
        method: 'put',
        data: data
    })
}

//救援队伍页面--删除功能
export function deleteEmergencyTeam(uuid) {
    return request({
        url: `/emergencyResources/deleteEmergencyTeam/${uuid}`,
        method: 'delete'
    });
}

//---------------------------------------

export function searchMaterialData(inputData) {
    return request({
        url: '/emergencyResources/searchMaterialData',
        method: 'post',
        data: inputData
    })
}

export function searchEmergencyTeamData(inputData) {
    return request({
        url: '/emergencyResources/searchEmergencyTeamData',
        method: 'post',
        data: inputData
    })
}


export function marchByRegion(regionCode) {
    return request({
        url: '/emergencyResources/marchByRegion',
        method: 'post',
        data: regionCode
    })
}
