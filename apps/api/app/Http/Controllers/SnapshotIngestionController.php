<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateRecommendationsJob;
use App\Models\AnalyticsSnapshot;
use App\Models\AuditLog;
use App\Models\Business;
use App\Models\Organization;
use App\Models\UsageRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class SnapshotIngestionController extends Controller
{
    /**
     * Ingests a validated AnalyticsSnapshot.
     */
    public function store(Request $request): JsonResponse
    {
        $organization = $request->attributes->get('organization');
        $apiKey = $request->attributes->get('apiKey');

        // 1. Validate payload structure
        $validator = Validator::make($request->all(), [
            'schemaVersion' => 'required|string',
            'calculationVersion' => 'required|string',
            'snapshotId' => 'required|string|max:64',
            'businessId' => 'required|string',
            'currency' => 'required|string|size:3',
            'createdAt' => 'required|date',
            'period' => 'required|array',
            'period.from' => 'required|date',
            'period.to' => 'required|date',
            'sales' => 'required|array',
            'sales.netRevenueMinorUnits' => 'required|integer',
            'sales.grossSalesMinorUnits' => 'required|integer',
            'sales.totalOrders' => 'required|integer',
            'sales.totalCompletedOrders' => 'required|integer',
            'sales.averageOrderValueMinorUnits' => 'required|integer',
            'pareto' => 'required|array',
            'customers' => 'required|array',
            'products' => 'required|array',
            'trends' => 'required|array',
            'dataQuality' => 'required|array',
            'dataQuality.scorePercentage' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'validation_failed',
                'message' => 'The analytics snapshot payload is malformed.',
                'details' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $businessId = $request->input('businessId');

        // 2. Tenant isolation check: ensure business belongs to organization
        $business = Business::where('id', $businessId)
            ->where('organization_id', $organization->id)
            ->first();

        if (!$business) {
            return response()->json([
                'error' => 'business_not_found',
                'message' => "Business '{$businessId}' does not belong to the authenticated organization.",
            ], Response::HTTP_NOT_FOUND);
        }

        // 3. Idempotency Check
        $idempotencyKey = $request->header('Idempotency-Key');
        $snapshotId = $request->input('snapshotId');

        $existingSnapshot = AnalyticsSnapshot::where('business_id', $businessId)
            ->where(function ($q) use ($idempotencyKey, $snapshotId) {
                if ($idempotencyKey) {
                    $q->where('idempotency_key', $idempotencyKey);
                } else {
                    $q->where('snapshot_id', $snapshotId);
                }
            })
            ->where('created_at', '>=', now()->subHours(24))
            ->first();

        if ($existingSnapshot) {
            return response()->json([
                'status' => 'accepted_idempotent',
                'message' => 'Snapshot already ingested within 24 hours. Returning existing record.',
                'snapshotId' => $existingSnapshot->snapshot_id,
                'id' => $existingSnapshot->id,
                'businessId' => $businessId,
                'createdAt' => $existingSnapshot->created_at->toISOString(),
            ], Response::HTTP_OK);
        }

        // 4. Enforce Usage Quota
        if (!$organization->hasSnapshotQuota()) {
            return response()->json([
                'error' => 'quota_exceeded',
                'message' => 'Your organization has reached its monthly snapshot ingestion quota. Please upgrade your plan.',
                'plan' => $organization->plan,
                'monthlyQuota' => $organization->monthly_snapshot_quota,
            ], Response::HTTP_TOO_MANY_REQUESTS);
        }

        // 5. Persist Snapshot
        $snapshot = AnalyticsSnapshot::create([
            'business_id' => $business->id,
            'snapshot_id' => $snapshotId,
            'idempotency_key' => $idempotencyKey,
            'schema_version' => $request->input('schemaVersion'),
            'calculation_version' => $request->input('calculationVersion'),
            'currency' => strtoupper($request->input('currency')),
            'period_from' => $request->input('period.from'),
            'period_to' => $request->input('period.to'),
            'net_revenue_minor_units' => $request->input('sales.netRevenueMinorUnits'),
            'gross_sales_minor_units' => $request->input('sales.grossSalesMinorUnits'),
            'total_orders' => $request->input('sales.totalOrders'),
            'total_completed_orders' => $request->input('sales.totalCompletedOrders'),
            'average_order_value_minor_units' => $request->input('sales.averageOrderValueMinorUnits'),
            'repeat_purchase_rate' => $request->input('customers.repeatPurchaseRatePercentage'),
            'data_quality_score' => $request->input('dataQuality.scorePercentage'),
            'payload' => $request->all(),
        ]);

        // 6. Record usage
        UsageRecord::create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'metric' => 'snapshot_ingestion',
            'quantity' => 1,
            'metadata' => ['snapshot_id' => $snapshot->snapshot_id],
        ]);

        // 7. Audit log
        AuditLog::create([
            'organization_id' => $organization->id,
            'business_id' => $business->id,
            'actor_type' => 'api_key',
            'actor_id' => $apiKey->id,
            'action' => 'snapshot_ingested',
            'ip_address' => $request->ip(),
            'details' => [
                'snapshot_id' => $snapshot->snapshot_id,
                'total_orders' => $snapshot->total_orders,
            ],
        ]);

        // Optional recommendation generation triggering
        $jobId = null;
        if ($request->boolean('generate_recommendations')) {
            $recJob = $snapshot->recommendationJobs()->create([
                'business_id' => $business->id,
                'status' => 'pending',
            ]);
            GenerateRecommendationsJob::dispatch($recJob->id);
            $jobId = $recJob->id;
        }

        return response()->json([
            'status' => 'created',
            'message' => 'Analytics snapshot accepted and stored successfully.',
            'id' => $snapshot->id,
            'snapshotId' => $snapshot->snapshot_id,
            'businessId' => $business->id,
            'recommendationJobId' => $jobId,
            'createdAt' => $snapshot->created_at->toISOString(),
        ], Response::HTTP_CREATED);
    }

    /**
     * Retrieves an ingested snapshot by ID.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $organization = $request->attributes->get('organization');

        $snapshot = AnalyticsSnapshot::with('business')
            ->where('id', $id)
            ->whereHas('business', function ($q) use ($organization) {
                $q->where('organization_id', $organization->id);
            })
            ->first();

        if (!$snapshot) {
            return response()->json([
                'error' => 'not_found',
                'message' => 'Snapshot not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json($snapshot->payload);
    }

    /**
     * Lists recent snapshots for a business.
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
                'message' => "Business not found.",
            ], Response::HTTP_NOT_FOUND);
        }

        $snapshots = $business->snapshots()
            ->latest()
            ->limit(20)
            ->get([
                'id',
                'snapshot_id',
                'currency',
                'period_from',
                'period_to',
                'net_revenue_minor_units',
                'total_orders',
                'data_quality_score',
                'created_at',
            ]);

        return response()->json(['data' => $snapshots]);
    }
}
