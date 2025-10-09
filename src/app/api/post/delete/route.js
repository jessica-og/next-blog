import Post from '../../../../lib/models/post.model';
import { connect } from '../../../../lib/mongodb/mongoose';
import { currentUser } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';

export const DELETE = async (req) => {
  const user = await currentUser();

  try {
    await connect();
    const data = await req.json();

    //  1. Authorization check
    if (
      !user.publicMetadata.isAdmin ||
      user.publicMetadata.userMongoId !== data.userId
    ) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 2. Find post before deleting (to get imagePublicId)
    const post = await Post.findById(data.postId);
    if (!post) {
      return new Response('Post not found', { status: 404 });
    }

    //  3. If post has Cloudinary image, delete it
    if (post.imagePublicId) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      try {
        await cloudinary.uploader.destroy(post.imagePublicId);
        console.log('🗑️ Cloudinary image deleted:', post.imagePublicId);
      } catch (err) {
        console.error('⚠️ Error deleting Cloudinary image:', err);
      }
    }

    //  4. Delete post from MongoDB
    await Post.findByIdAndDelete(data.postId);
    return new Response('Post deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return new Response('Error deleting post', { status: 500 });
  }
};
