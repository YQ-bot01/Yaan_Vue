<template>
  <div class="app-container">
    <el-form-item label="紧急联系人" >
      <el-input
          v-model="queryParams"
          placeholder="请输入联系人信息"
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
      </el-table-column>

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
            <el-form-item label="单位名称:" prop="unitName">
              <el-input v-model="dialogContent.unitName" placeholder="请输入单位名称"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="单位领导:" prop="unitLeader">
              <el-input v-model="dialogContent.unitLeader" placeholder="请输入单位领导"></el-input>
            </el-form-item>
          </el-col>
        </el-row>



        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="姓名:" prop="name">
              <el-input v-model="dialogContent.name" placeholder="请输入姓名"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="职务:" prop="position">
              <el-input v-model="dialogContent.position" placeholder="请输入职务"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="联系电话:" prop="phone">
              <el-input v-model="dialogContent.phone" placeholder="请输入联系电话"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="数据来源:" prop="dataSource">
              <el-input v-model="dialogContent.dataSource" placeholder="请输入内容" ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="24">
            <el-form-item label="备注:" prop="notes">
              <el-input type="textarea" v-model="dialogContent.notes" placeholder="请输入备注"></el-input>
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
unitContactList, searchUnitContact, deleteUnitContact, addUnitContact, updateUnitContact
} from "../../api/system/emergency.js";

export default {
  name: "unitContact",
  data(){
    return {
      unitContactData: [],
      tableData: [],
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      currentHeaders: [],
      // ---表头---
      headersArr: [
        { prop: 'unitName', label: '单位名称', width: 200 },
        { prop: 'unitLeader', label: '单位领导', width: 100 },
        { prop: 'name', label: '姓名', width: 150 },
        { prop: 'position', label: '职务', width: 200 },
        { prop: 'phone', label: '联系电话', width: 200 },
        { prop: 'dataSource', label: '数据来源', width: 200 },
        { prop: 'notes', label: '备注', width: 150 }
      ],
      // 查询功能
      queryParams: '',   // 搜索关键字

      dialogShow: false,
      dialogTitle: null,
      //--表单--
      dialogContent: {
        unitName: '',  //单位名称
        unitLeader: '',  //单位领导
        name: '',  //姓名
        position: '',  //职务
        phone: '',  //联系电话
        dataSource: '',  //数据来源
        notes: '',  //备注
      },

      rules: {
        phone: [
          {
            validator: (rule, value, callback) => {
              const phone = /^1[3-9]\d{9}$/; // 手机号码

              // 仅在有值时进行验证
              if (value) {
                if (
                    phone.test(value)

                ) {
                  callback(); // 验证通过
                } else {
                  callback(new Error('电话号码格式不正确'));
                }
              } else {
                callback(); // 空值时验证通过，不提示错误
              }
            },
            trigger: 'blur'
          }
        ],

        dataSource: [{  message: '数据来源', trigger: 'blur' }],

      }

    }
  },
  mounted() {
    this.getDate()
  },
  methods:{
    getDate(){
      unitContactList().then(res => {
        this.unitContactData = res
        this.total = res.length
        this.tableData = this.getPageArr() // 这里不传参数
      })
    },

    handleOpen(feature, row) {
      console.log("row------", row);
      this.dialogShow = true; // 确保 dialogShow 设置为 true 以显示弹窗
      this.dialogTitle = feature;
      if (feature === '新增') {
        this.clearDialogContent(); // 清空表单内容
      } else if (feature === '修改') {
        // 根据 row 的内容填充表单
        this.dialogContent = {...row};
      }
    },
    handleDelete(row) {
      let that = this;
      this.$confirm('确定要删除这条记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUnitContact( row.uuid).then(res => {
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
      searchUnitContact(searchKey)
          .then(res => {
            console.log("search----------", res);
            // 更新 tableData 以显示搜索结果
            this.unitContactData = res;  // 更新 rescueTeamData
            this.total = res.length;  // 更新总数
            this.tableData = this.getPageArr(); // 使用更新后的数据进行分页
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

    //新增或修改
    commit() {
      console.log("提交数据前：", this.dialogContent); // 打印提交的数据
      if (this.$refs.form) {
        this.$refs.form.validate((valid) => {
          console.log("提交数据前：", this.dialogContent);  // 打印提交的数据
          if (valid) {
            console.log("表单验证通过");
            if (this.dialogTitle === "新增") {
              console.log("正在新增数据：", this.dialogContent); // 打印新增时的数据
              addUnitContact(this.dialogContent).then(() => {
                this.getDate();
                this.dialogShow = false;
                this.clearDialogContent();
                // 提示新增成功
                this.$message.success("新增成功");
              }).catch(error => {
                console.error("新增时出现错误:", error);
                this.$message.error("新增失败，请稍后再试");
              });
            } else {
              console.log("正在修改数据：", this.dialogContent); // 打印修改时的数据
              updateUnitContact(this.dialogContent).then(() => {
                this.getDate();
                this.dialogShow = false;
                this.clearDialogContent();
                // 提示修改成功
                this.$message.success("修改成功");
              }).catch(error => {
                console.error("修改时出现错误:", error);
                this.$message.error("修改失败，请稍后再试");
              });
            }

          } else {
            console.log("表单验证失败");
            return false;
          }
        });
      } else {
        console.error("form ref 未定义");
      }
    },

    // 关闭dialog对话框
    cancel() {
      this.dialogShow = false;
      this.clearDialogContent();
      this.$refs.form.resetFields(); // 重置表单
      this.$refs.form.clearValidate(); // 清除验证状态
    },

    // 清除DialogContent中的数据
    clearDialogContent() {
      Object.keys(this.dialogContent).forEach((key) => {
        this.dialogContent[key] = null;
      });
    },

    getPageArr(data = this.unitContactData) {
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
      // console.log("转换前的时间戳:", timestamp);
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


  }
}
</script>

<style scoped>
/*    表单    */
:deep(.el-dialog) {
  transform: none;
  left: 0;
  top: 6%;
  position: relative;
  margin: 0 auto;
}

:deep(.el-form-item--default .el-form-item__error) {
  font-size: 12px !important; /* 字体大小 */
  padding-top: 5px !important;
}

.el-input__inner::placeholder {
  font-size: 10px !important; /* 设置 placeholder 字体大小 */
  color: #999; /* 你可以调整 placeholder 的颜色 */
}

.el-input__inner {
  font-size: 12px; /* 设置输入框内字体大小，调整以适应设计需求 */
}

/*.el-col-12 {*/
/*  flex: 0 0 50%;*/
/*  max-width: 44%;*/
/*}*/

/*.el-col-12[data-v-315c139d] {*/
/*  margin-right: 29px;*/
/*  margin-left: 3px;*/
/*  flex: 1 9 54%;*/
/*  max-width: 44%;*/
/*}*/

</style>
