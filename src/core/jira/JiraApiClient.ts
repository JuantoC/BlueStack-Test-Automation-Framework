import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Cliente HTTP base para la Jira REST API v3.
 * Lee credenciales desde variables de entorno: JIRA_BASE_URL, JIRA_USER_EMAIL, JIRA_API_TOKEN.
 * Provee métodos para requests JSON y multipart (attachments).
 */
export class JiraApiClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.JIRA_BASE_URL!;
    const email = process.env.JIRA_USER_EMAIL!;
    const token = process.env.JIRA_API_TOKEN!;
    const auth = Buffer.from(`${email}:${token}`).toString('base64');

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Ejecuta un POST JSON autenticado a la Jira REST API.
   * @param url - Ruta relativa a JIRA_BASE_URL (ej. `/rest/api/3/issue`)
   * @param data - Payload JSON del request
   * @returns Respuesta parseada tipada como T
   */
  async post<T>(url: string, data: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  /**
   * Ejecuta un POST multipart/form-data autenticado a la Jira REST API.
   * Agrega el header `X-Atlassian-Token: no-check` obligatorio para uploads de attachments.
   * @param url - Ruta relativa a JIRA_BASE_URL
   * @param form - FormData con el archivo a subir
   * @returns Respuesta parseada tipada como T
   */
  async postFormData<T>(url: string, form: FormData): Promise<T> {
    const response = await this.client.post<T>(url, form, {
      headers: {
        'X-Atlassian-Token': 'no-check',
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}
