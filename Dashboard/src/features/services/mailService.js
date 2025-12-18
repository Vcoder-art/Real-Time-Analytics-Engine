import axiosInstance from "../../apis/axiosInstance"
import {BASE_URL} from "../../apis/urls"

const url = BASE_URL+"/mail";


export const getInboxMails = async () => {
 const data = await  axiosInstance.get(url+"/inbox")
 return data.data
}