const stories = window.BOOK_STORIES || [];
const stats = window.BOOK_STATS || {};
let index = 0;
const storyOffset = 5; // cover + intro + stats + years + TOC
const finalPageIndex = storyOffset + stories.length;
const totalPages = stories.length + 6; // cover + intro + stats + years + TOC + stories + finale
const page = document.getElementById("page");
const counter = document.getElementById("counter");
const progressBar = document.getElementById("progressBar");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const themeBtn = document.getElementById("themeBtn");
const chapterNav = document.getElementById("chapterNav");
const giftIntro = document.getElementById("giftIntro");
const giftButton = document.getElementById("giftButton");

const PHOTO_LIBRARY = {
    us1: {
        src: "imgs/us1.png",
        alt: "Нежный момент вместе в розовом свете",
        type: "wide",
    },
    us2: {
        src: "imgs/us2.png",
        alt: "Смешное близкое селфи вместе",
        type: "portrait",
    },
    us3: {
        src: "imgs/us3.png",
        alt: "Полароидная фотография на улице",
        type: "polaroid",
    },
    us4: {
        src: "imgs/us4.png",
        alt: "Зеркальное фото в объятиях",
        type: "portrait",
    },
    us5: {
        src: "imgs/us5.png",
        alt: "Подписка",
        type: "wide",
    },
    us6: {
        src: "imgs/us6.png",
        alt: "Милый коллаж парный",
        type: "portrait",
    },
    us7: {
        src: "imgs/us7.png",
        alt: "Милое совместное фото",
        type: "portrait",
    },
    us8: {
        src: "imgs/us8.png",
        alt: "Милое совместное фото с собакой",
        type: "portrait",
    },
    us9: {
        src: "imgs/us9.png",
        alt: "Милое совместное фото нас",
        type: "portrait",
    },
    us10: {
        src: "imgs/us10.png",
        alt: "Милое совместное старое фото нас",
        type: "portrait",
    },
    love: {
        src: "imgs/love.png",
        alt: "Рука с надписями люблю максимку",
        type: "portrait",
    },
    dota: {
        src: "imgs/dota.png",
        alt: "Игровой момент, где все соединено лучами",
        type: "wide",
    },
    heart: {
        src: "imgs/heart.png",
        alt: "Большое сердечко",
        type: "heart",
    },
    alisa: {
        src: "imgs/alisa.png",
        alt: "Фото Алисы",
        type: "portrait",
    },
    maksim: {
        src: "imgs/maksim.png",
        alt: "Фото Максима",
        type: "wide",
    },
};

const STORY_PHOTOS = {
    0: ["us3"],
    3: ["us10"],
    4: ["maksim"],
    7: ["love"],
    9: ["us2"],
    12: ["us1"],
    13: ["dota"],
    15: ["us9"],
    16: ["alisa"],
    19: ["us8"],
    21: ["us7"],
    22: ["us4"],
    24: ["us6"],
    26: ["us5"],
    28: ["heart"],
};

const FINAL_PHOTOS = [
    "us1",
    "us2",
    "us3",
    "us4",
    "us6",
    "us7",
    "us8",
    "us9",
    "us10",
    "love",
    "heart",
    "alisa",
    "maksim",
];

const escapeHTML = (str) =>
    String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

const renderRichText = (str) =>
    escapeHTML(str).replace(/&lt;(\/?)strong\s*&gt;/gi, "<$1strong>");

const formatNumber = (num) => Number(num || 0).toLocaleString("ru-RU");

function renderPhotoCluster(keys, variant = "") {
    const photos = keys
        .map((key, i) => {
            const photo = PHOTO_LIBRARY[key];
            if (!photo) return "";

            return `
      <figure class="memory-photo-card ${escapeHTML(photo.type)} tilt-${(i % 5) + 1}">
        <img src="${escapeHTML(photo.src)}" alt="${escapeHTML(photo.alt)}" loading="lazy">
      </figure>
    `;
        })
        .join("");

    if (!photos) return "";
    return `<div class="memory-photo-grid ${escapeHTML(variant)}">${photos}</div>`;
}

