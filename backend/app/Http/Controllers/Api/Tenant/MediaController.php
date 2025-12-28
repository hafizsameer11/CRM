<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\MediaAsset;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
// use Intervention\Image\Facades\Image; // Optional: Install intervention/image-laravel if you want advanced image processing

class MediaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MediaAsset::with('creator')
            ->orderBy('created_at', 'desc');

        // Filters
        if ($request->has('type')) {
            if ($request->type === 'image') {
                $query->where('mime_type', 'like', 'image/%');
            } elseif ($request->type === 'video') {
                $query->where('mime_type', 'like', 'video/%');
            }
        }

        if ($request->has('search')) {
            $query->where('original_name', 'like', '%' . $request->search . '%');
        }

        $media = $query->paginate($request->per_page ?? 20);

        return response()->json($media);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi|max:102400', // 100MB max
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $mimeType = $file->getMimeType();
            $size = $file->getSize();

            // Generate unique filename
            $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $storagePath = 'media/' . now()->format('Y/m') . '/' . $fileName;

            // Store file
            $file->storeAs('public', $storagePath);

            $mediaData = [
                'tenant_id' => $request->_tenant_id,
                'created_by' => auth('api')->id(),
                'file_name' => $fileName,
                'original_name' => $originalName,
                'mime_type' => $mimeType,
                'size' => $size,
                'storage_path' => $storagePath,
            ];

            // Generate thumbnail and get dimensions for images
            if (str_starts_with($mimeType, 'image/')) {
                $fullPath = Storage::disk('public')->path($storagePath);
                
                // Get image dimensions using GD library
                $imageInfo = @getimagesize($fullPath);
                if ($imageInfo) {
                    $mediaData['width'] = $imageInfo[0];
                    $mediaData['height'] = $imageInfo[1];
                }

                // Generate thumbnail if GD is available
                if (extension_loaded('gd')) {
                    try {
                        $thumbnailPath = $this->generateThumbnail($storagePath);
                        $mediaData['thumbnail_path'] = $thumbnailPath;
                    } catch (\Exception $e) {
                        // Thumbnail generation failed, continue without thumbnail
                        \Log::warning('Thumbnail generation failed', ['error' => $e->getMessage()]);
                    }
                }
            }

            $media = MediaAsset::create($mediaData);

            ActivityLog::log(
                auth('api')->user(),
                'media_uploaded',
                'MediaAsset',
                $media->id,
                ['file_name' => $originalName]
            );

            return response()->json($media, 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to upload file',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        $media = MediaAsset::with('creator')->findOrFail($id);

        return response()->json($media);
    }

    public function destroy(int $id): JsonResponse
    {
        $media = MediaAsset::findOrFail($id);

        // Check if media is used in any posts
        $usedInPosts = \App\Models\Post::whereJsonContains('media', $id)->exists();

        if ($usedInPosts) {
            return response()->json([
                'error' => 'Cannot delete media that is used in posts'
            ], 400);
        }

        $media->delete(); // Files are deleted automatically via model event

        ActivityLog::log(
            auth('api')->user(),
            'media_deleted',
            'MediaAsset',
            $media->id
        );

        return response()->json(['message' => 'Media deleted successfully']);
    }

    protected function generateThumbnail(string $storagePath): string
    {
        $thumbnailPath = str_replace('.', '_thumb.', $storagePath);
        $fullPath = Storage::disk('public')->path($storagePath);
        $thumbFullPath = Storage::disk('public')->path($thumbnailPath);

        // Ensure thumbnail directory exists
        $thumbDir = dirname($thumbFullPath);
        if (!is_dir($thumbDir)) {
            mkdir($thumbDir, 0755, true);
        }

        // Get image info
        $imageInfo = getimagesize($fullPath);
        if (!$imageInfo) {
            throw new \Exception('Could not get image dimensions');
        }

        $width = $imageInfo[0];
        $height = $imageInfo[1];
        $mime = $imageInfo['mime'];

        // Calculate thumbnail dimensions (300x300, maintaining aspect ratio)
        $thumbSize = 300;
        $ratio = min($thumbSize / $width, $thumbSize / $height);
        $thumbWidth = (int)($width * $ratio);
        $thumbHeight = (int)($height * $ratio);

        // Create source image based on MIME type
        switch ($mime) {
            case 'image/jpeg':
                $source = imagecreatefromjpeg($fullPath);
                break;
            case 'image/png':
                $source = imagecreatefrompng($fullPath);
                break;
            case 'image/gif':
                $source = imagecreatefromgif($fullPath);
                break;
            case 'image/webp':
                $source = imagecreatefromwebp($fullPath);
                break;
            default:
                throw new \Exception('Unsupported image type: ' . $mime);
        }

        if (!$source) {
            throw new \Exception('Could not create image from source');
        }

        // Create thumbnail
        $thumbnail = imagecreatetruecolor($thumbWidth, $thumbHeight);

        // Preserve transparency for PNG and GIF
        if ($mime === 'image/png' || $mime === 'image/gif') {
            imagealphablending($thumbnail, false);
            imagesavealpha($thumbnail, true);
            $transparent = imagecolorallocatealpha($thumbnail, 255, 255, 255, 127);
            imagefilledrectangle($thumbnail, 0, 0, $thumbWidth, $thumbHeight, $transparent);
        }

        // Resize image
        imagecopyresampled(
            $thumbnail,
            $source,
            0, 0, 0, 0,
            $thumbWidth, $thumbHeight,
            $width, $height
        );

        // Save thumbnail based on original MIME type
        switch ($mime) {
            case 'image/jpeg':
                imagejpeg($thumbnail, $thumbFullPath, 85);
                break;
            case 'image/png':
                imagepng($thumbnail, $thumbFullPath, 6);
                break;
            case 'image/gif':
                imagegif($thumbnail, $thumbFullPath);
                break;
            case 'image/webp':
                imagewebp($thumbnail, $thumbFullPath, 85);
                break;
        }

        // Clean up
        imagedestroy($source);
        imagedestroy($thumbnail);

        return $thumbnailPath;
    }
}



