import { useState } from 'react';
// import Image from 'next/image';
import { FileText, File } from 'lucide-react';



export function FileViewer({ url, label }) {
  const [isLoading, setIsLoading] = useState(true);

  const fileExtension = url.split('.').pop()?.toLowerCase();

  const renderFile = () => {
    switch (fileExtension) {
      case 'pdf':
        return (
          <iframe
            src={`${url}#view=FitH`}
            className="w-full h-[500px] max-h-[80vh]"
            onLoad={() => setIsLoading(false)}
          />
        );
      case 'doc':
      case 'docx':
        return (
          <div className="flex items-center justify-center w-full h-[300px] bg-gray-100 rounded-md">
            <FileText className="w-16 h-16 text-blue-500" />
            <span className="ml-2">Word Document</span>
          </div>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <div className="relative w-full h-[300px]">
            {/* <Image
              src={url || '/placeholder.svg'}
              alt={label}
              fill
              className="object-contain rounded-md"
              onLoadingComplete={() => setIsLoading(false)}
            /> */}
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-full h-[300px] bg-gray-100 rounded-md">
            <File className="w-16 h-16 text-gray-500" />
            <span className="ml-2">Unknown File Type</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <h3 className="font-semibold mb-2">{label}</h3>
      {isLoading && (
        <div className="w-full h-[300px] bg-gray-200 animate-pulse rounded-md" />
      )}
      {renderFile()}
    </div>
  );
}
