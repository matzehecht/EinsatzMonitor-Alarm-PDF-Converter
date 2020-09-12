export interface Config {
  sections: Section[];
  output?: Output;
}

export interface Section {
  key: string;
  type: 'keyValue' | 'table' | 'try';
}

interface Output {
  table?: {
    columnSeparator?: string;
    printRowHeaders?: boolean;
  };
}
