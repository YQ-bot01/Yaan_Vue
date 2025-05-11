<template>
  <div class="app-container">
    <el-form-item label="应急救援队伍" >
      <el-input
          v-model="queryParams"
          placeholder="请输入救援队伍信息"
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
            <el-form-item label="级别名称:" prop="levelName">
              <el-input v-model="dialogContent.levelName" placeholder="请输入内容" required></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="地址:" prop="address">
              <el-input v-model="dialogContent.address" placeholder="请输入内容" required></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="总人数:" prop="totalMembers">
              <el-input v-model.number="dialogContent.totalMembers" placeholder="请输入人数" type="number" min="0" ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="队伍类型名称:" prop="teamTypeName">
              <el-input v-model="dialogContent.teamTypeName" placeholder="请输入内容" ></el-input>
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
            <el-form-item label="负责人电话:" prop="chargePhone">
              <el-input v-model="dialogContent.chargePhone" placeholder="请输入电话" ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="数据来源:" prop="dataSource">
              <el-input v-model="dialogContent.dataSource" placeholder="请输入数据来源"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="成立时间:" prop="establishmentDate">
              <el-date-picker
                  v-model="dialogContent.establishmentDate"
                  type="datetime"
                  placeholder="选择日期时间"
                  value-format="x"
                  size="large"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="主要职责:" prop="mainResponsibilities">
              <el-input v-model="dialogContent.mainResponsibilities" placeholder="请输入主要职责"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="专长描述:" prop="expertiseDescription">
              <el-input v-model="dialogContent.expertiseDescription" placeholder="请输入专长描述"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="应急通讯方式:" prop="emergencyCommunicationMethods">
              <el-input v-model="dialogContent.emergencyCommunicationMethods" placeholder="请输入通讯方式"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="预计准备时间:" prop="preparationTime">
              <el-input v-model="dialogContent.preparationTime" placeholder="例如：30分钟"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="集合出发地点:" prop="assemblyLocation">
              <el-input v-model="dialogContent.assemblyLocation" placeholder="请输入地点" ></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="自备交通工具:" prop="selfTransportation">
              <el-input v-model="dialogContent.selfTransportation" placeholder="请输入交通工具"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="经度（度）:" prop="longitude">
              <el-input v-model.number="dialogContent.longitude" placeholder="请输入经度" type="number"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="纬度（度）:" prop="latitude">
              <el-input v-model.number="dialogContent.latitude" placeholder="请输入纬度" type="number"></el-input>
            </el-form-item>
          </el-col>
        </el-row>



        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="密级名称:" prop="confidentialityName">
              <el-input v-model="dialogContent.confidentialityName" placeholder="请输入密级"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="修改人名称:" prop="modifierName">
              <el-input v-model="dialogContent.modifierName" placeholder="请输入修改人名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="资质等级:" prop="qualificationLevel">
              <el-input v-model="dialogContent.qualificationLevel" placeholder="请输入资质等级"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="所属机构:" prop="affiliatedAgency">
              <el-input v-model="dialogContent.affiliatedAgency" placeholder="请输入内容" ></el-input>
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
  rescueTeamList,
  searchEmergencyTeam,
  addEmergencyTeam,
  updateEmergencyTeam,
  deleteEmergencyTeam
} from "../../api/system/emergency.js";
import {addEq, updataEq} from "@/api/system/eqlist.js";

