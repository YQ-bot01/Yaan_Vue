import Polyline from "./Polyline";
import Polygon from "./Polygon";
import Point from "./Point"
import * as Cesium from 'cesium'
import Arrow from "@/cesium/drawArrow/drawPlot.js";
import {getPlotInfos} from "@/api/system/plot.js";
import plotCompute from "@/cesium/plot/plotCompute.js";
import {xp} from "@/cesium/drawArrow/algorithm.js";

let cesiumPlot= {
  viewer:null,
  ws:null,
  // 初始化viewer和ws
  init(viewer,ws,store) {
    this.viewer = viewer
    this.ws = ws
    this.store = store
    this.initDrawEdit();
  },
  // 初始化点线面对象
  initDrawEdit() {
    this.point = new Point(this.viewer,this.store)
    this.polyline = new Polyline(this.viewer,this.ws)
    this.polygon = new Polygon(this.viewer,this.ws)
  },

  //------------------------------点---------------------------------
  initPointHandler(pointType,img,eqid){
    return this.point.initPointHandlder(pointType,img,eqid)
  },

  drawPoint(pointInfo){
    this.point.drawPoint(pointInfo)
  },

  drawPoints(points,bool){
    this.point.drawPoints(points,bool)
  },

  // deletePoint(point){
  //   this.point.deletePoint(point)
  // },
  deletePointById(plotId){
    this.point.deletePointById(plotId)
  },
  deleteMakerById(plotId,drawtype,plotType){
    // console.log()
    if(drawtype==="point"){
      this.deletePointById(plotId)
    }
    else if(drawtype==="polyline"){
      getPlotInfos({plotId, plotType}).then(res => {
        for (let i = 0; i <res.plotInfo.geom.coordinates.length; i++) {
          viewer.entities.removeById(plotId + 'point' + (i + 1))
        }
      })
      viewer.entities.removeById(plotId)
    }
    else if(drawtype==="polygon"){
      window.viewer.entities.removeById(plotId)
    }
    else if (drawtype === "straight"||drawtype === "attack"||drawtype === "pincer") {
      Arrow.clearById(plotId)
    }
  },
  //----------------------------------------------------------------

  //------------------------------线---------------------------------
  drawActivatePolyline(type,img,eqid,obj) {
    let material = this.getMaterial(type,img)
    this.polyline.activate(material,type,img,eqid,obj)
  },
  deletePolyline(polyline){
    this.polyline.deletePolyline(polyline)
  },
  deletePolylineById(id){
    this.polyline.deletePolylineById(id)
  },
  getDrawPolyline(polylineArr){
    this.polyline.getDrawPolyline(polylineArr,this.getMaterial)
  },
  // 返回画线时的状态，0:未激活 1:绘制，不加这个条件会触发this.showPolyline,导致删除线按钮一直出现
  drawPolylineStatus() {
    return this.polyline.status
  },
  // 选择当前线的material
  getMaterial(type,img) {
    if(type==="量算"){
      let NORMALLINE = new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.CYAN,
        dashPattern: parseInt("110000001111", 1),
      })
      return NORMALLINE
    }
    if(type==="地裂缝"||type==="可用供水管网"||type==="不可用供水管网"){
      let PICTURELINE = new Cesium.ImageMaterialProperty({
        image: img,
        repeat: new Cesium.Cartesian2(3, 1),
      })
      return PICTURELINE
    }
    if(type==="可通行公路"||type==="限制通行公路"||type==="不可通行公路"){
      let color = null
      if(type==="可通行公路"){
        color = Cesium.Color.fromBytes(158,202,181)
      }else if(type==="限制通行公路"){
        color = Cesium.Color.fromBytes(206,184,157)
      }else{
        color = Cesium.Color.fromBytes(199,151,149)
      }
      let NORMALLINE = new Cesium.PolylineDashMaterialProperty({
        color: color,
        dashPattern: parseInt("110000001111", 1),
      })
      return NORMALLINE
    }
    if(type==="可通行铁路"||type==="不可通行铁路"){
      let gapColor
      if(type==="可通行铁路"){
        gapColor = Cesium.Color.BLACK
      }else {
        gapColor = Cesium.Color.RED
      }
      let DASHLINE= new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.WHITE,
        gapColor: gapColor,
        dashLength: 100
      })
      return DASHLINE
    }
    if(type==="可用输电线路"||type==="不可用输电线路"){
      let NORMALLINE = new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.CYAN,
        dashPattern: parseInt("110000001111", 1),
      })
      return NORMALLINE
    }
    if(type==="可用输气管线"||type==="不可用输气管线"){
      let NORMALLINE = new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.CYAN,
        dashPattern: parseInt("110000001111", 1),
      })
      return NORMALLINE
    }
  },
  //-----------------------------------------------------------------

  //------------------------------面---------------------------------
  drawActivatePolygon(type,img,eqid,obj) {
    let name = type
    if(type==="崩塌"||type==="滑坡"||type==="泥石流"||type==="地面塌陷"||type === "地面沉降"){
      type = "标绘面"
    }else if(type==="未搜索区域"||type==="已搜索区域"||type==="未营救区域"||type==="已营救区域"||type==="正在营救区域") {
      type = "区域面"
    }
    this.polygon.activate(name,type,img,eqid,obj)
  },
  drawPolygonStatus() {
    return this.polygon.status
  },
  deletePolygon(polygon){
    this.polygon.deletePolygon(polygon)
  },
  //根据数据库中绘制页面
  getDrawPolygon(polygonArr){
    this.polygon.getDrawActivatePolygon(polygonArr)
  },

  //----------------------------------------------------------------

  //箭头
  addArrow(item) {
    console.log(item)
    const items = Array.isArray(item) ? item : [item];
    items.forEach(onlyDrawIdItem => {
      console.log(onlyDrawIdItem,"addArrow timeline")
      if (onlyDrawIdItem.drawtype === 'straight') {
        this.addStraightArrow(onlyDrawIdItem)
      } else if (onlyDrawIdItem.drawtype === 'attack') {
        this.addAttackArrow(onlyDrawIdItem)
      } else {
        this.addPincerArrow(onlyDrawIdItem)
      }
    })
  },
  addStraightArrow(item) {
    if (window.viewer && window.viewer.entities) {
      let arrowPoints = []
      console.log(item,"item")
      console.log(item.geom.coordinates,"item.geom.coordinates")
      item.geom.coordinates.forEach(e => {
        arrowPoints.push(Cesium.Cartesian3.fromDegrees(parseFloat(e[0]), parseFloat(e[1]), parseFloat(0)))
      })
      var update = function () {
        if (arrowPoints.length < 2) {
          return null;
        }
        var p1 = arrowPoints[1];
        var p2 = arrowPoints[2];
        var firstPoint = plotCompute.cartesianToLatlng(p1);
        var endPoints = plotCompute.cartesianToLatlng(p2);
        var arrow = [];
        var res = xp.algorithm.fineArrow([firstPoint[0], firstPoint[1]], [endPoints[0], endPoints[1]]);
        var index = JSON.stringify(res).indexOf("null");
        if (index != -1) return [];
        for (var i = 0; i < res.length; i++) {
          var c3 = new Cesium.Cartesian3(res[i].x, res[i].y, res[i].z);
          arrow.push(c3);
        }
        return new Cesium.PolygonHierarchy(arrow);
      }
      if (!window.viewer.entities.getById(item.plotId)) {
        window.viewer.entities.add({
          drawtype:item.drawtype,
          id: item.plotId,
          polygon: new Cesium.PolygonGraphics({
            hierarchy: new Cesium.CallbackProperty(update, false),
            show: true,
            fill: true,
            material: Cesium.Color.BLUE  // 蓝色，透明度0.5
          }),
          properties: {
            data:item
          }
        })
      }

    }
  },
  addAttackArrow(item) {
    if (window.viewer && window.viewer.entities) {
      let arrowPoints = []
      item.geom.coordinates.forEach(e => {
        arrowPoints.push(Cesium.Cartesian3.fromDegrees(parseFloat(e[0]), parseFloat(e[1]), parseFloat(0)))
      })
      var update = function () {
        //计算面
        if (arrowPoints.length < 3) {
          return null;
        }
        var lnglatArr = [];
        for (var i = 0; i < arrowPoints.length; i++) {
          var lnglat = plotCompute.cartesianToLatlng(arrowPoints[i]);
          lnglatArr.push(lnglat)
        }
        var res = xp.algorithm.tailedAttackArrow(lnglatArr);
        var index = JSON.stringify(res.polygonalPoint).indexOf("null");
        var returnData = [];
        if (index == -1) returnData = res.polygonalPoint;
        return new Cesium.PolygonHierarchy(returnData);
      }
      if (!window.viewer.entities.getById(item.plotId)) {
        window.viewer.entities.add({
          id: item.plotId,
          drawtype:item.drawtype,
          polygon: new Cesium.PolygonGraphics({
            hierarchy: new Cesium.CallbackProperty(update, false),
            show: true,
            fill: true,
            material: Cesium.Color.RED
          }),
          properties: {
            data:item
          }
        })
      }

    }
  },
  addPincerArrow(item) {
    if (window.viewer && window.viewer.entities) {
      let arrowPoints = []
      item.geom.coordinates.forEach(e => {
        arrowPoints.push(Cesium.Cartesian3.fromDegrees(parseFloat(e[0]), parseFloat(e[1]), parseFloat(0)))
      })
      var update = function () {
        //计算面
        if (arrowPoints.length < 3) {
          return null;
        }
        var lnglatArr = [];
        for (var i = 0; i < arrowPoints.length; i++) {
          var lnglat = plotCompute.cartesianToLatlng(arrowPoints[i]);
          lnglatArr.push(lnglat)
        }
        var res = xp.algorithm.doubleArrow(lnglatArr);
        var returnData = [];
        var index = JSON.stringify(res.polygonalPoint).indexOf("null");
        if (index == -1) returnData = res.polygonalPoint;
        return new Cesium.PolygonHierarchy(returnData);
      }
      if (!window.viewer.entities.getById(item.plotId)) {
        window.viewer.entities.add({
          id: item.plotId,
          drawtype:item.drawtype,
          polygon: new Cesium.PolygonGraphics({
            hierarchy: new Cesium.CallbackProperty(update, false),
            show: true,
            fill: true,
            material: Cesium.Color.YELLOW
          }),
          properties: {
            data:item
          }
        })
      }

    }
  },
}
export default cesiumPlot;
