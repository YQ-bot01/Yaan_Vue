import * as Cesium from 'cesium'
import  {StraightArrow, AttackArrow, PincerArrow,} from "@/cesium/drawArrow/arrowClass.js";
import arrow from "@/cesium/drawArrow/drawPlot.js";
import cesiumPlot from "@/cesium/plot/cesiumPlot.js";
import {webSocketLocal} from "@/utils/server.js";

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

export function websocketonmessage(e) {
    message=e
    console.log("e",e)
    try {
        console.log("socketmessage",JSON.parse(e.data))
        let markType = JSON.parse(e.data).type
        let markOperate = JSON.parse(e.data).operate // 标绘的（add、delete）
        if (markOperate === "add") {
            if (this.eqid === JSON.parse(e.data).data.plot.earthquakeId) {
                let markData = JSON.parse(e.data).data
                wsAdd(markType, markData)
            }
        }
        else if (markOperate === "delete") {
            let id = JSON.parse(e.data).id
            console.log(id, 567)
            if (markType === "point") {
                // 其实只有这里有用
                console.log(5629)
                let polygonRemoved = window.viewer.entities.removeById(id);
                let pointDataRemoved = window.viewer.dataSources.getByName('pointData')[0].entities.removeById(id);

                const entityToRemove = window.pointDataSource.entities.getById(id);
                const entityToRemove_base = window.pointDataSource.entities.getById(id +"_base");
                console.log(polygonRemoved, pointDataRemoved);
                const entitylabel = window.labeldataSource.entities.getById(id + '_label');
                if (entitylabel) {
                    window.labeldataSource.entities.remove(entitylabel); // 移除点
                }
                window.viewer.entities.removeById(id)
                window.pointDataSource.entities.remove(entityToRemove); // 移除点
                window.viewer.entities.removeById(id + "_base")
                window.pointDataSource.entities.remove(entityToRemove_base); // 移除点

            } else if (markType === "polyline") {
                let polyline = window.viewer.entities.getById(id)
                let polylinePosition = polyline.properties.getValue(Cesium.JulianDate.now())//用getvalue时添加时间是不是用来当日志的？
                polylinePosition.pointPosition.forEach((item, index) => {
                    window.viewer.entities.remove(item)
                })
                window.viewer.entities.remove(polyline)
            } else if (markType === "polygon") {
                let polygon = window.viewer.entities.getById(id)
                console.log("1123",polygon)
                let polygonPosition = polygon.properties.getValue(Cesium.JulianDate.now())//用getvalue时添加时间是不是用来当日志的？
                polygonPosition.linePoint.forEach((item, index) => {
                    window.viewer.entities.remove(item)
                })
                window.viewer.entities.remove(polygon)
                window.viewer.entities.removeById(id + "_polygon")
            } else if(markType === "arrow"){
                console.log("arrow------------------")
                arrow.clearById(id)
                let polygonRemoved = window.viewer.entities.removeById(id);
                let pointDataRemoved = window.viewer.dataSources.getByName('pointData')[0].entities.removeById(id);

                console.log(polygonRemoved, pointDataRemoved);
            }
        }
    }
    catch (err) {
        console.log(err, 'ws中catch到错误');
    }
}

function wsAdd(type, data) {
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
        // cesiumPlot.drawPoints(points,true,3000);
        cesiumPlot.drawPoints(points,true);
    } else if (type === "polyline") {
        // 绘制所需的信息
        let points = data.plot.geom.coordinates
        let plotId = data.plot.plotId
        let elevation = data.plot.elevation
        let type = data.plot.plotType
        let img = data.plot.icon
        let plotType = data.plot.plotType
        // 构成线的所有实体点
        let pointLinePoints = []
        for (let i = 0; i < points.length; i++) {
            let p = window.viewer.entities.add({
                show: false,
                position: new Cesium.Cartesian3(points[i][0], points[i][1], elevation),
                id: plotId + 'point' + (i + 1),
                point: {
                    pixelSize: 1,
                    color: Cesium.Color.RED,
                    outlineWidth: 2,
                    outlineColor: Cesium.Color.DARKRED,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
                    depthTest: false,//禁止深度测试但是没有下面那句有用
                    disableDepthTestDistance: Number.POSITIVE_INFINITY//不再进行深度测试（真神）
                },
            });
            pointLinePoints.push(p)
        }
        let material = getMaterial(type, img)
        let linePostion = []
        let linedata = [{
            plotId: plotId,
            plotType: plotType,
            drawtype: "polyline",
        }]
        points.forEach(e => {
            // 线的positions需要数组里的点都是Cartesian3类型
            linePostion.push(Cesium.Cartesian3.fromDegrees(parseFloat(e[0]), parseFloat(e[1]), parseFloat(0)))
        })
        window.viewer.entities.add({
            id: plotId, //+ 'polyline',
            polyline: {
                positions: linePostion,
                width: 5,
                material: material,
                // material: Cesium.Color.YELLOW,
                depthFailMaterial: Cesium.Color.YELLOW,
                clampToGround: true,
            },
            properties: {
                pointPosition: pointLinePoints,
                data: linedata
            }
        })
    } else if (type === "polygon") {
        let polygonArr = [data.plot]
        cesiumPlot.getDrawPolygon(polygonArr);
    }else if(type === "arrow"){
        console.log(45678)

        // let positions = []
        // let arrowData = data.plot

        // for (let i = 0; i < arrowData.geom.coordinates.length; i++) {
        //     let cart3 = Cesium.Cartesian3.fromDegrees(arrowData.geom.coordinates[i][0], arrowData.geom.coordinates[i][1]);
        //     positions.push(cart3);
        // }
        if(data.plot.plotType==="攻击箭头"){
            arrow.showAttackArrow([data.plot])
        }else if(data.plot.plotType==="钳击箭头"){
            arrow.showPincerArrow([data.plot])
        }else if(data.plot.plotType==="直线箭头"){
            arrow.showStraightArrow([data.plot])
        }

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
