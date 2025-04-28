<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="标绘名称" prop="menuName">
        <el-input
            v-model="queryParams.menuName"
            placeholder="请输入标绘名称"
            clearable
            style="width: 200px"
            @keydown.enter.prevent="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button type="primary" plain icon="Plus" size="mini" @click="handleOpen('新增')">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" :stripe="true" :header-cell-style="tableHeaderColor" :cell-style="tableColor">
      <el-table-column label="序号" width="60" align="center">
        <template #default="{ row, column, $index }">
          {{ ($index + 1) + (currentPage - 1) * pageSize }}
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="240" align="center"></el-table-column>
      <el-table-column prop="img" label="符号" width="60" align="center">
        <template #default="scope">
          <div v-if="scope.row.img && scope.row.img !== ''">
<!--            <img width="30px" height="30px" :src="'http://localhost:8080'+'/uploads/PlotsPic/' +scope.row.img+ '.png?t=' + new Date().getTime()" alt="暂无符号">-->
            <img width="30px" height="30px" :src="'http://59.213.183.7/prod-api/'+'/uploads/PlotsPic/' +scope.row.img+ '.png?t=' + new Date().getTime()" alt="暂无符号">
          </div>
          <div v-else>
            <span> </span>
          </div>
        </template>
      </el-table-column>

      <!--      <el-table-column prop="img" label="符号" width="60" align="center">-->
      <!--        <template #default="scope">-->
      <!--          <img width="30px" height="30px" :src="scope.row.img" alt="图片不正确">-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column prop="name" label="名称" width="220" align="center"></el-table-column>
      <!--      <el-table-column prop="plottype" label="标绘类型" width="120" align="center"></el-table-column>-->
      <el-table-column prop="describe" label="说明" align="center">
        <template #default="scope">
          <el-popover placement="top" :width="300" trigger="hover">
            <div>{{ scope.row.describe }}</div>
            <template #reference>
              <div v-if="scope.row.describe != null">
                <span class="myNote">
                  {{ scope.row.describe }}
                </span>
              </div>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template #default="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleOpen('修改',scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
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

    <el-dialog :title="dialogTitle" v-model="dialogShow" width="40%" :show-close="false" :before-close="handleClose">
      <el-row>
        <el-col :span="12">
          <el-form-item label="类型：">
            <el-select v-model="dialogContent.type" placeholder="请选择">
              <el-option-group
                  v-for="group in typeArr"
                  :key="group.label"
                  :label="group.label">
                <el-option
                    v-for="item in group.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
              </el-option-group>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label=" 标绘类型：">
            <el-select v-model="dialogContent.plottype" placeholder="请选择">
              <el-option
                  v-for="item in plotTypeArr"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="名称：">
            <el-input v-model="dialogContent.name" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="说明：">
            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" v-model="dialogContent.describe"
                      placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="符号：">
            <el-upload
                action="#"
                :on-change='uploadOnChange'
                list-type="picture-card"
                :auto-upload="false"
                :file-list="fileList"
                :limit="1">
              <el-icon>
                <Plus/>
              </el-icon>
              <template #file="{ file }">
                <!--              <div slot="file" slot-scope="{file}">-->
                <img
                    class="el-upload-list__item-thumbnail"
                    :src="
      file.url
      "
                >
                <span class="el-upload-list__item-actions">
                  <span class="el-upload-list__item-delete" @click="deleteUnloadPic">
                    <el-icon><Delete/></el-icon>
                  </span>
                </span>
                <!--              </div>-->
              </template>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="commit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {addPlotIcon, getPlotIcon, deletePlotIcon, updataPlotIcon, searchploticon} from "@/api/system/plot"

