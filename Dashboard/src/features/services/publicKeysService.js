import axios from "../../apis/axiosInstance";
import {BASE_URL} from "../../apis/urls"

const url = BASE_URL + "/api-keys";

export async function createApiKeysHttp(appName) {
  const response = await  axios.post(url+"/create-api-key",{appName});
  return response.data;
}

