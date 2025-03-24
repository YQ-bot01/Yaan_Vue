import * as Cesium from 'cesium'
import eqMark from '@/assets/images/DamageAssessment/eqMark.png';
import yaan from "@/assets/geoJson/yaan.json";
import {
  getEqOutPutJueCe, getEqOutPutJueCeLocal,
  getEqOutputMap,
  getEqOutputReport,
  saveIntensityCircle
} from "../../api/system/damageassessment.js";
import countyCodeMap from "../../assets/json/DamageAssessment/countyCodeMap.json";
import {domainName, zaiSunFuZhuJueCe, zaisunimageipLocal} from "../../utils/server.js";
import hospitalIcon from "@/assets/icons/svg/hospital.png";
import villageIcon from "@/assets/icons/svg/village.png";
// 雅安行政区加载
export function addYaanLayer() {
  //雅安行政区加载
  let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
    stroke: Cesium.Color.RED,
    fill: Cesium.Color.SKYBLUE.withAlpha(0.1),
    strokeWidth: 4,
  });
  geoPromise.then((dataSource) => {
    window.viewer.dataSources.add(dataSource);
    dataSource.name = 'YaanRegionLayer'; // 给图层取名字,以便删除时找到

    // const colors = [
    //   {color: Cesium.Color.GOLD.withAlpha(0.5), name: '雨城区'},
    //   {color: Cesium.Color.GOLD.withAlpha(0.5), name: '雨城区'},
    //   {color: Cesium.Color.LIGHTGREEN.withAlpha(0.5), name: '名山区'},
    //   {color: Cesium.Color.LAVENDER.withAlpha(0.5), name: '荥经县'},
    //   {color: Cesium.Color.ORANGE.withAlpha(0.5), name: '汉源县'},
    //   {color: Cesium.Color.CYAN.withAlpha(0.5), name: '石棉县'},
    //   {color: Cesium.Color.TAN.withAlpha(0.5), name: '天全县'},
    //   {color: Cesium.Color.SALMON.withAlpha(0.5), name: '芦山县'},
    //   {color: Cesium.Color.LIGHTBLUE.withAlpha(0.5), name: '宝兴县'},
    // ];
    // dataSource.entities.values.forEach((entity, index) => {
    //   // console.log("dataSource entity",entity)
    //   // 根据实体索引依次从颜色数组中取颜色
    //   const colorIndex = index % colors.length; // 通过模运算确保不会超出颜色数组范围
    //   const colorMaterial = new Cesium.ColorMaterialProperty(colors[colorIndex].color); // 使用 ColorMaterialProperty 包装颜色
    //   entity.polygon.material = colorMaterial; // 设置填充颜色
    //   // console.log("--------", index, "----------------", entity)
    // });
    // yaan.features.forEach((feature) => {
    //   let center = feature.properties.center;
    //
    //   if (center && center.length === 2) {
    //     let position = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
    //     let regionlabel = viewer.entities.add(new Cesium.Entity({
    //       position: position,
    //       label: new Cesium.LabelGraphics({
    //         text: feature.properties.name,
    //         scale: 1,
    //         font: '18px Sans-serif',
    //         style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    //         outlineWidth: 2,
    //         verticalOrigin: Cesium.VerticalOrigin.CENTER,
    //         horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    //         fillColor: Cesium.Color.fromCssColorString("#ffffff"),
    //         pixelOffset: new Cesium.Cartesian2(0, 0)
    //       })
    //     }));
    //     this.RegionLabels.push(regionlabel)
    //   }
    // })

    //雅安行政区加载 end
  })
}

export function addHospitalLayer() {
  // GeoJSON文件路径
  const geoJsonUrl = new URL("@/assets/geoJson/hospital.geojson", import.meta.url).href;
  if (viewer.dataSources.getByName("hospital").length === 0) {
    // 使用fetch加载GeoJSON文件
    fetch(geoJsonUrl)
      .then((response) => response.json())
      .then((geoJsonData) => {
        // 将GeoJSON数据加载到Cesium
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load(geoJsonData, {
          stroke: Cesium.Color.GREEN,
          fill: Cesium.Color.GREEN.withAlpha(0.5),
          strokeWidth: 2,
          clampToGround: true,
        })).then(function (dataSource) {
          // 给 dataSource 添加 name 属性
          dataSource.name = "hospital";

          // 遍历每个实体，添加图片标记
          dataSource.entities.values.forEach(function (entity) {
            // entity.properties = new Cesium.PropertyBag();
            // entity.properties.sourceName = "hospital";
            entity.properties.sourceName = "hospital";  // 追加自定义的属性
            entity.billboard = new Cesium.BillboardGraphics({
              image: hospitalIcon,
              width: 32, // 图片宽度
              height: 32, // 图片高度
              scale: 1, // 图片缩放
            });
          });
        })
      })
      .catch((error) => {
        console.error("Error loading GeoJSON:", error);
      });
  }

}

