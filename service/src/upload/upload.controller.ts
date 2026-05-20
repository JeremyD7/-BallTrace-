import {
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService, UploadResult } from './upload.service';

// 配置 Multer 存储
const storage = diskStorage({
  destination: (req, file, cb) => {
    const extension = extname(file.originalname).toLowerCase().slice(1);
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const subDir = imageTypes.includes(extension) ? 'images' : 'videos';
    cb(null, `uploads/${subDir}`);
  },
  filename: (req, file, cb) => {
    const extension = extname(file.originalname);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    cb(null, `${timestamp}_${random}${extension}`);
  },
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const originalName = file.originalname.toLowerCase();
  const extension = extname(originalName).slice(1);
  
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'jpe', 'jfif', 'pjpeg', 'pjp'];
  const videoTypes = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv', 'mpeg', 'mpg'];
  
  const hasValidExtension = imageTypes.includes(extension) || videoTypes.includes(extension);
  
  const mimeType = file.mimetype.toLowerCase();
  const isImageMime = mimeType.startsWith('image/');
  const isVideoMime = mimeType.startsWith('video/');
  
  if (hasValidExtension || isImageMime || isVideoMime) {
    cb(null, true);
  } else {
    cb(new BadRequestException('只支持图片和视频文件'), false);
  }
};

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('media')
  @UseInterceptors(
    FilesInterceptor('files', 9, {
      storage,
      fileFilter,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB 限制
      },
    }),
  )
  async uploadMedia(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return {
        success: false,
        message: '请选择文件',
        data: [],
      };
    }

    const results: UploadResult[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const extension = extname(file.originalname).toLowerCase().slice(1);
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'jpe', 'jfif', 'pjpeg', 'pjp'];
        const videoTypes = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv', 'mpeg', 'mpg'];
        
        let type: 'image' | 'video' = 'image';
        let subDir = 'images';
        
        if (videoTypes.includes(extension)) {
          type = 'video';
          subDir = 'videos';
        } else if (!imageTypes.includes(extension)) {
          const mimeType = file.mimetype.toLowerCase();
          if (mimeType.startsWith('video/')) {
            type = 'video';
            subDir = 'videos';
          }
        }
        
        results.push({
          url: `/uploads/${subDir}/${file.filename}`,
          filename: file.filename,
          type,
        });
      } catch (error) {
        errors.push(`${file.originalname}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      message: errors.length > 0 ? errors.join('; ') : '上传成功',
      data: results,
    };
  }
}