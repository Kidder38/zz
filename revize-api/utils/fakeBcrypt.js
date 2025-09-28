/**
 * Jednoduchá implementace fake bcrypt pro účely demonstrace
 * POZNÁMKA: Toto není bezpečné a je určeno pouze pro demonstrační účely!
 * V produkčním prostředí použijte skutečný bcrypt modul
 */

// Jednoduché hashování založené na base64
const hashPassword = (password, rounds = 10) => {
  // Simulace saltu
  const salt = `$2b$${rounds}$${Math.random().toString(36).substring(2, 15)}`;
  
  // Pro demonstraci použijeme jednoduché "hashování" pomocí Base64 + salt
  const hash = Buffer.from(`${salt}${password}`).toString('base64');
  
  // Formát podobný bcrypt hashy
  return `${salt}${hash}`;
};

// Jednoduché porovnání
const comparePassword = (plainPassword, hashedPassword) => {
  // Extrakt saltu (prvních 20-30 znaků)
  const salt = hashedPassword.substring(0, hashedPassword.indexOf('$', 10) + 12);
  
  // Vytvoření porovnávacího hashe
  const compareHash = Buffer.from(`${salt}${plainPassword}`).toString('base64');
  
  // Porovnání s oříznutím saltu
  const originalHash = hashedPassword.substring(salt.length);
  
  return compareHash === originalHash;
};

module.exports = {
  hash: hashPassword,
  compare: comparePassword,
  // Simulace, jako by to byl opravdový bcrypt
  hashSync: hashPassword,
  compareSync: comparePassword
};