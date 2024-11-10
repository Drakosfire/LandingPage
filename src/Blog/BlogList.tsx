import React from 'react';
import { Link } from 'react-router-dom';
import { posts } from './blogData';
import './Blog.css';

const BlogList: React.FC = () => {
    return (
        <div className="blog-container">
            <div className="blog-header">
                <h1>Blog Posts</h1>
            </div>
            <ul>
                {posts.map((post) => (
                    <li key={post.id} className="blog-post">
                        <Link to={`/blog/${post.id}`}>
                            <h2>{post.title}</h2>
                            <p>{post.snippet}</p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BlogList; 