import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, clearSessionCookie, destroySessionByToken } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      await destroySessionByToken(token);
    }
    const res = jsonOk({});
    clearSessionCookie(res);
    return res;
  } catch (error) {
    return handleApiError(error);
  }
}
