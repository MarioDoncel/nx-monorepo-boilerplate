import { Constructor } from '@monorepo/interfaces';
import { randomUUID } from 'node:crypto';
export class BaseUuidEntity {
  private readonly _id: string;
  private readonly _created_at: Date = new Date();
  constructor(params: Constructor<BaseUuidEntity>) {
    this._id = params.id || randomUUID();
    this._created_at = params.created_at || new Date();
  }
  get id() {
    return this._id;
  }
  get created_at() {
    return this._created_at;
  }
}

export class BaseSequentialEntity {
  private readonly _id: number | null;
  private readonly _created_at: Date = new Date();
  constructor(params: Constructor<BaseSequentialEntity>) {
    this._id = params.id ?? null;
    this._created_at = params.created_at ?? new Date();
  }
  get id() {
    return this._id;
  }
  get created_at() {
    return this._created_at;
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MakeUpdatable<Base extends new (...args: any[]) => object>(
  Base: Base
) {
  return class extends Base {
    #updated_at: Date;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.#updated_at = args[0]?.updated_at || new Date();
    }
    get updated_at() {
      return this.#updated_at;
    }

    markAsUpdated() {
      this.#updated_at = new Date();
    }
  };
}
// export class UpdatableBaseEntity {
//   private _updated_at: Date = new Date()
//   constructor(params: Constructor<UpdatableBaseEntity>) {
//     this._updated_at = params.updated_at || new Date()
//   }
//   get updated_at() {
//     return this._updated_at
//   }
// }
export function MakeSoftDeletable<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Base extends new (...args: any[]) => Record<string, unknown>
>(Base: Base) {
  return class extends Base {
    #deleted_at?: Date | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.#deleted_at = args[0]?.deleted_at;
    }
    get deleted_at() {
      return this.#deleted_at;
    }
    delete() {
      this.#deleted_at = new Date();
    }
  };
}

// export class SoftDeletableBaseEntity {
//   private _deleted_at?: Date
//   constructor(params: Constructor<SoftDeletableBaseEntity>) {
//     this._deleted_at = params.deleted_at
//   }
//   get deleted_at() {
//     return this._deleted_at
//   }

//   delete() {
//     this._deleted_at = new Date()
//   }
// }
