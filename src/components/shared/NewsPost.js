'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Alert from '@/components/ui/Alert';
import { formatRelativeTime, getApiErrorMessage } from '@/lib/utils';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { DEFAULT_BRAND_LOGO } from '@/lib/brand';

function normalizeComments(raw) {
  if (raw == null) return [];
  const arr = Array.isArray(raw) ? raw : raw.data ?? [];
  return arr.map((item) => item?.data ?? item);
}

function initials(name) {
  const s = String(name || '').trim();
  if (!s) return 'ت';
  return s.slice(0, 1);
}

function IconThumb({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M7 11v9H4.5A1.5 1.5 0 013 18.5v-6A1.5 1.5 0 014.5 11H7zm0 0l3.2-6.2A2 2 0 0112 3.8V8h5.4a2 2 0 011.95 2.45l-1.1 7A2 2 0 0116.3 20H7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconComment({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 6.5A2.5 2.5 0 017.5 4h9A2.5 2.5 0 0119 6.5v7A2.5 2.5 0 0116.5 16H10l-4.2 3.2A.8.8 0 014 18.6V6.5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHeart({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 19s-7-4.4-7-9.1A3.9 3.9 0 0112 7a3.9 3.9 0 017 2.9C19 14.6 12 19 12 19z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NewsPost({
  post,
  user,
  onReactionUpdate,
  isAdmin = false,
  onDeleted,
}) {
  const router = useRouter();
  const { camp } = useCamp() || {};
  const familyLoginHref = camp?.slug ? `/${camp.slug}/login` : '/login';
  const commentRef = useRef(null);
  const [comments, setComments] = useState(() => normalizeComments(post.comments));
  const [commentBody, setCommentBody] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setComments(normalizeComments(post.comments));
  }, [post.id, post.comments]);

  const counts = post.reaction_counts || { like: 0, interested: 0, thanks: 0 };
  const mine = post.my_reactions || { like: false, interested: false, thanks: false };
  const author = post.admin_user?.name || camp?.name || 'إدارة المخيم';
  const reactionTotal = (counts.like || 0) + (counts.interested || 0) + (counts.thanks || 0);

  async function toggle(type) {
    if (!user) {
      router.push(familyLoginHref);
      return;
    }
    const { data } = await api.post(`/announcements/${post.id}/reactions/toggle`, { type });
    onReactionUpdate?.(post.id, data);
  }

  function focusComment() {
    if (!user) {
      router.push(familyLoginHref);
      return;
    }
    commentRef.current?.focus();
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!user) {
      router.push(familyLoginHref);
      return;
    }
    const body = commentBody.trim();
    if (!body) {
      setCommentError('اكتب تعليقاً.');
      return;
    }
    setCommentError('');
    setCommentSubmitting(true);
    try {
      const { data } = await api.post(`/announcements/${post.id}/comments`, { body });
      const created = data?.data ?? data;
      setComments((prev) => [...prev, created]);
      setCommentBody('');
    } catch (err) {
      setCommentError(getApiErrorMessage(err, 'تعذر إرسال التعليق.'));
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function performDelete() {
    if (!isAdmin) return;
    setDeleteError('');
    setDeleting(true);
    try {
      await api.delete(`/admin/announcements/${post.id}`);
      setShowDeleteConfirm(false);
      onDeleted?.(post.id);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'تعذر حذف المنشور.'));
    } finally {
      setDeleting(false);
    }
  }

  const actionClass = (active) =>
    `flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors ${
      active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
    }`;

  return (
    <>
      <article
        id={`post-${post.id}`}
        className="scroll-mt-28 overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        dir="rtl"
      >
        <header className="flex items-start gap-3 px-4 pt-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={camp?.logo_path || DEFAULT_BRAND_LOGO}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{author}</p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(post.published_at || post.created_at)}
              <span aria-hidden> · عام</span>
            </p>
          </div>
          {isAdmin ? (
            <div className="relative">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                aria-label="خيارات المنشور"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span className="text-lg leading-none">⋯</span>
              </button>
              {menuOpen ? (
                <div className="absolute start-0 z-10 mt-1 min-w-36 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-md">
                  <button
                    type="button"
                    className="flex w-full px-3 py-2 text-sm text-destructive hover:bg-muted"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowDeleteConfirm(true);
                    }}
                  >
                    حذف المنشور
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </header>

        <div className="px-4 py-3">
          {deleteError ? <Alert className="mb-3">{deleteError}</Alert> : null}
          {post.title ? <h3 className="mb-1 text-[15px] font-semibold text-foreground">{post.title}</h3> : null}
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">{post.content}</p>
        </div>

        {post.image_url ? (
          <div className="bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt=""
              className="max-h-[520px] w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}

        {reactionTotal > 0 || comments.length > 0 ? (
          <div className="flex items-center justify-between gap-3 px-4 py-2 text-xs text-muted-foreground">
            <p>
              {reactionTotal > 0 ? (
                <>
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                    👍
                  </span>{' '}
                  {reactionTotal}
                </>
              ) : (
                <span />
              )}
            </p>
            <p>{comments.length ? `${comments.length} تعليقات` : ''}</p>
          </div>
        ) : null}

        <div className="mx-3 grid grid-cols-3 border-y border-border py-0.5">
          <button type="button" className={actionClass(mine.like)} onClick={() => toggle('like')}>
            <IconThumb className="h-4 w-4" />
            أعجبني
          </button>
          <button type="button" className={actionClass(false)} onClick={focusComment}>
            <IconComment className="h-4 w-4" />
            تعليق
          </button>
          <button type="button" className={actionClass(mine.thanks)} onClick={() => toggle('thanks')}>
            <IconHeart className="h-4 w-4" />
            شكراً
          </button>
        </div>
        {mine.interested || counts.interested ? (
          <div className="px-3 pb-1 pt-1">
            <button
              type="button"
              className={`inline-flex min-h-9 items-center rounded-full px-3 text-xs font-medium ${
                mine.interested ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              }`}
              onClick={() => toggle('interested')}
            >
              مهتم ({counts.interested || 0})
            </button>
          </div>
        ) : null}

        <div className="space-y-3 px-4 pb-3 pt-2">
          {comments.length ? (
            <ul className="space-y-2.5">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {initials(c.author_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="rounded-[18px] bg-muted px-3 py-2">
                      <p className="text-xs font-bold text-foreground">{c.author_name || 'مستخدم'}</p>
                      <p className="whitespace-pre-wrap text-sm text-foreground/90">{c.body}</p>
                    </div>
                    <p className="mt-1 px-2 text-[11px] text-muted-foreground">{formatRelativeTime(c.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {user ? (
            <form onSubmit={submitComment} className="flex items-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {initials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                {commentError ? <Alert className="mb-2">{commentError}</Alert> : null}
                <div className="flex items-center gap-2">
                  <input
                    ref={commentRef}
                    id={`comment-${post.id}`}
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="اكتب تعليقاً…"
                    disabled={commentSubmitting}
                    className="min-h-10 min-w-0 flex-1 rounded-full border border-transparent bg-muted px-4 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={commentSubmitting || !commentBody.trim()}
                    className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    {commentSubmitting ? '…' : 'إرسال'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <p className="text-xs text-muted-foreground">سجّل الدخول للتفاعل مع المنشور.</p>
          )}
        </div>
      </article>
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => !deleting && setShowDeleteConfirm(false)}
        onConfirm={performDelete}
        title="حذف المنشور"
        message="سيتم حذف المنشور نهائياً بما فيه من تعليقات وتفاعلات. لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف نهائي"
        cancelLabel="إلغاء"
        danger
        loading={deleting}
      />
    </>
  );
}
