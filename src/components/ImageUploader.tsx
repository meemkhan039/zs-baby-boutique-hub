import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { ProductImage } from "@/lib/catalog";

type Props = {
  productId: string;
  images: ProductImage[];
  onChange: () => void;
};

export function ImageUploader({ productId, images, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    setBusy(true);
    try {
      let order = images.length;
      for (const file of list) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 10MB`);
          continue;
        }
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${productId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;

        const { data: signed } = await supabase.storage
          .from("product-images")
          .createSignedUrl(path, 60 * 60 * 24 * 7);

        const { error: rowErr } = await supabase.from("product_images").insert({
          product_id: productId,
          storage_path: path,
          url: signed?.signedUrl ?? "",
          sort_order: order++,
        });
        if (rowErr) throw rowErr;
      }
      toast.success("Photos uploaded · ছবি আপলোড হয়েছে");
      onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(img: ProductImage) {
    setBusy(true);
    try {
      if (img.storage_path)
        await supabase.storage.from("product-images").remove([img.storage_path]);
      const { error } = await supabase.from("product_images").delete().eq("id", img.id);
      if (error) throw error;
      onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete photo");
    } finally {
      setBusy(false);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const a = images[index]!;
    const b = images[target]!;
    setBusy(true);
    try {
      await Promise.all([
        supabase.from("product_images").update({ sort_order: target }).eq("id", a.id),
        supabase.from("product_images").update({ sort_order: index }).eq("id", b.id),
      ]);
      onChange();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void upload(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          dragging ? "border-primary bg-secondary" : "border-border hover:border-primary"
        }`}
      >
        {busy ? (
          <Loader2 className="size-7 animate-spin text-primary" />
        ) : (
          <ImagePlus className="size-7 text-primary" />
        )}
        <p className="mt-2 text-sm font-medium">Drag & drop photos, or click to choose files</p>
        <p className="text-xs text-muted-foreground">
          ছবি টেনে আনুন অথবা ক্লিক করে বাছাই করুন (JPG / PNG, সর্বোচ্চ ১০MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && void upload(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img, i) => (
            <div key={img.id} className="overflow-hidden rounded-xl border border-border">
              <img src={img.url} alt="" className="aspect-square w-full object-cover" />
              <div className="flex items-center justify-between bg-card p-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={busy || i === 0}
                  onClick={() => void move(i, -1)}
                  aria-label="Move left"
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={busy || i === images.length - 1}
                  onClick={() => void move(i, 1)}
                  aria-label="Move right"
                >
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => void remove(img)}
                  aria-label="Delete photo"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