// 绘制村庄
export function addVillageLayer() {
  // GeoJSON文件路径
  const geoJsonUrl = new URL("@/assets/geoJson/village.geojson", import.meta.url).href;
  if (viewer.dataSources.getByName("village").length === 0) {
    // 使用fetch加载GeoJSON文件
    fetch(geoJsonUrl)
      .then((response) => response.json())
      .then((geoJsonData) => {
        // 将GeoJSON数据加载到Cesium
        viewer.dataSources.add(Cesium.GeoJsonDataSource.load(geoJsonData, {
          stroke: Cesium.Color.GREEN,
          fill: Cesium.Color.GREEN.withAlpha(0.5),
          strokeWidth: 2,
          clampToGround: true,
        })).then(function (dataSource) {
          // 给 dataSource 添加 name 属性
          dataSource.name = "village";

          // 遍历每个实体，添加图片标记
          dataSource.entities.values.forEach(function (entity) {
            entity.properties.sourceName = "village";  // 追加自定义的属性
            entity.billboard = new Cesium.BillboardGraphics({
              image: villageIcon, // 使用导入的图片
              width: 32, // 图片宽度
              height: 32, // 图片高度
              scale: 1, // 图片缩放
            });
          });
        })
      })
      .catch((error) => {
        console.error("Error loading GeoJSON:", error);
      });
  }
}


