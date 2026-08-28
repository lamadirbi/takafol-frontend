'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import PostAnnouncementForm from '@/components/admin/PostAnnouncementForm';
import { formatRelativeTime, getApiErrorMessage } from '@/lib/utils';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';
import { campLogoSrc } from '@/lib/brand';

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

const REACTION_LABEL = {
  like: 'أعجبني',
  interested: 'مهتم',
  thanks: 'شكراً',
};

export default function NewsPost({
  post,
  user,
  onReactionUpdate,
  isAdmin = false,
  canManagePost = false,
  onDeleted,
  onUpdated,
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
  const [editingPost, setEditingPost] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentBody, setEditCommentBody] = useState('');
  const [commentBusyId, setCommentBusyId] = useState(null);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [reactorsOpen, setReactorsOpen] = useState(false);
  const [reactors, setReactors] = useState(null);
  const [reactorsLoading, setReactorsLoading] = useState(false);
  const [reactorsError, setReactorsError] = useState('');

  const managePost = Boolean(canManagePost);

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

  async function saveCommentEdit(comment) {
    const body = editCommentBody.trim();
    if (!body) {
      setCommentError('اكتب تعليقاً.');
      return;
    }
    setCommentBusyId(comment.id);
    setCommentError('');
    try {
      const { data } = await api.patch(`/announcements/${post.id}/comments/${comment.id}`, { body });
      const updated = data?.data ?? data;
      setComments((prev) => prev.map((c) => (c.id === comment.id ? { ...c, ...updated } : c)));
      setEditingCommentId(null);
    } catch (err) {
      setCommentError(getApiErrorMessage(err, 'تعذر تعديل التعليق.'));
    } finally {
      setCommentBusyId(null);
    }
  }

  async function performDeleteComment() {
    if (!commentToDelete) return;
    setCommentBusyId(commentToDelete.id);
    try {
      await api.delete(`/announcements/${post.id}/comments/${commentToDelete.id}`);
      setComments((prev) => prev.filter((c) => c.id !== commentToDelete.id));
      setCommentToDelete(null);
    } catch (err) {
      setCommentError(getApiErrorMessage(err, 'تعذر حذف التعليق.'));
    } finally {
      setCommentBusyId(null);
    }
  }

  async function performDelete() {
    if (!managePost) return;
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

  async function openReactors() {
    if (!managePost) return;
    setReactorsOpen(true);
    setReactorsLoading(true);
    setReactorsError('');
    try {
      const { data } = await api.get(`/admin/announcements/${post.id}/reactions`);
      setReactors(data?.data ?? data);
    } catch (err) {
      setReactors(null);
      setReactorsError(getApiErrorMessage(err, 'تعذر جلب قائمة التفاعل.'));
    } finally {
      setReactorsLoading(false);
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
        className="scroll-mt-28 rounded-xl border border-border bg-card shadow-sm"
        dir="rtl"
      >
        <header className="flex items-start gap-3 px-4 pt-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={campLogoSrc(camp)} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{author}</p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(post.published_at || post.created_at)}
              <span aria-hidden> · عام</span>
            </p>
          </div>
        </header>

        {managePost && !editingPost ? (
          <div className="mt-2 flex gap-2 px-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 flex-1"
              onClick={() => setEditingPost(true)}
            >
              تعديل المنشور
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 flex-1 border-red-200 text-destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              حذف المنشور
            </Button>
          </div>
        ) : null}

        <div className="px-4 py-3">
          {deleteError ? <Alert className="mb-3">{deleteError}</Alert> : null}
          {editingPost ? (
            <PostAnnouncementForm
              post={post}
              onPosted={(updated) => {
                setEditingPost(false);
                onUpdated?.(updated || post);
              }}
              onCancel={() => setEditingPost(false)}
            />
          ) : (
            <>
              {post.title ? <h3 className="mb-1 text-[15px] font-semibold text-foreground">{post.title}</h3> : null}
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">{post.content}</p>
            </>
          )}
        </div>

        {!editingPost && post.image_url ? (
          <div className="overflow-hidden bg-muted">
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
                managePost ? (
                  <button type="button" className="inline-flex items-center gap-1 font-medium text-primary hover:underline" onClick={openReactors}>
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                      👍
                    </span>
                    {reactionTotal} — عرض من تفاعل
                  </button>
                ) : (
                  <>
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                      👍
                    </span>{' '}
                    {reactionTotal}
                  </>
                )
              ) : (
                <span />
              )}
            </p>
            <p>{comments.length ? `${comments.length} تعليقات` : ''}</p>
          </div>
        ) : null}

        {managePost && reactionTotal === 0 ? (
          <div className="px-4 pb-2">
            <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={openReactors}>
              من تفاعل على المنشور
            </button>
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
          {commentError ? <Alert>{commentError}</Alert> : null}
          {comments.length ? (
            <ul className="space-y-2.5">
              {comments.map((c) => {
                const isOwner = Boolean(user?.id && Number(c.user_id) === Number(user.id));
                const canDeleteComment = isOwner || managePost;
                const editing = editingCommentId === c.id;
                return (
                  <li key={c.id} className="flex gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {initials(c.author_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="rounded-[18px] bg-muted px-3 py-2">
                        <p className="text-xs font-bold text-foreground">{c.author_name || 'مستخدم'}</p>
                        {editing ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              value={editCommentBody}
                              onChange={(e) => setEditCommentBody(e.target.value)}
                              rows={3}
                              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                            />
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Button
                                type="button"
                                size="sm"
                                className="w-full sm:w-auto"
                                loading={commentBusyId === c.id}
                                onClick={() => saveCommentEdit(c)}
                              >
                                حفظ
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="w-full sm:w-auto"
                                disabled={commentBusyId === c.id}
                                onClick={() => setEditingCommentId(null)}
                              >
                                إلغاء
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm text-foreground/90">{c.body}</p>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 px-2 text-[11px] text-muted-foreground">
                        <p>{formatRelativeTime(c.created_at)}</p>
                        {c.updated_at && c.updated_at !== c.created_at ? <p>تم التعديل</p> : null}
                        {isOwner && !editing ? (
                          <button
                            type="button"
                            className="font-semibold text-primary"
                            onClick={() => {
                              setEditingCommentId(c.id);
                              setEditCommentBody(c.body || '');
                              setCommentError('');
                            }}
                          >
                            تعديل
                          </button>
                        ) : null}
                        {canDeleteComment && !editing ? (
                          <button
                            type="button"
                            className="font-semibold text-destructive"
                            onClick={() => setCommentToDelete(c)}
                          >
                            حذف
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {user ? (
            <form onSubmit={submitComment} className="flex items-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {initials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
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
      <ConfirmDialog
        open={commentToDelete !== null}
        onClose={() => !commentBusyId && setCommentToDelete(null)}
        onConfirm={performDeleteComment}
        title="حذف التعليق"
        message="هل تريد حذف هذا التعليق؟"
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        danger
        loading={Boolean(commentToDelete && commentBusyId === commentToDelete.id)}
      />
      <Modal open={reactorsOpen} onClose={() => setReactorsOpen(false)} title="من تفاعل على المنشور" className="max-w-md">
        {reactorsLoading ? <p className="text-sm text-muted-foreground">جاري التحميل…</p> : null}
        {reactorsError ? <Alert>{reactorsError}</Alert> : null}
        {!reactorsLoading && !reactorsError ? (
          <div className="space-y-4">
            {['like', 'thanks', 'interested'].map((type) => {
              const list = reactors?.[type] || [];
              return (
                <section key={type}>
                  <h3 className="text-sm font-semibold text-foreground">
                    {REACTION_LABEL[type]} ({list.length})
                  </h3>
                  {list.length ? (
                    <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                      {list.map((person, idx) => (
                        <li key={`${type}-${person.id}-${idx}`} className="px-3 py-2 text-sm">
                          {person.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">لا أحد حتى الآن.</p>
                  )}
                </section>
              );
            })}
          </div>
        ) : null}
        <div className="mt-5 flex justify-end">
          <Button type="button" variant="outline" onClick={() => setReactorsOpen(false)}>
            إغلاق
          </Button>
        </div>
      </Modal>
    </>
  );
}
