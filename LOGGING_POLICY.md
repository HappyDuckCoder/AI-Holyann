# Logging Policy

## Overview
This project only logs warnings and errors. All `console.log`, `console.info`, and `console.debug` statements have been removed from production code.

## Allowed Logging Methods

### ✅ console.warn()
Use for:
- Non-critical issues that should be monitored
- Deprecated feature usage
- Performance warnings
- Configuration issues

Example:
```typescript
console.warn('⚠️ User not found in Local DB, trying Supabase');
```

### ✅ console.error()
Use for:
- Errors that need immediate attention
- Failed operations
- Critical failures
- Exception logging

Example:
```typescript
console.error('❌ Failed to sync to Local DB:', error);
```

## Disallowed Logging Methods

### ❌ console.log()
- Removed from all production code
- Use comments instead for code documentation

### ❌ console.info()
- Removed from all production code

### ❌ console.debug()
- Removed from all production code

## Development Logging

For development-only logging, use the logger utility:

```typescript
import { logger } from '@/lib/utils/logger';

// Only logs in development
logger.info('Debug information');
logger.debug('Detailed debug info');
```

## Best Practices

1. **Use comments instead of console.log** for code flow documentation
2. **Log errors with context** - include relevant data
3. **Use structured logging** - consistent format for easier parsing
4. **Don't log sensitive data** - passwords, tokens, PII
5. **Log at appropriate levels** - warn for warnings, error for errors

## Migration Guide

If you need to add logging:

1. **For errors**: Use `console.error()`
2. **For warnings**: Use `console.warn()`
3. **For debug info**: Use comments or `logger.debug()` (dev only)
4. **For info**: Use comments

## ESLint Rule

The project uses ESLint to enforce this policy:

```json
{
  "rules": {
    "no-console": ["warn", { 
      "allow": ["warn", "error"] 
    }]
  }
}
```
