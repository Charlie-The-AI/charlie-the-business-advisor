# Laravel Integration Guide

Integrate Charlie with an existing Laravel application (WooCommerce, Bagisto, or custom Eloquent) without modifying your PHP database schemas.

---

## 1. Architecture

```text
Laravel App (PHP)  ──[ HTTP / JSON ]──>  Charlie Node/Next.js Service
  • Orders Table                          • /api/charlie/analyze
  • Order Items                           • /api/charlie/advise
  • Customers                             • /api/charlie/chat
```

---

## 2. Laravel HTTP Service

Create `app/Services/CharlieAnalyticsService.php`:

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class CharlieAnalyticsService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.charlie.url', 'http://localhost:3000');
    }

    public function analyzeOrders(array $orders, string $currency = 'NGN'): array
    {
        $response = Http::post("{$this->baseUrl}/api/charlie/analyze", [
            'orders' => $orders,
            'currency' => $currency,
        ]);

        return $response->json('snapshot', []);
    }

    public function getAdvice(array $orders): array
    {
        $response = Http::post("{$this->baseUrl}/api/charlie/advise", [
            'orders' => $orders,
        ]);

        return $response->json('recommendations', []);
    }
}
```

---

## 3. Scheduled Artisan Command

Run analytics daily on a schedule via Laravel Artisan:

```php
// app/Console/Commands/SyncAnalyticsCommand.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Services\CharlieAnalyticsService;

class SyncAnalyticsCommand extends Command
{
    protected $signature = 'charlie:analyze';
    protected $description = 'Compute daily business analytics via Charlie';

    public function handle(CharlieAnalyticsService $service)
    {
        $orders = Order::with('items')
            ->where('created_at', '>=', now()->subDays(30))
            ->get()
            ->toArray();

        $snapshot = $service->analyzeOrders($orders, 'NGN');
        $this->info("Calculated Net Revenue: " . $snapshot['sales']['netRevenueFormatted']);
    }
}
```
