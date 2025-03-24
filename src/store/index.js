// store.js
import { createPinia, defineStore } from 'pinia';

// 创建 Pinia 实例
const store = createPinia();

// 定义一个 store
export const useGlobalStore = defineStore('globalEqId', {
    state: () => ({
        globalEqId: 'be3a5ea4-8dfd-a0a2-2510-21845f17960b', // 全局地震id
        globalChange: '', // 是否更新板块，全局标识
    }),
    actions: {
        setGlobalVariable(newValue) {
            this.globalEqId = newValue;  // 更新全局变量
            console.log("全局地震",this.globalEqId)
        },
        setGlobalChange(newValue){
          this.globalChang = newValue; // 更新全局标识
            console.log("全局模块更新标识",this.globalChang)
        }
    }
});

export const useTitleStore = defineStore('title', {
    state: () => ({
        // pageTitle: '地震灾害应急技术支撑能力提升项目'
        pageTitle: '雅安市地震应急信息服务技术支撑平台'
    }),
    actions: {
        setTitle(newTitle) {
            this.pageTitle = newTitle;
            document.title = newTitle; // 同步更新浏览器标题
        }
    }
});

// 导出 store
export default store;
