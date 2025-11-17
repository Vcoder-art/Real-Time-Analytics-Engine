import { BASE_URL } from "../../apis/urls";
import axios from "../../apis/axiosInstance";

const url = BASE_URL + "/settings";

export const getSettings = async () => {
  const response = await axios.get(url + "/get-settings");
  return response.data;
};

export const updateSettings = async () => {
    
}
