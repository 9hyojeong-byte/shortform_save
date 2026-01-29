
export type Category = '전체' | '프리다이빙' | '여행' | '우정릴스' | '인증샷' | '귀여움' | '캠핑팁' | '바다' | '튜토리얼' | 'bgm' | '인생샷';

export interface Bookmark {
  id: string;
  date: string;
  url: string;
  thumbnail: string;
  memo: string;
  category: Category[]; // Changed to array for multi-selection
}

export interface GASResponse {
  success: boolean;
  message?: string;
  data?: any;
}
