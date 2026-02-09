import writtenNumber from 'written-number';

export type CodigoMoneda = 'PEN' | 'USD';

interface InfoMoneda {
  singular: string;
  plural: string;
}

export const useFormatoFinanciero = () => {
  const MONEDAS: Record<CodigoMoneda, InfoMoneda> = {
    PEN: { singular: 'SOL', plural: 'SOLES' },
    USD: { singular: 'DÓLAR AMERICANO', plural: 'DÓLARES AMERICANOS' }
  };

  const convertirANarrativa = (
    valor: number | string | undefined | null,
    codigoMoneda: CodigoMoneda = 'PEN'
  ): string => {
    if (valor === undefined || valor === null || valor === '') return "";

    const moneda = MONEDAS[codigoMoneda] || MONEDAS.PEN;
    const numeroLimpio = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;

    if (isNaN(numeroLimpio)) return "MONTO INVÁLIDO";
    if (numeroLimpio === 0) return `CERO CON 00/100 ${moneda.plural}`;

    const valorAbsoluto = Math.abs(numeroLimpio);
    const parteEntera = Math.floor(valorAbsoluto);
    const parteDecimal = Math.round((valorAbsoluto - parteEntera) * 100);

    // Ejecución segura de la librería
    let textoEntero = "";
    try {
      // Intentamos obtener la función ya sea por default o directa
      const wn = (writtenNumber as any).default || writtenNumber;
      textoEntero = wn(parteEntera, { lang: 'es' });
    } catch (e) {
      console.error("Error en written-number:", e);
      return "ERROR DE CONVERSIÓN";
    }

    /**
     * Ajustes para estándares peruanos:
     * written-number devuelve "uno" para el 1, pero en moneda se usa "un".
     */
    if (parteEntera === 1) {
      textoEntero = "un";
    } else if (textoEntero.endsWith('uno')) {
      // Para casos como veintiuno -> veintiún
      textoEntero = textoEntero.slice(0, -3) + 'ún';
    } else if (parteEntera === 1000000) {
      textoEntero = "un millón";
    }

    const centavosFormateados = parteDecimal.toString().padStart(2, '0');
    const etiquetaMoneda = parteEntera === 1 ? moneda.singular : moneda.plural;

    return `${textoEntero} con ${centavosFormateados}/100 ${etiquetaMoneda}`.toUpperCase();
  };

  return { convertirANarrativa };
};

//ejemplo:
// function Facturador({ num, mon }: { num: number; mon: CodigoMoneda }) {
//   const [monto, setMonto] = useState<number>(num);
//   const [moneda, setMoneda] = useState<CodigoMoneda>(mon);
//   const { convertirANarrativa } = useFormatoFinanciero();

//   const handleMontoChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setMonto(parseFloat(e.target.value) || 0);
//   };

//   const handleMonedaChange = (e: ChangeEvent<HTMLSelectElement>) => {
//     setMoneda(e.target.value as CodigoMoneda);
//   };

//   return (
//     <div>
//       <input type="number" step="0.01" onChange={handleMontoChange} />
//       <select value={moneda} onChange={handleMonedaChange}>
//         <option value="PEN">Soles</option>
//         <option value="USD">Dólares</option>
//       </select>
//       <p>
//         <strong>SON:</strong>{" "}
//         {monto > 0
//           ? convertirANarrativa(monto, moneda)
//           : "CERO CON 00/100 " +
//             (moneda === "PEN" ? "SOLES" : "DÓLARES AMERICANOS")}
//       </p>{" "}
//     </div>
//   );
// }
