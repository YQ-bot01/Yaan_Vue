<template>
  <el-dialog class="dialogDiv" v-model="DialogFormVisible" title="添加标注信息" width="800"
             :close-on-click-modal="false" :destroy-on-close="true" :show-close="false">
    <el-form :model="this.form" :inline="true">
      <el-form-item label="标注类型" :label-width="120">
        <el-input placeholder="请输入内容" v-model="form.plotType" :disabled="true" size="large"/>
      </el-form-item>
      <el-form-item label="经度" :label-width="120">
        <el-input v-model="form.geom.coordinates[0]" autocomplete="off" size="large"/>
      </el-form-item>
      <el-form-item label="纬度" :label-width="120">
        <el-input v-model="form.geom.coordinates[1]" autocomplete="off" size="large"/>
      </el-form-item>
      <el-form-item label="开始时间" :label-width="120">
        <div class="formTime">
          <el-date-picker
              v-model="starttime"
              type="datetime"
              placeholder="选择日期时间"
              value-format="x"
              size="large">
          </el-date-picker>
        </div>
      </el-form-item>
      <el-form-item label="结束时间" :label-width="120">
        <div class="formTime">
          <el-date-picker
              v-model="endtime"
              type="datetime"
              placeholder="选择日期时间"
              value-format="x"
              size="large">
          </el-date-picker>
        </div>
      </el-form-item>
      <!--      <el-row>-->
      <!--        <el-col :span="24">-->
      <!--          <el-form-item label="描述" :label-width="100" style="width: 680px">-->
      <!--            <el-input v-model="form.describe" :rows="6" type="textarea" autocomplete="off"/>-->
      <!--          </el-form-item>-->
      <!--        </el-col>-->
      <!--      </el-row>-->
      <!--  v-if 比 v-for 的优先级更高，这意味着 v-if 的条件将无法访问到 v-for 作用域内定义的变量别名。    -->
      <!--  在外先包装一层 <template> 再在其上使用 v-for 可以解决这个问题-->
      <template v-for="(value,key,index) in typeInfo">
        <el-form-item v-if="value.type ==='text'" :label="value.name" :label-width="120">
          <el-input v-model="value.value" autocomplete="off" size="large"/>
        </el-form-item>
      </template>
      <template v-for="(value,key) in typeInfo">
        <el-form-item v-if="value.type ==='select'" :label="value.name" :label-width="120">
          <el-select v-model="value.value" placeholder="请选择" size="large" style="width: 220px">
            <el-option
                v-for="item in value.content"
                :label="item.label"
                :value="item.label"/>
            <template>
              {{ item }}
            </template>
          </el-select>
        </el-form-item>
      </template>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="cancelAddNote">取消</el-button>
      <el-button type="primary" @click="commitAddNote">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {ElMessage} from 'element-plus'
import {plotType} from '@/cesium/plot/plotType.js'
import {useCesiumStore} from "@/store/modules/cesium.js";
import {insertPlotAndInfo} from '@/api/system/plot.js'
import axios from "axios";
import timeTransfer from "@/cesium/tool/timeTransfer.js";
import generalCompute from "@/cesium/plot/generalCompute.js";
import dayjs from 'dayjs';
import {getPlotBelongCounty} from '@/api/system/plot'

