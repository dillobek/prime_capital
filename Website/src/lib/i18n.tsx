'use client';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * Lightweight in-house i18n — no external package (npm installs are not available
 * in this environment). Same file is duplicated as-is in Webapp/src/lib/i18n.tsx.
 */

export type Locale = 'uz' | 'ru' | 'ar' | 'en';
export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'uz', label: "O'zbek" },
  { code: 'ru', label: 'Русский' },
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
];

type Dict = Record<string, string>;

const uz: Dict = {
  // common / nav
  'nav.home': 'Bosh sahifa',
  'nav.about': 'Biz haqimizda',
  'nav.apartments': 'Kvartiralar',
  'nav.newBuildings': 'Novostroykalar',
  'nav.promotions': 'Aktsiyalar',
  'nav.login': 'Kirish',
  'nav.account': 'Kabinet',
  'nav.logout': 'Chiqish',
  'nav.openApp': "Ilovani ochish",
  'common.loading': 'Yuklanmoqda...',
  'common.viewAll': "Barchasini ko'rish",
  'common.viewMore': 'Batafsil',
  'common.back': 'Orqaga',
  'common.currency': '$',
  'common.noData': "Ma'lumot topilmadi",
  'common.perMonth': 'oyiga',
  'common.address': 'Manzil',
  'common.phone': 'Telefon',
  'common.email': 'Email',
  'common.send': 'Yuborish',
  'common.close': 'Yopish',

  // home
  'home.hero.badge': "O'zbekistondagi investitsiya platformasi",
  'home.hero.title': "Ko'chmas mulk va investitsiyalarni boshqarish endi bir joyda",
  'home.hero.subtitle': "Prime Capital orqali kvartiralar, novostroykalar va investitsiya balansingizni real vaqtda kuzatib boring.",
  'home.hero.cta.apartments': "Kvartiralarni ko'rish",
  'home.hero.cta.app': 'Telegram ilovasini ochish',
  'home.about.title': 'Biz haqimizda',
  'home.about.text': "Prime Capital — ko'chmas mulk va investitsiya boshqaruvi bo'yicha ishonchli platforma. Biz mijozlarimizga shaffof va xavfsiz investitsiya imkoniyatlarini taqdim etamiz.",
  'home.directions.title': "Yo'nalishlarimiz",
  'home.directions.apartments.title': 'Kvartiralar',
  'home.directions.apartments.text': "Shahardagi eng yaxshi hududlardagi tayyor va qurilayotgan kvartiralar.",
  'home.directions.invest.title': 'Investitsiyalar',
  'home.directions.invest.text': 'Prime Capital va PHP Invest orqali kapitalingizni oshiring.',
  'home.directions.support.title': "Qo'llab-quvvatlash",
  'home.directions.support.text': "24/7 mijozlarga xizmat ko'rsatish jamoasi.",
  'home.why.title': 'Nima uchun aynan biz?',
  'home.why.transparent': 'Shaffof hisobotlar',
  'home.why.transparentText': "Har bir foiz o'zgarishi va balans tarixi ko'rinib turadi.",
  'home.why.secure': 'Xavfsizlik',
  'home.why.secureText': "Ma'lumotlaringiz ishonchli tarzda saqlanadi.",
  'home.why.support': "Doimiy qo'llab-quvvatlash",
  'home.why.supportText': "Savollaringizga tez javob beramiz.",
  'home.proof.users': 'Foydalanuvchilar',
  'home.proof.properties': "E'lonlar",
  'home.proof.years': 'Tajriba (yil)',
  'home.cta.title': 'Boshlashga tayyormisiz?',
  'home.cta.text': "Telegram ilovamiz orqali bir necha soniyada ro'yxatdan o'ting.",
  'home.cta.button': 'Hoziroq boshlash',
  'footer.rights': 'Barcha huquqlar himoyalangan.',
  'footer.contacts': 'Aloqa',

  // about
  'about.title': 'Biz haqimizda',
  'about.intro': "Prime Capital 2020 yildan buyon O'zbekiston bozorida ko'chmas mulk va investitsiya boshqaruvi sohasida faoliyat yuritadi.",
  'about.mission.title': 'Bizning maqsadimiz',
  'about.mission.text': "Har bir mijozga o'z mablag'ini shaffof va xavfsiz tarzda o'stirish imkoniyatini berish.",
  'about.values.title': 'Qadriyatlarimiz',
  'about.values.trust': 'Ishonch',
  'about.values.transparency': 'Shaffoflik',
  'about.values.growth': "O'sish",
  'about.team.title': 'Jamoamiz',
  'about.team.text': "Moliya, ko'chmas mulk va texnologiya sohasidagi tajribali mutaxassislar jamoasi.",

  // listings (apartments / new-buildings / promotions)
  'listing.apartments.title': 'Kvartiralar',
  'listing.apartments.subtitle': "Barcha turdagi tayyor va ikkilamchi kvartiralar ro'yxati",
  'listing.newBuildings.title': 'Novostroykalar',
  'listing.newBuildings.subtitle': 'Qurilayotgan va yangi qurilgan uylar',
  'listing.promotions.title': 'Aktsiyalar',
  'listing.promotions.subtitle': 'Joriy chegirma va maxsus takliflar',
  'listing.filter.all': 'Barchasi',
  'listing.filter.active': 'Faol',
  'listing.filter.status': 'Status',
  'listing.field.price': 'Narxi',
  'listing.field.type': 'Turi',
  'listing.field.type.newBuild': 'Novostroyka',
  'listing.field.type.secondary': 'Ikkilamchi',
  'listing.field.date': "Qo'shilgan sana",
  'listing.empty': "Hozircha e'lonlar mavjud emas",
  'listing.contact': "Bog'lanish",

  // login
  'login.title': 'Tizimga kirish',
  'login.subtitle': "Hisobingizga kirish uchun ma'lumotlarni kiriting",
  'login.email': 'Email',
  'login.password': 'Parol',
  'login.submit': 'Kirish',
  'login.loading': 'Kirilmoqda...',
  'login.error': "Email yoki parol noto'g'ri",
  'login.success': 'Muvaffaqiyatli kirdingiz',
  'login.noAccount': "Ilovadan ro'yxatdan o'ting",
  'login.viaTelegram': 'Telegram orqali kirish uchun ilovani oching',
};

