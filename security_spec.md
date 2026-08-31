# Security Specification: Admin Dashboard & CMS Architecture

## 1. Data Invariants
1. Only authenticated administrators with a verified email of `abualss3ud@gmail.com` can create, update, or delete portfolio content (`projects`, `blogPosts`, `services`, `testimonials`, `media`, `settings`).
2. Public visitors can only view content in `projects`, `blogPosts`, `services`, and `testimonials` that are explicitly flagged as `published == true`.
3. Public visitors can submit contact messages (`messages`) but cannot read, list, update, or delete any messages.
4. Messages are restricted to `allow read, write: if isAdmin()` except for `allow create` which is public but strictly validated.
5. PII (emails, messages) is fully isolated and only accessible to verified administrators.

## 2. The "Dirty Dozen" Malicious Payloads (Integrity, Identity, and State Violations)

1. **Unauthenticated Project Creation**
   - Payload: `{ title: { en: "Hacked" }, slug: "hacked", published: true }`
   - Target: `/projects/attacker-doc`
   - Expected: `PERMISSION_DENIED`

2. **Self-Publishing Draft Project**
   - Payload: `{ published: true }`
   - Target: `/projects/existing-draft` by non-admin
   - Expected: `PERMISSION_DENIED`

3. **Spoofed Admin Email Authenticated Write**
   - Payload: `{ title: { en: "Malicious" }, slug: "malicious" }`
   - Context: `request.auth.token.email = "abualss3ud@gmail.com"` but `request.auth.token.email_verified = false`
   - Target: `/projects/some-project`
   - Expected: `PERMISSION_DENIED`

4. **Malicious Image Injection in Media**
   - Payload: `{ url: "javascript:alert(1)", fileName: "xss.jpg" }`
   - Target: `/media/attacker-media` by non-admin
   - Expected: `PERMISSION_DENIED`

5. **Exposing All Contact Messages**
   - Operation: `get` or `list` on `/messages` by a standard authenticated/unauthenticated user
   - Expected: `PERMISSION_DENIED`

6. **Tampering with Contact Messages (Set as Read)**
   - Payload: `{ read: true }`
   - Target: `/messages/message-id` by non-admin
   - Expected: `PERMISSION_DENIED`

7. **Overwriting Global Settings**
   - Payload: `{ websiteName: "Hacked Website", contactEmail: "attacker@evil.com" }`
   - Target: `/settings/global` by non-admin
   - Expected: `PERMISSION_DENIED`

8. **Giant Message Denial of Wallet**
   - Payload: `{ senderName: "A" * 1000, email: "b" * 1000, message: "c" * 100000, read: false }`
   - Target: `/messages/message-id` (volumetric payload)
   - Expected: `PERMISSION_DENIED` (failed size constraints)

9. **Deleting Comments Without Admin Privilege**
   - Target: `/comments/comment-id` by standard user
   - Expected: `PERMISSION_DENIED`

10. **Shadow Field Injection in Blog Post**
    - Payload: `{ title: { en: "Post" }, extraField: "ghost", published: true }`
    - Target: `/blogPosts/new-post` by non-admin
    - Expected: `PERMISSION_DENIED`

11. **Draft Post Escalation via List Bypass**
    - Operation: `list` on `/blogPosts` by non-admin requesting draft posts (`published == false`)
    - Expected: `PERMISSION_DENIED`

12. **Bypassing File Size Constraints**
    - Payload: `{ url: "http://example.com/verylarge", fileName: "x" * 2000 }`
    - Target: `/media/media-id` by non-admin
    - Expected: `PERMISSION_DENIED`
