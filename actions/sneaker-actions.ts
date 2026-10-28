"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import type {
  AvailabilityStatus,
  Sneaker,
  SneakerCreateInput,
  SneakerUpdateInput,
} from "@/types";

export interface ActionResponse<T = null> {
  success: boolean;
  data?: T;
  error?: string;
}

const isAvailabilityStatus = (value: unknown): value is AvailabilityStatus =>
  value === "available" || value === "coming_soon" || value === "sold_out";

function validateCreateData(data: SneakerCreateInput): string | null {
  if (!data.name?.trim()) return "Sneaker name is required.";
  if (!data.tagline?.trim()) return "Sneaker tagline is required.";
  if (!Number.isFinite(data.price) || data.price < 0) return "Price must be a valid non-negative number.";
  if (!data.image_url?.trim()) return "Image URL is required.";
  if (!data.description?.trim()) return "Description is required.";
  if (!isAvailabilityStatus(data.availability_status)) return "Availability status is invalid.";
  return null;
}

function validateUpdateData(data: SneakerUpdateInput): string | null {
  if (data.name !== undefined && !data.name.trim()) return "Sneaker name cannot be empty.";
  if (data.tagline !== undefined && !data.tagline.trim()) return "Sneaker tagline cannot be empty.";
  if (data.price !== undefined && (!Number.isFinite(data.price) || data.price < 0)) {
    return "Price must be a valid non-negative number.";
  }
  if (data.image_url !== undefined && !data.image_url.trim()) return "Image URL cannot be empty.";
  if (data.description !== undefined && !data.description.trim()) return "Description cannot be empty.";
  if (
    data.availability_status !== undefined &&
    !isAvailabilityStatus(data.availability_status)
  ) {
    return "Availability status is invalid.";
  }
  return null;
}

export async function getSneakers(): Promise<ActionResponse<Sneaker[]>> {
  try {
    const { data, error } = await supabase
      .from("sneakers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Sneaker[] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch sneakers.",
    };
  }
}

export async function getSneakerById(id: string): Promise<ActionResponse<Sneaker>> {
  if (!id?.trim()) return { success: false, error: "Sneaker ID is required." };

  try {
    const { data, error } = await supabase
      .from("sneakers")
      .select("*")
      .eq("id", id.trim())
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: "Sneaker not found." };
    return { success: true, data: data as Sneaker };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch the sneaker.",
    };
  }
}

export async function createSneaker(
  data: SneakerCreateInput,
): Promise<ActionResponse<Sneaker>> {
  const validationError = validateCreateData(data);
  if (validationError) return { success: false, error: validationError };

  try {
    const payload: SneakerCreateInput = {
      name: data.name.trim(),
      tagline: data.tagline.trim(),
      price: data.price,
      image_url: data.image_url.trim(),
      description: data.description.trim(),
      availability_status: data.availability_status,
    };

    const { data: sneaker, error } = await supabase
      .from("sneakers")
      .insert(payload)
      .select("*")
      .single();

    if (error) return { success: false, error: error.message };
    if (!sneaker) return { success: false, error: "Sneaker could not be created." };

    revalidatePath("/");
    return { success: true, data: sneaker as Sneaker };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create the sneaker.",
    };
  }
}

export async function updateSneaker(
  id: string,
  data: SneakerUpdateInput,
): Promise<ActionResponse<Sneaker>> {
  if (!id?.trim()) return { success: false, error: "Sneaker ID is required." };
  if (!data || Object.keys(data).length === 0) {
    return { success: false, error: "At least one field is required for update." };
  }

  const validationError = validateUpdateData(data);
  if (validationError) return { success: false, error: validationError };

  const payload: SneakerUpdateInput = { ...data };
  for (const key of ["name", "tagline", "image_url", "description"] as const) {
    if (typeof payload[key] === "string") payload[key] = payload[key].trim();
  }

  try {
    const { data: sneaker, error } = await supabase
      .from("sneakers")
      .update(payload)
      .eq("id", id.trim())
      .select("*")
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!sneaker) return { success: false, error: "Sneaker not found." };

    revalidatePath("/");
    revalidatePath(`/sneakers/${id.trim()}`);
    return { success: true, data: sneaker as Sneaker };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update the sneaker.",
    };
  }
}

export async function deleteSneaker(id: string): Promise<ActionResponse> {
  if (!id?.trim()) return { success: false, error: "Sneaker ID is required." };

  try {
    const { error, count } = await supabase
      .from("sneakers")
      .delete({ count: "exact" })
      .eq("id", id.trim());

    if (error) return { success: false, error: error.message };
    if (count === 0) return { success: false, error: "Sneaker not found." };

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete the sneaker.",
    };
  }
}
