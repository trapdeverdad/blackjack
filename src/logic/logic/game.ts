export const valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const tipos = ["C", "D", "H", "S"];

export const crearMazo = (decks: number = 6) => {
  // Crea un shoe con 'decks' barajas estándar
  const mazo: string[] = [];
  for (let d = 0; d < decks; d++) {
    for (let i = 0; i < tipos.length; i++) {
      for (let j = 0; j < valores.length; j++) {
        mazo.push(valores[j] + "-" + tipos[i]);
      }
    }
  }
  return mazo;
};

export const barajarMazo = (mazo: string[]) => {
  for (let i = 0; i < mazo.length; i++) {
    let j = Math.floor(Math.random() * mazo.length);
    let temp = mazo[i];
    mazo[i] = mazo[j];
    mazo[j] = temp;
  }
  return mazo;
};

export const obtenerValor = (carta: string) => {
  let data = carta.split("-");
  let valor = data[0];

  if (isNaN(parseInt(valor))) {
    if (valor === "A") {
      return 11;
    }
    return 10;
  }
  return parseInt(valor);
};

export const revisarAs = (carta: string) => {
  return carta[0] === "A" ? 1 : 0;
};

export const ajustarAs = (suma: number, conteoAs: number) => {
  while (suma > 21 && conteoAs > 0) {
    suma -= 10;
    conteoAs--;
  }
  return suma;
};

// Utilidades adicionales para reglas de Blackjack
// Determina si una carta es diez o figura (10, J, Q, K)
export const esDiezOCara = (carta: string) => {
  const valor = carta.split("-")[0];
  return valor === "10" || valor === "J" || valor === "Q" || valor === "K";
};

// Suma ajustada de una mano, considerando la conversión de As de 11 a 1 cuando sea necesario
export const sumaAjustada = (cartas: string[]) => {
  let suma = 0;
  let ases = 0;
  for (const c of cartas) {
    suma += obtenerValor(c);
    ases += revisarAs(c);
  }
  return ajustarAs(suma, ases);
};

// Indica si una mano es Blackjack natural (exactamente 2 cartas sumando 21)
export const esBlackjackNatural = (cartas: string[]) => {
  if (cartas.length !== 2) return false;
  return sumaAjustada(cartas) === 21;
};

// Nueva utilidad: ajusta suma y devuelve cuántos As siguen contando como 11 (soft)
export const ajustarSumaYAces = (suma: number, asesComo11: number) => {
  while (suma > 21 && asesComo11 > 0) {
    suma -= 10; // convertimos un As de 11 a 1
    asesComo11--;
  }
  return { suma, asesComo11 };
};
