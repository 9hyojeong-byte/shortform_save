
export type Category = '전체' | '프리다이빙' | '여행' | '우정릴스' | '인증샷' | '귀여움' | '캠핑팁';

export interface Bookmark {
  id: string; // 고유 ID (필수)
  date: string;
  url: string;
  thumbnail: string;
  memo: string;
  category: Category;
}

export interface GASResponse {
  success: boolean;
  message?: string;
  data?: any;
}
