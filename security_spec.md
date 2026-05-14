# Security Specification - Finai

## Data Invariants
1. A transaction must belong to the authenticated user (`userId == request.auth.uid`).
2. A card must belong to the authenticated user.
3. A goal must belong to the authenticated user.
4. Users can only read and write their own data.
5. All amounts must be positive numbers (or zero).
6. Timestamps (`createdAt`, `updatedAt`) must be server-generated.

## The "Dirty Dozen" Payloads (Red Team)
1. **Identity Spoofing**: Attempt to create a transaction with `userId` of another user.
2. **Amount Negation**: Attempt to set a negative `amount` in a transaction.
3. **Ghost Field Injection**: Adding `isVerified: true` to a user profile update.
4. **Card Limit Hijack**: Attempt to update another user's card limit.
5. **Goal Progress Manipulation**: Directly updating another user's goal `currentAmount`.
6. **Chat Session Eavesdropping**: Attempting to read `/chats/{chatId}` where `userId != request.auth.uid`.
7. **Recursive Cost Attack**: Sending 1.5KB junk string as `transactionId`.
8. **Privilege Escalation**: Attempting to set `role: 'admin'` on the user document.
9. **Timestamp Spoofing**: Sending a manual `createdAt` date from the client.
10. **Terminal State Lockdown Bypass**: Attempting to edit a "locked" (reconciled) transaction if such field existed.
11. **PII Leak**: Attempting to query all users' emails by omitting the `where` clause.
12. **Orphaned Writes**: Creating a transaction for a `cardId` that doesn't exist.

## Verification
All these payloads must return `PERMISSION_DENIED` by the `firestore.rules`.
