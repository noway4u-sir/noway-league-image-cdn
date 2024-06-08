import { PutObjectCommand, S3Client, type PutObjectCommandInput } from "@aws-sdk/client-s3"
import { readFileSync } from "fs"
import { Glob } from "bun";
export const uploadImagesFolder = async (cwd: string = 'images') => {
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env['S3_ENDPOINT']!!,
    credentials: {
      accessKeyId: process.env['AWS_ACCESS_KEY_ID']!!,
      secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY']!!
    }
  })

  const files = new Glob('**/*.*').scanSync({ 'cwd': cwd })

  const promises = []
  for (const file of files) {
    const fullFilePath = `${cwd}/${file}`
    // Now upload each and every file to the S3 bucket
    console.log('reading file: ', fullFilePath)
    const fileStream = readFileSync(fullFilePath)
    const bunFile = Bun.file(fullFilePath);

    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env['S3_BUCKET']!!,
      Key: fullFilePath,
      Body: fileStream,
      ContentType: bunFile.type,
    }
    const cmd = new PutObjectCommand(uploadParams)

    promises.push(s3Client.send(cmd).then(res => {
      console.log('uploaded file: ', fullFilePath)
      console.log('response: ', res.$metadata.requestId)
    }))
  }

  await Promise.all(promises)
}


