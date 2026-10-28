"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin, supabase } from "@/lib/supabase";
import { isAdminSession } from "@/lib/admin-auth";
import type { WaitlistSubmission } from "@/types";

export interface WaitlistActionResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Deliberately use a basic format check here. Full email validity is determined
// by confirmation/delivery, and strict RFC regexes reject legitimate addresses.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function joinWaitlist(
  sneakerId: string,
  email: string,
): Promise<WaitlistActionResponse> {
  const normalizedSneakerId = sneakerId?.trim();
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedSneakerId) {
    return { success: false, message: "A sneaker is required.", error: "A sneaker is required." };
  }
  if (!normalizedEmail) {
    return { success: false, message: "Email address is required.", error: "Email address is required." };
  }
  if (normalizedEmail.length > 254 || !EMAIL_PATTERN.test(normalizedEmail)) {
    return { success: false, message: "Please enter a valid email address.", error: "Please enter a valid email address." };
  }

  try {
    const { data: sneaker, error: sneakerError } = await supabase
      .from("sneakers")
      .select("id")
      .eq("id", normalizedSneakerId)
      .maybeSingle();

    if (sneakerError) {
      console.error("[joinWaitlist] sneaker lookup failed:", {
        code: sneakerError.code,
        message: sneakerError.message,
        details: sneakerError.details,
        hint: sneakerError.hint,
      });
      return { success: false, message: "Unable to verify the sneaker.", error: sneakerError.message };
    }
    if (!sneaker) {
      return { success: false, message: "Sneaker not found.", error: "Sneaker not found." };
    }

    const { error: insertError } = await supabase.from("waitlist").insert({
      sneaker_id: normalizedSneakerId,
      email: normalizedEmail,
    });

    if (insertError) {
      console.error("[joinWaitlist] Supabase insert failed:", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
      if (insertError.code === "23505") {
        return {
          success: false,
          message: "This email is already registered for this sneaker.",
          error: "Duplicate waitlist signup.",
        };
      }
      return { success: false, message: "Unable to join the waitlist.", error: insertError.message };
    }

    revalidatePath("/admin");
    return {
      success: true,
      message: "Successfully joined the waitlist.",
    };
  } catch (error) {
    console.error(
      "[joinWaitlist] unexpected error:",
      error instanceof Error ? error.message : error,
    );
    return {
      success: false,
      message: "An unexpected error occurred while joining the waitlist.",
      error: error instanceof Error ? error.message : "Unexpected waitlist error.",
    };
  }
}

export async function getWaitlistSubmissions(): Promise<
  WaitlistActionResponse<WaitlistSubmission[]>
> {
  if (!(await isAdminSession())) {
    return { success: false, message: "Unauthorized administrator action.", error: "Unauthorized administrator action." };
  }
  try {
    const adminSupabase = getSupabaseAdmin();
    const { data, error } = await adminSupabase
      .from("waitlist")
      .select(`
        id,
        sneaker_id,
        email,
        created_at,
        sneaker:sneakers (
          id,
          name,
          image_url,
          price,
          availability_status
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, message: "Unable to fetch waitlist submissions.", error: error.message };
    }

    const submissions = (data ?? []) as unknown as WaitlistSubmission[];
    return {
      success: true,
      message: "Waitlist submissions fetched successfully.",
      data: submissions,
    };
  } catch (error) {
    return {
      success: false,
      message: "Unable to fetch waitlist submissions.",
      error: error instanceof Error ? error.message : "Unexpected waitlist fetch error.",
    };
  }
}
