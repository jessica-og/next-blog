import { v2 as cloudinary } from 'cloudinary';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
      });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      cloudinary.uploader
        .upload_stream(
          {
            folder: 'next-blog', // optional folder name
            public_id: `${Date.now()}-${file.name.split('.')[0]}`,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return new Response(
      JSON.stringify({
        imageUrl: result.secure_url,
        public_id: result.public_id,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500,
    });
  }
}
