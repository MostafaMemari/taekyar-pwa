# داکیومنت API مربی

مرجع کامل قرارداد بک اند برای تمام صفحه های نقش مربی. این فایل برای مرحله اتصال API نوشته شده است. در وضعیت فعلی، فرانت فقط UI است و هیچ درخواستی به بک اند ارسال نمی کند.

- منبع: پروژه `taekyar-backend` (NestJS + Prisma + PostgreSQL + Redis)
- نسخه API: `v1`
- پیشوند مسیر: `/api/v1`
- تاریخ بررسی: 1405/07/29 (2026-10-21)

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
  "createdAt": "...",
  "updatedAt": "..."
}
```

- اگر پروفایل هنوز ساخته نشده باشد، مقدار `data` برابر `null` است.
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
| `sortBy` | enum | خیر | `createdAt`، `updatedAt`، `fullName` |
| `sortDirection` | enum | خیر | `asc` یا `desc` (پیش فرض `desc`) |

پاسخ: آرایه `Student` همراه `meta.pager`.

نکته مهم: این پاسخ **کمربند، کلاس، باشگاه، وضعیت بیمه محاسبه شده و قد و وزن را شامل نمی شود**. برای لیست هنرجوها یا باید این اطلاعات از مسیرهای دیگر گرفته شود یا بک اند گسترش یابد (بخش 11).

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

نکته UI: فرم «ثبت هنرجوی جدید» فعلی از `POST /student` استفاده خواهد کرد. این مسیر برای سناریوی «افزودن سریع با کد ملی» مناسب است و در طراحی فعلی استفاده نمی شود.

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
- پاسخ: آبجکت `Club`.

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
- پاسخ: آبجکت `Club`.

### 6.5 `PATCH /club/:id/status`

| فیلد | نوع | الزامی |
|---|---|---|
| `isActive` | boolean | بله |

- پاسخ: آبجکت `Club`.
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
- برای فیلتر «کلاس امروز» در فرانت، `weekDay` امروز را محاسبه و ارسال کنید.

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
| `items[].note` | string | خیر | حداکثر 500 کاراکتر |

- اگر یکی از هنرجوها عضو کلاس نباشد: `403`.
- بعد از ذخیره، رکوردهای همان کلید یکتا (`classSessionId + studentId + sessionDate`) به روز می شوند.
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
  "colorHex": "#008000",
  "description": null,
  "requirements": null,
  "minAge": null,
  "maxAge": null,
  "durationMonth": 6,
  "stripeCount": null,
  "nextBeltId": "uuid"
}
```

- فرم تخصیص کمربند (`/coach/students/[id]/belt`) باید `beltId` را از همین مسیر بگیرد.
- فیلتر سمت فرانت برای کمربندهای قابل انتخاب هنرجو: 19 مقدار `BeltName`.

### 9.2 `GET /belt/:id`

جزئیات یک کمربند.

### 9.3 `GET /belt-exam`

لیست آزمون های کمربند. هر کاربر وارد شده می تواند بخواند.

پارامترها: `page`، `take`، `name`، `genders` (آرایه)، `eventPlaces` (آرایه)، `registerDate`، `eventDate`، `beltIds` (آرایه uuid)، `includeBelt` (بولین)، `sortBy` (`registerDate`، `eventDate`، `createdAt`، `updatedAt`)، `sortDirection`.

