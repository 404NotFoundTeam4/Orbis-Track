import { UserData } from "../services/AccountService.js";
import { GetValidToken } from "../services/remember.js";
export async function getAccount() {
  const validToken = GetValidToken();
  const User = await UserData(validToken);
  localStorage.removeItem("User");
  localStorage.setItem("User", JSON.stringify(User));
  sessionStorage.setItem("User", JSON.stringify(User));
  window.dispatchEvent(new Event("user-updated"));
}

export const Account = { getAccount };