function renderPageHearts() {
    const heartColors = [
        "rgba(232, 116, 142, .32)",
        "rgba(244, 157, 174, .28)",
        "rgba(255, 184, 174, .30)",
        "rgba(210, 104, 124, .22)",
        "rgba(255, 210, 203, .38)",
    ];
    let seed = 1427;
    const random = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
    };
    const columns = 7;
    const rows = 4;
    const hearts = Array.from({ length: columns * rows }, (_, i) => {
        const row = Math.floor(i / columns);
        const column = i % columns;
        const top = ((row + 0.12 + random() * 0.72) * (100 / rows)).toFixed(1);
        const left = (
            (column + 0.1 + random() * 0.78) *
            (100 / columns)
        ).toFixed(1);
        const size = 15 + Math.round(random() * 22);
        const mobileSize = Math.max(10, Math.round(size * 0.72));
        const rotate = Math.round(-38 + random() * 76);
        const delay = (random() * 7).toFixed(2);
        const speed = (6.5 + random() * 4).toFixed(2);
        const color = heartColors[i % heartColors.length];

        return `<span style="--heart-top:${top}%; --heart-left:${left}%; --heart-size:${size}px; --heart-mobile-size:${mobileSize}px; --rotate:${rotate}deg; --heart-delay:${delay}s; --speed:${speed}s; --heart-color:${color};"></span>`;
    }).join("");

    return `
    <div class="page-hearts" aria-hidden="true">
      ${hearts}
    </div>
  `;
}

function chapters() {
    return [...new Set(stories.map((s) => s.chapter))];
}

function renderNav() {
    const chs = chapters();
    chapterNav.innerHTML =
        chs
            .map((ch) => {
                const firstStory = stories.findIndex((s) => s.chapter === ch);
                return `<button class="nav-item" data-page="${firstStory + storyOffset}">${escapeHTML(ch)}</button>`;
            })
            .join("") +
        `<button class="nav-item" data-page="${finalPageIndex}">Финал</button>`;
    chapterNav.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
            index = Number(btn.dataset.page);
            render(true);
        });
    });
}

function currentChapter() {
    if (index < storyOffset) return "";
    if (index === finalPageIndex) return "Финал";
    return stories[index - storyOffset]?.chapter || "";
}

function renderCover() {
    return `
    <div class="cover">
      <div>
        <p class="eyebrow">наша маленькая книга</p>
        <h2>Пять лет<br>вместе</h2>
        <p class="subtitle">
          Алисик я собрал для тебя нашу совместную историю за эти многие года вместе.
          Конечно тут нельзя было уместить всё, но я постарался чтобы тебе понравилось!!
        </p>
        <div class="names">
          <span>Максимка</span><span>♡</span><span>Алисик</span>
        </div>
      </div>
    </div>
  `;
}

function renderIntro() {
    return `
    <div class="page-meta">
      <span class="pill">вступление</span>
      <span class="pill">от моего лица</span>
    </div>
    <h2>Почему я сделал эту книгу</h2>
    <p class="desc">
      Я хотел собрать не просто красивые слова и фразочки, а моменты - где мы были собой.
      Где было сладко, мило, смешно, иногда сложно, но всегда по-настоящему и по-живому!!
      Ну и конечно я хотел это сделать так, как умею лучше всего - в своём стиле.
    </p>
    <div class="note">
      Алисик, эта книга про нас. Про наши словечки, наши разговорчики,
      наши ссоры(не без них), наши примирения и ту нежность, которую невозможно подделать!
      Я пишу это как парень, который счастлив, что ты есть в моей жизни.
    </div>
  `;
}

