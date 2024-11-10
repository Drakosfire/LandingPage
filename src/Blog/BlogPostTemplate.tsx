import React from 'react';
import ReactMarkdown from 'react-markdown';

interface BlogPostTemplateProps {
    title: string;
    content: string;
}

const BlogPostTemplate: React.FC<BlogPostTemplateProps> = ({ title, content }) => {
    return (
        <div>
            <h1>{title}</h1>
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
};

export default BlogPostTemplate;