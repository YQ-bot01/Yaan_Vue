<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-form-item label="灾情数据统计">
        <el-input
            v-model="queryParams"
            placeholder="请输入信息"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"/>
        <el-button type="primary" icon="Search" @click="handleQuery()">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery()">重置</el-button>
      </el-form-item>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Search" class="button" @click="openFilter()">筛选数据
        </el-button>
      </el-col>
      <!-- 只有 admin 才显示这三个按钮 -->
      <template v-if="isAdmin">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="Download" class="button" @click="dialogVisible = true">
            导出数据
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="warning" plain icon="Delete" class="button" @click="clearSelection">
            清空选择
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="danger" plain icon="Delete" class="button" @click="handleDeleteAll">
            删除记录
          </el-button>
        </el-col>
      </template>
      <el-col :span="1.5">
        <el-select
            v-model="flag"
            placeholder="Select"
            size="large"
            style="width: 240px">
          <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-col>
      <el-col :span="1.5">
        <el-select
            v-model="eqlistName"
            placeholder="请选择地震信息"
            size="large"
            style="width: 370px"
            filterable
            @change="handleEqListChange"
        >
          <el-option
              v-for="item in tableNameOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-col>
    </el-row>

    <el-table table-layout="fixed" height="510px" fit ref="multipleTableRef" :data="tableData"
              class="table tableMove" :row-key="getRowKey" :row-style="{ height: '6.3vh' }"
              @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" :reserve-selection="true"/>
      <el-table-column label="序号" width="50" align="center" :formatter="typeIndex"/>
      <el-table-column
          v-for="col in columns" :key="col.prop" :prop="col.prop" :label="col.label"
          :align="col.align" :width="col.width" :formatter="col.label === '震级' ? formatMagnitude : undefined"/>
      />
    </el-table>
    <!--筛选弹窗-->
    <el-dialog v-model="queryFormVisible" title="筛选" width="28vw" style="top:20vh">
      <el-form :inline="true" :model="formValue">
        <el-form-item label="震区（县/区）">
          <el-select v-model="formValue.earthquakeAreaName" clearable placeholder="请选择" style="width: 22vw;">
            <el-option
                v-for="item in areaName"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>

        </el-form-item>
        <el-form-item label="统计截止时间">
          <el-date-picker
              v-model="formValue.occurrenceTime"
              type="datetimerange"
              unlink-panels
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              :shortcuts="shortcuts"
              style="width: 23vw;"
              value-format="x"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="filterData()">查询</el-button>
        </div>
      </template>
    </el-dialog>

    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                   :page-sizes="[10, 20, 30, 40]" :background="true"
                   layout="total, sizes, prev, pager, next, jumper" :total="total"
                   @size-change="handleSizeChange" @current-change="handleCurrentChange" class="pagination"/>
    <el-dialog v-model="dialogVisible" title="选择需要导出的字段" width="50%">
      <el-transfer v-model="value" :props="{ key: 'value', label: 'desc' }"
                   :data="data" :titles="['可选字段', '已选字段']"
                   filterable filter-placeholder="输入查询字段"
                   :format="{ noChecked: '${total}', hasChecked: '${checked}/${total}' }">
        <template #right-footer>
          <el-button class="transfer-footer" type="primary" plain @click="dialogVisible = false">取消
          </el-button>
          <el-button class="transfer-footer" type="primary" plain @click="exportStatistics()">导出</el-button>
        </template>
      </el-transfer>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {ElMessage, ElMessageBox} from "element-plus";
import {exportExcel, getField, getData, deleteData, searchData} from "@/api/system/excel.js";
import {Search} from "@element-plus/icons-vue";
import {getExcelUploadEarthquake, getExcelUploadEqList, queryEq} from "@/api/system/eqlist.js";
import useUserStore from "@/store/modules/user.js";


// 获取用户名
const userStore = useUserStore()
console.log("隐藏",userStore)
// 计算属性判断是否admin
const isAdmin = computed(() => {
  return userStore.name === 'admin'  // 这里是name字段和你后台的用户名字段对应
})



