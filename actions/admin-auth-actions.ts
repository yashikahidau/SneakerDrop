"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export interface AdminAuthResponse {
  success: boolean;
  message: string;
}

export async function loginAdmin(password: string): Promise<AdminAuthResponse> {
  if (!password?.trim()) {
    return { success: false, message: "Enter the administrator password." };
  }
  if (!process.env.ADMIN_PASSWORD) {
    return { success: false, message: "Admin access is not configured on the server." };
  }

  if (!verifyAdminPassword(password.trim())) {
    return { success: false, message: "Invalid administrator password." };
  }

  try {
    const token = createAdminSessionToken();
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    revalidatePath("/admin");
    return { success: true, message: "Administrator session created." };
  } catch {
    return { success: false, message: "Admin session could not be created." };
  }
}

export async function logoutAdmin(): Promise<AdminAuthResponse> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  revalidatePath("/admin");
  return { success: true, message: "Signed out securely." };
}
