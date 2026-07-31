// lib/profiles.ts
import { supabase } from '@/integrations/supabase/client';
import { profileSchema, ProfileInput } from '@/validation/profile';

export async function upsertProfile(input: ProfileInput) {
  // Validate first
  const parse = profileSchema.safeParse(input);
  if (!parse.success) {
    return { error: { message: 'Validation failed', issues: parse.error.format() } };
  }

  const payload: any = {
    user_id: input.user_id,
    display_name: input.display_name,
    email: input.email,
    mobile_number: input.mobile_number,
    age_group: input.age_group,
    blood_group: input.blood_group,
    gender: input.gender,
    address: input.address,
    city: input.city,
    state: input.state,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return { error };
  return { data };
}