// 绘制断裂带
export function addFaultZones(centerPoint) {
  // GeoJSON文件路径
  const geoJsonUrl = new URL("@/assets/geoJson/duanliedai.geojson", import.meta.url).href;

  console.log(1234554321);
  // 记录已添加的断裂带名称，避免重复
  const addedFaultNames = new Set();

  // 使用 fetch 加载 GeoJSON 文件
  fetch(geoJsonUrl)
      .then((response) => response.json())
      .then((geoJsonData) => {
        // 将 GeoJSON 数据加载到 Cesium
        viewer.dataSources.add(
            Cesium.GeoJsonDataSource.load(geoJsonData, {
              stroke: Cesium.Color.RED,
              fill: Cesium.Color.RED.withAlpha(0.5),
              strokeWidth: 3,
              clampToGround: true,
            })
        ).then(function (dataSource) {
          // 给 dataSource 添加 name 属性
          dataSource.name = "faultZone";

          // 遍历所有实体，提取断层名称并添加 label
          dataSource.entities.values.forEach((entity) => {
            if (entity.properties && entity.properties.O_Com) {
              // 提取断裂带名称
              const faultNameMatch = entity.properties.O_Com.getValue().match(/"断层名称":"([^"]+)"/);
              if (faultNameMatch) {
                const faultName = faultNameMatch[1];

                // 如果该名称已经添加，则跳过
                if (addedFaultNames.has(faultName)) {
                  return;
                }

                // 获取线条的第一个坐标点作为标签位置
                if (entity.polyline && entity.polyline.positions) {
                  const positions = entity.polyline.positions.getValue(Cesium.JulianDate.now());
                  if (positions && positions.length > 0) {
                    const labelPosition = positions[Math.floor(positions.length / 2)]; // 取中点

                    // 添加标签
                    entity.label = new Cesium.LabelGraphics({
                      text: faultName,
                      font: "16px sans-serif",
                      fillColor: Cesium.Color.WHITE,
                      outlineColor: Cesium.Color.BLACK,
                      outlineWidth: 2,
                      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                      pixelOffset: new Cesium.Cartesian2(0, -10), // 轻微上移，避免与线条重叠
                      showBackground: true,
                      backgroundColor: new Cesium.Color(0, 0, 0, 0.5),
                      disableDepthTestDistance: Number.POSITIVE_INFINITY, // 确保不被地形遮挡
                    });

                    // 设置标签位置
                    entity.position = labelPosition;

                    // 记录该名称已被添加
                    addedFaultNames.add(faultName);
                  }
                }
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error("Error loading GeoJSON:", error);
      });
}

// 绘制历史地震点
export function addHistoryEqPoints(centerPoint, eqData, radius, filteredeqids) {
  let entities = window.viewer.entities.values;
  for (let i = entities.length - 1; i >= 0; i--) {
    if (entities[i].properties?.type && ['historyEq'].includes(entities[i].properties.type.getValue())) {
      window.viewer.entities.remove(entities[i]);
    }
  }
  // 圆圈的大小
  const semiMinorAxis = radius * 1000 || 50000.0;
  const semiMajorAxis = radius * 1000 || 50000.0;
  // console.log(eqData)

  // 添加圆圈
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(Number(centerPoint.longitude), Number(centerPoint.latitude)),
    ellipse: {
      semiMinorAxis: semiMinorAxis,
      semiMajorAxis: semiMajorAxis,
      material: Cesium.Color.YELLOW.withAlpha(0.2),
      outline: true,
      outlineColor: Cesium.Color.RED,
      outlineWidth: 2,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      fill: true,
      clampToGround: true,
      rotation: 0,
    },
    properties: {
      type: "historyEq"
    },
  });

  const center = Cesium.Cartesian3.fromDegrees(Number(centerPoint.longitude), Number(centerPoint.latitude));
  let historyEqData = [];

  const eqids = filteredeqids || eqData.map(eq => eq.eqid);

  console.log("eqids", eqids)

  // 渲染在圆圈内的地震点，并存储原始数据
  eqData.forEach((eq) => {
    // console.log("数据：", eq)
    if (eq.eqid !== centerPoint.eqid && eqids.includes(eq.eqid)) {
      const position = Cesium.Cartesian3.fromDegrees(Number(eq.longitude), Number(eq.latitude));

      // 判断是否在椭圆内
      const distance = Cesium.Cartesian3.distance(position, center);
      const roundRadius = Math.max(semiMajorAxis, semiMinorAxis);

      if (distance <= roundRadius) {
        const size = parseFloat(eq.magnitude) >= 6.0 ? 20 : 15; // 震级大于等于6.0为20，其他为15
        historyEqData.push(eq);
        viewer.entities.add({
          position: position,
          billboard: {
            image: eqMark,
            width: size,
            height: size,
            eyeOffset: new Cesium.Cartesian3(0, 0, -5000)
          },
          label: {
            show: false,
            showBackground: true,
            text: `${timestampToTime(eq.occurrenceTime, 'date')} ${eq.earthquakeName} ${eq.magnitude}级地震`,
            font: '16px sans-serif',
            fillColor: Cesium.Color.WHITE,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
          },
          properties: {
            tableName: `${timestampToTime(eq.occurrenceTime, 'date')} ${eq.earthquakeName} ${eq.magnitude}级地震`,
            historyEqTime: eq.occurrenceTime.replace('T', ' '),
            position: eq.earthquakeName,
            lon: eq.longitude,
            lat: eq.latitude,
            magnitude: eq.magnitude,
            type: "historyEq",
          },
          id: eq.eqid,
          layer: "历史地震"
        });
      }
    }

  });
  return historyEqData;
}

//计算烈度圈
export function computeOvalCircles(centerPoint) {

  // 计算椭圆长短轴------------------------------------------------------------------------------------------------------

  let lon = centerPoint.longitude;
  let lat = centerPoint.latitude;

  let longintenArray = []; //长轴烈度
  let shortintenArray = []; //短轴烈度
  let longAxisArray = []; //长轴数组
  let shortAxisArray = []; //短轴数组
  let longAndshort = []; //最终的长短轴数组，单位：千米
  var numi = 0;
  let R = 0 //震源到目标区域的距离，因为只需要震中的烈度，所以令其为零

  //汪素云-四川盆地
  let longAxis = 4.0293 + 1.3003 * centerPoint.magnitude - 3.6404 * Math.log10(R + 10); //长轴的烈度值
  let shortAxis = 2.3816 + 1.3003 * centerPoint.magnitude - 2.8573 * Math.log10(R + 5); //短轴的烈度值

  for (var i = Math.floor(longAxis); i >= 6; i--) {
    // console.log(i)
    if (longAxisArray.length >= 6) {
      break;
    }
    longintenArray.push(i); //长轴烈度

    R =
      Math.pow(10,
        (4.0293 + 1.3003 * centerPoint.magnitude - i) / 3.6404
      ) - 10;
    // console.log(R)
    longAxisArray.push(R);

  }

  //从内向外
  for (var j = Math.floor(shortAxis); j >= 6; j--) {
    //计算烈度衰减圈的每一圈距离
    //限制最多显示的烈度圈数
    if (shortAxisArray.length >= 6) {
      break;
    }
    shortintenArray.push(j); //短轴烈度
    let R1 =
      Math.pow(10,
        (2.3816 + 1.3003 * centerPoint.magnitude - j) / 2.8573
      ) - 5;
    shortAxisArray.push(R1);
  }

  for (let i = 0; i <= shortAxisArray.length - 1; i++) {
    if (longAxisArray[i] != null && shortAxisArray[i] != null) {
      (function (item, index) {
        var xy = new Array();
        xy[0] = longAxisArray[index] * 1000; //将符合条件每个长轴储存起来
        xy[1] = shortAxisArray[index] * 1000; //将符合条件每个短轴储存起来
        longAndshort[item] = xy;
      })(numi, i);
      numi++;
    }
  }

  // 计算角度------------------------------------------------------------------------------------------------------------
  var angle_list = [];
  for (var i = 0; i < fault_zone.length; i++) {
    var length_list = [];
    for (var line = 0; line < fault_zone[i].lonlat[0].length; line++) { //////算出每一个断裂带的坐标与当前震中坐标的距离（单位：度数）
      length_list.push(Math.sqrt(Math.pow(lon - parseFloat(fault_zone[i].lonlat[0][line][0]), 2) + Math.pow(lat - parseFloat(fault_zone[i].lonlat[0][line][1]), 2)))
    }
    length_list.sort(function (a, b) {
      return a - b
    });
    angle_list.push([i, length_list[0]])
  }
  angle_list.sort(function (a, b) {
    return a[1] - b[1]
  })
  var angle_num = fault_zone[angle_list[0][0]].angle;


  // 绘制烈度圈----------------------------------------------------------------------------------------------------------


  let angle_num_tmp;

  let lastsemiMajorAxis = 0;//震中
  let lastsemiMinorAxis = 0;
  let last_angle_num_tmp = 0; // 椭圆的旋转角度
  let savecircles = []  //存库信息

  //从内向外
  for (let i = 0; i < longAndshort.length; i++) {
    if (longAndshort[i][1] > longAndshort[i][0]) {
      let temp = longAndshort[i][0];
      longAndshort[i][0] = longAndshort[i][1];
      longAndshort[i][1] = temp;
      angle_num_tmp = angle_num + 90;
    } else {
      angle_num_tmp = angle_num;
    }

    // 计算椭圆边界的内部位置
    const semiMajorAxis = longAndshort[i][0];
    const semiMinorAxis = longAndshort[i][1];
    const radius = Math.max(semiMajorAxis, semiMinorAxis) * 0.8; // 标签距离边界的距离
    const offsetAngle = Cesium.Math.toRadians(angle_num_tmp); // 椭圆的旋转角度

    // 计算标签位置
    const offsetX = radius * Math.cos(offsetAngle);
    const offsetY = radius * Math.sin(offsetAngle);

    // 渲染椭圆
    //计算烈度圈进行存储
    savecircles.push(computecircle(semiMajorAxis, semiMinorAxis, angle_num_tmp, longintenArray[i], lastsemiMajorAxis, lastsemiMinorAxis, last_angle_num_tmp, centerPoint))
    //内环
    lastsemiMajorAxis = semiMajorAxis;
    lastsemiMinorAxis = semiMinorAxis;
    last_angle_num_tmp = angle_num_tmp; // 旋转角度
  }
  saveIntensityCircle(savecircles).then(res => {
  })
}

// 绘制烈度圈
export function addOvalCircles(centerPoint) {

  // 计算椭圆长短轴------------------------------------------------------------------------------------------------------

  let lon = centerPoint.longitude;
  let lat = centerPoint.latitude;

  let longintenArray = []; //长轴烈度
  let shortintenArray = []; //短轴烈度
  let longAxisArray = []; //长轴数组
  let shortAxisArray = []; //短轴数组
  let longAndshort = []; //最终的长短轴数组，单位：千米
  var numi = 0;
  let R = 0 //震源到目标区域的距离，因为只需要震中的烈度，所以令其为零

  //汪素云-四川盆地
  let longAxis = 4.0293 + 1.3003 * centerPoint.magnitude - 3.6404 * Math.log10(R + 10); //长轴的烈度值
  let shortAxis = 2.3816 + 1.3003 * centerPoint.magnitude - 2.8573 * Math.log10(R + 5); //短轴的烈度值

  for (var i = Math.floor(longAxis); i >= 6; i--) {
    // console.log(i)
    if (longAxisArray.length >= 6) {
      break;
    }
    longintenArray.push(i); //长轴烈度

    R =
      Math.pow(10,
        (4.0293 + 1.3003 * centerPoint.magnitude - i) / 3.6404
      ) - 10;
    // console.log(R)
    longAxisArray.push(R);
  }
  for (var j = Math.floor(shortAxis); j >= 6; j--) {
    //计算烈度衰减圈的每一圈距离
    //限制最多显示的烈度圈数
    if (shortAxisArray.length >= 6) {
      break;
    }
    shortintenArray.push(j); //短轴烈度
    let R1 =
      // Math.exp(
      //     (1.331+1.218 * centerPoint.magnitude - j) /1.381
      // ) -  8.88;
      Math.pow(10,
        (2.3816 + 1.3003 * centerPoint.magnitude - j) / 2.8573
      ) - 5;
    shortAxisArray.push(R1);
  }

  for (let i = 0; i <= shortAxisArray.length - 1; i++) {
    if (longAxisArray[i] != null && shortAxisArray[i] != null) {
      (function (item, index) {
        var xy = new Array();
        xy[0] = longAxisArray[index] * 1000; //将符合条件每个长轴储存起来
        xy[1] = shortAxisArray[index] * 1000; //将符合条件每个短轴储存起来
        longAndshort[item] = xy;
      })(numi, i);
      numi++;
    }
  }

  // 计算角度------------------------------------------------------------------------------------------------------------
  var angle_list = [];
  for (var i = 0; i < fault_zone.length; i++) {
    var length_list = [];
    for (var line = 0; line < fault_zone[i].lonlat[0].length; line++) { //////算出每一个断裂带的坐标与当前震中坐标的距离（单位：度数）
      length_list.push(Math.sqrt(Math.pow(lon - parseFloat(fault_zone[i].lonlat[0][line][0]), 2) + Math.pow(lat - parseFloat(fault_zone[i].lonlat[0][line][1]), 2)))
    }
    length_list.sort(function (a, b) {
      return a - b
    });
    angle_list.push([i, length_list[0]])
  }
  angle_list.sort(function (a, b) {
    return a[1] - b[1]
  })
  var angle_num = fault_zone[angle_list[0][0]].angle;


  // 绘制烈度圈----------------------------------------------------------------------------------------------------------

  let colorIntensity = [
    "#990000",
    "#cc0000",
    "#ff0000",
    "#ff6600",
    "#FF9900",
    "#ffcc00",
  ];

  let intensityLabels = [
    "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ", "X", "XI", "XII"
  ];
  let intensityLabelsChinese = [
    "六", "七", "八", "九", "十", "十一", "十二"
  ];

  let angle_num_tmp;

  let lastsemiMajorAxis = 0;//震中
  let lastsemiMinorAxis = 0;
  let last_angle_num_tmp = 0; // 椭圆的旋转角度
  let savecircles = []  //存库信息

  for (let i = longAndshort.length - 1; i >= 0; i--) {
    if (longAndshort[i][1] > longAndshort[i][0]) {
      let temp = longAndshort[i][0];
      longAndshort[i][0] = longAndshort[i][1];
      longAndshort[i][1] = temp;
      angle_num_tmp = angle_num + 90;
    } else {
      angle_num_tmp = angle_num;
    }

    // 计算椭圆边界的内部位置
    const semiMajorAxis = longAndshort[i][0];
    const semiMinorAxis = longAndshort[i][1];
    const radius = Math.max(semiMajorAxis, semiMinorAxis) * 0.8; // 标签距离边界的距离
    const offsetAngle = Cesium.Math.toRadians(angle_num_tmp); // 椭圆的旋转角度

    // 计算标签位置
    const offsetX = radius * Math.cos(offsetAngle);
    const offsetY = radius * Math.sin(offsetAngle);

    // 渲染椭圆
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(parseFloat(centerPoint.longitude), parseFloat(centerPoint.latitude), 0),
      ellipse: {
        semiMinorAxis: semiMinorAxis,
        semiMajorAxis: semiMajorAxis,
        material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(colorIntensity[i]).withAlpha(0.5)),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString(colorIntensity[i]),
        outlineWidth: 9,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        fill: true,
        clampToGround: true,
        rotation: Cesium.Math.toRadians(angle_num_tmp),
      },
      properties: {
        type: 'ovalCircle'  // 设置 type 属性
      },
      layername: "烈度圈",
    });

    // 添加显示烈度的标签
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(
        parseFloat(centerPoint.longitude) + offsetX / 111320,
        parseFloat(centerPoint.latitude) + offsetY / 110540,
        0
      ),
      label: {
        //最多画到6度
        text: "烈度 : " + intensityLabels[longintenArray[i] - 6] + " (" + intensityLabelsChinese[longintenArray[i] - 6] + "度)",
        font: '18px Sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        show: true,
        eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
      },
      properties: {
        type: 'ovalCircle'  // 设置 type 属性
      },
      layername: "烈度圈",
    });

    //计算烈度圈进行存储
    savecircles.push(computecircle(semiMajorAxis, semiMinorAxis, angle_num_tmp, longintenArray[i], lastsemiMajorAxis, lastsemiMinorAxis, last_angle_num_tmp, centerPoint))
    //内环
    lastsemiMajorAxis = semiMajorAxis;
    lastsemiMinorAxis = semiMinorAxis;
    last_angle_num_tmp = angle_num_tmp; // 旋转角度
  }
  // saveIntensityCircle(savecircles).then(res => {
  // })
}

