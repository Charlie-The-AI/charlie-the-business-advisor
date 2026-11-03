<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Subscription Plans & Entitlements Catalog
    |--------------------------------------------------------------------------
    */

    'plans' => [
        'free' => [
            'code' => 'free',
            'name' => 'Starter',
            'tagline' => 'For independent solo founders and boutique businesses.',
            'price_monthly_minor_units' => 0,
            'currency' => 'NGN',
            'paystack_plan_code' => null,
            'features' => [
                '1 business profile',
                '10 analytics snapshots / month',
                '100,000 AI tokens / month',
                'Pareto 80/20 concentration analysis',
                'Standard data export',
            ],
            'quotas' => [
                'monthly_snapshots' => 10,
                'monthly_ai_tokens' => 100000,
                'max_businesses' => 1,
                'max_members' => 2,
            ],
        ],

        'growth' => [
            'code' => 'growth',
            'name' => 'Growth',
            'tagline' => 'For growing merchants scaling revenues and product lines.',
            'price_monthly_minor_units' => 2500000, // ₦25,000.00
            'currency' => 'NGN',
            'paystack_plan_code' => env('PAYSTACK_PLAN_GROWTH', 'PLN_growth_monthly'),
            'features' => [
                'Up to 5 business profiles',
                '100 analytics snapshots / month',
                '1,000,000 AI tokens / month',
                'Pareto & RFM customer cohorts',
                'Automated AI advisory recommendations',
                'Natural language business chat',
                '5 team members',
            ],
            'quotas' => [
                'monthly_snapshots' => 100,
                'monthly_ai_tokens' => 1000000,
                'max_businesses' => 5,
                'max_members' => 5,
            ],
        ],

        'pro' => [
            'code' => 'pro',
            'name' => 'Pro Advisor',
            'tagline' => 'For high-volume brands and e-commerce enterprises.',
            'price_monthly_minor_units' => 7500000, // ₦75,000.00
            'currency' => 'NGN',
            'paystack_plan_code' => env('PAYSTACK_PLAN_PRO', 'PLN_pro_monthly'),
            'features' => [
                'Up to 20 business profiles',
                '500 analytics snapshots / month',
                '5,000,000 AI tokens / month',
                'Advanced statistical anomaly detection',
                'Custom AI strategic playbooks',
                'Dedicated webhook integrations',
                '25 team members',
            ],
            'quotas' => [
                'monthly_snapshots' => 500,
                'monthly_ai_tokens' => 5000000,
                'max_businesses' => 20,
                'max_members' => 25,
            ],
        ],

        'platform' => [
            'code' => 'platform',
            'name' => 'Platform',
            'tagline' => 'For holding companies, agencies, and financial aggregators.',
            'price_monthly_minor_units' => 25000000, // ₦250,000.00
            'currency' => 'NGN',
            'paystack_plan_code' => env('PAYSTACK_PLAN_PLATFORM', 'PLN_platform_monthly'),
            'features' => [
                'Unlimited business profiles',
                'Unlimited analytics snapshots',
                'Unlimited AI tokens',
                'Priority queue processing',
                'Custom LLM fine-tuning & prompt grounding',
                'Dedicated account manager',
            ],
            'quotas' => [
                'monthly_snapshots' => -1, // Unlimited
                'monthly_ai_tokens' => -1, // Unlimited
                'max_businesses' => -1,
                'max_members' => -1,
            ],
        ],
    ],

];
