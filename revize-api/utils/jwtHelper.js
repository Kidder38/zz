/**
 * Jednoduchá implementace JWT helper pro práci s tokeny
 * POZNÁMKA: Toto je zjednodušená implementace určená pouze pro demonstrační účely!
 */

// Velmi jednoduchá implementace JSON Web Token
const sign = (payload, secret, options = {}) => {
  // Vytvoření hlavičky (Base64 encoded)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  // Vytvoření payloadu (Base64 encoded)
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  // Velmi jednoduchý podpis (v produkci by to bylo HMAC-SHA256)
  const signature = Buffer.from(`${header}.${encodedPayload}.${secret}`).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  // Sestavení JWT tokenu
  return `${header}.${encodedPayload}.${signature}`;
};

// Velmi jednoduché ověření a dekódování tokenu
const verify = (token, secret) => {
  try {
    // Rozdělení na části
    const [header, payload, signature] = token.split('.');
    
    // Ověření podpisu (velmi zjednodušené)
    const expectedSignature = Buffer.from(`${header}.${payload}.${secret}`).toString('base64')
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }
    
    // Dekódování payloadu
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    
    // Kontrola expirace, pokud je nastavena
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }
    
    return decodedPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  sign,
  verify
};