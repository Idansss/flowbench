# Bulk QR Generator for Events

Create QR codes for events with custom templates and verification tokens.

## Features

- ✅ **Bulk generation** - Process entire CSV in one batch
- ✅ **Custom sizing** - 100-1000px
- ✅ **Error correction** - L, M, Q, H levels
- ✅ **Signed payloads** - Optional cryptographic signing
- ✅ **Verification tokens** - Unique token per QR code
- ✅ **Individual PNGs** - One file per attendee
- ✅ **Printable export** - Coming soon

## Input Format

CSV with attendee data:
```csv
name,email,company,ticket_type,event_id
John Doe,john@example.com,Acme Corp,VIP,EVT-001
```

**Required columns:** At least `name` or unique identifier  
**Maximum:** 1,000 entries per batch

## Configuration

```typescript
{
  errorCorrection: "L" | "M" | "Q" | "H";  // Default: M
  size: number;                              // 100-1000, Default: 300
  includeText: boolean;                      // Show name below QR
  logoUrl?: string;                          // Center logo overlay
  secret?: string;                           // For signed payloads
}
```

## Error Correction Levels

- **L (Low):** ~7% error correction - Smallest QR code
- **M (Medium):** ~15% error correction - Recommended
- **Q (Quartile):** ~25% error correction - For damaged environments
- **H (High):** ~30% error correction - Maximum resilience

## Output

### Individual QR Codes
- `john_doe_qr.png`
- `jane_smith_qr.png`
- etc.

### Verification Tokens CSV
```csv
index,name,token,email,ticket_type
1,John Doe,a1b2c3d4...,john@example.com,VIP
```

### Signed Payload Example
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "ticket_type": "VIP",
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "signature": "signed_hash_here"
}
```

## Use Cases

1. **Event check-in** - Scan QR codes at entrance
2. **Badge printing** - Embed in name badges
3. **Ticket validation** - Verify authenticity
4. **Access control** - Different areas for VIP vs Standard

## Verification Flow

1. Generate QR codes with signed payloads
2. Download verification_tokens.csv
3. At event, scan QR code
4. Parse JSON payload
5. Verify token against CSV
6. Grant or deny access

## API Endpoint

```bash
POST /api/tools/qr-generator
```

## Sample File

See `infra/samples/sample-qr-data.csv`

## Acceptance Criteria

✅ Unique QR per row  
✅ Signed payload support  
✅ Verification tokens CSV  
✅ Individual PNG exports  
✅ Handles 1,000+ entries  

