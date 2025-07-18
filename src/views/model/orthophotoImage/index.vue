<template>
  <div class="app-container">
    <el-form-item label="正射影像管理信息" >
      <el-input
          v-model="queryParams"
          placeholder="请输入正射影像管理信息"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
      />
      <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      <el-button  v-if="isAdmin" type="primary" plain icon="Plus" @click="handleEdit('新增')">新增</el-button>
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
      <!-- 序号列 -->
      <el-table-column
          label="序号"
          align="center"
          width="100"
      >
        <template #default="{ $index }">
          {{ ($index + 1) + (currentPage - 1) * pageSize }}
        </template>
      </el-table-column>

      <!-- 正射影像名称列 -->
      <el-table-column
          prop="label"
          label="正射影像名称"
          :min-width="250"
          align="center"
          show-overflow-tooltip
      ></el-table-column>

      <!-- 正射影像名称列 -->
      <el-table-column
          prop="name"
          label="正射影像图层"
          :min-width="150"
          align="center"
          show-overflow-tooltip
      ></el-table-column>

      <!-- 纬度 -->
      <el-table-column
          prop="lat"
          label="纬度"
          :min-width="130"
          align="center"
          show-overflow-tooltip
      ></el-table-column>

      <!-- 经度 -->
      <el-table-column
          prop="lon"
          label="经度"
          :min-width="130"
          align="center"
          show-overflow-tooltip
      ></el-table-column>

      <!-- 正射影像路径列 -->
      <el-table-column
          prop="path"
          label="正射影像路径"
          :min-width="250"
          align="center"
          show-overflow-tooltip
      ></el-table-column>

      <!-- 添加时间列 -->
      <el-table-column
          prop="createTime"
          label="添加时间"
          :min-width="220"
          align="center"
          show-overflow-tooltip
      >
        <template #default="{ row }">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column
          label="操作"
          align="center"
          :min-width="200"
      >
        <template #default="{ row }">
          <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="handleOpen(row)"
          >
            浏览
          </el-button>
          <el-button
              v-if="isAdmin"
              size="mini"
              type="text"
              @click="handleEdit('修改', row)"
          >
            <el-icon><Edit /></el-icon>修改
          </el-button>
          <el-button
              v-if="isAdmin"
              size="mini"
              type="text"
              @click="handleDelete(row)"
          >
            <el-icon><Delete /></el-icon>删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>


    <!--分页按钮-->
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
    <!--新增 or 编辑 弹框-->
    <el-dialog :title="dialogTitle" v-model="dialogShow" width="30vw">
      <el-form ref="form" :model="dialogContent" :rules="rules" label-width="120px">
        <!-- 正射影像名称 -->
        <el-form-item label="正射影像名称" prop="name">
          <el-input
              v-model="dialogContent.label"
              placeholder="请输入正射影像名称"
              style="width: 100%;"
          ></el-input>
        </el-form-item>
        <el-form-item label="正射影像图层" prop="name">
          <el-input
              v-model="dialogContent.name"
              placeholder="请输入正射影像图层"
              style="width: 100%;"
          ></el-input>
        </el-form-item>
        <el-form-item label="纬度" prop="name">
          <el-input
              v-model="dialogContent.lat"
              placeholder="请输入纬度"
              style="width: 100%;"
          ></el-input>
        </el-form-item>
        <el-form-item label="经度" prop="name">
          <el-input
              v-model="dialogContent.lon"
              placeholder="请输入经度"
              style="width: 100%;"
          ></el-input>
        </el-form-item>
        <!-- 正射影像路径 -->
        <el-form-item label="正射影像路径" prop="path">
          <el-input
              v-model="dialogContent.path"
              placeholder="请输入正射影像路径"
              style="width: 100%;"
          ></el-input>
        </el-form-item>

        <!-- 添加时间 -->
        <el-form-item label="添加时间" prop="createTime">
          <el-date-picker
              v-model="dialogContent.createTime"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ss"
              placeholder="选择日期时间"
              style="width: 100%;"
              size="large"
          ></el-date-picker>
        </el-form-item>

        <!-- 按钮部分 -->
        <div class="dialog-footer" style="text-align: right; margin-top: 20px;">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="commit">确定</el-button>
        </div>
      </el-form>
    </el-dialog>
    <!--    筛选-->
    <el-dialog
        v-model="queryFormVisible"
        title="筛选"
        width="30vw"
        style="top:20vh"
    >
      <el-form :model="dialogContent" ref="formValue" :rules="rules" label-width="120px">
        <!-- 正射影像名称 -->
        <el-form-item label="正射影像名称">
          <el-input
              v-model="dialogContent.modelLabel"
              style="width: 100%;"
              placeholder="请输入正射影像名称"
              clearable
          />
        </el-form-item>
        <el-form-item label="正射影像图层">
          <el-input
              v-model="dialogContent.modelName"
              style="width: 100%;"
              placeholder="请输入正射影像名称"
              clearable
          />
        </el-form-item>
        <!-- 添加时间 -->
        <el-form-item label="添加时间" prop="createTime">
          <el-date-picker
              v-model="dialogContent.createTime"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ss"
              placeholder="请选择添加时间"
              style="width: 100%;"
              size="large"
              clearable
          />
        </el-form-item>

        <!-- 正射影像路径 -->
        <el-form-item label="正射影像路径" prop="modelPath">
          <el-input
              v-model="dialogContent.modelPath"
              style="width: 100%;"
              placeholder="请输入正射影像路径"
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
import {
  insert,
  update,
  removeById,
  queryOrthophotoData,
  OrthophotoFilterContent,
  list
} from '@/api/system/orthophotoImage.js';

