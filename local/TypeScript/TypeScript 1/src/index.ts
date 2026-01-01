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
const enum Size { Small = 1, Medium, Large }; // Enum
let mySize: Size = Size.Medium;
console.log(mySize); // 2

// -----------------------------
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
// Functions 

function calculateTax(income: number, taxYear?: number): number {
    if ((taxYear || 2022) < 2022)                                                                                                                                                                                                   
        return income * 1.2;
    return income * 1.3;
}
const tax = calculateTax(10_000);
console.log(tax);

// OR 

function calcTax(income: number, taxYear = 2022): number {
    if (taxYear < 2022) 
        return income * 1.2;
    return income * 1.3;
}
const finalTax = calcTax(10_000);
console.log(finalTax);