const ru: Dict = {
  'nav.home': 'Главная',
  'nav.about': 'О нас',
  'nav.apartments': 'Квартиры',
  'nav.newBuildings': 'Новостройки',
  'nav.promotions': 'Акции',
  'nav.login': 'Войти',
  'nav.account': 'Кабинет',
  'nav.logout': 'Выйти',
  'nav.openApp': 'Открыть приложение',
  'common.loading': 'Загрузка...',
  'common.viewAll': 'Смотреть все',
  'common.viewMore': 'Подробнее',
  'common.back': 'Назад',
  'common.currency': '$',
  'common.noData': 'Данные не найдены',
  'common.perMonth': 'в месяц',
  'common.address': 'Адрес',
  'common.phone': 'Телефон',
  'common.email': 'Email',
  'common.send': 'Отправить',
  'common.close': 'Закрыть',

  'home.hero.badge': 'Инвестиционная платформа в Узбекистане',
  'home.hero.title': 'Управление недвижимостью и инвестициями теперь в одном месте',
  'home.hero.subtitle': 'Отслеживайте квартиры, новостройки и баланс инвестиций в реальном времени через Prime Capital.',
  'home.hero.cta.apartments': 'Смотреть квартиры',
  'home.hero.cta.app': 'Открыть Telegram-приложение',
  'home.about.title': 'О нас',
  'home.about.text': 'Prime Capital — надёжная платформа по управлению недвижимостью и инвестициями. Мы предлагаем клиентам прозрачные и безопасные инвестиционные возможности.',
  'home.directions.title': 'Наши направления',
  'home.directions.apartments.title': 'Квартиры',
  'home.directions.apartments.text': 'Готовые и строящиеся квартиры в лучших районах города.',
  'home.directions.invest.title': 'Инвестиции',
  'home.directions.invest.text': 'Увеличивайте капитал через Prime Capital и PHP Invest.',
  'home.directions.support.title': 'Поддержка',
  'home.directions.support.text': 'Служба поддержки клиентов 24/7.',
  'home.why.title': 'Почему именно мы?',
  'home.why.transparent': 'Прозрачная отчётность',
  'home.why.transparentText': 'Каждое изменение процента и история баланса видны всегда.',
  'home.why.secure': 'Безопасность',
  'home.why.secureText': 'Ваши данные надёжно защищены.',
  'home.why.support': 'Постоянная поддержка',
  'home.why.supportText': 'Быстро отвечаем на ваши вопросы.',
  'home.proof.users': 'Пользователи',
  'home.proof.properties': 'Объявления',
  'home.proof.years': 'Лет опыта',
  'home.cta.title': 'Готовы начать?',
  'home.cta.text': 'Зарегистрируйтесь за несколько секунд через наше Telegram-приложение.',
  'home.cta.button': 'Начать сейчас',
  'footer.rights': 'Все права защищены.',
  'footer.contacts': 'Контакты',

  'about.title': 'О нас',
  'about.intro': 'Prime Capital работает на рынке недвижимости и управления инвестициями Узбекистана с 2020 года.',
  'about.mission.title': 'Наша миссия',
  'about.mission.text': 'Дать каждому клиенту возможность прозрачно и безопасно приумножать свои средства.',
  'about.values.title': 'Наши ценности',
  'about.values.trust': 'Доверие',
  'about.values.transparency': 'Прозрачность',
  'about.values.growth': 'Рост',
  'about.team.title': 'Наша команда',
  'about.team.text': 'Команда опытных специалистов в сфере финансов, недвижимости и технологий.',

  'listing.apartments.title': 'Квартиры',
  'listing.apartments.subtitle': 'Список всех готовых и вторичных квартир',
  'listing.newBuildings.title': 'Новостройки',
  'listing.newBuildings.subtitle': 'Строящиеся и новые дома',
  'listing.promotions.title': 'Акции',
  'listing.promotions.subtitle': 'Текущие скидки и специальные предложения',
  'listing.filter.all': 'Все',
  'listing.filter.active': 'Активные',
  'listing.filter.status': 'Статус',
  'listing.field.price': 'Цена',
  'listing.field.type': 'Тип',
  'listing.field.type.newBuild': 'Новостройка',
  'listing.field.type.secondary': 'Вторичное',
  'listing.field.date': 'Дата добавления',
  'listing.empty': 'Пока нет объявлений',
  'listing.contact': 'Связаться',

  'login.title': 'Вход в систему',
  'login.subtitle': 'Введите данные для входа в аккаунт',
  'login.email': 'Email',
  'login.password': 'Пароль',
  'login.submit': 'Войти',
  'login.loading': 'Выполняется вход...',
  'login.error': 'Неверный email или пароль',
  'login.success': 'Вы успешно вошли',
  'login.noAccount': 'Зарегистрируйтесь через приложение',
  'login.viaTelegram': 'Откройте приложение для входа через Telegram',
};

