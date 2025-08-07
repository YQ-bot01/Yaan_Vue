<template>
  <div class="app-container">
    <el-form-item label="应急避难场所" >
      <el-input
          v-model="queryParams"
          placeholder="请输入避难场所信息"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
      />
      <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            <el-button type="primary" plain icon="Plus" @click="handleOpen('新增')">新增</el-button>
    </el-form-item>

    <el-table :data="tableData" :stripe="true" :header-cell-style="tableHeaderColor" :cell-style="tableColor">
      <el-table-column label="序号" width="60" fixed="left">
        <template #default="{ row, column, $index }">
          {{ ($index + 1) + (currentPage - 1) * pageSize }}
        </template>
      </el-table-column>

      <!-- 遍历每个表头，创建表格列 -->
      <el-table-column
          v-for="(header, index) in headersArr"
          :key="index"
          :prop="header.prop"
          :label="header.label"
          :width="header.width"
          show-overflow-tooltip
      >
        <template #default="{ row }">
          <!-- 特定字段处理：例如 startTime 为 null 或 '1970-01-01' 时为空 -->
          <div v-if="header.prop === 'startTime'">
            {{ row.startTime}}
          </div>

          <!-- 其他字段直接显示 -->
          <div v-else>
            {{ row[header.prop] }}
          </div>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" align="center" width="150" fixed="right">
        <template #default="scope">
          <el-button type="text" icon="Edit" @click="handleOpen('修改',scope.row)">修改</el-button>
          <el-button type="text" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
        style="justify-content: center"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>

    <!--表单-->
    <el-dialog :title="dialogTitle" v-model="dialogShow" width="35%" :show-close="false">
      <el-form ref="form" :model="dialogContent" :rules="rules">
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="名称:" prop="name">
              <el-input v-model="dialogContent.name" placeholder="请输入名称" required></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="可容纳人数:" prop="capacity">
              <el-input v-model.number="dialogContent.capacity" placeholder="请输入可容纳人数" type="number" min="0"></el-input>
            </el-form-item>
          </el-col>

        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="面积（平方米）:" prop="area">
              <el-input v-model.number="dialogContent.area" placeholder="请输入面积" type="number" min="0"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="数据来源单位:" prop="dataSourceUnit">
              <el-input v-model.number="dialogContent.dataSourceUnit" placeholder="请输入数据来源单位" ></el-input>
            </el-form-item>
          </el-col>

        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="地址:" prop="address">
              <el-input v-model="dialogContent.address" placeholder="请输入地址" ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="行政区划:" prop="administrativeDivision">
              <el-input v-model="dialogContent.administrativeDivision" placeholder="请输入名称" ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="负责人:" prop="personInCharge">
              <el-input v-model="dialogContent.personInCharge" placeholder="请输入负责人" ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="应急手机:" prop="emergencyMobile">
              <el-input v-model="dialogContent.emergencyMobile" placeholder="请输入应急手机"></el-input>
            </el-form-item>
          </el-col>

        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="所属机构:" prop="affiliatedOrganization">
              <el-input v-model="dialogContent.affiliatedOrganization" placeholder="请输入负责人" ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="设计使用年限（年）:" prop="designServiceLife">
              <el-input v-model.number="dialogContent.designServiceLife" placeholder="例如：1" type="number"></el-input>
            </el-form-item>
          </el-col>
        </el-row>



        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="级别名称:" prop="levelName">
              <el-input v-model="dialogContent.levelName" placeholder="请输入级别名称"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="投入使用时间:" prop="startTime">
              <el-date-picker
                  v-model="dialogContent.startTime"
                  type="datetime"
                  placeholder="选择日期时间"
                  value-format="YYYY-MM-DDTHH:mm:ss"
                  size="large"
                  @change="handleStartDateChange"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="保密级别:" prop="secretLevel">
              <el-input v-model="dialogContent.secretLevel" placeholder="例：一级"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="地震烈度（度）:" prop="seismicIntensity">
              <el-input v-model.number="dialogContent.seismicIntensity" placeholder="请输入地震烈度" type="number"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="经度（度分）:" prop="longitude">
              <el-input v-model.number="dialogContent.longitude" placeholder="请输入经度" type="number"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="纬度（度分）:" prop="latitude">
              <el-input v-model.number="dialogContent.latitude" placeholder="请输入纬度" type="number"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="场所类型名称:" prop="shelterTypeName">
              <el-input v-model="dialogContent.shelterTypeName" placeholder="请输入场所类型名称"></el-input>
            </el-form-item>
          </el-col>


          <el-col :span="12">
            <el-form-item label="基本情况:" prop="description">
              <el-input v-model.number="dialogContent.description" placeholder="请输入" ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="16">
            <el-form-item label="备注:" prop="remarks">
              <el-input type="textarea" v-model="dialogContent.remarks" placeholder="请输入备注"></el-input>
            </el-form-item>
          </el-col>

        </el-row>

        <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="commit">确 定</el-button>
      </span>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
  searchEmergencyShelters,
  sheltersList,addEmergencyShelters,updateEmergencyShelters,deleteEmergencyShelters
} from "../../api/system/emergency.js";


