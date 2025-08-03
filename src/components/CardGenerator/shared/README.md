# Image Modal System

This directory contains reusable components for displaying expandable images in modals across the CardGenerator application.

## Components

### ImageModal
A modal component for displaying images with optional download functionality.

**Props:**
- `imageUrl: string` - The image URL to display
- `altText?: string` - Alt text for the image (default: 'Image')
- `title?: string` - Title to display in the modal header
- `description?: string` - Description to display below the image
- `showDownload?: boolean` - Whether to show download button (default: true)
- `downloadFilename?: string` - Custom download filename
- `size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'` - Modal size (default: 'lg')
- `opened: boolean` - Whether the modal is open
- `onClose: () => void` - Callback when modal is closed
- `className?: string` - Additional CSS classes

### ClickableImage
A clickable image component that integrates with the image modal.

**Props:**
- `src: string` - The image URL
- `alt?: string` - Alt text for the image
- `title?: string` - Title to display in the modal
- `description?: string` - Description to display in the modal
- `downloadFilename?: string` - Custom download filename
- `className?: string` - CSS class name
- `showExpandButton?: boolean` - Whether to show the expand button (default: true)
- `expandButtonPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'` - Position of expand button (default: 'top-right')
- `clickable?: boolean` - Whether the image is clickable (default: true)
- `onClick?: () => void` - Custom click handler
- `showDownload?: boolean` - Whether to show download in modal (default: true)
- `modalSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'` - Modal size (default: 'lg')

### useImageModal Hook
A custom hook to manage image modal state.

**Returns:**
- `modalState: ImageModalState` - Current modal state
- `openModal: (imageUrl: string, options?: Partial<Omit<ImageModalState, 'opened'>>) => void` - Function to open modal
- `closeModal: () => void` - Function to close modal

## Usage Examples

### Basic ClickableImage
```tsx
import { ClickableImage } from '../shared';

<ClickableImage
  src="https://example.com/image.jpg"
  alt="My Image"
  title="Image Title"
  description="Image description"
  className="rounded-lg"
/>
```

### Custom ClickableImage with Custom Click Handler
```tsx
<ClickableImage
  src="https://example.com/image.jpg"
  alt="My Image"
  onClick={() => console.log('Image clicked!')}
  showExpandButton={false}
  clickable={true}
/>
```

### Manual Modal Control
```tsx
import { useImageModal, ImageModal } from '../shared';

const MyComponent = () => {
  const { modalState, openModal, closeModal } = useImageModal();

  return (
    <>
      <button onClick={() => openModal('https://example.com/image.jpg', {
        title: 'My Image',
        description: 'Custom description'
      })}>
        Open Modal
      </button>

      <ImageModal
        imageUrl={modalState.imageUrl}
        altText={modalState.altText}
        title={modalState.title}
        description={modalState.description}
        opened={modalState.opened}
        onClose={closeModal}
      />
    </>
  );
};
```

### Gallery Integration
```tsx
const ImageGallery = ({ images }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <div key={index} className="border rounded-lg overflow-hidden">
          <ClickableImage
            src={image.url}
            alt={image.name}
            title={image.name}
            description={image.description}
            className="w-full h-full"
            onClick={() => handleImageSelect(image.url)}
            showExpandButton={true}
            expandButtonPosition="top-right"
            downloadFilename={`${image.name}-${index + 1}.png`}
          />
        </div>
      ))}
    </div>
  );
};
```

## Features

- **Expandable Images**: Click any image or the expand button to view in a modal
- **Download Functionality**: Download images directly from the modal
- **Customizable**: Configurable titles, descriptions, and download filenames
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Consistent Styling**: Uses Mantine design system
- **Fallback Support**: Graceful handling of broken images

## Integration Status

The image modal system has been integrated into:

- ✅ CoreImageGallery (example and generated images)
- ✅ CardWithTextGallery (final cards and examples)
- ✅ ImageGallery (generated card images)

All galleries now support expandable images with consistent behavior and styling. 