import axios from "axios"

import {BASE_URL} from "../../apis/urls"

const url = BASE_URL + "/auth"

const login = async (credentials) => {
    const response = await axios.post(`${url}/login`,credentials);
    if(response.data.token) {
        localStorage.setItem("analytics_user",JSON.stringify(response.data));
    }
    return response.data;
}

const register = async (userData) => {
    const   response = await axios.post(`${url}/register`,userData);
    return response.data;
}

const logout = async () => {
  localStorage.removeItem("analytics_user");
};

export default { login, register, logout };