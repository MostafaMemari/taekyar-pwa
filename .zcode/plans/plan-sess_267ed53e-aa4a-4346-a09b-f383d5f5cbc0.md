## Context

حذف باشگاه/کلاس الان یا وجود ندارد یا دروغ می گوید: `DELETE /class-session/:id` پشت صحنه فقط `isActive: false` می گذارد و باشگاه اصلا endpoint حذف ندارد. تصمیم تایید شده: حذف واقعی فقط وقتی رکورد «یک بار مصرف» (پول و حضور) وجود ندارد؛ عضوها/کلاس ها/رسترو فقط تنظیمات اند و با تایید آبشار می شوند. غیرفعال کردن به قوت خودش می ماند.

## بک اند (taekyar-backend)

**1. کلاس — `src/modules/class-session/`:**
- `services/class-session.service.ts` → `remove()`: به جای soft-disable، guard واقعی + حذف. `PrismaService` را inject کن (الگوی موجود: `coach.service.ts assertGenderIsChangeable`) و `attendance.count({ where: { classSessionId: id } })` بگیر؛ اگر > 0 → `BadRequestException(ClassSessionMessages.HAS_ATTENDANCE)`. بعد `this.classSessionRepository.delete({ where: { id } })` (متد موجود در repository) و خروجی `{ message }`.
- `enums/class-session.messages.enum.ts`: متن `REMOVE_SUCCESS` شود «کلاس با موفقیت حذف شد» + پیام جدید `HAS_ATTENDANCE = 'این کلاس سابقه حضور و غیاب ثبت شده دارد و قابل حذف نیست'`.
- کنترلر دست نمی خورد (`@Delete(':id')` موجود است).

**2. باشگاه — `src/modules/club/`:**
- `services/club.service.ts`: `PrismaService` + `StorageService` (هر دو global، الگوی established) inject کن و متد `remove(user, id)` اضافه کن: `findOneById` (ownership موجود) → دو شمارش با `Promise.all`: `prisma.feePayment.count({ where: { period: { clubId } } })` (هر سه status — مسیر period.clubId مستقیم است، بدون نیاز به FeeModule) و `prisma.attendance.count({ where: { classSession: { clubId } } })` → هر کدام > 0 بود BadRequest با پیام خودش → `storage.remove(club.imageKey).catch(() => undefined)` اگر imageKey بود → `clubRepository.delete({ where: { id } })` → `{ message: ClubMessages.DELETE_SUCCESS }`. helper خصوصی به سبک `assertGenderIsChangeable`.
- `enums/club.messages.enum.ts`: `DELETE_SUCCESS = 'باشگاه حذف شد'`، `HAS_PAYMENTS = 'این باشگاه پرداخت شهریه ثبت شده دارد و قابل حذف نیست'`، `HAS_ATTENDANCE = 'این باشگاه سابقه حضور و غیاب ثبت شده دارد و قابل حذف نیست'`.
- `controllers/club.controller.ts`: `@Delete(':id')` با `@Roles(Role.COACH)` و `@ApiOkResponse()` (الگوی class-session؛ @Delete بدون @ApiConsumes).

**3. چک:** `npx tsc --noEmit` باید سبز شود.

## فرانت (taekyar-pwa)

**1. کلاس — UI موجود فقط صادقانه می شود:**
- `components/sessions/session-detail-actions.tsx`: متن هشدار SheetFrame حذف به روز شود (رسترو از دست می رود، نه سابقه حضور): «با حذف {name}، هنرجوهای ثبت شده در آن از کلاس حذف می شوند. کلاسی که سابقه حضور و غیاب داشته باشد حذف نمی شود». خطای 400 بک اند همانجا inline نمایش داده می شود (الگوی موجود). toast موفقیت بماند.

**2. باشگاه — از صفر (الگوی session-detail-actions):**
- `lib/club-api.ts`: `deleteClub(id)` با `authRequest(..., { method: "delete" })`.
- `hooks/use-club-mutations.ts`: `useDeleteClub` (الگوی `useDeleteSession`) → بعد از حذف: filter-mutate روی `club`، `session`، `student` و `attendance`.
- کامپوننت جدید `components/clubs/club-detail-actions.tsx` (یک export به ازای فایل): دکمه Ellipsis در `action` اسلات `ClubBand` (prop از قبل هست ولی بلااستفاده) + `CoachActionMenu` با آیتم `{ icon: Trash2, label: "حذف باشگاه", tone: "danger" }` + SheetFrame تایید «حذف باشگاه» با باکس danger: «با حذف {name}، همه کلاس ها و اعضای آن حذف می شوند. باشگاهی که پرداخت یا سابقه حضور و غیاب داشته باشد حذف نمی شود. این کار قابل بازگشت نیست» + دکمه destructive «حذف باشگاه» با Loader2 + خطای inline. catch: 401 → /login، بقیه toast.error.
- `components/clubs/club-detail.tsx`: host کن (الگوی session-detail: menuOpen state + navigate به `/coach/clubs` بعد از حذف موفق).
- `hooks/use-session-mutations.ts`: به `useDeleteSession` شاخه attendance هم اضافه شود (cache داشبورد غیبت ها کهنه نشود).

## مستندات

- `docs/coach-api.md`: توضیح `DELETE /class-session/:id` اصلاح شود (حذف واقعی + شرط + پیام 400) و بخش جدید `DELETE /club/:id` (شرط های guard، پیام ها، پاک شدن عکس storage، آبشار اعضا و کلاس ها) + ردیف های نگاشت صفحه ها.
- `AGENTS.md`: جمله «There is no `DELETE /club/:id`, so «حذف» is the reversible isActive toggle» در بولت clubs به روز شود (حذف واقعی با guard + غیرفعال کردن برای کار روزمره).

## اعتبارسنجی

- بک اند: `npx tsc --noEmit` (exit 0)
- فرانت: `npx biome check --write` روی فایل های لمس شده + `npm run build`
- تست مرورگر انجام نمی شود (طبق روال، مگر بخواهی)