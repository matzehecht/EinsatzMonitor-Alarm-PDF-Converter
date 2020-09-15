const CHILD_INDENT = '  | ';

export class Transaction {
  private children: Transaction[] = [];
  private endCbs: ((result: Transaction.Result) => void)[] = [];
  private name: string;

  private result: Transaction.Result | undefined;

  private startTime: bigint;

  private constructor(name: string) {
    this.name = name;
    this.startTime = process.hrtime.bigint();
  }

  public startChild(name: string): Transaction {
    const child = Transaction.startTransaction(name);
    this.children.push(child);
    return child;
  }

  protected onEnd(cb: (result: Transaction.Result) => void): void {
    if (this.result) {
      return cb(this.result);
    }
    this.endCbs.push(cb);
  }

  public getResult(): Transaction.Result | undefined {
    return this.result;
  }

  public async end(): Promise<Transaction.Result> {
    const proms = this.children.map((child) => {
      return new Promise<Transaction.Result>((resolve) => {
        return child.onEnd((result) => {
          console.log('cb -> result', result.name, result);
          resolve(result);
        });
      });
    });

    const childrenResults = await Promise.all(proms);
    const timing = process.hrtime.bigint() - this.startTime;

    const result = {
      name: this.name,
      timing,
      children: childrenResults
    };

    this.result = result;
    this.endCbs.forEach(cb => cb);
    console.log('Transaction -> this.endCbs', this.endCbs);

    console.log('Transaction -> result', this.name, result);
    return result;
  }

  static startTransaction(name: string) {
    return new Transaction(name);
  }
}

// tslint:disable-next-line: no-namespace
export namespace Transaction {
  export interface Result {
    readonly name: string;
    readonly timing: BigInt;
    readonly children?: Result[];
  }

  export class Result {
    public toString(prec: PRECISION): string {
      const output = this.children
        ?.map((child) => {
          const childResult = `${CHILD_INDENT}${child.toString(prec)}`;
          return childResult.replace('\n', `\n${CHILD_INDENT}`);
        })
        .join('\n');
      const outTiming: number = prec === 'ns' ? Number(this.timing) : prec === 'ms' ? Number(this.timing) / 1000000 : Number(this.timing) / 1000000000;
      return `${this.name} - ${outTiming}${prec}\n${output}`;
    }
  }

  export enum PRECISION {
    NS = 'ns',
    MS = 'ms',
    S = 's'
  }
}
