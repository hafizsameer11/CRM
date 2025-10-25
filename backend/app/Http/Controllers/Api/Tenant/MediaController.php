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
use Intervention\Image\Facades\Image;

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

            // Generate thumbnail for images
            if (str_starts_with($mimeType, 'image/')) {
                $thumbnailPath = $this->generateThumbnail($storagePath);
                $mediaData['thumbnail_path'] = $thumbnailPath;

                // Get image dimensions
                $image = Image::make(Storage::disk('public')->path($storagePath));
                $mediaData['width'] = $image->width();
                $mediaData['height'] = $image->height();
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

        $image = Image::make(Storage::disk('public')->path($storagePath));
        $image->fit(300, 300);
        $image->save(Storage::disk('public')->path($thumbnailPath));

        return $thumbnailPath;
    }
}


