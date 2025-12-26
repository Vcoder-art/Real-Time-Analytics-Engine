import axiosInstance from "../../apis/axiosInstance"
import {BASE_URL} from "../../apis/urls"

const url = BASE_URL+"/mail";


export const getInboxMails = async () => {
 const data = await  axiosInstance.get(url+"/inbox")
 return data.data
}

export const sentMail = async (mailDetails) => {
  await axiosInstance.post(url+"/send", mailDetails)
}

export const getSentMails = async () => {
  const response = await axiosInstance.get(url+"/sent")
  return response.data;
}

export const readMailById = async (id)=> {
  const response = await axiosInstance.get(`${url}/${id}`)
  return response.data;
}