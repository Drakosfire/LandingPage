import React from 'react';
import { useParams } from 'react-router-dom';
import { posts } from './blogData';
import BlogPostTemplate from './BlogPostTemplate';
import './Blog.css';

const BlogPost: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const post = id ? posts.find((p) => p.id === parseInt(id)) : undefined;

    if (!post) {
        return <div className="blog-container">Post not found</div>;
    }

    return (
        <div className="blog-container">
            <BlogPostTemplate title={post.title} content={post.content} />
        </div>
    );
};

export default BlogPost;