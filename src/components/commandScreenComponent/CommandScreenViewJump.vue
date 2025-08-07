<template>
  <div>
    <div class="panelTop">
      <h2 class="panelName">视角跳转</h2>
    </div>
    <span>
                <!-- 视角跳转的 SVG 图标 -->
                  <svg t="1730573546101" class="icon" viewBox="0 0 1024 1024" version="1.1"
                       xmlns="http://www.w3.org/2000/svg" p-id="2695" width="28" height="28" style="margin-right: 8px;">
                        <path
                            d="M1023.886285 0.170629v223.921795l-248.549211-224.1493 248.549211 0.227505z m-185.814707 347.286381v2.218173c113.013108 69.900911 185.814708 174.610087 185.814707 292.571429 0 210.555876-229.211286 381.298378-512 381.298378-282.731837 0-511.943124-170.742502-511.943123-381.298378 0-113.297489 66.88647-214.59409 172.164408-284.438125V299.851589L505.231764 117.392579l332.839814 182.45901v47.605421zM63.701438 642.246612c0 174.837592 201.114419 317.085092 448.184847 317.085092 247.184181 0 448.241724-142.247501 448.241724-317.085092 0-83.778716-46.752277-159.651633-122.056431-216.357254v283.016219l-333.067319 181.890246-332.839813-181.947123V437.83337c-66.658965 55.340591-108.463008 126.151522-108.463008 204.413242z m183.141524 5.630749l227.78938 132.180404V515.753832L246.842962 383.573428v264.303933z m258.161297-449.606754L277.214879 330.394135l227.78938 132.180404 227.846257-132.180404-227.846257-132.123528z m258.218174 185.302821L535.433053 515.753832v262.768274l227.78938-130.644745V383.573428z"
                            fill="#ffffff" p-id="2696"></path>
                      </svg>
                  <span class="node-text">经纬度跳转</span>
    </span>
    <!--    经纬度跳转-->
    <div class="panelContent">
      <div>经度：°E
        <el-input v-model="positionFlyToLocal.lon" class="positionFlyToInput" @keyup.enter="flyToPosition"
        ></el-input>
      </div>
      <div style="margin-left: 10px">纬度：°N
        <el-input v-model="positionFlyToLocal.lat" class="positionFlyToInput"
                  @keyup.enter="flyToPosition"></el-input>
      </div>
    </div>
    <div class="panelButton">
      <el-button class="panelButtons" @click="clearPositionPanel"> <p class="panelButtonsText">取消</p></el-button>
      <el-button class="panelButtons" type="primary" @click="flyToPosition">
        <p class="panelButtonsText">跳转</p>
      </el-button>
    </div>

    <!--    行政区划跳转-->
    <div style="margin-top:20px;margin-left: 10px;">
    <span>
                <!-- 视角跳转的 SVG 图标 -->
                  <svg t="1730573546101" class="icon" viewBox="0 0 1024 1024" version="1.1"
                       xmlns="http://www.w3.org/2000/svg" p-id="2695" width="28" height="28" style="margin-right: 8px;">
                        <path
                            d="M1023.886285 0.170629v223.921795l-248.549211-224.1493 248.549211 0.227505z m-185.814707 347.286381v2.218173c113.013108 69.900911 185.814708 174.610087 185.814707 292.571429 0 210.555876-229.211286 381.298378-512 381.298378-282.731837 0-511.943124-170.742502-511.943123-381.298378 0-113.297489 66.88647-214.59409 172.164408-284.438125V299.851589L505.231764 117.392579l332.839814 182.45901v47.605421zM63.701438 642.246612c0 174.837592 201.114419 317.085092 448.184847 317.085092 247.184181 0 448.241724-142.247501 448.241724-317.085092 0-83.778716-46.752277-159.651633-122.056431-216.357254v283.016219l-333.067319 181.890246-332.839813-181.947123V437.83337c-66.658965 55.340591-108.463008 126.151522-108.463008 204.413242z m183.141524 5.630749l227.78938 132.180404V515.753832L246.842962 383.573428v264.303933z m258.161297-449.606754L277.214879 330.394135l227.78938 132.180404 227.846257-132.180404-227.846257-132.123528z m258.218174 185.302821L535.433053 515.753832v262.768274l227.78938-130.644745V383.573428z"
                            fill="#ffffff" p-id="2696"></path>
                      </svg>
                  <span class="node-text">行政区划跳转</span>
    </span>
      <el-radio-group v-model="selectedDistrictLocal">
        <el-radio
            label="回到震中"
            @click.native.prevent="handleDistrictSelect('回到震中')">回到震中
        </el-radio>
        <el-radio
            label="雅安市"
            @click.native.prevent="handleDistrictSelect('雅安市')">雅安市
        </el-radio>
        <el-radio
            v-for="district in districts"
            :key="district.adcode"
            :label="district.name"
            @click.native.prevent="handleDistrictSelect(district.name)"
        >
          {{ district.name }}
        </el-radio>
      </el-radio-group>
    </div>
  </div>

