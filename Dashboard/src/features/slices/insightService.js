import axios from "../../apis/axiosInstance";
import {BASE_URL} from "../../apis/urls"

const url = BASE_URL + "/events";

export const initialAggregatedResult = async (appId,company,days)=>{
    const result = await axios.post(url+"/get-initial-aggregated-result",{
        appId,
        company,
        days
    })
    return result.data;
}