function renderStats() {
    const tender = (stats.tenderWords || [])
        .map(
            (item) => `
    <div class="mini-stat">
      <span>${escapeHTML(item.label)}</span>
      <strong>${formatNumber(item.count)}</strong>
    </div>
  `,
        )
        .join("");

    const sources = (stats.sources || [])
        .map(
            (item) => `
    <div class="source-row">
      <span>${escapeHTML(item.label)}</span>
      <strong>${formatNumber(item.count)}</strong>
    </div>
  `,
        )
        .join("");

    return `
    <div class="page-meta">
      <span class="pill">итог</span>
      <span class="pill">наши цифры</span>
    </div>
    <h2>Наши сообщения в цифрах</h2>
    <p class="desc">
      Я собрал всё в один маленький итог. Потому что за этими цифрами не просто переписка —
      там наши вечера, примирения, шутки, ожидание встреч и тысячи маленьких «я рядом».
    </p>
    <div class="stats-grid">
      <div class="stat-card big">
        <span>всего сообщений</span>
        <strong>${formatNumber(stats.totalMessages)}</strong>
      </div>
      <div class="stat-card">
        <span>текстовых сообщений</span>
        <strong>${formatNumber(stats.textMessages)}</strong>
      </div>
      <div class="stat-card">
        <span>сообщений с медиа</span>
        <strong>${formatNumber(stats.mediaMessages)}</strong>
      </div>
      <div class="stat-card big">
        <span>милых словечек</span>
        <strong>${formatNumber(stats.tenderTotal)}</strong>
      </div>
    </div>
    <div class="note soft">
      В этой книге не просто даты и цитаты. Тут ${formatNumber(stats.totalMessages)} маленьких доказательств того,
      что мы очень долго были <strong>друг у друга в жизни</strong>.
    </div>
    <h3 class="section-title">Из чего сложились эти сообщения</h3>
    <div class="sources-box">${sources}</div>
    <h3 class="section-title">Наш словарь нежности</h3>
    <div class="tender-grid">${tender}</div>
  `;
}

function renderYears() {
    const max = Math.max(...(stats.years || []).map((y) => y.count), 1);
    const bars = (stats.years || [])
        .map((item) => {
            const width = Math.max(8, Math.round((item.count / max) * 100));
            return `
      <div class="year-row">
        <div class="year-head">
          <strong>${escapeHTML(item.year)}</strong>
          <span>${formatNumber(item.count)} сообщений</span>
        </div>
        <div class="bar"><i style="width:${width}%"></i></div>
      </div>
    `;
        })
        .join("");

    return `
    <div class="page-meta">
      <span class="pill">сравнение</span>
      <span class="pill">по годам</span>
    </div>
    <h2>Как росла наша история</h2>
    <p class="desc">
      В разные годы мы писали по-разному: где-то больше, где-то меньше. Но каждая колонка здесь —
      это не просто число, а отдельная глава нашей общей истории.
    </p>
    <div class="year-chart">${bars}</div>
    <div class="note">
      Самое большое число — не просто рекорд. Для меня это знак того, сколько раз за эти годы
      я хотел написать именно <strong>тебе</strong>.
    </div>
  `;
}

function renderToc() {
    const items = stories
        .map(
            (s, i) => `
    <button data-page="${i + storyOffset}">
      <span>${escapeHTML(s.title)}</span>
      <small>${escapeHTML(s.date)}</small>
    </button>
  `,
        )
        .join("");

    return `
    <div class="page-meta">
      <span class="pill">содержание</span>
      <span class="pill">${stories.length} историй</span>
    </div>
    <h2>Истории</h2>
    <p class="desc">
      Я собрал многие моменты, которые будет мило посмотреть, почитать и вспомнить:
      начало, нежности, наш вайбик, (возможно) серьёзные разговоры и то, через что мы прошли.
    </p>
    <div class="toc">${items}</div>
  `;
}

