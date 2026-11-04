# NestJS Integration Example — Charlie the Business Advisor

This example demonstrates how to integrate **Charlie the Business Advisor** into a [NestJS](https://nestjs.com/) enterprise backend using standard Dependency Injection.

## Features

- **Injectable `CharlieService`**: Wraps the deterministic analytics engine and multi-provider AI SDK.
- **REST Controller**: Endpoints for analytics snapshot computation, grounded AI advice generation, and business Q&A chat.
- **Zero Mandatory Infrastructure**: Runs out of the box with zero external databases or cloud dependencies.

## Architecture Pattern

```typescript
import { Injectable } from '@nestjs/common';
import { Charlie, CharlieOrder } from 'charlie-the-business-advisor';

@Injectable()
export class CharlieService {
  private readonly charlie = new Charlie({ defaultCurrency: 'NGN' });

  analyze(orders: CharlieOrder[]) {
    return this.charlie.analyze({ orders });
  }

  advise(orders: CharlieOrder[]) {
    return this.charlie.advise({ orders });
  }

  chat(question: string, orders: CharlieOrder[]) {
    return this.charlie.chat({ question, orders });
  }
}
```

## Running the Example

```bash
pnpm --filter example-nestjs-integration run build
```
