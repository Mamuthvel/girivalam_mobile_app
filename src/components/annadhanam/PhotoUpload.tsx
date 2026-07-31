import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, Loader2 } from "lucide-react";

interface Props {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
  bucket?: string;
  folder?: string;
}

/** Reusable multi-photo uploader for the annadhanam-photos bucket (private). */
export default function PhotoUpload({
  photos,
  onChange,
  max = 5,
  bucket = "annadhanam-photos",
  folder = "listings",
}: Props) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(0, max - photos.length)) {
        if (file.size > 5 * 1024 * 1024) {
          toast({ title: `${file.name} is over 5MB`, variant: "destructive" });
          continue;
        }
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${folder}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
        if (error) throw error;
        const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 365);
        if (data?.signedUrl) uploaded.push(data.signedUrl);
      }
      onChange([...photos, ...uploaded]);
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const remove = (idx: number) => onChange(photos.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {photos.map((p, i) => (
          <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border">
            <img src={p} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5"
              aria-label="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {photos.length < max && (
          <label className="w-20 h-20 rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="h-5 w-5 text-muted-foreground" />
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => upload(e.target.files)}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Up to {max} photos, 5MB each. {photos.length}/{max} uploaded.
      </p>
    </div>
  );
}
