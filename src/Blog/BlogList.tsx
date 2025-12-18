// BlogList.tsx - Updated with UnifiedHeader and Mantine components
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Title, Text, Stack } from '@mantine/core';
import { posts } from './blogData';
import { UnifiedHeader } from '../components/UnifiedHeader';
import './Blog.css';

// Blog icon URL
const BLOG_ICON_URL = `${process.env.PUBLIC_URL}/images/DungeonMindLogo2.png`;

const BlogList: React.FC = () => {
    return (
        <>
            <UnifiedHeader
                app={{ id: 'blog', name: 'DungeonMind Blog', icon: BLOG_ICON_URL }}
                showAuth={true}
            />
            <Container size="md" py="xl">
                <Title order={1} ta="center" mb="xl" style={{ fontFamily: 'Balgruf, serif' }}>
                    Blog Posts
                </Title>
                <Stack gap="lg">
                    {posts.map((post) => (
                        <Card
                            key={post.id}
                            component={Link}
                            to={`/blog/${post.id}`}
                            shadow="sm"
                            radius="md"
                            withBorder
                            style={{
                                textDecoration: 'none',
                                backgroundColor: 'var(--mantine-color-parchment-3)',
                                borderColor: 'var(--mantine-color-blue-4)',
                                borderWidth: '2px',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}
                            className="blog-card"
                        >
                            <Title order={3} mb="xs" style={{ fontFamily: 'Balgruf, serif', color: '#333' }}>
                                {post.title}
                            </Title>
                            <Text c="dimmed" size="sm">
                                {post.snippet}
                            </Text>
                        </Card>
                    ))}
                </Stack>
            </Container>
        </>
    );
};

export default BlogList;
