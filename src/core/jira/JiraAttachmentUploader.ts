import { readFileSync, statSync, existsSync } from 'fs';
import { basename, extname } from 'path';
import { JiraApiClient } from './JiraApiClient.js';

export interface AttachmentResult {
  label?: string;
  attachmentId: string;
  filename: string;
  contentUrl: string;
  status: 'uploaded' | 'failed';
  error?: string;
}

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
};

/**
 * Sube archivos (screenshots, videos) a un ticket Jira via REST API v3.
 * Soporta .png, .jpg, .jpeg, .gif, .webp y .mp4.
 * Nunca lanza excepciones — retorna `status: 'failed'` con mensaje de error en caso de fallo.
 * Límite de tamaño configurable via env var JIRA_ATTACHMENT_MAX_MB (default: 10MB).
 */
export class JiraAttachmentUploader {
  private client: JiraApiClient;
  private maxBytes: number;

  constructor() {
    this.client = new JiraApiClient();
    const maxMb = parseInt(process.env.JIRA_ATTACHMENT_MAX_MB ?? '10', 10);
    this.maxBytes = maxMb * 1024 * 1024;
  }

  /**
   * Sube un archivo a los attachments de un ticket Jira.
   * Valida existencia del archivo, tipo MIME soportado y límite de tamaño antes de subir.
   * @param issueKey - Clave del ticket Jira (ej. `NAA-4429`)
   * @param filePath - Ruta absoluta o relativa al archivo a subir
   * @param label - Etiqueta descriptiva opcional (ej. `Screenshot_Login`)
   * @returns AttachmentResult con status `uploaded` o `failed` y detalle del error si falló
   */
  async upload(issueKey: string, filePath: string, label?: string): Promise<AttachmentResult> {
    try {
      if (!existsSync(filePath)) {
        return { label, attachmentId: '', filename: basename(filePath), contentUrl: '', status: 'failed', error: 'Archivo no encontrado' };
      }
      const ext = extname(filePath).toLowerCase();
      const mime = MIME_MAP[ext];
      if (!mime) {
        return { label, attachmentId: '', filename: basename(filePath), contentUrl: '', status: 'failed', error: `Tipo no soportado: ${ext}` };
      }
      const stat = statSync(filePath);
      if (stat.size > this.maxBytes) {
        return { label, attachmentId: '', filename: basename(filePath), contentUrl: '', status: 'failed', error: `Archivo excede el límite de ${process.env.JIRA_ATTACHMENT_MAX_MB ?? 10}MB` };
      }
      const fileBuffer = readFileSync(filePath);
      const blob = new Blob([fileBuffer], { type: mime });
      const form = new FormData();
      form.append('file', blob, basename(filePath));

      const result = await this.client.postFormData<Array<{ id: string; filename: string; content: string }>>(
        `/rest/api/3/issue/${issueKey}/attachments`,
        form
      );
      const uploaded = result[0];
      return {
        label,
        attachmentId: uploaded.id,
        filename: uploaded.filename,
        contentUrl: uploaded.content,
        status: 'uploaded',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { label, attachmentId: '', filename: basename(filePath), contentUrl: '', status: 'failed', error: message };
    }
  }

  /**
   * Sube múltiples archivos a los attachments de un ticket Jira en paralelo.
   * Cada upload es independiente — el fallo de uno no cancela los demás.
   * @param issueKey - Clave del ticket Jira (ej. `NAA-4429`)
   * @param files - Lista de archivos con `path` y `label` opcional
   * @returns Array de AttachmentResult en el mismo orden que `files`
   */
  async uploadMany(
    issueKey: string,
    files: Array<{ path: string; label?: string }>
  ): Promise<AttachmentResult[]> {
    return Promise.all(files.map((f) => this.upload(issueKey, f.path, f.label)));
  }
}
