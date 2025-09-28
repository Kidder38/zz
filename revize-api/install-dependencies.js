const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Definice závislostí, které potřebujeme nainstalovat
const dependencies = [
  'bcrypt',       // Pro hashování hesel
  'jsonwebtoken', // Pro práci s JWT tokeny
];

// Funkce pro kontrolu, zda je závislost již nainstalována
function isDependencyInstalled(dependency) {
  try {
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Kontrola v dependencies i devDependencies
    return (
      (packageJson.dependencies && packageJson.dependencies[dependency]) ||
      (packageJson.devDependencies && packageJson.devDependencies[dependency])
    );
  } catch (error) {
    console.error('Nepodařilo se přečíst package.json:', error.message);
    return false;
  }
}

// Funkce pro instalaci chybějících závislostí
function installMissingDependencies() {
  const missingDependencies = dependencies.filter(dep => !isDependencyInstalled(dep));
  
  if (missingDependencies.length === 0) {
    console.log('Všechny potřebné závislosti jsou již nainstalovány.');
    return;
  }
  
  console.log(`Instaluji chybějící závislosti: ${missingDependencies.join(', ')}`);
  
  try {
    execSync(`npm install ${missingDependencies.join(' ')}`, { 
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log('Instalace závislostí úspěšně dokončena.');
  } catch (error) {
    console.error('Chyba při instalaci závislostí:', error.message);
    process.exit(1);
  }
}

// Spuštění instalace
installMissingDependencies();