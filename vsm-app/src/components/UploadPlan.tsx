"use client";

import React, { useState } from 'react';
import { UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-react';
import ExcelJS from 'exceljs';

interface UploadPlanProps {
    selectedPlant: string;
    factory?: string;
}

export default function UploadPlan({ selectedPlant, factory = 'dbr' }: UploadPlanProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setMessage(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file first.' });
            return;
        }

        const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
        const isCsv = file.name.endsWith('.csv');

        if (!isExcel && !isCsv) {
            setMessage({ type: 'error', text: 'Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file' });
            return;
        }

        setLoading(true);
        setMessage({ type: 'info', text: 'Parsing and uploading...' });

        try {
            // Read the file as an ArrayBuffer
            const buffer = await file.arrayBuffer();

            // Create a workbook instance
            const workbook = new ExcelJS.Workbook();

            let allCleanedRows: any[][] = [];

            const targetHeaders = [
                "Factory", "Line", "OC NO", "ORDER NO", "CFM DATE", "MERCHANT", "STYLE", "BUYER",
                "L/S-S/S", "FABRIC", "FABRIC TYPE", "FABRIC ARTICLE", "REMARKS", "IN HOUSE",
                "NEW INH HOUSE", "APPROVAL OF FIT/PP", "Release of Production file & approved sample",
                "Revised F/R", "SMV", "DEL DATE", "MONTH CODE", "NEW DEL", "QTY ORDER",
                "TRIMS AVAILABILITY", "BAL TO LOAD", "Week 1", "Week 2"
            ];

            if (isCsv) {
                // For CSV files, exceljs provides a separate buffer reader
                // However, since exceljs csv reader is async and takes a stream, 
                // we'll stick to basic row conversion if it's a simple CSV, 
                // but exceljs can handle csv via workbook.csv.read too
                await workbook.csv.read(new Response(buffer).body as any);
            } else {
                await workbook.xlsx.load(buffer);
            }

            // Extract rows from all sheets
            workbook.eachSheet((worksheet, sheetId) => {
                const sheetRows: any[][] = [];

                // exceljs uses 1-based indexing for rows and columns
                worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                    // Convert ExcelJS row to a simple array of values
                    const rowValues: any[] = [];
                    // worksheet.columnCount provides the max column index found so far
                    for (let i = 1; i <= (row.values as any[]).length; i++) {
                        const cell = row.getCell(i);
                        let value = cell.value;

                        // Handle potential object values from exceljs (like formulas or rich text)
                        if (value && typeof value === 'object') {
                            if ('result' in value) value = (value as any).result;
                            else if ('text' in value) value = (value as any).text;
                            else if (value instanceof Date) value = value.toISOString().split('T')[0];
                        }

                        rowValues.push(value === null || value === undefined ? '' : value);
                    }
                    sheetRows.push(rowValues);
                });

                if (sheetRows.length === 0) return;

                // Clean empty rows
                const cleanedRows = sheetRows.filter(row => row.some(cell => String(cell || '').trim() !== ''));

                if (cleanedRows.length === 0) return;

                // Find the header row (assume it's the first row that has 'OC NO' or 'BUYER')
                let headerRowIndex = 0;
                for (let i = 0; i < cleanedRows.length; i++) {
                    const rowStr = cleanedRows[i].map(c => String(c || '').toUpperCase().trim()).join(',');
                    if (rowStr.includes('OC NO') || rowStr.includes('BUYER') || rowStr.includes('DEL DATE')) {
                        headerRowIndex = i;
                        break;
                    }
                }

                const sourceHeaders = cleanedRows[headerRowIndex].map(h => String(h || '').toUpperCase().trim());

                // Map source indices to target indices
                const headerMap = new Map<number, number>();
                sourceHeaders.forEach((sourceHeader, sourceIdx) => {
                    const normalizedSource = sourceHeader.replace(/[^A-Z0-9]/g, '');
                    let targetIdx = -1;

                    if (normalizedSource === 'LINE' || normalizedSource === 'LINENO') targetIdx = 1;
                    else if (normalizedSource === 'OCNO') targetIdx = 2;
                    else if (normalizedSource === 'ORDERNO') targetIdx = 3;
                    else if (normalizedSource === 'CFMDATE') targetIdx = 4;
                    else if (normalizedSource === 'MERCHANT') targetIdx = 5;
                    else if (normalizedSource === 'STYLE') targetIdx = 6;
                    else if (normalizedSource === 'BUYER') targetIdx = 7;
                    else if (normalizedSource === 'LSSS') targetIdx = 8;
                    else if (normalizedSource === 'FABRIC') targetIdx = 9;
                    else if (normalizedSource === 'FABRICTYPE') targetIdx = 10;
                    else if (normalizedSource === 'FABRICARTICLE') targetIdx = 11;
                    else if (normalizedSource === 'REMARKS') targetIdx = 12;
                    else if (normalizedSource === 'INHOUSE') targetIdx = 13;
                    else if (normalizedSource === 'NEWINHHOUSE') targetIdx = 14;
                    else if (normalizedSource === 'APPROVALOFFITPP') targetIdx = 15;
                    else if (normalizedSource.includes('RELEASEOFPRODUCTIONFILE')) targetIdx = 16;
                    else if (normalizedSource === 'REVISEDFR') targetIdx = 17;
                    else if (normalizedSource === 'SMV') targetIdx = 18;
                    else if (normalizedSource === 'DELDATE') targetIdx = 19;
                    else if (normalizedSource === 'MONTHCODE') targetIdx = 20;
                    else if (normalizedSource === 'NEWDEL') targetIdx = 21;
                    else if (normalizedSource === 'QTYORDER') targetIdx = 22;
                    else if (normalizedSource === 'TRIMSAVAILABILITY') targetIdx = 23;
                    else if (normalizedSource === 'BALTOLOAD') targetIdx = 24;
                    else if (normalizedSource === 'WEEK1') targetIdx = 25;
                    else if (normalizedSource === 'WEEK2') targetIdx = 26;

                    if (targetIdx !== -1) {
                        headerMap.set(sourceIdx, targetIdx);
                    }
                });

                // Process data rows
                const dataRows = cleanedRows.slice(headerRowIndex + 1);
                const mappedRows = dataRows.map(sourceRow => {
                    const targetRow = new Array(27).fill('');
                    targetRow[0] = selectedPlant; // Factory identifier injection

                    sourceRow.forEach((val, sourceIdx) => {
                        if (headerMap.has(sourceIdx)) {
                            targetRow[headerMap.get(sourceIdx)!] = val;
                        }
                    });

                    // Fallback for line: if Line wasn't mapped, use Excel tab name
                    if (targetRow[1] === '') {
                        targetRow[1] = worksheet.name;
                    }

                    return targetRow;
                });

                // Filter out rows that are effectively empty (no actual data beyond factory/line)
                const finalMappedRows = mappedRows.filter(row => row.some((cell, idx) => idx > 1 && String(cell || '').trim() !== ''));

                if (allCleanedRows.length === 0) {
                    allCleanedRows.push(targetHeaders); // Add headers at the very top
                }

                allCleanedRows = allCleanedRows.concat(finalMappedRows);
            });

            if (allCleanedRows.length <= 1) { // Only header or completely empty
                throw new Error('No valid data found in the Excel file.');
            }

            // Send the parsed rows to the backend - updated to be factory-aware
            const response = await fetch(`/api/${factory}/upload-wlp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    factory: selectedPlant,
                    rows: allCleanedRows
                })
            });

            const result = await response.json();

            if (result.success) {
                setMessage({ type: 'success', text: result.message || 'Upload successful!' });
                setFile(null);
                // Reset the file input
                const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: error.message || 'An error occurred during upload.' });
        } finally {
            setLoading(false);
        }
    };

    // Check for potential factory mismatch
    const isMismatch = selectedPlant !== 'All Plants' && 
                      selectedPlant.toLowerCase() !== factory.toLowerCase();

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white border border-gray-100 shadow-xl rounded-2xl mt-8 transition-all duration-300 hover:shadow-2xl">
            <div className="mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary-50 rounded-lg">
                        <UploadCloud className="w-6 h-6 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#1e3a8a] tracking-tight">Upload Weekly Loading Plan</h2>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                    Upload the Weekly Loading Plan Excel (.xlsx) or CSV file for <strong className="text-primary-900 px-1.5 py-0.5 bg-primary-50 rounded-md">{selectedPlant}</strong>.
                    Data will be merged into the <span className="font-semibold text-primary-700">{factory.toUpperCase()}</span> master database.
                </p>
                
                {isMismatch && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800 text-xs animate-pulse">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p><strong>Warning:</strong> You are uploading data for <strong>{selectedPlant}</strong> into the <strong>{factory.toUpperCase()}</strong> dashboard. Verify this is intentional.</p>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div className={`relative p-10 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center ${
                    file ? 'border-primary-400 bg-primary-50/30' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-primary-300'
                }`}>
                    <div className={`p-4 rounded-full mb-4 transition-transform duration-300 ${file ? 'bg-primary-100 scale-110' : 'bg-gray-100'}`}>
                        <UploadCloud className={`w-10 h-10 ${file ? 'text-primary-600' : 'text-gray-400'}`} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{file ? 'File Selected' : 'Choose your file'}</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-sm">
                        {file ? `Ready to upload: ${file.name}` : 'Drag and drop or click to browse for .xlsx or .csv files'}
                    </p>

                    <input
                        type="file"
                        id="csv-upload"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={loading}
                    />
                    <label
                        htmlFor="csv-upload"
                        className="cursor-pointer bg-white border border-gray-200 shadow-sm px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-700 transition-all active:scale-95 flex items-center gap-2"
                    >
                        {file ? 'Change File' : 'Browse Files'}
                    </label>
                </div>

                {message && (
                    <div className={`p-5 rounded-xl flex items-start gap-4 transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
                        message.type === 'error' ? 'bg-red-50 text-red-900 border border-red-100 shadow-sm' :
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-100 shadow-sm' :
                        'bg-blue-50 text-blue-900 border border-blue-100 shadow-sm'
                    }`}>
                        <div className="shrink-0">
                            {message.type === 'error' ? <AlertCircle className="w-6 h-6 text-red-500" /> :
                             message.type === 'success' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> :
                             <div className="w-6 h-6 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            }
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold mb-1">
                                {message.type === 'error' ? 'Upload Failed' : 
                                 message.type === 'success' ? 'Upload Successful' : 
                                 'Processing...'}
                            </p>
                            <p className="text-sm opacity-90 leading-relaxed font-medium">{message.text}</p>
                            
                            {message.type === 'error' && message.text.includes('403') && (
                                <div className="mt-3 p-3 bg-white/50 rounded-lg border border-red-200 text-xs">
                                    <p className="font-bold text-red-800 mb-1">💡 Pro-tip:</p>
                                    <p>Ask your administrator to share the Google Sheet with the service account email found in the server logs.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="group relative flex items-center gap-3 bg-[#1e3a8a] text-white px-8 py-3.5 rounded-xl font-bold tracking-wide transition-all duration-300 hover:bg-[#1e40af] hover:shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <UploadCloud className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
                                <span>Complete Upload</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
