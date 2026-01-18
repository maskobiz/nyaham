import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputFile = path.join(__dirname, '../public/data/raw/Ringkasan Saham-20260115.xlsx');
const outputFile = path.join(__dirname, '../public/data/stocks.json');

function parseDate(dateStr) {
    if (!dateStr) return new Date().toISOString();
    // Expected format "15 Jan 2026"
    return new Date(dateStr).toISOString();
}

console.log("Reading file:", inputFile);
const workbook = xlsx.readFile(inputFile);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, range: 1 }); // Skip header row

const processedData = rawData
    .filter(row => row[1] && row[2]) // Ensure code and name exist
    .map(row => ({
        StockCode: row[1],
        StockName: row[2],
        Date: parseDate(row[6]),
        Close: row[10],
        Change: row[11],
        Volume: row[12],
        Value: row[13],
        Frequency: row[14]
    }));

const output = {
    draw: 0,
    recordsTotal: processedData.length,
    recordsFiltered: processedData.length,
    data: processedData
};

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

console.log(`Successfully processed ${processedData.length} records.`);
console.log(`Saved to ${outputFile}`);
