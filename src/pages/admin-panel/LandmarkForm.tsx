import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  landmarkFormSchema,
  LandmarkFormValues,
  landmarkTypeEnum,
  directionEnum,
  animationEnum,
  iconSizeEnum,
} from '@/schemas/landmark.schema'

import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Sparkles, ImageIcon, Upload, X, Loader2 } from 'lucide-react'

interface Props {
  defaultValues?: Partial<LandmarkFormValues>
  onSubmit: (data: LandmarkFormValues) => Promise<void>
  loading?: boolean
}

export default function LandmarkForm({
  defaultValues,
  onSubmit,
  loading,
}: Props) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const form = useForm<LandmarkFormValues>({
    resolver: zodResolver(landmarkFormSchema),
    defaultValues: {
      animation_type: 'glow',
      is_active: true,
      is_ashta_lingam: false,
      enable_glow: true,
      enable_aura_pulse: true,
      enable_snake_animation: false,
      premium_glow: false,
      icon_size: 'medium',
      glow_color: '#FFDFA3',
      aura_color: '#FFF2CC',
      ...defaultValues,
    },
  })

  const type = form.watch('type')
  const isAshtaLingam = form.watch('is_ashta_lingam')
  const imageUrl = form.watch('image_url')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Please select an image file (JPG, PNG, WebP)' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Image must be smaller than 5 MB' })
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const filePath = `landmarks/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('landmark-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('landmark-images')
        .getPublicUrl(filePath)

      form.setValue('image_url', urlData.publicUrl, { shouldDirty: true })
      toast({ title: 'Photo uploaded successfully' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Upload failed', description: err.message })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = async () => {
    const current = form.getValues('image_url')
    if (current) {
      const path = current.split('/landmark-images/')[1]
      if (path) {
        await supabase.storage.from('landmark-images').remove([path])
      }
    }
    form.setValue('image_url', undefined, { shouldDirty: true })
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
    >
      <Input placeholder="Landmark name" {...form.register('name')} />

      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          step="any"
          placeholder="Latitude"
          {...form.register('lat', { valueAsNumber: true })}
        />
        <Input
          type="number"
          step="any"
          placeholder="Longitude"
          {...form.register('lng', { valueAsNumber: true })}
        />
      </div>

      <Select
        value={type}
        onValueChange={(v) => form.setValue('type', v as any)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Landmark type" />
        </SelectTrigger>
        <SelectContent>
          {landmarkTypeEnum.options.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {type === 'temple' && (
        <Select
          value={form.watch('direction')}
          onValueChange={(v) => form.setValue('direction', v as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Direction (Temple only)" />
          </SelectTrigger>
          <SelectContent>
            {directionEnum.options.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Input placeholder="Timings (optional)" {...form.register('timings')} />
      <Input placeholder="Description (optional)" {...form.register('description')} />

      {/* ── Marker Photo Upload ────────────────────────────────────── */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5 text-sm font-medium">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          Marker Photo
        </Label>

        {imageUrl ? (
          /* Preview with remove button */
          <div className="flex items-start gap-3">
            <div className="relative w-16 h-20 rounded-xl overflow-hidden border-2 border-white shadow-md bg-gray-100 flex-shrink-0">
              <img
                src={imageUrl}
                alt="marker preview"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-xs text-muted-foreground">
                This photo will appear as the map marker
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                  Replace
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Upload dropzone */
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center gap-2 text-center hover:border-orange-300 hover:bg-orange-50/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
                <span className="text-sm font-medium text-orange-500">Uploading…</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-orange-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">Click to upload photo</span>
                <span className="text-xs text-muted-foreground">JPG, PNG or WebP · max 5 MB</span>
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      <Select
        value={form.watch('animation_type')}
        onValueChange={(v) => form.setValue('animation_type', v as any)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Animation" />
        </SelectTrigger>
        <SelectContent>
          {animationEnum.options.map((a) => (
            <SelectItem key={a} value={a}>
              {a}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Aṣṭa Lingam Section - Only visible for temples */}
      {type === 'temple' && (
        <>
          <Separator className="my-4" />

          <div className="space-y-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold text-sm">Aṣṭa Lingam Settings</span>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_ashta_lingam" className="text-sm">
                Mark as Aṣṭa Lingam
              </Label>
              <Switch
                id="is_ashta_lingam"
                checked={isAshtaLingam}
                onCheckedChange={(checked) => form.setValue('is_ashta_lingam', checked)}
              />
            </div>

            {isAshtaLingam && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Icon Size</Label>
                  <Select
                    value={form.watch('icon_size')}
                    onValueChange={(v) => form.setValue('icon_size', v as any)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconSizeEnum.options.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enable_glow" className="text-sm">
                    Enable Glow Effect
                  </Label>
                  <Switch
                    id="enable_glow"
                    checked={form.watch('enable_glow')}
                    onCheckedChange={(checked) => form.setValue('enable_glow', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enable_aura_pulse" className="text-sm">
                    Enable Pulse Animation
                  </Label>
                  <Switch
                    id="enable_aura_pulse"
                    checked={form.watch('enable_aura_pulse')}
                    onCheckedChange={(checked) => form.setValue('enable_aura_pulse', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="premium_glow" className="text-sm">
                    Premium Glow (Golden)
                  </Label>
                  <Switch
                    id="premium_glow"
                    checked={form.watch('premium_glow')}
                    onCheckedChange={(checked) => form.setValue('premium_glow', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enable_snake_animation" className="text-sm">
                    Enable Snake Animation
                  </Label>
                  <Switch
                    id="enable_snake_animation"
                    checked={form.watch('enable_snake_animation')}
                    onCheckedChange={(checked) => form.setValue('enable_snake_animation', checked)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Glow Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="w-10 h-8 p-0.5 cursor-pointer"
                        value={form.watch('glow_color') || '#FFDFA3'}
                        onChange={(e) => form.setValue('glow_color', e.target.value)}
                      />
                      <Input
                        className="h-8 text-xs"
                        value={form.watch('glow_color') || '#FFDFA3'}
                        onChange={(e) => form.setValue('glow_color', e.target.value)}
                        placeholder="#FFDFA3"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Aura Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="w-10 h-8 p-0.5 cursor-pointer"
                        value={form.watch('aura_color') || '#FFF2CC'}
                        onChange={(e) => form.setValue('aura_color', e.target.value)}
                      />
                      <Input
                        className="h-8 text-xs"
                        value={form.watch('aura_color') || '#FFF2CC'}
                        onChange={(e) => form.setValue('aura_color', e.target.value)}
                        placeholder="#FFF2CC"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <Button type="submit" disabled={loading || uploading} className="w-full">
        {loading ? 'Saving…' : 'Save Landmark'}
      </Button>
    </form>
  )
}
