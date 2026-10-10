'use server';

import { cookies } from "next/headers";

export async function loginAction(email, password, isAdmin) {
  // In a real app, you would validate credentials against a DB
  const cookieStore = await cookies();
  
  if (isAdmin) {
    if (email === "admin@gmail.com" && password === "admin") {
      cookieStore.set("admin_session", "valid_admin", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      });
      return { success: true };
    }
    return { success: false, error: "Invalid admin credentials" };
  } else {
    // Normal user login mock
    cookieStore.set("user_session", "valid_user", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });
    return { success: true };
  }
}

export async function logoutAction(isAdmin) {
  const cookieStore = await cookies();
  if (isAdmin) {
    cookieStore.delete("admin_session");
  } else {
    cookieStore.delete("user_session");
  }
  return { success: true };
}

export async function verifyAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "valid_admin") {
    throw new Error("Unauthorized");
  }
  return true;
}
