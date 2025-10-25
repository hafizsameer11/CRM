<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class AIController extends Controller
{
    public function generateCaption(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'topic' => 'required|string|max:200',
            'tone' => 'nullable|string|in:professional,casual,friendly,funny,inspirational',
            'platform' => 'nullable|string|in:facebook,instagram,twitter',
            'hashtags' => 'nullable|boolean',
            'emoji' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Get API key from settings
            $apiKey = Setting::where('key', 'OPENAI_API_KEY')
                ->where('scope', 'system')
                ->first()?->value;

            if (!$apiKey) {
                return response()->json([
                    'error' => 'AI service not configured',
                    'message' => 'OpenAI API key not found. Please contact administrator.',
                ], 503);
            }

            $topic = $request->topic;
            $tone = $request->tone ?? 'professional';
            $platform = $request->platform ?? 'facebook';
            $includeHashtags = $request->hashtags ?? true;
            $includeEmoji = $request->emoji ?? true;

            $prompt = $this->buildPrompt($topic, $tone, $platform, $includeHashtags, $includeEmoji);

            // Call OpenAI API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a professional social media content creator. Generate engaging, platform-appropriate captions.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.8,
                'n' => 3, // Generate 3 variations
                'max_tokens' => 300,
            ]);

            if (!$response->successful()) {
                throw new \Exception('OpenAI API request failed: ' . $response->body());
            }

            $data = $response->json();
            $suggestions = [];

            foreach ($data['choices'] ?? [] as $choice) {
                $suggestions[] = trim($choice['message']['content'] ?? '');
            }

            return response()->json([
                'suggestions' => $suggestions,
                'topic' => $topic,
                'tone' => $tone,
                'platform' => $platform,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate caption',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function generateHashtags(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'topic' => 'required|string|max:200',
            'count' => 'nullable|integer|min:3|max:30',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $apiKey = Setting::where('key', 'OPENAI_API_KEY')
                ->where('scope', 'system')
                ->first()?->value;

            if (!$apiKey) {
                return response()->json([
                    'error' => 'AI service not configured'
                ], 503);
            }

            $topic = $request->topic;
            $count = $request->count ?? 10;

            $prompt = "Generate {$count} relevant and trending hashtags for a social media post about: {$topic}. Return only hashtags, one per line, with # symbol.";

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'user', 'content' => $prompt]
                ],
                'temperature' => 0.7,
                'max_tokens' => 150,
            ]);

            if (!$response->successful()) {
                throw new \Exception('OpenAI API request failed');
            }

            $data = $response->json();
            $content = $data['choices'][0]['message']['content'] ?? '';

            // Parse hashtags from response
            $hashtags = array_filter(
                array_map('trim', explode("\n", $content)),
                fn($tag) => str_starts_with($tag, '#')
            );

            return response()->json([
                'hashtags' => array_values($hashtags),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate hashtags',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    protected function buildPrompt(string $topic, string $tone, string $platform, bool $includeHashtags, bool $includeEmoji): string
    {
        $charLimit = match($platform) {
            'instagram' => 2200,
            'facebook' => 63206,
            'twitter' => 280,
            default => 500,
        };

        $prompt = "Create an engaging {$tone} social media caption for {$platform} about: {$topic}\n\n";
        $prompt .= "Requirements:\n";
        $prompt .= "- Keep it under {$charLimit} characters\n";
        $prompt .= "- Use {$tone} tone\n";
        $prompt .= "- Make it platform-appropriate for {$platform}\n";
        
        if ($includeHashtags) {
            $prompt .= "- Include 3-5 relevant hashtags at the end\n";
        }
        
        if ($includeEmoji) {
            $prompt .= "- Use emojis to make it more engaging\n";
        }

        $prompt .= "\nReturn only the caption text, ready to post.";

        return $prompt;
    }
}


