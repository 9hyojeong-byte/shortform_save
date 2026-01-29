
import { Category } from './types';

export const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyUkJT6sN7oCr8-M8cMD4zx_a6UlrHacg16koIoA-YColKccO9a3TSQDCc7yTEKV8GAXw/exec'; 

export const CATEGORIES: Category[] = [
  '전체',
  '프리다이빙',
  '여행',
  '우정릴스',
  '인증샷',
  '귀여움',
  '캠핑팁',
  '바다',
  '튜토리얼',
  'bgm',
  '인생샷'
];

export const CATEGORY_COLORS: Record<string, string> = {
  '전체': 'bg-slate-100 text-slate-700 border-slate-200',
  '프리다이빙': 'bg-blue-100 text-blue-700 border-blue-200',
  '여행': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '우정릴스': 'bg-purple-100 text-purple-700 border-purple-200',
  '인증샷': 'bg-orange-100 text-orange-700 border-orange-200',
  '귀여움': 'bg-pink-100 text-pink-700 border-pink-200',
  '캠핑팁': 'bg-amber-100 text-amber-700 border-amber-200',
  '바다': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  '튜토리얼': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bgm': 'bg-rose-100 text-rose-700 border-rose-200',
  '인생샷': 'bg-violet-100 text-violet-700 border-violet-200'
};
