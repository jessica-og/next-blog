'use client';

import { useUser } from '@clerk/nextjs';
import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import RichTextEditor from '@/app/components/RichTextEditor';

export default function CreatePostPage() {
   const { isSignedIn, user, isLoaded } = useUser();

  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = null;
      let publicId = null;

      if (file) {
        setImageUploadProgress(10);

        const formDataToSend = new FormData();
        formDataToSend.append('file', file);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formDataToSend,
        });

        if (!uploadRes.ok) {
          throw new Error('Image upload failed');
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;
        publicId = uploadData.public_id;

        setImageUploadProgress(100);
      }

      // Send post data to backend
      const res = await fetch('/api/post/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          imagePublicId: publicId,
          userMongoId: user.publicMetadata.userMongoId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message || 'Failed to publish post');
        return;
      }

      setPublishError(null);
      router.push(`/post/${data.slug}`);
    } catch (error) {
      console.error(error);
      setPublishError('Something went wrong');
    } finally {
      setImageUploadProgress(null);
    }
  };

  if (!isLoaded) return null;


  if (isSignedIn && user.publicMetadata.isAdmin) {
    return (
      <div className='p-3 max-w-3xl mx-auto min-h-screen'>
        <h1 className='text-center text-3xl my-7 font-semibold'>
          Create a post
        </h1>
        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-4 sm:flex-row justify-between'>
            <TextInput
              type='text'
              placeholder='Title'
              required
              id='title'
              className='flex-1'
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <Select
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
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
            {imageUploadProgress && (
              <div className='w-16 h-16'>
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress || 0}%`}
                />
              </div>
            )}
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
 {/*  
          <ReactQuill
            theme='snow'
            placeholder='Write something...'
            className='h-72 mb-12'
            required
            onChange={(value) => {
              setFormData({ ...formData, content: value });
            }}
          />*/}
           <RichTextEditor
  value={formData.content || ""}
  onChange={(html) => setFormData({ ...formData, content: html })}
/>

          <Button type='submit' gradientDuoTone='purpleToPink'>
            Publish
          </Button>
        </form>
      </div>
    );
  } else {
    return (
      <h1 className='text-center text-3xl my-7 font-semibold'>
        You are not authorized to view this page
      </h1>
    );
  }
}