export default {
  name: "emergencyShelters",
  data(){
    return {
      sheltersData: [],
      tableData: [],
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      // ---表头---
      headersArr: [
        { prop: 'name', label: '名称', width: 280 },
        { prop: 'area', label: '面积（平方米）', width: 150 },
        { prop: 'capacity', label: '可容纳人数', width: 150 },
        { prop: 'administrativeDivision', label: '行政区划', width: 200 },
        { prop: 'address', label: '地址', width: 450 },
        { prop: 'personInCharge', label: '负责人', width: 150 },
        { prop: 'emergencyMobile', label: '应急手机', width: 150 },
        { prop: 'affiliatedOrganization', label: '所属机构', width: 140 },
        { prop: 'designServiceLife', label: '设计使用年限（年）', width: 190 },
        { prop: 'longitude', label: '经度（度分）', width: 120 },
        { prop: 'latitude', label: '纬度（度分）', width: 120 },
        { prop: 'remarks', label: '备注', width: 300 },
        { prop: 'startTime', label: '投入使用时间', width: 300 },
        { prop: 'description', label: '基本情况', width: 150 },
        { prop: 'seismicIntensity', label: '地震烈度（度）', width: 150 },
        { prop: 'shelterTypeName', label: '场所类型名称', width: 120 },
        { prop: 'levelName', label: '级别名称', width: 120 },
        { prop: 'secretLevel', label: '保密级别', width: 120 },
        { prop: 'dataSourceUnit', label: '数据来源', width: 180 },
      ],
      // 查询功能
      queryParams: '',   // 搜索关键字

      dialogShow: false,
      dialogTitle: null,
      //表单
      dialogContent: {
        affiliatedOrganization:'',  //所属机构
        administrativeDivision:'',  //行政区划
        name: '',  //名称
        address:'',  //地址
        shelterTypeName: '',  //场所类型名称
        area: '',  //面积
        capacity: '',  //可容纳人数
        levelName: '',  //级别名称
        secretLevel: '',    //保密级别
        personInCharge: '',  //负责人
        // emergencyPhone: '',  //应急电话
        emergencyMobile: '',  //应急手机
        startTime:'', //投入使用时间 使用时间戳
        designServiceLife: '',  //设计使用年限
        seismicIntensity:'',  //地震烈度
        remarks: '',  //备注
        longitude: '',  //经度
        latitude: '',  //纬度
        description:'',   //基本情况
        dataSourceUnit:'',  //数据来源单位
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }], //名称
        area: [
          {
            type: 'number',
            message: '请输入面积',
            trigger: 'blur',
            transform: (value) => Number(value)
          },
          {
            validator: (rule, value, callback) => {
              // 在未输入值时，验证通过，不提示错误
              if (value === '' || value === undefined || value === null) {
                return callback();
              }

              // 检查是否为有效的数字
              const num = Number(value);
              if (isNaN(num)) {
                callback(new Error('面积必须为数字'));
                return;
              }

              // 检查是否为非负数
              if (num < 0) {
                callback(new Error('面积只能为非负数'));
                return;
              }

              callback();  // 验证通过
            },
            trigger: 'blur'
          }
        ],


        capacity: [
          {
            required: true, type: 'number', message: '请输入可容纳人数', trigger: 'blur', transform: (value) => Number(value)
          },
          {
            validator: (rule, value, callback) => {
              if (!value) {
                return callback(new Error('总人数不能为空'));
              }

              // 检查是否为有效的正整数
              if (!Number.isInteger(value) || value < 0) {
                callback(new Error('人数必须为正整数'));
                return;
              }

              callback();  // 验证通过
            },
            trigger: 'blur'
          }
        ],

        dataSourceUnit: [{  message: '请输入数据来源单位', trigger: 'blur' }],  //数据来源单位
        emergencyMobile: [
          {
            validator: (rule, value, callback) => {
              // 如果没有填写手机号，不做验证
              if (!value) {
                callback(); // 不触发错误
                return;
              }

              const mobileRegex = /^1[3-9]\d{9}$/; // 手机号码
              const landlineRegex = /^0\d{2,3}-\d{7,8}$/; // 座机号码，带区号
              const specialNumberRegex = /^\d{3,4}$/; // 特殊号码，如110, 120

              // 如果值符合其中任何一个号码格式，验证通过
              if (
                  mobileRegex.test(value) ||
                  landlineRegex.test(value) ||
                  specialNumberRegex.test(value)
              ) {
                callback(); // 验证通过
              } else {
                callback(new Error('电话号码格式不正确'));
              }
            },
            trigger: 'blur'
          }
        ],
        longitude: [
          {
            type: 'number', message: '请输入经度(度分)', trigger: 'blur', transform: (value) => Number(value)
          },
          {
            validator: (rule, value, callback) => {
              // 如果没有输入值，直接跳过验证
              if (value === undefined || value === null || value === '') {
                return callback();  // 不进行任何验证
              }

              const num = Number(value);
              if (isNaN(num)) {
                return callback(new Error('经度必须为数字'));
              }
              if (num < -180 || num > 180) {
                return callback(new Error('经度应在-180到180之间'));
              }
              callback();
            },
            trigger: ['blur', 'change'],
          },
        ],

        latitude: [
          {type: 'number', message: '请输入纬度(度分)', trigger: 'blur', transform: (value) => Number(value)
          },
          {
            validator: (rule, value, callback) => {
              // 如果没有输入值，直接跳过验证
              if (value === undefined || value === null || value === '') {
                return callback();  // 不进行任何验证
              }

              const num = Number(value);
              if (isNaN(num)) {
                return callback(new Error('纬度必须为数字'));
              }
              if (num < -90 || num > 90) {
                return callback(new Error('纬度应在-90到90之间'));
              }
              callback();
            },
            trigger: ['blur', 'change'],
          },
        ],




      }

    }
  },
  mounted() {

    this.getDate()
  },
  methods:{
    getDate(){
      // 假设从后端获取数据时赋值到 `sheltersData`
      this.sheltersData = this.sheltersData.map(item => {
        return {
          ...item,
          startTime: item.startTime ? item.startTime : '' // 如果 `startTime` 为 null，则替换为空字符串
        };
      });
      sheltersList().then(res => {
        this.sheltersData = res.map(item => ({
          ...item,
          startTime: item.startTime ? this.timestampToTime(item.startTime) : ''
        }));

        this.total = res.length;
        this.tableData = this.getPageArr(); // 确保 `sheltersData` 赋值后再更新分页数据
      });


    },
    handleOpen(feature, row) {
      this.dialogShow = true; // 确保 dialogShow 设置为 true 以显示弹窗
      this.dialogTitle = feature;
      if (feature === '新增') {
        this.clearDialogContent(); // 清空表单内容
      } else if (feature === '修改') {
        // 根据 row 的内容填充表单
        this.dialogContent = {...row};
      }
    },
    // 删除单条数据
    handleDelete(row) {
      let that = this;
      // console.log('准备删除的 UUID:', row.uuid);
      // console.log('UUID 的类型:', typeof row.uuid);
      this.$confirm('确定要删除这条地震记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteEmergencyShelters( row.uuid).then(res => {
          that.getDate();
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

    // 搜索功能
    handleQuery() {
      // 获取搜索关键字
      const searchKey = this.queryParams.trim();

      // 如果搜索关键字为空，恢复为原始数据
      if (searchKey === "") {
        this.getDate();  // 恢复为原始数据
        return;
      }

      // 发送搜索请求
      searchEmergencyShelters(searchKey)
          .then(res => {
            console.log("检查返回的数据", res); // 检查返回的数据
            // 遍历返回的数据，将 occurrenceTime 格式化
            for (let i = 0; i < res.length; i++) {
              let item = res[i];
              item.startTime = item.startTime ? this.timestampToTime(item.startTime) : ''
            }

            // 更新 tableData 以显示搜索结果
            this.sheltersData = res;  // 更新 sheltersData
            this.total = res.length;  // 更新总数
            this.tableData = this.getPageArr(res); // 使用更新后的数据进行分页
          })
          .catch(error => {
            console.error("搜索时出现错误:", error);
          });
    },
    // 重置功能
    resetQuery() {
      this.queryParams = '';  // 清空搜索输入框
      this.getDate();  // 重新加载所有数据
    },


    // 新增或修改
    commit() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          console.log("表单验证失败，请检查输入！");
          // 可根据需求显示错误提示，比如 this.$message.error('表单验证失败，请检查输入！');
          return;
        }

        console.log("表单验证通过，提交数据");

        // // 格式化 startTime 字段，只有在有值的情况下才格式化成 ISO 8601 格式
        // this.dialogContent.startTime = this.dialogContent.startTime
        //     ? new Date(this.dialogContent.startTime).toISOString()  // 如果有值，转换为 ISO 8601 格式
        //     : ' ';  // 如果没有值，保留为空（不使用当前时间）

        // 处理日期，若没有选择日期则设为 null 或空值
        // 提交时处理 null 值
        if (this.dialogContent.startTime === null||this.dialogContent.startTime === '1970年01月01日 08:00:00'||this.dialogContent.startTime==='') {
          // 如果 startTime 是 null，确保提交空值给后端
          this.dialogContent.startTime = null;
        } else {
          // 格式化时间为 ISO 格式，提交给后端
          console.log("提交前的 startTime ：", this.dialogContent.startTime);
          this.dialogContent.startTime = this.formatDateToISOString(this.dialogContent.startTime);
        }


        // // 格式化 startTime 字段，使用当前时间或转换为 ISO 8601 格式
        // this.dialogContent.startTime = this.dialogContent.startTime
        //     ? new Date(this.dialogContent.startTime).toISOString()
        //     : new Date().toISOString();

        // 打印调试信息
        console.log("startTime 类型：", typeof this.dialogContent.startTime);
        console.log("startTime 值：", this.dialogContent.startTime);

        const { longitude, latitude } = this.dialogContent;
        // 检查经纬度是否有效
        if (longitude && latitude && !isNaN(longitude) && !isNaN(latitude)) {
          // 将经纬度转换为符合 Geometry 格式的对象
          this.dialogContent.geom = {
            type: "Point",
            coordinates: [parseFloat(this.dialogContent.longitude), parseFloat(this.dialogContent.latitude)] // 经纬度数组
          };
        } else {
          this.dialogContent.geom = null;  // 或者删除该字段
          // 如果希望完全移除 geom 字段，也可以使用 delete:
          // delete this.dialogContent.geom;
        }


        // 打印调试信息，查看所有字段
        console.log("提交数据内容：", this.dialogContent);

        // 根据操作类型提交请求
        const action = this.dialogTitle === "新增"
            ? addEmergencyShelters
            : this.dialogTitle === "修改"
                ? updateEmergencyShelters
                : null;

        if (action) {
          action(this.dialogContent).then(() => {
            this.getDate();
            this.dialogShow = false;
            this.clearDialogContent();


            // 提示新增或修改成功
            this.$message.success(`${this.dialogTitle}成功！`);
          }).catch(error => {
            console.error("提交时出现错误:", error);
            this.$message.error('操作失败，请稍后再试！');
          });
        } else {
          this.dialogShow = true;
        }
      });
    },

    // 处理日期变化
    // handleStartDateChange(date) {
    //   if (!date || date === '1970-01-01 08:00:00') {
    //     // 用户清空日期或默认无效日期
    //     this.dialogContent.startTime = '';
    //   } else {
    //     this.dialogContent.startTime = date;
    //   }
    // },
    // 处理日期变化
    handleStartDateChange(date) {
      if (!date) {
        // 如果选择日期为 null（即用户清空了日期），则设置为 null
        this.dialogContent.startTime = null;
      } else {
        // 如果有日期选择，正常处理
        this.dialogContent.startTime = date;
      }
    },


    // 将时间戳转为 ISO 格式 (yyyy-MM-dd HH:mm:ss)
    formatDateToISOString(timestamp) {
      if (!timestamp) return null; // 如果时间戳为空，返回 null
      const date = new Date(timestamp);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 确保两位数
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // 这里修正反引号
    },





    // 关闭dialog对话框
    cancel() {
      this.dialogShow = false
      this.clearDialogContent()
      this.$refs.form.resetFields(); // 重置表单
      this.$refs.form.clearValidate(); // 清除验证状态
    },

    // 清除DialogContent中的数据
    clearDialogContent() {
      Object.keys(this.dialogContent).forEach(key => {
        this.dialogContent[key] = ''
      });
    },



    getPageArr(data = this.sheltersData) {
      let arr = [];
      let start = (this.currentPage - 1) * this.pageSize;
      let end = this.currentPage * this.pageSize;
      if (end > this.total) {
        end = this.total;
      }
      for (; start < end; start++) {
        if (data[start]) {
          arr.push(data[start]);
        }
      }
      return arr;
    },
    // 将ISO时间格式转为"YYYY-MM-DD HH:MM:SS"
    formatDate(isoString) {
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
    timestampToTime(timestamp) {
      console.log("转换前的时间戳:", timestamp);
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

      return `${year}年${month}月${day}日 ${hh}:${mm}:${ss}`
      // return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
    },


  }
}
</script>

<style scoped>
/*   表单   */

:deep(.el-dialog) {
  transform: none;
  left: 0;
  top: 10%;
  position: relative;
  margin: 0 auto;
}

:deep(.el-form-item--default .el-form-item__error) {
  font-size: 14px !important; /* 字体大小 */
  padding-top: 5px !important;
}

.el-input__inner::placeholder {
  font-size: 10px !important; /* 设置 placeholder 字体大小 */
  color: #999; /* 你可以调整 placeholder 的颜色 */
}

.el-input__inner {
  font-size: 12px; /* 设置输入框内字体大小，调整以适应设计需求 */
}



/* 调整表单验证错误提示的字体大小 */
:deep([data-v-3dab735b] .el-form-item--default .el-form-item__error) {
  font-size: 12px !important;
  padding-top: 5px !important;
}


</style>
