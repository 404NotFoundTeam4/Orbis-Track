import api from "../api/axios";

export const Send_Otp = async (email) => {
    const res = await api.post("/send-otp", { email });
    return res
};

export const Verify_Otp = async (email, otp) => {
    const res = await api.post("/verify-otp", { email, otp })
    return res;
}

