<template>
  <div class="app-container">
    <el-form-item label="应急物资存储">
      <el-input
          v-model="queryParams"
          placeholder="请输入物资存储信息"
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

    <!--    <el-dialog :title="dialogTitle" v-model="dialogShow" width="35%" >-->
    <el-dialog :title="dialogTitle" v-model="dialogShow" width="35%" :show-close="false">
      <el-form ref="form" :model="dialogContent" :rules="rules">
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="县(区)：" prop="county">
              <el-input v-model="dialogContent.county" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="联系人：" prop="contactPerson">
              <el-input v-model="dialogContent.contactPerson" placeholder="请输入内容" ></el-input>
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
            <el-form-item label="联系电话：" prop="contactPhone">
              <el-input v-model="dialogContent.contactPhone" placeholder="请输入内容" ></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="纬度(度分)：" prop="latitude">
              <el-input v-model="dialogContent.latitude" placeholder="请输入内容" type="number"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="地址：" prop="address">
              <el-input v-model="dialogContent.address" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!--        ------------------------------------------------------------------------------------------->
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="储备库点数量(个)" prop="storagePointsCount">
              <el-input v-model="dialogContent.storagePointsCount" placeholder="请输入数量" min="0" type="number"/>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="合计总件套数" prop="totalItemsCount">
              <el-input v-model="dialogContent.totalItemsCount" placeholder="自动计算" :disabled="true" type="number" />
            </el-form-item>
          </el-col>
        </el-row>



        <el-row :gutter="10">
          <el-col :span="8" v-for="item in itemFields" :key="item.name">
            <el-form-item :label="item.label" :prop="item.name">
              <el-input v-model="dialogContent[item.name]" placeholder="请输入数量" min="0" type="number" @input="updateTotalItemsCount"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="24">
            <el-form-item label="数据来源:" prop="other">
              <el-input type="textarea" v-model="dialogContent.other" placeholder="请输入备注"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!--        -------------------------------------------------------          -->


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
  addDisasterReserves, updateDisasterReserves, reservesList,
  suppliesReservesList, searchDisasterReserves, searchMaterialData, deleteEmergencyShelters, deleteDisasterReserves
} from "../../api/system/emergency.js";
import {addEq, updataEq} from "@/api/system/eqlist.js";

