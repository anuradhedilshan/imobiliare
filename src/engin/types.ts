export enum Tranzactie {
  Devânzare = 1,
  Deînchiriat = 2,
}

export enum Proprietate {
  apartment = 101,
  commercial = 202,
  house_vile = 102,
  terrain = 108,
}

export type CB = (
  Type: 'progress' | 'count' | 'complete' | 'error' | 'details' | 'warn',
  message: number | boolean | string | null,
) => void;
