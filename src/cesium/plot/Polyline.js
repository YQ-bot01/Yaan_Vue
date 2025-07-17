import * as Cesium from 'cesium'
import cesiumPlot from "@/cesium/plot/cesiumPlot.js";

export default class Polyline {
    constructor(viewer, ws) {
        this.viewer = viewer;
        this.index = 0
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.lineLength = 0;
        this.pointLinePoint = []
        this.status = 0;// 0:未激活 1:绘制
        this.drawEntity = undefined;
        this.positions = [];
        this.tempPositions = [];
        this.initId = null
        this.ws = ws
        this.material = null
        this.typeName = null
        this.img = null
        this.eqid = null
        this.resolve = null
        this.timestampArr = []
    }

    //激活
    activate(material, typeName, img, eqid, resolve) {
        this.resolve = resolve
        this.eqid = eqid
        this.img = img
        this.typeName = typeName
        this.material = material
        this.status = 1
        this.positions = [];
        this.tempPositions = [];
        this.deactivate();
        this.clear();
        // 创建Date对象
        let currentDate = new Date();
        // 获取当前时间的时间戳作为ID
        this.initId = this.guid();
        this.registerEvents(); //注册鼠标事件
    }

    //禁用
    deactivate() {
        this.unRegisterEvents();
        this.drawEntity = undefined;
        // this.typeName = null
    }

    //解除鼠标事件
    unRegisterEvents() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    //清空绘制
    clear() {
        if (this.drawEntity) {
            this.viewer.entities.remove(this.drawEntity);
            this.drawEntity = undefined;
        }
    }

    // 注册事件
    registerEvents() {
        this.leftClickEvent();
        this.rightClickEvent();
        this.mouseMoveEvent();
    }