export function addOCTest(eqid, eqqueueId, centerPosition) {
  // 自定义的烈度圈等级与颜色渲染
  let intensityLabel = [
    {
      level: "Ⅵ (六度)",
      color: "#ff6600"
    },
    {
      level: "Ⅶ (七度)",
      color: "#ff3300"
    },
    {
      level: "Ⅷ (八度)",
      color: "#ff0000"
    },
    {
      level: "Ⅸ (九度)",
      color: "#aa0000"
    },
    {
      level: "Ⅹ (十度)",
      color: "#660000"
    },
    {
      level: "Ⅺ (十一度)",
      color: "#330000"
    },
    {
      level: "Ⅻ (十二度)",
      color: "#330000"
    }
  ];

  /**
   * 烈度圈部分
   */
  // 本地测试请解开↓↓↓
  // fetch(`/ThematicMap/be3a5ea4-8dfd-a0a2-2510-21845f17960b01_intensity.geojson`)
  // fetch(`/ThematicMap/5a72f3d7-0546-4fee-a686-627d45e5965f02_intensity.geojson`)
    // 真实数据请解开↓↓↓
    fetch(`${zaisunimageipLocal}/profile/upload/yxcdown/${eqqueueId}/${eqqueueId}_intensity.geojson`)
    .then((response) => response.json())
    .then((geojsonData) => {
      let ovalCirclePromise = Cesium.GeoJsonDataSource.load(geojsonData, {
        stroke: true,
        fill: false,
        strokeWidth: 2,
        markerSymbol: "?"
      });

      // 渲染烈度圈图层
      ovalCirclePromise.then(OCDataSource => {
        window.viewer.dataSources.add(OCDataSource);
        OCDataSource.name = "ovalCircleTest";

        // 计算两个点之间的距离
        function getDistance(lon1, lat1, lon2, lat2) {
          let geodesic = new Cesium.EllipsoidGeodesic();
          geodesic.setEndPoints(
            Cesium.Cartographic.fromDegrees(lon1, lat1),
            Cesium.Cartographic.fromDegrees(lon2, lat2)
          );
          return geodesic.surfaceDistance;
        }

        // 插值球面坐标
        function interpolateSpherical(lon1, lat1, lon2, lat2, ratio) {
          let cart1 = Cesium.Cartesian3.fromDegrees(lon1, lat1);
          let cart2 = Cesium.Cartesian3.fromDegrees(lon2, lat2);
          let resultCart = new Cesium.Cartesian3();
          Cesium.Cartesian3.lerp(cart1, cart2, ratio, resultCart);
          let cartographic = Cesium.Cartographic.fromCartesian(resultCart);
          return [Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)];
        }

        // 计算两个点之间的距离和球面坐标，确保geojson从内到外渲染
        let distanceArray = geojsonData.features
          .map((feature, index) => {
            if (feature.geometry.type === "Polygon") {
              let coordinates = feature.geometry.coordinates[0];
              if (coordinates && coordinates.length > 0) {
                let firstPoint = coordinates[0];
                let longitude = firstPoint[0];
                let latitude = firstPoint[1];
                let distance = getDistance(centerPosition[0], centerPosition[1], longitude, latitude);
                return {index, longitude, latitude, distance, feature};
              }
            }
            return null;
          })
          .filter((item) => item !== null)
          .sort((a, b) => a.distance - b.distance);

        // 初始化第一个点为震中，后续则往外计算，确保烈度等级与烈度圈边缘的距离
        let lastLon = centerPosition[0];
        let lastLat = centerPosition[1];

        let i = geojsonData.features.length - 1;

        // 渲染顺序按照距离排序
        distanceArray.forEach((item, sortedIndex) => {
          let {longitude, latitude, feature, index} = item;

          // let colorIndex = sortedIndex % intensityLabel.length;
          let fillColor = Cesium.Color.fromCssColorString(intensityLabel[i].color);

          // **获取对应的实体**
          let entity = OCDataSource.entities.values[index];

          if (entity && entity.polygon) {
            entity.polygon.material = fillColor.withAlpha(0.5);
            entity.polygon.outline = false;
            entity.polygon.outlineWidth = 2.0;
          }

          // 计算新的经纬度
          let [newLon, newLat] = interpolateSpherical(lastLon, lastLat, longitude, latitude, 0.6);
          let labelText = intensityLabel[i].level;

          window.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(newLon, newLat),
            label: {
              text: labelText,
              font: "18px sans-serif",
              fillColor: Cesium.Color.WHITE,
              backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
              showBackground: true,
              horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
              pixelOffset: new Cesium.Cartesian2(10, 0),
              eyeOffset: new Cesium.Cartesian3(0, 0, -1000) // 确保标签在最上层
            },
            properties: {
              type: "ovalCircleTest"
            },
          });

          lastLon = longitude;
          lastLat = latitude;
          // 倒序等级
          i--;
        });
      });
    })
    .catch((error) => {
      console.error("加载失败:", error);
    });
}


