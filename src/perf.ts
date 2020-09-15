export class Transaction {
  private children: Transaction[] | undefined;
  private endCb: ((result: Transaction.Result) => void) | undefined;
  private name: string;

  private result: Transaction.Result | undefined;

  private startTime: bigint;

  private constructor(name: string) {
    this.name = name;
    this.startTime = process.hrtime.bigint();
  }

  public startChild(name: string): Transaction {
    const child = Transaction.startTransaction(name);
    if (!this.children) this.children = [];
    this.children.push(child);
    return child;
  }

  protected onEnd(cb: (result: Transaction.Result) => void): void {
    if (this.result) {
      return cb(this.result);
    }
    this.endCb = cb;
  }

  public getResult(): Transaction.Result | undefined {
    return this.result;
  }

  public async end(): Promise<Transaction.Result> {
    const proms = this.children?.map((child) => {
      return new Promise<Transaction.Result>((resolve) => {
        child.onEnd(resolve);
      });
    });

    const childrenResults = proms && await Promise.all(proms);
    const timing = process.hrtime.bigint() - this.startTime;

    const result = Transaction.Result.fromObject({
      name: this.name,
      timing,
      children: childrenResults
    });

    this.result = result;
    this.endCb?.(result);

    return result;
  }

  static startTransaction(name: string) {
    return new Transaction(name);
  }
}

// tslint:disable-next-line: no-namespace
export namespace Transaction {
  export class Result {
    readonly name: string;
    readonly timing: BigInt;
    readonly children?: Result[] | undefined;

    private constructor(name: string, timing: BigInt, children?: Result[]) {
      this.name = name;
      this.timing = timing;
      this.children = children;
    }

    public toString(prec: PRECISION): string {
      const output = this.children
        ?.map((child) => {
          const childResult = `| - ${child.toString(prec)}`;
          return childResult.replace(/\n/g, `\n|   `);
        })
        .join('\n|\n');
      const outTiming: number = prec === 'ns' ? Number(this.timing) : prec === 'ms' ? Number(this.timing) / 1000000 : Number(this.timing) / 1000000000;
      return `${this.name} - ${Math.round(outTiming)}${prec}${output ? `\n${output}` : ''}`;
    }

    static fromObject(obj: {name: string, timing: BigInt, children?: Result[]}) {
      return new Result(obj.name, obj.timing, obj.children);
    }
  }

  export enum PRECISION {
    NS = 'ns',
    MS = 'ms',
    S = 's'
  }
}
