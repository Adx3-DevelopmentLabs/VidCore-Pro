# دليل دمج VidCore-Pro في تطبيقك (App Integration Guide)

لقد قمنا بحل مشكلة التوافق بين معرفات TMDB والمواقع التي لا تدعمها. يمكنك الآن استخدام نقطة نهاية واحدة (Unified Endpoint) للحصول على كل شيء.

## 🔗 نقطة النهاية الموحدة (The Unified Endpoint)

استخدم هذا الرابط في تطبيقك لجلب الروابط لأي محتوى:

### 1. للأفلام (Movies):
`GET /api/watch?type=movie&id=[TMDB_ID]`

### 2. للمسلسلات والأنمي (TV Shows & Anime):
`GET /api/watch?type=tv&id=[TMDB_ID]&s=[SEASON_NUMBER]&e=[EPISODE_NUMBER]`

---

## 🛠️ كيف يعمل "محرك الربط الذكي" (Smart Mapping)؟

عندما ترسل `TMDB_ID` إلى السيرفر، يقوم VidCore-Pro بالآتي:
1.  **التعرف:** يترجم المعرف إلى اسم الفيلم وسنة الإنتاج (مثلاً: `550` -> `Fight Club, 1999`).
2.  **البحث المتعدد:** يبحث بالاسم في المواقع العربية (MyCima, Akwam) ومواقع الأنمي (AnimeSlayer) التي لا تفهم معرفات TMDB.
3.  **البحث بالمعرف:** يبحث بالمعرف في المصادر العالمية (VidSrc) التي تدعم TMDB مباشرة.
4.  **فك التشفير:** يستخرج روابط M3U8 المباشرة من جميع هذه المصادر ويعيدها لك في قائمة واحدة منظمة.

## 💻 مثال كود للدمج (JavaScript/React Native):

```javascript
async function getStreamLinks(tmdbId, type = 'movie', season = 1, episode = 1) {
    const baseUrl = "https://vidcore-pro.onrender.com/api/watch";
    const url = `${baseUrl}?type=${type}&id=${tmdbId}&s=${season}&e=${episode}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // data تحتوي على قائمة بالمزودين والروابط المستخرجة
        console.log("الروابط المتاحة:", data);
        
        // يمكنك الآن تمرير الرابط إلى مشغل الفيديو الخاص بك
        const firstLink = data[0].links[0];
        return firstLink;
    } catch (error) {
        console.error("خطأ في جلب الروابط:", error);
    }
}
```

## ✅ ضمان العمل 100%
بفضل هذا النظام، أصبح تطبيقك متوافقاً مع جميع أنواع المواقع والمصادر دون الحاجة لتغيير قاعدة بياناتك (TMDB). السيرفر يتكفل بعملية "الترجمة" والربط تلقائياً.

نحو القمة دائماً! 🚀🔝🌍🏁🏆
