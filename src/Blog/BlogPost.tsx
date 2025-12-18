// BlogPost.tsx - Updated with UnifiedHeader and Mantine components
import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Title, Text } from '@mantine/core';
import { posts } from './blogData';
import BlogPostTemplate from './BlogPostTemplate';
import { UnifiedHeader } from '../components/UnifiedHeader';
import './Blog.css';

// Blog icon URL
const BLOG_ICON_URL = `${process.env.PUBLIC_URL}/images/DungeonMindLogo2.png`;

const BlogPost: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const post = id ? posts.find((p) => p.id === parseInt(id)) : undefined;

    if (!post) {
        return (
            <>
                <UnifiedHeader
                    app={{ id: 'blog', name: 'DungeonMind Blog', icon: BLOG_ICON_URL }}
                    showAuth={true}
                />
                <Container size="md" py="xl">
                    <Paper
                        shadow="sm"
                        radius="md"
                        p="xl"
                        style={{
                            backgroundColor: 'var(--mantine-color-parchment-3)',
                            border: '2px solid var(--mantine-color-blue-4)'
                        }}
                    >
                        <Title order={2} style={{ fontFamily: 'Balgruf, serif' }}>
                            Post Not Found
                        </Title>
                        <Text mt="md">
                            The blog post you're looking for doesn't exist.
                        </Text>
                    </Paper>
                </Container>
            </>
        );
    }

    return (
        <>
            <UnifiedHeader
                app={{ id: 'blog', name: 'DungeonMind Blog', icon: BLOG_ICON_URL }}
                showAuth={true}
            />
            <Container size="md" py="xl">
                <Paper
                    shadow="sm"
                    radius="md"
                    p="xl"
                    style={{
                        backgroundColor: 'var(--mantine-color-parchment-3)',
                        border: '2px solid var(--mantine-color-blue-4)'
                    }}
                >
                    <BlogPostTemplate title={post.title} content={post.content} />
                </Paper>
            </Container>
        </>
    );
};

export default BlogPost;
