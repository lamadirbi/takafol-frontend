export function adminGuideHref(base) {
  return `${base || ''}/admin/guide`;
}

export function adminGuideSections(base = '') {
  return [
    {
      id: 'start',
      title: 'الدخول',
      pageHref: `${base}/admin/dashboard`,
      summary: 'ادخل من دخول الإدارة، مش دخول العائلات.',
      steps: [
        'على الكمبيوتر القائمة على اليمين.',
        'على الجوال الشريط تحت، و«المزيد» للباقي.',
      ],
    },
    {
      id: 'today',
      title: 'اليوم',
      pageHref: `${base}/admin/dashboard`,
      videoId: 'notifications',
      summary: 'هنا العدد، الشعار، والاشتراك.',
      steps: [
        'ارفع الشعار واقصّ الصورة إذا بدك.',
        'تجديد الاشتراك: حوّل، ارفع صورة التحويل، واستنى الموافقة.',
      ],
      tips: ['الاشتراك ما بيتجدّد لحاله.'],
    },
    {
      id: 'families',
      title: 'سجل العائلات',
      pageHref: `${base}/admin/families`,
      videoId: 'excel-import',
      summary: 'ضيف عيلة، أو ارفع ملف إكسل.',
      steps: [
        'إضافة عائلة: وحدة وحدة.',
        'دفعة كبيرة: نزّل النموذج، عبّيه، ارفعه من استيراد Excel.',
        'اضغط اسم رب الأسرة عشان تفتح الملف.',
      ],
      tips: ['الهوية والاسم لازم يكونوا موجودين. خلّي الصفحة مفتوحة وقت الاستيراد.'],
    },
    {
      id: 'family-file',
      title: 'ملف العائلة',
      pageHref: `${base}/admin/families`,
      summary: 'بيانات العيلة، الأفراد، والطرود.',
      steps: [
        'من السجل اضغط اسم رب الأسرة.',
        'إذا بدك تغيير فوري: تعديل من الزر فوق.',
      ],
    },
    {
      id: 'fields',
      title: 'حقول العائلات',
      pageHref: `${base}/admin/family-fields`,
      videoId: 'excel-import',
      summary: 'اختار شو يظهر في استمارة العيلة.',
      steps: [
        'فعّل الحقل أو أخفيه.',
        'ضيف حقل خاص إذا بدكم شيء مش موجود، واحفظ.',
      ],
    },
    {
      id: 'filter',
      title: 'فلترة للتوزيع',
      pageHref: `${base}/admin/filter`,
      videoId: 'filter-distribute',
      summary: 'اختار مين يستلم قبل التوزيع.',
      steps: [
        'عائلات أو أفراد، بعدين حط المعيار.',
        'تطبيق الفلترة، سمّ السجل، واحفظ.',
      ],
      tips: ['إذا الجدول فاضي، غالباً البيانات ناقصة مش عطل.'],
    },
    {
      id: 'records',
      title: 'سجلات الفلترة',
      pageHref: `${base}/admin/camp-records`,
      videoId: 'filter-distribute',
      summary: 'الفلاتر اللي حفظتوها.',
      steps: ['اضغط اسم السجل عشان التوزيع والاستلام.'],
    },
    {
      id: 'record-detail',
      title: 'الطرود والاستلام',
      pageHref: `${base}/admin/camp-records`,
      videoId: 'filter-distribute',
      summary: 'إشعار بالطرد وتأكيد الاستلام.',
      steps: [
        'اكتب اسم الطرد وابعت إشعار.',
        'بعد التوزيع أكّد الاستلام. غلط؟ تراجع أو ألغي.',
      ],
    },
    {
      id: 'change-requests',
      title: 'طلبات التعديل',
      pageHref: `${base}/admin/change-requests`,
      videoId: 'change-requests',
      summary: 'العيلة تطلب تصحيح. ما يتغيّر شيء إلا إذا وافقتوا.',
      steps: ['افتح الطلب واقبل أو ارفض.'],
    },
    {
      id: 'news',
      title: 'الأخبار',
      pageHref: `${base}/news`,
      summary: 'انشر خبر للعائلات.',
      steps: ['اكتب العنوان والنص وانشر. تقدر تعدّل أو تحذف بعدين.'],
    },
    {
      id: 'admins',
      title: 'المسؤولون',
      pageHref: `${base}/admin/admins`,
      summary: 'ضيف مسؤول ثاني للشغل.',
      steps: ['الاسم، اسم المستخدم، وكلمة السر. اعطيه البيانات مرة واحدة.'],
      tips: ['كلمة السر بتنشاف وقت الإنشاء أو لما تغيّرها.'],
    },
    {
      id: 'contact',
      title: 'تواصل',
      pageHref: `${base}/contact`,
      summary: 'سؤال أو مشكلة للمنصة.',
      steps: ['اختار النوع، اكتب واتساب والرسالة، وأرسل.'],
    },
    {
      id: 'notifications',
      title: 'إشعارات الجوال',
      pageHref: `${base}/admin/dashboard`,
      videoId: 'notifications',
      summary: 'تنبيه على الموبايل لما يجي طلب أو يقرب الاشتراك يخلص.',
      steps: ['ثبّت التطبيق من المتجر، اربطه من صفحة اليوم، وجرّب إشعار.'],
    },
  ];
}
