'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { formatDate, getApiErrorMessage } from '@/lib/utils';
import { api } from '@/lib/api';
import { useCamp } from '@/context/CampContext';

function normalizeComments(raw) {
  if (raw == null) return [];
  const arr = Array.isArray(raw) ? raw : raw.data ?? [];
  return arr.map((item) => item?.data ?? item);
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
  const [comments, setComments] = useState(() => normalizeComments(post.comments));
  const [commentBody, setCommentBody] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setComments(normalizeComments(post.comments));
  }, [post.id, post.comments]);

  const counts = post.reaction_counts || { like: 0, interested: 0, thanks: 0 };
  const mine = post.my_reactions || { like: false, interested: false, thanks: false };

  async function toggle(type) {
    if (!user) {
      router.push(familyLoginHref);
      return;
    }
    const { data } = await api.post(`/announcements/${post.id}/reactions/toggle`, { type });
    onReactionUpdate?.(post.id, data);
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

  return (
    <>
    <Card id={`post-${post.id}`} className="scroll-mt-28 overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-primary">{post.admin_user?.name || 'لجنة مخيم طيبة التربوي'}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(post.published_at || post.created_at)}
            </p>
          </div>
          {isAdmin ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 border-red-200 text-red-700 hover:bg-red-50"
              disabled={deleting}
              onClick={() => setShowDeleteConfirm(true)}
            >
              حذف المنشور
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {deleteError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {deleteError}
          </p>
        ) : null}
        <h3 className="text-base font-semibold">{post.title}</h3>
        {post.image_url ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-100 bg-muted/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : null}
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{post.content}</p>
        {!user ? (
          <p className="text-xs text-muted-foreground">سجّل الدخول للتفاعل مع المنشور.</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={mine.like ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => toggle('like')}
          >
            أعجبني ({counts.like})
          </Button>
          <Button
            type="button"
            variant={mine.interested ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => toggle('interested')}
          >
            مهتم ({counts.interested})
          </Button>
          <Button
            type="button"
            variant={mine.thanks ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => toggle('thanks')}
          >
            شكراً ({counts.thanks})
          </Button>
        </div>

        <div className="border-t border-slate-100 pt-4" dir="rtl">
          <h4 className="mb-2 text-sm font-semibold text-foreground">التعليقات</h4>
          {comments.length ? (
            <ul className="mb-4 space-y-3">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-slate-100 bg-muted/40 px-3 py-2 text-sm"
                >
                  <p className="font-medium text-primary">{c.author_name || 'مستخدم'}</p>
                  <p className="mt-1 whitespace-pre-wrap text-foreground/90">{c.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(c.created_at)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-4 text-sm text-muted-foreground">لا توجد تعليقات بعد.</p>
          )}

          {user ? (
            <form onSubmit={submitComment} className="space-y-2">
              {commentError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-800">
                  {commentError}
                </p>
              ) : null}
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">إضافة تعليق</span>
                <textarea
                  className="min-h-[88px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="اكتب تعليقك هنا…"
                  disabled={commentSubmitting}
                />
              </label>
              <Button type="submit" size="sm" disabled={commentSubmitting}>
                {commentSubmitting ? 'جاري الإرسال…' : 'إرسال التعليق'}
              </Button>
            </form>
          ) : (
            <p className="text-xs text-muted-foreground">سجّل الدخول لإضافة تعليق.</p>
          )}
        </div>
      </CardContent>
    </Card>
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