export default {
  name: "addMarkDialog",
  data() {
    return {
      DialogFormVisible: false,
      form: null,
      typeInfo: null,
      starttime: null,
      endtime: null
    }
  },
  props: [
    'addMarkDialogFormVisible',
    'eqOccurrenceTime',
  ],
  watch: {
    addMarkDialogFormVisible() {
      // 设置默认开始时间为当前时间
      this.starttime = this.eqOccurrenceTime;  // 当前时间
      // 设置默认结束时间为10天后的时间
      this.endtime = dayjs(this.starttime).add(10, 'day').format('YYYY-MM-DD HH:mm:ss');
      // this.endtime = this.timestampToTime(fiveDaysLater);
      // 1-1 显示弹窗
      this.DialogFormVisible = this.addMarkDialogFormVisible
      // 2-1 获取pinia中存的经纬度、标绘类型等信息以及生成对应类型的dialog
      let cesiumStore = useCesiumStore()
      if (this.addMarkDialogFormVisible) {
        // 2-2 获取pinia中数据
        this.form = cesiumStore.getPointInfo1()
        console.log("plotType", this.form)
        // 2-3 生成对应类型的dialog
        for (let item in plotType) {
          if (this.form.plotType === plotType[item].name) {
            // 此处对plotType[item]用json的parse和stringify是因为需要深拷贝，而{...plotType[item]}是浅拷贝
            this.typeInfo = JSON.parse(JSON.stringify(plotType[item]))//{...plotType[item]}
            console.log("log", this.typeInfo)
            break;
          }
        }
      }
    },
  },
  methods: {
    // 取消添加标注
    cancelAddNote() {
      // 清空typeInfo信息、starttime、endtime
      this.typeInfo = null
      this.starttime = null
      this.endtime = null
      this.$emit('clearMarkDialogForm')// 调用父组件中clearMarkDialogForm对应的方法，重置标绘信息填写框里的信息
    },
    async getPlotBelongCounty(lon, lat) {
      return getPlotBelongCounty({lon: lon, lat: lat}); // 直接返回Promise
    },
    //确认添加标注
    async commitAddNote() {
      let that = this
      // 创建一个新的对象，只保留字段和它们的 value 值
      let typeInfoValues = {};
      if (this.typeInfo) {
        for (let key in this.typeInfo) {
          if (this.typeInfo.hasOwnProperty(key) && this.typeInfo[key].hasOwnProperty('value')) {
            typeInfoValues[key] = this.typeInfo[key].value;
          }
        }
      }


      //逆地址接续位置信息
      let locationInfo = {}
      let locationInfotmp = await generalCompute.getReverseGeocode(this.form.geom.coordinates[0], this.form.geom.coordinates[1]);

      console.log(locationInfotmp, "locationInfotmp")
      if (locationInfotmp === null) {
        let belongCountytmp = await this.getPlotBelongCounty(this.form.geom.coordinates[0], this.form.geom.coordinates[1])
        if (belongCountytmp === "雨城区" || belongCountytmp === "名山区" || belongCountytmp === "荥经县" || belongCountytmp === "汉源县" || belongCountytmp === "石棉县" || belongCountytmp === "天全县" || belongCountytmp === "芦山县" || belongCountytmp === "宝兴县") {
          locationInfo = {
            province: "四川省",
            city: "雅安市",
            county: belongCountytmp,
            town: null,
            address: null,
            address_distance: null,
            address_position: null,
            poi: null,
            poi_distance: null,
            road: null,
            road_distance: null,
          }
          console.log("逆地址解析失败,本地坐标匹配");
        }
        else {
          locationInfo = {
            province: null,
            city: null,
            county: null,
            town: null,
            address: null,
            address_distance: null,
            address_position: null,
            poi: null,
            poi_distance: null,
            road: null,
            road_distance: null,
          }
          console.log("逆地址解析失败1111");
        }
      }
      else {
        locationInfo = locationInfotmp
      }

      // console.log("locationInfo111",locationInfo)
      let data = this.assembleData(this.form, typeInfoValues, locationInfo, this.starttime, this.endtime)
      insertPlotAndInfo(data).then(res => {
        let bool = true
        this.$emit('ifPointAnimate', bool)
        this.$emit('drawPoints', data.plot)
        this.$emit('sendPlot', data.plot.plotId, data.plot.plotType)

        // 此处新定义变量存form是因为传过来给this.from的个promise包着的对象，传给ws会有问题
        // let form = {...this.form}
        console.log("完成", data)
        this.$emit('wsSendPoint', JSON.stringify({type: "point", operate: "add", data}))
        this.$emit('clearMarkDialogForm') // 调用父组件中clearMarkDialogForm对应的方法，重置标绘信息填写框里的信息
        console.log("添加成功")
        ElMessage({
          message: '添加成功',
          type: 'success',
        })
        // 清空typeInfo信息、starttime、endtime
        this.typeInfo = null
        this.starttime = null
        this.endtime = null
      })
    },

    // 组装成发送请求的数据形式
    assembleData(data1, data2, locationInfo, startTime, endTime) {
      console.log("点标绘data1,data2", data1, data2, locationInfo, startTime, startTime)
      let assemblyData = {
        //字段
        plot: {
          earthquakeId: null,
          plotId: null,
          creationTime: null,
          plotType: null,
          drawtype: null,
          geom: null,
          elevation: null,
          icon: null,
          startTime: null,
          endTime: null,
          severity: null,
          isDeleted: null,

          belongProvince: null,
          belongCity: null,
          belongCounty: null,
          belongTown: null,

          locationAddress: null,
          locationAddressDistance: null,
          locationAddressPosition: null,
          loocationPoi: null,
          locationPoiDistance: null,
          locationRoad: null,
          locationRoadDistance: null,

        },
        plotinfo: {
          plotId: null,
        }
      }
      //赋值
      // 组装 plot
      assemblyData.plot.earthquakeId = data1.earthquakeId
      assemblyData.plot.plotId = data1.plotId
      assemblyData.plot.creationTime = this.timestampToTime(Date.now()) // 标绘主表的时间是系统生成时间，而不是手动选的标绘时间
      assemblyData.plot.plotType = data1.plotType
      assemblyData.plot.drawtype = "point" // 点线面后面再判断，先写点，别忘了改！！！！
      assemblyData.plot.geom = data1.geom
      assemblyData.plot.elevation = data1.elevation
      assemblyData.plot.icon = data1.icon
      assemblyData.plot.startTime = this.timestampToTime(startTime)
      assemblyData.plot.endTime = this.timestampToTime(endTime)
      assemblyData.plot.belongProvince = locationInfo.province
      assemblyData.plot.belongCity = locationInfo.city
      assemblyData.plot.belongCounty = locationInfo.county
      assemblyData.plot.belongTown = locationInfo.town
      assemblyData.plot.locationAddress = locationInfo.address
      assemblyData.plot.locationAddressDistance = locationInfo.address_distance
      assemblyData.plot.locationAddressPosition = locationInfo.address_position
      assemblyData.plot.loocationPoi = locationInfo.poi
      assemblyData.plot.locationPoiDistance = locationInfo.poi_distance
      assemblyData.plot.locationRoad = locationInfo.road
      assemblyData.plot.locationRoadDistance = locationInfo.road_distance

      // 组装plotinfo)
      assemblyData.plotinfo = {
        ...data2,     //展开data2的内容
        plotId: data1.plotId // 添加 plotId 字段，使用 data1 中的 plotId
      }

      console.log("assemblyData.plotinfo", assemblyData.plotinfo)
      return assemblyData
    },

    // 时间戳转换成日期格式，将时间戳转换成 xx年xx月xx日xx时xx分xx秒格式
    timestampToTime(timestamp) {
      return timeTransfer.timestampToTimeWithT(timestamp)
    },

    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }
}
</script>

<style scoped>
.dialogDiv {
  position: absolute;
  /*padding: 20px;*/
  /*border-radius: 5px;*/
  /*top:100px;*/
  /*left: 10px;*/
  z-index: 10; /* 更高的层级 */
  /*background-color: rgba(40, 40, 40, 0.7);*/
}

.el-input {
  --el-input-width: 220px !important;
}

.el-select {
  /* 此版本下的select下拉框跟inline属性有bug，当设置inline时，select的宽度会丢失，因此需要手动设置 */
  --el-select-width: 150px !important;
}

</style>
