export function familyGuideHref(base) {
  return `${base || ''}/family/guide`;
}

export function familyGuideSections(base = '') {
  return [
    {
      id: 'start',
      title: 'الدخول',
      pageHref: `${base}/login`,
      videoId: 'family-account',
      summary: 'ادخل من دخول العائلات على صفحة المخيم.',
      steps: [
        'اكتب رقم الدخول اللي عطتكم ياه اللجنة.',
        'بعدها: الأخبار، الإشعارات، وملفك.',
      ],
      tips: ['نسيت الرقم؟ اسأل اللجنة.'],
    },
    {
      id: 'profile',
      title: 'ملفي',
      pageHref: `${base}/family/dashboard`,
      videoId: 'family-account',
      summary: 'بياناتكم، الأفراد، والطرود.',
      steps: [
        'شوف بياناتك والأفراد في الصفحة.',
        'تعديل الملف يعني طلب للجنة، مش تغيير فوري.',
      ],
    },
    {
      id: 'news',
      title: 'الأخبار',
      pageHref: `${base}/news`,
      summary: 'إعلانات اللجنة من الشريط: الرئيسية.',
      steps: ['اقرأ الخبر. تقدر تعلّق إذا بدك تسأل.'],
    },
    {
      id: 'notifications',
      title: 'الإشعارات',
      pageHref: `${base}/family/notifications`,
      videoId: 'notifications',
      summary: 'هنا طرد جديد، تسليم، أو خبر.',
      steps: [
        'الرقم الأحمر يعني في جديد.',
        'اضغط الإشعار عشان تفتحه.',
      ],
    },
    {
      id: 'request',
      title: 'طلب تعديل',
      pageHref: `${base}/family/change-request`,
      videoId: 'change-requests',
      summary: 'صحّح الاسم أو الأفراد. اللجنة توافق قبل ما يتغيّر السجل.',
      steps: [
        'من ملفي: تعديل الملف.',
        'غيّر اللي بدك ياه وأرسل.',
      ],
    },
    {
      id: 'requests',
      title: 'الطلبات',
      pageHref: `${base}/family/change-requests`,
      videoId: 'change-requests',
      summary: 'حالة طلباتك: قيد المراجعة، مقبول، أو مرفوض.',
      steps: ['إذا انقبل الطلب، البيانات الجديدة بتظهر في ملفي.'],
    },
    {
      id: 'ntfy',
      title: 'إشعارات الموبايل',
      pageHref: `${base}/family/dashboard`,
      videoId: 'notifications',
      summary: 'ربط الموبايل من ملفي عشان يوصلك تنبيه الطرد.',
      steps: ['ثبّت التطبيق، افتحه، اربط الجهاز من البطاقة.'],
    },
    {
      id: 'contact',
      title: 'تواصل',
      pageHref: `${base}/contact`,
      summary: 'مشكلة بالموقع؟ اكتب من هنا. الطرد والتوزيع اسألوا اللجنة.',
      steps: ['اختار النوع، حط واتساب، وأرسل.'],
    },
  ];
}
