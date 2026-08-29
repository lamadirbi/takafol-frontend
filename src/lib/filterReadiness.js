/**
 * تحليل جاهزية معايير الفلترة حسب حقول ملف الاستيراد وامتلاء البيانات.
 */

function ratioLow(filled, total, minRatio = 0.15) {
  const n = Number(filled) || 0;
  const d = Number(total) || 0;
  if (d <= 0) return true;
  return n / d < minRatio;
}

function issue({ id, title, excel, kind, text }) {
  return { id, title, excel, kind, text };
}

/**
 * @param {'family' | 'members'} mode
 * @param {object | null} data
 */
export function analyzeFilterReadiness(mode, data) {
  const enabled = new Set(Array.isArray(data?.enabled_keys) ? data.enabled_keys : []);
  const families = Number(data?.families) || 0;
  const members = Number(data?.members) || 0;
  const filled = data?.filled && typeof data.filled === 'object' ? data.filled : {};
  const issues = [];

  if (mode === 'family') {
    if (!enabled.has('social_status')) {
      issues.push(
        issue({
          id: 'social_status',
          title: 'الحالة الاجتماعية',
          excel: 'الحالة الاجتماعية',
          kind: 'missing_column',
          text: 'العمود مش موجود في ملف الاستيراد. فلترة متزوج / أرمل / مطلق ما بتزبط.',
        })
      );
    } else if (families > 0 && ratioLow(filled.social_status, families)) {
      issues.push(
        issue({
          id: 'social_status',
          title: 'الحالة الاجتماعية',
          excel: 'الحالة الاجتماعية',
          kind: 'empty_data',
          text: 'الحقل موجود، بس أغلب العائلات بدون حالة اجتماعية. اطلبوا من العائلات تعدّل صفحتها وتختار القيمة من القائمة، وتبعت طلب تعديل.',
        })
      );
    }

    if (!enabled.has('financial_status')) {
      issues.push(
        issue({
          id: 'financial_status',
          title: 'الوضع المادي',
          excel: 'الوضع المادي',
          kind: 'missing_column',
          text: 'عمود الوضع المادي مش موجود في ملف الاستيراد. فلترة منخفض / متوسط / جيد ما بتزبط.',
        })
      );
    } else if (families > 0 && ratioLow(filled.financial_status, families)) {
      issues.push(
        issue({
          id: 'financial_status',
          title: 'الوضع المادي',
          excel: 'الوضع المادي',
          kind: 'empty_data',
          text: 'الحقل موجود، بس أغلب العائلات بدون وضع مادي. اطلبوا من العائلات تعدّل صفحتها وتختار القيمة من القائمة، وتبعت طلب تعديل.',
        })
      );
    }

    if (!enabled.has('total_members')) {
      issues.push(
        issue({
          id: 'total_members',
          title: 'عدد أفراد الأسرة',
          excel: 'عدد افراد الاسرة الكلي',
          kind: 'missing_column',
          text: 'عمود عدد الأفراد مش موجود في الملف. فلترة «من / إلى» لعدد الأفراد ما بتزبط.',
        })
      );
    } else if (families > 0 && ratioLow(filled.total_members, families)) {
      issues.push(
        issue({
          id: 'total_members',
          title: 'عدد أفراد الأسرة',
          excel: 'عدد افراد الاسرة الكلي',
          kind: 'empty_data',
          text: 'عدد الأفراد فاضي أو صفر عند أغلب الأسر، ففلترة الحجم بترجع نتيجة ناقصة.',
        })
      );
    }

    if (families > 0 && (Number(filled.children) || 0) === 0) {
      issues.push(
        issue({
          id: 'has_newborn',
          title: 'حديث الولادة',
          excel: null,
          kind: 'missing_members',
          text: 'نزّلوا النموذج من سجل العائلات وعبّوا أعمدة فرد 1… أو اطلبوا من العائلات تضيف الأبناء من تعديل الملف (صلة القرابة وتاريخ الميلاد من القائمة).',
        })
      );
    }
  } else {
    if (families > 0 && members <= families) {
      issues.push(
        issue({
          id: 'members_list',
          title: 'سجل الأفراد',
          excel: null,
          kind: 'missing_members',
          text: 'ملف الإكسل يحفظ رب الأسرة والزوج/الزوجة، وباقي الأفراد من أعمدة فرد 1 إلى فرد 6. أو اطلبوا من العائلات تضيف الأفراد من تعديل الملف.',
        })
      );
    }

    if (members > 0 && ratioLow(filled.member_age, members)) {
      issues.push(
        issue({
          id: 'member_age',
          title: 'عمر الفرد',
          excel: 'تاريخ الميلاد',
          kind: 'empty_data',
          text: 'أغلب الأفراد بدون تاريخ ميلاد أو عمر. اطلبوا من العائلات تدخل تاريخ الميلاد من تعديل الملف.',
        })
      );
    }

    if (members > 0 && ratioLow(filled.member_gender, members)) {
      issues.push(
        issue({
          id: 'member_gender',
          title: 'جنس الفرد',
          excel: 'الجنس',
          kind: 'empty_data',
          text: 'جنس الأفراد غير محدد عند الأغلب. اطلبوا من العائلات تختار الجنس من القائمة في تعديل الملف.',
        })
      );
    }

    if (members > 0 && ratioLow(filled.member_relationship, members)) {
      issues.push(
        issue({
          id: 'member_relationship',
          title: 'صلة القرابة',
          excel: null,
          kind: 'empty_data',
          text: 'صلة القرابة ناقصة. اطلبوا من العائلات تختار الصلة من القائمة في تعديل الملف.',
        })
      );
    }
  }

  return { issues, families, members, enabled };
}

export function issueById(issues, id) {
  return (issues || []).find((item) => item.id === id) || null;
}
