import axios from "axios";
import {tianDitulocalApi} from "@/utils/server.js";
import {TianDiTuToken} from "@/cesium/tool/config.js";
let generalCompute = {
    async getReverseGeocode(lon, lat) {
        try {
            // const response = await axios.get('https://api.tianditu.gov.cn/geocoder', {
                const response = await axios.get(`${tianDitulocalApi}/geocoder`, {
                params: {
                    postStr: JSON.stringify({lon, lat, ver: 1}),
                    type: 'geocode',
                    tk: TianDiTuToken
                }
            });
            // console.log(response,"response")
            return response.data.result.addressComponent;
        } catch (error) {
            // console.error("逆地理编码失败:", error);
            console.error("逆地理编码失败");
            return null;
        }
    },
}
export default generalCompute;
