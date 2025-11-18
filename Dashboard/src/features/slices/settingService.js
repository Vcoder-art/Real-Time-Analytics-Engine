import { BASE_URL } from "../../apis/urls";
import axios from "../../apis/axiosInstance";

const url = BASE_URL + "/settings";

export const getSettings = async () => {
  const response = await axios.get(url + "/get-settings");
  return response.data.data.settings;
};

export const updateSettings = async (updates) => {
  const response = await axios.post(url + "/update-settings", {
    updates,
  });
  return response.data;
};
