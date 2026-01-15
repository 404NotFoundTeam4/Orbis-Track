// Declaration file for verifyEmail.js
export function verifyEmail(): {
    GetOtp: (email: string) => Promise<{ success: boolean; message: string }>;
    SetOtp: (email: string, otp: string) => Promise<boolean>;
    ResetPW: (token: string, newPassword: string, confirmNewPassword: string) => Promise<unknown>;
    ForgotPW: (email: string, newPassword: string, confirmNewPassword: string) => Promise<unknown>;
};
