export enum Tranzactie {
  Devânzare = 1,
  Deînchiriat = 2,
}

export enum Proprietate {
  apartment = 1,
  commercial = 5,
  house_vile = 2,
  terrain = 4,
}

export enum Subcategorie {
  All = 9999,
  Birouri = 201,
  HoteluriPensiuni = 204,
  SpatiiComerciale = 202,
  TerenuriInvestitii = 210,
  SpatiiIndustriale = 203,
  ProprietatiSpeciale = 211,
}
export type CB = (
  Type: 'progress' | 'count' | 'complete' | 'error' | 'details' | 'warn',
  message: number | boolean | string | null,
) => void;
