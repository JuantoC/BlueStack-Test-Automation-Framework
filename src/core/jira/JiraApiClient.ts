import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

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

  async post<T>(url: string, data: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

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
