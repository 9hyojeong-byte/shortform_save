
export type Category = string;

export interface Bookmark {
  id: string;
  date: string;
  url: string;
  thumbnail: string;
  memo: string;
  category: Category[];
}

export interface GASResponse {
  success: boolean;
  message?: string;
  data?: any;
}
