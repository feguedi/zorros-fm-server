exports.customRegex = function (str) {
  const preRegex = new Set();

  const vocales = ['a', 'e', 'i', 'o', 'u', 'n'];
  const vocalesAcentos = ['á', 'é', 'í', 'ó', 'ú', 'ñ'];
  const arrayChars = String(str).split('');

  arrayChars.forEach((caracter, index) => {
    const charLowerIndex = vocales.lastIndexOf(caracter);
    const replaced = arrayChars.map((c, i) => (charLowerIndex >= 0 && i === index ? vocalesAcentos[charLowerIndex] : c));
    preRegex.add(replaced.join(''));
  });

  return [...preRegex].join('|');
};
