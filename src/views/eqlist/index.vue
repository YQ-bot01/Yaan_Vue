<template>
  <div class="app-container">
    <el-form-item label="地震信息">
      <el-input
          v-model="queryParams"
          placeholder="请输入地震信息"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
      />
      <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      <!--      二三维一体化——地震信息管理-->
      <!--      <el-button type="primary" plain icon="Plus" @click="handleOpen('新增')">新增</el-button>-->
      <el-button type="primary" icon="Filter" @click="openQueryForm">筛选</el-button>
      <el-button type="primary" plain icon="Plus" @click="handleAddOrUpdate('add')">新增</el-button>
      <!-- 正式地震按钮 -->
      <!--      <el-button-->
      <!--          size="primary"-->
      <!--          :type="activeMode === 'Z' ? 'danger' : 'default'"-->
      <!--          style="font-size: 16px;"-->
      <!--          @click="activeMode = 'Z'"-->
      <!--      >-->
      <!--        正式地震-->
      <!--      </el-button>-->

      <!--      &lt;!&ndash; 测试地震按钮 &ndash;&gt;-->
      <!--      <el-button-->
      <!--          size="primary"-->
      <!--          :type="activeMode === 'Y' || activeMode === 'T' ? 'primary' : 'default'"-->
      <!--          style="font-size: 16px;"-->
      <!--          @click="activeMode = 'Y'"-->
      <!--      >-->
      <!--        测试地震-->
      <!--      </el-button>-->

    </el-form-item>

    <el-progress
        v-if="isProgressShow"
        :text-inside="true"
        :stroke-width="16"
        :percentage="percentage"
        :color="getGradientColors()"
        :show-text="true"
        style="border-radius: 15px; background: linear-gradient(90deg, #f5f7fa, #eaf0ff); padding: 3px; box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.1);"
    />


    <el-table
        :data="tableData"
        :stripe="true"
        :header-cell-style="tableHeaderColor"
        :cell-style="tableColor"
    >

      <el-table-column label="序号" width="60">
        <template #default="{ row, column, $index }">
          {{ ($index + 1) + (currentPage - 1) * pageSize }}
        </template>
      </el-table-column>

      <el-table-column
          prop="occurrenceTime"
          label="发震时间"
          width="250"
          show-overflow-tooltip
      ></el-table-column>

      <el-table-column
          prop="earthquakeName"
          label="位置"
          width="200"
          show-overflow-tooltip
      ></el-table-column>


      <el-table-column prop="magnitude" label="震级(级)"></el-table-column>
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

      <el-table-column prop="longitude" label="经度(度分)"></el-table-column>
      <el-table-column prop="latitude" label="纬度(度分)"></el-table-column>
      <el-table-column prop="depth" label="深度(千米)"></el-table-column>

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
              type="text"
              icon="Edit"
              @click="handleOpen('修改', scope.row)"
          >修改
          </el-button>
          <el-button
              type="text"
              icon="Delete"
              @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>

    <el-dialog :title="dialogTitle" v-model="dialogShow" width="30%">
      <el-form ref="from" :model="dialogContent" :rules="rules">
        <el-row>
          <!--          <el-col :span="13">-->
          <!--            <el-form-item label="震发位置：" prop="earthquakeName">-->
          <!--              <el-input v-model="dialogContent.earthquakeName" placeholder="请输入内容"></el-input>-->
          <!--            </el-form-item>-->
          <!--          </el-col>-->
          <el-col :span="55">
            <el-form-item label="震发位置：" prop="eqAddr">
              <div class="custom-cascader-wrapper">
                <!-- 输入框 -->
                <el-input
                    v-model="customAddress"
                    placeholder="请选择或输入震发位置"
                    @blur="handleCustomInput"
                    @input="handleInputChange"
                    class="custom-input"
                />
                <!-- 下拉框 -->
                <el-cascader
                    ref="cascader"
                    :options="filteredOptions"
                    v-model="selectedPath"
                    @change="onLocationChange"
                    separator=""
                    :filterable="false"
                    placeholder="请选择震发位置"
                    class="custom-cascader"
                />
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="18">
            <el-form-item label="发震时间：" prop="occurrenceTime">
              <el-date-picker
                  v-model="dialogContent.occurrenceTime"
                  type="datetime"
                  placeholder="选择日期时间"
                  value-format="YYYY-MM-DDTHH:mm:ss"
                  size="large">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="震级(级)：" prop="magnitude">
              <el-input v-model="dialogContent.magnitude" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="深度(千米)：" prop="depth">
              <el-input v-model="dialogContent.depth" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="经度(度分)：" prop="longitude">
              <el-input v-model="dialogContent.longitude" placeholder="请输入内容" type="number"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度(度分)：" prop="latitude">
              <el-input v-model="dialogContent.latitude" placeholder="请输入内容" type="number"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="commit">确 定</el-button>
      </span>
      </el-form>
    </el-dialog>

    <el-dialog v-model="queryFormVisible" title="筛选" width="30vw" style="top:20vh">
      <el-form :inline="true" :model="formValue" ref="formValue" :rules="formValuerules" :show-close="false">
        <el-form-item label="地震位置">
          <el-input v-model="formValue.earthquakeName" style="width: 23vw;" placeholder="地震位置" clearable/>
        </el-form-item>
        <el-form-item label="发震时间">
          <el-date-picker
              v-model="formValue.occurrenceTime"
              type="daterange"
              unlink-panels
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              :shortcuts="shortcuts"
              style="width: 23vw;"
              value-format="YYYY-MM-DDTHH:mm:ss"/>
        </el-form-item>
        <el-form-item label="地震震级" prop="magnitude" class="formValue">
          <el-input v-model="formValue.startMagnitude" style="width: 5vw;" placeholder="起始震级"/>
          <span style="margin: 0 10px"> 至 </span>
          <el-input v-model="formValue.endMagnitude" style="width: 5vw;" placeholder="结束震级"/>
          <span style="margin: 0 10px">(级)</span>
        </el-form-item>
        <el-form-item label="地震深度" prop="depth" class="formValue">
          <el-input v-model="formValue.startDepth" style="width: 5vw" placeholder="起始深度"/>
          <span style="margin: 0 10px"> 至 </span>
          <el-input v-model="formValue.endDepth" style="width: 5vw" placeholder="结束深度"/>
          <span style="margin: 0 10px">(千米)</span>
        </el-form-item>
      </el-form>

      <div class="dialog-footer">
        <el-button @click="Cancel">取 消</el-button>
        <el-button type="primary" @click="onSubmit">筛 选</el-button>
      </div>
    </el-dialog>

   <!-- 新增表单-->
    <el-dialog :title="panelTitle" v-model="isPanelShow" width="30%">
      <el-form ref="panel" :model="addOrUpdateDTO" :rules="panelRules">
        <el-row>
          <el-col :span="55">
            <el-form-item label="震发位置：" prop="eqAddr">
              <div class="custom-cascader-wrapper">
                <!-- 输入框 -->
                <el-input
                    v-model="customAddress"
                    placeholder="请选择或输入震发位置"
                    @blur="handleCustomInput"
                    @input="handleInputChange"
                    class="custom-input"
                />
                <!-- 下拉框 -->
                <el-cascader
                    ref="cascader"
                    :options="filteredOptions"
                    v-model="selectedPath"
                    @change="onLocationChange"
                    separator=""
                    :filterable="false"
                    placeholder="请选择震发位置"
                    class="custom-cascader"
                />
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="18">
            <el-form-item label="发震时间：" prop="eqTime">
              <el-date-picker
                  v-model="addOrUpdateDTO.eqTime"
                  type="datetime"
                  placeholder="选择日期时间"
                  value-format="YYYY-MM-DDTHH:mm:ss"
                  size="large">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="震级(级)：" prop="eqMagnitude">
              <el-input v-model="addOrUpdateDTO.eqMagnitude" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="深度(千米)：" prop="eqDepth">
              <el-input v-model="addOrUpdateDTO.eqDepth" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="经度(度分)：" prop="longitude">
              <el-input v-model="addOrUpdateDTO.longitude" placeholder="请输入内容" type="number"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度(度分)：" prop="latitude">
              <el-input v-model="addOrUpdateDTO.latitude" placeholder="请输入内容" type="number"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-form-item label="地震类型：" prop="eqType">
            <el-select v-model="addOrUpdateDTO.eqType" placeholder="请选择地震类型" style="width: 200px" clearable>
              <el-option
                  v-for="item in eqType"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-row>

        <span slot="footer" class="dialog-footer">
          <el-button @click="cancelPanel">取 消</el-button>
          <el-button type="primary" @click="commitPanel">确 定</el-button>
        </span>
      </el-form>
    </el-dialog>

  </div>
