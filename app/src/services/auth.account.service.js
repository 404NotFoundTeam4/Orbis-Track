import api from "../api/axios";

export const login = async (username, passwords,isRemember) => {
  const account = { username, passwords,isRemember};
  const res = await api.post("/login", account);
  return res.data; // ส่งต่อข้อมูลจาก backend
};
export const user_data = async (token) => {
   const res = await api.get("/auth/fetch-me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.data
};

export const ResetPassword =async (Password,ConfirmPassword) =>{
const res = await api.post()
return res;

}

export const resetPassword = async (email, newPassword, confirmNewPassword) => {
  const payload = { email, newPassword, confirmNewPassword };
  const { data } = await api.post("/forgot-password", payload);

  return data;
}