// validation/profile.ts
import { z } from 'zod';

export const ageGroupEnum = z.enum(['below_18', '18_30', '31_50', '50_plus']).optional();
export const bloodGroupEnum = z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).optional();
export const genderEnum = z.enum(['male', 'female', 'other', 'prefer_not']).optional();

export const profileSchema = z.object({
  user_id: z.string().uuid().optional(),
  display_name: z.string().max(100).optional(),
  email: z.string().email().optional(),
  mobile_number: z.string().min(6, "Enter a valid mobile number").max(20).nonempty("Mobile number required"),
  age_group: ageGroupEnum,
  blood_group: bloodGroupEnum,
  gender: genderEnum,
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  updated_at: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
