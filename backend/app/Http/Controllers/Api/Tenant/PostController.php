<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\ActivityLog;
use App\Models\ScheduledJob;
use App\Jobs\PublishScheduledPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Post::with(['channel', 'creator'])
            ->orderBy('created_at', 'desc');

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('channel_id')) {
            $query->where('channel_id', $request->channel_id);
        }

        if ($request->has('search')) {
            $query->where('caption', 'like', '%' . $request->search . '%');
        }

        $posts = $query->paginate($request->per_page ?? 15);

        return response()->json($posts);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'channel_id' => 'required|exists:channels,id',
            'caption' => 'nullable|string|max:2200',
            'media' => 'nullable|array',
            'media.*' => 'integer|exists:media_assets,id',
            'hashtags' => 'nullable|array',
            'status' => 'in:draft,scheduled',
            'scheduled_for' => 'nullable|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $post = Post::create([
            'tenant_id' => $request->_tenant_id,
            'channel_id' => $request->channel_id,
            'created_by' => auth('api')->id(),
            'caption' => $request->caption,
            'media' => $request->media,
            'hashtags' => $request->hashtags,
            'status' => $request->status ?? 'draft',
            'scheduled_for' => $request->scheduled_for,
        ]);

        ActivityLog::log(
            auth('api')->user(),
            'post_created',
            'Post',
            $post->id
        );

        return response()->json($post->load(['channel', 'creator']), 201);
    }

    public function show(int $id): JsonResponse
    {
        $post = Post::with(['channel', 'creator', 'comments'])->findOrFail($id);

        return response()->json($post);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $post = Post::findOrFail($id);

        if (!$post->canPublish() && !$post->canSchedule()) {
            return response()->json([
                'error' => 'Cannot update published or failed posts'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'caption' => 'nullable|string|max:2200',
            'media' => 'nullable|array',
            'media.*' => 'integer|exists:media_assets,id',
            'hashtags' => 'nullable|array',
            'scheduled_for' => 'nullable|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $post->update($request->only(['caption', 'media', 'hashtags', 'scheduled_for']));

        ActivityLog::log(
            auth('api')->user(),
            'post_updated',
            'Post',
            $post->id
        );

        return response()->json($post->load(['channel', 'creator']));
    }

    public function destroy(int $id): JsonResponse
    {
        $post = Post::findOrFail($id);

        if ($post->status === 'published') {
            return response()->json([
                'error' => 'Cannot delete published posts'
            ], 400);
        }

        $post->delete();

        ActivityLog::log(
            auth('api')->user(),
            'post_deleted',
            'Post',
            $post->id
        );

        return response()->json(['message' => 'Post deleted successfully']);
    }

    public function publish(Request $request, int $id): JsonResponse
    {
        $post = Post::findOrFail($id);

        if (!$post->canPublish()) {
            return response()->json([
                'error' => 'Post cannot be published in current status'
            ], 400);
        }

        // Dispatch publish job immediately
        PublishScheduledPost::dispatch($post);

        $post->update(['status' => 'scheduled']);

        ActivityLog::log(
            auth('api')->user(),
            'post_publish_triggered',
            'Post',
            $post->id
        );

        return response()->json([
            'message' => 'Post is being published',
            'post' => $post->load(['channel', 'creator'])
        ]);
    }

    public function schedule(Request $request, int $id): JsonResponse
    {
        $post = Post::findOrFail($id);

        if (!$post->canSchedule()) {
            return response()->json([
                'error' => 'Post cannot be scheduled in current status'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'scheduled_for' => 'required|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $post->update([
            'status' => 'scheduled',
            'scheduled_for' => $request->scheduled_for,
        ]);

        // Create scheduled job
        ScheduledJob::create([
            'tenant_id' => $post->tenant_id,
            'job_type' => 'publish_post',
            'payload' => ['post_id' => $post->id],
            'run_at' => $request->scheduled_for,
            'status' => 'pending',
        ]);

        ActivityLog::log(
            auth('api')->user(),
            'post_scheduled',
            'Post',
            $post->id,
            ['scheduled_for' => $request->scheduled_for]
        );

        return response()->json([
            'message' => 'Post scheduled successfully',
            'post' => $post->load(['channel', 'creator'])
        ]);
    }
}


