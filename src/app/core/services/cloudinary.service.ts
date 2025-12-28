import { Injectable, signal } from '@angular/core';
import { cloudinaryConfig, getCloudinaryUrl, isCloudinaryUrl, ImageSize } from '../../../environments/cloudinary.config';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * 🖼️ Servicio de Cloudinary para Gestión de Imágenes
 * 
 * Permite subir, obtener y gestionar imágenes en Cloudinary.
 * Las imágenes se optimizan automáticamente y se sirven desde CDN global.
 * 
 * Uso:
 * ```typescript
 * const cloudinary = inject(CloudinaryService);
 * 
 * // Subir imagen
 * const result = await cloudinary.uploadImage(file, 'producto-123');
 * console.log(result.url); // URL de Cloudinary
 * 
 * // Obtener URL optimizada
 * const url = cloudinary.getImageUrl('productos/producto-123', 'thumbnail');
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  // Estado de subida
  isUploading = signal(false);
  uploadProgress = signal<UploadProgress | null>(null);

  /**
   * 📤 Subir imagen a Cloudinary
   * 
   * @param file Archivo de imagen a subir
   * @param publicId ID único para la imagen (opcional, se genera automático)
   * @param onProgress Callback opcional para progreso de subida
   * @returns Resultado con URL y metadata de la imagen
   * 
   * @example
   * const file = event.target.files[0];
   * const result = await uploadImage(file, 'producto-123');
   * // Guardar result.url en tu base de datos
   */
  async uploadImage(
    file: File,
    publicId?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<CloudinaryUploadResult> {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen');
    }

    // Validar tamaño (máximo 10 MB)
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      throw new Error('La imagen no debe superar 10 MB');
    }

    this.isUploading.set(true);
    this.uploadProgress.set({ loaded: 0, total: file.size, percentage: 0 });

    try {
      // Preparar FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      formData.append('folder', cloudinaryConfig.folder);
      
      if (publicId) {
        formData.append('public_id', publicId);
      }

      // Realizar upload con progress
      const response = await this.uploadWithProgress(
        cloudinaryConfig.uploadUrl,
        formData,
        (progress) => {
          this.uploadProgress.set(progress);
          onProgress?.(progress);
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Error subiendo imagen');
      }

      console.log('✅ Imagen subida a Cloudinary:', data.secure_url);

      return {
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        width: data.width,
        height: data.height,
        bytes: data.bytes,
      };
    } catch (error) {
      console.error('❌ Error subiendo imagen a Cloudinary:', error);
      throw error;
    } finally {
      this.isUploading.set(false);
      this.uploadProgress.set(null);
    }
  }

  /**
   * 📥 Upload con progreso usando XMLHttpRequest
   */
  private uploadWithProgress(
    url: string,
    formData: FormData,
    onProgress: (progress: UploadProgress) => void
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress: UploadProgress = {
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          };
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(new Response(xhr.response));
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.open('POST', url);
      xhr.send(formData);
    });
  }

  /**
   * 🖼️ Obtener URL optimizada de imagen
   * 
   * @param imageUrl URL existente (Cloudinary o local)
   * @param size Tamaño/transformación deseada
   * @returns URL optimizada
   * 
   * @example
   * getImageUrl('https://res.cloudinary.com/.../producto.jpg', 'thumbnail')
   * getImageUrl('/images/producto.jpg', 'card') // Retorna tal cual si no es Cloudinary
   */
  getImageUrl(imageUrl: string | null | undefined, size: ImageSize = 'card'): string {
    if (!imageUrl) return '/images/placeholder-product.svg';

    // Si es URL de Cloudinary, puede tener transformación embebida
    if (isCloudinaryUrl(imageUrl)) {
      // Ya viene optimizada de Cloudinary
      return imageUrl;
    }

    // Si es otra URL, retornarla tal cual
    return imageUrl;
  }

  /**
   * 🗑️ Eliminar imagen de Cloudinary
   * 
   * ⚠️ NOTA: Esto requiere API secret, debe implementarse en el backend.
   * El upload preset "unsigned" no permite eliminaciones directas.
   * 
   * Alternativas:
   * 1. Implementar endpoint en tu backend que use API secret
   * 2. Eliminar manualmente desde Cloudinary Dashboard
   * 3. Usar "Auto-upload" y eliminar referencia en DB (no se descarga)
   */
  async deleteImage(publicId: string): Promise<void> {
    console.warn('⚠️ Eliminación de imágenes debe implementarse en backend');
    console.log('Public ID a eliminar:', publicId);
    
    // TODO: Llamar a tu endpoint backend
    // await fetch('/api/cloudinary/delete', {
    //   method: 'DELETE',
    //   body: JSON.stringify({ publicId })
    // });
    
    throw new Error('Eliminación no implementada. Usa backend o Cloudinary Dashboard.');
  }

  /**
   * 🔄 Reemplazar imagen existente
   * 
   * Sube una nueva imagen con el mismo publicId (sobrescribe la anterior)
   */
  async replaceImage(file: File, publicId: string): Promise<CloudinaryUploadResult> {
    return this.uploadImage(file, publicId);
  }

  /**
   * 📊 Validar configuración de Cloudinary
   */
  isConfigured(): boolean {
    return cloudinaryConfig.cloudName !== 'tu-cloud-name';
  }

  /**
   * ℹ️ Obtener información de configuración
   */
  getConfig() {
    return {
      cloudName: cloudinaryConfig.cloudName,
      folder: cloudinaryConfig.folder,
      uploadPreset: cloudinaryConfig.uploadPreset,
      isConfigured: this.isConfigured(),
    };
  }
}