import { ElMessage, ElMessageBox } from "element-plus";
import useUserStore from "@/store/modules/user.js";


export default {
  name: "index",
  data() {
    return {
      userStore:'',
      TableData: [],
      filterContent: [],  // 筛选内容
      tableData: [],  //存储 新增 or 编辑 后端返回数据
      queryParams: '',  // 搜索框关键字
      queryFormVisible: false,
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      //--------------------------------------
      dialogShow: false,
      dialogTitle: null,
      dialogContent: {
        name: '',
        label:'',
        lon:'',
        lat:'',
        createTime: '',
        path: '',
        uuid: ''
      },
      rules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchData();
  },
  setup() {
    const userStore = useUserStore()
    const isAdmin = computed(() => userStore.name === 'admin')

    return {
      userStore,
      isAdmin
    }
  },
  methods: {
    fetchData() {
      list().then(res => {
        console.log("获取的数据:", res); // 打印获取的数据
        this.tableData = res.data.map((item) => {
          let formattedCreateTime = '';
          // 确保 createTime 存在且有效
          if (item.hasOwnProperty('createTime') && item.createTime) {
            const createTime = new Date(item.createTime);

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
          // 仅返回修改后的 createTime
          item.createTime = formattedCreateTime;
          return item;
        });

        // 打印处理后的 tableData
        console.log("处理后的 tableData:", this.tableData);
        this.total = this.tableData.length;
        this.updateTableData();
      }).catch(error => {
        console.error("获取数据失败:", error);
      });
    },
    // 筛选
    onSubmit() {
      this.filterContent = {
        name: this.dialogContent.modelName || null,
        label:this.dialogContent.modelLabel||null,
        createTime: this.formatISODateTimeToBackend(this.dialogContent.createTime),
        path: this.dialogContent.modelPath || null,
        uuid: this.dialogContent.uuid || null,
      };
      console.log("filterContent", this.filterContent);
      // 发送请求
      OrthophotoFilterContent(this.filterContent).then(res => {
        console.log("OrthophotoFilterContent", res); // 打印返回的响应
        // 假设 res.data 包含查询结果
        const data = res.data || [];
        this.total = res.total || data.length; // 确保获取总数，使用返回的分页信息（假设是 res.total）
        // 格式化数据并更新 tableData
        this.tableData = res.data.map((item) => {
          let formattedCreateTime = '';

          // 确保 createTime 存在且有效
          if (item.hasOwnProperty('createTime') && item.createTime) {
            const createTime = new Date(item.createTime);

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

          // 仅返回修改后的 createTime
          item.createTime = formattedCreateTime;

          return item;
        });
        // 如果需要分页，调用分页更新方法（如果分页逻辑依赖当前页面和每页数据）
        this.updateTableData();
        // 隐藏筛选表单
        this.queryFormVisible = false;
        // 清空表单字段
        this.clearFormValue();
      }).catch(error => {
        console.error("查询失败:", error);
      });
    },
    // 搜索框
    handleQuery() {
      const searchKey = this.queryParams.trim();  // 获取搜索关键字
      let result = searchKey.replace(/年|月/g, "-").replace(/日/g, "");

      // 调用同一个方法进行查询
      queryOrthophotoData(result)
          .then(res => {
            console.log("获取的数据:", res); // 打印获取的数据

            // 假设 res.data.records 是查询的结果数据，res.data.total 是总记录数
            this.tableData = res.data.map((item) => {
              let formattedCreateTime = '';

              // 确保 createTime 存在且有效
              if (item.hasOwnProperty('createTime') && item.createTime) {
                const createTime = new Date(item.createTime);

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

              // 仅返回修改后的 createTime
              item.createTime = formattedCreateTime;

              return item;
            });

            // 更新分页的总数
            this.total = this.tableData.length;
            this.updateTableData(); // 初始化第一页数据
          })
          .catch(error => {
            console.error("查询时出现错误:", error.message || error); // 打印详细错误信息到控制台

            // 根据错误内容显示不同的提示信息
            const errorMessage = error.response?.data?.message || '查询失败，请稍后重试';
            ElMessage.error(errorMessage);
          });


    },
    // 重置功能
    resetQuery() {
      this.queryParams = '';  // 清空搜索输入框
      this.fetchData()

    },

    getEmptyDialogContent() {
      return {
        name: '',
        createTime: '',
        label:'',
        lon:'',
        lat:'',
        path: '',
        uuid: ''
      };
    },

    handleOpen(row) {
      let url = row.path
      let layers = row.name
      let lon=row.lon
      let lat=row.lat
      // 后续优化
      window.open('/orthophotographViewer?url='+url+'&layers='+layers+'&lat='+lat+'&lon='+lon, "_blank");
    },


    handleEdit(title, row = {}) {
      this.dialogTitle = title;

      if (title === "新增") {
        this.dialogContent = {
          name: '',
          label: '',
          lon:'',
          lat:'',
          createTime: '',
          path: '',
          uuid: ''
        };
      } else if (title === "修改") {
        this.dialogContent = {
          name: row.name,
          label: row.label,
          lon:row.lon,
          lat:row.lat,
          path: row.path,
          createTime: this.formatDateToBackend(row.createTime),
          uuid: row.uuid
        };
      }

      this.dialogShow = true;
    },


    handleDelete(row) {
      ElMessageBox.confirm('确定要删除该条记录吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
          .then(() => {
            removeById({ uuid: row.uuid })
                .then(() => {
                  this.fetchData();
                  ElMessage.success('删除成功');
                })
                .catch(() => {
                  ElMessage.error('删除失败，请重试');
                });
          })
          .catch(() => {
            ElMessage.info('删除操作已取消');
          });
    },
    // 新增 or 编辑 提交按钮
    commit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const modelData = {
            name: this.dialogContent.name,
            label:this.dialogContent.label,
            lon:this.dialogContent.lon,
            lat:this.dialogContent.lat,
            path: this.dialogContent.path,
            createTime: this.formatISODateTimeToBackend(this.dialogContent.createTime),
            uuid: this.dialogContent.uuid,
          };

          const action = this.dialogTitle === '新增' ? insert : update;
          action(modelData).then(() => {
            this.fetchData();
            this.dialogShow = false;
            this.clearDialogContent();
            ElMessage.success(`${this.dialogTitle}成功`);
          }).catch(() => {
            ElMessage.error(`${this.dialogTitle}失败，请重试`);
          });
        } else {
          ElMessage.error('表单验证失败，请检查输入');
          return false;
        }
      });
    },
    // 筛选弹框显示
    openQueryForm() {
      this.queryFormVisible = true;
      this.dialogContent = {
        name: '',
        createTime: '',
        label: '',
        path: '',
        uuid: ''
      };
    },
    // 新增弹框关闭
    cancel() {
      this.dialogShow = false;
      this.clearDialogContent();
    },

    // 清除formValue中的数据
    clearFormValue() {
      Object.keys(this.formValue).forEach(key => {
        this.formValue[key] = ''
      });
    },
    // 关闭dialog对话框 筛选
    Cancel() {
      this.queryFormVisible = false;
      this.clearFormValue()
      this.$refs.formValue.resetFields(); // 重置表单
      this.$refs.formValue.clearValidate(); // 清除验证状态
    },

    clearDialogContent() {
      this.dialogContent = this.getEmptyDialogContent();
    },


    /**
     * 分页
     */
    updateTableData() {
      // 根据分页逻辑获取当前页数据
      const start = (this.currentPage - 1) * this.pageSize;
      const end = this.currentPage * this.pageSize;
      this.TableData = this.tableData.slice(start, end);
    },

    handleSizeChange(val) {
      // 每页条数变化时，更新数据
      this.pageSize = val;
      this.updateTableData();
    },

    handleCurrentChange(val) {
      // 当前页变化时，更新数据
      this.currentPage = val;
      this.updateTableData();
    },


    tableHeaderColor() {
      return {
        'font-size': '16px'
      };
    },

    tableColor({ rowIndex }) {
      return {
        'padding-top': '10px',
        'padding-bottom': '10px',
        'text-align': 'center',
        'font-size': '16px',
      };
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
     *
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
.table-center .el-table__cell {
  text-align: center;
}

.pagination {
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-dialog__body) {
  text-align: end;
}

:deep(.el-dialog) {
  transform: none;
  left: 0;
  top: 15%;
  position: relative;
  margin: 0 auto;
}
</style>