const en: Dict = {
  'nav.home': 'Home',
  'nav.about': 'About us',
  'nav.apartments': 'Apartments',
  'nav.newBuildings': 'New buildings',
  'nav.promotions': 'Promotions',
  'nav.login': 'Login',
  'nav.account': 'Account',
  'nav.logout': 'Log out',
  'nav.openApp': 'Open app',
  'common.loading': 'Loading...',
  'common.viewAll': 'View all',
  'common.viewMore': 'View more',
  'common.back': 'Back',
  'common.currency': '$',
  'common.noData': 'No data found',
  'common.perMonth': 'per month',
  'common.address': 'Address',
  'common.phone': 'Phone',
  'common.email': 'Email',
  'common.send': 'Send',
  'common.close': 'Close',

  'home.hero.badge': 'Investment platform in Uzbekistan',
  'home.hero.title': 'Real estate and investment management, now in one place',
  'home.hero.subtitle': 'Track apartments, new buildings and your investment balance in real time with Prime Capital.',
  'home.hero.cta.apartments': 'View apartments',
  'home.hero.cta.app': 'Open Telegram app',
  'home.about.title': 'About us',
  'home.about.text': 'Prime Capital is a trusted platform for real estate and investment management. We offer our clients transparent and secure investment opportunities.',
  'home.directions.title': 'Our directions',
  'home.directions.apartments.title': 'Apartments',
  'home.directions.apartments.text': 'Ready and under-construction apartments in the best areas of the city.',
  'home.directions.invest.title': 'Investments',
  'home.directions.invest.text': 'Grow your capital with Prime Capital and PHP Invest.',
  'home.directions.support.title': 'Support',
  'home.directions.support.text': '24/7 customer support team.',
  'home.why.title': 'Why choose us?',
  'home.why.transparent': 'Transparent reporting',
  'home.why.transparentText': 'Every percent change and balance history is always visible.',
  'home.why.secure': 'Security',
  'home.why.secureText': 'Your data is stored securely.',
  'home.why.support': 'Ongoing support',
  'home.why.supportText': 'We respond to your questions quickly.',
  'home.proof.users': 'Users',
  'home.proof.properties': 'Listings',
  'home.proof.years': 'Years of experience',
  'home.cta.title': 'Ready to get started?',
  'home.cta.text': 'Sign up in seconds through our Telegram app.',
  'home.cta.button': 'Get started now',
  'footer.rights': 'All rights reserved.',
  'footer.contacts': 'Contacts',

  'about.title': 'About us',
  'about.intro': 'Prime Capital has been operating in the Uzbekistan real estate and investment management market since 2020.',
  'about.mission.title': 'Our mission',
  'about.mission.text': 'To give every client the opportunity to grow their funds transparently and securely.',
  'about.values.title': 'Our values',
  'about.values.trust': 'Trust',
  'about.values.transparency': 'Transparency',
  'about.values.growth': 'Growth',
  'about.team.title': 'Our team',
  'about.team.text': 'A team of experienced specialists in finance, real estate and technology.',

  'listing.apartments.title': 'Apartments',
  'listing.apartments.subtitle': 'List of all ready and secondary apartments',
  'listing.newBuildings.title': 'New buildings',
  'listing.newBuildings.subtitle': 'Under-construction and newly built homes',
  'listing.promotions.title': 'Promotions',
  'listing.promotions.subtitle': 'Current discounts and special offers',
  'listing.filter.all': 'All',
  'listing.filter.active': 'Active',
  'listing.filter.status': 'Status',
  'listing.field.price': 'Price',
  'listing.field.type': 'Type',
  'listing.field.type.newBuild': 'New building',
  'listing.field.type.secondary': 'Secondary',
  'listing.field.date': 'Date added',
  'listing.empty': 'No listings yet',
  'listing.contact': 'Contact',

  'login.title': 'Sign in',
  'login.subtitle': 'Enter your details to access your account',
  'login.email': 'Email',
  'login.password': 'Password',
  'login.submit': 'Sign in',
  'login.loading': 'Signing in...',
  'login.error': 'Incorrect email or password',
  'login.success': 'Signed in successfully',
  'login.noAccount': 'Sign up through the app',
  'login.viaTelegram': 'Open the app to sign in via Telegram',
};

