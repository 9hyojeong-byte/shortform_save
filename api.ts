
import { GAS_WEB_APP_URL } from './constants';
import { Bookmark, GASResponse } from './types';

/**
 * 구글 앱스 스크립트와 통신하는 통합 서비스
 */
export const gasApi = {
  /**
   * 모든 북마크 데이터 가져오기
   */
  async getEntries(): Promise<Bookmark[]> {
    // Fix: Access 'google' global via window to prevent TypeScript "Cannot find name" errors.
    const google = (window as any).google;
    // 1. GAS 환경 내부일 때
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((data: Bookmark[]) => resolve(data))
          .withFailureHandler((err: any) => reject(err))
          .getEntries();
      });
    }

    // 2. 외부 환경(로컬 테스트 등)일 때
    if (!GAS_WEB_APP_URL) {
      console.warn('GAS_WEB_APP_URL이 설정되지 않았습니다. Mock 데이터를 사용합니다.');
      return JSON.parse(localStorage.getItem('bookmarks') || '[]');
    }

    try {
      const response = await fetch(`${GAS_WEB_APP_URL}?action=getEntries`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('API Fetch Error:', error);
      return [];
    }
  },

  /**
   * 새 북마크 추가
   */
  async addEntry(entry: Bookmark): Promise<GASResponse> {
    // Fix: Access 'google' global via window to prevent TypeScript "Cannot find name" errors.
    const google = (window as any).google;
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((res: GASResponse) => resolve(res))
          .withFailureHandler((err: any) => reject(err))
          .addEntry(entry);
      });
    }

    if (!GAS_WEB_APP_URL) {
      const current = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      localStorage.setItem('bookmarks', JSON.stringify([entry, ...current]));
      return { success: true };
    }

    try {
      const response = await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', // GAS의 특성상 no-cors가 필요할 수 있음
        body: JSON.stringify({ action: 'addEntry', data: entry }),
        headers: { 'Content-Type': 'application/json' }
      });
      return { success: true }; // no-cors인 경우 응답을 읽을 수 없으므로 성공 가정
    } catch (error) {
      return { success: false, message: String(error) };
    }
  }
};
