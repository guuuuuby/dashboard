const mimeTypeMap: Record<string, string> = {
  html: 'Документ HTML',
  txt: 'Документ текстовий',
  json: 'Документ JSON',
  xml: 'Документ XML',
  jpg: 'Зображення JPEG',
  jpeg: 'Зображення JPEG',
  png: 'Зображення PNG',
  gif: 'Зображення GIF',
  pdf: 'Документ PDF',
  zip: 'Архів ZIP',
  rar: 'Архів RAR',
  mp3: 'Аудіо MP3',
  mp4: 'Відео MP4',
  css: 'Стилі CSS',
  js: 'Сценарій JavaScript',
  doc: 'Документ Word',
  docx: 'Документ Word',
  xls: 'Документ Excel',
  xlsx: 'Документ Excel',
  ppt: 'Презентація PowerPoint',
  pptx: 'Презентація PowerPoint',
};

const fallback = 'Документ';

export function displayFileType(filename: string): string {
  const match = filename.match(/(?<=\.)\w+$/gi);
  if (!match) return fallback;
  const extension = match[0];
  return mimeTypeMap[extension.toLowerCase()] ?? fallback;
}
