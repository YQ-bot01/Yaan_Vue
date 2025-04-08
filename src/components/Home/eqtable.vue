<template>
  <div class="table">
    <el-table
        :data="tableData"
        style="width: 98%; margin-bottom: 2px;height: 18vw"
        :header-cell-style="tableHeaderColor"
        :cell-style="tableColor"
        :row-style="{ height: '37.5px', fontSize: '13px'}"
        @row-click="go">
      <el-table-column label=" " min-width="20px" show-overflow-tooltip>
        <template #default="scope">
          <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
            <img :src="arrowImage" alt="统一图片" style="width: 18px; height: 20px;" class="arrow-icon">
          </div>
        </template>
      </el-table-column>
      <el-table-column
          prop="earthquakeName"
          label="位置"
          min-width="88px"
          show-overflow-tooltip>
      </el-table-column>
      <el-table-column
          label="发震时间"
          align="center"
          min-width="130px"
          show-overflow-tooltip>
        <template v-slot="scope">
          <span>{{ formatTime(scope.row.occurrenceTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
          prop="magnitude"
          align="center"
          min-width="38px"
          label="震级(级)">
        <template #default="scope">
          {{ Number(scope.row.magnitude).toFixed(1) }}
        </template>
      </el-table-column>
      <el-table-column
          prop="depth"
          align="center"
          min-width="47px"
          label="深度(千米)"
          show-overflow-tooltip>
        <template #default="scope">
          {{scope.row.depth}}
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="pageSize"
          pager-count="3"
          :total="total"
          layout="total, prev, pager, next, jumper"
          class="custom-pagination">
      </el-pagination>
    </div>
  </div>
</template>

<script setup>
import arrowImage from '@/assets/images/arrow.png';
import {ref, watch} from 'vue';
import {useRouter} from 'vue-router';


const props = defineProps(['eqData']);

const total = ref(0);
const pageSize = ref(6);
const currentPage = ref(1);
const getEqData = ref([]);
const tableData = ref([]);

const router = useRouter();

watch(() => props.eqData, () => {
  // console.log("data：",props.eqData)

  let list = props.eqData.filter(item => item.earthquakeName.includes("雅安") ||item.magnitude >= 3)
  getEqData.value = list;
  total.value = list.length;
  tableData.value = getPageArr();
});

const go = (row) => {
  const route = router.resolve({path: '/thd', query: {eqid: row.eqid, eqqueueId: row.eqqueueId}}).href;
  // console.log("row.eqid----------------",row.eqid)
  window.open(route, '_blank');
};

const tableHeaderColor = () => ({
  'background': 'linear-gradient(180deg, rgba(27,60,108,0.09) 0%, rgba(20,83,174,1) 100%)',
  'color': '#fff',
  'text-align': 'center',
  'font-size': '13px',
  'padding': '0',
  'margin': '0'
});

const tableColor = ({rowIndex}) => {
  // const backgroundColor = rowIndex % 2 === 1 ? '#313a44' : '#304156';
  return {
    // 'border-width':'1px',
    // 'border-style':'solid',
    // 'border-color': '#555555',
    'background-color': '#ffffff00',
    'padding': '0',
    'margin': '1'
  };
};

const getPageArr = () => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = Math.min(currentPage.value * pageSize.value, total.value);
  return getEqData.value.slice(start, end);
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  tableData.value = getPageArr();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  tableData.value = getPageArr();
};

const formatTime = (time) => {
  if (!time) return '未知时间';

  const date = new Date(time);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  // const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
};
</script>

<style scoped>
.list-dialog .list-dialog__header {
  height: 41px;
  width: 100%;
  line-height: 41px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 500;
  border-radius: 4px 4px 0 0;
  padding: 0 5px 0 10px;
  position: relative;
  top: 0;
  left: 0;
  background: url(@/assets/images/CommandScreen/右侧列表底图.png) no-repeat;
  background-size: 100% 100%;
}
.list-dialog {
  height: 100%;
  width: 100%;
  background-color: rgb(22, 53, 77,0.9);
  padding: 0!important;
  backdrop-filter: none!important;
  border: 1px solid #008aff70;
}
.list-dialog .list-dialog__content {
  height: 100%;
  padding: 11px;
  overflow: auto;
  border-radius: 4px;
}
.table {
  width: 100%;
  height: 98%;
  margin-bottom: 8px;
  text-align: center;
  margin-left: 4%;
}

/*表格页面样式*/
:deep(.el-table__inner-wrapper::before) {
  width: 0
}

:deep(.el-table) {
  --el-table-bg-color : ''
}

:deep(.el-pagination){
  --el-pagination-item-gap : 6px;
}

:deep(.el-table--default .cell){
  padding : 0 4px
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: -5px;
}

.custom-pagination >>> .el-pagination__total,
.custom-pagination >>> .el-pagination__jump,
.custom-pagination >>> .el-pagination__right-wrapper {
  color: white;
  font-size: 13px;
}

:deep(.el-table tr) {
  background:#ffffff00;
  font-weight: 1000;
}

:deep(.el-table){
  --el-table-border: 0px solid;
}

 /*默认状态*/
:deep(.el-table tr) {
  background: #ffffff00;
  color: #ffffff;
  font-weight: 1000;
  position: relative;
  transition: box-shadow 0.3s ease; /* 添加过渡效果 */
}

:deep(.el-table tr:hover) {
  background: linear-gradient(0deg, rgba(38, 166, 221, 0.9) 30%, rgba(230, 247, 255, 1) 100%);
  font-weight: 1000;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  box-shadow: 0 0 8px 2px rgba(48, 140, 255, 1); /* 使用渐变阴影 */
}

/* 添加样式来控制箭头图标显示与隐藏 */
.arrow-icon {
  display: none;  /* 初始状态下箭头不显示 */
}

/* 鼠标悬浮在行上时，显示箭头图标 */
:deep(.el-table tr:hover) .arrow-icon {
  display: inline-block; /* 显示箭头 */
}

</style>
