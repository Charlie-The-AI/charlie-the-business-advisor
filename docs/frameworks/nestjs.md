# NestJS Integration Guide

Integrate Charlie into [NestJS](https://nestjs.com/) enterprise applications using clean dependency injection.

---

## 1. Create Charlie Service

```typescript
// charlie.service.ts
import { Injectable } from "@nestjs/common";
import { Charlie, CharlieOrder, CurrencyCode } from "charlie-the-business-advisor";

@Injectable()
export class CharlieService {
  private readonly charlie: Charlie;

  constructor() {
    this.charlie = new Charlie({
      defaultCurrency: (process.env.CHARLIE_DEFAULT_CURRENCY as CurrencyCode) || "USD",
      ai: {
        provider: (process.env.CHARLIE_AI_PROVIDER as any) || "mock",
        apiKey: process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY,
      },
    });
  }

  analyze(orders: CharlieOrder[], currency?: CurrencyCode) {
    return this.charlie.analyze({ orders, currency });
  }

  advise(orders: CharlieOrder[], objective?: string) {
    return this.charlie.advise({ orders, objective });
  }

  chat(question: string, orders: CharlieOrder[]) {
    return this.charlie.chat({ question, orders });
  }
}
```

---

## 2. Controller & Endpoints

```typescript
// charlie.controller.ts
import { Controller, Post, Body } from "@nestjs/common";
import { CharlieService } from "./charlie.service";

@Controller("analytics")
export class CharlieController {
  constructor(private readonly charlieService: CharlieService) {}

  @Post("analyze")
  analyze(@Body() body: { orders: any[] }) {
    return { success: true, snapshot: this.charlieService.analyze(body.orders) };
  }

  @Post("advise")
  async advise(@Body() body: { orders: any[]; objective?: string }) {
    return { success: true, ...(await this.charlieService.advise(body.orders, body.objective)) };
  }

  @Post("chat")
  async chat(@Body() body: { question: string; orders: any[] }) {
    return { success: true, ...(await this.charlieService.chat(body.question, body.orders)) };
  }
}
```
