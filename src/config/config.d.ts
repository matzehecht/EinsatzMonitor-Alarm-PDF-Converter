export interface Config {
  input: Input;
  output: Output;
  service?: Service;
}

export interface Service {
  inputDir: string;
  outputDir: string;
  archiveDir?: string;
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
  required?: boolean;
  prefix?: string;
  suffix?: string;
  filter?: string;
}

export interface KeyValueKey extends BaseKey {
  inputKeyWords: string[];
  default?: string;
}

export type TableKey = ListByWordKey | ValueByWordKey | ValueIndexKey;

export interface ListByWordKey extends BaseKey {
  type: 'column' | 'row';
  inputKeyWord: string;
  default?: string[];
}

export interface ValueByWordKey extends BaseKey {
  inputKeyWords: string[];
  index: number;
  default?: string;
}

export interface ValueIndexKey extends BaseKey {
  rowIndex: number;
  columnIndex: number;
  default?: string;
}
