import * as Cesium from 'cesium'
import {getPlotInfos} from "@/api/system/plot.js";
import {plotType as plotTypeDialog} from "@/cesium/plot/plotType.js";
import timeLine from "@/cesium/timeLine.js";
// let intervaladddonghua=null
export default class Point {
    constructor(viewer, store) {
        this.viewer = viewer;
        this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
        this.store = store
        this.ifAnimate = false
    }

    // 画点的屏幕事件
    initPointHandlder(pointType, img, eqid, bool) {
        this.ifAnimate = bool
        return new Promise((resolve, reject) => {
            let viewer = this.viewer
            let that = this
            that.handler.setInputAction((event) => {
                let pointInfo = {
                    geom: null, elevation: null, icon: null, plotType: null, plotId: null, earthquakeId: eqid
                }
                // 1-1 获取点击的位置的坐标信息（经度、纬度、高度）
                let ray = viewer.camera.getPickRay(event.position)
                let position = viewer.scene.globe.pick(ray, viewer.scene)
                // 1-2 坐标系转换
                let cartographic = Cesium.Cartographic.fromCartesian(position)//把笛卡尔坐标转换成制图实例，单位是弧度
                let geom = that.cartographicToGeoJSON(cartographic)
                let elevation = cartographic.height
                // 1-3 点开弹窗中就有经纬度，并且把经纬度图片等信息存入store中
                pointInfo.geom = geom
                pointInfo.elevation = elevation
                pointInfo.icon = img//that.matchIcon(pointType)
                pointInfo.plotType = pointType//that.refenceTypeList[pointType]
                pointInfo.plotId = that.guid()
                that.store.setPointInfo1(pointInfo)
                // 1-4 异步执行完成
                resolve('异步操作完成');
                // 1-5 移除此handler
                that.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        })
    }

    // 画点 //目前不用这个方法画点
    drawPoint(data, bool) {
        console.log("end")
        if (bool) {
            let colorFactor = 1.0;
            let intervalTime = 500; // 切换颜色的时间间隔
            let animationDuration = 3000; // 动画总持续时间（10秒）
            let intervalId = setInterval(() => {
                colorFactor = colorFactor === 1.0 ? 0.5 : 1.0; // 在颜色之间切换
            }, intervalTime);
            // 使用 setTimeout 在动画持续时间结束后清除 interval
            setTimeout(() => {
                clearInterval(intervalId); // 停止颜色切换
            }, animationDuration);
            let coords = data.geom.coordinates
            window.viewer.entities.add({
                id: data.plotId,
                position: Cesium.Cartesian3.fromDegrees(Number(coords[0]), Number(coords[1]), Number(data.elevation)),
                billboard: {
                    image: import.meta.env.VITE_APP_BASE_API + '/uploads/PlotsPic/' + data.icon + '.png?t=' + new Date().getTime(),
                    width: 50,
                    height: 50,
                    color: new Cesium.CallbackProperty(() => {
                        return Cesium.Color.fromCssColorString(`rgba(255, 255, 255, ${colorFactor})`); // 动态改变颜色
                    }, false),
                    scale: 0.8,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                },
                properties: {
                    data
                }
            });
        } else {
            let id = data.plotId
            let longitude = Number(data.geom.coordinates[0])
            let latitude = Number(data.geom.coordinates[1])
            let height = Number(data.elevation)
            let img = import.meta.env.VITE_APP_BASE_API + '/uploads/PlotsPic/' + data.icon + '.png?t=' + new Date().getTime();
            window.viewer.dataSources.getByName('pointData')[0].entities.add({
                id: id,
                layer: "标绘点",
                position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
                billboard: {
                    image: img, width: 50,//图片宽度,单位px
                    height: 50,//图片高度，单位px // 会影响data大小，离谱
                    eyeOffset: new Cesium.Cartesian3(0, 0, 0),//与坐标位置的偏移距离
                    color: Cesium.Color.WHITE.withAlpha(1),//颜色
                    scale: 0.8,//缩放比例
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
                    depthTest: false,//禁止深度测试但是没有下面那句有用
                    disableDepthTestDistance: Number.POSITIVE_INFINITY//不再进行深度测试（真神）
                },
                properties: {
                    data: data
                }
            })
            // let coords = data.geom.coordinates
            // window.viewer.entities.add({
            //   id: data.plotId ,
            //   position: Cesium.Cartesian3.fromDegrees(Number(coords[0]), Number(coords[1]), Number(data.elevation)),
            //   billboard: {
            //     image: data.icon,
            //     width: 50, // 图片宽度,单位px
            //     height: 50, // 图片高度，单位px
            //     eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 与坐标位置的偏移距离
            //     color: Cesium.Color.WHITE.withAlpha(1), // 固定颜色
            //     scale: 0.8, // 缩放比例
            //     heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
            //     depthTest: false, // 禁止深度测试
            //     disableDepthTestDistance: Number.POSITIVE_INFINITY // 不进行深度测试
            //   },
            //   properties: {
            //     data
            //   }
            // });
        }

    }

    async drawPoints(points, bool) {
        // 判断 points 是否为数组，不是数组则将它包装为数组
        if (!Array.isArray(points)) {
            let data = {}
            if (points.longitude) {
                data = {
                    longitude: Number(points.longitude), latitude: Number(points.latitude), ...points
                }
            } else {
                data = {
                    longitude: Number(points.geom.coordinates[0]),
                    latitude: Number(points.geom.coordinates[1]), ...points
                }
            }

            points = data
            points = [points];
        }
        this.addDataSourceLayer("pointData")
        this.addDataSourceLayer("label")

        for (const data of points) {
            console.log(points, "points data")
            let plotId = data.plotId
            let plotType = data.plotType
            const res = await getPlotInfos({plotId, plotType});
            //标签
            let labeltext = this.labeltext(plotType, res)
            if (bool) {
                if (!viewer.entities.getById(data.plotId + "_theOne")) {
                    this.addPointToLabel(data, labeltext)
                    let plot = await this.addMakerPointActive(data)
                    await this.blinkMarker(plot)
                    if (plot.plotType === "失踪人员" || plot.plotType === "轻伤人员" || plot.plotType === "重伤人员" || plot.plotType === "危重伤人员" || plot.plotType === "死亡人员" || plot.plotType === "已出发队伍" || plot.plotType === "正在参与队伍" || plot.plotType === "待命队伍") {
                    } else {
                        let entitylabel = window.labeldataSource.entities.getById(plot.plotId + "_label");
                        if (entitylabel) {
                            window.labeldataSource.entities.remove(entitylabel); // 移除点
                        }
                    }
                    if (!window.pointDataSource.entities.getById(data.plotId)) {
                        window.viewer.entities.remove(plot);
                        this.addPointToPointData(data)
                    }
                }
            } else {
                if (!window.pointDataSource.entities.getById(data.plotId)) {
                    this.addPointToPointData(data)
                }
                if (plotType === "失踪人员" || plotType === "轻伤人员" || plotType === "重伤人员" || plotType === "危重伤人员" || plotType === "死亡人员" || plotType === "已出发队伍" || plotType === "正在参与队伍" || plotType === "待命队伍") {
                    this.addPointToLabel(data, labeltext)
                }
            }
        }
    }

    async addMakerPointActive(data) {
        // return new Promise((resolve) => {
        let plot = window.viewer.entities.getById(data.plotId);
        if (!plot) {
            plot = window.viewer.entities.add({
                drawtype: "drawPoint",
                id: data.plotId + "_theOne",
                plottype: data.plotType,
                layer: "标绘点",
                position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.elevation || 0)), // labeltext: labeltext,
                billboard: {
                    image: import.meta.env.VITE_APP_BASE_API + '/uploads/PlotsPic/' + data.icon + '.png?t=' + new Date().getTime(),
                    width: 50, // 图片宽度,单位px
                    height: 50, // 图片高度，单位px
                    eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 与坐标位置的偏移距离
                    color: Cesium.Color.WHITE.withAlpha(1),
                    scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1), // 近大远小
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
                    depthTest: false, // 禁止深度测试
                    disableDepthTestDistance: Number.POSITIVE_INFINITY, // 不再进行深度测试
                    clampToGround: true,
                },
                properties: {
                    data
                }
            });
        }
        return plot
    }

    blinkMarker(plot) {
        return new Promise((resolve) => {
            let entity = null
            entity = window.viewer.entities.getById(plot.id);
            console.log(entity, "entity blinkMaker")
            const interval = 500; // 每次闪烁的时间间隔
            let count = 0;
            // entity.show = false;
            const blinkInterval = setInterval(() => {
                entity.show = !entity.show
                count++;
                if (count >= 10) {
                    clearInterval(blinkInterval);
                    entity.show = false;
                    resolve(); // 完成闪烁，继续后续操作
                }
            }, interval);
        });
    }

    deletePointById(plotId) {
        //集合图层 图表和底层蓝色圈
        if (window.pointDataSource) {
            let entityToRemove = window.pointDataSource.entities.getById(plotId);
            if (entityToRemove) {
                window.pointDataSource.entities.remove(entityToRemove); // 移除点
            }
        }
        //非聚合的点
        let entityDonghua = window.viewer.entities.getById(plotId);
        if (entityDonghua) {
            window.viewer.entities.remove(entityDonghua); // 移除点
        }

        //信息框
        if (window.labeldataSource) {
            let entitylabel = window.labeldataSource.entities.getById(plotId + '_label');
            if (entitylabel) {
                window.labeldataSource.entities.remove(entitylabel); // 移除点
            }
        }
    }

