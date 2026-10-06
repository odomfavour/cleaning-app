import { getCurrentUser } from "@/lib/auth/session";
import {
  REQUEST_ACCESS_COOKIE_NAME,
  verifyRequestAccessToken,
} from "@/server/auth/request-access";

export async function canAccessCustomerRequest(
  request: Request,
  requestId: string,
  customerId: string,
) {
  const accessToken = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${REQUEST_ACCESS_COOKIE_NAME}=`))
    ?.slice(REQUEST_ACCESS_COOKIE_NAME.length + 1);

  if (accessToken) {
    const access = verifyRequestAccessToken(decodeURIComponent(accessToken));

    if (access?.requestId === requestId && access.customerId === customerId) {
      return true;
    }
  }

  const user = await getCurrentUser();

  return user?.role === "customer" && user.customerId === customerId;
}
