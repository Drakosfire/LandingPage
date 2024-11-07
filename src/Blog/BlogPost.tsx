// src/Blog/BlogList.tsx
import { Link } from 'react-router-dom';
import { BlogPost } from './types';

const posts: BlogPost[] = [
    {
        id: 1,
        title: 'First Blog Post',
        snippet: 'This is the first post',
        content: "# First Blog Post\nThis is the full **markdown** content of the first post.",
    },
    {
        id: 2,
        title: 'Second Blog Post',
        snippet: 'Another exciting post awaits...',
        content: "# Second Blog Post\nHere’s the detailed **markdown** content for the second post with a [link](https://example.com).",
    },
    // Add more blog posts as needed
];

function BlogList() {
    return (
        <div>
            <h1>Blog</h1>
            {posts.map((post) => (
                <div key={post.id}>
                    <h2>{post.title}</h2>
                    <p>{post.snippet}</p>
                    <Link to={`/blog/${post.id}`}>Read More</Link>
                </div>
            ))}
        </div>
    );
}

export default BlogList;
