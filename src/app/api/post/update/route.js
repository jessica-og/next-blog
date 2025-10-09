import Post from '../../../../lib/models/post.model.js';
import { connect } from '../../../../lib/mongodb/mongoose.js';
import { currentUser } from '@clerk/nextjs/server';

export const PUT = async (req) => {
  const user = await currentUser();
  try {
    await connect();
    const data = await req.json();

    if (
      !user ||
      user.publicMetadata.userMongoId !== data.userMongoId ||
      user.publicMetadata.isAdmin !== true
    ) {
      return new Response('Unauthorized', { status: 401 });
    }

    const existingPost = await Post.findById(data.postId);
    if (!existingPost) {
      return new Response('Post not found', { status: 404 });
    }

    // Update slug if title changes
    let slug = existingPost.slug;
    if (data.title && data.title !== existingPost.title) {
      slug = data.title
        .split(' ')
        .join('-')
        .toLowerCase()
        .replace(/[^a-zA-Z0-9-]/g, '');
    }

    // Update the post
    existingPost.title = data.title || existingPost.title;
    existingPost.content = data.content || existingPost.content;
    existingPost.category = data.category || existingPost.category;
    existingPost.image = data.image || existingPost.image;
    existingPost.imagePublicId = data.imagePublicId || existingPost.imagePublicId;
    existingPost.slug = slug;

    await existingPost.save();

    return new Response(JSON.stringify(existingPost), { status: 200 });
  } catch (error) {
    console.error('Error updating post:', error);
    return new Response('Error updating post', { status: 500 });
  }
};
