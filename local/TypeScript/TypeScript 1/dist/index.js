"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let sales = 123_456_789; // Number
let course = 'TypeScript'; // String
let is_published = true; // Boolean
let num; // Any
num = 10;
num = true;
console.log(sales); // 123456789
console.log(course); // TypeScript
console.log(is_published); // true
console.log(num); // true
// -----------------------------
const small = 1;
const medium = 2;
const large = 3;
console.log(small, medium, large);
// OR
// PascalCase
var Size;
(function (Size) {
    Size[Size["Small"] = 1] = "Small";
    Size[Size["Medium"] = 2] = "Medium";
    Size[Size["Large"] = 3] = "Large";
})(Size || (Size = {}));
; // Enum
let mySize = Size.Medium;
console.log(mySize); // 2
// -----------------------------
// Functions 
function calculateTax(income, taxYear) {
    if ((taxYear || 2022) < 2022)
        return income * 1.2;
    return income * 1.3;
}
const tax = calculateTax(10_000);
console.log(tax);
// OR 
function calcTax(income, taxYear = 2022) {
    if (taxYear < 2022)
        return income * 1.2;
    return income * 1.3;
}
const finalTax = calcTax(10_000);
console.log(finalTax);
//# sourceMappingURL=index.js.map