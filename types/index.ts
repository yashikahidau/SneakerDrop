export type AvailabilityStatus = "available" | "coming_soon" | "sold_out" | "archived";

export interface Sneaker {
  id: string;
  name: string;
  tagline: string;
  category: string;
  price: number;
  image_url: string;
  description: string;
  material_notes?: string | null;
  construction_notes?: string | null;
  availability_status: AvailabilityStatus;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  sneaker_id: string;
  email: string;
  created_at: string;
}

export interface WaitlistSubmission extends WaitlistEntry {
  sneaker: Pick<Sneaker, "id" | "name" | "image_url" | "price" | "availability_status"> | null;
}

export type SneakerCreateInput = Omit<Sneaker, "id" | "created_at">;
export type SneakerUpdateInput = Partial<SneakerCreateInput>;