- این مسیر برای کارت «آزمون های کمربند» در داشبورد قابل استفاده است.
- در UI فعلی داده آزمون نمایشی است و به API وصل نیست.

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
| `/coach` داشبورد | `GET /class-session?weekDay=...`، `GET /student-coach-invitation/sent?status=PENDING` | نمایشی؛ آمار تجمیعی ندارد |
| `/coach/students` | `GET /student` | نمایشی؛ کمربند و کلاس از داده نمایشی |
| `/coach/students/new` | `POST /student` | فرم UI؛ بدون ارسال |
| `/coach/students/[id]` | `GET /student/:id`، `GET /attendance/student/:id/summary`، `GET /club/by-student/:id` | نمایشی |
| `/coach/students/[id]/edit` | `PATCH /student/:id` | فرم UI؛ بدون ارسال |
| `/coach/students/[id]/belt` | `GET /belt` و `PATCH /student/:id/belt` | فرم UI؛ بدون ارسال |
| `/coach/students/[id]/attendance` | `GET /attendance/student/:id` | نمایشی |
| `/coach/students/invite` | `POST /student-coach-invitation` | فرم UI؛ بدون ارسال |
| `/coach/invitations` | `GET /student-coach-invitation/sent` | نمایشی |
| `/coach/clubs` | `GET /club` | نمایشی؛ تعداد کلاس و هنرجو از API نمی آید |
| `/coach/clubs/new` | `POST /club` | فرم UI؛ بدون ارسال |
| `/coach/clubs/[id]` | `GET /club/:id`، `GET /club/:id/students`، `GET /class-session?clubId=` | نمایشی |
| `/coach/clubs/[id]/edit` | `PATCH /club/:id` | فرم UI؛ بدون ارسال |
| `/coach/sessions` | `GET /class-session` | نمایشی؛ تعداد هنرجو از API نمی آید |
| `/coach/sessions/new` | `POST /class-session` | فرم UI؛ بدون ارسال |
| `/coach/sessions/[id]` | `GET /class-session/:id` | نمایشی |
| `/coach/sessions/[id]/edit` | `PATCH /class-session/:id` | فرم UI؛ بدون ارسال |
| `/coach/sessions/[id]/attendance` | `GET /attendance/class/:id/daily?date=` و `PUT /attendance/class/:id` | نمایشی |
| `/coach/sessions/[id]/report` | `GET /attendance/class/:id?date=` | گزارش تجمیعی اختصاصی ندارد |
| `/coach/profile` | `GET /auth/profile` و `PATCH /coach/:id` | نمایشی |

---

## 11. شکاف های بک اند برای مرحله اتصال

موارد زیر در بک اند فعلی وجود ندارند یا برای UI کافی نیستند. تا قبل از رفع آن ها، صفحه های مربوطه باید داده نمایشی داشته باشند یا از ترکیب چند درخواست ساخته شوند.

### 11.1 کمربند و متریک هنرجو خوانده نمی شود

- `GET /student` و `GET /student/:id` فقط ستون های جدول `Student` را برمی گردانند.
- `currentBelt`، `metrics`، `beltHistory` و `clubMemberships` در پاسخ نیستند.
- هیچ مسیر `GET` برای کمربند فعلی یا تاریخ متریک ها وجود ندارد.
- **اثر:** لیست هنرجوها، پروفایل هنرجو و فرم ویرایش نمی توانند کمربند، قد، وزن و تاریخ کمربند را از API بگیرند.
- **پیشنهاد:** گسترش `findOneById` و `getAll` با `include` برای `currentBelt.belt` و آخرین `metrics`، یا افزودن `GET /student/:id/belt` و `GET /student/:id/metrics`.

### 11.2 آمار داشبورد وجود ندارد

هیچ مسیری برای موارد زیر نیست:

- تعداد کلاس های امروز
- تعداد هنرجوهای فعال
- درصد حضور هفتگی
- روند حضور هفته های قبل
- آزمون های کمربند نزدیک
- خلاصه دعوت نامه های در انتظار

**پیشنهاد:** یک مسیر تجمیعی مثل `GET /coach/dashboard` یا استفاده از چند درخواست لیست و محاسبه در فرانت. برای نمودار حضور، `GET /attendance/student/:id/summary` فقط یک هنرجو را پوشش می دهد و خلاصه کل مربی را نمی دهد.

### 11.3 شمارش کلاس و هنرجوی باشگاه

- `GET /club` تعداد کلاس و هنرجو را برنمی گرداند.
- `GET /class-session` تعداد هنرجو را برنمی گرداند.
- برای شمارش باید همه صفحات `GET /club/:id/students` و `GET /class-session?clubId=` خوانده شوند.
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

`GET /student` فقط `search` و مرتب سازی دارد. فیلترهای زیر وجود ندارند:

- کمربند
- جنسیت
- وضعیت بیمه
- باشگاه
- کلاس

**اثر:** فیلترهای صفحه لیست هنرجو در فرانت باید سمت کلاینت انجام شوند یا به API اضافه شوند.

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

ماژول `notification` وجود دارد، ولی در UI فعلی مربی استفاده نمی شود. اگر زنگ اعلان در هدر به آن وصل شود، باید مسیرهای `GET /notification` و علامت گذاری خوانده شده بررسی شوند. این بخش در دامنه این سند نیست.

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
