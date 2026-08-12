# HackGoa Frame Generator

A Next.js web application for generating custom frames and badges. Users can upload their photos, composite them with custom frames or badges, and share the results.

## Features

- Custom image and frame compositing
- Image uploads with HEIC image support
- Vercel Blob integration for storing generated images
- Open Graph (OG) image generation for rich social sharing
- Built with Next.js (App Router) and Tailwind CSS

## Prerequisites

Before running the project, you will need a [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) store setup for image storage.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory using the example template:

```bash
cp .env.example .env.local
```

Add your Vercel Blob Read/Write token to the `.env.local` file:
```env
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token_here"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.
5. View live web here (https://builderid.vercel.app/) 

## Tech Stack

- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS
- **Storage:** Vercel Blob
- **Form Handling:** React Hook Form + Zod
- **Icons:** Lucide React
