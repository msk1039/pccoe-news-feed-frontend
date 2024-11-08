"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Trash2, Plus } from 'lucide-react'
import { Dialog,DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

interface News {
  id: number
  authorName: string
  title: string
  body: string
  likes: number
  postDate: string
}

export default function NewsFeed() {
  const [news, setNews] = useState<News[]>([])
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())
  const [dislikedPosts, setDislikedPosts] = useState<Set<number>>(new Set())
  const [createdPosts, setCreatedPosts] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [authorName, setAuthorName] = useState('')

  useEffect(() => {
    fetchNews()
    loadLikedPosts()
    loadDislikedPosts()
    loadCreatedPosts()
  }, [])

  const fetchNews = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${apiUrl}/news/all`)
      const data = await response.json()
      setNews(data)
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLikedPosts = () => {
    const savedLikedPosts = localStorage.getItem('likedPosts')
    if (savedLikedPosts) {
      setLikedPosts(new Set(JSON.parse(savedLikedPosts)))
    }
  }

  const loadDislikedPosts = () => {
    const savedDislikedPosts = localStorage.getItem('dislikedPosts')
    if (savedDislikedPosts) {
      setDislikedPosts(new Set(JSON.parse(savedDislikedPosts)))
    }
  }

  const loadCreatedPosts = () => {
    const savedCreatedPosts = localStorage.getItem('createdPosts')
    if (savedCreatedPosts) {
      setCreatedPosts(new Set(JSON.parse(savedCreatedPosts)))
    }
  }

  const saveLikedPosts = (likedPosts: Set<number>) => {
    localStorage.setItem('likedPosts', JSON.stringify(Array.from(likedPosts)))
  }

  const saveDislikedPosts = (dislikedPosts: Set<number>) => {
    localStorage.setItem('dislikedPosts', JSON.stringify(Array.from(dislikedPosts)))
  }

  const saveCreatedPosts = (createdPosts: Set<number>) => {
    localStorage.setItem('createdPosts', JSON.stringify(Array.from(createdPosts)))
  }

  const handleLike = async (id: number) => {
    if (likedPosts.has(id)) return

    if (dislikedPosts.has(id)) {
      const updatedDislikedPosts = new Set(dislikedPosts)
      updatedDislikedPosts.delete(id)
      setDislikedPosts(updatedDislikedPosts)
      saveDislikedPosts(updatedDislikedPosts)
    }

    try {
      const response = await fetch(`${apiUrl}/news/like/${id}`)
      const updatedPost = await response.json()
      setNews(news.map((n) => (n.id === id ? updatedPost : n)))
      const updatedLikedPosts = new Set(likedPosts).add(id)
      setLikedPosts(updatedLikedPosts)
      saveLikedPosts(updatedLikedPosts)
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleDislike = async (id: number) => {
    if (dislikedPosts.has(id)) return

    if (likedPosts.has(id)) {
      const updatedLikedPosts = new Set(likedPosts)
      updatedLikedPosts.delete(id)
      setLikedPosts(updatedLikedPosts)
      saveLikedPosts(updatedLikedPosts)
    }

    try {
      const response = await fetch(`${apiUrl}/news/dislike/${id}`)
      const updatedPost = await response.json()
      setNews(news.map((n) => (n.id === id ? updatedPost : n)))
      const updatedDislikedPosts = new Set(dislikedPosts).add(id)
      setDislikedPosts(updatedDislikedPosts)
      saveDislikedPosts(updatedDislikedPosts)
    } catch (error) {
      console.error('Error disliking post:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${apiUrl}/news/delete/${id}`)
      setNews(news.filter((n) => n.id !== id))
      const updatedCreatedPosts = new Set(createdPosts)
      updatedCreatedPosts.delete(id)
      setCreatedPosts(updatedCreatedPosts)
      saveCreatedPosts(updatedCreatedPosts)
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${apiUrl}/news/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ title, body, authorName }),
      })
      const newPost = await response.json()
      setNews([newPost, ...news])
      const updatedCreatedPosts = new Set(createdPosts).add(newPost.id)
      setCreatedPosts(updatedCreatedPosts)
      saveCreatedPosts(updatedCreatedPosts)
      setTitle('')
      setBody('')
      setAuthorName('')
    } catch (error) {
      console.error('Error adding post:', error)
    }
  }

  return (
    <div className='w-full bg-[#f0f0f0] font-[family-name:var(--font-geist-sans)]'>
    <div className="container mx-auto py-8 px-4 bg-[#f0f0f0] min-h-screen">
      <h1 className="text-6xl font-black mb-8 text-center tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 ">
        PCCOE NEWS
      </h1>
      {/* // add site description   */}
      <p className="text-xl font-semibold text-center mb-8 font-[family-name:var(--font-geist-sans)]">Stay up to date with the latest news from PCCOE</p>
      {/* // add site description */}
      <div className="flex justify-end mb-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-white hover:text-black border-4 border-black transition-all duration-300 font-bold text-lg px-6 py-3">
              <Plus className="mr-2 h-5 w-5" /> Add Post
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-4 border-black">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Add New Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4 font-[family-name:var(--font-geist-mono)]">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right font-bold">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="col-span-3 border-2 border-black"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="body" className="text-right font-bold">
                    Body
                  </Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="col-span-3 border-2 border-black"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="authorName" className="text-right font-bold">
                    Author
                  </Label>
                  <Input
                    id="authorName"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="col-span-3 border-2 border-black"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
              <DialogClose asChild>
                <Button type="submit" className="bg-black text-white hover:bg-white hover:text-black border-2 border-black transition-all duration-300 font-bold">
                  Save Post
                </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-black"></div>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4 mr-3">
            {news.map((item) => (
              <Card key={item.id} className="border-4 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                <CardContent className="p-6 flex justify-between items-center">
                  <div className="flex-grow font-[family-name:var(--font-geist-mono)]">
                    <h3 className="text-2xl font-black mb-2">{item.title}</h3>
                    <p className="text-sm mb-2">{item.body}</p>
                    <p className="text-xs font-bold">By {item.authorName} • {new Date(item.postDate).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLike(item.id)}
                        disabled={likedPosts.has(item.id)}
                        className={`border-2 border-black hover:bg-green-300 transition-all duration-300 ${likedPosts.has(item.id) ? 'bg-green-300' : ''}`}
                      >
                        <ThumbsUp className="mr-1 h-4 w-4" />
                        {item.likes}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDislike(item.id)}
                        disabled={dislikedPosts.has(item.id)}
                        className={`border-2 border-black hover:bg-red-300 transition-all duration-300 ${dislikedPosts.has(item.id) ? 'bg-red-300' : ''}`}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                    {createdPosts.has(item.id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="border-2 border-black hover:bg-yellow-300 transition-all duration-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
    </div>
  )
}


























// "use client"

// import React, { useState, useEffect } from 'react'
// import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
// import { Button } from "@/components/ui/button"
// import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react'
// import { Dialog,DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Label } from "@/components/ui/label"
// import { ScrollArea } from "@/components/ui/scroll-area"

// interface News {
//   id: number
//   authorName: string
//   title: string
//   body: string
//   likes: number
//   postDate: string
// }

// export default function NewsFeed() {
//   const [news, setNews] = useState<News[]>([])
//   const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())
//   const [dislikedPosts, setDislikedPosts] = useState<Set<number>>(new Set())
//   const [createdPosts, setCreatedPosts] = useState<Set<number>>(new Set())
//   const [loading, setLoading] = useState(true)
//   const [title, setTitle] = useState('')
//   const [body, setBody] = useState('')
//   const [authorName, setAuthorName] = useState('')

//   useEffect(() => {
//     fetchNews()
//     loadLikedPosts()
//     loadDislikedPosts()
//     loadCreatedPosts()
//   }, [])

//   const fetchNews = async () => {
//     setLoading(true)
//     try {
//       const response = await fetch('http://localhost:8080/news/all')
//       const data = await response.json()
//       setNews(data)
//     } catch (error) {
//       console.error('Error fetching news:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const loadLikedPosts = () => {
//     const savedLikedPosts = localStorage.getItem('likedPosts')
//     if (savedLikedPosts) {
//       setLikedPosts(new Set(JSON.parse(savedLikedPosts)))
//     }
//   }

//   const loadDislikedPosts = () => {
//     const savedDislikedPosts = localStorage.getItem('dislikedPosts')
//     if (savedDislikedPosts) {
//       setDislikedPosts(new Set(JSON.parse(savedDislikedPosts)))
//     }
//   }

//   const loadCreatedPosts = () => {
//     const savedCreatedPosts = localStorage.getItem('createdPosts')
//     if (savedCreatedPosts) {
//       setCreatedPosts(new Set(JSON.parse(savedCreatedPosts)))
//     }
//   }

//   const saveLikedPosts = (likedPosts: Set<number>) => {
//     localStorage.setItem('likedPosts', JSON.stringify(Array.from(likedPosts)))
//   }

//   const saveDislikedPosts = (dislikedPosts: Set<number>) => {
//     localStorage.setItem('dislikedPosts', JSON.stringify(Array.from(dislikedPosts)))
//   }

//   const saveCreatedPosts = (createdPosts: Set<number>) => {
//     localStorage.setItem('createdPosts', JSON.stringify(Array.from(createdPosts)))
//   }

//   const handleLike = async (id: number) => {
//     if (likedPosts.has(id)) return

//     if (dislikedPosts.has(id)) {
//       const updatedDislikedPosts = new Set(dislikedPosts)
//       updatedDislikedPosts.delete(id)
//       setDislikedPosts(updatedDislikedPosts)
//       saveDislikedPosts(updatedDislikedPosts)
//     }

//     try {
//       const response = await fetch(`http://localhost:8080/news/like/${id}`)
//       const updatedPost = await response.json()
//       setNews(news.map((n) => (n.id === id ? updatedPost : n)))
//       const updatedLikedPosts = new Set(likedPosts).add(id)
//       setLikedPosts(updatedLikedPosts)
//       saveLikedPosts(updatedLikedPosts)
//     } catch (error) {
//       console.error('Error liking post:', error)
//     }
//   }

//   const handleDislike = async (id: number) => {
//     if (dislikedPosts.has(id)) return

//     if (likedPosts.has(id)) {
//       const updatedLikedPosts = new Set(likedPosts)
//       updatedLikedPosts.delete(id)
//       setLikedPosts(updatedLikedPosts)
//       saveLikedPosts(updatedLikedPosts)
//     }

//     try {
//       const response = await fetch(`http://localhost:8080/news/dislike/${id}`)
//       const updatedPost = await response.json()
//       setNews(news.map((n) => (n.id === id ? updatedPost : n)))
//       const updatedDislikedPosts = new Set(dislikedPosts).add(id)
//       setDislikedPosts(updatedDislikedPosts)
//       saveDislikedPosts(updatedDislikedPosts)
//     } catch (error) {
//       console.error('Error disliking post:', error)
//     }
//   }

//   const handleDelete = async (id: number) => {
//     try {
//       await fetch(`http://localhost:8080/news/delete/${id}`)
//       setNews(news.filter((n) => n.id !== id))
//       const updatedCreatedPosts = new Set(createdPosts)
//       updatedCreatedPosts.delete(id)
//       setCreatedPosts(updatedCreatedPosts)
//       saveCreatedPosts(updatedCreatedPosts)
//     } catch (error) {
//       console.error('Error deleting post:', error)
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       const response = await fetch('http://localhost:8080/news/add', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: new URLSearchParams({ title, body, authorName }),
//       })
//       const newPost = await response.json()
//       setNews([newPost, ...news])
//       const updatedCreatedPosts = new Set(createdPosts).add(newPost.id)
//       setCreatedPosts(updatedCreatedPosts)
//       saveCreatedPosts(updatedCreatedPosts)
//       setTitle('')
//       setBody('')
//       setAuthorName('')
//     } catch (error) {
//       console.error('Error adding post:', error)
//     }
//   }

//   return (
//     <div className="container mx-auto py-8 px-4">
//       <h1 className="text-3xl font-bold mb-8 text-center">College News</h1>
//       <div className="flex justify-end mb-4">
//         <Dialog>
//           <DialogTrigger asChild>
//             <Button>Add Post</Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Add New Post</DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleSubmit}>
//               <div className="grid gap-4 py-4">
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="title" className="text-right">
//                     Title
//                   </Label>
//                   <Input
//                     id="title"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     className="col-span-3"
//                     required
//                   />
//                 </div>
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="body" className="text-right">
//                     Body
//                   </Label>
//                   <Textarea
//                     id="body"
//                     value={body}
//                     onChange={(e) => setBody(e.target.value)}
//                     className="col-span-3"
//                     required
//                   />
//                 </div>
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="authorName" className="text-right">
//                     Author
//                   </Label>
//                   <Input
//                     id="authorName"
//                     value={authorName}
//                     onChange={(e) => setAuthorName(e.target.value)}
//                     className="col-span-3"
//                     required
//                   />
//                 </div>
//               </div>
//               <DialogFooter>
//               <DialogClose asChild>
//                 <Button type="submit">Save Post</Button>
//                 </DialogClose>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>
//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
//         </div>
//       ) : (
//         <ScrollArea className="h-[calc(100vh-200px)]">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {news.map((item) => (
//               <Card key={item.id} className="flex flex-col">
//                 <CardHeader>
//                   <h3 className="text-xl font-semibold">{item.title}</h3>
//                 </CardHeader>
//                 <CardContent className="flex-grow">
//                   <p className="text-sm text-gray-600 mb-2">{item.body}</p>
//                   <p className="text-xs text-gray-500">Author: {item.authorName}</p>
//                   <p className="text-xs text-gray-500">Posted: {new Date(item.postDate).toLocaleString()}</p>
//                 </CardContent>
//                 <CardFooter className="flex justify-between items-center">
//                   <div className="flex items-center space-x-2">
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => handleLike(item.id)}
//                       disabled={likedPosts.has(item.id)}
//                     >
//                       <ThumbsUp className="mr-1 h-4 w-4" />
//                       {item.likes}
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => handleDislike(item.id)}
//                       disabled={dislikedPosts.has(item.id)}
//                     >
//                       <ThumbsDown className="h-4 w-4" />
//                     </Button>
//                   </div>
//                   {createdPosts.has(item.id) && (
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => handleDelete(item.id)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   )}
//                 </CardFooter>
//               </Card>
//             ))}
//           </div>
//         </ScrollArea>
//       )}
//     </div>
//   )
// }





















































