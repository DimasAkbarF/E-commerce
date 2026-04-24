import { supabase } from './supabase';

const BUCKET_NAME = 'product-images';

// Upload image to Supabase Storage
export async function uploadImage(
  file: File,
  productId: string
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Upload file
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw new Error('Failed to upload image');
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  if (!publicUrlData.publicUrl) {
    throw new Error('Failed to get public URL for uploaded image');
  }

  return publicUrlData.publicUrl;
}

// Delete image from storage
export async function deleteImage(imageUrl: string): Promise<void> {
  // Extract file path from URL
  const urlParts = imageUrl.split('/');
  const filePath = urlParts[urlParts.length - 1];

  if (!filePath) {
    console.warn('Could not extract file path from URL:', imageUrl);
    return;
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
    // Don't throw - product can still be deleted even if image deletion fails
  }
}