</template>

<script>
import {
  addEq,
  getAllEq,
  deleteeq,
  updataEq,
  queryEq,
  fromEq,
  eqEventTrigger,
  deletedEq,
  getAllEqList, queryEqList, fromEqList, eqProgress, eqEventReassessment
} from '@/api/system/eqlist'
import {getEqList} from "@/api/system/damageassessment.js";

export default {
  name: "index",
  data() {

    return {
      rules: {
      },
      formValuerules: {
        magnitude: [
          {
            validator: (rule, value, callback) => {
              const {startMagnitude, endMagnitude} = this.formValue;

              // 检查两个值是否都存在
              if (!startMagnitude || !endMagnitude) {
                callback(); // 直接通过，不进行验证
                return;
              }

              // 进行震级比较
              if (Number(startMagnitude) > Number(endMagnitude)) {
                callback(new Error('起始震级必须小于等于结束震级'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        depth: [
          {
            validator: (rule, value, callback) => {
              const {startDepth, endDepth} = this.formValue;

              // 检查两个值是否都存在
              if (!startDepth || !endDepth) {
                callback(); // 直接通过，不进行验证
                return;
              }

              // 进行深度比较
              if (Number(startDepth) > Number(endDepth)) {
                callback(new Error('起始深度必须小于等于结束深度'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ]
      },
      // 进度条
      isProgressShow: false,
      percentage: 0,
      colors: [
        {color: '#d3e0fa', percentage: 10},
        {color: '#a4c7fc', percentage: 30},
        {color: '#7aaef8', percentage: 50},
        {color: '#5795f4', percentage: 70},
        {color: '#3c7ef0', percentage: 90},
        {color: '#2369e8', percentage: 100}
      ],
      formValid: false, // 表单验证状态
      getEqData: [],
      tableData: [],
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      //--------------------------------------
      dialogShow: false,
      dialogTitle: null,
      dialogContent: {
        earthquakeName: '',
        occurrenceTime: '', // 初始化为当前时间的时间戳
        magnitude: '',
        longitude: '',
        latitude: '',
        depth: '',
        eqid: '',
      },
      queryParams: '',

      requestParams: '',
      queryFormVisible: false,
      formValue: {
        earthquakeName: '',
        occurrenceTime: '',
        startMagnitude: '',
        endMagnitude: '',
        startDepth: '',
        endDepth: ''
      },
      shortcuts: [
        {
          text: '近一周',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            return [start, end]
          }
        },
        {
          text: '近一个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            return [start, end]
          }
        },
        {
          text: '近三个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            return [start, end]
          }
        },
        {
          text: '近一年',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 360)
            return [start, end]
          }
        }
      ],

      addOrUpdateDTO: {
        event: '',
        eqName: '',
        eqTime: '',
        eqAddr: '',
        longitude: '',
        latitude: '',
        eqMagnitude: '',
        eqDepth: '',
        eqType: '',
      },
      customAddress: "", // 用于保存用户自定义输入或选择的震发位置
      filteredOptions: [], // 动态筛选后的选项
      selectedPath: [], // 级联选择器的选中路径
      locationOptions: [
        {
          label: '雨城区',
          value: '雨城区',
          children: [
            {label: '碧峰峡镇', value: '碧峰峡镇', longitude: 102.99, latitude: 30.06},
            {label: '八步镇', value: '八步镇', longitude: 102.93, latitude: 29.93},
            {label: '周公山镇', value: '周公山镇', longitude: 103.03, latitude: 29.90},
            {label: '多营镇', value: '多营镇', longitude: 103.03, latitude: 29.90},
            {label: '草坝镇', value: '草坝镇', longitude: 103.11, latitude: 29.96},
            {label: '望鱼镇', value: '望鱼镇', longitude: 103.05, latitude: 29.73},
            {label: '晏望镇', value: '晏望镇', longitude: 103.12, latitude: 29.74},
            {label: '上里镇', value: '上里镇', longitude: 103.07, latitude: 30.18}
          ]
        },
        {
          label: '名山区',
          value: '名山区',
          children: [
            {label: '蒙顶山镇', value: '蒙顶山镇', longitude: 103.09, latitude: 30.07},
            {label: '前进镇', value: '前进镇', longitude: 103.20, latitude: 30.04},
            {label: '车岭镇', value: '车岭镇', longitude: 103.24, latitude: 30.08},
            {label: '百丈镇', value: '百丈镇', longitude: 103.23, latitude: 30.18},
            {label: '黑竹镇', value: '黑竹镇', longitude: 103.30, latitude: 30.21},
            {label: '红星镇', value: '红星镇', longitude: 103.28, latitude: 30.15},
            {label: '茅河镇', value: '茅河镇', longitude: 103.35, latitude: 30.22},
            {label: '马岭镇', value: '马岭镇', longitude: 103.34, latitude: 30.12},
            {label: '新店镇', value: '新店镇', longitude: 103.19, latitude: 30.14},
            {label: '万古镇', value: '万古镇', longitude: 103.14, latitude: 30.16},
            {label: '中锋镇', value: '中锋镇', longitude: 103.18, latitude: 30.19}
          ]
        },
        {
          label: '天全县',
          value: '天全县',
          children: [
            {label: '城厢镇', value: '城厢镇', longitude: 102.77, latitude: 30.06},
            {label: '始阳镇', value: '始阳镇', longitude: 102.83, latitude: 30.02},
            {label: '新场镇', value: '新场镇', longitude: 102.84, latitude: 29.96},
            {label: '思经镇', value: '思经镇', longitude: 102.73, latitude: 30.02},
            {label: '小河镇', value: '小河镇', longitude: 102.74, latitude: 30.11},
            {label: '喇叭河镇', value: '喇叭河镇', longitude: 102.60, latitude: 30.04},
            {label: '仁义镇', value: '仁义镇', longitude: 102.81, latitude: 30.11}
          ]
        },
        {
          label: '芦山县',
          value: '芦山县',
          children: [
            {label: '大川镇', value: '大川镇', longitude: 102.93, latitude: 30.14},
            {label: '太平镇', value: '太平镇', longitude: 102.99, latitude: 30.34},
            {label: '龙门镇', value: '龙门镇', longitude: 103.02, latitude: 30.25},
            {label: '双石镇', value: '双石镇', longitude: 102.92, latitude: 30.25},
            {label: '思延镇', value: '思延镇', longitude: 102.91, latitude: 30.13},
            {label: '飞仙关镇', value: '飞仙关镇', longitude: 102.89, latitude: 30.04}
          ]
        },
        {
          label: '宝兴县',
          value: '宝兴县',
          children: [
            {label: '穆坪镇', value: '穆坪镇', longitude: 102.81, latitude: 30.38},
            {label: '灵关镇', value: '灵关镇', longitude: 102.83, latitude: 30.25},
            {label: '陇东镇', value: '陇东镇', longitude: 102.71, latitude: 30.47}
          ]
        },
        {
          label: '荥经县',
          value: '荥经县',
          children: [
            {label: '花滩镇', value: '花滩镇', longitude: 102.77, latitude: 29.78},
            {label: '龙苍沟镇', value: '龙苍沟镇', longitude: 102.85, latitude: 29.70},
            {label: '牛背山镇', value: '牛背山镇', longitude: 102.53, latitude: 29.77},
            {label: '新添镇', value: '新添镇', longitude: 102.84, latitude: 29.84},
            {label: '青龙镇', value: '青龙镇', longitude: 102.88, latitude: 29.79},
            {label: '荥河镇', value: '荥河镇', longitude: 102.71, latitude: 29.83},
            {label: '五宪镇', value: '五宪镇', longitude: 102.84, latitude: 29.77}
          ]
        },
        {
          label: '汉源县',
          value: '汉源县',
          children: [
            {label: '富林镇', value: '富林镇', longitude: 102.63, latitude: 29.36},
            {label: '九襄镇', value: '九襄镇', longitude: 102.62, latitude: 29.50},
            {label: '皇木镇', value: '皇木镇', longitude: 102.90, latitude: 29.35},
            {label: '宜东镇', value: '宜东镇', longitude: 102.46, latitude: 29.64},
            {label: '富庄镇', value: '富庄镇', longitude: 102.54, latitude: 29.55},
            {label: '清溪镇', value: '清溪镇', longitude: 102.62, latitude: 29.58},
            {label: '大树镇', value: '大树镇', longitude: 102.69, latitude: 29.31},
            {label: '乌斯河镇', value: '乌斯河镇', longitude: 102.90, latitude: 29.22},
            {label: '唐家镇', value: '唐家镇', longitude: 102.63, latitude: 29.45},
            {label: '富泉镇', value: '富泉镇', longitude: 29.38, latitude: 29.38},
            {label: '前域镇', value: '前域镇', longitude: 102.59, latitude: 29.50},
            {label: '安乐镇', value: '安乐镇', longitude: 102.72, latitude: 29.36}
          ]
        },
        {
          label: '石棉县',
          value: '石棉县',
          children: [
            {label: '回隆镇', value: '回隆镇', longitude: 102.39, latitude: 29.18},
            {label: '美罗镇', value: '美罗镇', longitude: 102.44, latitude: 29.29},
            {label: '安顺场镇', value: '安顺场镇', longitude: 102.28, latitude: 29.27}
          ]
        }
      ],
      panelTitle: '',
      isPanelShow: false,
      panelRules: '',
      activeMode: 'Z',

      eqType: [
        {
          label: "真实",
          value: "Z",
        },
        {
          label: "演练",
          value: "Y",
        },
        {
          label: "测试",
          value: "T",
        }
      ]
    }
  },
  computed: {
    filteredTableData() {
      // 根据activeMode过滤tableData
      if (this.activeMode === 'Z') {
        return this.tableData.filter(item => item.eqType === 'Z');
      } else if (this.activeMode === 'Y' || this.activeMode === 'T') {
        return this.tableData.filter(item => item.eqType === 'Y' || item.eqType === 'T');
      }
      return this.tableData; // 如果没有选择模式，返回所有数据
    },
  },
  mounted() {
    // 初始化选项
    this.filteredOptions = this.locationOptions;
    setInterval(this.updateTime, 500)
    this.getEq()
    console.log(this.simplifyLocation("四川省雅安市雨城区某某镇", 5))
    console.log(this.simplifyLocation("四川省雅安市石棉县安顺场镇", 5.5))
    console.log(this.simplifyLocation("甘肃省陇南市文县", "6.5"))
  },


  methods: {
    handleInputChange(value) {
      // 动态更新 filteredOptions
      this.filteredOptions = this.filterOptions(value, this.locationOptions);
    },
    filterOptions(query, options) {
      // 自定义模糊匹配逻辑
      if (!query) return options;

      const filtered = [];
      options.forEach((region) => {
        const matchedRegion = {
          ...region,
          children: region.children.filter((child) =>
              child.label.includes(query)
          ),
        };
        if (matchedRegion.children.length > 0 || region.label.includes(query)) {
          filtered.push(matchedRegion);
        }
      });
      return filtered;
    },
    /**
     * 处理自定义输入
     */
    handleCustomInput() {
      // 如果用户输入值与表单字段值相同，不做任何处理
      if (this.customAddress === this.addOrUpdateDTO.eqAddr) {
        return;
      }
      if (this.customAddress) {
        this.addOrUpdateDTO.eqAddr = this.customAddress; // 保存用户输入到表单字段
        this.addOrUpdateDTO.longitude = null;
        this.addOrUpdateDTO.latitude = null;
        this.selectedPath = []; // 清除级联选择器的选中状态
      }
    },
    // 处理选择逻辑
    // 假设已经拿到正确的级联选项路径
    onLocationChange(selected) {
      const region = this.locationOptions.find((r) => r.value === selected[0]);
      if (region) {
        const town = region.children.find((t) => t.value === selected[1]);
        if (town) {
          // 拼接完整地址
          const prefix = '四川省雅安市';
          const fullAddress = `${prefix}${region.label}${town.label}`;
          this.addOrUpdateDTO.eqAddr = fullAddress;
          this.addOrUpdateDTO.longitude = town.longitude;
          this.addOrUpdateDTO.latitude = town.latitude;
          this.customAddress = fullAddress; // 同步到输入框
          this.selectedPath = selected; // 同步选中路径
        }
      }
    },

    // 进度条动态计算渐变色
    getGradientColors() {
      return this.colors.map(item => item.color);
    },

    commitPanel() {
      this.isProgressShow = true
      this.isPanelShow = !this.isPanelShow
      this.$notify({
        title: '地震模拟',
        message: '正在进行灾损评估中',
        duration: 10000
      });
      this.addOrUpdateDTO.event = this.createTid()
      this.addOrUpdateDTO.eqName = this.simplifyLocation(this.addOrUpdateDTO.eqAddr, this.addOrUpdateDTO.eqMagnitude)

      // 直接去除 eqName 里的 "undefined"
      if (this.addOrUpdateDTO.eqName.includes("undefined")) {
        this.addOrUpdateDTO.eqName = this.addOrUpdateDTO.eqName.replace(/undefined/g, "").trim();
      }

      this.addOrUpdateDTO.eqTime = this.addOrUpdateDTO.eqTime.replace('T', ' ')

      eqEventTrigger(this.addOrUpdateDTO)
          .then(res => {
            console.log(res);
            // 在这里调用 getEq 方法
            this.getEq();
          })
      this.setInterval()
      // this.addOrUpdateDTO.event = this.createTid()
      // this.addOrUpdateDTO.eqName = this.simplifyLocation(this.addOrUpdateDTO.eqAddr, this.addOrUpdateDTO.eqMagnitude)
      // this.addOrUpdateDTO.eqTime = this.addOrUpdateDTO.eqTime.replace('T', ' ')
      // eqEventTrigger(this.addOrUpdateDTO)
      //     .then(res => {
      //   console.log(res)
      // })
      // // console.log("你好：", this.addOrUpdateDTO)
    },

    // 进度条
    setInterval() {
      this.interval = setInterval(() => {
        this.getEq();
        const result = this.tableData.find(item =>
            item.eqid === this.addOrUpdateDTO.event);
        if (result) {
          const eqqueueId = result.eqqueueId;
          // 你可以在这里使用 eqqueueId
          this.updateProgress(this.addOrUpdateDTO.event, eqqueueId);
        } else {
          console.log("未找到匹配的 eqqueueId");
        }

      }, 9000)
    },

    updateProgress(event,eqqueueId) {
      eqProgress({event, eqqueueId}).then(res => {

        if (res.data == null || res.data >= 100) {
          this.isProgressShow = false;
          return ;
        }

        this.isProgressShow = true
        this.percentage = Number(res.data).toFixed(2); // 保留两位小数
      })
    },
    cancelPanel() {
      this.addOrUpdateDTO = {
        event: '',
        eqName: '',
        eqTime: '',
        eqAddr: '',
        longitude: '',
        latitude: '',
        eqMagnitude: '',
        eqDepth: '',
        eqType: '',
      }
    },


    onSubmit() {
      const {earthquakeName, occurrenceTime, startMagnitude, endMagnitude, startDepth, endDepth} = this.formValue;

      // 如果时间范围选择为空，将其设为null
      let startTime = null;
      let endTime = null;
      if (occurrenceTime && occurrenceTime.length === 2) {
        startTime = this.formatISODateTimeToBackend(occurrenceTime[0])
        endTime = this.formatISODateTimeToBackend(occurrenceTime[1])

        // console.log("转换后的开始时间:", startTime);
        // console.log("转换后的结束时间:", endTime);
      }

      // 构建查询对象
      const queryParams = {
        earthquakeName: earthquakeName || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        startMagnitude: startMagnitude || undefined,
        endMagnitude: endMagnitude || undefined,
        startDepth: startDepth || undefined,
        endDepth: endDepth || undefined,
      };

      // 发送请求
      fromEqList(queryParams).then(res => {
        // 处理返回的数据
        this.getEqData = res.map(item => {
          // 提取 geom 中的坐标信息，默认值 [0, 0] 防止数据缺失
          const [longitude, latitude] = item.geom?.coordinates || [0, 0];

          return {
            ...item,
            occurrenceTime: this.timestampToTime(item.occurrenceTime),  // 转换时间
            magnitude: Number(item.magnitude).toFixed(1),  // 格式化震级为一位小数
            latitude: Number(latitude).toFixed(2),  // 格式化纬度为两位小数
            longitude: Number(longitude).toFixed(2),  // 格式化经度为两位小数
          };
        });

        // 更新总数据量
        this.total = this.getEqData.length;

        // 获取当前页的数据
        this.tableData = this.getPageArr();

        // 隐藏筛选表单
        this.queryFormVisible = false;

        // 清除表单的值
        this.clearFormValue();
      }).catch(error => {
        // 处理请求错误
        console.error("请求数据失败:", error);
        // 可以加上错误提示或处理逻辑
      });

    },
    openQueryForm() {
      this.queryFormVisible = true
    },
    updateTime() {
      this.nowTime = this.now_time()
    },
    now_time() {
      let myDate = new Date()
      let myYear = myDate.getFullYear()
      let myMonth = myDate.getMonth() + 1
      let myToday = myDate.getDate()
      let myDay = myDate.getDay()
      let myHour = myDate.getHours()
      let myMinute = myDate.getMinutes()
      let mySecond = myDate.getSeconds()
      let week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      return myYear + '年' + this.fillZero(myMonth) + '月' + this.fillZero(myToday) + '日' + this.fillZero(myHour) + ':' + this.fillZero(myMinute) + ':' + this.fillZero(mySecond) + week[myDay]
    },
    fillZero(str) {
      return str < 10 ? '0' + str : str
    },
    getEq() {
      let that = this
      getEqList().then(res => {
        console.log("返回的数据", res.data)
        let resData = res.data.filter(item => Number(item.magnitude) >= 3)
        that.getEqData = resData
        console.log("过滤后", resData)
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

    handleAddOrUpdate(operation) {
      if (operation === 'add') {
        this.isPanelShow = !this.isPanelShow
      }
    },

    // 删除单条地震
    handleDelete(row) {
      let that = this;
      this.$confirm('确定要删除这条地震记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deletedEq({eqid: row.eqid}).then(res => {
          that.getEq();
          that.$message({
            type: 'success',
            message: '删除成功'
          });
        });
      }).catch(() => {
        that.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    // 点击新增或修改打开dialog对话框
    handleOpen(title, row) {
      if (title === "新增") {
        this.dialogTitle = title
        console.log(this.dialogTitle)
      } else if (title === "修改") {
        this.dialogTitle = title
        console.log("修改回来的数据",row);
        this.dialogContent = {
          earthquakeName: row.earthquakeName,
          occurrenceTime: this.formatDateToBackend(row.occurrenceTime), // 初始化为当前时间的时间戳
          magnitude: row.magnitude,
          longitude: row.longitude,
          latitude: row.latitude,
          depth: row.depth,
          eqid: row.eqid,
        }
        this.customAddress = this.dialogContent.earthquakeName;
      }
      this.dialogShow = !this.dialogShow
    },
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
      const timePattern = /^(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
      const timeMatch = searchKey.match(timePattern);

      if (timeMatch) {
        // 如果是时间格式，转换为目标格式
        const [, year, month, day, hh, mm, ss] = timeMatch;
        finalSearchKey = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:${ss.padStart(2, '0')}`;
      }

      // 发送搜索请求
      queryEqList({queryValue: finalSearchKey}).then(res => {
        console.log("检查返回的数据", res); // 检查返回的数据
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
      // return `${year}年${month}月${day}日${hh}时${mm}分${ss}秒`
      return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
    },

    // 重置功能
    resetQuery() {
      this.queryParams = '';  // 清空搜索输入框
      this.getEq();  // 重新加载所有数据
    },

    //新增或修改
    commit() {
      this.$refs.from.validate((valid) => {
        if (valid) {
          // 发送请求
          // 提交表单逻辑
          console.log("表单验证通过，提交数据");
        } else {
          console.log("表单验证失败，请检查输入！");
          // this.$message.error('表单验证失败，请检查输入！');
        }
      });

      // this.dialogContent.occurrenceTime = this.formatDateToBackend(this.dialogContent.occurrenceTime); // 调用方法格式化时间
      console.log("formatDateToBackend格式化时间commit：", this.dialogContent.occurrenceTime);
      this.dialogContent.occurrenceTime = this.formatISODateTimeToBackend(this.dialogContent.occurrenceTime); // 调用方法格式化时间
      console.log("formatDateToBackend“T”->' 'commit：", this.dialogContent.occurrenceTime);

      if (this.dialogTitle === "新增") {
        console.log("this.dialogContent.time新增：", this.dialogContent.occurrenceTime);
        addEq(this.dialogContent).then(res => {
          this.getEq();
          this.dialogShow = false;
          this.clearDialogContent();
        });
      } else {
        // 修改接口
        const dataDTO = {
          event: this.dialogContent.eqid,
          eqMagnitude: this.dialogContent.magnitude,
          eqName: this.extractAddress(this.customAddress),
          longitude: this.dialogContent.longitude,
          latitude: this.dialogContent.latitude,
          eqAddr: this.customAddress
        }
        eqEventReassessment(dataDTO).then(res => {
          this.getEq();
          this.dialogShow = false;
          this.clearDialogContent();
        })
      }
      this.dialogShow = false;
    },
    // .match('/(.*?[省市区县])/')[1]
    extractAddress(address) {
      const regex = /(.*?[省市区县])+/;
      const match = address.match(regex);
      return match ? match[0] : address; // 如果匹配成功，返回匹配的部分；否则返回原字符串
    },

    // 关闭dialog对话框
    cancel() {
      this.dialogShow = false
      this.clearDialogContent()
      this.$refs.from.resetFields(); // 重置表单
      this.$refs.from.clearValidate(); // 清除验证状态
    },
    // 关闭dialog对话框
    Cancel() {
      this.queryFormVisible = false;
      this.clearFormValue()
      this.$refs.formValue.resetFields(); // 重置表单
      this.$refs.formValue.clearValidate(); // 清除验证状态
    },
    // 清除DialogContent中的数据
    clearDialogContent() {
      Object.keys(this.dialogContent).forEach(key => {
        this.dialogContent[key] = ''
      });
    },
    // 清除formValue中的数据
    clearFormValue() {
      Object.keys(this.formValue).forEach(key => {
        this.formValue[key] = ''
      });
    },
    // 对数据库获取到的标绘图片数组切片
    getPageArr(data = this.getEqData) {
      let arr = []
      let start = (this.currentPage - 1) * this.pageSize
      let end = this.currentPage * this.pageSize
      if (end > this.total) {
        end = this.total
      }
      for (; start < end; start++) {
        arr.push(data[start])
      }
      return arr
    },

    //`每页 ${val} 条`
    handleSizeChange(val) {
      this.pageSize = val
      this.tableData = this.getPageArr()
      // console.log(`每页 ${val} 条`);
    },
    // `当前页: ${val}`
    handleCurrentChange(val) {
      this.currentPage = val
      this.tableData = this.getPageArr()
      // console.log(`当前页: ${val}`);
    },
    // 修改table的header的样式
    tableHeaderColor() {
      return {
        // 'border-color': '#293038',
        // 'background-color': '#293038 !important', // 此处是elemnetPlus的奇怪bug，header-cell-style中背景颜色不加!important不生效
        // 'color': '#fff',
        // 'padding': '0',
        'text-align': 'center',
        'font-size': '16px'
      }
    },
    // 修改table 中每行的样式
    tableColor({row, column, rowIndex, columnIndex}) {
      if (rowIndex % 2 == 1) {
        return {
          // 'border-color': '#313a44',
          // 'background-color': '#313a44',
          // 'color': '#fff',
          'padding-top': '10px',
          'padding-bottom': '10px',
          'height': '60px',
          'text-align': 'center',
          'font-size': '16px',
        }
      } else {
        return {
          // 'border-color': '#304156',
          // 'background-color': '#304156',
          // 'color': '#fff',
          // 'padding': '0',
          'padding-top': '10px',
          'padding-bottom': '10px',
          'text-align': 'center',
          'font-size': '16px'
        }
      }
    },

    simplifyLocation(eqAddr, eqMagnitude) {
      const match = eqAddr.match(/^(\S*省)?(\S*市|\S*州)?(\S*区|\S*县)/);
      if (!match) return eqAddr; // 无法匹配返回原始地名

      // 提取省、市/州、区/县
      // const province = match[1] ? match[1].replace("省", "") : ""; // 省份去掉“省”
      // const county = match[3] ? match[3].replace(/[区县]/, "") : ""; // 区/县去掉后缀
      const province = match[1];
      const cityOrState = match[2]
      const county = match[3];

      // 如果市/州与区/县之间只有一个字，连带区/县返回
      // if (county.length === 1) {
      //   return `${province}${match[3]}`;
      // }

      // 正常返回省、市/州简化结果
      return `${province}${cityOrState}${county}`;
    },


    createTid() {

      // 构造当前时间的部分
      // const now = new Date();
      // const year = now.getFullYear(); // 4位年份
      // const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份，补齐两位
      // const day = String(now.getDate()).padStart(2, '0'); // 日期，补齐两位
      // const hours = String(now.getHours()).padStart(2, '0'); // 小时，补齐两位
      // const minutes = String(now.getMinutes()).padStart(2, '0'); // 分钟，补齐两位
      // const seconds = String(now.getSeconds()).padStart(2, '0'); // 秒钟，补齐两位
      // const randomId = this.guid(8); // 提取 GUID 的最后8位
      //
      // // 拼接成完整的 event 值
      // const Tid = `T${year}${month}${day}${hours}${minutes}${seconds}${randomId}`;
      // return Tid;
      return this.guid()
    },

    guid(num) {
      return num ?
          Array.from({length: num}, () => Math.floor(Math.random() * 10)).join('') :
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
    },


    /**
     * 将年月日转换成-的形式 （用于格式化传给后端）
     * @param inputDate
     * @returns {string}
     */
    // formatDateToBackend(inputDate) {
    //   // 使用正则表达式提取日期和时间部分
    //   const regex = /(\d{4})年(\d{2})月(\d{2})日 (\d{2}):(\d{2}):(\d{2})/;
    //   const matches = inputDate.match(regex);
    //
    //   if (matches) {
    //     // 格式化为目标格式 "yyyy-MM-dd HH:mm:ss"
    //     return `${matches[1]}-${matches[2]}-${matches[3]} ${matches[4]}:${matches[5]}:${matches[6]}`;
    //   } else {
    //     throw new Error("Invalid date format");
    //   }
    // },

    formatDateToBackend(inputDate) {
      // 使用正则表达式提取日期和时间部分
      const regex = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
      const matches = inputDate.match(regex);

      if (matches) {
        // 格式化为目标格式 "yyyy-MM-dd HH:mm:ss"
        return `${matches[1]}-${matches[2]}-${matches[3]} ${matches[4]}:${matches[5]}:${matches[6]}`;
      } else {
        throw new Error("Invalid date format");
      }
    },

    /**
     * 将ISO格式换成后端想要的格式
     * @param input
     * @returns {*|string}
     */
    formatISODateTimeToBackend(input) {
      if (!input) return '';
      return input.replace('T', ' '); // 替换 'T' 为空格
    }

  },
}

</script>

<style scoped>
.custom-cascader-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px; /* 在左右各增加 20px */
}

.custom-input {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 50px); /* 剩下 36px 露出右侧 */
  z-index: 2; /* 显示在上层 */
  background: transparent;
}

.custom-cascader {
  width: 100%;
  z-index: 1; /* 显示在下层 */
}

.custom-cascader .el-cascader__label {
  visibility: hidden; /* 隐藏文本 */
}

.custom-cascader .el-cascader__dropdown {
  z-index: 3; /* 保证下拉框可用 */
}

.el-pagination {
  margin-top: 10px;
  justify-content: center;
}

.dialog-footer {
  position: relative;
  bottom: -5px;
  right: 0;
  padding: 5px; /* 调整按钮与对话框边缘的距离 */
  text-align: right; /* 右对齐按钮 */
}

:deep(.el-dialog) {
  transform: none;
  left: 0;
  top: 15%;
  position: relative;
  margin: 0 auto;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #262259;
  font-size: inherit;
  /*display: none;*/
}

:deep(.formValue) {
  padding-bottom: 13px;
}


:deep(.el-form) {
  padding-bottom: 6px;
}


:deep(.el-form-item--default .el-form-item__error) {
  font-size: 14px !important; /* 字体大小 */
  padding-top: 5px !important;
}

:deep(.el-form--inline .el-form-item ) {
  padding-bottom: 8px;
}

.el-row {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  position: relative;
  padding: 10px !important;
}
</style>
