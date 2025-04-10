import axios from "axios";
import {tianDitulocalApi} from "@/utils/server.js";

let generalCompute = {
    async getReverseGeocode(lon, lat) {
        try {
            // const response = await axios.get('https://api.tianditu.gov.cn/geocoder', {
                const response = await axios.get(`${tianDitulocalApi}/geocoder`, {
                params: {
                    postStr: JSON.stringify({lon, lat, ver: 1}),
                    type: 'geocode',
                    // tk: '31f4628fd3dd7fa4d98dd14042665db1'
                    tk: '5977634187c7e8866476add35ace55d0'
                }
            });
            // console.log(response,"response")
            return response.data.result.addressComponent;
        } catch (error) {
            console.error("逆地理编码失败:", error);
            return null;
        }
    },
}
export default generalCompute;
