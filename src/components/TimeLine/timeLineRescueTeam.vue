
<template>
  <div>
    <div class="rescue_team" v-show="rescue_team_isExpanded">
      <p class="title">救援出队</p>

      <div class="rescue_team_expand_button" @click="rescue_team_toggleExpand">
        <img src="../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 100%;width: 100%">
      </div>

      <div class="title-underline"></div>

      <div class="sub-main">
        <ul class="sub-ul">
          <li
              :class="[i === 0 || i === 1 ? 'high' : '']"
              v-for="item in showRescueTeam"
          >
            <div class="sub-content">
<!--              <p class="rescue_team_p">-->
<!--                <span v-if="item.gotime && item.gotime!==''">{{item.goyear}}年{{item.gomonth}}月{{item.goday}}日</span>-->
<!--                <span v-if="item.gohour">{{item.gohour}}:{{item.gominute}}</span>-->
<!--                <span v-if="item.gotime">，</span>-->
<!--                <span v-if="item.team">{{item.team}}</span>-->
<!--                <span v-if="item.personnum">{{item.personnum}}人 </span>-->
<!--                <span v-if="item.destination">前往{{item.destination}}</span>-->
<!--                <span v-if="item.team && !item.destination&&!item.describeThings">前往震区</span>-->
<!--                <span v-if="item.describeThings">{{item.describeThings}}</span>-->
<!--                <div v-if="item.gotime || item.team || item.personnum || item.destination||item.describeThings" class="p-underline"></div>-->
<!--              </p>-->
                <p class="rescue_team_p">{{showContent(item)}}</p>
            </div>
          </li>
        </ul>
      </div>
      <div class="rescue_team_time_div">
        <div class="title-underline_low"></div>
        <p class="time_text"> 数据更新时间</p>
        <p class="time">{{this.recordtime}}</p>
      </div>
    </div>

    <div v-show="!rescue_team_isExpanded">
      <div class="rescue_team_notexpand_button" @click="rescue_team_toggleExpand">
        <img src="../../assets/icons/TimeLine/收起展开箭头右.png" style="height: 100%;width: 100%">
      </div>
    </div>
  </div>


</template>


