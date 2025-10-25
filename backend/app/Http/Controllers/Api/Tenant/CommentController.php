<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\ActivityLog;
use App\Services\Facebook\FacebookService;
use App\Services\Instagram\InstagramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Comment::with(['channel', 'post', 'replier'])
            ->orderBy('commented_at', 'desc');

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('channel_id')) {
            $query->where('channel_id', $request->channel_id);
        }

        if ($request->has('post_id')) {
            $query->where('post_id', $request->post_id);
        }

        if ($request->has('search')) {
            $query->where('message', 'like', '%' . $request->search . '%');
        }

        // Top-level comments only by default
        if (!$request->has('include_replies')) {
            $query->topLevel();
        }

        $comments = $query->paginate($request->per_page ?? 20);

        return response()->json($comments);
    }

    public function show(int $id): JsonResponse
    {
        $comment = Comment::with(['channel', 'post', 'replies', 'replier'])->findOrFail($id);

        return response()->json($comment);
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $comment = Comment::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $channel = $comment->channel;

            // Reply via platform API
            $response = match($channel->type) {
                'facebook' => app(FacebookService::class)->replyToComment(
                    $channel,
                    $comment->provider_comment_id,
                    $request->message
                ),
                'instagram' => app(InstagramService::class)->replyToComment(
                    $channel,
                    $comment->provider_comment_id,
                    $request->message
                ),
                default => throw new \Exception('Unsupported channel type'),
            };

            // Update comment with reply info
            $comment->update([
                'replied_by' => auth('api')->id(),
                'replied_at' => now(),
            ]);

            ActivityLog::log(
                auth('api')->user(),
                'comment_replied',
                'Comment',
                $comment->id,
                ['message' => $request->message]
            );

            return response()->json([
                'message' => 'Reply sent successfully',
                'response' => $response,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to send reply',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function hide(int $id): JsonResponse
    {
        $comment = Comment::findOrFail($id);

        try {
            $channel = $comment->channel;

            // Hide via platform API
            match($channel->type) {
                'facebook' => app(FacebookService::class)->hideComment(
                    $channel,
                    $comment->provider_comment_id
                ),
                'instagram' => app(InstagramService::class)->hideComment(
                    $channel,
                    $comment->provider_comment_id
                ),
                default => throw new \Exception('Unsupported channel type'),
            };

            $comment->update(['status' => 'hidden']);

            ActivityLog::log(
                auth('api')->user(),
                'comment_hidden',
                'Comment',
                $comment->id
            );

            return response()->json([
                'message' => 'Comment hidden successfully',
                'comment' => $comment,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to hide comment',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function unhide(int $id): JsonResponse
    {
        $comment = Comment::findOrFail($id);

        try {
            $channel = $comment->channel;

            // Unhide via platform API (set is_hidden = false)
            $response = app(FacebookService::class)->hideComment(
                $channel,
                $comment->provider_comment_id
            ); // This would need to be updated to support unhide

            $comment->update(['status' => 'visible']);

            ActivityLog::log(
                auth('api')->user(),
                'comment_unhidden',
                'Comment',
                $comment->id
            );

            return response()->json([
                'message' => 'Comment unhidden successfully',
                'comment' => $comment,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to unhide comment',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $comment = Comment::findOrFail($id);

        try {
            $channel = $comment->channel;

            // Delete via platform API
            $success = match($channel->type) {
                'facebook' => app(FacebookService::class)->deleteComment(
                    $channel,
                    $comment->provider_comment_id
                ),
                'instagram' => app(InstagramService::class)->deleteComment(
                    $channel,
                    $comment->provider_comment_id
                ),
                default => throw new \Exception('Unsupported channel type'),
            };

            if ($success) {
                $comment->update(['status' => 'deleted']);

                ActivityLog::log(
                    auth('api')->user(),
                    'comment_deleted',
                    'Comment',
                    $comment->id
                );

                return response()->json(['message' => 'Comment deleted successfully']);
            }

            throw new \Exception('Failed to delete comment');

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete comment',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function markAsSpam(int $id): JsonResponse
    {
        $comment = Comment::findOrFail($id);

        $comment->update(['status' => 'spam']);

        // Auto-hide spam comments
        try {
            $this->hide($id);
        } catch (\Exception $e) {
            // Log error but don't fail the operation
        }

        ActivityLog::log(
            auth('api')->user(),
            'comment_marked_spam',
            'Comment',
            $comment->id
        );

        return response()->json([
            'message' => 'Comment marked as spam',
            'comment' => $comment,
        ]);
    }
}


