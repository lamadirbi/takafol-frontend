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
          text: 'العمود مش موجود في ملف الاستيراد. فلترة متزوج / أرمل / منفصل ما بتزبط.',
        })
      );
    } else if (families > 0 && ratioLow(filled.social_status, families)) {
      issues.push(
        issue({
          id: 'social_status',
          title: 'الحالة الاجتماعية',
          excel: 'الحالة الاجتماعية',
          kind: 'empty_data',
          text: 'الحقل موجود، بس أغلب العائلات بدون حالة اجتماعية.',
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
          text: 'نزّلوا النموذج من سجل العائلات وعبّوا أعمدة فرد 1… مع صلة القرابة وتاريخ الميلاد، أو أضيفوا الأبناء من تعديل العائلة.',
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
          text: 'ملف الإكسل يحفظ رب الأسرة والزوج/الزوجة، وباقي الأفراد من أعمدة فرد 1 إلى فرد 6. عبّوا الاسم وصلة القرابة وتاريخ الميلاد.',
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
          text: 'أغلب الأفراد بدون تاريخ ميلاد أو عمر. فلترة الفئة العمرية والمواليد ما بتزبط.',
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
          text: 'جنس الأفراد غير محدد عند الأغلب. فلترة ذكر/أنثى ما بتزبط.',
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
          text: 'صلة القرابة ناقصة. فلترة ابن/ابنة/زوجة تحتاج تعبئة الصلة لكل فرد.',
        })
      );
    }
  }

  return { issues, families, members, enabled };
}

export function issueById(issues, id) {
  return (issues || []).find((item) => item.id === id) || null;
}
