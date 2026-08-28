'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { IconWhatsApp } from '@/components/ui/Icons';

const SUPPORT_WA =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP) || '970592533678';

function waDigits(s) {
  return String(s || '').replace(/\D/g, '');
}

const STEPS = [
  {
    n: '١',
    title: 'تسجّلون المخيم',
    text: 'ترسلون طلب تسجيل باسم صاحب الطلب واسم المخيم ورقم واتساب. بعد التفعيل يصلكم رابط خاص بمخيمكم، وتدخل الإدارة من صفحة مستقلة عن دخول العائلات.',
  },
  {
    n: '٢',
    title: 'تبنون سجل العائلات',
    text: 'تضيفون الأسر واحدة واحدة، أو تستوردون الملف دفعة واحدة من جدول إلكتروني. لكل أسرة رب أسرة، وأفراد، وحالة اجتماعية، وبيانات أخرى تختارون أنتم إظهارها أو إخفاءها.',
  },
  {
    n: '٣',
    title: 'تضبطون استمارة المخيم',
    text: 'حقول العائلات ليست ثابتة على الجميع. تفعّلون ما تحتاجونه، وتضيفون حقولاً خاصة بمخيمكم، حتى يطابق السجل واقعكم لا نموذجاً عاماً.',
  },
  {
    n: '٤',
    title: 'تفلترون المستحقين قبل كل توزيع',
    text: 'تحدّدون المعيار: أرامل، مواليد جدد، عدد أفراد، فئة عمرية، جنس، أو صلة قرابة. المنصة تعرض القائمة فوراً، ويمكن حفظها باسم عملية التوزيع.',
  },
  {
    n: '٥',
    title: 'تُسجَّل الطرود دفعة واحدة',
    text: 'تختارون نوع المساعدة والقائمة، فتتوزّع الحصص على الأسر دفعة واحدة. يمكن تأكيد الاستلام أو التراجع عنه إذا حدث خطأ في الميدان.',
  },
  {
    n: '٦',
    title: 'العائلة تتابع من حسابها',
    text: 'رب الأسرة يدخل بحسابه، يرى الطرود المستحقة والمستلمة، يقرأ أخبار المخيم، ويتفاعل معها، ويطلب تعديل بياناته إن تغيّرت ظروف الأسرة.',
  },
  {
    n: '٧',
    title: 'كل عملية تبقى في الأرشيف',
    text: 'سجلات الفلترة محفوظة، ويمكن استخراج كشف العائلات أو الأفراد للمراجعة الداخلية أو لتقديمه للجهات المانحة عند الحاجة.',
  },
];

const ADMIN_FEATURES = [
  {
    title: 'مساحة باسم مخيمكم',
    text: 'رابط خاص، شعار، واسم يظهر للعائلات. المخيم يبدو كجهته الحقيقية، لا كحساب عام على منصة مشتركة في الشكل.',
  },
  {
    title: 'سجل عائلي مرن',
    text: 'هوية رب الأسرة، الحالة الاجتماعية، الأفراد، المحافظة الأصلية، والجوال، مع إمكانية إضافة حقول تخص مخيمكم فقط.',
  },
  {
    title: 'إدخال سريع للأسر',
    text: 'استيراد جماعي من جدول إلكتروني جاهز، أو إضافة يدوية. يُنشأ حساب دخول لرب الأسرة مع السجل تلقائياً.',
  },
  {
    title: 'فلترة عادلة للتوزيع',
    text: 'على مستوى الأسرة أو الأفراد: عدد الأفراد، المواليد، العمر، الجنس، وصلة القرابة. القائمة تظهر قبل أن تخرجوا للطرد.',
  },
  {
    title: 'حفظ عمليات التوزيع',
    text: 'كل فلترة تُحفظ باسمها. ترجعون لها لاحقاً، وتستخرجون كشفاً للعائلات أو للأفراد دون إعادة العد من جديد.',
  },
  {
    title: 'تأكيد الاستلام وتصحيحه',
    text: 'تسجيل جماعي للطرود، ثم تأكيد أن الأسرة استلمت، مع إمكانية التراجع إذا سُجّل الاسم خطأ في الميدان.',
  },
  {
    title: 'أخبار المخيم من اللجنة',
    text: 'تنشرون إعلاناً للعائلات، وهم يقرأون ويعلّقون ويتفاعلون من حساباتهم، بدل أن يبقى الخبر على مجموعة واتساب فقط.',
  },
  {
    title: 'تعديل البيانات بموافقتكم',
    text: 'العائلة تطلب تصحيح اسم أو فرد أو بيان. الطلب يصل للإدارة: توافقون أو ترفضون. السجل لا يتغيّر من تلقاء نفسه.',
  },
  {
    title: 'أكثر من مسؤول',
    text: 'يمكن إضافة مسؤولين للمخيم حتى لا يبقى العمل معلّقاً على شخص واحد في يوم التوزيع.',
  },
  {
    title: 'إشعارات على الجوال',
    text: 'تنبيه فوري عند وجود طرد أو خبر مهم، حتى تصل المعلومة للأسرة والإدارة من غير مطاردة يدوية.',
  },
];

