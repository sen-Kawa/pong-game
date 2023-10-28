import { extname } from 'path'
import { HttpException, HttpStatus } from '@nestjs/common'

const fileLocation = './files'
const maxFileSize = 1024 * 1024
export const multerConfig = {
  dest: fileLocation
}

export const editFileName = (req: any, file: any, callback: any) => {
  callback(null, req.user.userName)
}

export const multerOptions = {
  // Enable file size limits
  limits: {
    fileSize: maxFileSize
  },
  // Check the mimetypes to allow for upload
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      // Allow storage of file
      cb(null, true)
    } else {
      // Reject file
      cb(
        new HttpException(
          `Unsupported file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST
        ),
        false
      )
    }
  }
}