export default {
  name: "emergencyTeams",
  data(){
    return {
      rescueTeamData: [],
      tableData: [],
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      currentHeaders: [],
      // ---表头---
      headersArr: [
        // { prop: 'uniqueId', label: '唯一标识', width: 150 },
        { prop: 'levelName', label: '级别名称', width: 230 },
        { prop: 'address', label: '地址', width: 360 },
        { prop: 'totalMembers', label: '总人数', width: 100 },
        { prop: 'personInCharge', label: '负责人', width: 120 },
        { prop: 'chargePhone', label: '负责人电话', width: 150 },
        { prop: 'teamTypeName', label: '队伍类型名称', width: 150 },
        { prop: 'establishmentDate', label: '成立日期', width: 200 },
        { prop: 'affiliatedAgency', label: '所属机构', width: 150 },
        { prop: 'mainResponsibilities', label: '主要职责', width: 150 },
        { prop: 'expertiseDescription', label: '专长描述', width: 150 },
        { prop: 'emergencyCommunicationMethods', label: '应急联系方式', width: 150 },
        { prop: 'preparationTime', label: '预计准备时间', width: 180 },
        { prop: 'assemblyLocation', label: '集合出发地点', width: 150 },
        { prop: 'selfTransportation', label: '自备交通工具', width: 150 },
        { prop: 'longitude', label: '经度', width: 120 },
        { prop: 'latitude', label: '纬度', width: 120 },
        { prop: 'confidentialityName', label: '保密级别', width: 150 },
        { prop: 'modifierName', label: '修改人', width: 150 },
        { prop: 'qualificationLevel', label: '资质级别', width: 150 },
        { prop: 'dataSource', label: '数据来源', width: 200 },
        { prop: 'notes', label: '备注', width: 150 }
      ],
      // 查询功能
      queryParams: '',   // 搜索关键字

      dialogShow: false,
      dialogTitle: null,
      //--表单--
      dialogContent: {
        affiliatedAgency: '',  //所属机构
        levelName: '',  //级别名称
        teamTypeName: '',  //队伍类型名称
        address: '',  //地址
        totalMembers: '',   //总人数
        establishmentDate: ' ',  //成立时间
        mainResponsibilities: '',  //主要职责
        expertiseDescription: '',  //专长描述
        emergencyCommunicationMethods: '',  //应急通讯方式
        preparationTime: '',  //预计准备时间
        assemblyLocation: '',  //集合出发地点
        selfTransportation: '',  //自备交通工具
        longitude: null,  //经度
        latitude: null,  //纬度
        personInCharge: '',  //负责人
        chargePhone: '',  //负责人电话
        confidentialityName: '',  //密级名称
        modifierName: '',  //修改人名称
        qualificationLevel: '',  //资质等级
        dataSource: '',  //数据来源
        notes: '',  //备注
      },

      rules: {
        levelName: [{ required: true, message: '请输入级别名称', trigger: 'blur' }],
        address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
        personInCharge: [{ message: '请输入负责人', trigger: 'blur' }],
        chargePhone: [
          {
            validator: (rule, value, callback) => {
              const mobileRegex = /^1[3-9]\d{9}$/; // 手机号码
              const landlineRegex = /^0\d{2,3}-\d{7,8}$/; // 座机号码，带区号
              const specialNumberRegex = /^\d{3,4}$/; // 特殊号码，如110, 120

              // 仅在有值时进行验证
              if (value) {
                if (
                    mobileRegex.test(value) ||
                    landlineRegex.test(value) ||
                    specialNumberRegex.test(value)
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

        totalMembers: [
          {
            type: 'number', message: '请输入总人数', trigger: 'blur', transform: (value) => Number(value)
          },
          {
            validator: (rule, value, callback) => {
              // 在未输入值时，验证通过，不提示错误
              if (value === '' || value === undefined || value === null) {
                return callback();
              }

              // 检查是否为有效的正整数
              if (!Number.isInteger(value) || value < 0) {
                callback(new Error('人数必须为正整数'));
              } else {
                callback();  // 验证通过
              }
            },
            trigger: 'blur'
          }
        ],
        dataSource: [{  message: '数据来源', trigger: 'blur' }],

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
          {
            type: 'number', message: '请输入纬度(度分)', trigger: 'blur', transform: (value) => Number(value)
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
      rescueTeamList().then(res => {
        this.rescueTeamData = res
        this.total = res.length
        this.tableData = this.getPageArr() // 这里不传参数，默认使用 this.rescueTeamData
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
      // console.log('准备删除的 UUID:', row.uuid);
      // console.log('UUID 的类型:', typeof row.uuid);
      this.$confirm('确定要删除这条地震记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteEmergencyTeam( row.uuid).then(res => {
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
      searchEmergencyTeam(searchKey)
          .then(res => {
            console.log("search----------", res);
            // 更新 tableData 以显示搜索结果
            this.rescueTeamData = res;  // 更新 rescueTeamData
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


            // 如果成立时间未选择，则将其保留为 null
            if (!this.dialogContent.establishmentDate) {
              this.dialogContent.establishmentDate = ' ';
            } else {
              this.dialogContent.establishmentDate = this.timestampToTime( this.dialogContent.establishmentDate);
              // 如果有选择时间，则将其转换为时间戳（如果需要）
              // this.dialogContent.establishmentDate = new Date(this.dialogContent.establishmentDate).toISOString();
            }
            // this.dialogContent.establishmentDate = this.timestampToTime( this.dialogContent.establishmentDate);

            if (this.dialogTitle === "新增") {
              console.log("正在新增数据：", this.dialogContent); // 打印新增时的数据
              addEmergencyTeam(this.dialogContent).then(() => {
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
              updateEmergencyTeam(this.dialogContent).then(() => {
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

    getPageArr(data = this.rescueTeamData) {
      let arr = [];
      let start = (this.currentPage - 1) * this.pageSize;
      let end = this.currentPage * this.pageSize;
      if (end > this.total) {
        end = this.total;
      }
      for (; start < end; start++) {
        if (data[start]) {
          // // 把“成立日期”字段转化为如：2008-01-01 08:00:00格式  👇
          // data[start].establishmentDate = data[start].establishmentDate ? this.formatDate(data[start].establishmentDate) : null;
          // data[start].estimatedPreparationTime = data[start].estimatedPreparationTime ? this.formatDate(data[start].estimatedPreparationTime) : null;
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
