<template>
  <div class="app-container">
    <el-form-item label="时间轴" >
      <el-input
          v-model="queryParams"
          placeholder="请输入时间轴信息"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
      />
      <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      <!--      <el-button type="primary" plain icon="Plus" @click="handleOpen('新增')">新增</el-button>-->
    </el-form-item>
    <el-table :data="tableData"
              height="600px"
              @row-click="go"
              :stripe="true"
              :header-cell-style="{  }"
              :cell-style="tableColor"
              :row-style="{ height: '7.4vh' }">
      <el-table-column label="序号" width="60">
        <template #default="{ row, column, $index }">
          {{ ($index + 1) + (currentPage - 1) * pageSize }}
        </template>
      </el-table-column>
      <el-table-column prop="occurrenceTime" label="发震时间" header-align="center" align="center" width="230" ></el-table-column>
      <el-table-column prop="earthquakeName" label="位置" width="300" align="center"></el-table-column>
      <el-table-column prop="magnitude" label="震级(级)" header-align="center" align="center" width="100"></el-table-column>
      <el-table-column label="地震类型" width="100" show-overflow-tooltip>
        <template #default="{ row }">
          <el-button
              :type="row.eqType === 'Z' ? 'success' : (row.eqType === 'Y' ? 'danger':'primary')"
              plain
              size="mini"
              style="margin: 0; padding: 2px 8px; border-radius: 4px;"
          >
            {{ row.eqType === 'Z' ? '真实地震' : (row.eqType === 'Y' ? '演练地震' : '测试地震') }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="longitude" label="经度(度分" header-align="center" align="center"></el-table-column>
      <el-table-column prop="latitude" label="纬度(度分)" header-align="center" align="center"></el-table-column>
      <el-table-column prop="depth" label="深度(千米)" header-align="center" align="center"></el-table-column>
    </el-table>

    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size="pageSize"
        style="display: flex; justify-content: center; margin-top: 20px;"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
    >
    </el-pagination>
  </div>
</template>

<script>
import {queryEqList, getAllEqList} from '@/api/system/eqlist'

export default {
  name: "timelineeqlist",
  data() {
    return {
      getEqData: [],
      tableData: [],
      total: 0,
      pageSize: 10,
      pageSizes: [5, 10, 20, 40],
      currentPage: 1,
      //--------------------------------------
      dialogShow: false,
      dialogTitle: null,
      dialogContent: {
        position: '',
        time: '',
        magnitude: '',
        longitude: '',
        latitude: '',
        depth: '',
        eqid: '',
        // istimeLine:'',
      },
      // 查询功能
      queryParams: '',   // 搜索关键字
    }
  },
  mounted() {
    this.getEq()
  },
  methods: {
    // 搜索功能
    handleQuery() {
      // 获取搜索关键字
      const searchKey = this.queryParams.trim();

      // 如果搜索关键字为空，恢复为原始数据
      if (searchKey === "") {
        this.tableData = this.getEq();  // 恢复所有数据并重新进行分页
        return;
      }

      let finalSearchKey = searchKey;

      // 判断是否是时间格式
      const timePattern = /^(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})时(\d{1,2})分(\d{1,2})秒$/;
      const timeMatch = searchKey.match(timePattern);

      if (timeMatch) {
        // 如果是时间格式，转换为目标格式
        const [, year, month, day, hh, mm, ss] = timeMatch;
        finalSearchKey = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:${ss.padStart(2, '0')}`;
      }

      // 发送搜索请求
      queryEqList({queryValue: finalSearchKey}).then(res => {
        console.log("检查返回的数据",res); // 检查返回的数据
        // 处理并格式化返回的数据
        const filteredData = res.filter(item => item.magnitude >= 3).map(item => {
          // 提取 geom 中的坐标信息，默认值 [0, 0] 防止数据缺失
          const [longitude, latitude] = item.geom?.coordinates || [0, 0];

          // 直接修改 item 对象的属性
          item.occurrenceTime = this.timestampToTimeData(item.occurrenceTime); // 格式化时间
          item.magnitude = Number(item.magnitude).toFixed(1); // 格式化震级
          item.latitude = Number(latitude).toFixed(2); // 格式化纬度
          item.longitude = Number(longitude).toFixed(2); // 格式化经度

          // 返回修改后的 item
          return item;
        });
        // 搜索之后更新数据
        this.getEqData = filteredData;
        this.total = filteredData.length;  // 更新总数
        // 使用更新后的数据更新分页
        this.tableData = this.getPageArr(filteredData);  // 传入处理后的数据
      }).catch(error => {
        console.error("搜索时出现错误:", error);
      });
    },

    // 重置功能
    resetQuery() {
      this.queryParams = '';  // 清空搜索输入框
      this.getEq();  // 重新加载所有数据
    },

    typeIndex(row, column, cellValue, index) {
      return (this.currentPage - 1) * this.pageSize + index + 1;
    },
    getEq() {
      let that = this
      getAllEqList().then(res => {
        console.log("返回的数据",res.data)
        let resData = res.data.filter(item => Number(item.magnitude) >= 3)
        that.getEqData = resData
        that.total = resData.length
        let data = []
        for (let i = 0; i < res.data.length; i++) {
          let item = res.data[i]
          item.occurrenceTime = that.timestampToTime(item.occurrenceTime)
          item.magnitude = Number(item.magnitude).toFixed(1)
          item.latitude = Number(item.latitude).toFixed(2)
          item.longitude = Number(item.longitude).toFixed(2)
          data.push(item)
        }
        that.tableData = this.getPageArr()
      })
    },
    timestampToTime(timestamp) {
      let DateObj = new Date(timestamp)
      if (isNaN(DateObj.getTime())) {
        console.error("无效的时间戳:", timestamp);
        return "";
      }
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
    },
    timestampToTimeData(timestamp) {
      let DateObj = new Date(timestamp)
      if (isNaN(DateObj.getTime())) {
        console.error("无效的时间戳:", timestamp);
        return "";
      }
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
      return `${year}年${month}月${day}日${hh}时${mm}分${ss}秒`
      // return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
    },

    // 对数据库获取到的标绘图片数组切片
    getPageArr() {
      let arr = []
      let start = (this.currentPage - 1) * this.pageSize
      let end = this.currentPage * this.pageSize
      if (end > this.total) {
        end = this.total
      }
      for (; start < end; start++) {
        arr.push(this.getEqData[start])
      }
      return arr
    },
    //`每页 ${val} 条`
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1;
      this.tableData = this.getPageArr()
      // console.log(`每页 ${val} 条`);
    },
    // `当前页: ${val}`
    handleCurrentChange(val) {
      this.currentPage = val
      this.tableData = this.getPageArr()
      // console.log(`当前页: ${val}`);
    },

    go(row, column, cell, event) {
      this.$router.push({name: 'thdTimeLine', params: {eqid: row.eqid}})
    },
    // 修改table header的背景色
    tableColor({row, column, rowIndex, columnIndex}) {
      // console.log(row,"row")
      if (row.magnitude >= 5) {
        // console.log('>')
        return {
          // 'background-color': 'rgb(65,159,255)',
          'background-color': 'rgba(65,159,255,0.19)',
          'border-color': '#f8f8f9',
        }
      } else {
        return {
          'background-color': 'rgb(255,255,255)',
          'border-color': '#f8f8f9',
        }
      }
    },
  }
}
</script>

<style scoped>


</style>
