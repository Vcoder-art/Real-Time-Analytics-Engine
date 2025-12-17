import axios from "../../apis/axiosInstance";
import { BASE_URL } from "../../apis/urls";

const url = BASE_URL + "/employee";

export const getEmployees = async () => {
  const response = await axios.get(url + "/get-employees");
  return response.data.employees;
};

export const addEmployee = async (employeeDetails) => {
  await axios.post(url + "/add-employee",employeeDetails);
}

export const activateOrDeactivate = async (requestBody) => {
  await axios.post(url + "/activate-or-deactivate",requestBody);
}