export default {
  name: "disasterReserves",
  data() {
    return {


      reservesData: [],
      tableData: [],
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 40],
      currentPage: 1,
      // ---表头---
      headersArr: [
        {prop: 'county', label: "县(区)", width: 160},
        {prop: 'storagePointsCount', label: "储备库点数量(个)", width: 180},
        {prop: 'address', label: "地址", width: 360},
        {prop: 'contactPerson', label: "联系人", width: 100},
        {prop: 'contactPhone', label: "联系电话", width: 180},
        {prop: 'totalItemsCount', label: "合计总件套数", width: 120},
        {prop: 'tents', label: "救灾帐篷(顶)", width: 120},
        {prop: 'quilts', label: "棉被(床)", width: 120},
        {prop: 'otherBlankets', label: "其他被子(床)", width: 120},
        {prop: 'cottonClothing', label: "棉衣裤(套)", width: 120},
        {prop: 'cottonCoats', label: "棉大衣(件)", width: 120},
        {prop: 'otherClothing', label: "其他衣物(套、件)", width: 150},
        {prop: 'blankets', label: "毛毯(床)", width: 120},
        {prop: 'foldingBeds', label: "折叠床(张)", width: 120},
        {prop: 'bunkBeds', label: "高低床(套)", width: 120},
        {prop: 'tarpaulins', label: "彩条布(包)", width: 120},
        {prop: 'moistureProofPads', label: "防潮垫(张)", width: 120},
        {prop: 'generators', label: "发电机(台)", width: 120},
        {prop: 'lightingFixtures', label: "照明灯具(个)", width: 120},
        {prop: 'lightingSets', label: "照明灯组(套)", width: 120},
        {prop: 'flashlights', label: "手电筒(支)", width: 120},
        {prop: 'raincoats', label: "雨衣(件)", width: 120},
        {prop: 'rainBoots', label: "雨靴(双)", width: 120},
        {prop: 'otherEquipment', label: "其他装备数量(个)", width: 150},
        {prop: 'longitude', label: "经度", width: 150},
        {prop: 'latitude', label: "纬度", width: 150},
        { prop: 'other', label: '数据来源', width: 150 }
        // {prop: 'insertTime', label: "插入时间", width: 180}
      ],
      // 查询功能
      queryParams: '',   // 搜索关键字
      //计算总套数
      itemFields: [
        { name: "tents", label: "救灾帐篷(顶)" },
        { name: "quilts", label: "棉被(床)" },
        { name: "otherBlankets", label: "其他被子(床)" },
        { name: "cottonClothing", label: "棉衣裤(套)" },
        { name: "cottonCoats", label: "棉大衣(件)" },
        { name: "otherClothing", label: "其他衣物(套、件)" },
        { name: "blankets", label: "毛毯(床)" },
        { name: "foldingBeds", label: "折叠床(张)" },
        { name: "bunkBeds", label: "高低床(套)" },
        { name: "tarpaulins", label: "彩条布(包)" },
        { name: "moistureProofPads", label: "防潮垫(张)" },
        { name: "generators", label: "发电机(台)" },
        { name: "lightingFixtures", label: "照明灯具(个)" },
        { name: "lightingSets", label: "照明灯组(套)" },
        { name: "flashlights", label: "手电筒(支)" },
        { name: "raincoats", label: "雨衣(件)" },
        { name: "rainBoots", label: "雨靴(双)" },
        { name: "otherEquipment", label: "其他装备数量(个)" },
      ],
      // ---新增/修改---
      dialogShow: false,
      dialogTitle: null,
      //--表单
      dialogContent: {
        insertTime: Date.now(),  //插入时间
        longitude: null,  //经度
        latitude: null,  //纬度
        county: null,  //县(区)
        storagePointsCount: null,  //   储备库点数量  使用 null 而不是 ''
        totalItemsCount: null,  //合计总件套数
        tents: null,  //救灾帐篷
        quilts: null,   //棉被
        otherBlankets: null,  //其他被子
        cottonClothing: null,  //棉衣裤
        cottonCoats: null,  //棉大衣
        otherClothing: null,  //其他衣物
        blankets: null,  //毛毯
        foldingBeds: null,  //折叠床
        bunkBeds: null,  //高低床
        tarpaulins: null,  //彩条布
        moistureProofPads: null,  //防潮垫
        generators: null,  //发电机
        lightingFixtures: null,  //照明灯具
        lightingSets: null,  //照明灯组
        flashlights: null,  //手电筒
        raincoats: null,  //雨衣
        rainBoots: null,   //雨靴
        otherEquipment: null,  //其他装备数量
        address: null,  //地址
        geom: null,  // 如果不传 geo 信息，可以传 null
        contactPerson: null,  //联系人
        contactPhone: null,  //联系电话
        // reliefFamiliesBox: null,  //赈济家庭箱
      },
      rules: {
        county: [{ required: true, message: '请输入名称', trigger: 'blur' }], //县(区)
        contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }], //联系人
        contactPhone: [
          {
            required: true,
            validator: (rule, value, callback) => {
              const mobileRegex = /^1[3-9]\d{9}$/; // 手机号码
              const landlineRegex = /^0\d{2,3}-\d{7,8}$/; // 座机号码，带区号
              const specialNumberRegex = /^\d{3,4}$/; // 特殊号码，如110, 120

              if (!value) {
                callback(new Error('电话号码不能为空'));
              } else if (
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


        storagePointsCount: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        totalItemsCount: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        tents: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        quilts: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        otherBlankets: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        cottonClothing: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        cottonCoats: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        otherClothing: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        blankets: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        foldingBeds: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        bunkBeds: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        tarpaulins: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        moistureProofPads: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        generators: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        lightingFixtures: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        lightingSets: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        flashlights: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        raincoats: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        rainBoots: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        otherEquipment: [
          { type: 'number', message: '请输入一个有效的整数', trigger: 'blur', transform: (value) => Number(value) },
          { validator: (rule, value, callback) => {
              if (value && (!Number.isInteger(value) || value < 0)) {
                callback(new Error('数据只能为非负整数'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ],
        longitude: [
          {required: true, message: '请输入经度(度分)', trigger: 'blur'},
          {
            validator: (rule, value, callback) => {
              if (!value) {
                return callback(new Error('经度不能为空'));
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
          {required: true, message: '请输入纬度(度分)', trigger: 'blur'},
          {
            validator: (rule, value, callback) => {
              if (!value) {
                return callback(new Error('纬度不能为空'));
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
      },

    }
  },
  mounted() {
    this.getDate()
  },
  methods: {
    getDate() {
      reservesList().then(res => {
        this.reservesData = res
        this.total = res.length
        this.tableData = this.getPageArr() // 这里不传参数，默认使用 this.reservesData
        console.log("-----------------", this.reservesData)
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
      this.$confirm('确定要删除这条地震记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDisasterReserves( row.uuid).then(() => {
          this.getDate();
          this.$message({
            type: 'success',
            message: '删除成功'
          });
        });
      }).catch(() => {
        this.$message({
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
      searchDisasterReserves(searchKey)
          .then(res => {
            console.log("search----------", res);
            // 更新 tableData 以显示搜索结果
            this.reservesData = res;  // 更新 reservesData
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

      this.$refs.form.validate((valid) => {
        if (!valid) {
          console.log('表单验证失败，阻止提交');
          return false;
        }
        console.log('表单验证通过，提交表单');

        // 清除验证状态
        this.$refs.form.clearValidate();


        // 如果某些字段为空值，手动处理（例如：删除、设置为 null）
        if (!this.dialogContent.totalMembers) {
          this.dialogContent.totalMembers = ''
        }

        // 设置 insertTime 为当前时间戳
        this.dialogContent.insertTime = Date.now();

        console.log("insertTime 类型：", typeof this.dialogContent.insertTime);
        console.log("insertTime 值：", this.dialogContent.insertTime);

        // 检查并设置 geom 字段
        const { longitude, latitude } = this.dialogContent;
        this.dialogContent.geom = (longitude && latitude && !isNaN(longitude) && !isNaN(latitude))
            ? {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            }
            : null; // 或者使用 delete this.dialogContent.geom;

        console.log("前端传递的请求数据：", this.dialogContent);



        // 打印所有字段的详细值
        console.log("完整的 dialogContent 数据：", this.dialogContent);

        // 提交请求，根据操作类型区分新增或更新
        const action = this.dialogTitle === "新增" ? addDisasterReserves : updateDisasterReserves;
        console.log(this.dialogContent,"this.dialogContent before 操作")
        action(this.dialogContent).then(() => {
          console.log(`${this.dialogTitle === "新增" ? "新增" : "修改"}操作完成：`, this.dialogContent);
          this.getDate();
          this.dialogShow = false;
          this.clearDialogContent();

          // 显示操作成功的提示
          this.$message.success(`${this.dialogTitle === "新增" ? "新增" : "修改"}成功！`);
        }).catch(error => {
          console.error(`${this.dialogTitle === "新增" ? "新增" : "修改"}时出错:`, error);
          // 显示操作失败的提示
          this.$message.error(`${this.dialogTitle === "新增" ? "新增" : "修改"}失败，请稍后再试`);
        });
      });
    },



    getPageArr(data = this.reservesData) {
      let arr = [];
      let start = (this.currentPage - 1) * this.pageSize;
      let end = this.currentPage * this.pageSize;
      if (end > this.total) {
        end = this.total;
      }
      for (; start < end; start++) {
        if (data[start]) {
          data[start].insertTime = this.formatDate(data[start].insertTime);
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
    // 关闭dialog对话框
    cancel() {
      this.dialogShow = false
      this.clearDialogContent()
    },
    // 清除DialogContent中的数据
    clearDialogContent() {
      Object.keys(this.dialogContent).forEach(key => {
        this.dialogContent[key] = ''
      });
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


    //计算合计套数
    updateTotalItemsCount() {
      let total = 0;
      // 遍历所有需要计算的字段并累加
      this.itemFields.forEach(field => {
        total += parseInt(this.dialogContent[field.name]) || 0;
      });
      this.dialogContent.totalItemsCount = total;
    },

    watch: {
      // 监听所有需要计算的字段，当这些字段发生变化时，触发更新
      "dialogContent.tents": "updateTotalItemsCount",
      "dialogContent.quilts": "updateTotalItemsCount",
      "dialogContent.otherBlankets": "updateTotalItemsCount",
      "dialogContent.cottonClothing": "updateTotalItemsCount",
      "dialogContent.cottonCoats": "updateTotalItemsCount",
      "dialogContent.otherClothing": "updateTotalItemsCount",
      "dialogContent.blankets": "updateTotalItemsCount",
      "dialogContent.foldingBeds": "updateTotalItemsCount",
      "dialogContent.bunkBeds": "updateTotalItemsCount",
      "dialogContent.tarpaulins": "updateTotalItemsCount",
      "dialogContent.moistureProofPads": "updateTotalItemsCount",
      "dialogContent.generators": "updateTotalItemsCount",
      "dialogContent.lightingFixtures": "updateTotalItemsCount",
      "dialogContent.lightingSets": "updateTotalItemsCount",
      "dialogContent.flashlights": "updateTotalItemsCount",
      "dialogContent.raincoats": "updateTotalItemsCount",
      "dialogContent.rainBoots": "updateTotalItemsCount",
      "dialogContent.otherEquipment": "updateTotalItemsCount"
    }


  }
}
</script>

<style scoped>
/*   表单   */

:deep(.el-dialog) {
  transform: none;
  left: 0;
  top: 13%;
  position: relative;
  margin: 0 auto;
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
