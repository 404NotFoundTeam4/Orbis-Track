export function Login(
    username: string,
    passwords: string,
    isRemember: boolean
): Promise<{ data: { accessToken: string }; message: string }>;

export function LoginWithCookie(
    username: string,
    passwords: string,
    isRemember: boolean
): Promise<{ message: string }>;

export function UserData(token: string): Promise<{
    us_id: number;
    us_name: string;
    us_email: string;
    us_role: string;
    us_images: string | null;
}>;

export function ResetPassword(
    token: string,
    newPassword: string,
    confirmNewPassword: string
): Promise<{ data: unknown; message: string }>;

export function ForgotPassword(
    email: string,
    newPassword: string,
    confirmNewPassword: string
): Promise<{ data: unknown; message: string }>;

export function Logout(token: string): Promise<{ message: string }>;
