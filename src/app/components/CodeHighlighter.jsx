'use client';
import { useEffect } from 'react';
import hljs from 'highlight.js';
//import 'highlight.js/styles/atom-one-dark.css'; 
import 'highlight.js/styles/github-dark.css';
//import 'highlight.js/styles/tokyo-night-dark.css'; 


export default function CodeHighlighter() {
  useEffect(() => {
    // Convert Quill code blocks (<div class="ql-code-block">) into <pre><code>
    const codeBlocks = document.querySelectorAll('.ql-code-block-container');
    codeBlocks.forEach(container => {
      // Skip if already transformed
      if (container.querySelector('pre')) return;

      const codeText = Array.from(container.querySelectorAll('.ql-code-block'))
        .map(block => block.textContent)
        .join('\n');

      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = codeText;
      code.classList.add('language-javascript'); // adjust if you know the language

      // Copy button
      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'Copy';
      copyBtn.className =
        'absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded-md transition-all duration-200';

      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(codeText);
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('bg-green-600');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('bg-green-600');
        }, 1500);
      });

      const wrapper = document.createElement('div');
      wrapper.className =
        'relative rounded-lg overflow-hidden group border border-gray-700 shadow-lg transition-all duration-300 hover:shadow-xl';

      pre.appendChild(code);
      wrapper.appendChild(pre);
      wrapper.appendChild(copyBtn);
      container.innerHTML = '';
      container.appendChild(wrapper);
    });

    // Run highlight.js
    hljs.highlightAll();
  }, []);

  return null;
}