//匹配图标
    matchIcon(type) {
        let list = matchMark() // 封装的marchMark
        return list[type]
    }

    guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    cartographicToGeoJSON(cartographic) {
        // 将 Cesium.Cartographic 弧度转换为 GeoJSON 所需的度
        let lon = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        let lat = Cesium.Math.toDegrees(cartographic.latitude);  // 纬度

        // 返回 GeoJSON 格式的 Point 对象
        return {
            "type": "Point", "coordinates": [lon, lat]
        };
    }

//---------工具函数 start-----------------
//聚合图层数据源，挂载到windows
    addDataSourceLayer(datasourcename) {
        if (datasourcename === "pointData") {
            let pointDataSource = null
            if (window.viewer.dataSources._dataSources[0] && window.viewer.dataSources._dataSources.find(ds => ds.name === 'pointData')) {
                pointDataSource = window.pointDataSource
            } else {
                pointDataSource = new Cesium.CustomDataSource("pointData");
                let dataSourcePromise = window.viewer.dataSources.add(pointDataSource)
                dataSourcePromise.then(function (pointDataSource) {
                    let pixelRange = 10;
                    let minimumClusterSize = 3;
                    let enabled = true;
                    pointDataSource.clustering.enabled = enabled; //是否聚合
                    pointDataSource.clustering.pixelRange = pixelRange;
                    pointDataSource.clustering.minimumClusterSize = minimumClusterSize;
                    let pinBuilder = new Cesium.PinBuilder();
                    let pin1000 = pinBuilder
                        .fromText("1000+", Cesium.Color.RED, 48)
                        .toDataURL();
                    let pin500 = pinBuilder
                        .fromText("100+", Cesium.Color.RED, 48)
                        .toDataURL();
                    let pin100 = pinBuilder
                        .fromText("100+", Cesium.Color.RED, 48)
                        .toDataURL();
                    let pin50 = pinBuilder
                        .fromText("50+", Cesium.Color.RED, 48)
                        .toDataURL();
                    let pin40 = pinBuilder
                        .fromText("40+", Cesium.Color.ORANGE, 48)
                        .toDataURL();
                    let pin30 = pinBuilder
                        .fromText("30+", Cesium.Color.YELLOW, 48)
                        .toDataURL();
                    let pin20 = pinBuilder
                        .fromText("20+", Cesium.Color.GREEN, 48)
                        .toDataURL();
                    let pin10 = pinBuilder
                        .fromText("10+", Cesium.Color.BLUE, 48)
                        .toDataURL();
                    // let singleDigitPins = new Array(8);
                    let singleDigitPins = new Array(20);
                    for (let i = 0; i < singleDigitPins.length; ++i) {
                        singleDigitPins[i] = pinBuilder
                            // .fromText(`${Math.floor((i + 2)/2)}`, Cesium.Color.VIOLET, 48)
                            // .fromText(`${Math.floor(i /2)}`, Cesium.Color.VIOLET, 48)
                            .fromText(`${i}`, Cesium.Color.VIOLET, 48)
                            .toDataURL();
                    }
                    let removeListener

                    function customStyle() {
                        if (Cesium.defined(removeListener)) {
                            removeListener && removeListener();
                            removeListener = undefined;
                        } else {
                            removeListener = pointDataSource.clustering.clusterEvent.addEventListener(function (clusteredEntities, cluster) {
                                    // if (clusteredEntities.length < 10) {
                                    //   // 禁用 Billboard 显示
                                    //   cluster.billboard.show = false;
                                    //   cluster.label.show = false;
                                    // } else {
                                    cluster.label.show = false;
                                    cluster.billboard.show = true;
                                    cluster.billboard.id = cluster.label.id;
                                    cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

                                    // 设置 Billboard 高度引用地形
                                    cluster.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;

                                    // 禁用深度测试，使 Billboard 不会被地形遮挡
                                    cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;

                                    if (clusteredEntities.length >= 2000) {
                                        cluster.billboard.image = pin1000;
                                    } else if (clusteredEntities.length >= 1000) {
                                        cluster.billboard.image = pin500;
                                    } else if (clusteredEntities.length >= 200) {
                                        cluster.billboard.image = pin100;
                                    } else if (clusteredEntities.length >= 100) {
                                        cluster.billboard.image = pin50;
                                    } else if (clusteredEntities.length >= 80) {
                                        cluster.billboard.image = pin40;
                                    } else if (clusteredEntities.length >= 60) {
                                        cluster.billboard.image = pin30;
                                    } else if (clusteredEntities.length >= 40) {
                                        cluster.billboard.image = pin20;
                                    } else if (clusteredEntities.length >= 20) {
                                        cluster.billboard.image = pin10;
                                    } else {
                                        cluster.billboard.image = // singleDigitPins[clusteredEntities.length - 2];
                                            singleDigitPins[clusteredEntities.length];
                                    }
                                }
                                // }
                            );
                        }

                        let pixelRange = pointDataSource.clustering.pixelRange;
                        pointDataSource.clustering.pixelRange = 0;
                        pointDataSource.clustering.pixelRange = pixelRange;
                    }

                    customStyle();
                })
                window.pointDataSource = pointDataSource;
            }
            return pointDataSource
        } else if (datasourcename === "label") {
            let labeldataSource = null
            if (window.viewer.dataSources._dataSources[0] && window.viewer.dataSources._dataSources.find(ds => ds.name === 'label')) {
                labeldataSource = window.labeldataSource
            } else {
                labeldataSource = new Cesium.CustomDataSource("label");
                let dataSourcePromise = window.viewer.dataSources.add(labeldataSource)
                dataSourcePromise.then(function (labeldataSource) {
                    labeldataSource.clustering.enabled = true; // 开启聚合
                    // labeldataSource.clustering.pixelRange = 30; // 聚合像素范围
                    labeldataSource.clustering.minimumClusterSize = 1; // 最小聚合大小

                    // 监听相机变化事件来动态调整聚合像素范围
                    let cameraChangeListener = viewer.camera.changed.addEventListener(function () {
                        const cameraHeight = viewer.camera.positionCartographic.height;
                        if (cameraHeight < 50000) {
                            labeldataSource.clustering.pixelRange = 0; // 近距离时，聚合像素范围小
                        } else {
                            labeldataSource.clustering.pixelRange = 100; // 远距离时，聚合像素范围大
                        }
                    });

                    let removeListener

                    function customStyle() {
                        if (Cesium.defined(removeListener)) {
                            removeListener && removeListener();
                            let removeListener = undefined;
                        } else {
                            let removeListener = labeldataSource.clustering.clusterEvent.addEventListener(function (clusteredEntities, cluster) {
                                cluster.label.show = false;
                                // 创建 Canvas 标签
                                const canvas = document.createElement('canvas');
                                const context = canvas.getContext('2d');

                                // 设置字体和布局
                                const titleFontSize = 19; // 标题字体大小
                                const contentFontSize = 19; // 内容字体大小
                                const rowHeight = 30; // 每行高度调整为 30
                                const padding = 40; // 内边距
                                const margin = 10; // 外边距
                                const headerHeight = 50; // 表格标题高度调整为 50
                                const extraHeight = 50; // 额外增加的背景高度

                                // 动态计算标题宽度（确保标题适配背景）
                                const title = '出队情况，伤亡人员统计（标绘）';
                                context.font = `bold ${titleFontSize}px Arial`;
                                const titleWidth = context.measureText(title).width + 2 * padding; // 标题宽度

                                // 红色标绘的文字和操场椭圆
                                const markText = '应急';
                                const markFontSize = 22; // 红色文字字体大小
                                context.font = `bold ${markFontSize}px Arial`;
                                const markTextWidth = context.measureText(markText).width; // 标绘文字宽度
                                const markPadding = 10; // 跑道椭圆文字左右的间距
                                const trackHeight = markFontSize + 14; // 跑道椭圆高度
                                const trackWidth = markTextWidth + markPadding * 2.5; // 跑道椭圆宽度

                                // 动态计算 Canvas 的宽度和高度
                                const canvasWidth = Math.max(titleWidth + 130, 460); // 保证最小宽度为 400
                                const canvasHeight = headerHeight + rowHeight * clusteredEntities.length + padding * 2 + extraHeight; // 计算总高度

                                canvas.width = canvasWidth; // 设置 Canvas 宽度
                                canvas.height = canvasHeight; // 设置 Canvas 高度

                                // 加载背景图片
                                const backgroundImage = new Image();
                                backgroundImage.src = '/images/背景边框.png'; // 确保路径正确
                                backgroundImage.onload = function () {
                                    // 背景图片放大比例（例如 1.2 表示放大 20%）
                                    const scaleFactor = 1.6;

                                    // 计算背景图片缩放比例
                                    const imageAspectRatio = backgroundImage.width / backgroundImage.height;
                                    const canvasAspectRatio = canvasWidth / canvasHeight;
                                    let drawWidth, drawHeight, offsetX, offsetY;

                                    if (imageAspectRatio < canvasAspectRatio) {
                                        // 图片更高，以 Canvas 高度为准缩放，并放大
                                        drawHeight = canvasHeight * scaleFactor;
                                        drawWidth = drawHeight * imageAspectRatio;
                                        offsetX = (canvasWidth - drawWidth) / 2; // 水平居中
                                        offsetY = (canvasHeight - drawHeight) / 2; // 垂直居中
                                    } else {
                                        // 图片更宽，以 Canvas 宽度为准缩放，并放大
                                        drawWidth = canvasWidth * scaleFactor;
                                        drawHeight = drawWidth / imageAspectRatio;
                                        offsetX = (canvasWidth - drawWidth) / 2; // 水平居中
                                        offsetY = (canvasHeight - drawHeight) / 2; // 垂直居中
                                    }

                                    // 绘制背景图片（完全显示并放大）
                                    context.drawImage(backgroundImage, offsetX, offsetY, drawWidth, drawHeight);

                                    // 绘制操场跑道样式的红色椭圆
                                    const trackX = padding - 7; // 椭圆起点 X
                                    const trackY = headerHeight / 2 + padding / 2; // 椭圆起点 Y
                                    const radius = trackHeight / 2; // 椭圆两端的圆弧半径
                                    const straightWidth = trackWidth - 2 * radius; // 椭圆中间的直线长度

                                    context.strokeStyle = '#D77786'; // 红色边框
                                    context.lineWidth = 3; // 加粗椭圆边框
                                    context.beginPath();
                                    // 左侧圆弧
                                    context.arc(trackX + radius, trackY, radius, Math.PI / 2, -Math.PI / 2, false);
                                    // 上方直线
                                    context.lineTo(trackX + radius + straightWidth, trackY - radius);
                                    // 右侧圆弧
                                    context.arc(trackX + radius + straightWidth, trackY, radius, -Math.PI / 2, Math.PI / 2, false);
                                    // 下方直线
                                    context.lineTo(trackX + radius, trackY + radius);
                                    context.closePath();
                                    context.stroke();

                                    // 绘制红色标绘文字
                                    context.font = `bold ${markFontSize}px Arial`;
                                    context.fillStyle = '#D77786'; // 红色字体
                                    context.textAlign = 'center';
                                    context.textBaseline = 'middle';
                                    context.fillText(markText, trackX + trackWidth / 2, trackY);

                                    // 绘制表格标题文字
                                    context.font = `bold ${titleFontSize}px Arial`; // 标题字体
                                    context.fillStyle = '#ffffff'; // 白色文字
                                    context.textAlign = 'center';
                                    context.textBaseline = 'middle';
                                    context.fillText(title, canvasWidth / 2, headerHeight / 2 + padding / 2); // 居中绘制标题

                                    // 绘制表格内容
                                    clusteredEntities.forEach((entity, index) => {
                                        const yPosition = headerHeight + padding + index * rowHeight;

                                        // 确保内容在背景范围内
                                        if (yPosition + rowHeight > canvasHeight - padding) {
                                            console.warn('内容超出背景范围，跳过绘制');
                                            return;
                                        }

                                        // 绘制内容
                                        context.font = `${contentFontSize}px Arial`; // 内容字体
                                        context.fillStyle = '#ffffff'; // 白色字体
                                        context.textAlign = 'left';
                                        context.fillText(`${entity.labeltext || '无信息'}`, padding, // 左对齐
                                            yPosition + rowHeight / 2);
                                    });

                                    // 将 Canvas 转换为 Billboard 图像
                                    const canvasImage = canvas.toDataURL('image/png');

                                    try {
                                        // 检查 Billboard 是否已初始化
                                        if (cluster.billboard) {
                                            cluster.billboard.show = true;
                                            cluster.billboard.image = canvasImage;

                                            // 调整宽高比例
                                            cluster.billboard.width = canvasWidth * 0.7;
                                            cluster.billboard.height = canvasHeight * 0.7;
                                            cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

                                            // 设置 Billboard 高度引用地形
                                            cluster.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;

                                            // 禁用深度测试，使 Billboard 不会被地形遮挡
                                            cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
                                            // 设置 Billboard 位置：背景图片右下角对齐标绘图标正上方
                                            cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                                            cluster.billboard.pixelOffset = new Cesium.Cartesian2(-(canvasWidth * 0.35), // 调整为右下角更贴近图标
                                                -(canvasHeight * 0.1) // 上移贴近图标
                                            );

                                            // 隐藏 Cesium 默认的标签
                                            cluster.label.show = false;
                                        } else {
                                            cluster.label.show = false;
                                        }
                                    } catch (error) {
                                        // 捕获 Cesium 的内部报错，避免控制台输出
                                        if (error.message && error.message.includes('_textureAtlas')) {
                                        } else {
                                        }
                                    }
                                };

                                // 捕获图片加载错误
                                backgroundImage.onerror = function () {
                                };
                            });
                        }
                    }

                    customStyle();
                })
                window.labeldataSource = labeldataSource;
            }
            return labeldataSource
        }
    }

