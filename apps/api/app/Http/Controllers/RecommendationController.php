<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateRecommendationsJob;
use App\Models\AnalyticsSnapshot;
use App\Models\Business;
use App\Models\Recommendation;
use App\Models\RecommendationJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class RecommendationController extends Controller
{
    /**
     * Dispatches background recommendation generation.
     */
    public function generate(Request $request): JsonResponse
    {
        $organization = $request->attributes->get('organization');

        $validator = Validator::make($request->all(), [
            'snapshotId' => 'required_without:snapshot_id|string',
            'snapshot_id' => 'required_without:snapshotId|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'validation_failed',
                'message' => 'snapshotId is required.',
                'details' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $snapshotIdentifier = $request->input('snapshotId') ?? $request->input('snapshot_id');

        $snapshot = AnalyticsSnapshot::with('business')
            ->where(function ($q) use ($snapshotIdentifier) {
                $q->where('id', $snapshotIdentifier)
                  ->orWhere('snapshot_id', $snapshotIdentifier);
            })
            ->whereHas('business', function ($q) use ($organization) {
                $q->where('organization_id', $organization->id);
            })
            ->first();

        if (!$snapshot) {
            return response()->json([
                'error' => 'snapshot_not_found',
                'message' => 'The specified snapshot was not found for this organization.',
            ], Response::HTTP_NOT_FOUND);
        }

        // Create job record
        $job = RecommendationJob::create([
            'business_id' => $snapshot->business_id,
            'analytics_snapshot_id' => $snapshot->id,
            'status' => 'pending',
        ]);

        // Dispatch to background queue
        GenerateRecommendationsJob::dispatch($job->id);

        return response()->json([
            'status' => 'pending',
            'message' => 'Recommendation generation job queued successfully.',
            'jobId' => $job->id,
            'businessId' => $snapshot->business_id,
            'createdAt' => $job->created_at->toISOString(),
        ], Response::HTTP_ACCEPTED);
    }

    /**
     * Checks recommendation generation job status.
     */
    public function showJob(Request $request, string $jobId): JsonResponse
    {
        $organization = $request->attributes->get('organization');

        $job = RecommendationJob::with(['snapshot', 'business'])
            ->where('id', $jobId)
            ->whereHas('business', function ($q) use ($organization) {
                $q->where('organization_id', $organization->id);
            })
            ->first();

        if (!$job) {
            return response()->json([
                'error' => 'job_not_found',
                'message' => 'Recommendation job not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $recommendations = [];
        if ($job->status === 'completed') {
            $recommendations = Recommendation::where('business_id', $job->business_id)
                ->where('analytics_snapshot_id', $job->analytics_snapshot_id)
                ->get();
        }

        return response()->json([
            'jobId' => $job->id,
            'status' => $job->status,
            'attempts' => $job->attempts,
            'errorMessage' => $job->error_message,
            'businessId' => $job->business_id,
            'createdAt' => $job->created_at->toISOString(),
            'recommendations' => $recommendations,
        ]);
    }

    /**
     * Lists recommendations for a business with filtering.
     */
    public function listByBusiness(Request $request, string $businessId): JsonResponse
    {
        $organization = $request->attributes->get('organization');

        $business = Business::where('id', $businessId)
            ->where('organization_id', $organization->id)
            ->first();

        if (!$business) {
            return response()->json([
                'error' => 'business_not_found',
                'message' => 'Business not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $query = $business->recommendations()->latest();

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        return response()->json([
            'data' => $query->paginate(20),
        ]);
    }

    /**
     * Updates recommendation lifecycle status (viewed, accepted, in_progress, completed, dismissed).
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $organization = $request->attributes->get('organization');

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:new,viewed,accepted,in_progress,completed,dismissed',
            'dismissedReason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'validation_failed',
                'details' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $recommendation = Recommendation::with('business')
            ->where('id', $id)
            ->whereHas('business', function ($q) use ($organization) {
                $q->where('organization_id', $organization->id);
            })
            ->first();

        if (!$recommendation) {
            return response()->json([
                'error' => 'not_found',
                'message' => 'Recommendation not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $recommendation->update([
            'status' => $request->input('status'),
            'dismissed_reason' => $request->input('dismissedReason') ?? $recommendation->dismissed_reason,
        ]);

        return response()->json([
            'message' => 'Recommendation status updated successfully.',
            'recommendation' => $recommendation,
        ]);
    }
}
