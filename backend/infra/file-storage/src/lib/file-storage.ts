import { Readable } from 'stream'

export interface FileStorage {
  deleteFromStorage(params: FileStorage.deleteParams): Promise<FileStorage.deleteResult>
  getFileFromStorage(params: FileStorage.getParams): Promise<FileStorage.getResult>
  uploadToStorage(params: FileStorage.uploadParams): Promise<FileStorage.uploadResult>
  moveFileWithinFolders(
    params: FileStorage.moveFileWithinFoldersParams,
  ): Promise<void>;
}

export namespace FileStorage {
  export type uploadParams = {
    key: string
    file: string | Uint8Array | Buffer | Readable | ReadableStream | Blob
    contentType?: string
  }
  export type uploadResult = {
    key: string
    url: string
  }

  export type deleteParams = {
    key: string
  }
  export type deleteResult = void

  export type getParams = {
    key: string
  }
  export type getResult = {
    object: Readable | ReadableStream | Blob
  } | null
  export type moveFileWithinFoldersParams = {
    sourceKey: string;
    targetKey: string;
  };
  export type getSignedUrlParams = {
    key: string;
    action: 'putObject' | 'getObject';
    expirationInSeconds: number;
  };
  export type uploadSignedUrlResult = {
    key: string;
    uploadUrl: string;
  };
}
