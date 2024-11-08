"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const AddPost: React.FC<{ onPostAdded: () => void; createdPosts: Set<number>; setCreatedPosts: (posts: Set<number>) => void }> = ({ onPostAdded, createdPosts, setCreatedPosts }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [authorName, setAuthorName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/news/add`, null, {
        params: {
          title,
          body,
          authorName,
        },
      });

      const newPostId = response.data.id;
      const updatedCreatedPosts = new Set(createdPosts).add(newPostId);
      setCreatedPosts(updatedCreatedPosts);
      localStorage.setItem('createdPosts', JSON.stringify(Array.from(updatedCreatedPosts)));

      onPostAdded();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Post</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right">Title</label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              required
            />
            <label htmlFor="body" className="text-right">Post body</label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your post body here."
              className="col-span-3"
              required
            />
            <label htmlFor="authorName" className="text-right">Author Name</label>
            <Input
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <DialogFooter className='pt-3'>
            <DialogClose asChild>
              <Button type="submit">Save changes</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPost;