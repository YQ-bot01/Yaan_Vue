<template>
  <div class="app-container">

    <el-form-item label="倾斜摄影管理信息" >
      <el-input
          v-model="queryParams"
          placeholder="请输入倾斜摄影管理信息"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
      />
      <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      <el-button type="primary" plain icon="Plus" @click="handleOpen('新增')">新增</el-button>
      <el-button type="primary" icon="Filter" @click="openQueryForm">筛选</el-button>
    </el-form-item>

    <el-table
        :data="TableData"
        class="table-center"
        :stripe="true"
        :header-cell-style="tableHeaderColor"
        :cell-style="tableColor"
        style="table-layout: fixed; width: 100%;"
    >
      <el-table-column
          prop="serialNumber"
          label="序号"
          min-width="80"
          align="center"
      ></el-table-column>

      <el-table-column
          prop="modelName"
          label="模型名称"
          min-width="200"
          align="center"
          show-overflow-tooltip
      ></el-table-column>

      <el-table-column
          prop="modelSize"
          label="模型大小(平方公里)"
          min-width="150"
          align="center"
          show-overflow-tooltip
      ></el-table-column>

      <el-table-column
          prop="modelPath"
          label="模型路径"
          min-width="250"
          align="center"
          show-overflow-tooltip
      ></el-table-column>

      <el-table-column
          prop="modelHeight"
          label="模型中心高度(米)"
          min-width="150"
          align="center"
          show-overflow-tooltip
      ></el-table-column>

      <el-table-column
          prop="modelHeightE"
          label="地形模型中心高度(米)"
          min-width="150"
          align="center"
          show-overflow-tooltip
      ></el-table-column>

      <el-table-column
          prop="addTime"
          label="添加时间"
          min-width="200"
          align="center"
          show-overflow-tooltip
      ></el-table-column>

      <el-table-column
          label="操作"
          min-width="200"
          align="center"
      >
        <template v-slot="scope">
          <el-button
              size="mini"
              type="text"
              @click="handleOpen('修改', scope.row)"
          >
            <el-icon><Edit /></el-icon> 修改
          </el-button>

          <el-button
              size="mini"
              type="text"
              @click="handleDelete(scope.row)"
          >
            <el-icon><Delete /></el-icon> 删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination

        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>

    <!--新增 编辑 弹框-->
    <el-dialog
        :title="dialogTitle"
        v-model="dialogShow"
        width="30vw"
        style="top:20vh"
    >
      <el-form :model="dialogContent" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="dialogContent.modelName" placeholder="请输入模型名称"></el-input>
        </el-form-item>
        <el-form-item label="模型大小" prop="modelSize">
          <el-input
              type="number"
              v-model="dialogContent.modelSize"
              placeholder="请输入模型大小(GB)"
          ></el-input>
        </el-form-item>
        <el-form-item label="添加时间" prop="addTime">
          <el-date-picker
              v-model="dialogContent.addTime"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ss"
              placeholder="选择日期时间"
              size="large"
              style="width: 100%;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="模型路径" prop="modelPath">
          <el-input v-model="dialogContent.modelPath" placeholder="请输入模型路径"></el-input>
        </el-form-item>
        <el-form-item label="模型中心高度(米)" prop="modelHeight">
          <el-input v-model="dialogContent.modelHeight" placeholder="请输入模型高度"></el-input>
        </el-form-item>
        <el-form-item label="旋转角度(度)" prop="rotationAngle">
          <el-input v-model="dialogContent.rotationAngle" placeholder="请输入旋转角度"></el-input>
        </el-form-item>
      </el-form>

      <!-- 调整按钮样式 -->
      <div class="dialog-footer" style="text-align: right; margin-top: 20px;">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="commit">确 定</el-button>
      </div>
    </el-dialog>
    <!--    筛选-->
    <el-dialog
        v-model="queryFormVisible"
        title="筛选"
        width="30vw"
        style="top:20vh"
    >
      <el-form :model="dialogContent" ref="formValue" label-width="100px">
        <!-- 模型名称 -->
        <el-form-item label="模型名称">
          <el-input
              v-model="dialogContent.modelName"
              style="width: 100%;"
              placeholder="模型名称"
              clearable
          />
        </el-form-item>

        <!-- 模型大小 -->
        <el-form-item label="模型大小" prop="modelHeight">
          <el-input
              type="number"
              v-model="dialogContent.modelSize"
              style="width: 100%;"
              placeholder="请输入模型大小（GB）"
              clearable
          />
        </el-form-item>

        <!-- 添加时间 -->
        <el-form-item label="添加时间" prop="addTime">
          <el-date-picker
              v-model="dialogContent.addTime"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="width: 100%;"
              placeholder="选择日期时间"
              size="large"
              clearable
          />
        </el-form-item>

        <!-- 模型路径 -->
        <el-form-item label="模型路径" prop="modelPath">
          <el-input
              v-model="dialogContent.modelPath"
              style="width: 100%;"
              placeholder="请输入模型路径"
              clearable
          />
        </el-form-item>

        <!-- 模型中心高度 -->
        <el-form-item label="模型中心高度" prop="modelSize">
          <el-input
              type="number"
              v-model="dialogContent.modelHeight"
              style="width: 100%;"
              placeholder="请输入模型中心高度（米）"
              clearable
          />
        </el-form-item>

        <!-- 旋转角度 -->
        <el-form-item label="旋转角度" prop="rotationAngle">
          <el-input
              type="number"
              v-model="dialogContent.rotationAngle"
              style="width: 100%;"
              placeholder="请输入旋转角度（度）"
              clearable
          />
        </el-form-item>
      </el-form>

      <!-- 按钮部分 -->
      <div class="dialog-footer" style="text-align: right; margin-top: 20px;">
        <el-button @click="Cancel">取 消</el-button>
        <el-button type="primary" @click="onSubmit">筛 选</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ElButton, ElIcon, ElForm, ElMessage, ElMessageBox } from "element-plus";
import { Delete, Edit } from "@element-plus/icons-vue";
import {
  addModel,
  deleteModel, getModelData, getModelTotalData, ObliqueImageryFilterContent,
  queryObliqueImageryData,
  updataModel
} from "@/api/system/tiltPhotography.js";
import {fromEq} from "@/api/system/eqlist.js";

export default {
  name: "index",
  components: { Delete, ElButton, Edit, ElIcon, ElForm },
  data() {
    return {
      TableData: [],     // 当前页数据
      filterContent: [], //筛选内容
      tableData: [],     //存储 新增 or 编辑 or 筛选后端返回数据
      queryParams: '',  //搜索框关键字
      formValue: {},
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      dialogShow: false,
      dialogTitle: null,
      // 新增 编辑 筛选 向后端传的内容
      dialogContent: {
        serialNumber: '',
        modelName: '',
        modelLabel:'',
        modelSize: '',
        addTime: '',
        modelPath: '',
        modelHeight: '',
        modelHeightE: '',
        rotationAngle: '',
        modelid: ''
      },
      queryFormVisible: false,
      rules: {
        modelName: [
          { required: true, message: '请填写模型名称', trigger: 'blur' }
        ],
        modelSize: [
          { message: '请填写模型大小', trigger: 'blur' ,required: false }
        ],
        addModel: [
          { message: '请填写添加时间', trigger: 'blur',required: false  }
        ],
        modelPath: [
          { message: '请填写模型路径', trigger: 'blur' ,required: false }
        ],
        modelHeight: [
          { message: '请填写模型高度', trigger: 'blur' ,required: false }
        ],
        rotationAngle: [
          {  message: '请填写旋转角度', trigger: 'blur' ,required: false }
        ]
      },
    };
  },

  created() {
    this.fetchModelData();
  },

  methods: {
    fetchTotalCount() {
      getModelTotalData().then(res => {
        this.total = res;
        console.log("总条数 (total):", this.total);
      });
    },
    fetchModelData() {
      getModelData().then(res => {
        console.log("获取的数据:", res); // 打印获取的数据
        this.tableData = res.map((item, index) => {
          let formattedCreateTime = '';
          // 确保 createTime 存在且有效
          if (item.hasOwnProperty('time') && item.time) {
            const createTime = new Date(item.time);

            // 确认解析后的 createTime 是否有效
            if (!isNaN(createTime)) {
              // 格式化为 yyyy年MM月dd日 HH:mm:ss
              const year = createTime.getFullYear();
              const month = (createTime.getMonth() + 1).toString().padStart(2, '0'); // 月份补零
              const day = createTime.getDate().toString().padStart(2, '0');
              const hours = createTime.getHours().toString().padStart(2, '0');
              const minutes = createTime.getMinutes().toString().padStart(2, '0');
              const seconds = createTime.getSeconds().toString().padStart(2, '0');

              // 格式化为需要的格式
              formattedCreateTime = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
            } else {
              console.log(`无效的日期: ${item.createTime}`);
            }
          } else {
            console.log('没有 createTime 或其值为空:', item); // 如果没有 createTime 或为空，输出提示
          }
          // 返回处理后的数据对象
          return {
            serialNumber: index + 1,
            modelid: item.uuid,
            modelName: item.name,
            modelPath: item.path,
            addTime: formattedCreateTime, // 使用处理后的 addTime
            modelSize: item.modelSize,
            modelHeight: item.tz,
            modelHeightE: item.tze,
            rotationAngle: item.rze
          };
        });
        // 设置总条数
        this.total = this.tableData.length;
        console.log("处理后的数据 (tableData):", this.tableData);
        console.log("总条数 (通过数据长度计算):", this.tableData.length);

        this.updateTableData()
      }).catch(error => {
        console.error("获取数据失败:", error);
      });


    },
    // 筛选
    onSubmit() {
      this.filterContent = {
        //  和后端字段对应
        name: this.dialogContent.modelName || null,
        time: this.formatISODateTimeToBackend(this.dialogContent.addTime), // 调用方法格式化时间
        tze: this.dialogContent.modelHeightE || null,
        tz: this.dialogContent.modelHeight || null,
        rze: this.dialogContent.rotationAngle || null,
        path: this.dialogContent.modelPath || null,
        modelSize: this.dialogContent.modelSize || null
      };

      console.log("filterContent", this.filterContent);

      // 发送请求
      ObliqueImageryFilterContent(this.filterContent).then(res => {

        // 格式化返回的结果，生成表格数据
        this.tableData = res.data.map((item, index) => {
          let formattedAddTime = '';

          // 格式化 addTime 为 yyyy-MM-dd HH:mm:ss 格式
          if (item.time) {
            const addTime = new Date(item.time); // 将 time 转为 Date 对象
            formattedAddTime = addTime.toISOString().replace('T', ' ').substring(0, 19); // 格式化为 yyyy-MM-dd HH:mm:ss
          }

          return {
            serialNumber: (this.currentPage - 1) * this.pageSize + index + 1,  // 计算序号
            modelid: item.uuid,  // 保持一致
            modelName: item.name,
            modelPath: item.path,
            addTime: formattedAddTime,  // 使用格式化后的时间
            modelSize: item.modelSize,  // 确保使用正确的字段名
            modelHeight: item.tz,
            modelHeightE: item.tze,
            rotationAngle: item.rze,
          };
        });

        // 在前端计算总数
        this.total = this.tableData.length;  // 使用数据的长度来计算总数
        // 更新分页数据
        this.updateTableData();

        // 隐藏筛选表单：设置为 false 以关闭弹框
        this.queryFormVisible = false;

        // 清空表单字段
        this.clearFormValue();

      }).catch(error => {
        console.error("查询失败:", error);
      });
    },
    // 清除formValue中的数据
    clearFormValue() {
      Object.keys(this.formValue).forEach(key => {
        this.formValue[key] = ''
      });
    },
    // 关闭dialog对话框
    Cancel() {
      this.queryFormVisible = false;
      this.clearFormValue()
      this.$refs.formValue.resetFields(); // 重置表单
      this.$refs.formValue.clearValidate(); // 清除验证状态
    },
    // 搜索框查询
    handleQuery() {
      const searchKey = this.queryParams.trim(); // 获取搜索关键字
      let result = searchKey.replace(/年|月/g, "-").replace(/日/g, "");

      // 查询数据
      queryObliqueImageryData(result)
          .then(res => {
            console.log("获取的数据:", res);

            // 格式化日期函数
            const formatDate = (time) => {
              if (!time) return ''; // 如果时间为空，返回空字符串
              const createTime = new Date(time);
              if (isNaN(createTime)) {
                console.warn(`无效的日期: ${time}`);
                return '';
              }
              // 格式化为 yyyy年MM月dd日 HH:mm:ss
              const year = createTime.getFullYear();
              const month = (createTime.getMonth() + 1).toString().padStart(2, '0');
              const day = createTime.getDate().toString().padStart(2, '0');
              const hours = createTime.getHours().toString().padStart(2, '0');
              const minutes = createTime.getMinutes().toString().padStart(2, '0');
              const seconds = createTime.getSeconds().toString().padStart(2, '0');
              return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
            };

            // 处理数据
            this.tableData = res.data.map((item, index) => ({
              serialNumber: index + 1,
              modelid: item.uuid,
              modelName: item.name,
              modelPath: item.path,
              addTime: formatDate(item.time), // 使用独立的日期格式化函数
              modelSize: item.modelSize,
              modelHeight: item.tz,
              modelHeightE: item.tze,
              rotationAngle: item.rze
            }));

            // 更新总数并刷新表格
            this.total = this.tableData.length;
            this.updateTableData();
          })
          .catch(error => {
            console.error("查询时出现错误:", error);
            ElMessage.error('查询失败，请稍后重试');
          });
    },

    // 删除
    handleDelete(row) {
      ElMessageBox.confirm('确定要删除该条记录吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
          .then(() => {
            console.log('准备删除的 UUID:', row.modelid);
            deleteModel(row.modelid)
                .then(response => {
                  console.log('响应:', response); // 打印响应
                  this.fetchModelData();
                  this.fetchTotalCount(); // 获取总数
                  ElMessage.success('删除成功');
                })
                .catch((error) => {
                  console.error('删除请求出错:', error);
                  ElMessage.error('删除失败，请重试');
                });
          })
          .catch(() => {
            ElMessage.info('删除操作已取消');
          });
    },
    // 打开 新增or编辑 弹框
    handleOpen(title, row = {}) {
      this.dialogTitle = title;

      if (title === "新增") {
        this.dialogContent = {
          modelName: '',
          modelSize: '',
          addTime: '',
          modelPath: '',
          modelHeight: '',
          modelHeightE: '',
          rotationAngle: '',
          modelid: ''
        };
      } else if (title === "修改") {
        this.dialogContent = {
          modelName: row.modelName,
          modelSize: row.modelSize,
          addTime: this.formatDateToBackend(row.addTime), // 格式化时间
          modelPath: row.modelPath,
          modelHeight: row.modelHeight,
          modelHeightE: row.modelHeightE,
          rotationAngle: row.rotationAngle,
          modelid: row.modelid
        };
      }

      this.dialogShow = true;
    },
    // 重置功能
    resetQuery() {
      this.queryParams = '';  // 清空搜索输入框
      this.fetchModelData();
      this.fetchTotalCount(); // 获取总数
    },
    // 新增 or 编辑 提交按钮
    commit() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          const modelData = {
            name: this.dialogContent.modelName,
            modelSize: this.dialogContent.modelSize,
            path: this.dialogContent.modelPath,
            rz: 0, // 假设这里是0
            tz: -557, // 假设这里是-557
            rze: this.dialogContent.rotationAngle,
            tze: this.dialogContent.modelHeightE,
            time: this.formatISODateTimeToBackend(this.dialogContent.addTime), // 调用方法格式化时间
            uuid: this.dialogContent.modelid,
          };
          console.log("提交的模型大小:", modelData); // 调试输出

          if (this.dialogTitle === "新增") {
            addModel(modelData)
                .then(() => {
                  this.fetchModelData();
                  this.fetchTotalCount(); // 获取总数
                  this.dialogShow = false;
                  this.clearDialogContent();
                  ElMessage.success('新增已完成');
                })
                .catch(error => {
                  console.error("新增模型失败:", error);
                });
          } else {
            updataModel(modelData)
                .then(() => {
                  this.fetchModelData();
                  this.fetchTotalCount(); // 获取总数
                  this.dialogShow = false;
                  this.clearDialogContent();
                  ElMessage.success('编辑已完成');    // 提示编辑完成
                })
                .catch(error => {
                  console.error("更新模型失败:", error);
                });
          }
        }
      })
    },
    // 筛选弹框 打开
    openQueryForm() {
      this.queryFormVisible = true;
      // 重置dialog内容，确保每次打开时内容是清空的
      this.dialogContent = {
        modelName: '',
        modelSize: '',
        addTime: '',  // 确保时间为空
        modelPath: '',
        modelHeight: '',
        modelHeightE: '',
        rotationAngle: '',
        modelid: ''
      };
    },
    clearDialogContent() {
      this.dialogContent = {
        modelName: '',
        modelSize: '',
        addTime: '',
        modelPath: '',
        modelHeight: '',
        modelHeightE: '',
        rotationAngle: '',
        modelid: ''
      };
    },
    /**
     * 分页
     */
    updateTableData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.TableData = this.tableData.slice(start, end); // 更新当前页数据
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize; // 更新 pageSize
      this.currentPage = 1; // 切换分页大小时重置为第一页
      this.updateTableData(); // 重新加载数据
    },
    handleCurrentChange(page) {
      // 当前页变化时，更新数据
      this.currentPage = page;
      this.updateTableData();
    },
    cancel() {
      this.dialogShow = false;
    },
    /**
     * 将年月日转换成-的形式 （用于格式化传给后端）
     * @param inputDate
     * @returns {string}
     */
    formatDateToBackend(inputDate) {
      // 如果输入为空，则直接返回 null
      if (!inputDate) {
        return null;
      }

      // 使用正则表达式提取日期和时间部分
      const regex = /(\d{4})年(\d{2})月(\d{2})日 (\d{2}):(\d{2}):(\d{2})/;
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




};
</script>

<style scoped>

.el-form-item__content {
  flex: 1;
}

.table-center {
  text-align: center;
}
.mb8 {
  margin-bottom: 8px;
}
.pagination {
  justify-content: center; /* 水平居中 */
  margin-top: 20px;
}

::v-deep(.el-tooltip__popper) {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

</style>