//标签文字
    labeltext(plotType, res) {
        // console.log("标签",res)
        let labeltext = plotType
        if (res.plotTypeInfo && res.plotTypeInfo.location) {
            labeltext = res.plotTypeInfo.location + labeltext
        }
        //人员伤亡类文字：新增xxx人员xx人
        // if(plotType==="失踪人员"||plotType==="轻伤人员"||plotType==="重伤人员"||plotType==="危重伤人员"||plotType==="死亡人员"){
        if (plotType === "轻伤人员" || plotType === "重伤人员" || plotType === "危重伤人员" || plotType === "死亡人员") {
            if (res.plotTypeInfo && res.plotTypeInfo.newCount) {
                labeltext = labeltext + res.plotTypeInfo.newCount + "人"
            }
        }
        //救援队伍 单位,人数人
        if (plotType === "已出发队伍" || plotType === "正在参与队伍" || plotType === "待命队伍") {
            if (res.plotTypeInfo.teamName) {
                labeltext = labeltext + ":" + res.plotTypeInfo.teamName
            }
            if (res.plotTypeInfo.personnelCount) {
                labeltext = labeltext + res.plotTypeInfo.personnelCount + "人"
            }
            if (res.plotTypeInfo.teamName == null && res.plotTypeInfo.personnelCount == 0) {
                labeltext = labeltext + "1队"
            }
        }
        // 是否出现人员伤亡，是否处置（次生灾害）
        if (res.plotTypeInfo && res.plotTypeInfo.casualties) {
            labeltext = labeltext + res.plotTypeInfo.casualties + "人员伤亡"
        }
        if (res.plotTypeInfo && res.plotTypeInfo.initialDisposalPhase) {
            labeltext = labeltext + "," + res.plotTypeInfo.initialDisposalPhase
        }
        return labeltext
    }