const ar: Dict = {
  'nav.home': 'الرئيسية',
  'nav.about': 'من نحن',
  'nav.apartments': 'الشقق',
  'nav.newBuildings': 'المباني الجديدة',
  'nav.promotions': 'العروض',
  'nav.login': 'تسجيل الدخول',
  'nav.account': 'الحساب',
  'nav.logout': 'تسجيل الخروج',
  'nav.openApp': 'فتح التطبيق',
  'common.loading': 'جارٍ التحميل...',
  'common.viewAll': 'عرض الكل',
  'common.viewMore': 'المزيد',
  'common.back': 'رجوع',
  'common.currency': '$',
  'common.noData': 'لا توجد بيانات',
  'common.perMonth': 'شهريًا',
  'common.address': 'العنوان',
  'common.phone': 'الهاتف',
  'common.email': 'البريد الإلكتروني',
  'common.send': 'إرسال',
  'common.close': 'إغلاق',

  'home.hero.badge': 'منصة استثمارية في أوزبكستان',
  'home.hero.title': 'إدارة العقارات والاستثمارات الآن في مكان واحد',
  'home.hero.subtitle': 'تابع الشقق والمباني الجديدة ورصيد استثماراتك في الوقت الفعلي عبر Prime Capital.',
  'home.hero.cta.apartments': 'عرض الشقق',
  'home.hero.cta.app': 'فتح تطبيق تيليجرام',
  'home.about.title': 'من نحن',
  'home.about.text': 'Prime Capital منصة موثوقة لإدارة العقارات والاستثمارات. نقدم لعملائنا فرصًا استثمارية شفافة وآمنة.',
  'home.directions.title': 'مجالات عملنا',
  'home.directions.apartments.title': 'الشقق',
  'home.directions.apartments.text': 'شقق جاهزة وقيد الإنشاء في أفضل مناطق المدينة.',
  'home.directions.invest.title': 'الاستثمارات',
  'home.directions.invest.text': 'نمِّ رأس مالك عبر Prime Capital و PHP Invest.',
  'home.directions.support.title': 'الدعم',
  'home.directions.support.text': 'فريق دعم العملاء على مدار الساعة.',
  'home.why.title': 'لماذا نحن؟',
  'home.why.transparent': 'تقارير شفافة',
  'home.why.transparentText': 'يظهر كل تغيير في النسبة وتاريخ الرصيد دائمًا.',
  'home.why.secure': 'الأمان',
  'home.why.secureText': 'بياناتك محفوظة بأمان.',
  'home.why.support': 'دعم مستمر',
  'home.why.supportText': 'نرد على استفساراتكم بسرعة.',
  'home.proof.users': 'المستخدمون',
  'home.proof.properties': 'الإعلانات',
  'home.proof.years': 'سنوات الخبرة',
  'home.cta.title': 'هل أنت مستعد للبدء؟',
  'home.cta.text': 'سجّل خلال ثوانٍ عبر تطبيقنا على تيليجرام.',
  'home.cta.button': 'ابدأ الآن',
  'footer.rights': 'جميع الحقوق محفوظة.',
  'footer.contacts': 'التواصل',

  'about.title': 'من نحن',
  'about.intro': 'تعمل Prime Capital في سوق العقارات وإدارة الاستثمارات في أوزبكستان منذ عام 2020.',
  'about.mission.title': 'مهمتنا',
  'about.mission.text': 'منح كل عميل فرصة تنمية أمواله بشفافية وأمان.',
  'about.values.title': 'قيمنا',
  'about.values.trust': 'الثقة',
  'about.values.transparency': 'الشفافية',
  'about.values.growth': 'النمو',
  'about.team.title': 'فريقنا',
  'about.team.text': 'فريق من المتخصصين ذوي الخبرة في المالية والعقارات والتكنولوجيا.',

  'listing.apartments.title': 'الشقق',
  'listing.apartments.subtitle': 'قائمة بجميع الشقق الجاهزة والثانوية',
  'listing.newBuildings.title': 'المباني الجديدة',
  'listing.newBuildings.subtitle': 'المنازل قيد الإنشاء والمبنية حديثًا',
  'listing.promotions.title': 'العروض',
  'listing.promotions.subtitle': 'الخصومات والعروض الخاصة الحالية',
  'listing.filter.all': 'الكل',
  'listing.filter.active': 'نشط',
  'listing.filter.status': 'الحالة',
  'listing.field.price': 'السعر',
  'listing.field.type': 'النوع',
  'listing.field.type.newBuild': 'مبنى جديد',
  'listing.field.type.secondary': 'ثانوي',
  'listing.field.date': 'تاريخ الإضافة',
  'listing.empty': 'لا توجد إعلانات بعد',
  'listing.contact': 'تواصل',

  'login.title': 'تسجيل الدخول',
  'login.subtitle': 'أدخل بياناتك للوصول إلى حسابك',
  'login.email': 'البريد الإلكتروني',
  'login.password': 'كلمة المرور',
  'login.submit': 'دخول',
  'login.loading': 'جارٍ تسجيل الدخول...',
  'login.error': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'login.success': 'تم تسجيل الدخول بنجاح',
  'login.noAccount': 'سجّل عبر التطبيق',
  'login.viaTelegram': 'افتح التطبيق لتسجيل الدخول عبر تيليجرام',
};

