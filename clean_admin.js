const fs = require('fs');

let page = fs.readFileSync('src/app/admin-panel/dashboard/page.tsx', 'utf-8');

// The main Link & Harga Marketplace section is likely starting with "Link & Harga Marketplace"
// Let's remove the columns in the table:
page = page.replace(/<th className=\"px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider\">Tokopedia<\/th>/gi, '');
page = page.replace(/<th className=\"px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider\">Lazada<\/th>/gi, '');
page = page.replace(/<th className=\"px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider\">Tiktok<\/th>/gi, '');

// Also the data cells in the table:
page = page.replace(/<td className=\"px-6 py-4 whitespace-nowrap\">[\s\S]*?<a href=\{product\.tokopediaLink\}[\s\S]*?<\/td>/gi, '');
page = page.replace(/<td className=\"px-6 py-4 whitespace-nowrap\">[\s\S]*?<a href=\{product\.lazadaLink\}[\s\S]*?<\/td>/gi, '');
page = page.replace(/<td className=\"px-6 py-4 whitespace-nowrap\">[\s\S]*?<a href=\{product\.tiktokLink\}[\s\S]*?<\/td>/gi, '');


// Remove the Link & Harga Marketplace UI from the Modal
// Search for the section that has Tokopedia/Lazada/Tiktok inputs.
// The easiest way is to use regex to remove chunks of code matching the specific div structures.

// Remove the whole "Link & Harga Marketplace" section from the forms
page = page.replace(/<h3 className=\"text-sm font-bold text-slate-800 mb-4 flex items-center gap-2\">\n\s*<Link2 className=\"w-4 h-4 text-blue-500\" \/>\n\s*Link & Harga Marketplace\n\s*<\/h3>[\s\S]*?{/\* Varian Produk \*/}/g, '{/* Varian Produk */}');

// Remove from specifications section if there's any
page = page.replace(/<div className=\"flex items-center justify-between\">\n\s*<label className=\"text-sm font-bold text-slate-700 flex items-center gap-2\">\n\s*<span className=\"w-2 h-2 rounded-full bg-green-500\"><\/span>\n\s*Tersedia di Tokopedia\n\s*<\/label>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g, '');

// Remove from variant form section
page = page.replace(/<h4 className=\"text-sm font-bold text-slate-800 mb-3\">Harga & Link Marketplace<\/h4>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g, '');

fs.writeFileSync('src/app/admin-panel/dashboard/page.tsx', page);