/**
 * 灾损接口：4.2.10.获取乡镇级评估结果（v1.1）getResultTown
 * @param town
 * @returns {{personalCasualtyData: {county: *, casualty: *, partTotal}[], buildingDamageData: {size: number, county: *}[], economicLossData: {amount: number, county: *}[]}}
 */
export function handleTownData(town) {
  console.log("数据：", town)

  const townData = town;
  /**
   * 根据pac前6位与countyCodeMap.json中的adcode进行匹配，将乡镇级数据转换成区县级(累加)
   */

    // 万平方米 万元 人
  let countyDataArray = [];

  for (let i = 0; i < townData.length; i++) {
    for (let j = 0; j < countyCodeMap.length; j++) {
      // 判断是否匹配区县
      if (Number(townData[i].pac.slice(0, 6)) === countyCodeMap[j].adCode) {
        const county = countyCodeMap[j].county;
        const batch = townData[i].batch;

        // 查找是否已有对应的 batch 和 county
        let existingEntry = countyDataArray.find(
          (entry) => entry.batch === batch && entry.county === county
        );

        if (existingEntry) {
          /**
           * 累加已有数据
           */

          // 建筑破坏
          existingEntry.buildingDamage += Number(townData[i].buildingDamage) || 0;

          // 经济损失
          existingEntry.economicLoss += Number(townData[i].economicLoss) || 0;

          // 人员伤亡系列
          // 受灾人数
          existingEntry.personalCasualty.pops += Number(townData[i]['pop']) || 0;
          // 死亡人数
          existingEntry.personalCasualty.death += Number(townData[i].death) || 0;
          // 失踪人数
          existingEntry.personalCasualty.missing += Number(townData[i].missing) || 0;
          // 受伤人数
          existingEntry.personalCasualty.injury += Number(townData[i].injury) || 0;
          // 压埋人数
          existingEntry.personalCasualty.buriedCount += Number(townData[i].buriedCount) || 0;
          // 需转移安置人数
          existingEntry.personalCasualty.resetNumber += Number(townData[i].resetNumber) || 0;
        } else {
          /**
           * 新增数据
           */
          countyDataArray.push({
            batch: batch,
            county: county,
            buildingDamage: Number(townData[i].buildingDamage) || 0,
            economicLoss: Number(townData[i].economicLoss) || 0,
            personalCasualty: {
              pops: Number(townData[i]['pop']) || 0,
              death: Number(townData[i].death) || 0,
              missing: Number(townData[i].missing) || 0,
              injury: Number(townData[i].injury) || 0,
              buriedCount: Number(townData[i].buriedCount) || 0,
              resetNumber: Number(townData[i].resetNumber) || 0,
            },
          });
        }
      }
    }
  }

  // console.log(countyDataArray);

  /**
   * 提取雅安市八区数据
   */

  const yaanCounties = [
    '雨城区', '名山区', '荥经县', '汉源县', '石棉县', '天全县', '芦山县', '宝兴县'
  ];
  const yaanCountyData = countyDataArray.filter(entry => yaanCounties.includes(entry.county));
  console.log(yaanCountyData);

  /**
   * 提取区县级数据中的建筑破坏、经济损失、人员伤亡数据，并转成对应格式
   */

    // 建筑破坏
  const buildingDamageData = yaanCountyData.map(entry => ({
      county: entry.county,
      size: parseFloat((entry.buildingDamage / 100).toFixed(2)),
    }));

  // 经济损失
  const economicLossData = yaanCountyData.map(entry => ({
    county: entry.county,
    amount: parseFloat(entry.economicLoss),
  }));

  // 人员伤亡
  const personalCasualtyData = yaanCountyData.map(entry => ({
    county: entry.county,
    casualty: entry.personalCasualty,
    // 不包括受灾人数和需转移安置人数的伤亡人数
    partTotal: entry.personalCasualty.death + entry.personalCasualty.missing + entry.personalCasualty.injury + entry.personalCasualty.buriedCount
  }))

  return {
    buildingDamageData,
    economicLossData,
    personalCasualtyData,
  }
}

