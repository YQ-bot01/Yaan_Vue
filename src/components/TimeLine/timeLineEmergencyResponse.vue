
<template>
  <div>
    <div class="emergency_response" v-show="emergency_response_isExpanded">
      <p class="title">应急响应</p>
      <div class="emergency_response_expand_button" @click="emergency_response_toggleExpand">
        <img src="../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 100%;width: 100%">
      </div>
      <div class="emergency_response_title-underline"></div>

      <!--            <p class="emergency_response_state"> {{this.activity.time}}</p>-->
      <p class="emergency_response_txt"> {{this.activity.time}}</p>
      <p class="emergency_response_txt"><span>{{this.activity.department}}</span> </p>
      <p class="emergency_response_responseName"><span>{{this.activity.ResponseName}}</span> <span class="emergency_response_txt">{{this.activity.state}}</span></p>

      <div class="emergency_response_time_div">
        <div class="emergency_response_title-underline"></div>
        <p class="time_text"> 数据更新时间</p>
        <p class="time"> {{this.activity.time}}</p>
      </div>
    </div>

    <div v-show="!emergency_response_isExpanded">
      <div class="emergency_response_notexpand_button" @click="emergency_response_toggleExpand">
        <img src="../../assets/icons/TimeLine/收起展开箭头右.png" style="max-height: 15px;max-width: 15px">
      </div>
    </div>
  </div>


</template>


<script>
import EmergencyResponse from "@/assets/json/TimeLine/EmergencyResponse";
import {getEmergencyResponse} from "../../api/system/timeLine.js";
export default {
  data() {
    return {
      EmergencyResponseResponsecontent: [],
      activity:{
        ResponseName: '',
        state: '',
        department: '',
        time: '',
      },
      ifShowData: false,
      emergency_response_isExpanded:'true'
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
      if(this.ifShowData) {
        this.updateEmergencyResponse(newVal)
      }
    }
  },
  methods: {
    init() {
        getEmergencyResponse().then(res => {
          this.EmergencyResponseResponsecontent = res
          this.updateEmergencyResponse(this.currentTime)
        })
    },
    async updateEmergencyResponse(currentTime){
      const activities =await this.EmergencyResponseResponsecontent.filter((activity) => {
        return (
            new Date(activity.responseTime) <= currentTime
        );
      });
      if(activities.length>=1){
        activities.sort((a, b) => {
          if (a.responseTime < b.responseTime) return -1;
          if (a.responseTime > b.responseTime) return 1;
          return 0;
        });
        let tmp=activities[activities.length-1]
        // console.log(tmp)
        this.activity.time=this.timestampToTime(tmp.responseTime)
        this.activity.department=tmp.unit
        this.activity.ResponseName=tmp.level
        this.activity.state=tmp.status
      }
      // console.log("this.activity-------",this.activity)
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
    emergency_response_toggleExpand() {
      this.emergency_response_isExpanded = !this.emergency_response_isExpanded
    }
  }
}
</script>

<style>
.emergency_response {
  position: absolute;
  width: 25%; /* 调整宽度 */
  height: 23%;
  padding: 10px;
  border-radius: 5px;
  top:10%;
  left: 1%;
  z-index: 20; /* 提高层级 */
  background-color: rgba(40, 40, 40, 0.7);
}


.title{
  margin: 0.9px;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}

.emergency_response_expand_button{
  position: absolute;
  width: 10%; /* 调整宽度 */
  //height: 25%;
  padding: 10px;
  border-radius: 5px;
  top: 0%;
  right: 1%;
  z-index: 22; /* 提高层级 */
}
.emergency_response_notexpand_button{
  position: absolute;
  width: 2.5%; /* 调整宽度 */
  //height: 6%;
  padding: 10px;
  border-radius: 5px;
  top: 5%;
  left: 1%;
  z-index: 22; /* 提高层级 */
  //background-color: #C03639;
}

.emergency_response_title-underline {
  width: 100%;
  height: 1px;
  background-color: #FFFFFF;
  margin-top: 1px;
}



.emergency_response_responseName{
  font-size: 1.1rem;
  line-height: 0.5rem;
  font-weight: bold;
  font-family: 'myFirstFont', sans-serif;
  color: #419fff;
}
.emergency_response_txt{
  font-size: 1.1rem;
  line-height: 0.5rem;
  font-weight: bold;
  font-weight: normal;
  color: #ffffff;
}
.emergency_response_department {
  font-size: 1rem;
  line-height: 0rem;
  font-weight: bold;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}
.emergency_response_state {
  font-size: 0.9rem;
  line-height: 0.3rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}
.emergency_response_time_div{
  position: absolute;
  width: 94%;
  height: 10%;
  bottom:16%;
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
</style>
