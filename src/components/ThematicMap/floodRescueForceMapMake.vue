<template>
  <div>
    <!-- 上传组件保持不变 -->
    <el-upload
        action="#"
        :on-change="uploadOnChange"
        list-type="picture-card"
        :auto-upload="false"
        :file-list="fileList"
        :limit="1"
        :class="{hidePlus: fileList.length}"
    >
      <el-icon><Plus/></el-icon>
      <template #file="{ file }">
        <img
            class="el-upload-list__item-thumbnail"
            :src="file.url">
        <span class="el-upload-list__item-actions">
          <span class="el-upload-list__item-delete" @click="deleteUnloadPic(file)">
            <el-icon><Delete/></el-icon>
          </span>
        </span>
      </template>
    </el-upload>



    <!-- ★ 新增：输入标题、转换按钮 -->
    <div style="margin:20px 0">
      <el-input v-model="titleText" placeholder="请输入标题" style="width:200px;margin-right:10px"/>
      <el-button type="primary" @click="handleConvert">转换</el-button>
    </div>

    <!-- ★ 新增：预览带标题的图片 -->
    <div v-if="previewUrl" style="margin:20px 0">
      <img :src="previewUrl" style="max-width:300px;border:1px solid #ccc"/>
      <br>
      <el-button type="success" @click="handleDownload" style="margin-top:10px">下载图片</el-button>
    </div>

    <!-- ★ 隐藏的 canvas，不显示在页面 -->
    <canvas ref="canvas" style="display:none"/>
  </div>
</template>

<script>
export default {
  name: "floodRescueForceMapMake",
  data() {
    return {
      dialogContent: { img: '' },
      fileList: [],
      titleText: '',     // ★ 标题文字
      previewUrl: null   // ★ 转换后的预览地址
    };
  },
  methods: {
    uploadOnChange(file, fileList) {
      this.dialogContent.img = URL.createObjectURL(file.raw);
      this.fileList = fileList;
    },
    deleteUnloadPic(file) {
      this.$confirm('确定删除该符号图片吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.fileList.indexOf(file);
        this.fileList.splice(index, 1);
        if (this.fileList.length === 0) {
          this.dialogContent.img = '';
        }
        this.previewUrl = null; // ★ 清空预览
        this.$message.success('图片已成功删除');
      }).catch(() => this.$message.info('取消删除'));
    },

    /* ★ 转换：把标题画到图片上 */
    handleConvert() {
      if (!this.dialogContent.img) {
        this.$message.warning('请先上传图片');
        return;
      }
      if (!this.titleText.trim()) {
        this.$message.warning('请输入标题');
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous'; // 解决跨域
      img.onload = () => {
        const canvas = this.$refs.canvas;
        const ctx = canvas.getContext('2d');

        // 保持原图比例
        canvas.width = img.width;
        canvas.height = img.height + 60; // 底部留出 60px 写标题

        // 绘制原图
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // 绘制背景条
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, img.height, canvas.width, 60);

        // 绘制文字
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.titleText, canvas.width / 2, img.height + 30);

        // 生成预览地址
        canvas.toBlob(blob => {
          this.previewUrl = URL.createObjectURL(blob);
        });
      };
      img.src = this.dialogContent.img;
    },

    /* ★ 下载 canvas 生成的图片 */
    handleDownload() {
      const canvas = this.$refs.canvas;
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = this.titleText || 'image';
      a.click();
    }
  }
};
</script>


<style>
.hidePlus .el-upload--picture-card {
  display: none;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
