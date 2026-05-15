import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import * as fs from 'fs';
import { ensureDirSync } from 'fs-extra';

export interface UploadResult {
  url: string;
  filename: string;
  type: 'image' | 'video';
}

@Injectable()
export class UploadService {
  private readonly uploadDir = 'uploads';
  private readonly imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  private readonly videoTypes = ['mp4', 'mov', 'avi', 'webm'];

  constructor() {
    ensureDirSync(this.uploadDir);
    ensureDirSync(`${this.uploadDir}/images`);
    ensureDirSync(`${this.uploadDir}/videos`);
  }

  getFileExtension(filename: string): string {
    return extname(filename).toLowerCase().slice(1);
  }

  getFileType(extension: string): 'image' | 'video' | null {
    if (this.imageTypes.includes(extension)) {
      return 'image';
    }
    if (this.videoTypes.includes(extension)) {
      return 'video';
    }
    return null;
  }

  generateFilename(originalName: string): string {
    const extension = this.getFileExtension(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${timestamp}_${random}.${extension}`;
  }

  async saveFile(file: Express.Multer.File): Promise<UploadResult> {
    const extension = this.getFileExtension(file.originalname);
    const fileType = this.getFileType(extension);

    if (!fileType) {
      throw new Error('Unsupported file type');
    }

    const filename = this.generateFilename(file.originalname);
    const subDir = fileType === 'image' ? 'images' : 'videos';
    const filePath = `${this.uploadDir}/${subDir}/${filename}`;

    await fs.promises.writeFile(filePath, file.buffer);

    return {
      url: `/uploads/${subDir}/${filename}`,
      filename,
      type: fileType,
    };
  }

  async saveFiles(files: Express.Multer.File[]): Promise<UploadResult[]> {
    return Promise.all(files.map((file) => this.saveFile(file)));
  }

  deleteFile(filename: string): void {
    const imagePath = `${this.uploadDir}/images/${filename}`;
    const videoPath = `${this.uploadDir}/videos/${filename}`;

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    } else if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
  }
}