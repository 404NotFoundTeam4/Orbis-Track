import { data, useNavigate } from "react-router-dom";
import { Send_Otp, Verify_Otp } from "../services/OtpServices";
import { resetPassword } from "../services/AccountService";

export const verify = () => {
  const navigate = useNavigate();
  const Get_Otp  = async(email) =>{
     const res = await Send_Otp(email);
     return res;
  }
  const Set_Otp  = async(email,otp) =>{
     const res = await Verify_Otp(email,otp);
     if(res.data.success){
          navigate("/resetpassword", { state: { email } });   
     }
     return res.data.success;
  }
  const ResetPassword  = async(email, newPassword,confirmNewPassword) =>{
      const res = await resetPassword( email, newPassword,confirmNewPassword)
      if(res){navigate("/login")}
     return res;
  }
  return {Get_Otp,Set_Otp,ResetPassword};
};
