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

export type LocationType = {
  nume: string;
  id: string | number;
  id_judet: number | string;
  nume_judet: string;
  id_localitate: number | string;
  nume_localitate: string;
  tip: number;
  id_zona: string | number;
};

export enum Subcategorie {
  All = 9999,
  Birouri = 201,
  HoteluriPensiuni = 204,
  SpatiiComerciale = 202,
  TerenuriInvestitii = 210,
  SpatiiIndustriale = 203,
  ProprietatiSpeciale = 211,
}

export type filterDataType = {
  localitate: LocationType;
  zone: string | null;
  proprietate: Proprietate;
  tranzactie: Tranzactie;
  subcategorie: Subcategorie;
};
