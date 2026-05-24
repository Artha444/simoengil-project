const fs = require('fs');
let c = fs.readFileSync('src/app/product/[id]/page.tsx', 'utf-8');

// 1. Split lines
let lines = c.split('\n');

// Find and remove lines 382 to 405 (array indices 381 to 404)
// Wait, the line numbers might have changed!
// I'll search for the exact string index
const toggleStart = c.indexOf('  // Wishlist toggler\r\n');
const toggleStartN = c.indexOf('  // Wishlist toggler\n');
const start = toggleStart !== -1 ? toggleStart : toggleStartN;

const removeEndStr = "localStorage.setItem('simoengil_wishlist', JSON.stringify(updatedWishlist));\r\n  };\r\n";
const removeEndStrN = "localStorage.setItem('simoengil_wishlist', JSON.stringify(updatedWishlist));\n  };\n";

let end = c.indexOf(removeEndStr, start);
let endLen = removeEndStr.length;
if (end === -1) {
  end = c.indexOf(removeEndStrN, start);
  endLen = removeEndStrN.length;
}

if (start !== -1 && end !== -1) {
  // Wait, there are TWO functions. The second one ends with that same string!
  // By using indexOf with start, it finds the FIRST occurrence of the end string (end of handleWishlistToggle).
  // Then we need to find the SECOND occurrence.
  let secondEnd = c.indexOf(removeEndStr, end + endLen);
  if (secondEnd === -1) secondEnd = c.indexOf(removeEndStrN, end + endLen);
  
  if (secondEnd !== -1) {
    c = c.substring(0, start) + c.substring(secondEnd + endLen);
  }
}

fs.writeFileSync('src/app/product/[id]/page.tsx', c);
