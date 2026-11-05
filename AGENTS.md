<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Legal pages use separate content routes with per-page metadata, a shared legal layout, and a shared footer link group so policy navigation stays consistent without changing the quiz flow.
- Custom schedule documents use a versioned validated model with independent day arrays; preview, exports and saved documents share it to avoid diverging edits.
- Name-only activity updates use a separate editor path from structural and timing changes so guest personalization does not bypass advanced editing guards.
- Private account reads and writes use authenticated server functions and owner-only RLS; protected pages live under the client-only authenticated layout because sessions are browser-owned.
- A single root auth provider manages identity transitions and cache teardown; inline result sign-in preserves unsaved edits without browser storage.
- Profile photos use a private owner-scoped storage bucket and signed URLs; no profile photo is public by default.
- Cookie consent lives in one root-mounted component backed by a pure consent helper; any analytics must be gated on that helper so nothing loads before opt-in.