function SectionTitle({ kicker, title, children }) {
  return (
    <div className="mb-4">
      {kicker ? <p className="text-xs font-semibold text-primary">{kicker}</p> : null}
      <h2 className="mt-1 text-[length:var(--text-h3)] font-semibold tracking-tight text-foreground">{title}</h2>
      {children ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p> : null}
    </div>
  );
}

function WhiteCard({ children, className = '' }) {
  return <div className={`rounded-xl bg-white p-4 shadow-sm md:p-5 ${className}`.trim()}>{children}</div>;
}

export default function AboutTakafolContent() {
  const supportHref = `https://wa.me/${waDigits(SUPPORT_WA)}`;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 md:py-8" dir="rtl">
      <header className="rounded-xl bg-white p-5 shadow-sm md:p-6">
        <p className="text-xs font-semibold text-primary">تَكافل</p>
        <h1 className="mt-1 text-[length:var(--text-h2)] font-semibold tracking-tight">من نحن</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          نظام واحد ينظّم سجل العائلات وتوزيع الطرود في المخيمات. هذا الدليل يوضح آلية العمل، وماذا تستفيد اللجنة، وماذا ترى الأسرة من حسابها.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#E4E6EB] px-3 py-1.5 text-xs font-semibold">سجل العائلات</span>
          <span className="rounded-full bg-[#E4E6EB] px-3 py-1.5 text-xs font-semibold">توزيع عادل للطرود</span>
          <span className="rounded-full bg-[#E4E6EB] px-3 py-1.5 text-xs font-semibold">حساب لكل أسرة</span>
          <span className="rounded-full bg-[#E4E6EB] px-3 py-1.5 text-xs font-semibold">أخبار وإشعارات</span>
        </div>
      </header>

      <section className="mt-6">
        <SectionTitle kicker="أولاً" title="ما هي منصة تَكافل؟">
          تَكافل منصة إلكترونية مخصّصة للجان الإغاثة داخل المخيمات. تجمع في مكان واحد ما كان يتوزّع على ورق ودفاتر وجداول متفرقة: بيانات الأسر، أفراد كل أسرة، قرارات التوزيع، أخبار المخيم، ومتابعة الاستلام.
        </SectionTitle>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          الفكرة بسيطة: اللجنة تدير، والعائلة ترى حقّها، والسجل يبقى واضحاً. هكذا يصل الطرد لمستحقّه بكرامة، ويقل الخلاف، ويصير عندكم مرجع يمكن الرجوع إليه في أي وقت.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <WhiteCard>
            <h3 className="text-sm font-semibold">لمن هذه المنصة؟</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>لجان المخيمات والقائمون على الإغاثة</li>
              <li>المسؤولون عن توزيع الطرود والمساعدات</li>
              <li>أي مخيم يريد عدالة وشفافية بدل العشوائية</li>
            </ul>
          </WhiteCard>
          <WhiteCard>
            <h3 className="text-sm font-semibold">ماذا تحلّ عملياً؟</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>تكرار الأسماء وضياع الحصص</li>
              <li>صعوبة معرفة من استلم ومن لم يستلم</li>
              <li>تعديل بيانات الأسرة من غير مراجعة</li>
            </ul>
          </WhiteCard>
          <WhiteCard className="border border-red-100 bg-[#fdf6f6] shadow-none">
            <h3 className="text-sm font-semibold text-[#9b2c2c]">قبل المنصة</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>أوراق متفرقة وجداول عند أشخاص مختلفين</li>
              <li>توزيع بالعين أو بالذاكرة</li>
              <li>العائلة لا تعرف ماذا يحقّ لها</li>
              <li>كل توزيع يبدأ من الصفر تقريباً</li>
            </ul>
          </WhiteCard>
          <WhiteCard className="border border-emerald-100 bg-[#eaf6ee] shadow-none">
            <h3 className="text-sm font-semibold text-[#157a3c]">مع تَكافل</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>سجل موحّد باسم المخيم وشعاره</li>
              <li>فلترة واضحة حسب الاحتياج</li>
              <li>حساب للأسرة ترى منه الطرود والأخبار</li>
              <li>أرشيف لكل عملية توزيع</li>
            </ul>
          </WhiteCard>
        </div>
        <div className="mt-3 rounded-xl bg-primary p-4 text-white md:p-5">
          <h3 className="text-sm font-semibold">كل مخيم مستقل عن الآخر</h3>
          <p className="mt-1 text-sm leading-relaxed text-white/90">
            بيانات عائلاتكم لا تظهر لأي مخيم ثانٍ. لكم رابطكم، وشعاركم، ومسؤولكم، وسجلكم الخاص. هذا الفصل مبني داخل النظام من الأساس، وليس إجراءً يدوياً.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle kicker="ثانياً" title="آلية العمل من التسجيل حتى التوزيع">
          الاشتراك لا يحتاج فريقاً تقنياً. تتعلّمون المنصة من الاستخدام اليومي، والخطوات التالية هي نفسها التي ستمشون عليها مع أسر المخيم.
        </SectionTitle>
        <div className="space-y-3">
          {STEPS.map((step) => (
            <WhiteCard key={step.n} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {step.n}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            </WhiteCard>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle kicker="ثالثاً" title="ماذا تستفيد إدارة المخيم؟">
          هذه ليست قائمة تقنية. هذه الأعمال اليومية التي تختصر عليكم الوقت، وتمنع اللخبطة، وتعطي اللجنة قراراً مبنياً على بيانات لا على الذاكرة.
        </SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {ADMIN_FEATURES.map((item) => (
            <WhiteCard key={item.title} className="border-r-4 border-r-primary">
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </WhiteCard>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-primary p-4 text-white md:p-5">
          <h3 className="text-sm font-semibold">ماذا تستفيد العائلات؟</h3>
          <p className="mt-1 text-sm leading-relaxed text-white/90">
            حساب لرب الأسرة، معرفة الطرود المستحقة والمستلمة، متابعة أخبار المخيم، طلب تصحيح البيانات دون مراجعة في كل مرة، وإمكانية تثبيت المنصة على الشاشة كأنها تطبيق. الكرامة هنا ليست شعاراً: الأسرة ترى حقّها بنفسها.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle kicker="رابعاً" title="الاشتراك، التجربة، وكيف تبدأون">
          الاشتراك شهري وبسيط. تجربون المنصة على مخيمكم الحقيقي أسبوعين، ثم تقررون الاستمرار. لا نطلب التزاماً سنوياً مسبقاً.
        </SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <WhiteCard className="border border-emerald-100 bg-[#eaf6ee] shadow-none">
            <p className="text-sm font-semibold text-[#157a3c]">قيمة الاشتراك</p>
            <p className="mt-1 text-2xl font-bold text-[#157a3c]">٥٠ شيكلاً شهرياً</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              الأسبوعان الأولان بعد تفعيل المخيم مجانيان بالكامل، حتى تختبروا السجل والتوزيع والأخبار على أرض الواقع.
            </p>
          </WhiteCard>
          <WhiteCard>
            <h3 className="text-sm font-semibold">كيف يبدأ المخيم؟</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>ترسلون طلب تسجيل باسم المخيم ورقم واتساب</li>
              <li>ننشئ حسابكم ونرسل رابط المخيم ودخول الإدارة</li>
              <li>ترفعون العائلات وتضبطون الحقول</li>
              <li>تنفّذون أول توزيع وتحفظون سجله</li>
            </ul>
          </WhiteCard>
          <WhiteCard>
            <h3 className="text-sm font-semibold">التجديد</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              من لوحة الإدارة تُرسلون إشعار السداد. تُراجع الطلبات من إدارة المنصة، ويُمدَّد الاشتراك عند الاعتماد. العملية واضحة للطرفين.
            </p>
          </WhiteCard>
          <WhiteCard>
            <h3 className="text-sm font-semibold">إذا انتهى الاشتراك</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              عند انتهاء المدة تتوقف المميزات حتى يُسدَّد المبلغ. الهدف أن تبقى الخدمة متاحة للمخيمات الملتزمة، وأن يبقى السجل محفوظاً لا ضائعاً.
            </p>
          </WhiteCard>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-primary p-5 text-white md:p-6">
        <h2 className="text-[length:var(--text-h3)] font-semibold">للتواصل والاشتراك</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/90">
          راسلونا على واتساب باسم المخيم، ونكمل معكم التفعيل وإرسال الرابط.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a
            href={supportHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[#25D366] px-4 text-sm font-semibold text-[#064e3b] hover:brightness-[0.96]"
          >
            <IconWhatsApp className="h-5 w-5" />
            واتساب
          </a>
          <Link href="/contact" className="flex-1">
            <Button type="button" variant="outline" className="w-full bg-white hover:bg-white/90">
              تواصل معنا
            </Button>
          </Link>
          <Link href="/#register" className="flex-1">
            <Button type="button" variant="outline" className="w-full bg-white hover:bg-white/90">
              طلب تسجيل مخيم
            </Button>
          </Link>
        </div>
      </section>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        تَكافل — نعمل معاً لتنظيم المساعدات بكرامة وشفافية وأمل
      </p>
    </main>
  );
}
