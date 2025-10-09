'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'react-quill-new/dist/quill.snow.css';

// ✅ Dynamically import ReactQuill only on client
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div className="h-72 mb-12 bg-gray-100 rounded animate-pulse" />
  ),
});

export default function RichTextEditor({ value, onChange }) {
  const [modules, setModules] = useState(null);

  useEffect(() => {
    // ✅ Define Quill modules (without highlight.js dependency)
    setModules({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
        [
          { list: 'ordered' },
          { list: 'bullet' },
          { indent: '-1' },
          { indent: '+1' },
        ],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ font: [] }, { size: [] }],
        ['link', 'image'],
        ['clean'],
      ],
    });

    // ✅ Load highlight.js separately just for client-side highlighting
    (async () => {
      const hljs = (await import('highlight.js')).default;
      await import('highlight.js/styles/github-dark.css');
      hljs.highlightAll(); // highlight existing code blocks
    })();
  }, []);

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'code-block',
    'list',
    'indent',
    'color',
    'background',
    'align',
    'font',
    'size',
    'link',
    'image',
  ];

  if (!modules) {
    // Render skeleton placeholder before modules load
    return <div className="h-72 mb-12 bg-gray-100 rounded animate-pulse" />;
  }

  return (
    <ReactQuill
      theme="snow"
      placeholder="Write something..."
      className="h-72 mb-12"
      value={value || ''}
      onChange={onChange}
      modules={modules}
      formats={formats}
    />
  );
}
