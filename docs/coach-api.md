# داکیومنت API مربی

مرجع کامل قرارداد بک اند برای تمام صفحه های نقش مربی. این فایل برای مرحله اتصال API نوشته شده است. در وضعیت فعلی، همه صفحه های مربی به بک اند وصل هستند: احراز هویت، باشگاه ها، کلاس ها، فهرست، ثبت، پرونده، ویرایش و تخصیص کمربند هنرجو، ثبت حضور و غیاب، گزارش جلسه، دعوت نامه ها، داشبورد (کلاس های امروز، آمار، نمودار حضور، دعوت نامه ها و آزمون ها)، پروفایل مربی و زنگ اعلان.

- منبع: پروژه `taekyar-backend` (NestJS + Prisma + PostgreSQL + Redis)
- نسخه API: `v1`
- پیشوند مسیر: `/api/v1`
- تاریخ بررسی: 1405/08/08 (2026-10-30)

---

## 1. قواعد عمومی

### 1.1 احراز هویت

- همه مسیرهای مربی به هدر زیر نیاز دارند:

```http
Authorization: Bearer <accessToken>
```

- توکن از `POST /auth/verify-otp` گرفته می شود.
- عمر پیش فرض `accessToken` برابر 7 روز و `refreshToken` برابر 30 روز است.
- پس از انقضا: `POST /auth/refresh` با `refreshToken` و سپس تکرار درخواست.
- نقش ها: `ADMIN`، `COACH`، `STUDENT`. تمام مسیرهای این سند حداقل نقش `COACH` می خواهند، جز مواردی که در همان بخش ذکر شده است.
- اگر کاربر توکن نداشته باشد یا نشست باطل شده باشد: خطای `401`.

### 1.2 قالب پاسخ موفق

```json
{
  "success": true,
  "statusCode": 200,
  "message": "داده ها با موفقیت دریافت شدند",
  "data": {},
  "meta": { "pager": { "page": 1, "perPage": 20, "total": 12, "totalPages": 1 } },
  "timestamp": "2026-10-21T10:00:00.000Z",
  "path": "/api/v1/student?page=1&take=20"
}
```

- `meta` فقط در پاسخ های صفحه بندی شده حاضر است.
- `message` همیشه حاضر است؛ اگر سرویس پیام نداشته باشد، پیام پیش فرض `عملیات با موفقیت انجام شد` برمی گردد.
- در پاسخ های صفحه بندی شده، `data` آرایه آیتم ها است و اطلاعات صفحه بندی در `meta.pager` قرار می گیرد. نام فیلد اندازه صفحه `perPage` است، نه `take`.
- پاسخ های `POST` به طور پیش فرض `201` هستند، مگر مسیرهایی که صریحا `200` تعیین کرده اند (تمام مسیرهای `auth`). `GET`، `PATCH`، `PUT` و `DELETE` برابر `200` هستند.
- برخی پاسخ های حذف فقط `message` دارند و در نتیجه `data` آن ها `{}` است.

### 1.3 قالب پاسخ خطا

```json
{
  "success": false,
  "statusCode": 400,
  "message": "تاریخ نمی تواند در آینده باشد",
  "errors": [
    { "field": "birthDate", "message": "تاریخ نمی تواند در آینده باشد" }
  ],
  "timestamp": "2026-10-21T10:00:00.000Z",
  "path": "/api/v1/student"
}
```

- خطاهای اعتبارسنجی: `400` با آرایه `errors`.
- عدم احراز هویت: `401`.
- نداشتن دسترسی به رکورد مربی دیگر: `403`.
- رکورد پیدا نشد: `404`.
- تداخل (کد ملی تکراری، عضویت تکراری، دعوت نامه در انتظار و...): `409`.
- محدودیت ارسال یا تایید کد: `429` (throttle).

### 1.4 صفحه بندی و مرتب سازی

پارامترهای مشترک در همه لیست ها:

| پارامتر | نوع | الزامی | پیش فرض | قاعده |
|---|---|---|---|---|
| `page` | number | خیر | 1 | حداقل 1 |
| `take` | number | خیر | 20 | بین 1 تا 100 |

قواعد مرتب سازی:

- `sortDirection`: `asc` یا `desc`
- `sortBy` برای هر منبع متفاوت است و در همان بخش آمده است.
- جستجو با `search` و معمولا روی نام و کد ملی انجام می شود.
- پارامترهای بولین به صورت رشته `true` یا `false` ارسال شوند.
- پارامترهای آرایه ای هم به صورت `?genders=MALE,FEMALE` و هم به صورت تکرار شونده پذیرفته می شوند.

### 1.5 تاریخ، زمان و اعداد

- **همه تاریخ ها در API میلادی و ISO 8601 هستند.** فرانت تاریخ شمسی را فقط برای نمایش نگه می دارد و هنگام ارسال باید به میلادی تبدیل شود. قالب پیشنهادی: `YYYY-MM-DD`.
- تاریخ ها در دیتابیس از نوع `Date` هستند و بخش زمان آن ها اهمیت ندارد.
- ساعت ها رشته `HH:mm` در بازه 24 ساعته و با رقم لاتین هستند.
- `startTime` باید کوچک تر از `endTime` باشد.
- اعداد به صورت number یا رشته عددی پذیرفته می شوند. در UI ارقام فارسی نمایش داده شود، ولی مقدار ارسالی لاتین باشد.
- شماره موبایل و تلفن با `IsPhoneNumber('IR')` اعتبارسنجی می شوند. موبایل قبل از ذخیره نرمال سازی می شود.

### 1.6 enum های مشترک

`Gender`

```text
MALE | FEMALE
```

`Province` (31 استان)

```text
TEHRAN | ISFAHAN | FARS | RAZAVI_KHORASAN | KHUZESTAN | EAST_AZERBAIJAN | WEST_AZERBAIJAN
MAZANDARAN | GILAN | KERMAN | SISTAN_AND_BALUCHESTAN | GOLESTAN | ARDABIL | QOM | MARKAZI
HORMOZGAN | KERMANSHAH | ALBORZ | LORESTAN | HAMADAN | YAZD | KOHGILUYEH_AND_BOYER_AHMAD
CHAHARMAHAL_AND_BAKHTIARI | NORTH_KHORASAN | SOUTH_KHORASAN | ILAM | BUSHEHR | ZANJAN
QAZVIN | SEMNAN | KURDISTAN
```

`BeltName` (19 مقدار)

```text
WHITE | YELLOW | GREEN | BLUE | RED
POOM_1 | POOM_2 | POOM_3 | POOM_4
DAN_1 | DAN_2 | DAN_3 | DAN_4 | DAN_5 | DAN_6 | DAN_7 | DAN_8 | DAN_9 | DAN_10
```

`WeekDay`

```text
SATURDAY | SUNDAY | MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY
```

`AttendanceStatus`

```text
PRESENT | LATE | ABSENT | EXCUSED
```

`StudentCoachInvitationStatus`

```text
PENDING | CONFIRMED | REJECTED
```

`RankType` (در آبجکت کمربند)

```text
COLOR | POOM | DAN
```

### 1.7 نکته درباره تاریخ شمسی

بک اند هیچ تبدیل شمسی انجام نمی دهد و تاریخ شمسی را نمی پذیرد. تنها جایی که تقویم شمسی دخالت دارد، محاسبه `nextBeltDate` است که سمت سرور و با ماه شمسی انجام می شود. در فرانت:

- `DatePicker` مقدار شمسی نمایش می دهد.
- قبل از ارسال به API باید به `YYYY-MM-DD` میلادی تبدیل شود.
- هنگام دریافت، مقدار ISO باید به شمسی تبدیل و با `toPersianDigits` نمایش داده شود.

---

## 2. احراز هویت و پروفایل مربی

### 2.1 `POST /auth/coach/signup`

درخواست ارسال کد تایید برای ثبت نام مربی. عمومی است و توکن نمی خواهد. کد 5 رقمی به موبایل ارسال می شود.

بدنه:

| فیلد | نوع | الزامی | قاعده |
|---|---|---|---|
| `mobile` | string | بله | شماره موبایل ایران، مثال `09123456789` |
| `coachData.fullName` | string | بله | 2 تا 80 کاراکتر |
| `coachData.nationalCode` | string | بله | دقیقا 10 کاراکتر |
| `coachData.gender` | enum | بله | `MALE` یا `FEMALE` |
| `coachData.province` | enum | بله | یکی از استان ها |
| `coachData.birthDate` | string | خیر | تاریخ میلادی |
| `coachData.image` | string | خیر | کلید تصویر در فضای ذخیره سازی |
| `coachData.belt` | enum | خیر | فقط `DAN_3` تا `DAN_10` |

