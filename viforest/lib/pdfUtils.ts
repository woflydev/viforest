import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts'; // Standard fonts for pdfmake 0.1.x/0.2.x
import htmlToPdfmake from 'html-to-pdfmake';

function extractSupportedContent(html: string): string {
  const allowedTags = [
    'DIV', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD',
    'UL', 'OL', 'LI', 'PRE',
    'SPAN', 'STRONG', 'B', 'EM', 'I', 'S', 'A', 'SUB', 'SUP', 'IMG', 'SVG', 'BR', 'HR'
  ];

  const temp = document.createElement('div');
  temp.innerHTML = html;

  function clean(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode();
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      // Remove all font-family styles from elements
      temp.querySelectorAll('[style]').forEach(el => {
        (el as HTMLElement).style.fontFamily = 'Roboto';
      });

      const el = node as HTMLElement;
      if (!allowedTags.includes(el.tagName)) return null;

      // Clone and clean children
      const clone = el.cloneNode(false) as HTMLElement;
      for (const child of Array.from(el.childNodes)) {
        const cleaned = clean(child);
        if (cleaned) clone.appendChild(cleaned);
      }

      // Optionally, keep only safe attributes (like src/href for img/a)
      if (clone.tagName === 'A') {
        const href = el.getAttribute('href');
        if (href) clone.setAttribute('href', href);
      }
      if (clone.tagName === 'IMG') {
        const src = el.getAttribute('src');
        if (src) clone.setAttribute('src', src);
        // Optionally, keep alt/title
        const alt = el.getAttribute('alt');
        if (alt) clone.setAttribute('alt', alt);
      }
      return clone;
    }
    return null;
  }

  const cleanedRoot = document.createElement('div');
  for (const child of Array.from(temp.childNodes)) {
    const cleaned = clean(child);
    if (cleaned) cleanedRoot.appendChild(cleaned);
  }
  return cleanedRoot.innerHTML;
}

export async function generatePdfFromHtml(htmlContent: string, fileName: string = 'document.pdf'): Promise<File | null> {
  if (!htmlContent || htmlContent.trim() === "") {
    console.error('HTML content is empty, cannot generate PDF.');
    return null;
  }

  (<any>pdfMake).addVirtualFileSystem(pdfFonts);
  pdfMake.fonts = {
      Roboto: {
        normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
      },
  }

  try {
    // Extract only supported content
    const cleanedHtml = extractSupportedContent(htmlContent).trim();
    const wrappedHtml = `<div>${cleanedHtml}</div>`;

    const htmlConverted = htmlToPdfmake(wrappedHtml);

    console.log('converted html', htmlConverted);

    const docDefinition: any = {
      content: htmlConverted,
      font: "Roboto",
      defaultStyle: { font: 'Roboto' },
      pageMargins: [40, 60, 40, 60],
      pageSize: 'A4',
    };

    return new Promise((resolve, reject) => {
      pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
        if (blob) {
          resolve(new File([blob], fileName, { type: 'application/pdf' }));
        } else {
          reject(new Error('pdfmake getBlob returned null or undefined.'));
        }
      });
    });

  } catch (error) {
    console.error('BRO WHAT HAPPENED', error);
    return null;
  }
}