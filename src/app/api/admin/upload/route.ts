import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '~/server/lib/cloudinary';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const identifier = String(formData.get('identifier') || '').trim();
    if (!identifier) {
      return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
    }

    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === 'files' && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploads = await Promise.all(
      files.map(async (file, index) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await cloudinary.uploader.upload_stream({
          public_id: `${identifier}_${index}`,
          folder: 'products',
          resource_type: 'image',
          overwrite: true,
        }, (error, result) => {
        });
        return await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              public_id: `${identifier}_${index}`,
              folder: 'products',
              resource_type: 'image',
              overwrite: true,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(buffer);
        });
      })
    );

    return NextResponse.json({
      ok: true,
      uploads,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Upload failed' }, { status: 500 });
  }
} 