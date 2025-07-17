import * as Cesium from 'cesium'
import  {StraightArrow, AttackArrow, PincerArrow,} from "@/cesium/drawArrow/arrowClass.js";
import arrow from "@/cesium/drawArrow/drawPlot.js";
import cesiumPlot from "@/cesium/plot/cesiumPlot.js";
import {webSocketLocal} from "@/utils/server.js";
import timeLine from "@/cesium/timeLine.js";

let webSocket
let ip = `ws://${webSocketLocal}/ws/`
// let ip = "ws://192.168.113.1:81/ws/"
let message=''
// import cesiumPlot from '@/cesium/plot/cesiumPlot'
export function initWebSocket(eqid) {
    const wsuri = ip + eqid;
    if (typeof (WebSocket) == "undefined") {
        console.log("您的浏览器不支持WebSocket");
    } else {
        webSocket = new WebSocket(wsuri);
        // webSocket.onmessage = websocketonmessage;
        webSocket.onopen = websocketonopen;
        webSocket.onerror = websocketonerror;
        webSocket.onclose = websocketclose;
        webSocket.eqid = eqid
       // webSocket.message=e
    }
    return webSocket
}

//连接建立之后执行send方法发送数据
function websocketonopen() {
    let actions = {"test": "我已在线"};
    webSocket.send(JSON.stringify(actions));
}

//连接建立失败重连
function websocketonerror() {
    initWebSocket();
}

//关闭
function websocketclose(e) {
    console.log('断开连接', e);
}

export function wsAdd(type, data) {
    if (type === "point") {
        let points = [];
        let point = {
            earthquakeId: data.plot.earthquakeId,
            plotId: data.plot.plotId,
            time: data.plot.creationTime.replace("T", " "),
            plotType: data.plot.plotType,
            drawtype: data.plot.drawtype,
            latitude: Number(data.plot.geom.coordinates[1]),
            longitude: Number(data.plot.geom.coordinates[0]),
            height: Number(data.plot.elevation),
            icon:  data.plot.icon
        };
        points.push(point); // 收集点数据
        cesiumPlot.drawPoints(points,true);
    }
    else if (type === "polyline") {
        cesiumPlot.getDrawPolyline([data.plot]);
    }
    else if (type === "polygon") {
        cesiumPlot.getDrawPolygon( [data.plot]);
    }else if(type === "arrow"){
        cesiumPlot.addArrow(Array.from([data.plot]))
    }
}

// 选择当前线的material
function getMaterial(type, img) {
    if (type === "量算") {
        let NORMALLINE = new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.CYAN,
            dashPattern: parseInt("110000001111", 1),
        })
        return NORMALLINE
    }
    if (type === "地裂缝" || type === "可用供水管网" || type === "不可用供水管网") {
        let PICTURELINE = new Cesium.ImageMaterialProperty({
            image: img,
            repeat: new Cesium.Cartesian2(3, 1),
        })
        return PICTURELINE
    }
    if (type === "可通行公路" || type === "限制通行公路" || type === "不可通行公路") {
        let color = null
        if (type === "可通行公路") {
            color = Cesium.Color.fromBytes(158, 202, 181)
        } else if (type === "限制通行公路") {
            color = Cesium.Color.fromBytes(206, 184, 157)
        } else {
            color = Cesium.Color.fromBytes(199, 151, 149)
        }
        let NORMALLINE = new Cesium.PolylineDashMaterialProperty({
            color: color,
            dashPattern: parseInt("110000001111", 1),
        })
        return NORMALLINE
    }
    if (type === "可通行铁路" || type === "不可通行铁路") {
        let gapColor
        if (type === "可通行铁路") {
            gapColor = Cesium.Color.BLACK
        } else {
            gapColor = Cesium.Color.RED
        }
        let DASHLINE = new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.WHITE,
            gapColor: gapColor,
            dashLength: 100
        })
        return DASHLINE
    }
    if (type === "可用输电线路" || type === "不可用输电线路") {
        let NORMALLINE = new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.CYAN,
            dashPattern: parseInt("110000001111", 1),
        })
        return NORMALLINE
    }
    if (type === "可用输气管线" || type === "不可用输气管线") {
        let NORMALLINE = new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.CYAN,
            dashPattern: parseInt("110000001111", 1),
        })
        return NORMALLINE
    }
}

function distinguishPolygonId(polygonArr) {
    let polygonIdArr = []
    polygonArr.forEach(element => {
        if (!polygonIdArr.includes(element.plotId)) {
            polygonIdArr.push(element.plotId)
        }
    })
    // console.log("数据库",polygonIdArr)
    return polygonIdArr
}
