<template>
  <div>
    <div class="personnel_casualties" v-show="personnel_casualties_isExpanded">
      <p class="title">人员伤亡</p>

      <div class="personnel_casualties_expand_button" @click="personnel_casualties_toggleExpand">
        <img src="../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 100%;width: 100%">
      </div>

      <div class="title-underline"></div>


      <ul class="total-list">
        <li>
          <p>
            <span class="death_num">{{ this.activity.death }}</span> 人
          </p>
          <p>死亡人数 </p>
        </li>
        <li>
          <p>
            <span class="miss_num">{{ this.activity.miss }} </span> 人
          </p>
          <p>失联人数</p>
        </li>
        <li>
          <p>
            <span class="injure_num"> {{ this.activity.injure }} </span> 人
          </p>
          <p>受伤人数 </p>
        </li>
      </ul>

      <div class="personnel_casualties_time_div">
        <div class="title-underline"></div>
        <p class="time_text"> 数据更新时间</p>
        <p class="time"> {{ this.activity.time }}</p>
      </div>
    </div>

    <div v-show="!personnel_casualties_isExpanded">
      <div class="personnel_casualties_notexpand_button" @click="personnel_casualties_toggleExpand">
        <img src="../../assets/icons/TimeLine/收起展开箭头右.png" style="height: 100%;width: 100%">
      </div>
    </div>
  </div>


</template>


<script>
import PersonnelCasualties from "@/assets/json/TimeLine/PersonnelCasualties";
import {getRescueActionCasualties} from "../../api/system/timeLine.js";

export default {
  data() {
    return {
      Responsecontent: '',
      activity: {
        time: '',
        death: '0',
        miss: '0',
        injure: '0',
      },
      ifShowData: false,
      personnel_casualties_isExpanded: 'true'
    }
  },
  props: [
    'currentTime',
    'eqid'
  ],
  mounted() {
    if (this.eqid === 'be3a5ea4-8dfd-a0a2-2510-21845f17960b') {
      this.ifShowData = true
      this.init()
    }
  },
  watch: {
    currentTime(newVal) {
      if (this.ifShowData) {
        this.personnel_casualties_update(newVal)
      }
    }
  },
  methods: {
    init() {
      getRescueActionCasualties().then(res => {
        console.log("res人员伤亡:",res)
        this.Responsecontent = res
        this.personnel_casualties_update(this.currentTime)
      })
    },
    async personnel_casualties_update(currentTime) {
      const activities =await this.Responsecontent.filter((activity) => {
        return (
            new Date(activity.recordTime) <= currentTime
        );
      });
      if (activities.length >= 1) {
        // console.log("activities",activities)
        activities.sort((a, b) => {
          if (a.recordTime < b.recordTime) return -1;
          if (a.recordTime > b.recordTime) return 1;
          return 0;
        });
        let tmp = activities[activities.length - 1]
        // console.log("casual",tmp)
        this.activity.time = this.timestampToTime(tmp.recordTime)
        this.activity.death = tmp.totalDeathCount
        this.activity.miss = 0
        this.activity.injure = tmp.totalSeriousInjuryCount + tmp.totalMildInjuryCount + tmp.totalCriticalInjuryCount
      }
      else {  //初始化为eqlist时间
        this.activity.time = this.timestampToTime(currentTime)
        this.activity.death = '0'
        this.activity.miss = '0'
        this.activity.injure = '0'
      }
    },
    personnel_casualties_toggleExpand() {
      this.personnel_casualties_isExpanded = !this.personnel_casualties_isExpanded
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

  }
}
</script>

<style>
.personnel_casualties {
  position: absolute;
  top: 34%;
  width: 25%;
  height: 20%;
  padding: 10px;
  border-radius: 5px;
  left: 1%;
  z-index: 20;
  background-color: rgba(40, 40, 40, 0.7);
}

.title {
  margin: 0.9px;
  font-size: 1.1rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}

.personnel_casualties_expand_button {
  position: absolute;
  width: 10%; /* 调整宽度 */
  //height: 25%;
  padding: 10px;
  border-radius: 5px;
  top: 0%;
  right: 1%;
  z-index: 22; /* 提高层级 */
}

.personnel_casualties_notexpand_button {
  position: absolute;
  width: 2.5%; /* 调整宽度 */
  padding: 10px;
  border-radius: 5px;
  top: 28%;
  left: 1%;
  z-index: 22; /* 提高层级 */
}

.title-underline {
  width: 100%;
  height: 1px;
  background-color: #FFFFFF;
  margin-top: 0px;
}

.total-list {
  height: 36%;
  //width:100%;
  list-style-type: none;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff; /* 设置文字颜色为白色 */
}

.total-list li {
  text-align: center;
  margin: 0 17px;
}

.total-list li p {
  margin: 0;
  font-size: 0.9rem;
}

.total-list li p:first-child {
  font-size: 0.9rem;
  font-weight: normal;
}

.total-list li p span {
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 5px;
}

.death_num {
  color: #b92853;
}

.miss_num {
  color: #a59ccb;
}

.injure_num {

  color: #c1d58b;
}

.personnel_casualties_time_div {
  position: absolute;
  width: 94%;
  height: 20%;
  bottom: 10%;
}

.time_text {
  margin: 1px;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}

.time {
  margin: 0px;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffeb00;
}
</style>
