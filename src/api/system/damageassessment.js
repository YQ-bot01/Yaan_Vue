import request from '@/utils/request'

export function getEqTownResult(eqTownResultDTO) {
    return request({
        url: '/tp/api/open/eq/assessment',
        method: 'get',
        params: eqTownResultDTO
    })
}

export function getEqList(eqListDTO) {
    return request({
        url: '/tp/api/open/eq/list',
        method: 'get',
        params: eqListDTO
    })
}

export function getEqOutputReport(eqOutputReportDTO) {
  return request({
    url: '/tp/api/open/eq/output/report',
    method: 'get',

    params: eqOutputReportDTO
  })
}

export function getEqOutputMap(eqOutputMapDTO) {
    return request({
        url: '/tp/api/open/eq/output/map',
        method: 'get',
        params: eqOutputMapDTO
    })
}
export function getEqOutPutJueCe(eqOutputJueCeDTO) {
    return request({
        url: '/tp/api/open/eq/output/juece',
        method: 'get',
        params: eqOutputJueCeDTO
    })
}
export function getEqOutPutJueCeLocal(eqOutputJueCeDTO) {
    return request({
        url: '/tp/api/open/eq/output/jueceLocal',
        method: 'get',
        params: eqOutputJueCeDTO
    })
}

export function getEqOutputMaps(eqId,eqqueueId) {
    return request({
        url: '/tp/api/open/eq/map/start',
        method: 'get',
        params: { eqId, eqqueueId}
    })
}

export function getEqOutputReports(eqId,eqqueueId) {
    return request({
        url: '/tp/api/open/eq/report/start',
        method: 'get',
        params: { eqId, eqqueueId}
    })
}
export function getEqOutPutJueCes(eqId,eqqueueId) {
    return request({
        url: '/tp/api/open/eq/juece/start',
        method: 'get',
        params: { eqId, eqqueueId}
    })
}

export function getPersonDes(eqid) {
    return request({
        url: '/damageassessment/getPersonDes',
        method: 'post',
        data: eqid
        // params:{id:eqId}
    })
}
export function saveIntensityCircle(savecircles){
    return request({
        url: '/damageassessment/saveIntensityCircle',
        method: 'post',
        data: savecircles
    })
}

export function getBuildingDamage(eqid){
  return request({
    url: '/damageassessment/getBuildingDamageByEqid',
    method: 'get',
    params: { eqid }
  })
}

export function getEconomicLoss(eqid){
  return request({
    url: '/damageassessment/getEconomicLossByEqid',
    method: 'get',
    params: { eqid }
  })
}

export function saveBuildingDamageData(saveBuildingDamage){
  return request({
    url: '/damageassessment/saveBuildingDamage',
    method: 'post',
    data: saveBuildingDamage
  })
}

export function saveEconomicLossData(saveEconomicLoss){
  return request({
    url: '/damageassessment/saveEconomicLoss',
    method: 'post',
    data: saveEconomicLoss
  })
}

export function getDA(type, EqEventGetResultTownDTO){
  return request({
    url: '/damageassessment/getDA',
    method: 'post',
    data: EqEventGetResultTownDTO,
    params: { type }
  })
}
