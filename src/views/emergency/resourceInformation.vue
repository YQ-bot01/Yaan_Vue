<template>
    <div class="app-container">
<!--    下拉框选择展示的应急资源表    -->
        <el-row :gutter="10" class="mb8">
            <el-col :span="4">
                <el-select v-model="selectedValue" placeholder="请选择" @change="selectTable">
                    <el-option
                            v-for="item in tableOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                    </el-option>
                </el-select>
            </el-col>
        </el-row>

<!--    应急资源表    -->
        <el-table :data="tableData" :stripe="true" :header-cell-style="tableHeaderColor" :cell-style="tableColor">
            <el-table-column label="序号" width="60">
                <template #default="{ row, column, $index }">
                    {{ ($index + 1) + (currentPage - 1) * pageSize }}
                </template>
            </el-table-column>

            <el-table-column
                    v-for="(header, index) in currentHeaders"
                    :key="index"
                    :prop="header.prop"
                    :label="header.label"
                    :width="header.width"
                    show-overflow-tooltip
            >
            </el-table-column>

            <el-table-column label="操作" align="center">
                <template #default="scope">
                    <el-button type="text" icon="Edit">修改</el-button>
                    <el-button type="text" icon="Delete">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    export default {
        name: "resourceInformation",
        data(){
            return{
                // 下拉框选表
                selectedValue: 'emergencyShelters',
                tableOptions: [
                    { label: '应急物资储备', value: 'value1' },
                    { label: '应急避难场所', value: 'emergencyShelters' },
                    { label: '救援队伍', value: 'emergencyTeams' }
                    // '应急物资储备', '应急避难场所', '救援队伍'
                ],
                // ----------------
                tableData: [],
                total: 0,
                pageSize: 10,
                pageSizes: [10, 20, 40],
                currentPage: 1,
                currentHeaders: [],
                // 应急避难场所表头
                emergencyShelters: [
                    { label: '名称', width: 150 },
                    { label: '地点类型', width: 50 },
                    { label: '面积', width: 50 },
                    { label: '容纳人数', width: 50 },
                    { label: '级别名称', width: 50 },
                    { label: '保密级别', width: 50 },
                    { label: '行政区划', width: 50 },
                    { label: '地址', width: 50 },
                    { label: '负责人', width: 50 },
                    { label: '应急电话', width: 50 },
                    { label: '应急手机', width: 50 },
                    { label: '隶属组织', width: 50 },
                    { label: '启用日期', width: 50 },
                    { label: '设计使用年限', width: 50 },
                    { label: '基本信息', width: 50 },
                    { label: '地震烈度', width: 50 },
                    { label: '经度', width: 50 },
                    { label: '纬度', width: 50 },
                    { label: '数据来源', width: 50 },
                    { label: '备注', width: 50 }
                ],
                // 救援队伍表头
                emergencyTeams: [
                    { label: '组织机构', width: 50 },
                    { label: '级别名称', width: 50 },
                    { label: '队伍类型名称', width: 50 },
                    { label: '地址', width: 50 },
                    { label: '总人数', width: 50 },
                    { label: '成立日期', width: 50 },
                    { label: '主要职责', width: 50 },
                    { label: '专业描述', width: 50 },
                    { label: '应急联系方式', width: 50 },
                    { label: '预估准备时间', width: 50 },
                    { label: '集合出发地点', width: 50 },
                    { label: '自备交通工具', width: 50 },
                    { label: '经度', width: 50 },
                    { label: '纬度', width: 50 },
                    { label: '负责人', width: 50 },
                    { label: '负责人电话', width: 50 },
                    { label: '保密级别', width: 50 },
                    { label: '修改人', width: 50 },
                    { label: '资质级别', width: 50 },
                    { label: '数据来源', width: 50 },
                    { label: '备注', width: 50 }
                ],
                emergencyResource: [],
            }
        },
        mounted() {
            this.selectTable()
        },
        methods:{
            selectTable(){
                console.log("-----------",this.selectedValue)
                this.currentHeaders = this.selectedValue === 'emergencyShelters' ? this.emergencyShelters
                    : (this.selectedValue === 'emergencyTeams' ? this.emergencyTeams : this.emergencyResource)
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
        }
    }
</script>

<style scoped>

</style>
