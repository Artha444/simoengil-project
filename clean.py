import re
import os

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Generic property removals
    content = re.sub(r'\s*tokopediaPrice(\?)?:\s*number;?', '', content)
    content = re.sub(r'\s*lazadaPrice(\?)?:\s*number;?', '', content)
    content = re.sub(r'\s*tiktokPrice(\?)?:\s*number;?', '', content)
    
    content = re.sub(r'\s*tokopediaLink(\?)?:\s*string;?', '', content)
    content = re.sub(r'\s*lazadaLink(\?)?:\s*string;?', '', content)
    content = re.sub(r'\s*tiktokLink(\?)?:\s*string;?', '', content)
    
    content = re.sub(r'\s*tokopediaUrl(\?)?:\s*string;?', '', content)
    content = re.sub(r'\s*lazadaUrl(\?)?:\s*string;?', '', content)
    content = re.sub(r'\s*tiktokUrl(\?)?:\s*string;?', '', content)
    
    content = re.sub(r'\s*tokopediaAvailable(\?)?:\s*boolean;?', '', content)
    content = re.sub(r'\s*lazadaAvailable(\?)?:\s*boolean;?', '', content)
    content = re.sub(r'\s*tiktokAvailable(\?)?:\s*boolean;?', '', content)
    
    # Specific object property removals (with trailing commas)
    content = re.sub(r'\s*tokopediaLink:\s*\'[^\']*\'\s*,?', '', content)
    content = re.sub(r'\s*lazadaLink:\s*\'[^\']*\'\s*,?', '', content)
    content = re.sub(r'\s*tiktokLink:\s*\'[^\']*\'\s*,?', '', content)
    
    content = re.sub(r'\s*tokopediaPrice:\s*\d+\s*,?', '', content)
    content = re.sub(r'\s*lazadaPrice:\s*\d+\s*,?', '', content)
    content = re.sub(r'\s*tiktokPrice:\s*\d+\s*,?', '', content)
    
    # Inline array variants
    content = re.sub(r',\s*tokopediaPrice:\s*\d+', '', content)
    content = re.sub(r',\s*lazadaPrice:\s*\d+', '', content)
    content = re.sub(r',\s*tiktokPrice:\s*\d+', '', content)
    content = re.sub(r',\s*tokopediaUrl:\s*"[^"]*"', '', content)
    content = re.sub(r',\s*lazadaUrl:\s*"[^"]*"', '', content)
    content = re.sub(r',\s*tiktokUrl:\s*"[^"]*"', '', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('src/data/products.ts')
print('Processed products.ts')
