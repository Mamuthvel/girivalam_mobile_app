import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { TablesInsert } from '@/integrations/supabase/types'
const LANDMARK_TYPES = [
    'temple',
    'water',
    'food',
    'rest',
    'toilet',
    'medical',
    'parking',
] as const

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const

const ANIMATIONS = ['glow', 'pulse', 'bounce'] as const
type LandmarkType = typeof LANDMARK_TYPES[number]
type Direction = typeof DIRECTIONS[number]
type AnimationType = typeof ANIMATIONS[number]

const parseEnum = <T extends readonly string[]>(
    value: string | undefined,
    allowed: T
): T[number] | null => {
    if (!value) return null
    return (allowed as readonly string[]).includes(value)
        ? (value as T[number])
        : null
}

const parseBoolean = (v?: string) => v !== 'false'
const parseArray = (v?: string) =>
    v ? v.split('|').map(s => s.trim()) : null

export default function LandmarkCsvImport() {
    const { toast } = useToast()

    const handleImport = async (file: File) => {
        const text = await file.text()
        const [header, ...rows] = text.split('\n')

        const keys = header.split(',').map(h => h.trim())

        const records: TablesInsert<'landmarks'>[] = rows
            .filter(Boolean)
            .map((row) => {
                const values = row.split(',')

                const raw = Object.fromEntries(
                    keys.map((k, i) => [k, values[i]?.trim()])
                )

                return {
                    name: raw.name!,
                    lat: Number(raw.lat),
                    lng: Number(raw.lng),

                    type: parseEnum(raw.type, LANDMARK_TYPES)!, // required
                    direction: parseEnum(raw.direction, DIRECTIONS),

                    description: raw.description || null,
                    timings: raw.timings || null,
                    facilities: parseArray(raw.facilities),

                    animation_type: parseEnum(raw.animation_type, ANIMATIONS)!, // required
                    is_active: parseBoolean(raw.is_active),
                }
            })

        const { error } = await supabase
            .from('landmarks')
            .insert(records)

        if (error) {
            toast({ variant: 'destructive', title: error.message })
            return
        }

        toast({ title: 'Landmarks imported successfully' })
    }


    return (
        <input
            type="file"
            accept=".csv"
            onChange={(e) => e.target.files && handleImport(e.target.files[0])}
        />
    )
}
