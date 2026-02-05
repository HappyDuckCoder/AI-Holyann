'use client';

import { useState } from 'react';
import Link from 'next/link';
import FilePreviewModal from '@/components/common/FilePreviewModal';
import { FileText, Image, Download } from 'lucide-react';

interface TestFile {
  name: string;
  url: string;
  type: 'pdf' | 'doc' | 'image' | 'other';
  description: string;
}

const sampleFiles: TestFile[] = [
  {
    name: 'demo_CV.pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'pdf',
    description: 'Sample PDF document'
  },
  {
    name: 'sample_document.docx',
    url: 'https://calibre-ebook.com/downloads/demos/demo.docx',
    type: 'doc',
    description: 'Sample DOCX document'
  },
  {
    name: 'test_image.jpg',
    url: 'https://picsum.photos/800/600?random=1',
    type: 'image',
    description: 'Sample image file'
  },
  {
    name: 'portfolio.png',
    url: 'https://picsum.photos/1200/800?random=2',
    type: 'image',
    description: 'Another sample image'
  },
  // Supabase Private Bucket Examples (replace with actual URLs)
  {
    name: 'supabase_private_file.pdf',
    url: 'https://ahtvzqtykrenluzwajee.supabase.co/storage/v1/object/public/hoex-documents/test_file.pdf',
    type: 'pdf',
    description: 'Supabase storage file (requires auth)'
  }
];

export default function TestFilePreviewPage() {
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    fileUrl: '',
    fileName: ''
  });

  const handlePreview = (file: TestFile) => {
    setPreviewModal({
      isOpen: true,
      fileUrl: file.url,
      fileName: file.name
    });
  };

  const closePreview = () => {
    setPreviewModal(prev => ({ ...prev, isOpen: false }));
  };

  const getFileIcon = (type: TestFile['type']) => {
    switch (type) {
      case 'image':
        return <Image className="w-8 h-8 text-blue-600" />;
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-600" />;
      case 'doc':
        return <FileText className="w-8 h-8 text-blue-700" />;
      default:
        return <FileText className="w-8 h-8 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Navigation */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/test-dashboard"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Back to Dashboard
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/test-checklist"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              📋 Test Checklist
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            👁️ Test File Preview Modal
          </h1>

          {/* Description */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              🔄 Updated: File Preview Modal v2.0
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• ✅ <strong>React Doc Viewer:</strong> Client-side rendering, hỗ trợ Private Bucket</li>
              <li>• ✅ <strong>No more 401 errors:</strong> Sử dụng session auth của user</li>
              <li>• ✅ <strong>Better support:</strong> PDF, DOCX, XLS, PPT, CSV</li>
              <li>• ✅ <strong>Enhanced UX:</strong> Loading states, error handling</li>
              <li>• ❌ <strong>Deprecated:</strong> Google Docs Viewer (có vấn đề với private files)</li>
            </ul>
          </div>

          {/* Sample Files */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleFiles.map((file, index) => (
              <div
                key={index}
                className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  {getFileIcon(file.type)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{file.name}</h3>
                    <p className="text-sm text-gray-600">{file.description}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview(file)}
                    className="flex-1 px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    👁️ Xem trước
                  </button>
                  <a
                    href={`/api/file-proxy?url=${encodeURIComponent(file.url)}&download=true`}
                    className="px-3 py-2 bg-[var(--secondary)] text-secondary-foreground text-sm font-medium rounded hover:opacity-90 transition-all duration-200 flex items-center justify-center"
                    title="Tải xuống trực tiếp"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>

                <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-500 font-mono break-all">
                  {file.url}
                </div>
              </div>
            ))}
          </div>

          {/* Custom File Test */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">
              🧪 Test với URL tùy chỉnh:
            </h3>
            <div className="flex gap-3 mb-4">
              <input
                type="url"
                placeholder="Nhập URL file để test..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    if (input.value) {
                      handlePreview({
                        name: input.value.split('/').pop() || 'custom_file',
                        url: input.value,
                        type: 'other',
                        description: 'Custom file'
                      });
                    }
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  if (input.value) {
                    handlePreview({
                      name: input.value.split('/').pop() || 'custom_file',
                      url: input.value,
                      type: 'other',
                      description: 'Custom file'
                    });
                  }
                }}
                className="px-4 py-2 bg-[var(--accent)] text-accent-foreground text-sm font-medium rounded hover:opacity-90 transition-all duration-200"
              >
                Test
              </button>
            </div>

            {/* Test Proxy API */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">🔄 Test File Proxy API</h4>
              <p className="text-sm text-blue-800 mb-3">
                API này giải quyết CORS issues với Supabase Storage files:
              </p>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const testUrl = 'https://ahtvzqtykrenluzwajee.supabase.co/storage/v1/object/public/hoex-documents/test.pdf';
                        const proxyUrl = `/api/file-proxy?url=${encodeURIComponent(testUrl)}`;

                        const response = await fetch(proxyUrl);
                        const contentType = response.headers.get('content-type');

                        alert(`Preview test result:\nStatus: ${response.status}\nContent-Type: ${contentType}\nSize: ${response.headers.get('content-length')} bytes`);
                      } catch (error) {
                        alert(`Preview test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                      }
                    }}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 transition-all duration-200"
                  >
                    🔄 Test Preview
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const testUrl = 'https://ahtvzqtykrenluzwajee.supabase.co/storage/v1/object/public/hoex-documents/test.pdf';
                        const downloadUrl = `/api/file-proxy?url=${encodeURIComponent(testUrl)}&download=true`;

                        const response = await fetch(downloadUrl);
                        const contentType = response.headers.get('content-type');
                        const disposition = response.headers.get('content-disposition');

                        alert(`Download test result:\nStatus: ${response.status}\nContent-Type: ${contentType}\nContent-Disposition: ${disposition}\nSize: ${response.headers.get('content-length')} bytes`);
                      } catch (error) {
                        alert(`Download test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                      }
                    }}
                    className="px-3 py-1.5 bg-[var(--secondary)] text-secondary-foreground rounded text-sm hover:opacity-90 transition-all duration-200"
                  >
                    ⬇️ Test Download
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/setup-storage');
                        const result = await response.json();

                        if (result.success) {
                          alert(`✅ Storage setup successful!\n\nBuckets: ${result.buckets?.length || 0}\nTarget bucket: ${result.targetBucket.name} (${result.targetBucket.exists ? 'exists' : 'created'})\nFiles: ${result.targetBucket.files}`);
                        } else {
                          alert(`❌ Setup failed: ${result.error}`);
                        }
                      } catch (error) {
                        alert(`Setup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                      }
                    }}
                    className="px-3 py-1.5 bg-[var(--accent)] text-accent-foreground rounded text-sm hover:opacity-90 transition-all duration-200"
                  >
                    🔧 Setup Storage
                  </button>
                </div>
                <p className="text-xs text-blue-700">
                  <strong>Preview:</strong> <code>/api/file-proxy?url=...</code><br />
                  <strong>Download:</strong> <code>/api/file-proxy?url=...&download=true</code><br />
                  <strong>Setup:</strong> <code>/api/setup-storage</code> - Tạo bucket nếu chưa có
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        fileUrl={previewModal.fileUrl}
        fileName={previewModal.fileName}
      />
    </div>
  );
}