<script>
import timeLineRescueTeam from "@/assets/json/TimeLine/timeLineRescueTeam";
import {getRescueTeam} from "../../api/system/timeLine.js";
export default {
  data() {
    return {
      RescueTeamInfo:'',
      showRescueTeam:[],
      rescue_team_isExpanded:'true',
      recordtime: '',
      ifShowData:false,
    }
  },
  props: [
    'currentTime',
      'eqid'
  ],
  mounted() {

    if(this.eqid === 'be3a5ea4-8dfd-a0a2-2510-21845f17960b'){
      this.ifShowData = true
      this.init()
    }
  },
  watch: {
    currentTime(newVal) {
        // console.log("``````````````````",newVal)
        if(this.ifShowData){
            this.rescue_team_update(newVal)
        }
    }
  },
  methods: {
    init() {
        getRescueTeam().then(res => {
          console.log("res:----",res)
          this.RescueTeamInfo = res
          this.rescue_team_update(this.currentTime)
        })
    },

      showContent(item){
          // console.log("========================",item)
        let result = ""
        if(item.gotime !== "" && item.gotime !== undefined && item.gotime !== null){
            result = item.goyear + '年' + item.gomonth + '月' + item.goday + '日' + ' '
                + item.gohour + ':' + item.gominute + '，'
        }else{
            result = item.goRecordyear + '年' + item.goRecordmonth + '月' + item.goRecordday + '日' + ' '
                + item.goRecordhour + ':' + item.goRecordminute + '，'
        }
        let flag = true
        if(item.team !== "" && item.team !== undefined && item.team !== null){
            result = result + item.team
            flag = false
        }
        if(item.personnum !== "" && item.personnum !== undefined && item.personnum !== null){
              result = result + item.personnum + '人'
            flag = false
        }
        if(item.destination !== "" && item.destination !== undefined && item.destination !== null){
            result = result + '前往' + item.destination + '。'
        }else{
            if(!flag){
                result = result + '前往震区' + '。'
            }
        }
        if(flag && item.describeThings !== null){
            if(item.describeThings.endsWith('。')){
                result = result + item.describeThings
            }else{
                result = result + item.describeThings + '。'
            }
        }

          // console.log("===================",result)
        return result
      },

    async rescue_team_update(currentTime) {
      this.showRescueTeam=[]
      // console.log("救援出队 res",this.RescueTeamInfo)
      // console.log(currentTime)
      //筛选用记录时间
      const activities = await this.RescueTeamInfo.filter((activity) => {
        return (
                new Date(activity.recordTime) <= currentTime
        );
      });
      activities.sort((a, b) => {
            if (a.recordTime < b.recordTime) return -1;
            if (a.recordTime > b.recordTime) return 1;
            return 0;
        });
      if(activities.length>0){
        this.recordtime = this.timestampToTime(activities[activities.length - 1].recordTime)

        //内容用行动时间
        activities.forEach((item) => {
          let activity={
            recordtime: this.timestampToTime(item.departureDate),
            gotime:'',
            goyear: '',
            gomonth: '',
            goday: '',
            gohour:'',
            gominute:'',
            team: item.teamName,
            personnum: item.personnelCount,
            destination: item.plannedRescueArea,
            describeThings:item.describeThings
          }
            if (item.departureDate) {
                activity.gotime = new Date(item.departureDate)
                activity.goyear = activity.gotime.getFullYear()
                activity.gomonth = activity.gotime.getMonth() + 1
                activity.goday = activity.gotime.getDate()
                activity.gohour = String(new Date(item.departureDate).getHours()).padStart(2, '0');
                activity.gominute = String(new Date(item.departureDate).getMinutes()).padStart(2, '0');
            }
            if(item.recordTime){
                activity.goRecordtime = new Date(item.recordTime)
                activity.goRecordyear = activity.goRecordtime.getFullYear()
                activity.goRecordmonth = activity.goRecordtime.getMonth() + 1
                activity.goRecordday = activity.goRecordtime.getDate()
                activity.goRecordhour = String(new Date(item.recordTime).getHours()).padStart(2, '0');
                activity.goRecordminute = String(new Date(item.recordTime).getMinutes()).padStart(2, '0');
            }
          this.showRescueTeam.unshift(activity)
        })
      }
    },

      timestampToTime(timestamp) {
          let DateObj = new Date(timestamp)
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
    rescue_team_toggleExpand() {
      this.rescue_team_isExpanded = !this.rescue_team_isExpanded
    }
  }
}
</script>

<style>


.rescue_team{
  position: absolute;
  top: 55%;
  width: 25%;  /* 调整宽度 */
  height: 30%;
  padding: 10px;
  border-radius: 5px;
  left: 1%;
  z-index: 10; /* 提高层级 */
  background-color: rgba(40, 40, 40, 0.7);
}

.title{
  margin: 0.9px;
  font-size: 1.1rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}

.rescue_team_expand_button {
  position: absolute;
  width: 10%; /* 调整宽度 */
  //height: 25%;
  padding: 10px;
  border-radius: 5px;
  top: 0%;
  right: 1%;
  z-index: 22; /* 提高层级 */
}

.rescue_team_notexpand_button {
  position: absolute;
  width: 2.5%; /* 调整宽度 */
  padding: 10px;
  border-radius: 5px;
  top: 54%;
  left: 1%;
  z-index: 22; /* 提高层级 */
}

.title-underline {
  width: 100%;
  height: 1px;
  background-color: #FFFFFF;
  margin-top: 0px;
}
.p-underline {
  width: 100%;
  height: 0.5px;
  background-color: rgba(223, 225, 229, 0.42);
  margin-top: 0px;
}

.rescue_team_time_div{
  position: absolute;
  width: 94%;
  height: 20%;
  bottom:1%;
}
.title-underline_low{
  width: 100%;
  height: 0.5px;
  background-color: #FFFFFF;
  margin-top: 0px;
}

.rescue_team_p{
  margin-top: 1em;
  margin: 1px;
  font-size: 1rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}
.time_text{
  margin: 1px;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}
.time{
  margin: 0px;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffeb00;
}


.sub-title {
  font-family: myFirstFont;
  font-size: 1.1rem;
  line-height: 1.8rem;
  /*padding: 1rem 0 1rem !important;*/
  color: #ffffff;
  letter-spacing: 0;
  text-align: justify;
  text-shadow: 0.2rem 0.3rem 0 rgba(0, 0, 0, 0.39);
  border-bottom: 0.1rem solid #ffffff;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  max-height: 65%;
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
  margin-bottom: 0; /* Optional: Add some space between items */
  /*border-bottom: 1px solid #ddd; !* Optional: Add a border for separation *!*/
  padding: 0; /* Optional: Add padding for better spacing */
}

.sub-content {
  padding: 0;
  margin: 0;
  line-height: 2rem;
  font-size: .6rem;
  flex: 1;
}

</style>