</template>

<script>

import * as Cesium from 'cesium'
import layer from "@/cesium/layer.js";
import mapMark from "@/assets/地图标记.png";

export default {
  data: function () {
    return {
      positionFlyToLocal: {
        lon: "", // 经度
        lat: "", // 纬度
      },
      selectedDistrictLocal: '', // 用于追踪选中的复选框
      districts: [
        {adcode: 511802, name: "雨城区"},
        {adcode: 511803, name: "名山区"},
        {adcode: 511822, name: "荥经县"},
        {adcode: 511823, name: "汉源县"},
        {adcode: 511824, name: "石棉县"},
        {adcode: 511825, name: "天全县"},
        {adcode: 511826, name: "芦山县"},
        {adcode: 511827, name: "宝兴县"},
      ],
    }
  },
  props: ["centerPoint", "selectedDistrict", "positionFlyTo"],

  mounted() {
    if (this.selectedDistrict) {
      this.selectedDistrictLocal = this.selectedDistrict;
    }
    if (this.positionFlyTo) {
      this.positionFlyToLocal = this.positionFlyTo;
    }
  },
  methods: {
    // 飞到目标位置
    flyToPosition() {
      let lon = parseFloat(this.positionFlyToLocal.lon);
      let lat = parseFloat(this.positionFlyToLocal.lat);

      if (!isNaN(lon) && !isNaN(lat)) {
        this.$emit('viewJumpPositionFlyTo', this.positionFlyToLocal);
        this.$emit('stopTimePlay');
        let flyToMarker = viewer.entities.getById("flyToMarker")
        // **移除已有的标记（防止重复创建）**
        if (flyToMarker) {
          viewer.entities.remove(flyToMarker);
        }

        // **添加定位标记**
        viewer.entities.add({
          id: "flyToMarker",
          position: Cesium.Cartesian3.fromDegrees(lon, lat, 500), // 确保标记不会被埋
          billboard: {
            image: mapMark, // 测试图片
            width: 50, // 放大标记
            height: 50,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地显示，避免埋在地下
            show: true, // 确保可见
          },
        });
        // **飞行到目标位置**
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, 3000),
          duration: 2, // 飞行时间
        });
      } else {
        this.$message.error("请输入有效的经度、纬度和高度值！");
      }
    },
    clearPositionPanel() {
      this.positionFlyToLocal.lon = ''
      this.positionFlyToLocal.lat = ''
      let flyToMarker = viewer.entities.getById("flyToMarker")
      // **移除已有的标记（防止重复创建）**
      if (flyToMarker) {
        viewer.entities.remove(flyToMarker);
      }
    },

    handleDistrictSelect(districtName) {
      console.log(this.selectedDistrictLocal,districtName,"11111 handleDistrictSelect")
      if (this.selectedDistrictLocal === districtName) {
        this.selectedDistrictLocal='';
        layer.removeRegionLayerJump();
        this.$emit('viewJumpSelectedDistrict', districtName);
      } else {
        this.selectedDistrictLocal=districtName;
        //清除其他实体标签
        layer.removeRegionLayerJump();
        this.$emit('viewJumpSelectedDistrict', districtName);
        this.$emit('stopTimePlay');
        // 根据选中的区域进行处理
        if (districtName === '雅安市') {
          layer.addYaanCityDistrict();
        } else if (districtName === '回到震中') {
          this.backcenter();
        } else {
          const district = this.districts.find(d => d.name === districtName);
          if (district) {
            layer.addCountyLayerJump(district);
          }
        }
      }
    },
    backcenter() {
      // 根据经度和纬度创建一个三维坐标点，Z轴设置为120000，以确保视角高度
      const position = Cesium.Cartesian3.fromDegrees(
          parseFloat(this.centerPoint.longitude),
          parseFloat(this.centerPoint.latitude),
          120000,
      );
      // 飞行到计算出的中心点位置
      viewer.camera.flyTo({destination: position,})
    },


  }
}


</script>

<style scoped>
.panelTop {
  top: 0.5%;
  height: 3.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.panelName {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  position: relative;
  top: 26%;
  left: 7%;
}

.panelContent {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 8%;
  width: 87%;
  margin-top: 30px;
}

.panelButton {
  padding: 20px 25px 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.panelButtons {
  display: flex; /* 让按钮横向排列 */
  justify-content: space-between; /* 按钮左右分布 */
  align-items: center;
  width: auto; /* 适应内容 */
  gap: 12px; /* 按钮之间的间距 */
  padding: 0 16px 16px 0; /* 保留原来的 padding */
}
.panelButtonsText{
  margin-top: 30px;    padding: 0px 0px 0px 11px
}


/deep/ .el-radio {
  display: block;
  line-height: 50px;
  white-space: normal;
  margin-right: 200px;
  margin-left: 20px;
}

</style>
