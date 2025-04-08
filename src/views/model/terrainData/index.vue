<template>
  <div class="app-container">
    <el-form-item label="地形数据管理" >
      <el-input
          v-model="queryParams"
          placeholder="请输入地形数据管理信息"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
      />
      <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
      <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      <el-button type="primary" plain icon="Plus" @click="handleEdit('新增')">新增</el-button>
      <el-button type="primary" icon="Filter" @click="openQueryForm">筛选</el-button>
    </el-form-item>

    <el-table :data="displayData" class="table-center" :stripe="true" :header-cell-style="tableHeaderColor"
              :cell-style="tableColor">
      <el-table-column label="序号" align="center" width="100">
        <template #default="{ row, column, $index }">
          {{ ($index + 1) + (currentPage - 1) * pageSize }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="地形数据名称" width="180" align="center"></el-table-column>
      <el-table-column prop="path" label="地形数据路径" width="200" align="center"></el-table-column>
      <el-table-column prop="createTime" label="添加时间" align="center" width="250"></el-table-column>
      <el-table-column prop="shootingTime" label="拍摄时间" align="center" width="250"></el-table-column>
      <el-table-column label="操作" align="center">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleOpen('浏览', scope.row)">浏览</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit('修改', scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
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
    <el-dialog :title="dialogTitle" v-model="dialogShow" width="30vw" >
      <el-form ref="form" :model="dialogContent" :rules="rules">

        <!-- 遥感影像名称 -->
        <el-form-item label="地形数据名称" prop="name">
          <el-input
              v-model="dialogContent.name"
              placeholder="请输入内容"
          ></el-input>
        </el-form-item>


        <el-form-item label="地形数据路径" prop="path">
          <el-input
              v-model="dialogContent.path"
              placeholder="请输入内容"
          ></el-input>
        </el-form-item>

        <!-- 添加时间 -->
        <el-form-item label="添加时间" prop="createTime">
          <el-date-picker
              v-model="dialogContent.createTime"
              type="datetime"
              value-format="YYYY-MM-DDTHH:mm:ss"
              placeholder="选择日期时间"
              size="large"
              style="width: 100%;"
          ></el-date-picker>
        </el-form-item>

        <!-- 拍摄时间 -->
        <el-form-item label="拍摄时间" prop="shootingTime">
          <el-date-picker
              v-model="dialogContent.shootingTime"
              type="datetime"
              placeholder="选择日期时间"
              value-format="YYYY-MM-DDTHH:mm:ss"
              size="large"
              style="width: 100%;"
          ></el-date-picker>
        </el-form-item>


        <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="commit">确定</el-button>
    </span>
      </el-form>
    </el-dialog>

    <!--    筛选-->
    <el-dialog
        v-model="queryFormVisible"
        title="筛选"
        width="30vw"
        style="top:20vh"
    >
      <el-form :inline="true" :model="dialogContent" ref="formValue" :rules="rules" :show-close="false">
        <!-- 名称 -->
        <el-form-item label="地形数据名称">
          <el-input v-model="dialogContent.modelName" style="width: 23vw;" placeholder="地形数据名称" clearable />
        </el-form-item>

        <!-- 添加时间 -->
        <el-form-item label="添加时间" prop="createTime">
          <el-date-picker
              v-model="dialogContent.createTime"
              type="datetime"
              placeholder="选择日期时间"
              size="large"
              style="width: 23vw;"
          />
        </el-form-item>

        <!-- 拍摄时间 -->
        <el-form-item label="拍摄时间" prop="shootingTime">
          <el-date-picker
              v-model="dialogContent.shootingTime"
              type="datetime"
              placeholder="选择日期时间"
              size="large"
              style="width: 23vw;"
          />
        </el-form-item>

        <!-- 路径 -->
        <el-form-item label="地形数据路径" prop="modelPath">
          <el-input
              v-model="dialogContent.modelPath"
              style="width: 23vw;"
              placeholder="请输入地形数据路径"
              clearable
          />
        </el-form-item>

      </el-form>

      <div class="dialog-footer">
        <el-button @click="Cancel">取 消</el-button>
        <el-button type="primary" @click="onSubmit">筛 选</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  terrainInsert,
  terrainDataFilter,
  terrainRemoveById,
  terrainList
} from '@/api/system/terrainData.js';
import { ElMessage, ElMessageBox } from "element-plus";
import {queryTerrainData, terrainUpdate} from "@/api/system/terrainData.js";
export default {
  name: "index",
  data() {
    return {
      filterContent: [],  // 筛选内容
      tableData: [],  //存储 新增 or 编辑 后端返回数据
      displayData: [],  // 当前页数据
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
        createTime: '',
        shootingTime:'',
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

  methods: {
    fetchData() {
      terrainList().then(res => {
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

          let formattedShootingTime = '';
          // 确保 shootingTime 存在且有效
          if (item.hasOwnProperty('shootingTime') && item.shootingTime) {
            const shootingTime = new Date(item.shootingTime);

            // 确认解析后的 createTime 是否有效
            if (!isNaN(shootingTime)) {
              // 格式化为 yyyy年MM月dd日 HH:mm:ss
              const year = shootingTime.getFullYear();
              const month = (shootingTime.getMonth() + 1).toString().padStart(2, '0'); // 月份补零
              const day = shootingTime.getDate().toString().padStart(2, '0');
              const hours = shootingTime.getHours().toString().padStart(2, '0');
              const minutes = shootingTime.getMinutes().toString().padStart(2, '0');
              const seconds = shootingTime.getSeconds().toString().padStart(2, '0');

              // 格式化为需要的格式
              formattedShootingTime = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
            } else {
              console.log(`无效的日期: ${item.shootingTime}`);
            }
          } else {
            console.log('没有 createTime 或其值为空:', item); // 如果没有 createTime 或为空，输出提示
          }

          // 仅返回修改后的 createTime
          item.createTime = formattedCreateTime;

          item.shootingTime = formattedShootingTime;

          return item;
        });

        // 确保分页总数（total）正确
        this.total = res.total || this.tableData.length;  // 如果没有返回 total，使用 tableData.length
        this.currentPage = 1;  // 默认重置为第一页
        this.updateTableData();
        // 打印处理后的 tableData
        console.log("处理后的 tableData:", this.tableData);
      }).catch(error => {
        console.error("获取数据失败:", error);
      });
    },

    // 筛选
    onSubmit() {
      this.filterContent = {
        name: this.dialogContent.modelName || null,
        createTime: this.dialogContent.createTime,
        shootingTime: this.dialogContent.shootingTime,
        path: this.dialogContent.modelPath || null,
        uuid: this.dialogContent.uuid || null,
      };
      console.log("filterContent", this.filterContent);
      // 发送请求
      terrainDataFilter(this.filterContent).then(res => {
        console.log("RemoteSensingFilterContent", res); // 打印返回的响应
        // 假设 res.data 包含查询结果
        const data = res.data || [];
        this.total = res.total || data.length; // 确保获取总数，使用返回的分页信息（假设是 res.total）
        // 格式化数据并更新 tableData
        this.tableData = res.data.map((item) => {
          let formattedCreateTime = '';
          let formattedShootingTime = '';

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

          // 确保 createTime 存在且有效
          if (item.hasOwnProperty('shootingTime') && item.shootingTime) {
            const shootingTime = new Date(item.shootingTime);

            // 确认解析后的 createTime 是否有效
            if (!isNaN(shootingTime)) {
              // 格式化为 yyyy年MM月dd日 HH:mm:ss
              const year = shootingTime.getFullYear();
              const month = (shootingTime.getMonth() + 1).toString().padStart(2, '0'); // 月份补零
              const day = shootingTime.getDate().toString().padStart(2, '0');
              const hours = shootingTime.getHours().toString().padStart(2, '0');
              const minutes = shootingTime.getMinutes().toString().padStart(2, '0');
              const seconds = shootingTime.getSeconds().toString().padStart(2, '0');

              // 格式化为需要的格式
              formattedShootingTime = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
            } else {
              console.log(`无效的日期: ${item.shootingTime}`);
            }
          } else {
            console.log('没有 shootingTime 或其值为空:', item); // 如果没有 createTime 或为空，输出提示
          }
          // 仅返回修改后的 createTime
          item.shootingTime = formattedShootingTime;

          return item;
        });

        // 如果需要分页，调用分页更新方法（如果分页逻辑依赖当前页面和每页数据）
        this.updateTableData();
        // 隐藏筛选表单
        this.queryFormVisible = false;
        // 清空表单字段
        this.clearFormValue(this.formData || {});
      }).catch(error => {
        console.error("查询失败:", error);
      });
    },
    // 搜索框
    handleQuery() {
      const searchKey = this.queryParams.trim();  // 获取搜索关键字
      let result = searchKey.replace(/年|月/g, "-").replace(/日/g, "");

      // 调用同一个方法进行查询
      queryTerrainData(result || '')
          .then(res => {

            // 假设 res.data.records 是查询的结果数据，res.data.total 是总记录数
            this.tableData = res.data.map((item, index) => {
              // 格式化 createTime
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

              let formattedShootingTime = '';
              // 确保 createTime 存在且有效
              if (item.hasOwnProperty('shootingTime') && item.shootingTime) {
                const shootingTime = new Date(item.shootingTime);
                console.log("")
                // 确认解析后的 createTime 是否有效
                if (!isNaN(shootingTime)) {
                  // 格式化为 yyyy年MM月dd日 HH:mm:ss
                  const year = shootingTime.getFullYear();
                  const month = (shootingTime.getMonth() + 1).toString().padStart(2, '0'); // 月份补零
                  const day = shootingTime.getDate().toString().padStart(2, '0');
                  const hours = shootingTime.getHours().toString().padStart(2, '0');
                  const minutes = shootingTime.getMinutes().toString().padStart(2, '0');
                  const seconds = shootingTime.getSeconds().toString().padStart(2, '0');

                  // 格式化为需要的格式
                  formattedShootingTime = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;

                } else {
                  console.log(`无效的日期: ${item.shootingTime}`);
                }
              } else {
                console.log('没有 createTime 或其值为空:', item); // 如果没有 createTime 或为空，输出提示
              }

              item.createTime = formattedCreateTime;
              item.shootingTime = formattedShootingTime;

              return item;
            });

            // 更新分页的总数
            this.total = this.tableData.length;
            this.updateTableData(); // 初始化第一页数据
          })
          .catch(error => {
            console.error("查询时出现错误:", error);
            // 根据错误内容显示不同的提示信息
            const errorMessage = error.response?.data?.message || '查询失败，请稍后重试';
            ElMessage.error(errorMessage);
          });
    },

    // 重置功能
    resetQuery() {
      this.queryParams = '';  // 清空搜索输入框
      this.fetchData();

    },

    getEmptyDialogContent() {
      return {
        name: '',
        createTime: '',
        shootingTime:'',
        path: '',
        uuid: '',
      };
    },

    handleOpen(row) {
      console.log(row);
      window.open('/orthophotographViewer', "_blank");
    },

    handleEdit(title, row = {}) {
      this.dialogTitle = title;
      if (title === "新增") {
        this.dialogContent = {
          name: '',
          createTime: new Date().toISOString(),
          shootingTime: new Date().toISOString(),
          path: '',
          uuid: ''
        };
      } else if (title === "修改") {
        this.dialogContent = {
          name: row.name,
          path: row.path,
          createTime: row.createTime,
          shootingTime: row.createTime,
          uuid: row.uuid
        };
        console.log(row.createTime)

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
            terrainRemoveById({ uuid: row.uuid })
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

    // 格式化日期时间方法
    formatDate(dateStr) {
      // 如果输入为空，则直接返回 null
      if (!dateStr) {
        return null;
      }
      // 使用正则表达式将 `yyyy年MM月dd日 HH:mm:ss` 转化为 `yyyy-MM-dd'T'HH:mm:ss`
      const regex = /^(\d{4})年(\d{2})月(\d{2})日 (\d{2}):(\d{2}):(\d{2})$/;
      const match = dateStr.match(regex);
      if (match) {
        // 提取各部分并拼接成符合后端要求的 `yyyy-MM-dd'T'HH:mm:ss` 格式
        return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`;
      }
      return dateStr; // 如果格式不匹配，返回原始日期字符串
    },

    // 新增 or 编辑 提交按钮
    commit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          // 复制 dialogContent 对象
          const modelData = {
            name: this.dialogContent.name,
            path: this.dialogContent.path,
            createTime: this.formatDate(this.dialogContent.createTime),
            shootingTime: this.formatDate(this.dialogContent.shootingTime),
            uuid: this.dialogContent.uuid,
          };
          const action = this.dialogTitle === '新增' ? terrainInsert : terrainUpdate;
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
        path: '',
        uuid: '',
        shootingTime: ''
      };
    },
    // 新增弹框关闭
    cancel() {
      this.dialogShow = false;
      this.clearDialogContent();
    },

    // 清除formValue中的数据
    clearFormValue(formData) {
      // 判断 formData 是否是一个对象，避免 null 或 undefined
      if (formData && typeof formData === 'object') {
        Object.keys(formData).forEach(key => {
          formData[key] = '';  // 清空字段的值
        });
      } else {
        console.error('传入的 formData 无效:', formData);
      }
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
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.displayData = this.tableData.slice(start, end);
    },

    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.updateTableData();
    },

    handleCurrentChange(newPage) {
      this.currentPage = newPage;
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