//pointData聚合图层
    addPointToPointData(data) {
        let plot = window.pointDataSource.entities.getById(data.plotId)
        if (!plot) {
            window.pointDataSource.entities.add({
                id: data.plotId,
                plottype: data.plotType,
                layer: "标绘点",
                position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.elevation || 0)), // labeltext: labeltext,
                billboard: {
                    image: import.meta.env.VITE_APP_BASE_API + '/uploads/PlotsPic/' + data.icon + '.png?t=' + new Date().getTime(),
                    width: 50, // 图片宽度,单位px
                    height: 50, // 图片高度，单位px
                    eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 与坐标位置的偏移距离
                    color: Cesium.Color.WHITE.withAlpha(1),//颜色
                    scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1), // 近大远小
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
                    depthTest: false, // 禁止深度测试
                    disableDepthTestDistance: Number.POSITIVE_INFINITY // 不再进行深度测试
                },
                properties: {
                    data
                }
            })
        }
    }

//标签图层
    addPointToLabel(data, labeltext) {
        let plot = window.labeldataSource.entities.getById(data.plotId + '_label');
        if (!plot) {
            labeldataSource.entities.add({
                id: data.plotId + '_label',
                plottype: data.plotType,
                layer: "标绘点",
                layers: "聚合标绘点",
                position: Cesium.Cartesian3.fromDegrees(Number(data.longitude), Number(data.latitude), Number(data.elevation || 0)),
                labeltext: labeltext,
                billboard: {
                    image: import.meta.env.VITE_APP_BASE_API + '/uploads/PlotsPic/' + data.icon + '.png?t=' + new Date().getTime(),
                    width: 50, // 图片宽度,单位px
                    height: 50, // 图片高度，单位px
                    eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 与坐标位置的偏移距离
                    color: Cesium.Color.WHITE.withAlpha(1),//颜色
                    scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1), // 近大远小
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
                    depthTest: false, // 禁止深度测试
                    disableDepthTestDistance: Number.POSITIVE_INFINITY // 不再进行深度测试
                },
                properties: {
                    data
                }
            })
        }
    }

    // flyTo(data) {
    //     viewer.scene.camera.flyTo({
    //         destination: Cesium.Cartesian3.fromDegrees(
    //             Number(data.longitude),
    //             Number(data.latitude),
    //             20000),
    //         orientation: {
    //             // 指向
    //             heading: 6.283185307179581,
    //             // 视角
    //             pitch: -1.5688168484696687,
    //             roll: 0.0
    //         },
    //         duration: 2 // 飞行动画持续时间（秒）
    //     });
    // }
}
