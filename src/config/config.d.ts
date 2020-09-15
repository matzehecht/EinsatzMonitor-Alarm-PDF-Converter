export interface Config {
  input: Input;
  output: Output;
  runner?: Runner;
}

export interface Runner {
  inputDir: string;
  outputDir: string;
  archiveDir?: string;
  interval: number
}

export interface Input {
  sections: Section;
  inTextKeys: string[]
}

export type SectionType = 'keyValue' | 'table' | 'try'

export interface Section {
  [ keyWord: string ]: SectionType;
}

export interface Output {
  keys: {
    [key: string]: Key;
  };
  separator?: string;
  keyValueSeparator?: string;
}

export type Key = KeyValueKey | TableKey;

export interface BaseKey {
  inputSection: string | 'inText';
  filter?: string;
}

export interface KeyValueKey extends BaseKey {
  inputKeyWords: string[];
}

export type TableKey = ListByWordKey | ValueByWordKey | ValueIndexKey;

export interface ListByWordKey extends BaseKey {
  type: 'column' | 'row';
  inputKeyWord: string;
}

export interface ValueByWordKey extends BaseKey {
  inputKeyWords: string[];
  index: number;
}

export interface ValueIndexKey extends BaseKey {
  rowIndex: number;
  columnIndex: number;
}
