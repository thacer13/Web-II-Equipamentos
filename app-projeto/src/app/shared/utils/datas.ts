// Conversões entre o Date usado pelo p-datepicker e a string 'yyyy-MM-dd'
// usada nos modelos e nas comparações de período.

export function hoje(): Date {
  const data = new Date();
  data.setHours(0, 0, 0, 0);
  return data;
}

export function paraIso(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function deIso(iso: string): Date | null {
  const [ano, mes, dia] = iso.split('-').map(Number);
  if (!ano || !mes || !dia) {
    return null;
  }
  return new Date(ano, mes - 1, dia);
}
