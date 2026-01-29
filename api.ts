
import { GAS_WEB_APP_URL } from './constants';
import { Bookmark, GASResponse, Category } from './types';

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

  async getCategories(): Promise<Category[]> {
    if (!GAS_WEB_APP_URL) return [];
    try {
      const response = await fetch(`${GAS_WEB_APP_URL}?action=getCategories`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      return [];
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

  async addCategory(category: Category): Promise<GASResponse> {
    return this.postToGas('addCategory', { category });
  },

  async postToGas(action: string, data: any): Promise<GASResponse> {
    if (!GAS_WEB_APP_URL) {
      return { success: true };
    }
    try {
      // GAS requires text/plain for POST with no-cors or specialized proxy handling
      // We'll use a standard fetch but handle the no-cors limitation in a real env by checking result separately or using a better proxy
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
