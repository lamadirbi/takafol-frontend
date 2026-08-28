export const SUPER_ADMIN_GUIDE_HREF = '/super-admin/guide';

export function superAdminGuideSections() {
  return [
    {
      id: 'hub',
      title: 'لوحة المنصة',
      pageHref: '/super-admin',
      summary: 'المخيمات، طلبات التسجيل، الرسائل، والتجديد.',
      steps: ['افتح القسم من البطاقة.'],
    },
    {
      id: 'camps',
      title: 'المخيمات',
      pageHref: '/super-admin/camps',
      summary: 'إنشاء مخيم ومتابعة المسؤولين والاشتراك.',
      steps: [
        'ضيف مخيم: الاسم والمسار الإنجليزي.',
        'اضغط الاسم عشان التفاصيل والمسؤولين.',
      ],
    },
    {
      id: 'camp-detail',
      title: 'تفاصيل المخيم',
      pageHref: '/super-admin/camps',
      summary: 'تعديل الاسم والاشتراك، وإضافة مسؤول.',
      steps: ['احذف المخيم بس إذا انعمل بالغلط.'],
    },
    {
      id: 'requests',
      title: 'طلبات التسجيل',
      pageHref: '/super-admin/requests',
      summary: 'طلبات الانضمام: اعتمد أو ارفض.',
      steps: ['الرفض يحتاج سبب واضح.'],
    },
    {
      id: 'contact',
      title: 'رسائل التواصل',
      pageHref: '/super-admin/contact',
      summary: 'استفسارات ومشاكل من الناس.',
      steps: ['افتح الرسالة، رد واتساب، وحدّث الحالة.'],
    },
    {
      id: 'renewals',
      title: 'تجديد الاشتراك',
      pageHref: '/super-admin/renewals',
      summary: 'صور التحويل من المخيمات.',
      steps: ['راجع الصورة. اعتمد إذا الدفع تمام، أو ارفض.'],
    },
    {
      id: 'ntfy',
      title: 'إشعارات المنصة',
      pageHref: '/super-admin',
      summary: 'تنبيه على الموبايل عند طلب أو رسالة أو تجديد.',
      steps: ['اربط الجهاز من اللوحة وجرّب إشعار.'],
    },
  ];
}
