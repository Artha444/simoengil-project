const fs = require('fs');

let c = fs.readFileSync('src/app/admin-panel/dashboard/page.tsx', 'utf-8');

// 1. Remove table columns
c = c.replace(/<th className=\"px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider\">Tokopedia<\/th>/gi, '');
c = c.replace(/<th className=\"px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider\">Lazada<\/th>/gi, '');
c = c.replace(/<th className=\"px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider\">Tiktok<\/th>/gi, '');

c = c.replace(/<td className=\"px-6 py-4 whitespace-nowrap\">[\s\S]*?<a href=\{product\.tokopediaLink\}[\s\S]*?<\/td>/g, '');
c = c.replace(/<td className=\"px-6 py-4 whitespace-nowrap\">[\s\S]*?<a href=\{product\.lazadaLink\}[\s\S]*?<\/td>/g, '');
c = c.replace(/<td className=\"px-6 py-4 whitespace-nowrap\">[\s\S]*?<a href=\{product\.tiktokLink\}[\s\S]*?<\/td>/g, '');

// 2. Remove from specifications checklist
c = c.replace(/<label className=\"flex items-center gap-2 p-1\.5 border border-\[#42b549\]\/20 bg-\[#42b549\]\/5 rounded-lg cursor-pointer hover:bg-\[#42b549\]\/10 transition-colors\">[\s\S]*?<span className=\"text-\[10px\] font-bold text-\[#42b549\]\">Tokopedia<\/span>\s*<\/label>/g, '');
c = c.replace(/<label className=\"flex items-center gap-2 p-1\.5 border border-blue-900\/20 bg-blue-900\/5 rounded-lg cursor-pointer hover:bg-blue-900\/10 transition-colors\">[\s\S]*?<span className=\"text-\[10px\] font-bold text-blue-900\">Lazada<\/span>\s*<\/label>/g, '');
c = c.replace(/<label className=\"flex items-center gap-2 p-1\.5 border border-slate-800\/20 bg-slate-800\/5 rounded-lg cursor-pointer hover:bg-slate-800\/10 transition-colors\">[\s\S]*?<span className=\"text-\[10px\] font-bold text-slate-800\">TikTok<\/span>\s*<\/label>/g, '');

// 3. Remove Shopee & Tokopedia Links (replace with just Shopee Links)
c = c.replace(/\{\/\* Shopee & Tokopedia Links \*\/\}[\s\S]*?\{\/\* Lazada & TikTok Links \*\/\}/g, `
                  {/* Shopee Link */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-orange-500 block">
                        Shopee Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://shopee.co.id/..."
                        value={shopeeLink}
                        onChange={(e) => setShopeeLink(e.target.value)}
                        disabled={!shopeeAvailable}
                        className="w-full px-2 py-1.5 bg-white border border-orange-100 focus:border-orange-300 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
`);

// 4. Remove Lazada & TikTok Links entirely (until the next comment)
c = c.replace(/<div className=\"grid grid-cols-2 gap-3\">\s*<div className=\"space-y-1\">\s*<label className=\"text-\[9px\] font-bold text-blue-900 block\">\s*Lazada Link[\s\S]*?disabled:cursor-not-allowed\"\s*\/>\s*<\/div>\s*<\/div>/g, '');


// 5. Remove Shopee & Tokopedia Prices
c = c.replace(/\{\/\* Shopee & Tokopedia Prices \*\/\}[\s\S]*?\{\/\* Lazada & TikTok Prices \*\/\}/g, `
                  {/* Shopee Price */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-orange-500 block">
                        Harga Shopee (IDR)
                      </label>
                      <input
                        type="number"
                        placeholder="Contoh: 150000"
                        value={shopeePrice}
                        onChange={(e) => setShopeePrice(e.target.value)}
                        disabled={!shopeeAvailable}
                        className="w-full px-2 py-1.5 bg-white border border-orange-100 focus:border-orange-300 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
`);

// 6. Remove Lazada & TikTok Prices
c = c.replace(/<div className=\"grid grid-cols-2 gap-3\">\s*<div className=\"space-y-1\">\s*<label className=\"text-\[9px\] font-bold text-blue-900 block\">\s*Harga Lazada \(IDR\)[\s\S]*?disabled:cursor-not-allowed\"\s*\/>\s*<\/div>\s*<\/div>/g, '');


// 7. Remove Variant checkboxes
c = c.replace(/<label className=\"flex items-center gap-1\.5 p-1 border border-\[#42b549\]\/20 bg-\[#42b549\]\/5 rounded-md cursor-pointer hover:bg-\[#42b549\]\/10 transition-colors\">[\s\S]*?<span className=\"text-\[9px\] font-bold text-\[#42b549\]\">Tokopedia<\/span>\s*<\/label>/g, '');
c = c.replace(/<label className=\"flex items-center gap-1\.5 p-1 border border-blue-900\/20 bg-blue-900\/5 rounded-md cursor-pointer hover:bg-blue-900\/10 transition-colors\">[\s\S]*?<span className=\"text-\[9px\] font-bold text-blue-900\">Lazada<\/span>\s*<\/label>/g, '');
c = c.replace(/<label className=\"flex items-center gap-1\.5 p-1 border border-slate-800\/20 bg-slate-800\/5 rounded-md cursor-pointer hover:bg-slate-800\/10 transition-colors\">[\s\S]*?<span className=\"text-\[9px\] font-bold text-slate-800\">TikTok<\/span>\s*<\/label>/g, '');

// 8. Remove Variant Tokopedia/Lazada Prices
c = c.replace(/\{\/\* Tokopedia Price \*\/\}[\s\S]*?\{\/\* TikTok Price \*\/\}/g, '');
c = c.replace(/\{\/\* TikTok Price \*\/\}[\s\S]*?placeholder=\"Contoh: 150000\"\s*value=\{v\.tiktokPrice \|\| ''\}\s*onChange=\{\(e\) => handleVariantChange\(i, 'tiktokPrice', e\.target\.value\)\}\s*disabled=\{v\.tiktokAvailable === false\}\s*className=\"w-full px-2 py-1\.5 bg-white border border-slate-200 focus:border-slate-400 rounded-md text-\[10px\] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed\"\s*\/>\s*<\/div>/g, '');

// 9. Remove Variant Tokopedia/Lazada URLs
c = c.replace(/\{\/\* Tokopedia URL \*\/\}[\s\S]*?\{\/\* TikTok URL \*\/\}/g, '');
c = c.replace(/\{\/\* TikTok URL \*\/\}[\s\S]*?placeholder=\"https:\/\/tiktok\.com\/\.\.\.\"\s*value=\{v\.tiktokUrl\}\s*onChange=\{\(e\) => handleVariantChange\(i, 'tiktokUrl', e\.target\.value\)\}\s*disabled=\{v\.tiktokAvailable === false\}\s*className=\"w-full px-2 py-1\.5 bg-white border border-slate-200 focus:border-slate-400 rounded-md text-\[10px\] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed\"\s*\/>\s*<\/div>/g, '');

fs.writeFileSync('src/app/admin-panel/dashboard/page.tsx', c);
