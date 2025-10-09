'use client';

import { useUser } from '@clerk/nextjs';
import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useRouter, usePathname } from 'next/navigation';
import RichTextEditor from '@/app/components/RichTextEditor';

export default function UpdatePost() {
const { isSignedIn, user, isLoaded } = useUser();
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const postId = pathname.split('/').pop();

  // 🔹 Fetch post data on load
useEffect(() => {
  const fetchPost = async () => {
    try {
      const res = await fetch('/api/post/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      console.log("Fetched post data:", data);
      if (res.ok && data.posts?.length > 0) {
        setFormData(data.posts[0]);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };
  if (isLoaded && isSignedIn && user?.publicMetadata?.isAdmin) {
    fetchPost();
  }
}, [isLoaded, isSignedIn, user?.publicMetadata?.isAdmin, postId]);

if (!formData.title) {
  return <p className="text-center mt-10">Loading post...</p>;
}

  // 🔹 Upload new image to Cloudinary & delete old one
const handleUploadImage = async () => {
  if (!file) {
    setImageUploadError('Please select an image');
    return;
  } 

  setImageUploadError(null);
  setImageUploadProgress(20);

  try {
    // 1️⃣ Upload new image to Cloudinary first
    const form = new FormData();
    form.append('file', file);

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: form,
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(uploadData.error || 'Image upload failed');

    // 2️⃣ Delete old image only after successful upload
    if (formData.imagePublicId) {
      await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: formData.imagePublicId }),
      });
    }

    // 3️⃣ Update local state with new image info
    setFormData({
      ...formData,
      image: uploadData.imageUrl,
      imagePublicId: uploadData.public_id,
    });

    setImageUploadProgress(100);
    setTimeout(() => setImageUploadProgress(null), 800);
  } catch (error) {
    console.error('Upload error:', error);
    setImageUploadError('Image upload failed');
    setImageUploadProgress(null);
  }
};


  // 🔹 Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/post/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userMongoId: user.publicMetadata.userMongoId,
          postId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPublishError(data.message || 'Failed to update post');
        return;
      }

      setPublishError(null);
      router.push(`/post/${data.slug}`);
    } catch (error) {
      console.error('Submit error:', error);
      setPublishError('Something went wrong');
    }
  };

  if (!isLoaded) return null;

  if (isSignedIn && user.publicMetadata.isAdmin) {
    return (
      <div className='p-3 max-w-3xl mx-auto min-h-screen'>
        <h1 className='text-center text-3xl my-7 font-semibold'>
          Update a post
        </h1>
        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-4 sm:flex-row justify-between'>
            <TextInput
              type='text'
              placeholder='Title'
              required
              id='title'
              value={formData.title || ""}
              className='flex-1'
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <Select
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              value={formData.category}
            >
              <option value='uncategorized'>Select a category</option>
              <option value='javascript'>JavaScript</option>
              <option value='reactjs'>React.js</option>
              <option value='nextjs'>Next.js</option>
            </Select>
          </div>
          <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3'>
            <FileInput
              type='file'
              accept='image/*'
              onChange={(e) => setFile(e.target.files[0])}
            />
            <Button
              type='button'
              gradientDuoTone='purpleToBlue'
              size='sm'
              outline
                 onClick={handleUploadImage}
              disabled={imageUploadProgress}
            >
              {imageUploadProgress ? (
                <div className='w-16 h-16'>
                  <CircularProgressbar
                    value={imageUploadProgress}
                    text={`${imageUploadProgress || 0}%`}
                  />
                </div>
              ) : (
                'Upload Image'
              )}
            </Button>
          </div>
          {imageUploadError && (
            <Alert color='failure'>{imageUploadError}</Alert>
          )}
          {formData.image && (
            <img
              src={formData.image}
              alt='upload'
              className='w-full h-72 object-cover'
            />
          )}
       {/*   <ReactQuill
            theme='snow'
            placeholder='Write something...'
            className='h-72 mb-12'
            required
            value={formData.content}
            onChange={(value) => {
              setFormData({ ...formData, content: value });
            }}
          />*/}
  {/* <RichTextEditor
          value={formData.content}
          onChange={(html) =>
            setFormData((prev) => ({ ...prev, content: html }))
          }
        /> */}
    <RichTextEditor
  value={formData.content || ""}
  onChange={(html) => setFormData({ ...formData, content: html })}
/>

  
          <Button type='submit' gradientDuoTone='purpleToPink'>
            Update
          </Button>
          {publishError && (
            <Alert className='mt-5' color='failure'>
              {publishError}
            </Alert>
          )}
        </form>
      </div>
    );
  }

  return (
    <h1 className='text-center text-3xl my-7 font-semibold min-h-screen'>
      You need to be an admin to update a post
    </h1>
  );
}
