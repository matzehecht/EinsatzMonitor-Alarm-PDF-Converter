import { Config, SectionType } from './config';
import { Transaction } from './perf';

export function extract(raw: string, config: Config, parentTransaction?: Transaction): Parsed {
  const rawArray = raw.split(/\r?\n/);

  const exInTextKeys = config.input.inTextKeys.reduce((prev, inTextKey) => {
    const indexes: number[] = [];
    const extracted = rawArray.reduce((extractedPrev, line, i) => {
      if (line.includes(inTextKey)) {
        indexes.push(i);
        return [extractedPrev, line.trim()].join(' ');
      } else {
        return extractedPrev;
      }
    }, '');
    indexes.forEach(i => rawArray.splice(i, 1));
    prev[inTextKey] = extracted.trim();
    return prev;
  }, {} as ParsedKVSection);

  const extractedSection: Parsed = {
    inText: exInTextKeys
  };

  const sections = config.input.sections;

  Object.entries(sections).forEach(section => extractedSection[section[0]] = extractSection(rawArray, section));
  return extractedSection;
}

function extractSection(rawArray: string[], [sectionKey, sectionType]: [string, SectionType]): ParsedSection {
  // Find first line of section. If a section spans over two pages there can be two first lines.
  const indexes = rawArray.reduce((prev, r, i) => (r.includes(sectionKey) ? prev.concat(i) : prev), [] as number[]);

  const subSections = indexes.map(i => extractSubSection(rawArray, sectionType, i));

  return Array.isArray(subSections[0]) ? subSections.flat() : subSections.reduce((p, c) => ({ ...p, ...c }), {});
}

function extractSubSection(rawArray: string[], sectionType: SectionType, index: number): ParsedSection {
  const trimmedLeft = rawArray.slice(index);

  const endIndex = trimmedLeft.findIndex(line => line.trim().length === 0);

  const relevantLines = trimmedLeft.slice(0, endIndex);

  switch (sectionType) {
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
  const columnIndexes = rawArray[0]
    .match(/(\s\s|^)(\S)/g)
    ?.reduce((prev, match) => prev.concat(rawArray[0].indexOf(match, prev[prev.length - 1]) + match.search(/\S/)), [] as number[]);

  const columns = columnIndexes?.map(i => rawArray[0].substring(i).split(/\s\s/)[0]);

  if (!columnIndexes || !columns) throw new Error('No columns found in Table');

  if (columnIndexes[0] !== 0) {
    columnIndexes.unshift(0);
    columns.unshift('');
  }

  const rows = rawArray.slice(1).map(line => {
    const row = {} as ParsedTableSectionRow;

    columnIndexes?.forEach((columnIndex, i) => {
      row[columns[i]] = line
        .slice(minNull(columnIndex - 2))
        .trim()
        .split(/\s\s/)[0]
        .trim();
    });

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

  linesWithoutHeading.forEach((line, indexLine) => {
    const key = line.split(/\s\s/)[0];

    const trimmedKey = key.trim();

    if (trimmedKey !== '') {
      const indexValue = line.slice(key.length).search(/\S/) + key.length;

      const value = line.slice(indexValue).split(/\s\s/)[0];

      extracted[trimmedKey] = value.trim();

      const endIndexValue = indexValue + value.length;
      const restString = line.slice(endIndexValue).trim();

      if (restString.startsWith('Datum:')) extracted.Datum = restString.replace('Datum:', '').split(/\s\s/)[0].trim();
      if (restString.startsWith(trimmedKey))
        extracted[trimmedKey] =
          extracted[trimmedKey] +
          ' ' +
          restString
            .replace(RegExp(trimmedKey + '( \\d*)?'), '')
            .split(/\s\s/)[0]
            .trim();

      linesWithoutHeading.every((lineBelow, indexBelow) => {
        if (indexBelow <= indexLine) return true;
        if (!lineBelow.startsWith('     ')) return false;
        extracted[trimmedKey] = extracted[trimmedKey] + ' ' + lineBelow.slice(indexValue).split(/\s\s/)[0].trim();

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

export type ParsedSection = ParsedKVSection | ParsedTableSectionRow[];

export interface Parsed {
  [key: string]: ParsedSection;
}
