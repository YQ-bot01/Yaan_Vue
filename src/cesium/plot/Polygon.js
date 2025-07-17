import * as Cesium from 'cesium'
import plotCompute from "@/cesium/plot/plotCompute.js";

export default class Polygon {
    constructor(viewer, ws) {
        this.popupVisiblePolygon = false
        this.viewer = viewer
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.polygonEntity = null
        this.positions = [];
        this.status = 0;// 0:未激活 1:绘制
        this.lastItem = 0
        this.initId = null
        this.ws = ws;
        this.eqid = null;
        this.resolve = null;
        this.polygonPointEntity = [];
        this.isDragging = false;
        this.draggedPointIndex = -1;
        this.draggedPoint = null; // 当前拖拽的点
        this.vertexHandlers = []; // 存储每个顶点的事件处理器
        this.type = null; // 新增属性，用于存储类型
        this.angle = 0;
        this.centerPoint = null;
        this.afterDraggedPoint = null;
        this.beforeDraggedPoint = null;
        //===========下面是下面的属性用于将面整体拖拽与点拖拽转换的逻辑===========
        this.selectPoint = null;
        //===========绘制区域面的代码================
        this._dataSource = null; //存储entities
        this._tempPositions = []; //存储点集合
        this._mousePos = null; //移动点
        this._drawType = null; //类型
        // 定义全局变量
        window.isDrawingPolygon = false;
        //=======================小多边形的中心点===============
        this.center = [];
    }

    //激活
    activate(name, type, img, eqid, resolve) {
        this.resolve = resolve
        this.name = name;//记录类型
        this.eqid = eqid
        let currentDate = new Date();
        this.time = this.timestampToTime(currentDate.getTime());
        // 获取当前时间的时间戳作为ID
        this.initId = this.guid();
        this.lastItem = 0;
        this.status = 1
        this.isDragging = false;
        this.draggedPointIndex = -1;
        this.positions = [];
        // this.isEditing = false;
        // this.entityCount = 0;
        this.type = type;
        this.img = import.meta.env.VITE_APP_BASE_API + '/uploads/PlotsPic/' + img + '.png';
        this.plotType = img
        this._dataSource = new Cesium.CustomDataSource("_dataSource");
        this.viewer.dataSources.add(this._dataSource);
        this.deactivate()
        this.clear();
        this.registerEvents();
    }

    //禁用
    deactivate() {
        this.unRegisterEvents();
        this.polygonEntity = undefined;
        // this.typeName = null
    }

    //解除鼠标事件
    unRegisterEvents() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    //清空绘制
    clear() {
        if (this._dataSource) {
            // 删除整个数据源
            this.viewer.dataSources.remove(this._dataSource);
        }
        if (this.polygonEntity) {
            this.viewer.entities.remove(this.polygonEntity);
            this.polygonEntity = undefined;
        }
    }

    /*注册事件*/
    registerEvents() {
        this._leftClickEventForPolygon();
        this._mouseMoveEventForPolygon();
        this._rightClickEventForPolygon();
    }

    /*小矩形注册事件步骤*/
    smallPolygonRegisterEvents() {
        this._leftClickEventForSmallPolygon();
        this._mouseMoveEventForSmallPolygon()
        this._rightClickEventForSmallPolygon()
        this._leftUpClickEventForSmallPolygon()
    }

//绘制结束 触发结束事件
    drawEnd() {
        console.log("皆大欢喜")
        console.log(this.type)
        let data = {
            timestampArr: this.timestampArr,
            pointPosArr: this._tempPositions,
            plotId: this.initId,
            time: this.time,
            angle: this.angle,
            icon: this.plotType,//先改成plotType,可以看上面的定义的变量
            earthquakeId: this.eqid,
            plotType: this.name
        }
        this.resolve(data)
        console.log("皆大欢喜", data)
        this.viewer.entities.remove(this.polygonEntity);
        window.viewer.dataSources.remove(window.viewer.dataSources.getByName('_dataSource')[0])
        this.polygonPointEntity = [],
            this.type = null;
        this.afterDraggedPoint = null
        this._tempPositions = []
        this.status = 0
        this.timestampArr = []
        this.deactivate();
        this.center = []
        this.enableCameraControls()
    }

