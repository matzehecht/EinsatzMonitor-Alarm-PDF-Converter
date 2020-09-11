import * as fs from 'fs';

export function load(path?: string): Config {
  let config;
  if (path) {
    const stringConfig = fs.readFileSync(path, { encoding: 'utf-8' });
    config = JSON.parse(stringConfig);
  } else {
    config = DEFAULT_CONFIG;
  }

  const [res, msg] = validateConfig(config);

  if (!res) {
    throw new Error('VALIDATION: ' + msg);
  }

  return config;
}

const DEFAULT_CONFIG = {
  sections: [
    {
      key: 'Einsatzanlass',
      type: 'keyValue'
    },
    {
      key: 'Einsatzort',
      type: 'try'
    },
    {
      key: 'EM',
      type: 'table'
    }
  ],
  output: {
    table: {
      columnSeparator: ';'
    }
  }
};

function validateConfig(config: any): [boolean, string] {
  let result = true;
  let msg = '';
  Object.entries(ConfigAssertion).forEach(([key, val]) => {
    [result, msg] = validateSubConfig(config[key], key, val);
  });
  return [result, msg];
}

function validateSubConfig(config: any, key: string, val: IConfigAssertionTypes): [boolean, string] {
  if (val.required && !config) return [false, `Required property ${key} is missing`];

  if (isPrimitive(val.type) && val.type !== typeof config) return [false, `Property ${key} is type ${typeof config} but should be type ${val.type}`];

  if (val.type === 'array') {
    if (!Array.isArray(config)) return [false, `Property ${key} is type object but should be type array`];

    if (isPrimitive(val.children) && (config as any[]).find((v) => typeof v !== val.children))
      return [false, `Property ${key} should only have children of type ${val.children}`];

    if (!isPrimitive(val.children)) {
      let [tmpRes, tmpMsg] = [true, ''];

      (config as any[]).forEach((v) => {
        Object.entries(val.children as IConfigAssertion).forEach(([subKey, val]) => {
          [tmpRes, tmpMsg] = validateSubConfig(v[subKey], subKey, val);
          if (!tmpRes) return [false, tmpMsg];
          return [true, ''];
        });
        if (!tmpRes) return [false, tmpMsg];
        return [true, ''];
      });
    }
  }
  if (val.type === 'object') {
    if (typeof config !== 'object') return [false, `Property ${key} should be type object`];

    let [tmpRes, tmpMsg] = [true, ''];

    Object.entries(val.properties).forEach(([subKey, val]) => {
      [tmpRes, tmpMsg] = validateSubConfig(config[subKey], subKey, val);
      if (!tmpRes) return [false, tmpMsg];
      return [true, ''];
    });

    if (!tmpRes) return [false, tmpMsg];
  }

  return [true, ''];
}

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
  };
}

const ConfigAssertion: IConfigAssertion = {
  sections: {
    required: true,
    type: 'array',
    children: {
      key: {
        required: true,
        type: 'string'
      },
      type: {
        required: true,
        type: 'string' // is a enum
      }
    }
  },
  output: {
    required: false,
    type: 'object',
    properties: {
      table: {
        required: false,
        type: 'object',
        properties: {
          columnSeparator: {
            required: false,
            type: 'string'
          }
        }
      }
    }
  }
};

interface IConfigAssertion {
  [key: string]: IConfigAssertionTypes;
}

type IConfigAssertionTypes = IConfigAssertionPrimitive | IConfigAssertionArray | IConfigAssertionObject;

type primitive = 'string' | 'number' | 'bigint' | 'boolean';
const isPrimitive = (type: any): type is primitive => ['string', 'number', 'bigint', 'boolean'].includes(type);

type types = primitive | 'object' | 'array';

interface IConfigAssertionsBase {
  required: boolean;
  type: types;
}

interface IConfigAssertionPrimitive extends IConfigAssertionsBase {
  required: boolean;
  type: primitive;
}

interface IConfigAssertionArray extends IConfigAssertionsBase {
  required: boolean;
  type: 'array';
  children: IConfigAssertion | primitive;
}

interface IConfigAssertionObject extends IConfigAssertionsBase {
  required: boolean;
  type: 'object';
  properties: IConfigAssertion;
}
