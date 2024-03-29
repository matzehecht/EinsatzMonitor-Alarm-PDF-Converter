import { Input, SectionType } from './config';
import * as TraceIt from 'trace-it';

const WELL_KNOWN_KEYS = ['Datum'];

export function extract(raw: string, inputConfig: Input, parentTransaction?: TraceIt.Transaction): Parsed {
  const rawArray = raw.split(/\r?\n/);

  const exInTextKeys = inputConfig.inTextKeys.reduce((prev, inTextKey) => {
    const indexes: number[] = [];
    const extracted = rawArray.reduce((extractedPrev, line, i) => {
      if (line.includes(inTextKey)) {
        indexes.push(i);
        const match = line.match(RegExp(`\\s\\s((\\S+\\s)*${inTextKey}(\\s\\S+)*)(\\s\\s)?`))?.[0];
        rawArray[i] = line.replace(match || '', '');
        return `${extractedPrev} ${match?.trim()}`;
      } else {
        return extractedPrev;
      }
    }, '');
    prev[inTextKey] = extracted.trim();
    return prev;
  }, {} as ParsedKVSection);

  const extractedSection: Parsed = {
    inText: exInTextKeys
  };

  const sectionKeyRegExp = RegExp(`(^|[^a-zA-Z0-9])(${Object.keys(inputConfig.sections).join('|')})([^a-zA-Z0-9]|$)`);
  const indexes = rawArray.reduce<[number, string][]>((prev, line, i) => {
    const matches = line.match(sectionKeyRegExp);
    if (matches && rawArray[i - 1].trim().length === 0) {
      prev.push([i, matches[2]]);
    }
    return prev;
  }, []);

  const sectionSlices = indexes.reduce<Record<string, string[][]>>((prev, [index, key], i) => {
    const prevSectionArray = prev[key] ?? [];

    const nextIndex = indexes[i + 1]?.[0] ?? Infinity;
    const sectionSlice = rawArray.slice(index, nextIndex);
    prevSectionArray.push(sectionSlice);
    prev[key] = prevSectionArray;

    return prev;
  }, {});

  Object.entries(sectionSlices).forEach(([sectionKey, slices]) => (extractedSection[sectionKey] = extractSections(inputConfig.sections[sectionKey], slices)));
  return extractedSection;
}

function extractSections(sectionType: SectionType, slices: string[][]): ParsedSection {
  const subSections = slices.map((slice) => extractSubSections(slice, sectionType));

  return Array.isArray(subSections[0]) ? subSections.flat() : subSections.reduce((p, c) => ({ ...p, ...c }), {});
}

function extractSubSections(slice: string[], sectionType: SectionType): ParsedSection {
  switch (sectionType) {
    case 'keyValue':
      return extractKeyVal(slice);
    case 'table':
      return extractTable(slice);
    case 'try':
      const triedIsTable = slice[0].startsWith('     ');
      if (triedIsTable) {
        return extractTable(slice);
      } else {
        return extractKeyVal(slice);
      }
  }
}

function extractTable(rawArray: string[]): ParsedTableSectionRow[] {
  const trimmedRawArray = rawArray.slice(0, rawArray.indexOf(''));
  const columnIndexes = trimmedRawArray[0]
    .match(/(\s\s|^)(\S)/g)
    ?.reduce((prev, match) => prev.concat(trimmedRawArray[0].indexOf(match, prev[prev.length - 1]) + match.search(/\S/)), [] as number[]);

  const columns = columnIndexes?.map((i) => trimmedRawArray[0].substring(i).split(/\s\s/)[0]);

  if (columnIndexes && columns) {
    if (columnIndexes[0] !== 0) {
      columnIndexes.unshift(0);
      columns.unshift('');
    }

    const rows = trimmedRawArray.slice(1).map((line) => {
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
  return [];
}

function minNull(input: number) {
  return input < 0 ? 0 : input;
}

function extractKeyVal(rawArray: string[]): ParsedKVSection {
  const linesWithoutHeading = rawArray.slice(1);

  const extracted = linesWithoutHeading.reduce((prev, line, indexLine) => {
    const key = line.split(/\s\s/)[0];
    const trimmedKey = key.trim();
    if (trimmedKey !== '') {
      const lineWithoutKey = line.slice(key.length);
      // If value in this line is empty
      if (!lineWithoutKey.trim()) {
        prev[trimmedKey] = '';
        return prev;
      }

      const indexValue = lineWithoutKey.search(/\S/) + key.length;
      const value = line.slice(indexValue).split(/\s\s/)[0];

      // if the value starts with a lot white spaces (empty value but date on the right)
      // skip to the stuff with rest string and well known keys.
      if (indexValue - key.length < 25) {
        prev[trimmedKey] = value.trim();
      }

      // if the value starts with a lot white spaces (see if clause above)
      // start the rest string on kex.length
      const endIndexValue = indexValue - key.length < 25 ? indexValue + value.length : key.length;
      const restString = line.slice(endIndexValue).trim();

      const isWellKnown = WELL_KNOWN_KEYS.find((k) => restString.startsWith(k));
      if (isWellKnown) {
        prev[isWellKnown] = restString
          .replace(RegExp(`^${isWellKnown}[^a-zA-Z0-9]*`), '')
          .split(/\s\s/)[0]
          .trim();
      } else if (restString.startsWith(trimmedKey)) {
        const restKey = restString.match(RegExp(`^${trimmedKey}([^a-zA-Z0-9][a-zA-Z0-9]*)?`))?.[0];
        if (restKey === trimmedKey) {
          extracted[trimmedKey] += ' ' + restString.replace(trimmedKey, '').split(/\s\s/)[0].trim();
        } else if (restKey) {
          prev[restKey] = restString.replace(restKey, '').split(/\s\s/)[0].trim();
        }
      }

      linesWithoutHeading.slice(indexLine + 1).every((lineBelow) => {
        if (lineBelow.trim().length === 0 || !lineBelow.startsWith('     ')) return false;
        prev[trimmedKey] += ' ' + lineBelow.slice(indexValue).split(/\s\s/)[0].trim();
        return true;
      });
    }
    return prev;
  }, {} as ParsedKVSection);

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
