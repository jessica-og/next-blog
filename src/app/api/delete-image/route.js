import { v2 as cloudinary } from 'cloudinary';

export async function POST(req) {
  try {
    const { public_id } = await req.json().catch(() => ({}));

    if (!public_id) {
      return new Response(JSON.stringify({ error: 'Missing public_id' }), {
        status: 400,
      });
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await cloudinary.uploader.destroy(public_id);
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error('Error deleting image:', error);
    return new Response(JSON.stringify({ error: 'Delete failed' }), {
      status: 500,
    });
  }
}
