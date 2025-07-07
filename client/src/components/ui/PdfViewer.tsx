import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from './button';
import { Loader2 } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
  fileUrl: string;
}

const PdfViewer = ({ fileUrl }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const goToPrevPage = () => setPageNumber(pageNumber - 1);
  const goToNextPage = () => setPageNumber(pageNumber + 1);

  return (
    <div className="w-full">
      <div 
        className="relative flex justify-center bg-gray-100 dark:bg-gray-800"
        // Prevent context menu to disable right-click downloads
        onContextMenu={(e) => e.preventDefault()}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="flex justify-center items-center h-96"><Loader2 className="animate-spin h-8 w-8" /></div>}
          error={<div className="p-4 text-red-500">Failed to load PDF file.</div>}
        >
          <Page pageNumber={pageNumber} />
        </Document>
      </div>
      {numPages && (
        <div className="flex justify-center items-center space-x-4 p-4 bg-white dark:bg-gray-900">
          <Button onClick={goToPrevPage} disabled={pageNumber <= 1}>
            Prev
          </Button>
          <p>
            Page {pageNumber} of {numPages}
          </p>
          <Button onClick={goToNextPage} disabled={pageNumber >= numPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default PdfViewer; 