پاسخ موفق: `200` با `{ "message": "کد تایید با موفقیت ارسال شد" }` و `data: {}`.

خطاهای مهم:

- `409` اگر موبایل یا کد ملی قبلا برای مربی ثبت شده باشد.
- `409` اگر حساب کاربری پروفایل هنرجو داشته باشد.
- `400` اگر داده های ثبت نام ناقص باشد.
- `400` اگر کمربند مربی کمتر از دان 3 باشد.

### 2.2 `POST /auth/login`

درخواست کد تایید برای ورود. عمومی است.

بدنه:

| فیلد | نوع | الزامی | قاعده |
|---|---|---|---|
| `mobile` | string | بله | موبایل ایران |

- فقط برای کاربری که قبلا پروفایل مربی یا هنرجو دارد مجاز است.
- اگر موبایل ثبت نشده باشد: `409`.
- پاسخ: `200` با پیام ارسال کد.

### 2.3 `POST /auth/verify-otp`

تایید کد و دریافت توکن ها. عمومی است. برای ورود، ثبت نام مربی و ثبت نام هنرجو مشترک است.

بدنه:

| فیلد | نوع | الزامی | قاعده |
|---|---|---|---|
| `mobile` | string | بله | موبایل ایران |
| `code` | string | بله | دقیقا 5 کاراکتر |
| `deviceInfo.deviceId` | string | خیر | حداکثر 255 |
| `deviceInfo.deviceName` | string | خیر | حداکثر 100 |
| `deviceInfo.deviceType` | string | خیر | حداکثر 50، مثال `mobile` |
| `deviceInfo.platform` | string | خیر | حداکثر 50، مثال `android` |
| `deviceInfo.appVersion` | string | خیر | حداکثر 20 |