// "use client"
// import React, { useState, useEffect } from 'react';
// import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
// import { Button } from "@/components/ui/button";
// import AddPost from './addPost';
// import axios from 'axios';

// interface News {
//   id: number;
//   authorName: string;
//   title: string;
//   body: string;
//   likes: number;
//   postDate: string;
// }

// const AllNews: React.FC = () => {
//   const [news, setNews] = useState<News[]>([]);
//   const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
//   const [dislikedPosts, setDislikedPosts] = useState<Set<number>>(new Set());
//   const [loading, setLoading] = useState(true);
//   const [createdPosts, setCreatedPosts] = useState<Set<number>>(new Set());

//   useEffect(() => {
//     fetchNews();
//     loadLikedPosts();
//     loadDislikedPosts();
//     loadCreatedPosts();
//   }, []);

//   const fetchNews = async () => {
//     const response = await axios.get('http://localhost:8080/news/all');
//     setNews(response.data);
//   };

//   const loadLikedPosts = () => {
//     const savedLikedPosts = localStorage.getItem('likedPosts');
//     if (savedLikedPosts) {
//       setLikedPosts(new Set(JSON.parse(savedLikedPosts)));
//     }
//   };

//   const loadDislikedPosts = () => {
//     const savedDislikedPosts = localStorage.getItem('dislikedPosts');
//     if (savedDislikedPosts) {
//       setDislikedPosts(new Set(JSON.parse(savedDislikedPosts)));
//     }
//   };

