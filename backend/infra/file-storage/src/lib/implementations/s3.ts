import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  CompleteMultipartUploadCommandOutput,
  AbortMultipartUploadCommandOutput,
  PutObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileStorage } from '../file-storage'
import { z } from 'zod'

const envSchema = z.object({
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_DEFAULT_REGION: z.string(),
  S3_BUCKET: z.string()
})
const { AWS_ACCESS_KEY_ID: accessKeyId, AWS_SECRET_ACCESS_KEY: secretAccessKey, AWS_DEFAULT_REGION: defaultRegion, S3_BUCKET: s3Bucket } = envSchema.parse(process.env)

export class S3FileStorageService implements FileStorage {
  private s3: S3Client
  constructor() {
    this.s3 = new S3Client({
      region: defaultRegion,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    })
  }

  async deleteFromStorage(params: FileStorage.deleteParams): Promise<FileStorage.deleteResult> {
    const { key } = params
    await this.s3.send(new DeleteObjectCommand({ Key: key, Bucket: s3Bucket }))
  }

  async getFileFromStorage(params: FileStorage.getParams): Promise<FileStorage.getResult> {
    const { key, } = params
    const result = await this.s3.send(
      new GetObjectCommand({
        Key: key,
        Bucket: s3Bucket
      })
    )
    if (result.Body) {
      return { object: result.Body }
    }
    return null
  }

  async uploadToStorage(params: FileStorage.uploadParams): Promise<FileStorage.uploadResult> {
    const { key, file, contentType = '' } = params
    const upload = new Upload({
      client: this.s3,
      params: { Bucket: s3Bucket, Key: key, Body: file, ContentType: contentType }
    })
    const result = await upload.done()
    if (this.isCompleteMultipartUploadCommandOutput(result) && result.Key) {
      const locationPrefix = `https://s3.amazonaws.com/${folder}/`
      return { key: result.Key, url: locationPrefix + result.Key }
    }
    throw new Error('Error uploading file')
  }

  private isCompleteMultipartUploadCommandOutput(
    result: CompleteMultipartUploadCommandOutput | AbortMultipartUploadCommandOutput
  ): result is CompleteMultipartUploadCommandOutput {
    return result.$metadata.httpStatusCode === 200
  }
  async moveFileWithinFolders(
    params: FileStorage.moveFileWithinFoldersParams,
  ): Promise<void> {
    const { sourceKey, targetKey } = params;
    await this.s3.send(
      new CopyObjectCommand({
        CopySource: `${s3Bucket}/${sourceKey}`, // Source bucket + key
        Bucket: s3Bucket, // Destination Bucket
        Key: targetKey, // Destination Key
      }),
    );
    await this.s3.send(
      new DeleteObjectCommand({ Key: sourceKey, Bucket: s3Bucket }),
    );
  }
  async getSignedUrl(
    params: FileStorage.getSignedUrlParams,
  ): Promise<FileStorage.uploadSignedUrlResult> {
    const { key, expirationInSeconds, action } = params;
    const commandMapperByAction = {
      putObject: PutObjectCommand,
      getObject: GetObjectCommand,
    };
    const command = new commandMapperByAction[action]({
      Bucket: s3Bucket,
      Key: key,
    });
    const url = await getSignedUrl(this.s3, command, {
      expiresIn: expirationInSeconds,
    });
    return { key, uploadUrl: url };
  }
}
