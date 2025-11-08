export const valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const tipos = ["C", "D", "H", "S"];

export const crearMazo = () => {
  const mazo: string[] = [];
  for (let i = 0; i < tipos.length; i++) {
    for (let j = 0; j < valores.length; j++) {
      mazo.push(valores[j] + "-" + tipos[i]);
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
