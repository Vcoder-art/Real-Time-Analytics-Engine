import axios from "../../apis/axiosInstance";
import {BASE_URL} from "../../apis/urls"

const url = BASE_URL + "/channels";

export async function getChannelsHttp() {
  const response =  await axios.get(`${url}/get-app-channels`)
  return response.data
} 