function renderStory(story, storyIndex) {
    const dialogue = story.dialogue
        .map(([speaker, text]) => {
            const me = speaker.toLowerCase().includes("максим");
            return `
      <div class="line ${me ? "me" : ""}">
        <div class="speaker">${escapeHTML(speaker)}</div>
        <div class="quote">«${renderRichText(text)}»</div>
      </div>
    `;
        })
        .join("");
    const photos = renderPhotoCluster(
        STORY_PHOTOS[storyIndex] || [],
        "story-gallery",
    );

    return `
    <div class="page-meta">
      <span class="pill">${escapeHTML(story.chapter)}</span>
      <span class="pill">${escapeHTML(story.date)}</span>
      <span class="pill">${escapeHTML(story.mood)}</span>
    </div>
    <h2>${escapeHTML(story.title)}</h2>
    <p class="desc">${renderRichText(story.desc)}</p>
    ${photos}
    <div class="dialogue">${dialogue}</div>
    <div class="note">${renderRichText(story.note)}</div>
  `;
}

function renderFinale() {
    return `
    <div class="page-meta">
      <span class="pill">финал</span>
      <span class="pill">для Алисика</span>
    </div>
    <h2>И самое главное</h2>
    <p class="desc">
      Можно посчитать сообщения, годы, слова и даты. Но всё самое важное всё равно не помещается в статистику.
    </p>
    <div class="final-card">
      <p>${escapeHTML(stats.finalPhrase)}</p>
    </div>
    <div class="final-big-heart" aria-hidden="true">
      <span></span>
    </div>
    ${renderPhotoCluster(FINAL_PHOTOS, "final-gallery")}
    <div class="note">
      Я хочу, чтобы дальше у нас было ещё больше таких огоньков: смешных, нежных, честных,
      иногда нелепых, но обязательно <strong>наших</strong>!!
    </div>
  `;
}

function scrollToPageTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function openGiftIntro() {
    if (!giftIntro || giftIntro.classList.contains("is-opening")) return;

    giftIntro.classList.add("is-opening");

    window.setTimeout(() => {
        document.body.classList.remove("gift-locked");
        document.body.classList.add("book-revealed");
        giftIntro.classList.add("is-done");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1550);

    window.setTimeout(() => {
        giftIntro.remove();
    }, 2300);
}

function render(shouldScroll = false) {
    page.style.animation = "none";
    void page.offsetWidth;
    page.style.animation = "";
    page.className = `page ${index === finalPageIndex ? "finale-page" : ""}`;

    if (index === 0) page.innerHTML = renderCover();
    else if (index === 1) page.innerHTML = renderIntro();
    else if (index === 2) page.innerHTML = renderStats();
    else if (index === 3) page.innerHTML = renderYears();
    else if (index === 4) page.innerHTML = renderToc();
    else if (index === finalPageIndex) page.innerHTML = renderFinale();
    else
        page.innerHTML = renderStory(
            stories[index - storyOffset],
            index - storyOffset,
        );

    page.insertAdjacentHTML("afterbegin", renderPageHearts());

    document.querySelectorAll(".toc button").forEach((btn) => {
        btn.addEventListener("click", () => {
            index = Number(btn.dataset.page);
            render(true);
        });
    });

    counter.textContent = `${index + 1} / ${totalPages}`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === totalPages - 1;
    progressBar.style.width = `${((index + 1) / totalPages) * 100}%`;

    const ch = currentChapter();
    document.querySelectorAll(".nav-item").forEach((btn) => {
        btn.classList.toggle("active", btn.textContent === ch);
    });

    if (shouldScroll) {
        scrollToPageTop();
    }
}

prevBtn.addEventListener("click", () => {
    if (index > 0) {
        index--;
        render(true);
    }
});
nextBtn.addEventListener("click", () => {
    if (index < totalPages - 1) {
        index++;
        render(true);
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && index > 0) {
        index--;
        render(true);
    }
    if (e.key === "ArrowRight" && index < totalPages - 1) {
        index++;
        render(true);
    }
});

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeBtn.textContent = document.body.classList.contains("dark")
        ? "Светлая тема"
        : "Ночная тема";
});

giftButton?.addEventListener("click", openGiftIntro);

renderNav();
render();