//   const loadCreatedPosts = () => {
//     const savedCreatedPosts = localStorage.getItem('createdPosts');
//     if (savedCreatedPosts) {
//       setCreatedPosts(new Set(JSON.parse(savedCreatedPosts)));
//     }
//   };

//   const saveLikedPosts = (likedPosts: Set<number>) => {
//     localStorage.setItem('likedPosts', JSON.stringify(Array.from(likedPosts)));
//   };

//   const saveDislikedPosts = (dislikedPosts: Set<number>) => {
//     localStorage.setItem('dislikedPosts', JSON.stringify(Array.from(dislikedPosts)));
//   };

//   const saveCreatedPosts = (createdPosts: Set<number>) => {
//     localStorage.setItem('createdPosts', JSON.stringify(Array.from(createdPosts)));
//   };

//   const handleLike = async (id: number) => {
//     if (likedPosts.has(id)) {
//       return; // User has already liked this post
//     }

//     if (dislikedPosts.has(id)) {
//       const updatedDislikedPosts = new Set(dislikedPosts);
//       updatedDislikedPosts.delete(id);
//       setDislikedPosts(updatedDislikedPosts);
//       saveDislikedPosts(updatedDislikedPosts);
//     }

//     try {
//       const response = await axios.get(`http://localhost:8080/news/like/${id}`);
//       setNews(news.map((n) => (n.id === id ? response.data : n)));
//       const updatedLikedPosts = new Set(likedPosts).add(id);
//       setLikedPosts(updatedLikedPosts);
//       saveLikedPosts(updatedLikedPosts); // Save liked posts to local storage
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleDislike = async (id: number) => {
//     if (dislikedPosts.has(id)) {
//       return; // User has already disliked this post
//     }

//     if (likedPosts.has(id)) {
//       const updatedLikedPosts = new Set(likedPosts);
//       updatedLikedPosts.delete(id);
//       setLikedPosts(updatedLikedPosts);
//       saveLikedPosts(updatedLikedPosts);
//     }

//     try {
//       const response = await axios.get(`http://localhost:8080/news/dislike/${id}`);
//       setNews(news.map((n) => (n.id === id ? response.data : n)));
//       const updatedDislikedPosts = new Set(dislikedPosts).add(id);
//       setDislikedPosts(updatedDislikedPosts);
//       saveDislikedPosts(updatedDislikedPosts); // Save disliked posts to local storage
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleDelete = async (id: number) => {
//     try {
//       await axios.get(`http://localhost:8080/news/delete/${id}`);
//       setNews(news.filter((n) => n.id !== id));
//       const updatedCreatedPosts = new Set(createdPosts);
//       updatedCreatedPosts.delete(id);
//       setCreatedPosts(updatedCreatedPosts);
//       saveCreatedPosts(updatedCreatedPosts); // Save created posts to local storage
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const addPost = async () => {
//     fetchNews();
//   };

//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-3xl font-bold mb-8">Pccoe News</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//         {news.map((item) => (
//           <Card key={item.id}>
//             <CardHeader>
//               <h3 className="text-xl font-bold">{item.title}</h3>
//             </CardHeader>
//             <CardContent>
//               <p>{item.body}</p>
//               <p className="text-gray-500 mt-2">Author: {item.authorName}</p>
//               <p className="text-gray-500 mt-1">Posted: {item.postDate}</p>
//             </CardContent>
//             <CardFooter className="flex justify-between items-center">
//               <div className="flex items-center space-x-2">
//                 <Button
//                   variant="ghost"
//                   onClick={() => handleLike(item.id)}
//                   title="Like"
//                   disabled={likedPosts.has(item.id)} // Disable button if already liked
//                 >
//                   👍 {item.likes}
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   onClick={() => handleDislike(item.id)}
//                   title="Dislike"
//                   disabled={dislikedPosts.has(item.id)} // Disable button if already disliked
//                 >
//                   👎
//                 </Button>
//                 {createdPosts.has(item.id) && (
//                   <Button
//                     variant="ghost"
//                     onClick={() => handleDelete(item.id)}
//                     title="Delete"
//                   >
//                     🗑️
//                   </Button>
//                 )}
//               </div>
//             </CardFooter>
//           </Card>
//         ))}
//       </div>
//       <div className="flex justify-end mt-8">
//         <AddPost onPostAdded={addPost} createdPosts={createdPosts} setCreatedPosts={setCreatedPosts} />
//       </div>
//     </div>
//   );
// };

// export default AllNews;