import { z } from 'zod'

export const landmarkTypeEnum = z.enum([
  'temple',
  'water',
  'food',
  'rest',
  'toilet',
  'medical',
  'parking',
])

export const directionEnum = z.enum([
  'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW',
])

export const animationEnum = z.enum([
  'glow',
  'pulse',
  'bounce',
])

export const iconSizeEnum = z.enum([
  'small',
  'medium',
  'large',
])

export const landmarkFormSchema = z.object({
  name: z.string().min(3, 'Name is required'),

  lat: z
    .number({ invalid_type_error: 'Latitude required' })
    .min(-90)
    .max(90),

  lng: z
    .number({ invalid_type_error: 'Longitude required' })
    .min(-180)
    .max(180),

  type: landmarkTypeEnum,

  direction: directionEnum.optional(),

  description: z.string().optional(),

  timings: z.string().optional(),

  facilities: z.array(z.string()).optional(),

  animation_type: animationEnum,

  is_active: z.boolean().default(true),

  // Aṣṭa Lingam specific fields (admin-only controls)
  is_ashta_lingam: z.boolean().default(false),
  enable_glow: z.boolean().default(true),
  enable_aura_pulse: z.boolean().default(true),
  enable_snake_animation: z.boolean().default(false),
  premium_glow: z.boolean().default(false),
  glow_color: z.string().optional(),
  aura_color: z.string().optional(),
  icon_size: iconSizeEnum.default('medium'),

  image_url: z.string().optional(),
})

export type LandmarkFormValues = z.infer<typeof landmarkFormSchema>
