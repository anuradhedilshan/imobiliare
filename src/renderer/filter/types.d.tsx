export enum Tranzactie {
  Devânzare = 1,
  Deînchiriat = 2,
}

export enum Proprietate {
  apartment = 1,
  commercial = 2,
  house = 3,
  terrain = 4,
}

export type LocationType = {
  nume: string;
  id: string | number;
  id_judet: number | string;
  nume_judet: string;
  id_localitate: number;
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
