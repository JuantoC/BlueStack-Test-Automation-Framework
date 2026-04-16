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

export class JiraAttachmentUploader {
  private client: JiraApiClient;
  private maxBytes: number;

  constructor() {
    this.client = new JiraApiClient();
    const maxMb = parseInt(process.env.JIRA_ATTACHMENT_MAX_MB ?? '10', 10);
    this.maxBytes = maxMb * 1024 * 1024;
  }

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

  async uploadMany(
    issueKey: string,
    files: Array<{ path: string; label?: string }>
  ): Promise<AttachmentResult[]> {
    return Promise.all(files.map((f) => this.upload(issueKey, f.path, f.label)));
  }
}