/**
 * 灾损接口：4.2.9.获取专题图件getMap与灾情报告getReport
 * @param eqid
 * @param eqqueueId
 * @param eqFullName
 * @param type
 */
export function handleOutputData(eqid, eqqueueId, eqFullName, type) {
  const DTO = {
    eqid: eqid,
    eqqueueId: eqqueueId,
  };

  const batch = eqqueueId.slice(-1);

  // 初始化返回数据
  let returnData = {
    // 标题
    themeName: "",
    // 对应数据
    themeData: []
  };

  return new Promise((resolve, reject) => {
    if (type === "thematicMap") {
      getEqOutputMap(DTO).then((res) => {
        const data = res.data;
        const themeName = eqFullName + "-" + "专题图";
        let thematicMapData = [];
        const url = `${domainName}/jcpt/profile/EqProduct/${eqid}/${batch}/本地产品/专题图`;
        const urlBase = 'http://59.213.183.7/jcpt';  // 设置新的基础 URL
        console.log("专题图")
        for (let i = 0; i < res.data.length; i++) {
          const thematicMapObject = {
            // imgUrl: `${url}${data[i].localSourceFile}`,
            imgUrl: `${zaisunimageipLocal}${data[i].sourceFile}`,
            theme: data[i].fileName,
          };
          console.log("专题图",thematicMapObject)
          thematicMapData.push(thematicMapObject);
        }

        returnData.themeName = themeName;
        returnData.themeData = thematicMapData;

        resolve(returnData); // 返回更新后的数据
      }).catch(err => {
        reject(err); // 如果请求失败，返回错误
      });
    } else if (type === "report") {
      getEqOutputReport(DTO).then((res) => {
        console.log("灾情报告数据：", res);
        const data = res.data;
        const themeName = eqFullName + "-" + "灾情报告";
        let reportData = [];
        console.log("报告")
        for (let i = 0; i < res.data.length; i++) {
          const reportObject = {
            docxUrl: `${zaisunimageipLocal}${data[i].sourceFile}`,
            theme: data[i].fileName,
          };
          console.log(reportObject)
          reportData.push(reportObject);
        }

        returnData.themeName = themeName;
        returnData.themeData = reportData;
        resolve(returnData); // 这里也是异步，所以也需要 resolve
      }).catch(err => {
        reject(err);
      });
    }
    // else if(type==="AssistantDecision"){
    //   getEqOutPutJueCe(DTO).then((res) => {
    //     console.log("辅助决策数据：", res);
    //     const data = res.data;
    //     const themeName = eqFullName + "-" + "辅助决策报告";
    //     let reportData = [];
    //     for (let i = 0; i < res.data.length; i++) {
    //       const reportObject = {
    //         docxUrl: `${zaiSunFuZhuJueCe}${data[i].sourceFile}`,
    //         theme: data[i].fileName,
    //       }
    //       reportData.push(reportObject);
    //     }
    //     returnData.themeName = themeName;
    //     returnData.themeData = reportData;
    //     resolve(returnData); // 这里也是异步，所以也需要 resolve
    //   }).catch(err => {
    //     reject(err);
    //   });
    // }
    else if(type==="AssistantDecision"){
      getEqOutPutJueCeLocal(DTO).then((res) => {
        console.log("辅助决策数据：", res);
        const data = res.data;
        const themeName = eqFullName + "-" + "辅助决策报告";
        let jueceData = [];

        for (let i = 0; i < res.data.length; i++) {
          const fullPath = `${zaiSunFuZhuJueCe}${data[i].sourceFile}`;
          console.log("docxUrl:", fullPath); // 检查路径是否正确
          const reportObject = {
            docxUrl: fullPath,
            theme: data[i].fileName,
          };
          console.log(reportObject)
          jueceData.push(reportObject);
        }

        returnData.themeName = themeName;
        returnData.themeData = jueceData;
        resolve(returnData); // 这里也是异步，所以也需要 resolve
      }).catch(err => {
        reject(err);
      });
    }
    else {
      resolve(returnData); // 如果 type 不是 "thematicMap" 或 "report"，直接返回默认值
    }
  });
}


