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

export type filterDataType = {
  localitate: LocationType;
  zone: string | null;
  proprietate: Proprietate;
  tranzactie: Tranzactie;
};