    leftClickEvent() {
        let that = this
        this.handler.setInputAction(e => {
            // let position = this.viewer.scene.pickPosition(e.position);
            let ray = window.viewer.camera.getPickRay(e.position)
            let position = viewer.scene.globe.pick(ray, window.viewer.scene)
            that.index++
            that.positions.push(position);
            let p = that.createPoint(position)
            that.pointLinePoint.push(p)
            // 生成线上每个点的生成时间，用于situationplot中的time
            let timestampe = this.timestampToTime(new Date().getTime())
            that.timestampArr.push(timestampe)
            if (that.positions.length === 1) {
                that.generatePolyline();
            }
            // let distance = that.getSpaceDistance(that.positions)
            // if(this.typeName ==="量算"){
            //   document.getElementById("distanceLine").innerHTML = distance.toFixed(2)
            // }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    rightClickEvent() {
        window.document.oncontextmenu = function () {  // 阻止默认菜单弹出
            return false;
        }
        let that = this
        this.handler.setInputAction(e => {
            if (!that.drawEntity) {
                that.deactivate()
                return;
            }
            let tempPositions = that.tempPositions.slice(0, that.positions.length)
            that.drawEntity.polyline.positions = new Cesium.CallbackProperty(e => {
                return tempPositions;
            }, false)
            //两点成线
            that.minPositionCount = 2;
            if (that.positions.length < that.minPositionCount) {
                that.clear();
                that.deactivate();
                return;
            }
            that.index = 0
            that.drawEnd();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    mouseMoveEvent() {
        let that = this
        this.handler.setInputAction(e => {
            // that.viewer._element.style.cursor = 'default'; //由于鼠标移动时 Cesium会默认将鼠标样式修改为手柄 所以移动时手动设置回来
            // let position = this.viewer.scene.pickPosition(e.endPosition);
            let ray = window.viewer.camera.getPickRay(e.endPosition)
            let position = viewer.scene.globe.pick(ray, window.viewer.scene)
            if (!that.drawEntity) return;
            that.tempPositions = that.positions.concat([position]);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    //绘制结束 触发结束事件
    drawEnd() {
        let that = this
        let img = ""
        if (that.typeName === "地裂缝" || that.typeName === "可用供水管网" || that.typeName === "不可用供水管网") {
            img = this.img
        }

        let data = {
            timestampArr: this.timestampArr,
            pointPosArr: this.positions,
            plotId: this.initId,
            plotType: this.typeName
        }
        // console.log("绘制结束后组装的数据",data)
        this.resolve(data)
        // this.ws.send(JSON.stringify({
        //   type: "polyline",
        //   operate: "add",
        //   data: {
        //     id: that.initId,
        //     type:that.typeName,
        //     positions: that.positions,
        //     img: img,
        //     eqid: that.eqid
        //   }
        // }))
        this.status = 0
        this.pointLinePoint = []
        this.drawEntity.remove = () => {
            this.viewer.entities.remove(this.drawEntity);
        }
        this.timestampArr = []
        this.deactivate();
    }

    createPoint(position) {
        let that = this
        this.lineLength = this.getSpaceDistance(this.positions)
        return this.viewer.entities.add({
            show: false,
            position: position,
            id: that.guid(),
            point: {
                pixelSize: 1,
                color: Cesium.Color.RED,
                // outlineWidth: 0,
                // outlineColor: Cesium.Color.DARKRED,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
                depthTest: false,//禁止深度测试但是没有下面那句有用
                disableDepthTestDistance: Number.POSITIVE_INFINITY//不再进行深度测试（真神）
            },
            // show: true
        });
    }

    noNo(data) {
        let situationPlotData = []// situationplot表中的线数据
        let plotItem = {
            // eqid: that.eqid,
            plotId: data.plotId,
            // time: data.timestampArr[i],
            plotType: data.plotType,
            drawtype: "polyline",
            // img:item.img,
            // latitude,
            // longitude,
            // height,
        }
        situationPlotData.push(plotItem)
        return situationPlotData
    }

    generatePolyline() {
        let that = this
        let data = this.noNo({
            timestampArr: this.timestampArr,
            pointPosArr: this.positions,
            plotId: this.initId,
            plotType: this.typeName
        })
        this.drawEntity = this.viewer.entities.add({
            id: this.initId,
            polyline: {
                positions: new Cesium.CallbackProperty(e => {
                    if (that.typeName === "地裂缝" || that.typeName === "可用供水管网" || that.typeName === "不可用供水管网") {
                        let length = that.lineLength
                        if (length === 0) {
                            this.drawEntity.polyline.material.repeat._value.x = 3
                        } else {
                            this.drawEntity.polyline.material.repeat._value.x = length / 100
                        }
                    }
                    return this.tempPositions;
                }, false),
                width: 10,
                material: this.material,
                // material: new Cesium.ImageMaterialProperty({
                //   image: pic,
                //   /*
                //   * repeat属性跟new Cesium.CallbackProperty(e=>{}）结合使用会有一个坑，
                //   * Cesium.CallbackProperty会无限执行，原因不明，很神奇，
                //   * 当绘制完一个线，再绘制第二个线时，第二个线的repeat改变会影响第一个线的repeat，
                //   * 因为let length = that.lineLength(下面注释代码)，画第二条线时，第一条线中的length跟着第二条线的that.lineLength变，
                //   * 所以这里repeat设置一个初始值，在positions的CallbackProperty里修改。
                //   * */
                //   repeat: new Cesium.Cartesian2(3, 1),
                // }),
                //
                // material: new Cesium.ImageMaterialProperty({
                //   image: pic,
                //   repeat: new Cesium.CallbackProperty(e => {// 图片重复次数
                //     console.log("无限")
                //     let length = that.lineLength
                //     if (length === 0) {
                //       return new Cesium.Cartesian2(5, 1)
                //     } else {
                //       return new Cesium.Cartesian2(length / 100.0, 1);
                //     }
                //   }, false),
                // }),
                // 自定义的img
                // material:new Cesium.ImageLineMaterialProperty({
                //   image:pic
                // }),
                // 箭头
                // material: new Cesium.PolylineArrowMaterialProperty(
                // 	Cesium.Color.PURPLE
                // ),
                // 间隔线，可以自定一间隔根据1和0
                // material: new Cesium.PolylineDashMaterialProperty({
                //   color: Cesium.Color.CYAN,
                //   dashPattern: parseInt("110000001111", 2),
                // }),
                depthFailMaterial: Cesium.Color.YELLOW,
                clampToGround: true,
            },
            properties: {
                pointPosition: that.pointLinePoint,
                data
            }
        })

//     let startTime = Date.now();
//     let duration = 10000;  // 动画持续时间为10秒
//     let isBlurred = false;  // 初始状态是清晰的
//
// // 动态修改线的模糊和清晰状态
//     let animation = () => {
//       let currentTime = Date.now();
//       let elapsedTime = currentTime - startTime;
//
//       // 计算动画进度（0到1之间）
//       let progress = (elapsedTime % duration) / duration;
//
//       // 根据进度计算模糊程度
//       if (progress < 0.5) {
//         // 前5秒，线变模糊
//         this.drawEntity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
//           glowPower: 0.5 * progress,  // 增加模糊程度
//           color: Cesium.Color.WHITE.withAlpha(1.0 - progress)  // 逐渐变得透明
//         });
//         isBlurred = true;
//       } else {
//         // 后5秒，线变清晰
//         this.drawEntity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
//           glowPower: 0.5 * (1 - progress),  // 减少模糊程度
//           color: Cesium.Color.WHITE.withAlpha(progress)  // 逐渐恢复透明度
//         });
//         isBlurred = false;
//       }
//
//       // 继续执行动画
//       if (elapsedTime < duration) {
//         requestAnimationFrame(animation);
//       } else {
//         // 动画结束，重置材质为初始状态（不变的材质）
//         this.drawEntity.polyline.material = this.material;
//       }
//     };
//
// // 开始动画
//     animation();
    }

    // 空间两点距离计算函数
    getSpaceDistance(positions) {
        let lengthAll = 0;
        for (let i = 0; i < positions.length - 1; i++) {
            // 1.将起点与终点位置信息从笛卡尔坐标形式转换为Cartographic形式
            const point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
            const point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
            // 2.设置测地线起点和终点，EllipsoidGeodesic中setEndPoints常与surfaceDistance搭配使用
            const geodesic = new Cesium.EllipsoidGeodesic();
            geodesic.setEndPoints(point1cartographic, point2cartographic);
            // 3. 得到空间中点投影到地球表面的曲面距离
            let s = geodesic.surfaceDistance; // surfaceDistance返回number 单位为m，带小数
            // 4. 考虑两点的高度 利用直角三角形求斜边来求实际距离
            s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
            // 5.每段距离求和
            lengthAll += s
        }
        console.log("量算-----结果2：", lengthAll)
        return lengthAll
    }

    // 删除线图层
    deletePolyline(polyline) {
        // this.ws.send(JSON.stringify({
        //     type: "polyline",
        //     operate: "delete",
        //     id: polyline.id
        // }))
        let polylinePosition = polyline.properties.getValue(Cesium.JulianDate.now())//用getvalue时添加时间是不是用来当日志的？
        polylinePosition.pointPosition.forEach((item, index) => {
            window.viewer.entities.remove(item)
        })
        window.viewer.entities.remove(polyline)
    }
    deletePolylineById(id){
        let polyline =window.viewer.entities.getById(id)
        this.deletePolyline(polyline)
    }
    // 根据数据库中数据绘制线
    getDrawPolyline(polylineArr, getmaterial) {
        // 1-1 根据线的drawid记录有多少条线
        let onlyDrawId = this.distinguishPolylineId(polylineArr)

        // 1-2根据drawid来画线
        onlyDrawId.forEach(onlyDrawIdItem => {
                // 1-3 把数据库同一drawid的点数据放入此数组
                let line = []
                polylineArr.forEach(polylineElement => {
                    if (polylineElement.plotId === onlyDrawIdItem) {
                        line.push(polylineElement)
                    }
                })
                // 1-4 pointLinePoints用来存构成线的点实体
                let pointLinePoints = []
                for (let i = 0; i < line[0].geom.coordinates.length; i++) {
                    let coords = line[0].geom.coordinates[i]
                    let p = window.viewer.entities.add({
                        show: false,
                        position: new Cesium.Cartesian3(coords[0], coords[1], line[0].elevation),
                        // id: line[0].plotId + 'point' + (i + 1),
                        point: {
                            pixelSize: 0,
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
                // 1-5 把数据库同一drawid的点数据转化成Cartesian3类型的数组
                let positionsArr = []
                line[0].geom.coordinates.forEach(e => {
                    // console.log("e",e)
                    // 线的positions需要数组里的点都是Cartesian3类型
                    positionsArr.push(Cesium.Cartesian3.fromDegrees(parseFloat(e[0]), parseFloat(e[1]), parseFloat(0)))
                })
                let material = getmaterial(line[0].plotType, import.meta.env.VITE_APP_BASE_API + '/uploads/PlotsPic/' + line[0].icon + '.png?t=' + new Date().getTime())
                // 1-6 画线
                window.viewer.entities.add({
                    id: onlyDrawIdItem,
                    plottype: line[0].plotType,
                    layer: "标绘点",
                    polyline: {
                        positions: positionsArr,
                        width: 5,
                        material: material,
                        // material: Cesium.Color.YELLOW,
                        // depthFailMaterial: Cesium.Color.YELLOW,
                        clampToGround: true,
                    },
                    properties: {
                        data: line,
                    }
                })
            }
        )
    }

    // 在重复的drwaid中获取所有线的唯一drwaid
    distinguishPolylineId(polylineArr) {
        let PolylineIdArr = []
        polylineArr.forEach(element => {
            if (!PolylineIdArr.includes(element.plotId)) {
                PolylineIdArr.push(element.plotId)
            }
        })
        return PolylineIdArr
    }

    guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    timestampToTime(timestamp) {
        let DateObj = new Date(timestamp)
        // 将时间转换为 XX年XX月XX日XX时XX分XX秒格式
        let year = DateObj.getFullYear()
        let month = DateObj.getMonth() + 1
        let day = DateObj.getDate()
        let hh = DateObj.getHours()
        let mm = DateObj.getMinutes()
        let ss = DateObj.getSeconds()
        month = month > 9 ? month : '0' + month
        day = day > 9 ? day : '0' + day
        hh = hh > 9 ? hh : '0' + hh
        mm = mm > 9 ? mm : '0' + mm
        ss = ss > 9 ? ss : '0' + ss
        // return `${year}年${month}月${day}日${hh}时${mm}分${ss}秒`
        return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
    }
}