پاسخ موفق (داخل `data`):

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "userId": "uuid",
  "type": "COACH",
  "coach": {
    "id": "uuid",
    "userId": "uuid",
    "fullName": "محمدرضا یاری",
    "nationalCode": "0079458213",
    "gender": "MALE",
    "province": "TEHRAN",
    "birthDate": "1987-03-21T00:00:00.000Z",
    "imageKey": null,
    "belt": "DAN_8",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

- برای هنرجو، `type` برابر `STUDENT` و فیلد `student` برگردانده می شود.
- اگر کاربر پروفایل نداشته باشد، `coach` یا `student` می تواند `{}` باشد. این حالت برای کاربر OTP تایید شده ولی بدون پروفایل رخ می دهد.
- خطا: `400` کد نامعتبر یا منقضی، `429` تعداد تلاش زیاد.

### 2.4 `POST /auth/refresh`

بدنه:

| فیلد | نوع | الزامی |
|---|---|---|
| `refreshToken` | string | بله |
| `deviceInfo` | object | خیر |

پاسخ: `accessToken` و `refreshToken` جدید. اگر توکن باطل یا نشست منقضی باشد: `401` یا `409`.

### 2.5 `POST /auth/logout`

بدنه:

| فیلد | نوع | الزامی |
|---|---|---|
| `refreshToken` | string | بله |

نشست باطل می شود. پاسخ: `200` با `data: {}`.

### 2.6 `GET /auth/profile`

پروفایل کاربر جاری را برمی گرداند. برای مربی، آبجکت کامل `Coach` و برای هنرجو آبجکت `Student`.

```json
{
  "id": "uuid",
  "userId": "uuid",
  "fullName": "محمدرضا یاری",
  "nationalCode": "0079458213",
  "gender": "MALE",
  "province": "TEHRAN",
  "birthDate": "1987-03-21T00:00:00.000Z",
  "imageKey": null,
  "belt": "DAN_8",
  "mobile": "09121112233",
  "createdAt": "...",
  "updatedAt": "..."
}
```

- اگر پروفایل هنوز ساخته نشده باشد، مقدار `data` برابر `null` است.
- `mobile` روی رکورد `User` است و در همین پاسخ به آبجکت نقش اضافه می شود؛ پروفایل مربی تنها آن را ندارد.
- این مسیر برای صفحه `/coach/profile` کافی است.
- برای دسترسی به `id` مربی در سایر صفحات، از همین پاسخ یا از `GET /coach/:id` استفاده شود.

### 2.7 `POST /auth/complete-coach-profile`

تکمیل یا به روزرسانی پروفایل مربی برای کاربر تایید شده. نقش `COACH` یا `ADMIN` لازم است.

| فیلد | نوع | الزامی | قاعده |
|---|---|---|---|
| `fullName` | string | بله | 2 تا 80 |
| `nationalCode` | string | بله | 10 کاراکتر |
| `gender` | enum | بله | `MALE` یا `FEMALE` |
| `province` | enum | بله | استان |
| `birthDate` | string | خیر | میلادی |
| `imageKey` | string | خیر | کلید تصویر |
| `belt` | enum | خیر | `DAN_3` تا `DAN_10` |

- اگر مربی باشگاه یا هنرجو داشته باشد، تغییر جنسیت `400` می دهد: «برای تغییر جنسیت، ابتدا باید باشگاه ها و هنرجوهای شما حذف شوند».
- پاسخ: پیام «پروفایل مربی با موفقیت تکمیل شد» و `profile` شامل نام، کد ملی، جنسیت، استان و کمربند.

---

## 3. پروفایل مربی

### 3.1 `GET /coach/:id`

- نقش های مجاز: `COACH`، `ADMIN`.
- مربی فقط پروفایل خودش را می بیند؛ در غیر این صورت `403`.
- پاسخ: آبجکت `Coach`.

### 3.2 `PATCH /coach/:id`

همه فیلدها اختیاری هستند (`UpdateCoachDto`):

| فیلد | نوع | الزامی | قاعده |
|---|---|---|---|
| `fullName` | string | خیر | 2 تا 80 |
| `nationalCode` | string | خیر | 10 کاراکتر و یکتا |
| `gender` | enum | خیر | فقط اگر باشگاه یا هنرجو نداشته باشد |
| `province` | enum | خیر | استان |
| `birthDate` | string | خیر | میلادی یا `null` |
| `imageKey` | string | خیر | کلید تصویر |
| `belt` | enum | خیر | `DAN_3` تا `DAN_10` |

- پاسخ: آبجکت `Coach` به روزشده.
- تغییر کد ملی تکراری: `409`.
- تغییر جنسیت با داشتن باشگاه یا هنرجو: `400`.

### 3.3 سایر مسیرهای مربی (برای پنل ادمین)

| متد | مسیر | نقش | کاربرد |
|---|---|---|---|
| `POST` | `/coach` | COACH، ADMIN | ایجاد پروفایل مربی برای کاربر جاری |
| `GET` | `/coach` | COACH، ADMIN | لیست صفحه بندی شده مربیان |
| `DELETE` | `/coach/:id` | COACH، ADMIN | حذف پروفایل مربی |

در UI فعلی مربی از این سه مسیر استفاده نمی کند.

---

## 4. هنرجوها

### 4.1 `POST /student`

ثبت هنرجوی جدید توسط مربی. نقش `COACH` یا `ADMIN`.

| فیلد | نوع | الزامی | قاعده |
|---|---|---|---|
| `fullName` | string | بله | 2 تا 80 |
| `nationalCode` | string | بله | دقیقا 10 و یکتا |
| `gender` | enum | بله | باید با جنسیت مربی یکسان باشد |
| `birthDate` | string | بله | میلادی و نه در آینده |
| `belt` | enum | بله | یکی از 19 کمربند |
| `beltDate` | string | بله | میلادی و نه در آینده |
| `province` | enum | بله | استان |
| `fatherName` | string | خیر | 2 تا 80 |
| `phoneNumber` | string | خیر | موبایل ایران |
| `landlineNumber` | string | خیر | تلفن ثابت ایران |
| `membershipYear` | number | خیر | عدد مثبت، مثال 1403 |
| `sportsInsuranceDate` | string | خیر | میلادی |
| `imageKey` | string | خیر | کلید تصویر |
| `height` | number | خیر | بین 50 تا 260 سانتی متر |
| `weight` | number | خیر | بین 10 تا 300 کیلوگرم |

قواعد سرور:

- `coachId` به صورت خودکار از مربی جاری پر می شود.
- `nextBeltDate` با مدت زمان کمربند و تقویم شمسی محاسبه می شود.
- یک رکورد `BeltHistory` اولیه ساخته می شود.
- اگر `height` یا `weight` ارسال شود، یک رکورد `StudentMetrics` ساخته می شود.
- `expireImageDate` در ثبت اولیه پذیرفته نمی شود؛ فقط در ویرایش قابل تنظیم است.
- تداخل کد ملی: `409` با پیام «این کدملی قبلا ثبت شده است».
- جنسیت متفاوت با مربی: `400`.
- کمربند نامعتبر: `404`.

پاسخ (داخل `data`): آبجکت `Student`. توجه: کمربند و قد و وزن در همین پاسخ برنمی گردند.

### 4.2 `GET /student`

لیست هنرجوهای مربی جاری. فقط هنرجوهایی که `coachId` آن ها همین مربی است.

پارامترهای کوئری:

| پارامتر | نوع | الزامی | قاعده |
|---|---|---|---|
| `page` | number | خیر | پیش فرض 1 |
| `take` | number | خیر | پیش فرض 20، حداکثر 100 |
| `search` | string | خیر | جستجو در نام (contains) یا برابری کد ملی |
| `belt` | enum[] | خیر | یک یا چند `BeltName` |
| `ageCategory` | enum[] | خیر | یک یا چند رده سنی: `BLOSSOM`، `YOUTH`، `CADET`، `JUNIOR`، `YOUNG`، `SENIOR`، `ULTRA` |
| `insurance` | enum[] | خیر | `valid`، `expiring`، `expired`، `none` |
| `gender` | enum | خیر | `MALE` یا `FEMALE` |
| `sortBy` | enum | خیر | `createdAt`، `updatedAt`، `fullName`، `belt`، `insurance` |
| `sortDirection` | enum | خیر | `asc` یا `desc` (پیش فرض `desc`) |

پارامترهای آرایه ای هم به شکل تکرار کلید (`?belt=WHITE&belt=YELLOW`) و هم با کاما (`?belt=WHITE,YELLOW`) پذیرفته می شوند. مقدار نامعتبر در هر کدام `400` می دهد.

قواعد فیلتر:

- `belt`: تطابق با کمربند فعلی (`currentBelt.belt.name`). هنرجوی بدون کمربند در هیچ فیلتر کمربندی نمی آید.
- `ageCategory`: بازه تولد همان رده در جدول `AgeCategory` روی `birthDate` اعمال می شود (`startDate` تا یک روز بعد از `endDate`). این دو تاریخ میلادی هستند و مرجع اصلی رده اند.
- `insurance` روی `sportsInsuranceDate` (تاریخ انقضا) کار می کند: خالی → `none`، قبل از امروز → `expired`، امروز تا 30 روز آینده → `expiring`، بعد از آن → `valid`.
- همه فیلترها با `search` و هم دیگر ترکیب می شوند (AND).

پاسخ: آرایه `Student` همراه `meta.pager`، به علاوه دو رابطه:

- `currentBelt` با `belt` کامل (`name`، `label`، `level`، رنگ ها)
- `metrics` با آخرین رکورد (`take: 1`، مرتب بر `recordedAt` نزولی)

مرتب سازی `belt` روی `currentBelt.belt.level` و `insurance` روی `sportsInsuranceDate` با `nulls: last` انجام می شود؛ در `sortDirection=desc` هنرجویان بدون کمربند اول می آیند (محدودیت ترتیب NULL در Postgres برای رابطه).

#### `GET /student/stats`

همان محدوده مربی، بدون پارامتر. برای کارت های خلاصه فهرست.

```json
{
  "total": 34,
  "byInsurance": { "valid": 20, "expiring": 4, "expired": 6, "none": 4 },
  "expiringDays": 30
}
```

این مسیر قبل از `GET /student/:id` تعریف شده تا با شناسه تداخل نکند. نقش `COACH` یا `ADMIN`.

### 4.3 `GET /student/:id`

- مربی فقط هنرجوی خودش را می بیند؛ در غیر این صورت `403`.
- پاسخ: آبجکت `Student` بدون روابط کمربند و متریک و باشگاه.
- برای کمربند فعلی، مسیر خواندنی وجود ندارد (بخش 11).

### 4.4 `PATCH /student/:id`

همه فیلدها اختیاری هستند. نقش `COACH` یا `ADMIN`.

| فیلد | نوع | الزامی | قاعده |
|---|---|---|---|
| `fullName` | string | خیر | 2 تا 80 |
| `nationalCode` | string | خیر | 10 و یکتا |
| `gender` | enum | خیر | اگر هنرجو مربی داشته باشد قابل تغییر نیست |
| `birthDate` | string | خیر | میلادی |
| `fatherName` | string | خیر | 2 تا 80 |
| `phoneNumber` | string | خیر | موبایل ایران |
| `landlineNumber` | string | خیر | تلفن ثابت ایران |
| `province` | enum | خیر | استان |
| `membershipYear` | number | خیر | عدد مثبت |
| `sportsInsuranceDate` | string | خیر | میلادی |
| `expireImageDate` | string | خیر | میلادی |

نکات مهم:

- **کمربند، قد، وزن و `imageKey` در ویرایش پذیرفته نمی شوند.**
- تغییر جنسیت هنرجوی دارای مربی: `400`.
- کد ملی تکراری: `409`.
- `birthDate` در ویرایش validator آینده بودن ندارد؛ ولی UI باید همان قاعده ثبت را حفظ کند.
- پاسخ: آبجکت `Student` به روزشده.

### 4.5 `DELETE /student/:id`

- حذف کامل هنرجو.
- اگر هنرجو حساب کاربری فعال داشته باشد (`userId` مقدار داشته باشد) و کاربر مربی باشد: `403`. در این حالت باید از «حذف از لیست شاگردان» (`DELETE /coach/students/:studentId`) استفاده شود.
- پاسخ: `200` با `data: {}`.

### 4.6 `PATCH /student/:id/belt`

تخصیص کمربند جدید.

| فیلد | نوع | الزامی | قاعده |
|---|---|---|---|
| `beltId` | uuid | بله | شناسه رکورد کمربند از `GET /belt` |
| `beltDate` | string | بله | میلادی و نه در آینده |

- کمربند فعلی به روز می شود.
- یک رکورد `BeltHistory` جدید ثبت می شود.
- `nextBeltDate` با مدت زمان کمربند محاسبه می شود.
- پاسخ: `200` با پیام «کمربند {نام} با موفقیت به هنرجو تخصیص یافت» و آبجکت `Student`.

### 4.7 `POST /coach/students`

افزودن هنرجو با کد ملی. رفتار ترکیبی دارد:

1. اگر هنرجویی با این کد ملی وجود نداشته باشد، پروفایل هنرجو ساخته و مستقیما به مربی متصل می شود.
2. اگر وجود داشته باشد و هنرجوی همین مربی باشد: `409`.
3. اگر وجود داشته باشد و مربی دیگری داشته باشد: `409`.
4. اگر وجود داشته باشد و مربی نداشته باشد: **دعوت نامه** ارسال می شود.

بدنه همان فیلدهای `POST /student` است، به علاوه این تفاوت ها:

- `landlineNumber` و `membershipYear` در این DTO نیستند.
- اگر هنرجو از قبل وجود داشته باشد، فقط `nationalCode` لازم است و بقیه فیلدها در ساخت پروفایل جدید استفاده می شوند.

پاسخ یکی از این دو حالت است:

```json
{ "message": "هنرجو با موفقیت ثبت شد و به شما اختصاص یافت", "student": { "...": "" } }
```

یا

```json
{ "message": "دعوت نامه با موفقیت ارسال شد", "invitation": { "...": "" } }
```

نکته UI: فرم «ثبت هنرجوی جدید» (`/coach/students/new`) از `POST /student` استفاده می کند و تاریخ های شمسی را پیش از ارسال به میلادی تبدیل می کند. این مسیر برای سناریوی «افزودن سریع با کد ملی» مناسب است و در طراحی فعلی استفاده نمی شود.

### 4.8 `DELETE /coach/students/:studentId`

قطع ارتباط هنرجو از مربی:

- `coachId` هنرجو `null` می شود.
- عضویت او در همه باشگاه های این مربی غیرفعال و `removedAt` پر می شود.
- عضویت او در همه کلاس های این مربی حذف می شود.
- پاسخ: `200` با `data: {}`.

---

## 5. دعوت نامه ها

### 5.1 `POST /student-coach-invitation`

ارسال دعوت نامه با کد ملی. نقش `COACH`.

| فیلد | نوع | الزامی | قاعده |
|---|---|---|---|
| `nationalCode` | string | بله | دقیقا 10 کاراکتر |

پیش شرط ها (سرور):

- هنرجو باید از قبل پروفایل داشته باشد؛ در غیر این صورت `404` با پیام «هنرجویی با این کدملی یافت نشد».
- هنرجو نباید مربی داشته باشد؛ در غیر این صورت `409`.
- هنرجو نباید هنرجوی همین مربی باشد؛ در غیر این صورت `409`.
- جنسیت هنرجو باید با مربی یکسان باشد؛ در غیر این صورت `400`.
- برای همان هنرجو نباید دعوت نامه `PENDING` وجود داشته باشد؛ در غیر این صورت `409`.

پاسخ: آبجکت دعوت نامه همراه `student` کامل.

```json
{
  "id": "uuid",
  "coachId": "uuid",
  "studentId": "uuid",
  "nationalCode": "0012345678",
  "status": "PENDING",
  "respondedAt": null,
  "createdAt": "...",
  "updatedAt": "...",
  "student": { "id": "uuid", "fullName": "علی رضایی", "nationalCode": "0012345678" }
}
```

- این مسیر همان مسیری است که فرم `/coach/students/invite` باید استفاده کند.
- ارسال دعوت با شماره موبایل وجود ندارد.

### 5.2 `GET /student-coach-invitation/sent`

لیست دعوت نامه های ارسالی مربی.

| پارامتر | نوع | الزامی | قاعده |
|---|---|---|---|
| `page` | number | خیر | پیش فرض 1 |
| `take` | number | خیر | پیش فرض 20 |
| `status` | enum | خیر | `PENDING`، `CONFIRMED`، `REJECTED` |
| `sortBy` | enum | خیر | `createdAt` یا `updatedAt` |
| `sortDirection` | enum | خیر | `asc` یا `desc` |

- پاسخ: آرایه دعوت نامه ها همراه `student` کامل و `meta.pager`.
- صفحه `/coach/invitations` و بخش دعوت نامه های داشبورد از همین مسیر استفاده می کنند.

### 5.3 `GET /student-coach-invitation/sent/:id`

وضعیت یک دعوت نامه ارسالی همراه `student`. اگر مال همین مربی نباشد: `404`.

### 5.4 مسیرهای هنرجو (برای مستندسازی چرخه)

| متد | مسیر | نقش | کاربرد |
|---|---|---|---|
| `GET` | `/student-coach-invitation/inbox` | STUDENT | لیست دعوت نامه های دریافتی |
| `PATCH` | `/student-coach-invitation/:id/confirm` | STUDENT | تایید دعوت نامه و اتصال به مربی |
| `PATCH` | `/student-coach-invitation/:id/accept` | STUDENT | معادل confirm |
| `PATCH` | `/student-coach-invitation/:id/reject` | STUDENT | رد دعوت نامه |

- با تایید یک دعوت نامه، بقیه دعوت نامه های `PENDING` همان هنرجو خودکار `REJECTED` می شوند.
- تایید دوباره یا رد دعوت نامه پاسخ داده شده: `409`.

---

## 6. باشگاه ها

### 6.1 `POST /club`

ثبت باشگاه جدید. نقش `COACH`.

| فیلد | نوع | الزامی | قاعده |
|---|---|---|---|
| `name` | string | بله | 2 تا 80 کاراکتر |
| `imageKey` | string | خیر | کلید تصویر |
| `address` | string | خیر | 5 تا 200 کاراکتر |

نکات مهم:

- `gender` در DTO نیست و سرور آن را از جنسیت مربی پر می کند.
- `coachId` از مربی جاری پر می شود.
- `isActive` به صورت پیش فرض `true` است.
- هیچ فیلد دیگری برای ثبت باشگاه لازم نیست.
- پاسخ: `data.club` ( پیام به `message` پاکت منتقل می شود ).

### 6.2 `GET /club`

لیست باشگاه های مربی جاری.

| پارامتر | نوع | الزامی | قاعده |
|---|---|---|---|
| `page` | number | خیر | پیش فرض 1 |
| `take` | number | خیر | پیش فرض 20 |
| `search` | string | خیر | جستجو در نام |
| `isActive` | boolean | خیر | فیلتر فعال یا غیرفعال |
| `sortBy` | enum | خیر | `createdAt`، `updatedAt`، `name` |
| `sortDirection` | enum | خیر | `asc` یا `desc` |

- پاسخ: آرایه `Club` همراه `meta.pager`.
- تعداد کلاس و تعداد هنرجو در پاسخ نیست (بخش 11).

### 6.3 `GET /club/:id`

جزئیات باشگاه. فقط باشگاه خود مربی؛ در غیر این صورت `403`.

### 6.4 `PATCH /club/:id`

همه فیلدها اختیاری:

| فیلد | نوع | الزامی | قاعده |
|---|---|---|---|
| `name` | string | خیر | 2 تا 80 |
| `imageKey` | string | خیر | کلید تصویر |
| `address` | string | خیر | 5 تا 200 |

- جنسیت باشگاه قابل تغییر نیست (در DTO وجود ندارد).
- برای پاک کردن آدرس باید `address: null` ارسال شود؛ رشته خالی اعتبارسنجی 5 تا 200 را نمی گذراند.
- پاسخ: `data.club` ( پیام به `message` پاکت منتقل می شود ).

### 6.5 `PATCH /club/:id/status`

| فیلد | نوع | الزامی |
|---|---|---|
| `isActive` | boolean | بله |

- پاسخ: `data.club` ( پیام به `message` پاکت منتقل می شود ).
- حذف باشگاه وجود ندارد؛ فقط غیرفعال سازی.

### 6.6 `GET /club/:id/students`

اعضای باشگاه.

| پارامتر | نوع | الزامی | قاعده |
|---|---|---|---|
| `page` | number | خیر | پیش فرض 1 |
| `take` | number | خیر | پیش فرض 20 |
| `isActive` | boolean | خیر | فیلتر عضویت فعال |

- هر آیتم `ClubStudent` است و فیلد `student` شامل پروفایل کامل هنرجو می شود.
- ترتیب: `joinedAt` نزولی.
- پاسخ همراه `meta.pager`.

### 6.7 `POST /club/:id/students`

| فیلد | نوع | الزامی |
|---|---|---|
| `studentId` | uuid | بله |

قواعد:

- هنرجو باید تحت نظر همین مربی باشد؛ در غیر این صورت `403`.
- جنسیت هنرجو باید با جنسیت باشگاه یکسان باشد؛ در غیر این صورت `400`.
- عضویت فعال تکراری: `409`.
- اگر عضویت قبلی غیرفعال بوده باشد، دوباره فعال می شود و `joinedAt` به روز می شود و `removedAt` پاک می شود.
- پاسخ: آبجکت `ClubStudent`.

### 6.8 `PATCH /club/:id/students/:studentId/status`

| فیلد | نوع | الزامی |
|---|---|---|
| `isActive` | boolean | بله |

- غیرفعال کردن: `isActive=false` و `removedAt=زمان فعلی` (حذف نرم).
- فعال کردن: `isActive=true`، `joinedAt` جدید و `removedAt=null`.
- پاسخ: آبجکت `ClubStudent`.

### 6.9 `GET /club/by-student/:studentId`

- همه عضویت های باشگاهی یک هنرجو همراه `club`.
- هنرجو باید تحت نظر مربی باشد؛ در غیر این صورت `403`.
- پاسخ: آرایه (بدون صفحه بندی) از `ClubStudent`.

---

## 7. کلاس ها

### 7.1 `POST /class-session`

ثبت کلاس جدید. نقش `COACH`.

| فیلد | نوع | الزامی | قاعده |
|---|---|---|---|
| `clubId` | uuid | بله | باشگاه باید متعلق به همین مربی باشد |
| `name` | string | بله | 2 تا 80 کاراکتر |
| `weekDays` | enum[] | بله | آرایه غیرخالی از `WeekDay` |
| `startTime` | string | بله | `HH:mm` |
| `endTime` | string | بله | `HH:mm` و بزرگ تر از `startTime` |

- `isActive` سرور مقدار `true` می دهد.
- ظرفیت کلاس وجود ندارد.
- بررسی تداخل زمانی با کلاس های دیگر انجام نمی شود (بخش 11).
- باشگاه مربی دیگر: `403`.
- ساعت نامعتبر: `400` با پیام «ساعت پایان باید بعد از ساعت شروع باشد».
- پاسخ: آبجکت `ClassSession`.

### 7.2 `GET /class-session`

لیست کلاس های همه باشگاه های مربی.

| پارامتر | نوع | الزامی | قاعده |
|---|---|---|---|
| `page` | number | خیر | پیش فرض 1 |
| `take` | number | خیر | پیش فرض 20 |
| `clubId` | uuid | خیر | فیلتر باشگاه |
| `search` | string | خیر | جستجو در نام کلاس |
| `isActive` | boolean | خیر | فیلتر وضعیت |
| `weekDay` | enum | خیر | فیلتر یک روز هفته |
| `sortBy` | enum | خیر | `createdAt`، `updatedAt`، `name`، `startTime` |
| `sortDirection` | enum | خیر | `asc` یا `desc` |

- پاسخ: آرایه `ClassSession` همراه `meta.pager`.
- تعداد هنرجوها در پاسخ نیست.
- فرانت یک صفحه `take=100` می خواند و «کلاس امروز» و جستجو را سمت کلاینت روی همان صفحه انجام می دهد؛ ارسال `weekDay` و `search` فقط وقتی لازم است که تعداد کلاس های مربی از ۱۰۰ بیشتر شود.

### 7.3 `GET /class-session/:id`

- کلاس همراه `club` و آرایه `students`.
- هر آیتم `students` شامل `student` کامل است.
- پاسخ فقط برای کلاس های مربی جاری؛ در غیر این صورت `403`.

```json
{
  "id": "uuid",
  "clubId": "uuid",
  "name": "کیوروگی آقایان",
  "weekDays": ["SATURDAY", "MONDAY", "WEDNESDAY"],
  "startTime": "17:30",
  "endTime": "19:00",
  "isActive": true,
  "club": { "id": "uuid", "name": "باشگاه بلوار مارلیک", "gender": "MALE" },
  "students": [
    { "id": "uuid", "classSessionId": "uuid", "studentId": "uuid", "student": { "fullName": "علی رضایی" } }
  ]
}
```

### 7.4 `PATCH /class-session/:id`

همه فیلدها اختیاری اند:

| فیلد | نوع | الزامی | قاعده |
|---|---|---|---|
| `name` | string | خیر | 2 تا 80 |
| `weekDays` | enum[] | خیر | آرایه غیرخالی |
| `startTime` | string | خیر | `HH:mm` |
| `endTime` | string | خیر | `HH:mm` |

- **`clubId` قابل تغییر نیست.**
- اگر فقط یکی از ساعت ها ارسال شود، ساعت دیگر از مقدار فعلی خوانده و بازه بررسی می شود.
- پاسخ: آبجکت `ClassSession`.

### 7.5 `PATCH /class-session/:id/status`

| فیلد | نوع | الزامی |
|---|---|---|
| `isActive` | boolean | بله |

### 7.6 `DELETE /class-session/:id`

- حذف نرم است و فقط `isActive=false` می کند.
- پاسخ: پیام «کلاس با موفقیت غیرفعال شد» و آبجکت کلاس.

### 7.7 `GET /class-session/:id/students`

- لیست صفحه بندی شده اعضای کلاس.
- هر آیتم شامل `student` کامل.
- پارامترها: `page` و `take`.
- ترتیب: `createdAt` نزولی.

### 7.8 `POST /class-session/:id/students`

| فیلد | نوع | الزامی | قاعده |
|---|---|---|---|
| `studentIds` | uuid[] | بله | آرایه غیرخالی؛ تکراری ها حذف می شوند |

پیش شرط ها:

- همه هنرجوها باید تحت نظر همین مربی باشند؛ در غیر این صورت `403`.
- همه هنرجوها باید عضو فعال باشگاه همین کلاس باشند؛ در غیر این صورت `403`.
- اگر همه از قبل عضو کلاس باشند: `409`.
- هنرجوهای تکراری در لیست ورودی نادیده گرفته می شوند.
- پاسخ: پیام موفقیت و آرایه عضویت ها همراه `student`.

نکته UI: چون عضویت باشگاه پیش شرط این مسیر است، شیت «افزودن هنرجو به کلاس» در صفحه جزئیات کلاس برای هر هنرجوی انتخاب شده اول `POST /club/:id/students` را صدا می زند (و `409` یعنی «قبلا عضو است» را نادیده می گیرد) و بعد `POST /class-session/:id/students` را. حضور و غیاب هم فقط هنرجوهای عضو کلاس را نشان می دهد، پس تخصیص به کلاس همان مسیر اضافه شدن به لیست حضور است.

### 7.9 `DELETE /class-session/:id/students/:studentId`

- عضویت هنرجو در کلاس حذف می شود.
- اگر عضو نباشد: `404`.
- پاسخ: `200` با `data: {}`.

---

## 8. حضور و غیاب

### 8.1 `GET /attendance/class/:classSessionId/daily?date=YYYY-MM-DD`

- `date` الزامی است.
- لیست هنرجوهای کلاس همراه رکورد حضور همان تاریخ.
- هر آیتم: عضویت کلاس + `student` کامل + `attendance` که می تواند `null` باشد.

```json
{
  "id": "uuid",
  "classSessionId": "uuid",
  "studentId": "uuid",
  "student": { "id": "uuid", "fullName": "علی رضایی" },
  "attendance": {
    "id": "uuid",
    "classSessionId": "uuid",
    "studentId": "uuid",
    "sessionDate": "2026-08-23T00:00:00.000Z",
    "status": "PRESENT",
    "note": null
  }
}
```

- این مسیر برای صفحه ثبت حضور و غیاب (`/coach/sessions/[id]/attendance`) مناسب است.
- اگر کلاس مال مربی نباشد: `403`.

### 8.2 `GET /attendance/class/:classSessionId?date=YYYY-MM-DD`

- رفتار یکسان با مسیر قبلی، با این تفاوت که `date` اختیاری است.
- اگر `date` ارسال نشود، `attendance` همه ردیف ها `null` است.

### 8.3 `PUT /attendance/class/:classSessionId`

ثبت یا به روزرسانی حضور و غیاب یک تاریخ. عملیات upsert است و رکورد تکراری نمی سازد.

بدنه:

| فیلد | نوع | الزامی | قاعده |
|---|---|---|---|
| `sessionDate` | string | بله | میلادی |
| `items` | array | بله | آرایه غیرخالی |
| `items[].studentId` | uuid | بله | باید عضو کلاس باشد |
| `items[].status` | enum | بله | `PRESENT`، `LATE`، `ABSENT`، `EXCUSED` |
| `items[].note` | string یا null | خیر | حداکثر 500 کاراکتر |

- اگر یکی از هنرجوها عضو کلاس نباشد: `403`.
- بعد از ذخیره، رکوردهای همان کلید یکتا (`classSessionId + studentId + sessionDate`) به روز می شوند.
- اگر `note` در یک آیتم نیاید، توضیح قبلی همان رکورد دست نمی خورد؛ برای پاک کردن توضیح باید `note: null` فرستاده شود. فرانت همین کار را می کند و توضیح خالی را `null` می فرستد.
- پاسخ: پیام «حضور و غیاب با موفقیت ثبت شد» و آرایه رکوردهای ذخیره شده.

### 8.4 `GET /attendance/student/:studentId`

گزارش حضور و غیاب یک هنرجو.

| پارامتر | نوع | الزامی | قاعده |
|---|---|---|---|
| `page` | number | خیر | پیش فرض 1 |
| `take` | number | خیر | پیش فرض 20 |
| `clubId` | uuid | خیر | فیلتر باشگاه |
| `classSessionId` | uuid | خیر | فیلتر کلاس |
| `from` | string | خیر | تاریخ میلادی شروع |
| `to` | string | خیر | تاریخ میلادی پایان |
| `status` | enum | خیر | فیلتر وضعیت |
| `sortBy` | enum | خیر | `sessionDate`، `createdAt`، `updatedAt` |
| `sortDirection` | enum | خیر | `asc` یا `desc` |

- هر رکورد شامل `classSession` و `club` آن است.
- اگر `from` بزرگ تر از `to` باشد: `400`.
- هنرجو باید تحت نظر مربی باشد؛ در غیر این صورت `403`.

### 8.5 `GET /attendance/student/:studentId/summary`

پارامترها: `clubId`، `classSessionId`، `from`، `to` (همه اختیاری).

پاسخ:

```json
{
  "total": 48,
  "present": 40,
  "late": 3,
  "absent": 3,
  "excused": 2
}
```

- این مسیر برای کارت خلاصه حضور در پروفایل هنرجو مناسب است.
- درصد حضور توسط فرانت از `present / total` محاسبه می شود؛ سرور درصد نمی دهد.

### 8.6 `GET /attendance/coach/summary`

خلاصه حضور هفتگی همه کلاس های مربی جاری. نقش `COACH` لازم است و پارامتری ندارد.

هفته از شنبه شروع می شود و هفته جاری با هفته قبل مقایسه می شود. «حاضر» شامل `PRESENT` و `LATE` است.

```json
{
  "thisWeek": { "present": 32, "total": 40 },
  "lastWeek": { "present": 28, "total": 38 },
  "days": [
    { "weekDay": "SATURDAY", "present": 8, "total": 10, "previousPresent": 7, "previousTotal": 10 },
    { "weekDay": "SUNDAY", "present": 0, "total": 0, "previousPresent": 0, "previousTotal": 0 }
  ]
}
```

- `days` همیشه هفت عضو از شنبه تا جمعه دارد؛ روزهای بدون رکورد مقدار صفر دارند.
- این مسیر جای `GET /attendance/student/:id/summary` را در سطح مربی می گیرد و برای نمودار و درصد حضور داشبورد استفاده می شود.

---

## 9. کمربندها و آزمون های کمربند

### 9.1 `GET /belt`

لیست صفحه بندی شده کمربندها. هر کاربر وارد شده می تواند بخواند.

| پارامتر | نوع | الزامی | قاعده |
|---|---|---|---|
| `page` | number | خیر | پیش فرض 1 |
| `take` | number | خیر | پیش فرض 20 |
| `name` | enum | خیر | فیلتر نام کمربند |
| `includeNextBelt` | boolean | خیر | افزودن آبجکت کمربند بعدی |
| `sortBy` | enum | خیر | `level`، `order`، `createdAt`، `updatedAt` |
| `sortDirection` | enum | خیر | `asc` یا `desc` |

نمونه آیتم:

```json
{
  "id": "uuid",
  "name": "GREEN",
  "level": 3,
  "order": 3,
  "rankType": "COLOR",
  "rank": null,
  "color": "Green",
  "colorHex": "#00FF00",
  "description": null,
  "requirements": null,
  "minAge": null,
  "maxAge": null,
  "durationMonth": 4,
  "stripeCount": null,
  "nextBeltId": "uuid"
}
```

- فرم تخصیص کمربند (`/coach/students/[id]/belt`) باید `beltId` را از همین مسیر بگیرد.
- این فرم فقط کمربند بعدی هنرجو را نشان می دهد و لیست 19تایی `BeltName` را نمایش نمی دهد.
- زنجیره ارتقا در فرانت (`nextStudentBelt`): سفید → زرد → سبز → آبی → قرمز؛ قرمز → پوم 1 برای 15 سال و کمتر یا دان 1 برای بالای 15 سال؛ پوم و دان هر یک درجه بالاتر؛ پوم 4 به دان 4 تبدیل می شود و دان 10 پایان زنجیره است.
- توجه: سید فعلی `nextBeltId` را به صورت خطی و متناوب بین پوم و دان پر می کند (مثلا دان 2 → پوم 3). به همین دلیل فرانت `nextBeltId` را مبنا نمی گیرد و مثل `nextStudentBelt` از کمربند فعلی و سن هنرجو استفاده می کند؛ لیست `GET /belt` فقط برای تبدیل نام کمربند به `beltId` خوانده می شود.

### 9.2 `GET /belt/:id`

جزئیات یک کمربند.

### 9.3 `GET /belt-exam`

لیست آزمون های کمربند. هر کاربر وارد شده می تواند بخواند.

پارامترها: `page`، `take`، `name`، `genders` (آرایه)، `eventPlaces` (آرایه)، `registerDate`، `eventDate`، `beltIds` (آرایه uuid)، `includeBelt` (بولین)، `sortBy` (`registerDate`، `eventDate`، `createdAt`، `updatedAt`)، `sortDirection`.

- این مسیر برای کارت «آزمون های کمربند» در داشبورد قابل استفاده است.
- `eventDate` و `registerDate` فیلتر تساوی دقیق هستند و فیلتر بازه (از تاریخ) ندارند؛ پس آزمون های گذشته با پارامتر حذف نمی شوند.
- **وضعیت فرانت:** داشبورد ۲۰ آزمون جدیدتر را با `sortBy=eventDate&sortDirection=desc` می خواند، آزمون های امروز به بعد را در فرانت نگه می دارد، صعودی مرتب می کند و سه مورد اول را نشان می دهد.
- **محدودیت:** اگر بیش از ۲۰ آزمون آینده ثبت شود، نزدیک ترین آزمون ها ممکن است در صفحه اول نباشند.

### 9.4 `GET /belt-exam/:id`

جزئیات آزمون همراه `belts`.

### 9.5 مسیرهای ادمین

| متد | مسیر | نقش |
|---|---|---|
| `POST` | `/belt` | ADMIN |
| `PATCH` | `/belt/:id` | ADMIN |
| `PUT` | `/belt/:id/next-belt` | ADMIN |
| `DELETE` | `/belt/:id` | ADMIN |
| `POST` | `/belt-exam` | ADMIN |
| `PATCH` | `/belt-exam/:id` | ADMIN |
| `DELETE` | `/belt-exam/:id` | ADMIN |

مربی از این مسیرها استفاده نمی کند.

---

## 10. نگاشت صفحه های فرانت به API

| صفحه | مسیر API | وضعیت داده فعلی |
|---|---|---|
| `/coach` داشبورد | `GET /class-session?page=1&take=100` (شمارش هر کلاس امروز از `GET /class-session/:id/students?take=1`)، `GET /club`، `GET /student/stats`، `GET /attendance/coach/summary`، `GET /student-coach-invitation/sent` و `GET /belt-exam` | وصل؛ کلاس های امروز، کاشی ها، درصد و نمودار حضور دو هفته، دعوت نامه های در انتظار و آزمون های نزدیک از سرور |
| `/coach/students` | `GET /student` و `GET /student/stats` | وصل؛ فیلتر و مرتب سازی در URL و آمار کارت ها از `GET /student/stats` |
| `/coach/students/new` | `POST /student` | وصل؛ react-hook-form و zod، تبدیل تاریخ شمسی به میلادی |
| `/coach/students/[id]` | `GET /student/:id`، `GET /student?search=&take=1`، `GET /attendance/student/:id/summary`، `GET /attendance/student/:id?page=1&take=100`، `GET /club/by-student/:id`، `DELETE /student/:id` | وصل؛ کمربند، `nextBeltDate` و قد/وزن از آیتم لیست با همان کد ملی خوانده می شود (بخش 11.1)؛ کارت بیمه رنگ و وضعیت می دهد، کارت کمربند گیج دایره‌ای پیشرفت از `beltDate` تا `nextBeltDate` کنار کمربند فعلی و بعدی می سازد (کمربند بعدی سمت کلاینت از `nextStudentBelt` و سن هنرجو) و نمودار ماهانه حضور از همان رکوردهای `take=100`؛ «حذف» واقعی است و `403` حساب فعال را با پیام سرور نشان می دهد |
| `/coach/students/[id]/edit` | `GET /student/:id` و `PATCH /student/:id` | وصل؛ مقادیر از پرونده واقعی پر می شود و کمربند/تاریخ کمربند/قد/وزن در ویرایش نمایش داده نمی شوند چون `PATCH` آن ها را نمی پذیرد |
| `/coach/students/[id]/belt` | `GET /student/:id`، `GET /belt?page=1&take=100&sortBy=level&sortDirection=asc` و `PATCH /student/:id/belt` | وصل؛ کمربند بعدی از قاعده سنی `nextStudentBelt` و شناسه آن از لیست کمربندها؛ تاریخ شمسی به میلادی تبدیل می شود |
| `/coach/students/[id]/attendance` | `GET /attendance/student/:id/summary` و `GET /attendance/student/:id?page=1&take=100` | وصل؛ خلاصه از `summary` و رکوردها یک صفحه ۱۰۰ تایی، گروه بندی ماهانه و فیلتر وضعیت سمت کلاینت |
| `/coach/students/invite` | `POST /student-coach-invitation` | وصل؛ ارسال با کد ملی و فهرست دعوت نامه های اخیر از `GET /student-coach-invitation/sent` |
| `/coach/invitations` | `GET /student-coach-invitation/sent` | وصل؛ آمار و ردیف ها از سرور |
| `/coach/clubs` | `GET /club` و `GET /club/:id/students?take=1` | وصل؛ شمارش هنرجو از `meta.pager.total` و آمار کلاس حذف شد |
| `/coach/clubs/new` | `POST /club` | وصل؛ react-hook-form و zod |
| `/coach/clubs/[id]` | `GET /club/:id`، `GET /club/:id/students`، `PATCH /club/:id/status`، `GET /class-session` | وصل؛ کلاس های باشگاه از `GET /class-session` و شمارش هنرجوی هر کلاس از `GET /class-session/:id/students?take=1` |
| `/coach/clubs/[id]/edit` | `GET /club/:id` و `PATCH /club/:id` | وصل؛ react-hook-form و zod |
| `/coach/sessions` | `GET /class-session` | وصل؛ نام باشگاه از `GET /club` و شمارش هنرجو از `GET /class-session/:id/students?take=1` |
| `/coach/sessions/new` | `POST /class-session` | وصل؛ react-hook-form و zod، `clubId` از `GET /club` |
| `/coach/sessions/[id]` | `GET /class-session/:id`، `POST /club/:id/students` و `POST /class-session/:id/students` | وصل؛ roster از `students[].student.fullName` در همان پاسخ؛ دکمه «افزودن» با شیت انتخاب هنرجو اول عضویت باشگاه و بعد عضویت کلاس را می نویسد |
| `/coach/sessions/[id]/edit` | `GET /class-session/:id` و `PATCH /class-session/:id` | وصل؛ `clubId` فقط در ساخت خوانده می شود، در ویرایش غیرفعال است |
| `/coach/sessions/[id]/attendance` | `GET /attendance/class/:id/daily?date=`، `GET /class-session/:id` و `PUT /attendance/class/:id` | وصل؛ تاریخ پیش فرض امروز و وضعیت/توضیح هر هنرجو از رکورد همان تاریخ؛ ذخیره با `note: null` برای توضیح پاک شده |
| `/coach/sessions/[id]/report` | `GET /attendance/class/:id?date=` و `GET /class-session/:id` | وصل؛ تاریخ از `?date=` و آمار روی رکوردهای ذخیره شده همان تاریخ |
| `/coach/profile` | `GET /auth/profile`، `GET /notifications/unread-count` و `POST /auth/logout` | وصل؛ اطلاعات، موبایل، کمربند و شمارنده اعلان از سرور |
| `/coach/profile/edit` | `GET /auth/profile` و `PATCH /coach/:id` | وصل؛ react-hook-form و zod؛ تغییر جنسیت غیرفعال است چون با داشتن باشگاه یا هنرجو `400` می دهد |
| `/coach/settings` | `GET /notifications/unread-count` | وصل؛ حالت نمایش و رنگ محلی است و فقط شمارنده اعلان از سرور خوانده می شود |
| `/coach/settings/appearance` | — | فقط `localStorage` (`ty-theme`، `ty-accent` و `ty-radius`) و متغیر `--radius`؛ بدون درخواست سرور |
| `/coach/settings/security` | `GET /sessions?page=1&take=50&isActive=true/false`، `DELETE /sessions/:id`، `DELETE /sessions` | وصل؛ نشست فعلی از `sessionId` داخل access token و لغو همه نشست فعلی را هم باطل می کند (بخش 11.16) |
| `/coach/notifications` | `GET /notifications?page=1&take=100&sortBy=sentAt&sortDirection=desc`، `PATCH /notifications/read-all`، `GET /notifications/unread-count` | وصل؛ فیلتر خوانده نشده و نوع در کلاینت اعمال می شود (بخش 11.15) |

---

## 11. شکاف های بک اند برای مرحله اتصال

موارد زیر در بک اند فعلی وجود ندارند یا برای UI کافی نیستند. تا قبل از رفع آن ها، صفحه های مربوطه باید داده نمایشی داشته باشند یا از ترکیب چند درخواست ساخته شوند.

### 11.1 کمربند و متریک هنرجو در پاسخ جزئیات

- `GET /student` اکنون `currentBelt.belt` و آخرین `metrics` را برمی گرداند (بخش 4.2).
- `GET /student/:id` همچنان فقط ستون های جدول `Student` را برمی گرداند؛ `currentBelt`، `metrics`، `beltHistory` و `clubMemberships` در آن نیستند.
- هیچ مسیر `GET` برای تاریخچه کمربند یا متریک ها وجود ندارد.
- **اثر:** تاریخچه کمربند در دسترس نیست و فرم ویرایش هم نمی تواند کمربند یا قد/وزن را از `GET /student/:id` بخواند.
- **وضعیت فرانت (تست شده):** صفحه پرونده هنرجو برای پوشش همین شکاف دو درخواست می زند: `GET /student/:id` برای ستون ها و `GET /student?search=&take=1` با کد ملی همان هنرجو (یکتا و تحت نظر مربی) برای `currentBelt` (نام، `beltDate` و `nextBeltDate`) و آخرین `metrics`. قد و وزن `Decimal` سرور هستند و ممکن است رشته یا عدد برسند؛ مقدار نامعتبر در UI «ثبت نشده» می شود.
- **اثر بر نمودار:** چون `metrics` فقط آخرین رکورد را برمی گرداند (`take: 1`، بخش 4.2)، برای قد و وزن سابقه ای وجود ندارد که بتوان نمودار زد. نمودار پرونده هنرجو روند حضور و غیاب ماهانه است که از همان `GET /attendance/student/:id` ساخته می شود.
- **پیشنهاد:** همان `include` لیست را به `findOneById` هم اضافه کنید، یا `GET /student/:id/belt` و `GET /student/:id/metrics` بسازید.

### 11.2 آمار داشبورد

بیشتر کارت های داشبورد با ترکیب مسیرهای موجود ساخته می شوند و مسیر تجمیعی لازم نیست:

- تعداد کلاس های امروز: `GET /class-session` و فیلتر `weekDays` در فرانت
- تعداد هنرجوهای فعال: `GET /student/stats`
- درصد و روند حضور هفتگی: `GET /attendance/coach/summary` (بخش 8.6)
- آزمون های کمربند نزدیک: `GET /belt-exam`
- خلاصه دعوت نامه های در انتظار: `GET /student-coach-invitation/sent`

- **وضعیت فرانت:** همه موارد بالا وصل هستند. تنها هزینه باقی مانده، چند درخواست موازی در بارگذاری داشبورد و شمارش هنرجوی هر کلاس با `?take=1` است.

### 11.3 شمارش کلاس و هنرجوی باشگاه

- `GET /club` تعداد کلاس و هنرجو را برنمی گرداند.
- `GET /class-session` تعداد هنرجو را برنمی گرداند.
- برای شمارش باید همه صفحات `GET /club/:id/students` و `GET /class-session?clubId=` خوانده شوند.
- فرانت تا زمانی که این فیلد اضافه شود، برای هر باشگاه یک درخواست `GET /club/:id/students?take=1` و برای هر کلاس یک درخواست `GET /class-session/:id/students?take=1` می فرستد (N+1) و هر شمارش را در کلید Cache خودش نگه می دارد.
- **پیشنهاد:** افزودن `_count` یا فیلدهای `classesCount` و `studentsCount` به پاسخ باشگاه و `studentsCount` به پاسخ کلاس.

### 11.4 آپلود تصویر وجود ندارد

- فیلدهای `image` و `imageKey` رشته خام هستند و هیچ مسیری برای آپلود فایل وجود ندارد.
- **اثر:** `PhotoPicker` در ثبت نام و فرم باشگاه نمی تواند واقعا تصویر ذخیره کند.
- **پیشنهاد:** افزودن `POST /upload` یا سرویس storage و برگرداندن `imageKey`.

### 11.5 ویرایش تصویر هنرجو

- `UpdateStudentDto` فیلد `imageKey` ندارد.
- عکس هنرجو فقط هنگام ساخت اولیه یا ثبت نام قابل تنظیم است و بعد از آن قابل تغییر نیست.
- **پیشنهاد:** افزودن `imageKey` به `UpdateStudentDto`.

### 11.6 ویرایش قد و وزن

- `UpdateStudentDto` فیلد `height` و `weight` ندارد.
- تنها راه ثبت قد و وزن، ساخت هنرجوی جدید یا ثبت نام است.
- **پیشنهاد:** افزودن مسیر `POST /student/:id/metrics` برای ثبت اندازه گیری جدید.

### 11.7 فیلترهای لیست هنرجو

کمربند، رده سنی، وضعیت بیمه و جنسیت در `GET /student` اضافه شدند (بخش 4.2). فیلترهای زیر همچنان وجود ندارند:

- باشگاه
- کلاس

همچنین مرتب سازی روی روابط، در حالت `desc` هنرجویان بدون مقدار (کمربند یا بیمه) را اول می آورد.

### 11.8 تداخل زمانی کلاس

سرور فقط `startTime < endTime` را بررسی می کند و تداخل دو کلاس در یک باشگاه یا روز را رد نمی کند.

**پیشنهاد:** بررسی همپوشانی `weekDays` و بازه ساعت در `create` و `update`.

### 11.9 ظرفیت کلاس

مدل `ClassSession` فیلد ظرفیت ندارد. اگر طراحی به «ظرفیت» نیاز دارد، باید به مدل و DTO اضافه شود.

### 11.10 حذف باشگاه

مسیر `DELETE /club/:id` وجود ندارد. تنها راه، `PATCH /club/:id/status` با `isActive=false` است.

### 11.11 لغو دعوت نامه

مربی نمی تواند دعوت نامه `PENDING` را لغو کند. فقط هنرجو می تواند تایید یا رد کند.

**پیشنهاد:** افزودن `DELETE /student-coach-invitation/:id` یا `PATCH .../cancel` برای مربی.

### 11.12 دعوت نامه فقط با کد ملی و پروفایل موجود

- ارسال دعوت با شماره موبایل ممکن نیست.
- اگر هنرجو پروفایل نداشته باشد، `POST /student-coach-invitation` خطای `404` می دهد.
- برای ساخت پروفایل جدید باید از `POST /coach/students` استفاده شود که در صورت نبود هنرجو، پروفایل می سازد.

### 11.13 تاریخچه کمربند

مدل `BeltHistory` وجود دارد و در تخصیص کمربند پر می شود، ولی هیچ مسیر `GET` برای خواندن تاریخچه وجود ندارد.

### 11.14 گزارش جلسه

- `GET /class-session/:id` لیست هنرجوها را می دهد.
- `GET /attendance/class/:id?date=` وضعیت یک تاریخ را می دهد.
- مسیر تجمیعی برای «گزارش یک جلسه» با درصد حضور و خلاصه وضعیت ها وجود ندارد؛ باید در فرانت از پاسخ حضور محاسبه شود.

### 11.15 اعلان ها

ماژول `notification` وجود دارد و در پنل مربی وصل شده است: `GET /notifications?page=1&take=100&sortBy=sentAt&sortDirection=desc` صفحه اعلان ها را با `id`، `type`، `title`، `body`، `isRead`، `readAt`، `sentAt` و `createdAt` می دهد، `GET /notifications/unread-count` مقدار `{ unreadCount }` را برمی گرداند و `PATCH /notifications/read-all` همه را خوانده می کند. `QueryNotificationDto` مقدار `isRead` و `type` را از query به boolean/enum تبدیل نمی کند، بنابراین صفحه یک صفحه ۱۰۰ تایی می گیرد و فیلتر «خوانده نشده» و نوع را سمت کلاینت اعمال می کند؛ `shortcut` مربوطه در `notification-api.ts` ثبت شده است.

### 11.16 نشست ها و دستگاه ها

- `GET /sessions?page=1&take=50&isActive=true|false` لیست نشست ها را با `ipAddress`، `userAgent`، `platform`، `expiresAt`، `lastUsedAt` و `revokedAt` می دهد. `DELETE /sessions/:id` یک نشست و `DELETE /sessions` با `{ confirm: true }` همه نشست ها را لغو می کند.
- `QuerySessionDto` برای `isActive` مقدار پیش فرض ندارد و `@Transform` مقدار غایب را `false` می کند؛ در نتیجه درخواست بدون `isActive` فقط نشست های لغو شده را برمی گرداند. لایه فرانت هر دو حالت را می گیرد و نتیجه را ادغام می کند تا نشست فعلی و تاریخچه با هم دیده شوند. سرویس بک اند `exceptSessionId` را می پذیرد ولی کنترلر آن را پر نمی کند، پس «لغو همه نشست ها» نشست فعلی را هم باطل می کند و کاربر باید دوباره وارد شود.

---

## 12. نمونه های آماده برای مرحله اتصال

### 12.1 ثبت باشگاه

```http
POST /api/v1/club
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "باشگاه بلوار مارلیک",
  "address": "تهران، بلوار مارلیک"
}
```

```json
{
  "success": true,
  "statusCode": 201,
  "message": "باشگاه با موفقیت ایجاد شد",
  "data": {
    "id": "uuid",
    "coachId": "uuid",
    "name": "باشگاه بلوار مارلیک",
    "gender": "MALE",
    "imageKey": null,
    "address": "تهران، بلوار مارلیک",
    "isActive": true,
    "createdAt": "2026-10-21T10:00:00.000Z",
    "updatedAt": "2026-10-21T10:00:00.000Z"
  },
  "timestamp": "2026-10-21T10:00:00.000Z",
  "path": "/api/v1/club"
}
```

### 12.2 ثبت کلاس

```http
POST /api/v1/class-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "clubId": "uuid",
  "name": "کیوروگی آقایان",
  "weekDays": ["SATURDAY", "MONDAY", "WEDNESDAY"],
  "startTime": "17:30",
  "endTime": "19:00"
}
```

### 12.3 ثبت هنرجو

```http
POST /api/v1/student
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "علی رضایی",
  "nationalCode": "0012345678",
  "gender": "MALE",
  "birthDate": "2010-03-15",
  "belt": "WHITE",
  "beltDate": "2024-06-15",
  "province": "TEHRAN",
  "fatherName": "محمد رضایی",
  "phoneNumber": "09123456789",
  "height": 170,
  "weight": 60
}
```

### 12.4 ثبت حضور و غیاب

```http
PUT /api/v1/attendance/class/<classSessionId>
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionDate": "2026-08-23",
  "items": [
    { "studentId": "uuid-1", "status": "PRESENT" },
    { "studentId": "uuid-2", "status": "LATE", "note": "15 دقیقه دیر رسید" },
    { "studentId": "uuid-3", "status": "ABSENT" }
  ]
}
```

### 12.5 تخصیص کمربند

```http
PATCH /api/v1/student/<studentId>/belt
Authorization: Bearer <token>
Content-Type: application/json

{
  "beltId": "uuid",
  "beltDate": "2026-08-23"
}
```

### 12.6 ارسال دعوت نامه

```http
POST /api/v1/student-coach-invitation
Authorization: Bearer <token>
Content-Type: application/json

{
  "nationalCode": "0012345678"
}
```

---

## 13. چک لیست مرحله اتصال

- [ ] تبدیل تاریخ شمسی به میلادی قبل از هر ارسال
- [ ] نگه داشتن `accessToken` و `refreshToken` و پیاده سازی صف refresh
- [ ] ساخت لایه سرویس برای هر ماژول: `auth`، `coach`، `student`، `club`، `class-session`، `attendance`، `invitation`، `belt`
- [ ] استفاده از `meta.pager` برای صفحه بندی و نام گذاری `perPage`
- [ ] گرفتن `beltId` از `GET /belt` برای فرم تخصیص کمربند
- [ ] استفاده از `GET /auth/profile` برای پروفایل مربی
- [ ] استفاده از `GET /class-session?weekDay=` برای کلاس امروز
- [ ] استفاده از `GET /attendance/class/:id/daily?date=` برای فرم حضور
- [ ] تعیین تکلیف شکاف های بخش 11 با تیم بک اند قبل از اتصال کامل
