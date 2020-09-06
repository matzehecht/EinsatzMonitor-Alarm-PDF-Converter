import * as Config from './config';

export function extract(raw: string, config: Config.Config): Parsed {
  
  const rawArray = raw.split(/\r?\n/);

  const sections = config.sections;

  const extractedSection = {} as Parsed;
  sections.forEach((s) => (extractedSection[s.key] = extractSection(rawArray, s)));
  return extractedSection;
}

function extractSection(rawArray: string[], section: Config.Section): ParsedSection {

  // Find first line of section. If a section spans over two pages there can be two first lines.
  const indexes = rawArray.reduce((prev, r, i) => (r.includes(section.key) ? prev.concat(i) : prev), [] as number[]);

  const subSections = indexes.map((i) => extractSubSection(rawArray, section, i));

  return Array.isArray(subSections[0]) ? subSections.flat() : subSections.reduce((p, c) => ({...p, ...c}), {});
}

function extractSubSection(rawArray: string[], section: Config.Section, index: number): ParsedSection {

  const trimmedLeft = rawArray.slice(index);

  const endIndex = trimmedLeft.findIndex((r) => r.trim().length === 0);

  const relevantLines = trimmedLeft.slice(0, endIndex);

  switch (section.type) {
    case 'keyValue': 
      return extractKeyVal(relevantLines);
    case 'table':
      return extractTable(relevantLines);
    case 'try':
      const triedIsTable = rawArray[index].startsWith('     ');
      if (triedIsTable) {
        return extractTable(relevantLines);
      } else {
        return extractKeyVal(relevantLines);
      }
  }
}

function extractTable(rawArray: string[]): ParsedTableSectionRow[] {
  const columnIndexes = rawArray[0].match(/(\s\s|^)(\S)/g)?.reduce((prev, m) => prev.concat(rawArray[0].indexOf(m, prev[prev.length-1]) + m.search(/\S/)), [] as number[]);
  
  const columns = columnIndexes?.map(i => rawArray[0].substring(i).split(/\s\s/)[0]);

  if (!columnIndexes || !columns) throw new Error('No columns found in Tamle');

  if (columnIndexes[0] !== 0) {
    columnIndexes.unshift(0);
    columns.unshift('columns');
  }

  const rows = rawArray.slice(1).map(r => {
    const row = {} as ParsedTableSectionRow;

    columnIndexes?.forEach((c, i) => {
      row[columns[i]] = r.slice(minNull(c - 2)).trim().split(/\s\s/)[0];
    })

    return row;
  });

  return rows;
}

function minNull(input: number) {
  return input < 0 ? 0 : input;
}

function extractKeyVal(rawArray: string[]): ParsedKVSection {
  const linesWithoutHeading = rawArray.slice(1);

  const extracted = {} as ParsedKVSection;

  linesWithoutHeading.forEach((l, i) => {
    const key = l.split(/\s\s/)[0];
    
    const trimmedKey = key.trim();

    if (trimmedKey !== '') {
      const indexVal = l.split('').findIndex((c, i) => i > key.length && !c.match(/\s/));

      const val = l.slice(indexVal).split(/\s\s/)[0]

      extracted[trimmedKey] = val.trim();

      const endIndexVal = indexVal + val.length;
      const restString = l.slice(endIndexVal).trim();;

      if (restString.startsWith('Datum:')) extracted.Datum = restString.replace('Datum:', '').split(/\s\s/)[0].trim();
      if (restString.startsWith(trimmedKey)) extracted[trimmedKey] = extracted[trimmedKey] + ' ' + restString.replace(RegExp(trimmedKey + '( \\d*)?'), '').split(/\s\s/)[0].trim();
      
      linesWithoutHeading.every((nl, ni) => {
        if (ni <= i) return true;
        if (!nl.startsWith('     ')) return false;
        extracted[trimmedKey] = extracted[trimmedKey] + ' ' + nl.slice(indexVal).split(/\s\s/)[0];
      
        return true;
      });
    }
  });

  return extracted;
}

export interface ParsedTableSectionRow {
  [key: string]: string;
}

export interface ParsedKVSection {
  [key: string]: string;
}

type ParsedSection = ParsedKVSection | ParsedTableSectionRow[];

export interface Parsed {
  [key: string]: ParsedSection;
}
