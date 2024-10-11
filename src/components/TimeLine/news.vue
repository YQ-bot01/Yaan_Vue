<template>
  <div>
    <div id="news" v-show="showRightButton">
      <h2 class="sub-title-new">
        最新新闻:
        <span class="title-time">{{ currentEvent }}</span>
        <span class="icon" @click="hideNews">
            <img src="../../assets/icons/TimeLine/收起展开箭头右.png" style="height: 100%; width: 100%">
        </span>
      </h2>
      <div class="sub-main">
        <ul class="sub-ul">
          <li :class="[i === 0 || i === 1 ? 'high' : '']"
              v-for="(item, i) in showNews"
              :key="item.id"
              style="cursor: pointer"
              @click="showDetailedNews(item)">
            <div v-if="item.image" class="news-img">
              <img :src="item.image" alt="新闻图片" @error="handleErrorImage" />
            </div>
            <div v-else class="news-img">
              <img :src="error" alt="新闻图片"/>
            </div>
            <div class="sub-content">
              <p class="sub-time">{{ item.publish_time }}</p>
              <p class="sub-text">{{ item.title }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div class="showNewsButton" v-show="showLeftButton" @click="showNewsConponent">
    <img src="../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 100%;width: 100%">
  </div>

</template>

<script>
// import newsData from "@/assets/json/TimeLine/news.json"
import newsData from "@/assets/json/TimeLine/sorted_data.json"
import error from '@/assets/json/TimeLine/errorimg.jpg'


export default {
  name: "news",
  data() {
    return {
      error,
      newsData: [],
      showNews: [],
      currentEvent: '',
      showRightButton: true,
      showLeftButton: false,
      ifShowData:false,

      // ----新闻详情Dialog----
      DialogFormVisible: false,
      showingNews: {
        id: '',
        time: '',
        content: '',
        img: '',
      },
    }
  },
  props: [
    'currentTime',
    'eqid'
  ],
  mounted() {
      if(this.eqid === 'be3a5ea4-8dfd-a0a2-2510-21845f17960b'){
          this.ifShowData = true
          this.fetchData()
      }
  },
  watch: {
    currentTime(newVal) {
      this.updateNews(newVal)
    },
  },
  methods: {
    handleErrorImage(event) {
      event.target.src = error // 当图片加载失败时，将其替换为备用图片
    },
    async fetchData() {
      this.newsData = newsData
      this.updateNews(this.currentTime)
    },
    hideNews() {
      this.showRightButton = false
      this.showLeftButton = true
    },
    showNewsConponent() {
      this.showRightButton = true
      this.showLeftButton = false
    },
    async updateNews(currentTime) {
      // console.log("this.newsData",this.newsData)
      const activities = await this.newsData.filter((activity) => {
        return (
            new Date(activity.publish_time) <= currentTime
        );
      });
      if (activities.length > 0) {
        this.showNews = activities.reverse()
        this.currentEvent=activities[0].publish_time
      }else{
          this.showNews = []
          this.currentEvent=''
      }
    },
    showDetailedNews(row) {
      this.showingNews = row
      let bool = true
      this.$emit('detailedNews', row);
      this.$emit('ifShowDialog', bool);
    }
  }
}
</script>

<style scoped>
#news {
  width: 27%;
  height: 45%;
  position: absolute;
  padding: 0 5px 5px;
  border-radius: 5px;
  top: 10%;
  right: 1%;
  z-index: 20; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
  color: white;
}

.sub-title-new {
  /*
  text-shadow: 0.2rem 0.3rem 0 rgba(0, 0, 0, 0.39);
  padding: 1rem 0 1rem !important;*/
  font-family: myFirstFont;
  line-height: 1.8rem;
  font-size: 1.1rem;
  color: #ffffff;
  letter-spacing: 0;
  text-align: justify;
  border-bottom: 0.1rem solid #ffffff;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-time {
  font-size: 16px;
  font-weight: normal;
  color: #ffeb00;
  line-height: 1.8rem;
}

.icon {
  margin-right: 10px;
}

.icon img {
  max-width: 12px; /* 设置图片最大宽度 */
  max-height: 12px; /* 设置图片最大高度 */
  width: auto; /* 自动调整宽度以保持比例 */
  height: auto; /* 自动调整高度以保持比例 */

}

.sub-main {
  margin-top: 0px;
  max-height: 90%;
  overflow-y: auto;
  padding: 0px;
}

.sub-ul {
  padding: 0;
  margin: 0;
  font-size: .9rem;
  line-height: 1rem;
  overflow-y: auto; /* 当内容超出时显示垂直滚动条 */
  list-style-type: none; /* 去除列表项默认的项目符号 */
}

.sub-ul li {
  display: flex;
  align-items: center; /* Center items vertically */
  margin-bottom: -14px; /* Optional: Add some space between items */
  /*border-bottom: 1px solid #ddd; !* Optional: Add a border for separation *!*/
  padding: 0; /* Optional: Add padding for better spacing */
}

.sub-content {
  padding: 0;
  margin: 0;
  font-size: 16px;
  flex: 1;
}

.news-img {
  padding-top: 0px;
  padding-left: 2px;
  margin-right: 5px;
  text-align: center;
}

.news-img img {
   /* 设置图片最大宽度 max-width: 30px;*/
   /* 设置图片最大高度 max-height: 30px;*/
  width: 120px; /* 自动调整宽度以保持比例 */
  height: 65px; /* 自动调整高度以保持比例 */
}

.sub-time {
  padding: 0;
  line-height: .2rem
}

.sub-text {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 显示前两行 */
  -webkit-box-orient: vertical;
  overflow: hidden; /* 隐藏超出部分 */
  text-overflow: ellipsis; /* 超出部分用省略号表示 */
  line-height: 1.1; /* 行高，调整以适应你的字体 */
  height: 2.1em; /* 高度设置为两行的高度 */
  left: 10%
}

.showNewsButton {
  position: absolute;
  padding: 4px;
  border-radius: 2px;
  top: 80px;
  right: 10px;
  z-index: 100; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
  color: white;
  width: 20px;
  height: 20px;
  display: flex;
}

.showNewsButton img {
  max-width: 20px; /* 设置图片最大宽度 */
  max-height: 20px; /* 设置图片最大高度 */
  width: auto; /* 自动调整宽度以保持比例 */
  height: auto; /* 自动调整高度以保持比例 */
  justify-content: center;
  align-content: center;
}
</style>
