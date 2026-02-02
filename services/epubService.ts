import JSZip from 'jszip';
import { Chapter } from '../types';

export const generateEpub = async (chapters: Chapter[], title: string = "Converted Novel", author: string = "AI Translator") => {
  const zip = new JSZip();
  const date = new Date().toISOString();
  const uuid = 'urn:uuid:' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // 1. mimetype (must be first, no compression)
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  // 2. Container
  zip.folder("META-INF")?.file("container.xml", `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
   <rootfiles>
      <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
   </rootfiles>
</container>`);

  const oebps = zip.folder("OEBPS");
  if (!oebps) throw new Error("Could not create OEBPS folder");

  // Filter only translated chapters
  const validChapters = chapters.filter(c => c.translation && c.translation.trim().length > 0);
  
  if (validChapters.length === 0) {
    throw new Error("Không có chương nào đã dịch để tạo EPUB.");
  }

  // 3. CSS
  oebps.file("style.css", `
    body { font-family: serif; line-height: 1.6; padding: 0 1em; }
    h1 { text-align: center; color: #333; margin-bottom: 1em; }
    p { margin-bottom: 1em; text-align: justify; }
  `);

  // 4. Chapter Files
  let manifestItems = '';
  let spineItems = '';
  let navPoints = '';

  validChapters.forEach((chapter, index) => {
    const filename = `chapter_${index + 1}.xhtml`;
    const chapterTitle = chapter.title || chapter.filename.replace('.txt', '');
    
    // Convert content to HTML paragraphs
    const htmlContent = chapter.translation
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => `<p>${line.trim()}</p>`)
      .join('\n');

    const xhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${chapterTitle}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h1>${chapterTitle}</h1>
  ${htmlContent}
</body>
</html>`;

    oebps.file(filename, xhtml);

    const id = `chap${index + 1}`;
    manifestItems += `<item id="${id}" href="${filename}" media-type="application/xhtml+xml"/>\n`;
    spineItems += `<itemref idref="${id}"/>\n`;
    navPoints += `
    <navPoint id="navPoint-${index + 1}" playOrder="${index + 1}">
      <navLabel><text>${chapterTitle}</text></navLabel>
      <content src="${filename}"/>
    </navPoint>`;
  });

  // 5. OPF File
  const opfContent = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${title}</dc:title>
    <dc:creator opf:role="aut">${author}</dc:creator>
    <dc:language>vi</dc:language>
    <dc:identifier id="BookId" opf:scheme="UUID">${uuid}</dc:identifier>
    <dc:date>${date}</dc:date>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="style" href="style.css" media-type="text/css"/>
    ${manifestItems}
  </manifest>
  <spine toc="ncx">
    ${spineItems}
  </spine>
</package>`;

  oebps.file("content.opf", opfContent);

  // 6. NCX (Table of Contents)
  const ncxContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${uuid}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${title}</text></docTitle>
  <navMap>
    ${navPoints}
  </navMap>
</ncx>`;

  oebps.file("toc.ncx", ncxContent);

  return await zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
};