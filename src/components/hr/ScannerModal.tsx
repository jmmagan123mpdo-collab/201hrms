import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useData } from '../../context/DataContext.tsx';
import { 
  Camera, 
  RotateCw, 
  Trash2, 
  Check, 
  Plus, 
  X, 
  Upload, 
  FileText, 
  Eye, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmployeeId?: string;
  targetDocType?: string;
  targetDocName?: string;
  targetCategoryId?: string;
}

interface CapturedPage {
  id: string;
  dataUrl: string;
  rotation: number; // 0, 90, 180, 270
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  targetEmployeeId,
  targetDocType,
  targetDocName,
  targetCategoryId
}) => {
  const { currentUser, currentEmployee } = useAuth();
  const { employees, categories, uploadDocument } = useData();

  // Selected targets
  const [selectedEmpId, setSelectedEmpId] = useState(targetEmployeeId || currentUser?.employeeId || 'EMP-2022-001');
  const [selectedCatId, setSelectedCatId] = useState(targetCategoryId || 'cat-01');
  const [docName, setDocName] = useState(targetDocName || 'Personal Data Sheet (CS Form 212)');
  const [docTypeCode, setDocTypeCode] = useState(targetDocType || 'PDS_212');

  // Scanner modes: 'camera' | 'preview' | 'file_upload'
  const [scannerMode, setScannerMode] = useState<'camera' | 'preview' | 'file_upload'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [pages, setPages] = useState<CapturedPage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  // File upload fallback
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-fill when props change
  useEffect(() => {
    if (targetEmployeeId) setSelectedEmpId(targetEmployeeId);
    if (targetCategoryId) setSelectedCatId(targetCategoryId);
    if (targetDocName) setDocName(targetDocName);
    if (targetDocType) setDocTypeCode(targetDocType);
  }, [targetEmployeeId, targetCategoryId, targetDocName, targetDocType]);

  // Start Camera
  const startCamera = async () => {
    setCameraError('');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access unavailable. You can use standard document file upload below.');
      setCameraActive(false);
      setScannerMode('file_upload');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && scannerMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, scannerMode]);

  // Capture Page Snapshot
  const captureSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    const newPage: CapturedPage = {
      id: `page-${Date.now()}-${pages.length + 1}`,
      dataUrl,
      rotation: 0
    };

    setPages(prev => [...prev, newPage]);
    setActivePageIndex(pages.length);
  };

  // Rotate Page
  const rotateActivePage = () => {
    if (pages.length === 0) return;
    setPages(prev => prev.map((p, idx) => {
      if (idx === activePageIndex) {
        return { ...p, rotation: (p.rotation + 90) % 360 };
      }
      return p;
    }));
  };

  // Delete Page
  const deleteActivePage = () => {
    setPages(prev => prev.filter((_, idx) => idx !== activePageIndex));
    if (activePageIndex > 0) {
      setActivePageIndex(activePageIndex - 1);
    }
  };

  // Save & Combine Pages into PDF via jsPDF
  const handleSaveDocument = async () => {
    const isEmployeeUploader = currentUser?.role === 'employee';
    const uploaderRole = currentUser?.role || 'hr_staff';
    const uploadedBy = currentUser?.displayName || 'HR Staff';

    let finalFileName = '';
    let finalFileSize = 0;

    if (scannerMode === 'file_upload' && uploadedFile) {
      finalFileName = uploadedFile.name;
      finalFileSize = uploadedFile.size;
    } else if (pages.length > 0) {
      // Build PDF using jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      pages.forEach((page, index) => {
        if (index > 0) pdf.addPage();
        
        // Compute dimensions to fit A4 (210 x 297 mm)
        pdf.addImage(page.dataUrl, 'JPEG', 10, 10, 190, 260, undefined, 'FAST', page.rotation);
      });

      finalFileName = `${docTypeCode}_${selectedEmpId}_Scanned_${new Date().toISOString().split('T')[0]}.pdf`;
      finalFileSize = pages.length * 350000;
    } else {
      return;
    }

    await uploadDocument({
      employeeId: selectedEmpId,
      categoryId: selectedCatId,
      documentTypeCode: docTypeCode,
      documentName: docName,
      status: isEmployeeUploader ? 'for_review' : 'verified',
      privacy: 'employee_accessible',
      isRequired: true,
      fileName: finalFileName,
      fileSize: finalFileSize,
      uploadedBy,
      uploaderRole,
      verifiedBy: isEmployeeUploader ? undefined : uploadedBy,
      verifiedAt: isEmployeeUploader ? undefined : new Date().toISOString()
    });

    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col h-[94vh] sm:h-auto sm:max-h-[92vh]">
        
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2 pb-1 bg-[#173B67] flex justify-center shrink-0">
          <div className="w-10 h-1 bg-white/40 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="bg-[#173B67] px-4 sm:px-6 py-3 sm:py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">201 Mobile Document Scanner</h3>
              <p className="text-[11px] text-blue-200 line-clamp-1">
                Multi-page camera scanner & PDF compiler for LGU 201 Personnel Files
              </p>
            </div>
          </div>
          <button 
            onClick={() => { stopCamera(); onClose(); }} 
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            aria-label="Close Scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Details Form */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs shrink-0">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Employee Record</label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              disabled={currentUser?.role === 'employee'}
              className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs font-semibold text-slate-800"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeNumber} - {emp.officeName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Document Type</label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. CS Form 212 Personal Data Sheet"
              className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs"
            />
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-3 sm:px-6 py-2 bg-slate-100 flex items-center space-x-1.5 sm:space-x-3 text-xs font-semibold border-b border-slate-200 shrink-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => { setScannerMode('camera'); startCamera(); }}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 cursor-pointer ${
              scannerMode === 'camera' ? 'bg-[#173B67] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Scanner</span>
          </button>

          <button
            type="button"
            onClick={() => { setScannerMode('preview'); stopCamera(); }}
            disabled={pages.length === 0}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 cursor-pointer disabled:opacity-40 ${
              scannerMode === 'preview' ? 'bg-[#173B67] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pages ({pages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setScannerMode('file_upload'); stopCamera(); }}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 cursor-pointer ${
              scannerMode === 'file_upload' ? 'bg-[#173B67] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>File Upload</span>
          </button>
        </div>

        {/* Scanner Body Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col items-center justify-center bg-slate-950 text-white min-h-[260px]">
          
          {/* CAMERA MODE */}
          {scannerMode === 'camera' && (
            <div className="w-full max-w-md flex flex-col items-center space-y-3">
              <div className="relative w-full aspect-[4/3] sm:aspect-[4/3] bg-black rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Visual Document Alignment Guideline Overlay */}
                <div className="absolute inset-3 sm:inset-4 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[11px] bg-black/70 px-3 py-1.5 rounded-full text-white/90 font-medium text-center">
                    Align document page within frame
                  </span>
                </div>
              </div>

              {/* Shutter Controls */}
              <div className="flex flex-col items-center space-y-1 pt-1">
                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="w-18 h-18 rounded-full bg-white hover:bg-slate-100 p-1 flex items-center justify-center shadow-2xl transition-transform active:scale-90 cursor-pointer"
                  title="Capture Page Snapshot"
                  aria-label="Capture page snapshot"
                >
                  <div className="w-15 h-15 rounded-full border-2 border-slate-900 bg-[#F28C28] flex items-center justify-center text-white shadow-inner">
                    <Camera className="w-7 h-7" />
                  </div>
                </button>
                <span className="text-[11px] font-semibold text-slate-300">
                  Tap to capture page ({pages.length} recorded)
                </span>
              </div>
            </div>
          )}

          {/* PREVIEW & MULTI-PAGE MANAGEMENT MODE */}
          {scannerMode === 'preview' && pages.length > 0 && (
            <div className="w-full max-w-md flex flex-col items-center space-y-3">
              <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex items-center justify-center">
                <img
                  src={pages[activePageIndex]?.dataUrl}
                  alt={`Page ${activePageIndex + 1}`}
                  style={{ transform: `rotate(${pages[activePageIndex]?.rotation || 0}deg)` }}
                  className="max-h-full max-w-full object-contain transition-transform duration-200"
                />
              </div>

              {/* Page Tools (Rotate, Delete) */}
              <div className="flex items-center space-x-2 text-xs">
                <button
                  type="button"
                  onClick={rotateActivePage}
                  className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center space-x-1.5 cursor-pointer font-semibold"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Rotate 90°</span>
                </button>
                <button
                  type="button"
                  onClick={deleteActivePage}
                  className="min-h-[44px] px-3.5 py-2 bg-rose-900/70 hover:bg-rose-800 text-rose-100 rounded-xl flex items-center space-x-1.5 cursor-pointer font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Page</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setScannerMode('camera'); startCamera(); }}
                  className="min-h-[44px] px-3.5 py-2 bg-[#F28C28] hover:bg-[#d9771a] text-white rounded-xl flex items-center space-x-1.5 cursor-pointer font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Page</span>
                </button>
              </div>

              {/* Carousel Page Selector */}
              <div className="flex items-center space-x-2 pt-1 overflow-x-auto max-w-full p-1">
                {pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePageIndex(i)}
                    className={`min-w-[36px] h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activePageIndex === i 
                        ? 'bg-[#F28C28] text-white ring-2 ring-white shadow-md' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FILE UPLOAD FALLBACK MODE */}
          {scannerMode === 'file_upload' && (
            <div className="w-full max-w-md p-5 sm:p-6 bg-slate-900 rounded-2xl border border-slate-700 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-blue-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Select Document File</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Supported formats: PDF, JPG, PNG, DOCX, XLSX (Max 15MB)
                </p>
              </div>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadedFile(e.target.files[0]);
                  }
                }}
                className="block w-full text-xs text-slate-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#173B67] file:text-white hover:file:bg-[#122e50] cursor-pointer"
              />

              {uploadedFile && (
                <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-left text-xs text-emerald-200">
                  <strong>Selected:</strong> {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions (Thumb-Friendly on Mobile) */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="text-xs text-slate-600 text-center sm:text-left">
            {pages.length > 0 ? (
              <span className="font-bold text-slate-900">
                {pages.length} page(s) compiled into single PDF
              </span>
            ) : uploadedFile ? (
              <span className="font-bold text-slate-900 truncate block">
                Ready: {uploadedFile.name}
              </span>
            ) : (
              <span className="text-slate-400">Capture pages with camera or select file</span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <button
              type="button"
              onClick={() => { stopCamera(); onClose(); }}
              className="min-h-[44px] px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDocument}
              disabled={pages.length === 0 && !uploadedFile}
              className="min-h-[44px] px-5 py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-40 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Save</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
