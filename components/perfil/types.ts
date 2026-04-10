export interface EmpresaData {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  regimenTributario: string;
  rubro: string;
  direccionFiscal: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

export interface EquipoData {
  planilla: string;
  honorarios: string;
  informales: string;
}

export interface WizardData {
  empresa: EmpresaData;
  equipo: EquipoData;
}

export const RUBRO_LABELS: Record<string, string> = {
  comercio: '🛒 Comercio',
  servicios: '🤝 Servicios',
  manufactura: '🏭 Manufactura',
  construccion: '🏗️ Construcción',
  transporte: '🚛 Transporte',
  restaurantes: '🍽️ Restaurantes',
  tecnologia: '💻 Tecnología',
  salud: '🏥 Salud',
  educacion: '📚 Educación',
  otro: '📦 Otro',
};
