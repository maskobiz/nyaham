import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '../public/data/raw/Ringkasan Saham-20260115.xlsx');

const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert first 5 rows to JSON to inspect headers
const data = xlsx.utils.sheet_to_json(sheet, { header: 1, range: 0, defval: "" }).slice(0, 5);

console.log("Headers/First Rows:", JSON.stringify(data, null, 2));