export default {
  name: "index",
  data() {
    return {
      getPicData: [],
      tableData: [],
      total: 0,
      pageSize: 10,
      pageSizes: [10, 20, 30, 40],
      currentPage: 1,
      //-----------弹出对话框-------------
      dialogShow: false,
      dialogTitle: null,
      dialogContent: {
        uuid: null,
        img: '',
        name: null,
        describe: null,
        type: null,
        plottype: null,
      },
      plotTypeArr: [
        {
          value: '点图层',
          label: '点图层'
        },
        {
          value: '线图层',
          label: '线图层'
        },
        {
          value: '面图层',
          label: '面图层'
        },
      ],
      typeArr: [
        {
          label: '现场救援类',
          options: [
            {
              value: 'I类（救援力量类）',
              label: 'I类（救援力量类）'
            },
            {
              value: 'II类（救援行动类）',
              label: 'II类（救援行动类）'
            },
          ]
        },
        {
          label: '次生灾害类',
          options: [
            {
              value: 'I类（次生地质灾害）',
              label: 'I类（次生地质灾害）'
            },
            {
              value: 'II类（建筑物破坏类）',
              label: 'II类（建筑物破坏类）'
            },
            {
              value: 'III类（交通设施破坏类）',
              label: 'III类（交通设施破坏类）'
            },
            {
              value: 'IV类（生命线工程破坏类）',
              label: 'IV类（生命线工程破坏类）'
            },
            {
              value: 'V类（水利工程破坏类）',
              label: 'V类（水利工程破坏类）'
            },
            {
              value: 'VI类（安全生产事故类）',
              label: 'VI类（安全生产事故类）'
            },
          ]
        },
        {
          label: '应急避难类',
          options: [
            {
              value: 'I类（应急避难功能区类）',
              label: 'I类（应急避难功能区类）'
            },
            // {
            //   value: 'II类（应急避难设施设备类）',
            //   label: 'II类（应急避难设施设备类）'
            // },
            // {
            //   value: 'III类（应急避难场所类）',
            //   label: 'III类（应急避难场所类）'
            // }
          ]
        }
      ],
      fileList: [

      ],
      showSearch: true,
      queryParams: {
        menuName: ""
      },
      menuList: [],
      loading: false
    }
  },
  mounted() {
    this.getPlotPicture()
  },
  methods: {
    //查全部标绘图片数据
    getPlotPicture() {
      let that = this
      getPlotIcon().then(res => {
        that.getPicData = res.data
        that.total = res.data.length
        that.tableData = that.getPageArr()
      })
    },
    // 在dialog对话框中上传img时触发
    async uploadOnChange(file, fileList) {
      let imgBase64 = await this.getBase64(file.raw)
      console.log(imgBase64)
      this.dialogContent.img = imgBase64
    },
    // 图片转成base64
    getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        let fileResult = "";
        reader.readAsDataURL(file);
        // 开始转
        reader.onload = () => {
          fileResult = reader.result;
        };
        // 转 失败
        reader.onerror = (error) => {
          reject(error);
        };
        // 转 结束
        reader.onloadend = () => {
          resolve(fileResult);
        };
      });
    },
    // 删除dialog中上传里的fileList里的img
    // 删除上传的图片
    deleteUnloadPic(file) {
      this.$confirm('确定删除该符号图片吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 删除 fileList 中的文件
        const index = this.fileList.indexOf(file);

        console.log("进入删除部分", this.dialogContent.img)
        this.fileList.splice(index, 1);  // 从文件列表中移除指定文件
        this.dialogContent.img = ''; // 清空对应的 img 字段

        this.$message({
          type: 'success',
          message: '图片已成功删除'
        });

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消删除'
        });
      });
    },


    // 删除单个标绘图片
    handleDelete(row) {
      let that = this
      this.$confirm('确定要删除这条标绘图片记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deletePlotIcon(row.uuid).then(res => {
          that.getPlotPicture()
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
      } else {
        this.dialogTitle = title
        this.dialogContent = {...row}
        // this.fileList.push({name: row.name + '.jpeg', url: this.dialogContent.img})
        if (this.dialogContent.img) {
          // let string = {name: row.name + '.jpeg', url: this.dialogContent.img};
          // {name: '中等破坏建筑物.jpeg', url: '中等破坏建筑物'}
          this.fileList.push({name: row.name + '.jpeg', url: 'http://localhost:8080'+'/uploads/PlotsPic/' +this.dialogContent.img+ '.png?t=' + new Date().getTime()});
        }
        console.log(this.dialogShow, this.dialogTitle, this.dialogContent)
      }
      this.dialogShow = !this.dialogShow
    },
    // 确认提交修改或新增的图片
    commit() {
      console.log("进入判断新增与修改：", this.dialogContent)
      let that = this
      if (this.dialogTitle === "新增") {
        this.dialogContent.id = Date.now()
        addPlotIcon(this.dialogContent).then(res => {
          that.getPlotPicture()
          that.dialogShow = false
        })
      } else {
        console.log("进入修改：", this.dialogContent)
        console.log(this.dialogContent)
        updataPlotIcon(this.dialogContent).then(res => {
          that.getPlotPicture()
          that.dialogShow = false
        })
      }
      this.clearDialogContent()
    },
    // 关闭dialog对话框
    cancel() {
      this.dialogShow = false
      this.clearDialogContent()
    },
    // 清除DialogContent中的数据
    clearDialogContent() {
      Object.keys(this.dialogContent).forEach(key => {
        this.dialogContent[key] = null
      });
      this.fileList = []
    },
    // 对数据库获取到的标绘图片数组切片
    getPageArr() {
      let arr = []
      let start = (this.currentPage - 1) * this.pageSize
      let end = this.currentPage * this.pageSize
      if (end > this.total) {
        end = this.total
      }
      for (; start < end; start++) {
        arr.push(this.getPicData[start])
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

    handleClose(done) {
      // this.$confirm('确认关闭？')
      //   .then(_ => {
      //     done();
      //   })
      //   .catch(_ => {});
    },

    // 修改table header的背景色
    tableHeaderColor() {
      return {
        'font-size': '16px',
        // 'border-color': '#293038',
        // 'background-color': '#293038 !important', // 此处是elemnetPlus的奇怪bug，header-cell-style中背景颜色不加!important不生效
        // 'color': '#fff',
        // 'padding': '0',
        // 'text-align': 'center',
        // 'border-left-color': '#323843',
        // 'border-left-width': '1px',
        // 'border-left-style': 'solid',
        // 'border-right-color': '#323843',
        // 'border-right-width': '1px',
        // 'border-right-style': 'solid',
      }
    },
    // 修改table的背景色
    tableColor({row, column, rowIndex, columnIndex}) {
      if (rowIndex % 2 === 1) {
        return {
          'font-size': '16px',
          // 'border-color': '#313a44',
          // 'background-color': '#313a44',
          // 'color': '#fff',
          // 'padding': '10',
          // 'text-align': 'center',
          // 'border-left-color': '#323843',
          // 'border-left-width': '1px',
          // 'border-left-style': 'solid',
          // 'border-right-color': '#323843',
          // 'border-right-width': '1px',
          // 'border-right-style': 'solid',
        }
      } else {
        return {
          'font-size': '16px',
          // 'border-color': '#304156',
          // 'background-color': '#304156',
          // 'color': '#fff',
          // 'padding': '10',
          // 'text-align': 'center',
          // 'border-left-color': '#323843',
          // 'border-left-width': '1px',
          // 'border-left-style': 'solid',
          // 'border-right-color': '#323843',
          // 'border-right-width': '1px',
          // 'border-right-style': 'solid',
        }
      }
    },
    getList() {
      this.loading = true;
      let that = this;

      searchploticon(this.queryParams.menuName).then(res => {
        that.menuList = res;
        that.getPicData = []
        that.getPicData = that.menuList
        // console.log("3",that.tableData)
        that.total = res.length
        that.tableData = that.getPageArr()
        that.loading = false;
        // that.getPicData = res
        // that.total = res.length
        // that.tableData = that.getPageArr()
      });
    },
    // 搜索按钮操作
    handleQuery(event) {
      this.getList(); // 调用getList来根据用户输入的菜单名称进行查询
    },
    // 重置按钮操作
    resetQuery() {
      this.queryParams.menuName = ''
      this.getList();
      // this.getPlotPicture();
      // this.queryParams.menuName = ''
      // this.getPlotPicture();
      // this.handleQuery();
    },

  },
}
</script>

<style scoped>
.myNote {
  display: -webkit-box;
  text-overflow: ellipsis;
  overflow: hidden;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.el-pagination {
  margin-top: 10px;
  justify-content: center;
}

.el-input {
  --el-input-width: 270px !important;
}

.el-select {
  /* 此版本下的select下拉框跟inline属性有bug，当设置inline时，select的宽度会丢失，因此需要手动设置 */
  --el-select-width: 270px !important;
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