// -----------------------------------------------------------------------------------------------------------------
// 共用函数
// -----------------------------------------------------------------------------------------------------------------

function computecircle(majorAxis, minorAxis, rotationAngle, intensity, lastlong, lastshort, lastrotationAngle, centerPoint) {
  let IntensityCircle = {
    eqid: centerPoint.eqid,
    intensity: intensity,
    geom: '',
  };

  //外环
  // // 将角度转换为弧度
  const rotationAngleRad = rotationAngle * (Math.PI / 180);
  // 计算椭圆的四个顶点
  const outlinepoints = [];
  const angleStep = Math.PI / 2; // 90度的弧度
  // 长轴和短轴的四个方向
  const directions = [
    {angle: rotationAngleRad, type: 'major'},
    {angle: rotationAngleRad + Math.PI / 2, type: 'minor'},
    {angle: rotationAngleRad + Math.PI, type: 'major'},
    {angle: rotationAngleRad + 3 * Math.PI / 2, type: 'minor'},
    {angle: rotationAngleRad, type: 'major'}, //首位相连，围成环
  ];
  directions.forEach(direction => {
    const angle = direction.angle;
    const type = direction.type;
    let distance = type === 'major' ? majorAxis : minorAxis;

    // 计算经度和纬度的增量
    const deltaX = distance * Math.cos(angle) / 111319.9; // 经度增量，每度约等于111.32公里
    const deltaY = distance * Math.sin(angle) / 110574; // 纬度增量，每度约等于110.57公里
    // console.log(deltaX,deltaY)
    const vertexLongitude = parseFloat(centerPoint.longitude) + deltaX;
    const vertexLatitude = parseFloat(centerPoint.latitude) + deltaY;

    outlinepoints.push({
      longitude: vertexLongitude,
      latitude: vertexLatitude
    });
  });

  //内环
  // 计算椭圆的四个顶点
  const inlinepoints = [];
  // // 将角度转换为弧度
  const rotationAngleRad_in = lastrotationAngle * (Math.PI / 180);
  // 长轴和短轴的四个方向
  const directions_in = [
    {angle: rotationAngleRad_in, type: 'major'},
    {angle: rotationAngleRad_in + Math.PI / 2, type: 'minor'},
    {angle: rotationAngleRad_in + Math.PI, type: 'major'},
    {angle: rotationAngleRad_in + 3 * Math.PI / 2, type: 'minor'},
    {angle: rotationAngleRad_in, type: 'major'}, //首位相连，围成环
  ];
  if (lastlong != 0) {
    directions_in.forEach(direction => {
      const angle = direction.angle;
      const type = direction.type;
      let distance = type === 'major' ? lastlong : lastshort;
      // 计算经度和纬度的增量
      const deltaX = distance * Math.cos(angle) / 111319.9; // 经度增量，每度约等于111.32公里
      const deltaY = distance * Math.sin(angle) / 110574; // 纬度增量，每度约等于110.57公里
      // console.log(deltaX,deltaY)
      const vertexLongitude = parseFloat(centerPoint.longitude) + deltaX;
      const vertexLatitude = parseFloat(centerPoint.latitude) + deltaY;

      inlinepoints.push({
        longitude: vertexLongitude,
        latitude: vertexLatitude
      });
    });
  }

  IntensityCircle.geom = buildCurvePolygonString(outlinepoints, inlinepoints)
  return IntensityCircle;
}

