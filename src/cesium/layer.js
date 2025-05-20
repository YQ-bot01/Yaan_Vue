import * as Cesium from 'cesium'

import siChuanCity from "@/assets/geoJson/sichuan.json";
import sichuanCounty from "@/assets/geoJson/sichuanCounty.json";
import yaAnVillage from "@/assets/geoJson/yaan.json";

import yaAn from "@/assets/geoJson/yaan1.json";
import {getModelData} from "@/api/system/tiltPhotography.js";
import modelicon from "@/assets/icons/png/3D.png";


let modelEntities = [];
let siChuanCityRegionLabels = [];
let sichuanCountyRegionLabels = [];
let yaAnVillageRegionLabels = [];
let sichuanCityStroke=[]
let siChuanCountyStroke=[]
let yaAnVillageStroke=[]

let layer = {
    // 四川省-雅安市三级行政区划
    // 加载四川省市级图层
    loadSichuanCityLayer() {
        if (sichuanCityStroke.length===0) {
            console.log("loadCityLayer 加载市级图层")
            // viewer.terrainProvider = Cesium.createWorldTerrain();

            try {
                // 遍历 GeoJSON 数据，手动创建填充和边界线
                siChuanCity.features.forEach(feature => {
                    const firstPolygon = feature.geometry.coordinates[0][0];
                    const positions = firstPolygon.map(vertex => Cesium.Cartesian3.fromDegrees(vertex[0], vertex[1]));
                    // 创建边界线部分
                    let strokeentity = viewer.entities.add({
                        polyline: {
                            positions: positions,
                            material: Cesium.Color.fromCssColorString('#ffffff'),
                            width: 2,
                            clampToGround: true
                        }
                    });
                    sichuanCityStroke.push(strokeentity)
                    const centroid = this.calculateCentroid(positions);
                    let labelentity = window.viewer.entities.add({
                        layer: "siChuanCityRegionLabel",
                        position: centroid,
                        label: {
                            text: feature.properties.name || '未命名',
                            font: '18px sans-serif',
                            fillColor: Cesium.Color.WHITE,
                            outlineColor: Cesium.Color.BLACK,
                            outlineWidth: 2,
                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                            verticalOrigin: Cesium.VerticalOrigin.CENTER,
                            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                            pixelOffset: new Cesium.Cartesian2(0, 0),
                            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
                        }
                    });
                    siChuanCityRegionLabels.push(labelentity)
                })
            }
            catch(error ) {
                console.error("加载市级图层失败:", error);
            }
        }
    },
    // 加载四川省区县级图层
    loadSiChuanCountyLayer() {
        if (siChuanCountyStroke.length===0) {
            console.log(" 加载区县级图层")
            // viewer.terrainProvider = Cesium.createWorldTerrain();
            try {
                // 遍历 GeoJSON 数据，手动创建填充和边界线
                sichuanCounty.features.forEach(feature => {
                    const firstPolygon = feature.geometry.coordinates[0][0];
                    const positions = firstPolygon.map(vertex => Cesium.Cartesian3.fromDegrees(vertex[0], vertex[1]));
                    // 创建边界线部分
                    let strokeentity = viewer.entities.add({
                        polyline: {
                            positions: positions,
                            material: Cesium.Color.fromCssColorString('#d9da95'),
                            width: 2,
                            clampToGround: true
                        }
                    });
                    siChuanCountyStroke.push(strokeentity)
                    const centroid = this.calculateCentroid(positions);
                    let entity = window.viewer.entities.add({
                        layer: "sichuanCountyRegionLabel",
                        position: centroid,
                        label: {
                            text: feature.properties.name || '未命名',
                            font: '18px sans-serif',
                            fillColor: Cesium.Color.WHITE,
                            outlineColor: Cesium.Color.BLACK,
                            outlineWidth: 2,
                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                            verticalOrigin: Cesium.VerticalOrigin.CENTER,
                            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                            pixelOffset: new Cesium.Cartesian2(0, 0),
                            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
                        }
                    });
                    sichuanCountyRegionLabels.push(entity)
                })
            }
            catch(error){
                console.error("加载区县级图层失败:", error);
            }
        }
    },
    // 加载雅安市乡镇级图层
    loadYaAnVillageLayer() {
        // console.log(yaAnVillageStroke,"yaAnVillageStroke")
        if (yaAnVillageStroke.length===0) {
            console.log("loadYaAnVillageLayer add")
            // 确保地形提供者已加载
            // viewer.terrainProvider = Cesium.createWorldTerrain();

            try {
                // 遍历 GeoJSON 数据，手动创建填充和边界线
                yaAnVillage.features.forEach(feature => {
                    const firstPolygon = feature.geometry.coordinates[0][0];
                    const positions = firstPolygon.map(vertex => Cesium.Cartesian3.fromDegrees(vertex[0], vertex[1]));
                    // 创建边界线部分
                    let strokeentity=viewer.entities.add({
                        polyline: {
                            positions: positions,
                            material: Cesium.Color.fromCssColorString('#ff1e00'),
                            width: 2,
                            clampToGround: true
                        }
                    });
                    yaAnVillageStroke.push(strokeentity)
                    const centroid = this.calculateCentroid(positions);
                    let labelentity = window.viewer.entities.add({
                        layer: "yaAnVillageRegionLabel",
                        position: centroid,
                        label: {
                            text: feature.properties.name || '未命名',
                            font: '18px sans-serif',
                            fillColor: Cesium.Color.WHITE,
                            outlineColor: Cesium.Color.BLACK,
                            outlineWidth: 2,
                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                            verticalOrigin: Cesium.VerticalOrigin.CENTER,
                            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                            pixelOffset: new Cesium.Cartesian2(0, 0),
                            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
                        }
                    });
                    yaAnVillageRegionLabels.push(labelentity)
                    console.log("雅安市乡镇级图层加载成功！");
                })
            }
            catch(error) {
                console.error("加载市级图层失败:", error);
            }
        }
    },

    calculateCentroid(positions) {
        let centroid = Cesium.Cartesian3.ZERO;
        positions.forEach(pos => {
            centroid = Cesium.Cartesian3.add(centroid, pos, new Cesium.Cartesian3());
        });
        return Cesium.Cartesian3.divideByScalar(centroid, positions.length, new Cesium.Cartesian3());
    }
    ,

    removeSichuanCityLayer() {
        // 移除标签
        siChuanCityRegionLabels.forEach((item) => {
            window.viewer.entities.remove(item)
        })
        sichuanCityStroke.forEach((item) => {
            window.viewer.entities.remove(item)
        })
        siChuanCityRegionLabels=[]
        sichuanCityStroke=[]
    }
    ,
    removeSiChuanCountyLayer() {
        // 移除标签
        sichuanCountyRegionLabels.forEach((item) => {
            window.viewer.entities.remove(item)
        })
        siChuanCountyStroke.forEach((item) => {
            window.viewer.entities.remove(item)
        })
        //移除图层
        sichuanCountyRegionLabels=[]
        siChuanCountyStroke=[]
    }
    ,
    removeYaAnVillageLayer() {
        // 移除标签
        yaAnVillageRegionLabels.forEach((item) => {
            window.viewer.entities.remove(item)
        })
        yaAnVillageRegionLabels=[]
        yaAnVillageStroke.forEach((item) => {
            window.viewer.entities.remove(item)
        })
        yaAnVillageStroke=[]
    }
    ,
//四川省-雅安市三级行政区划 end

//视角跳转-加载雅安市
    addYaanCityDistrict() {
        let geoPromise = Cesium.GeoJsonDataSource.load(yaAn, {
            clampToGround: true, //贴地显示
            stroke: Cesium.Color.RED,
            fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
            strokeWidth: 4,
        });
        // 处理加载成功的GeoJSON数据
        geoPromise.then((dataSource) => {
            window.viewer.dataSources.add(dataSource);
            // 添加 geojson
            window.regionLayerJump = dataSource;

            // 视角跳转到 geojson
            viewer.flyTo(dataSource.entities.values);

        }).catch((error) => {
            // 处理加载失败的情况
            console.error("加载GeoJSON数据失败:", error);
        });
        // 添加雅安市的标签
        let labelData = {lon: 103.003398, lat: 29.981831, name: "雅安市"};
        let position = Cesium.Cartesian3.fromDegrees(labelData.lon, labelData.lat);
        viewer.entities.add(new Cesium.Entity({
            id: "regionLayerJumpText",
            position: position,
            label: new Cesium.LabelGraphics({
                text: labelData.name,
                scale: 1,
                font: "bolder 50px sans-serif",
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.fromCssColorString("#ffffff"),
                pixelOffset: new Cesium.Cartesian2(0, -60)
            })
        }));
    }
    ,
//视角跳转-加载雅安区县
    addCountyLayerJump(district) {
        // 根据区县代码过滤GeoJSON数据
        let filteredFeatures = sichuanCounty.features.filter(feature => {
            return feature.properties.adcode === district.adcode;
        });
        if (filteredFeatures) {
            // 创建一个经过过滤的GeoJSON对象，包含过滤后的特性数据
            let filteredGeoJson = {
                type: "FeatureCollection",
                features: filteredFeatures
            };

            // 使用Cesium的GeoJsonDataSource.load方法加载经过过滤的GeoJSON数据
            // 该方法用于将GeoJSON数据转换为Cesium的数据源，以便在3D地图中显示
            // 在加载时，设置了数据源的样式属性，包括边颜色、填充颜色和边宽度
            let geoPromise = Cesium.GeoJsonDataSource.load(filteredGeoJson, {
                clampToGround: true, //贴地显示
                stroke: Cesium.Color.RED,
                fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
                strokeWidth: 10,
            });

            // 处理地理空间数据的Promise对象
            geoPromise.then(async (dataSource) => {
                // 将数据源添加到观众的数据显示中
                window.viewer.dataSources.add(dataSource);
                // 保存区域图层以便后续使用
                window.regionLayerJump = dataSource
                // 获取特征的中心点坐标
                let center = filteredFeatures[0].properties.center;

                // 检查中心点是否定义且格式正确
                if (center && center.length === 2) {
                    // 将地理坐标转换为三维空间中的位置
                    let position = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
                    // 创建并添加标签实体到观众的实体集合中
                    window.viewer.entities.add(new Cesium.Entity({
                        position: position,
                        id: "regionLayerJumpText",
                        label: new Cesium.LabelGraphics({
                            text: district.name,  // 标签文本为区域名称
                            scale: 1,  // 标签缩放比例
                            font: "bolder 50px sans-serif",  // 标签字体样式
                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,  // 标签样式为填充和轮廓
                            fillColor: Cesium.Color.fromCssColorString("#ffffff"),  // 标签填充颜色
                            pixelOffset: new Cesium.Cartesian2(0, -60)  // 标签像素偏移量，用于调整位置
                        })
                    }));
                } else {
                    // 如果中心点未定义或格式不正确，输出警告信息
                    console.warn('中心点未定义或格式不正确:', feature);
                }
                // 飞行到数据源中的实体位置，以便用户查看
                viewer.flyTo(dataSource.entities.values);
            }).catch((error) => {
                // 如果加载GeoJSON数据失败，输出错误信息
                console.error("加载GeoJSON数据失败:", error);
            });
        } else {
            // console.error("未找到对应的区县:", adcode);
        }
    }
    ,
//视角跳转-取消视角跳转图层
    removeRegionLayerJump() {
        if (window.regionLayerJump) {
            // 从viewer的数据源中移除图层，第二个参数为true表示强制移除
            window.viewer.dataSources.remove(window.regionLayerJump, true);
            // 清空regionLayerJump的引用，以便垃圾回收
            window.regionLayerJump = null;
            // //console.log("图层已移除");
        }
        let labelEntity = window.viewer.entities.getById("regionLayerJumpText")
        if (labelEntity) {
            window.viewer.entities.remove(labelEntity)
        }
    }
    ,

//多源要素图层-加载三维模型图层
    addModelLayer() {
        getModelData().then(res => {
            console.log("倾斜模型数据，新加的点，", res)
            // 创建一个数组来保存实体和对应的数据
            for (let i = 0; i < res.length; i++) {
                let alltiltPhotography = window.viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(res[i].geom.coordinates[0], res[i].geom.coordinates[1]),
                    layer: "倾斜模型",
                    // point: {
                    //   pixelSize: 20,
                    //   color: Cesium.Color.fromCssColorString("#e0c79b"),
                    //   clampToGround: true,
                    // },
                    billboard: {
                        image: modelicon,
                        width: 30,
                        height: 30,
                        // eyeOffset: new Cesium.Cartesian3(0, 0, 0),
                        // color: Cesium.Color.WHITE.withAlpha(1),
                        // scale: 0.8,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 禁用，导致图标在高度计算或与地形交互时出现闪烁。 原作用：绑定到地形高度,让billboard贴地
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    },
                    // 自定义属性，保存对应的数据
                    data: res[i],
                    // 添加名称属性
                    name: res[i].name + "倾斜模型"
                });
                // 将实体保存到数组中
                modelEntities.push(alltiltPhotography);
            }
        })
    }
    ,
    removeModelLayer() {
        if (window.modelObject) {
            window.modelObject.show = false
        }
        modelEntities.forEach((item) => {
            window.viewer.entities.remove(item)
        })
    }
    ,

}
export default layer;
