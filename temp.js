const fs = require('fs');
let c = fs.readFileSync('src/app/admin-panel/dashboard/page.tsx', 'utf-8');

c = c.replace(/Ukuran \(mis/g, 'Nama Variasi (mis');

const sizeBlock = `                            {/* Size Name */}
                            <div className="space-y-1.5">`;
                            
const replacement = `                            {/* Size Name */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-bold text-slate-500">Gambar Variasi</span>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="URL Gambar (Opsional)"
                                  value={v.image || ''}
                                  onChange={(e) => handleVariantChange(i, 'image', e.target.value)}
                                  className="flex-1 px-2 py-1.5 text-[10px] rounded-lg border border-slate-200 focus:border-pink-400 focus:ring-1 focus:ring-pink-100 placeholder:text-slate-300"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">`;
                            
c = c.replace(sizeBlock, replacement);
fs.writeFileSync('src/app/admin-panel/dashboard/page.tsx', c);
console.log('Done');
