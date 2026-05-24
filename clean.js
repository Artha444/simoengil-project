const fs = require('fs');

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf-8');

    // Generic property removals
    content = content.replace(/\s*tokopediaPrice(\?)?:\s*number;?/g, '');
    content = content.replace(/\s*lazadaPrice(\?)?:\s*number;?/g, '');
    content = content.replace(/\s*tiktokPrice(\?)?:\s*number;?/g, '');
    
    content = content.replace(/\s*tokopediaLink(\?)?:\s*string;?/g, '');
    content = content.replace(/\s*lazadaLink(\?)?:\s*string;?/g, '');
    content = content.replace(/\s*tiktokLink(\?)?:\s*string;?/g, '');
    
    content = content.replace(/\s*tokopediaUrl(\?)?:\s*string;?/g, '');
    content = content.replace(/\s*lazadaUrl(\?)?:\s*string;?/g, '');
    content = content.replace(/\s*tiktokUrl(\?)?:\s*string;?/g, '');
    
    content = content.replace(/\s*tokopediaAvailable(\?)?:\s*boolean;?/g, '');
    content = content.replace(/\s*lazadaAvailable(\?)?:\s*boolean;?/g, '');
    content = content.replace(/\s*tiktokAvailable(\?)?:\s*boolean;?/g, '');
    
    // Specific object property removals (with trailing commas)
    content = content.replace(/\s*tokopediaLink:\s*'[^']*'\s*,?/g, '');
    content = content.replace(/\s*lazadaLink:\s*'[^']*'\s*,?/g, '');
    content = content.replace(/\s*tiktokLink:\s*'[^']*'\s*,?/g, '');
    
    content = content.replace(/\s*tokopediaPrice:\s*\d+\s*,?/g, '');
    content = content.replace(/\s*lazadaPrice:\s*\d+\s*,?/g, '');
    content = content.replace(/\s*tiktokPrice:\s*\d+\s*,?/g, '');
    
    // Inline array variants
    content = content.replace(/,\s*tokopediaPrice:\s*\d+/g, '');
    content = content.replace(/,\s*lazadaPrice:\s*\d+/g, '');
    content = content.replace(/,\s*tiktokPrice:\s*\d+/g, '');
    content = content.replace(/,\s*tokopediaUrl:\s*"[^"]*"/g, '');
    content = content.replace(/,\s*lazadaUrl:\s*"[^"]*"/g, '');
    content = content.replace(/,\s*tiktokUrl:\s*"[^"]*"/g, '');

    fs.writeFileSync(filepath, content, 'utf-8');
}

processFile('src/data/products.ts');
console.log('Processed products.ts');