function buildCurvePolygonString(outlinepoints, inlinepoints) {
  let curvePolygonString = ''
  // 构建CIRCULARSTRING部分
  let outline = 'CIRCULARSTRING(';
  outlinepoints.forEach((point, index) => {
    outline += `${point.longitude} ${point.latitude}`;
    if (index < outlinepoints.length - 1) {
      outline += ', ';
    }
  });
  outline += ')';
  //最高烈度没有内环
  if (inlinepoints.length == 0) {
    // 组合成最终的CURVEPOLYGON字符串
    curvePolygonString = `CURVEPOLYGON(${outline})`;
  } else {
    let inline = 'CIRCULARSTRING(';
    inlinepoints.forEach((point, index) => {
      inline += `${point.longitude} ${point.latitude}`;
      if (index < inlinepoints.length - 1) {
        inline += ', ';
      }
    });
    inline += ')';
    // 组合成最终的CURVEPOLYGON字符串
    curvePolygonString = `CURVEPOLYGON(${outline}, ${inline})`;
  }
  return curvePolygonString;
}

// 时间戳转换
export function timestampToTime(timestamp, format = "full") {
  let dateObj = new Date(timestamp);
  let year = dateObj.getFullYear();
  let month = dateObj.getMonth() + 1;
  let day = dateObj.getDate();
  let hh = dateObj.getHours();
  let mm = dateObj.getMinutes();
  let ss = dateObj.getSeconds();

  // 去掉前导零
  month = month > 9 ? month : month.toString().replace(/^0/, "");
  day = day > 9 ? day : day.toString().replace(/^0/, "");
  hh = hh > 9 ? hh : "0" + hh;
  mm = mm > 9 ? mm : "0" + mm;
  ss = ss > 9 ? ss : "0" + ss;

  if (format === "date") {
    // 返回仅日期格式
    return `${year}年${month}月${day}日`;
  } else if (format === "fullDateTime") {
    return `${year}年${month}月${day}日 ${hh}:${mm}:${ss}`;
  } else {
    // 返回完整的日期时间格式
    return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
  }
}

export function removeDataSourcesLayer(layerName) {
  // 通过图层名称获取数据源对象如果存在，则执行移除操作
  const dataSource = window.viewer.dataSources.getByName(layerName)[0];
  if (dataSource) {
    window.viewer.dataSources.remove(dataSource);
    // console.log(dataSource)
  }
}