const dialogVisible = ref(false)
const flag = ref()
const currentPage = ref(1)
const pageSize = ref(10)
const requestParams = ref("")
const eqlistName = ref('')
const tableNameOptions = ref([])
const eqlists = ref([])

const queryFormVisible = ref(false)
const formValue = ref({
  earthquakeAreaName: '',
  occurrenceTime: '',
});
const areaName = [
  { label: '雨城区' , value: '雨城区' },
  { label: '名山区' , value: '名山区'},
  { label: '荥经县' , value: '荥经县'},
  { label: '汉源县' , value: '汉源县'},
  { label: '石棉县' , value: '石棉县'},
  { label: '天全县' , value: '天全县'},
  { label: '芦山县' , value: '芦山县'},
  { label: '宝兴县' , value: '宝兴县'}
];

const shortcuts = [
  {
    text: '近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: '近一个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: '近三个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
  {
    text: '近一年',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 360);
      return [start, end];
    },
  },
];

onMounted(() => {
  getTableField()
  getEarthquake()
})
const options = ref([]);
const tableData = ref([])
const field = ref([])
const files = ref([])//存储当前用户的导表信息
const name = ref([])
const columns = ref([]); // 用于存储表格列配置
const total = ref()
const width = ref([])
const widthList = {
  'AftershockInformation': [200, 200, 120, 120, 200, 120, 120, 120, 120, 120],
  "AfterSeismicInformation": [200, 200, 120, 200, 200, 300, 200, 120],
  'TransferSettlementInfo': [200, 200, 100, 200, 200, 150, 150, 200, 200],
  'CasualtyReport': [200, 200, 100, 200, 200, 120, 120, 120, 120, 120, 120, 200],
  'Meetings': [200, 200, 120, 200, 200, 120, 120, 120, 120],

  'RoadDamage': [150, 200, 120, 200, 200, 200, 200, 200, 200, 200, 150, 120, 120, 120],
  'TrafficControlSections': [200, 200, 120, 200, 200, 200, 300],
  'CommunicationFacilityDamageRepairStatus': [200, 200, 120, 200, 200, 200, 200, 200, 200, 200, 200, 200],
  'PowerSupplyInformation': [200, 200, 120, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],

  'HousingSituation': [200, 200, 200, 200, 200, 200, 200, 200, 200],
  'SupplySituation': [250, 250, 250, 250, 250, 250],
  'SupplyWater': [250, 250, 250, 250, 250, 250],

  'RiskConstructionGeohazards': [200, 200, 120, 200, 200, 150, 150, 200, 200, 120],
  'BarrierLakeSituation': [200, 200, 120, 200, 200, 150, 150, 150, 150],
  'SecondaryDisasterInfo': [200, 200, 120, 200, 200, 150, 150],
  'DisasterAreaWeatherForecast': [200, 200, 120, 1000, 200, 150],

  'RescueForces': [200, 200, 200, 200, 200, 200, 150, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
  'LargeSpecialRescueEquipment': [200, 200, 200, 200, 200, 150, 200, 200, 200, 200],
  'DisasterReliefMaterials': [200, 200, 200, 200, 200, 150, 200, 200, 200, 200, 200, 200, 200],

  'MaterialDonation': [200, 200, 200, 200, 200, 150],
  'GovernmentDepartmentDonations': [200, 200, 200, 200, 200, 200],
  'CharityOrganizationDonations': [200, 200, 200, 250, 250, 200],
  'RedCrossDonations': [200, 200, 200, 200, 200, 200],

  'SocialOrder': [200, 200, 200, 200, 200, 200, 200, 200],
  'PublicOpinion': [200, 200, 200, 200, 200, 150, 200, 200, 200, 200, 200, 200],

  'WorkGroupLog': [200, 200, 200, 200, 200, 150, 200, 200, 200, 200]

}
const queryParams = ref("")
const queryEqId = ref("")

/** 监听 */
watch(flag, (newFlag) => {
  const selectedFile = files.value.find(file => file.fileFlag === newFlag);
  console.log("newFlag",newFlag)
  if (selectedFile && selectedFile.fileColumn) {
    const fileColumn = JSON.parse(selectedFile.fileColumn);
    const map = new Map(Object.entries(fileColumn));
    field.value = Array.from(map.keys());
    name.value = Array.from(map.values());
    width.value = widthList[newFlag]
    data.value = generateData();
    columns.value = generateColumnConfig();
  }
  // 清空选择
  clearSelection();
  value.value = [];
  getList();

});

/** 搜索按钮操作 */
// function handleQuery() {
//   currentPage.value = 1;
//   getList()
// }

// 请求数据
const getList = async () => {
  console.log(requestParams.value,"requestParams.value")
  await getData({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    requestParams: requestParams.value,
    flag: flag.value
  }).then(res => {
    console.log("res getData",res)
    tableData.value = res.data.records
    total.value = res.data.total
  })
}

/**自增序号**/
const typeIndex = (row, column, cellValue, index) => {
  return index + 1 + (currentPage.value - 1) * pageSize.value;
};

const formatMagnitude = (row, column, cellValue) => {
  if (column.label === '震级(级)') {
    return cellValue.includes('.') ? cellValue : cellValue + '.0';
  }
  return cellValue;
};

const generateColumnConfig = () => {
  return field.value.map((fieldName, index) => {
    const label = name.value[index];
    const width1 = width.value[index]
    // console.log(label)
    return {
      prop: fieldName,
      label: label,
      align: "center",
      width: width1
    };
  });
};


/** 删除按钮操作 */
const handleDeleteAll = () => {
  // 弹出确认框
  ElMessageBox.confirm('此操作将永久删除该数据, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
      .then(() => {
        // 用户确认后直接删除数据
        deleteData({
          flag: flag.value,
          ids: multipleSelection.value,
        }).then(() => {
          ElMessage({
            type: 'success',
            message: '删除成功!'
          });
          getList()
        });
      })
      .catch(() => {
        // 用户取消操作
        ElMessage({
          type: 'info',
          message: '已取消删除'
        });
      });
}
//获取地震列表
const getEarthquake = () => {
  getExcelUploadEqList().then(res => {
    eqlists.value = res
    if (res.data === null) {
      ElMessage.error("地震列表无数据")
    }
    tableNameOptions.value = eqlists.value.map(file => {
          const eqid = file.split(' - ')[0]?.trim();
          const details = file.split(' - ')[1]?.trim();
          // 提取 `-` 后面的部分
          return {
            label: details, // 使用提取的部分作为标签
            value: eqid// 选择值为 ID
          }
        }
    )
    // 2. 默认选择 eqid 为 'be3a5ea4-8dfd-a0a2-2510-21845f17960b' 的地震并获取对应数据
    const defaultEqid = 'e5188712-00d9-4ff7-ad89-8bdcfe4a35ab';
    const defaultOption = tableNameOptions.value.find(option => option.value === defaultEqid);

    // 设置初始值
    if (defaultOption) {
      eqlistName.value = defaultOption.label;
      handleEqListChange(defaultOption.value); // 调用函数，获取对应 eqid 的数据
    } else if (tableNameOptions.value.length > 0) {
      eqlistName.value = tableNameOptions.value[0].label;
      handleEqListChange(tableNameOptions.value[0].value);
    }
  })
}
// 3. 当下拉框改变时，获取对应 eqid 的数据
const handleEqListChange = (selectedEqid) => {
  // 将选中的 eqid 添加到 requestParams 中
  requestParams.value = selectedEqid;
  queryEqId.value = selectedEqid;

  console.log(111111)
  console.log(requestParams.value)
  getList(); // 调用获取数据的方法，传递筛选后的 eqid
};

const generateFieldData = () => {
  return field.value.map((fieldName, index) => ({
    value: fieldName,    // `value` should match field identifier
    desc: name.value[index], // `desc` should match field description
    disabled: false     // Optional: define if the item is selectable
  }));
};


/** 获取字段 */
const getTableField = () => {
  getField().then(res => {
    files.value = res.data
    if (files.value.length == 0) {
      ElMessage.error("该用户无导表权限")
    }
    options.value = files.value.map(file => ({
      label: file.fileName,
      value: file.fileFlag
    }));
    flag.value = files.value[0].fileFlag; // 默认选择第一个表
    const fileColumn = JSON.parse(files.value[0].fileColumn);
    const map = new Map(Object.entries(fileColumn));
    field.value = Array.from(map.keys())
    name.value = Array.from(map.values())
    data.value = generateData();
    columns.value = generateColumnConfig();
  })
}

// 表格翻页选中（需要设置row-key）
function getRowKey(row) {
  return row.uuid
}

// 分页函数
const handleSizeChange = (val) => {
  pageSize.value = val
  getList()
}

const handleCurrentChange = async (val) => {
  currentPage.value = val
  await getList()
}

const generateData = _ => {
  const data = [];
  // 确保 field 和 name 数组已经填充
  for (let i = 0; i < field.value.length; i++) {
    data.push({
      value: field.value[i],
      desc: name.value[i],
      disabled: false
    });
  }
  return data
}

const getColumnWidth = (prop) => {
  const specialColumns = ['地震名称', '地震时间', '填报截止时间'];
  if (specialColumns.includes(prop)) {
    return 250;
  }
  return 150;
};

const data = ref(generateData())
let value = ref([])

const exportStatistics = () => {
  if (value.value.length < 1) {
    ElMessage({
      message: '请至少选择一个字段导出',
      type: 'error',
      plain: true,
    })
  } else {

    const ids = multipleSelection.value.map(item => item.uuid);

    exportExcel({
      fields: value.value,
      ids: ids,
      flag: flag.value
    }).then(res => {
      let fileName;
      if (flag.value === 'TransferSettlementInfo') {
        fileName = '震情伤亡-转移安置统计表.xlsx';
      } else if (flag.value === 'AftershockInformation') {
        fileName = '震情伤亡-震情灾情统计表.xlsx';
      } else if (flag.value === 'CasualtyReport') {
        fileName = '震情伤亡-人员伤亡统计表.xlsx';
      } else if (flag.value === 'Meetings') {
        fileName = '震情伤亡-文会情况统计表.xlsx';
      } else if (flag.value === 'CommunicationFacilityDamageRepairStatus') {
        fileName = '交通电力通信-通信设施损毁及抢修情况统计表.xlsx';
      } else if (flag.value === 'PowerSupplyInformation') {
        fileName = '交通电力通信-电力设施损毁及抢修情况统计表.xlsx';
      } else if (flag.value === 'TrafficControlSections') {
        fileName = '交通电力通信-交通管控情况统计表.xlsx';
      } else if (flag.value === 'RoadDamage') {
        fileName = '交通电力通信-道路交通损毁及抢修情况统计表.xlsx';
      } else if (flag.value === 'HousingSituation') {
        fileName = '建筑物、工程受损-房屋情况统计表.xlsx';
      } else if (flag.value === 'SupplySituation') {
        fileName = '建筑物、工程受损-供水情况统计表.xlsx';
      } else if (flag.value === 'SupplyWater') {
        fileName = '建筑物、工程受损-保障安置点供水统计表.xlsx';
      } else if (flag.value === 'RiskConstructionGeohazards') {
        fileName = '次生灾害-地质灾害统计表.xlsx';
      } else if (flag.value === 'BarrierLakeSituation') {
        fileName = '次生灾害-堰塞湖（雍塞体）统计表.xlsx';
      } else if (flag.value === 'SecondaryDisasterInfo') {
        fileName = '次生灾害-山洪危险区统计表.xlsx';
      } else if (flag.value === 'DisasterAreaWeatherForecast') {
        fileName = '次生灾害-气象情况统计表.xlsx';
      } else if (flag.value === 'RescueForces') {
        fileName = '资金及物资捐赠-物资捐赠情况统计表.xlsx';
      } else if (flag.value === 'LargeSpecialRescueEquipment') {
        fileName = '力量物资资金-大型、特种救援装备统计表.xlsx';
      } else if (flag.value === 'DisasterReliefMaterials') {
        fileName = '力量物资资金-救灾物资情况（累计）统计表.xlsx';
      } else if (flag.value === 'MaterialDonation') {
        fileName = '资金及物资捐赠-物资捐赠情况统计表.xlsx';
      } else if (flag.value === 'GovernmentDepartmentDonations') {
        fileName = '资金及物资捐赠-资金援助情况-政府部门接收捐赠资金统计表.xlsx';
      } else if (flag.value === 'CharityOrganizationDonations') {
        fileName = '资金及物资捐赠-资金援助情况-慈善机构接收捐赠资金统计表.xlsx';
      } else if (flag.value === 'RedCrossDonations') {
        fileName = '资金及物资捐赠-资金援助情况-红十字会系统接收捐赠资金统计表.xlsx';
      } else if (flag.value === 'PublicOpinion') {
        fileName = '宣传舆情治安-宣传舆论统计表.xlsx';
      } else if (flag.value === 'SocialOrder') {
        fileName = '宣传舆情治安-社会秩序统计表.xlsx';
      } else if (flag.value === 'WorkGroupLog') {
        fileName = '工作组动态-工作组每日工作动态统计表.xlsx';
      }


      const url = window.URL.createObjectURL(new Blob([res], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }).finally(() => {
      dialogVisible.value = false
    })
  }
}

const multipleTableRef = ref()
const multipleSelection = ref([])

const handleSelectionChange = (val) => {
  multipleSelection.value = val
}
const clearSelection = () => {
  multipleTableRef.value?.clearSelection()
}

//筛选过滤
const openFilter = () => {
  formValue.value.occurrenceTime = ''
  formValue.value.earthquakeAreaName = ''
  queryFormVisible.value = !queryFormVisible.value
}

const filterData = () => {

  if (formValue.value.occurrenceTime !== '') {
    const [startTime, endTime] = formValue.value.occurrenceTime;
    const startDate = new Date(startTime).toISOString().slice(0, 19);
    const endDate = new Date(endTime).toISOString().slice(0, 19);

    formValue.value.occurrenceTime = `${startDate}至${endDate}`;
    // formValue.occurrenceTime = [startDate, endDate];
    console.log(formValue.value, '--------------')
  }

  // 发送搜索请求
  searchData({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    formVO: formValue.value,
    flag: flag.value,
    queryEqId: queryEqId.value,
    condition: 2  // 筛选条件
  },).then(res => {
    console.log("filter----------", res);
    console.log("queryEqId----------", queryEqId.value, '---------------')
    // 更新 tableData 以显示搜索结果
    total.value = res.data.total;  // 更新总数
    tableData.value = res.data.records; // 使用更新后的数据进行分页
  })
      .catch(error => {
        console.error("搜索时出现错误:", error);
      });
  queryFormVisible.value = !queryFormVisible.value

}

// 搜索功能
const handleQuery = () => {
  // 获取搜索关键字
  const searchKeys = queryParams.value.trim()
  // 搜索内容为空时，恢复为初始数据
  if (searchKeys == '') {
    getList()
    return;
  }
  // 发送搜索请求
  searchData({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    requestParams: searchKeys,
    flag: flag.value,
    queryEqId: queryEqId.value,
    condition: 1  // 搜索条件
  },).then(res => {
    console.log("search----------", res);
    console.log("queryEqId----------", queryEqId.value, '---------------')
    // 更新 tableData 以显示搜索结果
    total.value = res.data.total;  // 更新总数
    tableData.value = res.data.records; // 使用更新后的数据进行分页
  })
      .catch(error => {
        console.error("搜索时出现错误:", error);
      });
}
const resetQuery = () => {
  queryParams.value = ""
  getList()
}

</script>

<style lang="scss" scoped>
::v-deep .el-transfer-panel  {
  width: 38%; /* 调整宽度 */
}

::v-deep .el-checkbox__label {
  font-size: 16px;
}

::v-deep .el-transfer {
  font-size: 16px;
}

::v-deep .el-input__inner {
  font-size: 16px;
}

.tableMove {
  overflow-y: auto;
}

</style>

