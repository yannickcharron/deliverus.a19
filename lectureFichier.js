const fs = require('fs');

// let content = fs.readFileSync('monFichier.txt', 'utf-8');
// console.log(`Voici le contenu du fichier: ${content}`); 

fs.readFile('monFichier.txt', 'utf-8', (err, content) => {
    console.log(`Voici le contenu du fichier: ${content}`);
});

console.log('J\'ai terminé');
