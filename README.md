# 🐺 The Call of the Wild — نداء البرية

An immersive, bilingual interactive quiz site for Jack London's *The Call of the Wild* (1903).

## ✨ Features

- **4 Game Types**: Forgery Game, Who Said It?, Evidence Board, Debate Arena
- **7 Chapters Covered**: All of Buck's journey from civilization to the wild
- **Bilingual**: Full Arabic ↔ English toggle (UI + direction switch)
- **Light / Dark Mode**: Warm parchment light mode + atmospheric dark mode
- **Animated World Backgrounds**: 4 worlds that shift as you scroll (golden valley → frozen trail → aurora night → moonlit forest)
- **Star Field**: Twinkling stars in night-world scenes
- **Wolf Eyes**: Animated wolf eyes in the hero silhouette that follow your cursor
- **Discussion Room**: Compare answers with friends (requires Claude DB integration)
- **Answer Key**: Hidden panel for instructors (`#key` in URL)
- **Progress Tracking**: LocalStorage-backed with optional cloud sync

## 📁 Project Structure

```
The Call of the Wild/
├── index.html          ← Main entry point
├── css/
│   └── style.css       ← All styles (dark/light modes, backgrounds, components)
├── js/
│   ├── i18n.js         ← Arabic/English translations
│   ├── data.js         ← Questions bank & chapter data
│   └── app.js          ← All app logic & rendering
├── assets/
│   ├── call-of-the-wild.pdf ← The novel (downloadable)
│   └── trailer.mp4     ← Video trailer
└── .gitignore
```

## 🚀 Deploy on GitHub Pages

1. Push the folder to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to `main` branch, root `/`
4. Site will be live at `https://yourusername.github.io/repo-name/`

## 🎨 Design System

| Token | Dark | Light |
|-------|------|-------|
| Background | `#060c18` | `#fdf6e3` |
| Accent (Ember) | `#ffaa44` | `#c8620a` |
| Ice | `#9fdcff` | `#1a6090` |
| Good | `#6fe0a5` | `#207848` |
| Bad | `#ff7070` | `#c02020` |

**Fonts**: Aref Ruqaa (Arabic display), IBM Plex Sans Arabic (Arabic body), Cinzel (English display), Big Shoulders Display (English accent)

## 📖 About the Novel

*The Call of the Wild* by **Jack London** (1903) follows Buck, a domesticated dog, as he is stolen from his California home and thrust into the harsh wilderness of the Yukon during the Klondike Gold Rush.

---

Built with pure HTML, CSS, and JavaScript. No frameworks, no build step.
