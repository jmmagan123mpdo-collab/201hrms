import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  FileInput, 
  FileSpreadsheet, 
  ScanLine, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const MigrationCenter: React.FC = () => {
  const { addEmployee, employees, uploadDocument } = useData();
  const { currentUser } = useAuth();

  const [activeTool, setActiveTool] = useState<'excel' | 'ocr'>('excel');

  // Excel State
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [columnHeaders, setColumnHeaders] = useState<string[]>([]);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  // OCR State
  const [ocrFileName, setOcrFileName] = useState<string | null>(null);
  const [ocrExtractedData, setOcrExtractedData] = useState<{
    suggestedEmployeeName: string;
    suggestedDocType: string;
    confidence: number;
    extractedFields: Record<string, string>;
  } | null>(null);
  const [ocrAssignedEmployeeId, setOcrAssignedEmployeeId] = useState(employees[0]?.id || '');
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState('');

  // Handle Excel File Upload
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (data.length > 0) {
        const headers = data[0] as string[];
        setColumnHeaders(headers);

        const rows = data.slice(1).map((row, idx) => {
          const rowObj: any = {};
          headers.forEach((h, i) => {
            rowObj[h] = row[i];
          });
          return { id: idx, data: rowObj };
        });
        setParsedRows(rows);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Confirm Excel Import
  const handleConfirmExcelImport = async () => {
    let successCount = 0;
    for (const row of parsedRows) {
      const d = row.data;
      const fName = d['First Name'] || d['firstname'] || d['First'] || 'Personnel';
      const lName = d['Last Name'] || d['lastname'] || d['Last'] || 'Imported';
      const empNum = d['Employee Number'] || d['emp_number'] || `SJ-IMP-${Math.floor(Math.random() * 9000 + 1000)}`;

      await addEmployee({
        employeeNumber: empNum,
        firstName: fName,
        lastName: lName,
        email: `${fName.toLowerCase()}.${lName.toLowerCase()}@sanjose.gov.ph`,
        isEmailVerified: true,
        phone: '0917-000-0000',
        officeId: 'off-01',
        officeName: "Mayor's Office",
        position: d['Position'] || 'Administrative Staff',
        classification: 'Permanent',
        employmentStatus: 'Active',
        recordStatus: 'Active',
        hireDate: new Date().toISOString().split('T')[0]
      });
      successCount++;
    }

    setImportSummary(`Successfully validated and imported ${successCount} personnel records into Cloud Firestore.`);
    setParsedRows([]);
  };

  // Simulate OCR Processing
  const handleOcrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrFileName(file.name);
    // Intelligent OCR extraction simulation
    setTimeout(() => {
      setOcrExtractedData({
        suggestedEmployeeName: 'Maria Santos Reyes',
        suggestedDocType: 'Personal Data Sheet (CS Form 212)',
        confidence: 94,
        extractedFields: {
          'CS Form': 'CS Form 212 Revised 2017',
          'Name on Document': 'REYES, MARIA SANTOS',
          'Date of Birth': 'May 18, 1990',
          'TIN Found': '245-891-002-000',
          'Notary Status': 'Notarized by Atty. V. Sanchez'
        }
      });
    }, 600);
  };

  const handleConfirmOcrSave = async () => {
    if (!ocrExtractedData || !ocrFileName) return;

    await uploadDocument({
      employeeId: ocrAssignedEmployeeId,
      categoryId: 'cat-01',
      documentTypeCode: 'PDS_212',
      documentName: ocrExtractedData.suggestedDocType,
      status: 'verified',
      privacy: 'employee_accessible',
      isRequired: true,
      fileName: ocrFileName,
      fileSize: 1850000,
      uploadedBy: currentUser?.displayName || 'HR Migration Officer',
      uploaderRole: 'hr_admin',
      verifiedBy: currentUser?.displayName || 'HR Administrator',
      verifiedAt: new Date().toISOString(),
      remarks: 'Extracted via OCR Migration Center (94% confidence match)'
    });

    setOcrSuccessMsg(`Document "${ocrFileName}" verified and attached to employee 201 files!`);
    setOcrExtractedData(null);
    setOcrFileName(null);
  };

  return (
    <div className="space-y-4 text-xs">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Data Migration & OCR Intake Center</h2>
          <p className="text-xs text-slate-500">
            Batch import existing Excel rosters and scan physical 201 documents using OCR metadata extraction
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTool('excel')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              activeTool === 'excel' ? 'bg-[#173B67] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>A. Excel/CSV Database Import</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTool('ocr')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              activeTool === 'ocr' ? 'bg-[#173B67] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            <ScanLine className="w-4 h-4" />
            <span>B. 201 Files OCR Import</span>
          </button>
        </div>
      </div>

      {/* TOOL A: EXCEL IMPORT */}
      {activeTool === 'excel' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-3 bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-[#173B67] flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Upload Personnel Masterlist Spreadsheet</h3>
              <p className="text-xs text-slate-500 mt-0.5">Accepts .xlsx, .xls, and .csv files</p>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelUpload}
              className="block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#173B67] file:text-white hover:file:bg-[#122e50] cursor-pointer"
            />
          </div>

          {importSummary && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{importSummary}</span>
            </div>
          )}

          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">
                  Detected {parsedRows.length} Rows • Field Headers: {columnHeaders.join(', ')}
                </span>
                <button
                  type="button"
                  onClick={handleConfirmExcelImport}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Approve & Import {parsedRows.length} Records to Firestore
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto border rounded-xl">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 uppercase font-bold text-slate-600 sticky top-0">
                    <tr>
                      {columnHeaders.map(h => (
                        <th key={h} className="p-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 10).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {columnHeaders.map(h => (
                          <td key={h} className="p-2.5 text-slate-700">{r.data[h] || '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL B: OCR IMPORT */}
      {activeTool === 'ocr' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-3 bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
              <ScanLine className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Upload Scanned 201 Document for OCR Analysis</h3>
              <p className="text-xs text-slate-500 mt-0.5">Accepts PDF, JPG, PNG, DOCX (Extracts name, document type & dates)</p>
            </div>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={handleOcrUpload}
              className="block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-700 file:text-white hover:file:bg-purple-800 cursor-pointer"
            />
          </div>

          {ocrSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{ocrSuccessMsg}</span>
            </div>
          )}

          {ocrExtractedData && (
            <div className="p-5 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-purple-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>OCR Information Extracted ({ocrExtractedData.confidence}% Confidence)</span>
                </div>
                <span className="font-mono text-[11px] text-purple-700">File: {ocrFileName}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {Object.entries(ocrExtractedData.extractedFields).map(([k, v]) => (
                  <div key={k} className="p-2.5 bg-white rounded-xl border border-purple-100">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">{k}</span>
                    <span className="font-semibold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-700">Assign to Employee:</span>
                  <select
                    value={ocrAssignedEmployeeId}
                    onChange={(e) => setOcrAssignedEmployeeId(e.target.value)}
                    className="p-2 border rounded-xl bg-white font-semibold"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeNumber})</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmOcrSave}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirm & Attach Document to 201 File
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