// --- Webapp-specific keys (kept in the same dict object so the file is a drop-in
// duplicate between Website and Webapp) ---
const wa_uz: Dict = {
  'wa.nav.home': 'Bosh sahifa',
  'wa.nav.apartments': 'Kvartiralar',
  'wa.nav.finance': 'Moliya',
  'wa.nav.profile': 'Profil',
  'wa.hero.title': 'Xush kelibsiz',
  'wa.hero.subtitle': 'Balansingiz va yangiliklar',
  'wa.balances.title': 'Balanslar',
  'wa.balances.change': "O'zgarish",
  'wa.quick.topup': "To'ldirish",
  'wa.quick.withdraw': "Yechish",
  'wa.finance.title': 'Moliya',
  'wa.finance.income': 'Daromad',
  'wa.finance.expense': 'Xarajat',
  'wa.finance.add': "Qo'shish",
  'wa.profile.title': 'Profil',
  'wa.profile.balance': 'Balans',
  'wa.profile.settings': 'Sozlamalar',
  'wa.money.title': 'Summa',
  'wa.money.submit': 'Tasdiqlash',
  'wa.support.title': "Qo'llab-quvvatlash",
  'wa.auth.login': 'Kirish',
  'wa.auth.register': "Ro'yxatdan o'tish",
  'wa.auth.email': 'Email',
  'wa.auth.password': 'Parol',
  'wa.notifications.title': 'Bildirishnomalar',
  'wa.notifications.empty': "Bildirishnomalar yo'q",
};
const wa_ru: Dict = {
  'wa.nav.home': 'Главная',
  'wa.nav.apartments': 'Квартиры',
  'wa.nav.finance': 'Финансы',
  'wa.nav.profile': 'Профиль',
  'wa.hero.title': 'Добро пожаловать',
  'wa.hero.subtitle': 'Ваш баланс и новости',
  'wa.balances.title': 'Балансы',
  'wa.balances.change': 'Изменение',
  'wa.quick.topup': 'Пополнить',
  'wa.quick.withdraw': 'Вывести',
  'wa.finance.title': 'Финансы',
  'wa.finance.income': 'Доход',
  'wa.finance.expense': 'Расход',
  'wa.finance.add': 'Добавить',
  'wa.profile.title': 'Профиль',
  'wa.profile.balance': 'Баланс',
  'wa.profile.settings': 'Настройки',
  'wa.money.title': 'Сумма',
  'wa.money.submit': 'Подтвердить',
  'wa.support.title': 'Поддержка',
  'wa.auth.login': 'Войти',
  'wa.auth.register': 'Регистрация',
  'wa.auth.email': 'Email',
  'wa.auth.password': 'Пароль',
  'wa.notifications.title': 'Уведомления',
  'wa.notifications.empty': 'Нет уведомлений',
};
const wa_en: Dict = {
  'wa.nav.home': 'Home',
  'wa.nav.apartments': 'Apartments',
  'wa.nav.finance': 'Finance',
  'wa.nav.profile': 'Profile',
  'wa.hero.title': 'Welcome',
  'wa.hero.subtitle': 'Your balance and news',
  'wa.balances.title': 'Balances',
  'wa.balances.change': 'Change',
  'wa.quick.topup': 'Top up',
  'wa.quick.withdraw': 'Withdraw',
  'wa.finance.title': 'Finance',
  'wa.finance.income': 'Income',
  'wa.finance.expense': 'Expense',
  'wa.finance.add': 'Add',
  'wa.profile.title': 'Profile',
  'wa.profile.balance': 'Balance',
  'wa.profile.settings': 'Settings',
  'wa.money.title': 'Amount',
  'wa.money.submit': 'Confirm',
  'wa.support.title': 'Support',
  'wa.auth.login': 'Login',
  'wa.auth.register': 'Register',
  'wa.auth.email': 'Email',
  'wa.auth.password': 'Password',
  'wa.notifications.title': 'Notifications',
  'wa.notifications.empty': 'No notifications',
};
const wa_ar: Dict = {
  'wa.nav.home': 'الرئيسية',
  'wa.nav.apartments': 'الشقق',
  'wa.nav.finance': 'المالية',
  'wa.nav.profile': 'الملف الشخصي',
  'wa.hero.title': 'مرحبًا بك',
  'wa.hero.subtitle': 'رصيدك وآخر الأخبار',
  'wa.balances.title': 'الأرصدة',
  'wa.balances.change': 'التغيير',
  'wa.quick.topup': 'إيداع',
  'wa.quick.withdraw': 'سحب',
  'wa.finance.title': 'المالية',
  'wa.finance.income': 'الدخل',
  'wa.finance.expense': 'المصروف',
  'wa.finance.add': 'إضافة',
  'wa.profile.title': 'الملف الشخصي',
  'wa.profile.balance': 'الرصيد',
  'wa.profile.settings': 'الإعدادات',
  'wa.money.title': 'المبلغ',
  'wa.money.submit': 'تأكيد',
  'wa.support.title': 'الدعم',
  'wa.auth.login': 'تسجيل الدخول',
  'wa.auth.register': 'إنشاء حساب',
  'wa.auth.email': 'البريد الإلكتروني',
  'wa.auth.password': 'كلمة المرور',
  'wa.notifications.title': 'الإشعارات',
  'wa.notifications.empty': 'لا توجد إشعارات',
};

const dict: Record<Locale, Dict> = {
  uz: { ...uz, ...wa_uz },
  ru: { ...ru, ...wa_ru },
  en: { ...en, ...wa_en },
  ar: { ...ar, ...wa_ar },
};

const STORAGE_KEY = 'prime_locale';

type LangContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
};

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('uz');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && (saved === 'uz' || saved === 'ru' || saved === 'ar' || saved === 'en')) {
        setLocaleState(saved);
      }
    } catch {
      /* localStorage unavailable — keep default */
    }
  }, []);

  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo<LangContextValue>(() => {
    const table = dict[locale];
    return {
      locale,
      setLocale,
      dir: locale === 'ar' ? 'rtl' : 'ltr',
      t: (key: string) => table[key] ?? dict.uz[key] ?? key,
    };
  }, [locale]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang() must be used inside <LanguageProvider>');
  return ctx;
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLang();
  return (
    <select
      className={className ?? 'lang-switcher'}
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      aria-label="Til / Язык / Language / اللغة"
    >
      {LOCALES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
