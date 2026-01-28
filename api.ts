
import { GAS_WEB_APP_URL } from './constants';
import { Bookmark, GASResponse } from './types';

export const gasApi = {
  async getEntries(): Promise<Bookmark[]> {
    if (!GAS_WEB_APP_URL) return JSON.parse(localStorage.getItem('bookmarks') || '[]');
    try {
      const response = await fetch(`${GAS_WEB_APP_URL}?action=getEntries`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      return JSON.parse(localStorage.getItem('bookmarks') || '[]');
    }
  },

  async addEntry(entry: Bookmark): Promise<GASResponse> {
    return this.postToGas('addEntry', entry);
  },

  async updateEntry(entry: Bookmark): Promise<GASResponse> {
    return this.postToGas('updateEntry', entry);
  },

  async deleteEntry(id: string): Promise<GASResponse> {
    return this.postToGas('deleteEntry', { id });
  },

  async postToGas(action: string, data: any): Promise<GASResponse> {
    if (!GAS_WEB_APP_URL) {
      // 로컬 스토리지 모드 로직 (생략 가능하나 유지를 위해 남김)
      return { success: true };
    }
    try {
      await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, data }),
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: String(error) };
    }
  }
};
