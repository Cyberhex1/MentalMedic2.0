# Security Specification & Test Matrix

## 1. Data Invariants
- Each authenticated user (`request.auth.uid`) owns their isolated workspace data stored exclusively under `/users/{userId}/`.
- Cross-user reads or writes are strictly forbidden. Unauthenticated users cannot read or write any user collection.
- Field payload sizes and types are strictly bounded (e.g. titles <= 200 chars, content <= 5000 chars).
- Document path IDs must satisfy `isValidId(id)` pattern checks (`^[a-zA-Z0-9_\-]+$`).

## 2. Dirty Dozen Payloads (Rejection Targets)
1. **Unauthenticated Read/Write**: Attempt to read/write `/users/user123/todos/t1` without auth token -> REJECTED.
2. **Cross-User Impersonation**: Auth user `uid_A` attempting to write to `/users/uid_B/todos/t1` -> REJECTED.
3. **Invalid ID Injection**: Document ID with path traversal or extreme length e.g. `../../admin` -> REJECTED.
4. **Oversized String Attack**: `title` exceeding 200 characters -> REJECTED.
5. **Oversized Content Attack**: `content` exceeding 5000 characters -> REJECTED.
6. **Type Poisoning**: `completed` passed as string `"true"` instead of boolean -> REJECTED.
7. **Enum Violation**: `priority` passed as `"super_high"` instead of `"low" | "medium" | "high"` -> REJECTED.
8. **Missing Required Fields**: Todo item created without `createdAt` timestamp -> REJECTED.
9. **Ghost Field Shadow Write**: Injecting `{ adminPrivileges: true }` into userProfile -> REJECTED.
10. **Negative Severity Attack**: Symptom severity passed as `-5` or `100` instead of valid number -> REJECTED.
11. **Spoofed User ID in Body**: `todoItem.userId` not matching `request.auth.uid` -> REJECTED.
12. **Blanket Query Scraping**: Running list query on another user's collection -> REJECTED.