    //-----------------绘制区域面-----------------
    /**
     * 鼠标事件之绘制面的左击事件
     * @private
     */
    _leftClickEventForPolygon() {
        this.handler.setInputAction((e) => {
            window.isDrawingPolygon = true;  // 启用标志位
            let ray = viewer.camera.getPickRay(e.position)
            let p = viewer.scene.globe.pick(ray, viewer.scene)
            // console.log("p",p)
            if (!p) return;
            // 检查新点是否与最后一个点重复
            if (this._tempPositions.length > 0) {
                let lastPoint = this._tempPositions[this._tempPositions.length - 1];
                if (Cesium.Cartesian3.equals(p, lastPoint)) {
                    console.log('点重复，忽略此次点击');
                    return;
                }
            }
            // console.log("this._tempPositions",this._tempPositions)
            this._tempPositions.push(p);
            // 获取大多边形的中心点
            this.center = plotCompute.getPolygonCenter(this._tempPositions);
            this._addPolygon();
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    /**
     * 鼠标事件之绘制面的移动事件
     * @private
     */
    _mouseMoveEventForPolygon() {
        this.handler.setInputAction((e) => {
            let ray = viewer.camera.getPickRay(e.endPosition)
            let p = viewer.scene.globe.pick(ray, viewer.scene)
            if (!p) return;
            this._mousePos = p;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    /**
     * 鼠标事件之绘制面的右击事件
     * @private
     */
    _rightClickEventForPolygon() {
        // 阻止默认的右键菜单
        window.document.oncontextmenu = function () {  // 阻止默认菜单弹出
            return false;
        }
        this.handler.setInputAction((e) => {
            // 检查点的数量
            if (this._tempPositions.length < 3) {
                return;  // 阻止绘制结束
            }
            let ray = viewer.camera.getPickRay(e.position)
            let p = viewer.scene.globe.pick(ray, viewer.scene)
            if (!p) return;
            this._tempPositions.push(this._tempPositions[0]);
            this.unRegisterEvents();
            this._dataSource.entities.removeAll();
            this.imgMaterial = new Cesium.ImageMaterialProperty({
                image: this.img,
                repeat: new Cesium.Cartesian2(1, 1), // 控制图片在多边形内的重复次数
                rotation: Cesium.Math.toRadians(45), // 旋转角度，例如 45 度，根据需要调整方向
                color: Cesium.Color.WHITE.withAlpha(0.7) // 控制透明度
            });
            this._dataSource.entities.add({
                id: this.initId,
                polyline: {
                    positions: this._tempPositions,
                    clampToGround: true, //贴地
                    width: 3,
                    material: new Cesium.PolylineDashMaterialProperty({
                        color: Cesium.Color.YELLOW,
                    }),
                    depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
                        color: Cesium.Color.YELLOW,
                    }),
                },
                // polygon: {
                //   hierarchy: this._tempPositions,
                //   extrudedHeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                //   // material: Cesium.Color.RED.withAlpha(0.4),
                //   // material: this.imgMaterial,
                //   clampToGround: true,
                // },
            });
            switch (this.type) {
                case  "标绘面": {
                    this.smallPolygonRegisterEvents();
                    break;
                }
                case "区域面": {
                    this.drawEnd();
                    break;
                }
            }

            // this.unRegisterEvents();

        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }


    /**
     * 鼠标事件之绘制小多边形的左键点击下事件
     * @private
     */
    _leftUpClickEventForSmallPolygon() {
        if (!this.polygonEntity) {
            this.drawSquare(this.center);
        }
        //取消左键点击事件防止产生新的多边形
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction((e) => {
            console.log("已经在路上")
            // 检查是否点击的是多边形点实体
            if (this.draggedPoint && this.polygonPointEntity.includes(this.draggedPoint)) {
                this.draggedPointIndex = -1;
                this.dynamicSmallRotation(this.draggedPoint._id, this.afterDraggedPoint);
                console.log("旋转");
            }
            this.draggedPoint = null;
            this.selectPoint = null;
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }

    /**
     * 鼠标事件之绘制小多边形的左键点击下事件
     * @private
     */
    _mouseMoveEventForSmallPolygon(movement) {
        this.handler.setInputAction((movement) => {
            console.log("5")
            let ray = this.viewer.camera.getPickRay(movement.endPosition);
            let position = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            if (position) {
                this.positions[this.draggedPointIndex] = position;
                this.updatePointPosition(this.draggedPointIndex, position);

                if (this.positions.length > 2) {
                    this.drawPolygon();
                }
                this.afterDraggedPoint = position;
                // this.updateEntityCount();
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    /**
     * 鼠标事件之绘制小多边形的左键点击下事件
     * @private
     */
    _rightClickEventForSmallPolygon() {
        this.handler.setInputAction((e) => {
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            this.enableVertexDragging();
            this.handler.setInputAction((e) => this.drawEnd(), Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    /**
     * 鼠标事件之绘制小多边形的左键点击下事件
     * @private
     */
    _leftClickEventForSmallPolygon() {
        this.handler.setInputAction((click) => {
            let ray = this.viewer.camera.getPickRay(click.position);
            let position = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            if (position) {
                this.centerPoint = null;
                this.centerPoint = position;
                this.beforeDraggedPoint = null;
                this.afterDraggedPoint = null;
                // 移除现有的正方形和相关点实体
                this.viewer.entities.remove(this.polygonEntity);
                this.polygonEntity = null;
                this.polygonPointEntity.forEach(pointEntity => {
                    this.viewer.entities.remove(pointEntity);
                });
                this.polygonPointEntity = [];
                this.positions = [];
                // 绘制新的正方形
                this.drawSquare(position);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    /**
     * 画面
     * @private
     */
    _addPolygon() {
        if (this._tempPositions.length == 1) {
            this.imgMaterial = new Cesium.ImageMaterialProperty({
                image: this.img,
                repeat: new Cesium.Cartesian2(1, 1), // 控制图片在多边形内的重复次数
                rotation: Cesium.Math.toRadians(45), // 旋转角度，例如 45 度，根据需要调整方向
                color: Cesium.Color.WHITE.withAlpha(0.7) // 控制透明度
            });
            //一个顶点+移动点
            this._dataSource.entities.add({
                id: this.initId,
                polyline: {
                    positions: new Cesium.CallbackProperty(() => {
                        let c = Array.from(this._tempPositions);
                        if (this._mousePos) {
                            c.push(this._mousePos);
                        }
                        return c;
                    }, false),
                    clampToGround: true, //贴地
                    width: 3,
                    material: this.imgMaterial,
                    // depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
                    //   color: Cesium.Color.YELLOW,
                    // }),
                    depthFailMaterial: this.imgMaterial,
                },
            });
        } else {
            this._dataSource.entities.removeAll();
            this.imgMaterial = new Cesium.ImageMaterialProperty({
                image: this.img,
            });
            //两个顶点+移动点
            this._dataSource.entities.add({
                id: this.initId,
                polygon: {
                    hierarchy: new Cesium.CallbackProperty(() => {
                        let poss = Array.from(this._tempPositions);
                        if (this._mousePos) {
                            poss.push(this._mousePos);
                        }
                        return new Cesium.PolygonHierarchy(poss);
                    }, false),
                    extrudedHeightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    material: this.imgMaterial,
                    depthTest: false,//禁止深度测试但是没有下面那句有用
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,//不再进行深度测试（真神）
                    clampToGround: true,
                },
                polyline: {
                    positions: new Cesium.CallbackProperty(() => {
                        let c = Array.from(this._tempPositions);
                        if (this._mousePos) {
                            c.push(this._mousePos);
                            c.push(c[0]); //与第一个点相连
                        }
                        return c;
                    }, false),
                    clampToGround: true, //贴地
                    width: 3,
                    material: new Cesium.PolylineDashMaterialProperty({
                        color: Cesium.Color.YELLOW,
                    }),
                    depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
                        color: Cesium.Color.YELLOW,
                    }),
                },
            });
        }
    }

    // 删除面
    deletePolygon(polygon) {
        this.angle = 0;
        this.positions = [];
        this.polygonPointEntity = [];
        this.polygonEntity = null
        // 向 WebSocket 发送删除多边形的消息
        // this.ws.send(JSON.stringify({
        //   type: "polygon",
        //   operate: "delete",
        //   id: polygon.id
        // }));

        // 获取多边形的顶点坐标
        let polygonPosition = polygon.properties.pointPosition;

        // 移除多边形的顶点和多边形本身
        polygonPosition.forEach((position) => {
            let pointEntity = this.viewer.entities.getById(position.id);
            if (pointEntity) {
                this.viewer.entities.remove(pointEntity);
            }
        });
        this.viewer.entities.remove(polygon);
    }

    //=======================绘制数据库中的面==================
    // 根据数据库中数据绘制面
    getDrawActivatePolygon(polygonArr) {

        // console.log(polygonArr,765645)
        // 1-1 根据面的Plotid记录有多少个面
        let onlyPlotid = this.distinguishPolygonId(polygonArr)

        // console.log("onlyPlotid",polygonArr)
        if (polygonArr[0].plotType === "未搜索区域" || polygonArr[0].plotType === "已搜索区域" || polygonArr[0].plotType === "已营救区域" || polygonArr[0].plotType === "正在营救区域" || polygonArr[0].plotType === "未营救区域") {
            onlyPlotid.forEach(onlyPlotidItem => {
                // 1-3 把数据库同一Plotid的点数据放入此数组
                let polygon = []
                polygonArr.forEach(polygonElement => {
                    if (polygonElement.plotId === onlyPlotidItem) {
                        polygon.push(polygonElement)
                    }
                })
                // 1-4 pointLinePoints用来存构成面的点实体
                let pointLinePoints = []
                let coords = polygon[0].geom.coordinates[0]
                // console.log("coords",coords)
                for (let i = 0; i < coords.length; i++) {
                    let polygonCoords = coords[i]

                    // 转换为Cartesian3坐标
                    let cartographic = Cesium.Cartographic.fromDegrees(
                        parseFloat(polygonCoords[0]),
                        parseFloat(polygonCoords[1]),
                        parseFloat(0)
                    );
                    let cartesian = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);
                    pointLinePoints.push(cartesian);
                    if (!this.viewer.entities.getById(onlyPlotidItem)) {
                        window.viewer.entities.add({
                            id: onlyPlotidItem,
                            layer: "标绘点",
                            polygon: {
                                hierarchy: new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(pointLinePoints), false),
                                material: import.meta.env.VITE_APP_BASE_API + '/uploads/PlotsPic/' + polygon[0].icon + '.png?t=' + new Date().getTime(),
                                // stRotation: Cesium.Math.toRadians(polygon[0].angle),
                                clampToGround: true,
                            },
                            properties: {
                                pointPosition: this.positions,
                                linePoint: this.polygonPointEntity,
                                data: polygon, //弹出框
                                plotType: polygonArr[0].plotType
                            }
                        });
                    }
                }
            })
        } else {
            // 1-2根据Plotid来画面
            onlyPlotid.forEach(onlyPlotidItem => {
                if (!window.viewer.entities.getById(onlyPlotidItem + "_polygon") && !window.viewer.entities.getById(onlyPlotidItem)) {
                    let polygon = []
                    polygonArr.forEach(polygonElement => {
                        if (polygonElement.plotId === onlyPlotidItem) {
                            polygon.push(polygonElement)
                        }
                    })
                    // 1-4 pointLinePoints用来存构成面的点实体
                    let pointLinePoints = []
                    let coords = polygon[0].geom.coordinates[0]
                    // console.log("coords",coords)
                    for (let i = 0; i < coords.length; i++) {
                        let polygonCoords = coords[i]
                        // 转换为Cartesian3坐标
                        let cartographic = Cesium.Cartographic.fromDegrees(
                            parseFloat(polygonCoords[0]),
                            parseFloat(polygonCoords[1]),
                            parseFloat(0)
                        );
                        let cartesian = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);
                        pointLinePoints.push(cartesian);
                    }
                    const width = 9000;  // 矩形宽度
                    const height = 9000; // 矩形高度
                    // 获取大多边形的中心点
                    const center = plotCompute.getPolygonCenter(pointLinePoints);
                    // 生成小矩形的四个角点
                    const smallRectanglePositions = plotCompute.createContainedRectangle(center, width, height, polygon[0].angle, pointLinePoints);
                    const diameter = Cesium.Cartesian3.distance(smallRectanglePositions[0], smallRectanglePositions[2]);
                    window.viewer.entities.add({
                        id: onlyPlotidItem,
                        layer: "标绘点",
                        polygon: {
                            hierarchy: new Cesium.PolygonHierarchy(pointLinePoints),
                            material: new Cesium.ImageMaterialProperty({
                                color: Cesium.Color.WHITE.withAlpha(0.4),
                            }),
                            clampToGround: true,
                            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
                            depthTest: false,//禁止深度测试但是没有下面那句有用
                            disableDepthTestDistance: Number.POSITIVE_INFINITY//不再进行深度测试（真神）
                        },
                        properties: {
                            pointPosition: this.positions,
                            linePoint: this.polygonPointEntity,
                            data: polygon, //弹出框
                            plotType: polygonArr[0].plotType
                        }
                    });

                    // 使用对角线作为直径绘制圆形
                    window.viewer.entities.add({
                        id: onlyPlotidItem + "_polygon",
                        position: center, // 圆心为大多边形的中心点
                        ellipse: {
                            semiMajorAxis: diameter / 2, // 对角线的一半作为半径
                            semiMinorAxis: diameter / 2, // 保证是一个正圆
                            material: new Cesium.ImageMaterialProperty({
                                image: import.meta.env.VITE_APP_BASE_API + '/uploads/PlotsPic/' + polygon[0].icon + '.png?t=' + new Date().getTime(),
                                repeat: new Cesium.Cartesian2(1.02, 1.0684), // 控制图片的缩放
                                color: Cesium.Color.WHITE.withAlpha(1.0),
                                scale: 0.5 // 调整图片缩放比例
                            }),
                            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
                            depthTest: false,//禁止深度测试但是没有下面那句有用
                            disableDepthTestDistance: Number.POSITIVE_INFINITY,//不再进行深度测试（真神）
                            stRotation: Cesium.Math.toRadians(polygon[0].angle), // 图片旋转
                            clampToGround: true
                        },
                        properties: {
                            pointPosition: this.positions,
                            linePoint: this.polygonPointEntity,
                            data: polygon, //弹出框
                            plotType: polygonArr[0].plotType
                        }
                    });
                }
            })
        }
    }

    // 在重复的drwaid中获取所有面的唯一drwaid
    distinguishPolygonId(polygonArr) {
        let polygonIdArr = []
        polygonArr.forEach(element => {
            if (!polygonIdArr.includes(element.plotId)) {
                polygonIdArr.push(element.plotId)
            }
        })
        // console.log("数据库",polygonIdArr)
        return polygonIdArr
    }


// 判断点是否在多边形内部
    isPointInPolygon(polyPoints, point) {
        let inside = false;
        for (let i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
            const xi = polyPoints[i][0], yi = polyPoints[i][1];
            const xj = polyPoints[j][0], yj = polyPoints[j][1];
            const px = point.lon, py = point.lat;

            const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    //======================绘制面方法================
    //动态旋转正方形函数
    dynamicSmallRotation(id, afterDraggedPoint) {
        //这里是移动后拖拽的点 ，可以获取到移动后的点
        //这里要调用那个角度的函数，获取一下要转动的角度
        //然后调用调用函数 计算另外三个顶点的坐标的函数
        // console.log("afterDraggedPoint",afterDraggedPoint)
        let angle = this.calculationAngle(this.center, afterDraggedPoint)
        this.angle = angle
        let index = this.polygonPointEntity.findIndex(entity => entity._id === id);
        let afterAngles = [angle, angle + 90, angle + 180, angle + 270];
        let rotationAngle = 0;
        if (index === 0) {
            rotationAngle = angle - 135
        } else if (index === 1) {
            rotationAngle = angle - 225
        } else if (index === 2) {
            rotationAngle = angle - 315
        } else {
            rotationAngle = angle - 45
        }
        let vertices = this.calculateSquareVertices(this.center, id, afterDraggedPoint)
        // console.log("vertices",vertices[0].position)
        // 更新顶点位置
        // 如果数组二当前元素有id
        if (vertices[0].id !== null) {
            // 找到数组一中对应id的元素
            let foundIndex = this.polygonPointEntity.findIndex(item => item._id === vertices[0].id);
            if (foundIndex !== -1) {
                //动态更新正方形点的位置
                this.updateVertexPositions(foundIndex, vertices, rotationAngle);
            }
        }
    }

    //动态旋转正方形函数
    dynamicRotation(id, afterDraggedPoint) {
        //这里是移动后拖拽的点 ，可以获取到移动后的点
        //这里要调用那个角度的函数，获取一下要转动的角度
        //然后调用调用函数 计算另外三个顶点的坐标的函数
        // console.log("afterDraggedPoint",afterDraggedPoint)
        if (this.type === "标绘面") {
            let angle = this.calculationAngle(this.centerPoint, afterDraggedPoint)
            let index = this.polygonPointEntity.findIndex(entity => entity._id === id);
            let afterAngles = [angle, angle + 90, angle + 180, angle + 270];
            let rotationAngle = 0;
            if (index === 0) {
                rotationAngle = angle - 135
            } else if (index === 1) {
                rotationAngle = angle - 225
            } else if (index === 2) {
                rotationAngle = angle - 315
            } else {
                rotationAngle = angle - 45
            }
            let vertices = this.calculateSquareVertices(this.centerPoint, id, afterDraggedPoint)
            // console.log("vertices",vertices[0].position)
            // 更新顶点位置
            // 如果数组二当前元素有id
            if (vertices[0].id !== null) {
                // 找到数组一中对应id的元素
                let foundIndex = this.polygonPointEntity.findIndex(item => item._id === vertices[0].id);
                if (foundIndex !== -1) {
                    //动态更新正方形点的位置
                    this.updateVertexPositions(foundIndex, vertices, rotationAngle);
                }
            }
        }
    }

    //动态更新正方形点的位置
    updateVertexPositions(baseIndex, vertices, angle) {
        this.angle = -angle;
        for (let i = 0; i < 4; i++) {
            let currentIndex = (baseIndex + i) % 4;
            this.polygonPointEntity[currentIndex]._position._value = vertices[i].position;
            this.positions[currentIndex] = vertices[i].position;
            this.drawPolygon();
        }
        // console.log("this.polygonPointEntity[2]",this.polygonPointEntity[2])
        // console.log("this.positions",this.positions)
        // console.log("vertices",vertices)
    };

    //更新点的位置
    updatePointPosition(index, position) {
        let pointEntity = this.polygonPointEntity[index];
        if (pointEntity) {
            pointEntity.position = position;
        }
    }

    //添加点实体
    drawPoint(position) {
        return this._dataSource.entities.add({
            //这里的id可能要改一下，有可能会出现id重复的问题，具体还得看看
            // id: this.guid(),
            id: this.timestampToTime(this.initId) + "Point" + this.lastItem,
            position: position,
            point: {
                color: Cesium.Color.SKYBLUE,
                pixelSize: 10,
                outlineColor: Cesium.Color.YELLOW,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            }
        });
    }

    addPoint(positions) {
        let that = this
        positions.forEach(position => {
            that.positions.push(position);
            let point = that.drawPoint(position);
            that.polygonPointEntity.push(point);
            that.lastItem++;
        });
        if (that.positions.length > 2) {
            that.drawPolygon();
        }
    }

    //画出面实体
    drawPolygon() {
        let posArr = [];
        this.positions.forEach((item, index) => {
            let cartographicPosition = Cesium.Cartographic.fromCartesian(item);
            posArr[index] = {
                lat: Cesium.Math.toDegrees(cartographicPosition.latitude),
                lon: Cesium.Math.toDegrees(cartographicPosition.longitude),
                height: cartographicPosition.height
            };
        });

        // let assemblyData = {
        //   plots: [],
        // };
        // // 组装 plot 数据
        // posArr.forEach((pos, index) => {
        //   assemblyData.plots.push({
        //     eqid: this.eqid,
        //     plotid: this.initId,  // 整个多边形共用一个UUID
        //     time: this.time,
        //     plottype: this.name,
        //     drawtype: "polygon",
        //     latitude: pos.lat,
        //     longitude: pos.lon,
        //     height: pos.height,
        //     img: this.img,
        //     angle: this.angle
        //   });
        // });
        if (this.polygonEntity) {
            //这里是如果面实体存在，那么就不重新创建实体，只是修改实体，防止浪费资源
            this.polygonEntity.polygon.hierarchy = new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(this.positions), false);
            this.polygonEntity.properties.pointPosition = this.positions;
            this.polygonEntity._polygon._stRotation._value = Cesium.Math.toRadians(this.angle);
        } else {

            this.angle = 0;
            this.imgMaterial = new Cesium.ImageMaterialProperty({
                image: this.img
            });
            this.polygonEntity = this.viewer.entities.add({
                id: this.initId,
                polygon: {
                    hierarchy: new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(this.positions), false),
                    material: this.imgMaterial,
                    stRotation: Cesium.Math.toRadians(this.angle),
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
                    depthTest: false,//禁止深度测试但是没有下面那句有用
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,//不再进行深度测试（真神）
                    clampToGround: true,
                },
                properties: {
                    pointPosition: this.positions,
                    linePoint: this.polygonPointEntity,
                }

            });

        }
    }

    convertToMeters(distanceText) {
        // 正则表达式匹配数值和单位
        let kmMatch = distanceText.match(/(\d+(\.\d+)?)\s?km/i);
        let mMatch = distanceText.match(/(\d+(\.\d+)?)\s?m/i);

        let valueInMeters;

        if (kmMatch) {
            // 如果匹配到 "km"，提取数值并转换为米
            let valueInKm = parseFloat(kmMatch[1]);
            valueInMeters = valueInKm * 1000;
        } else if (mMatch) {
            // 如果匹配到 "m"，提取数值
            valueInMeters = parseFloat(mMatch[1]);
        } else {
            // 如果不匹配任何已知单位，则抛出错误
            throw new Error("Unsupported distance unit");
        }
        return valueInMeters;
    }

    /*绘制面图层*/

    drawSquare(position) {
        // 获取距离图例的长度
        let distanceLegendElement = document.querySelector('.distance-legend-label');

        // let distanceText = distanceLegendElement ? distanceLegendElement.textContent : '5000';
        let distanceText = distanceLegendElement.textContent;

        // let distanceValue = parseFloat(distanceText);
        let distanceValue = this.convertToMeters(distanceText);

        // 定义正方形的边长（单位：米），根据距离图例的长度进行调整
        // let squareSideLength = isNaN(distanceValue) ? 50 : distanceValue; // 如果距离值不可用，使用默认值 50 米
        let squareSideLength = distanceValue; // 如果距离值不可用，使用默认值 50 米

        // 获取点击位置的经纬度坐标
        let cartographic = Cesium.Cartographic.fromCartesian(position);

        // 计算正方形的四个顶点

        // ================改为了顺时针生成点，因为后面获取旋转后坐标的函数是顺时针生成的

        let northWest = Cesium.Cartesian3.fromRadians(
            cartographic.longitude - (squareSideLength / 2) / Cesium.Ellipsoid.WGS84.radii.x,
            cartographic.latitude + (squareSideLength / 2) / Cesium.Ellipsoid.WGS84.radii.y
        );
        let southWest = Cesium.Cartesian3.fromRadians(
            cartographic.longitude - (squareSideLength / 2) / Cesium.Ellipsoid.WGS84.radii.x,
            cartographic.latitude - (squareSideLength / 2) / Cesium.Ellipsoid.WGS84.radii.y
        );
        let southEast = Cesium.Cartesian3.fromRadians(
            cartographic.longitude + (squareSideLength / 2) / Cesium.Ellipsoid.WGS84.radii.x,
            cartographic.latitude - (squareSideLength / 2) / Cesium.Ellipsoid.WGS84.radii.y
        );
        let northEast = Cesium.Cartesian3.fromRadians(
            cartographic.longitude + (squareSideLength / 2) / Cesium.Ellipsoid.WGS84.radii.x,
            cartographic.latitude + (squareSideLength / 2) / Cesium.Ellipsoid.WGS84.radii.y
        );
        // 将四个顶点存储到数组中
        let squareVertices = [northWest, southWest, southEast, northEast];
        this.addPoint(squareVertices)
    }

    /*启用点拖拽功能*/
    enableVertexDragging() {
        // 遍历多边形点实体数组，为每个点实体添加鼠标事件
        // console.log("polygonPointEntity", this.polygonPointEntity)
        this.polygonPointEntity.forEach((pointEntity, index) => {
            pointEntity.point.color = Cesium.Color.RED; // 更改顶点颜色以示区别
            let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            this.vertexHandlers.push(handler);

            handler.setInputAction((click) => {
                let pickedObject = this.viewer.scene.pick(click.position);

                if (Cesium.defined(pickedObject) && pickedObject.id === pointEntity) {
                    this.isDragging = true;
                    this.draggedPointIndex = index;
                    this.draggedPoint = pointEntity;
                    this.selectPoint = pointEntity;
                    this.beforeDraggedPoint = this.draggedPoint;
                    this.disableCameraControls();
                }
            }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        });

    }

    /*计算拖拽后正方形四个点坐标*/
    calculateSquareVertices = (center, id, afterDraggedPoint) => {
        // 将Cartesian3坐标转换为Cartographic坐标
        let centerCartographic = Cesium.Cartographic.fromCartesian(center);
        let draggedPointCartographic = Cesium.Cartographic.fromCartesian(afterDraggedPoint);

        // 创建一个椭球体大地测量对象，用于计算两个地理位置之间的距离
        let geodesic = new Cesium.EllipsoidGeodesic(centerCartographic, draggedPointCartographic);

        // 获取两点之间的表面距离（地表两点曲线距离）
        let distance = 2 * geodesic.surfaceDistance; // 中心点与拖拽点的距离

        // 计算对角线的点（拖拽点的对称点）
        let dx = afterDraggedPoint.x - center.x;
        let dy = afterDraggedPoint.y - center.y;
        let dz = afterDraggedPoint.z - center.z;

        let oppositePoint = new Cesium.Cartesian3(center.x - dx, center.y - dy, center.z - dz);

        // 计算拖拽点到中心点的单位向量
        let draggedVector = new Cesium.Cartesian3(dx, dy, dz);
        let draggedVectorLength = Cesium.Cartesian3.magnitude(draggedVector);
        let unitVector = Cesium.Cartesian3.divideByScalar(draggedVector, draggedVectorLength, new Cesium.Cartesian3());

        // 计算四个顶点的坐标
        let vertices = [
            {id: id, position: afterDraggedPoint},
        ];
        let orthoVector = new Cesium.Cartesian3(-unitVector.y, unitVector.x, 0); // 垂直于 unitVector 的向量

        // 计算剩余两个顶点
        let midPoint1 = new Cesium.Cartesian3(
            center.x + orthoVector.x * distance,
            center.y + orthoVector.y * distance,
            center.z
        );

        let midPoint2 = new Cesium.Cartesian3(
            center.x - orthoVector.x * distance,
            center.y - orthoVector.y * distance,
            center.z
        );


        vertices.push({id: null, position: midPoint1});
        vertices.push({id: null, position: oppositePoint});
        vertices.push({id: null, position: midPoint2});

        // 返回计算得到的正方形的四个顶点笛卡尔坐标
        return vertices;
    };

    /*计算选中的唯一点相较于中心点旋转后的角度，始终计算极角，问题（不能动态旋转）*/
    calculationAngle(center, other) {
        // 将笛卡尔坐标转换为地理坐标（经纬度）
        let centerCartographic = Cesium.Cartographic.fromCartesian(center);
        let otherCartographic = Cesium.Cartographic.fromCartesian(other);//拖拽后的点

        // 获取点A和点B的经纬度坐标（单位：度）
        let lonA = centerCartographic.longitude;
        let latA = centerCartographic.latitude;
        let lonB = otherCartographic.longitude;
        let latB = otherCartographic.latitude;

        // 计算AB向量
        let dLon = lonB - lonA;
        let dLat = latB - latA;

        // 计算AB向量的角度
        let angle = Math.atan2(dLat, dLon); // 这里使用 atan2

        // 将弧度转换为角度，并确保角度在0到360度之间
        let angleDegrees = Cesium.Math.toDegrees(angle);
        if (angleDegrees < 0) {
            angleDegrees += 360;
        }

        return angleDegrees; // 确保返回计算结果
    }

    /*判断点是否在多边形内部*/
    isPointInPolygon(polyPoints, pt) {
        let c = false;
        for (let i = 0, l = polyPoints.length, j = l - 1; i < l; j = i, i++) {
            let spi = polyPoints[i];
            let spj = polyPoints[j];
            if (
                ((spi[1] > pt.lat) !== (spj[1] > pt.lat)) &&
                (pt.lon < (spj[0] - spi[0]) * (pt.lat - spi[1]) / (spj[1] - spi[1]) + spi[0])
            ) {
                c = !c;
            }
        }
        return c;
    }

    /*拖动结束后启用相机控制 */
    enableCameraControls() {
        this.viewer.scene.screenSpaceCameraController.enableRotate = true;
        this.viewer.scene.screenSpaceCameraController.enableTranslate = true;
        this.viewer.scene.screenSpaceCameraController.enableZoom = true;
        this.viewer.scene.screenSpaceCameraController.enableTilt = true;
        this.viewer.scene.screenSpaceCameraController.enableLook = true;
    }

    /*拖动结束后结束相机控制 */
    disableCameraControls() {
        this.viewer.scene.screenSpaceCameraController.enableRotate = false;
        this.viewer.scene.screenSpaceCameraController.enableTranslate = false;
        this.viewer.scene.screenSpaceCameraController.enableZoom = false;
        this.viewer.scene.screenSpaceCameraController.enableTilt = false;
        this.viewer.scene.screenSpaceCameraController.enableLook = false;
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

    guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }


    /*绘制标绘面*/
    leftClickEvent(click) {
        if (this.isDragging) return; // 如果在拖动，不执行添加点的逻辑
        let ray = this.viewer.camera.getPickRay(click.position);
        let position = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        if (position) {
            this.centerPoint = null;
            this.centerPoint = position;
            this.beforeDraggedPoint = null;
            this.afterDraggedPoint = null;
            // 移除现有的正方形和相关点实体
            this.viewer.entities.remove(this.polygonEntity);
            this.polygonEntity = null;
            this.polygonPointEntity.forEach(pointEntity => {
                this.viewer.entities.remove(pointEntity);
            });
            this.polygonPointEntity = [];
            this.positions = [];
            // 绘制新的正方形
            this.drawSquare(position);
        }
    }

    rightClickEvent(click) {

        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        this.enableVertexDragging();
        if (this.type === "标绘面") {
            //这里加个这个判定是因为，如果不这样，量算面积，右键完再右键，会调用这个往后端传数据的方法
            // 右键后显示输入详细信息的弹窗
            console.log("完成")
            this.handler.setInputAction((event) => this.showDetailInputPopup(event), Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }
    }

    showDetailInputPopup(event) {
        // console.log("点实体",this.polygonPointEntity)
        // 删除之前生成的点实体
        this.polygonPointEntity.forEach((pointEntity) => {
            this.viewer.entities.remove(pointEntity);
        });
// 阻止默认的右键菜单
        window.document.oncontextmenu = function () {  // 阻止默认菜单弹出
            return false;
        }
        this.drawEnd();

    }

    leftReleaseEvent() {
        if (this.isDragging) {
            this.isDragging = false;
            s
            this.draggedPointIndex = -1;
            if (this.selectPoint) {
                if (this.type === "标绘面") {
                    this.dynamicRotation(this.draggedPoint._id, this.afterDraggedPoint)
                    this.draggedPoint = null;
                    this.selectPoint = null;
                    this.type = null;
                } else {
                    if (this.positions.length > 2) {
                        this.drawPolygon();
                    }
                }
            }
            // this.enableCameraControls()
            // 更新实体个数
            // this.updateEntityCount();
        }
    }

    mouseMoveEvent(movement) {
        if (this.isDragging) {
            let ray = this.viewer.camera.getPickRay(movement.endPosition);
            let position = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            if (position) {
                this.positions[this.draggedPointIndex] = position;
                this.updatePointPosition(this.draggedPointIndex, position);
                if (this.positions.length > 2) {
                    this.drawPolygon();
                }
                this.afterDraggedPoint = position;
            }
            // this.updateEntityCount();
        }
    }
}

