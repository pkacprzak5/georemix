const THEME_CHANGE_CLASS = "theme-change"
const THEME_CHANGE_DURATION = 1100;

class ThemeManager {
  private readonly _document = window.document.documentElement;
  setTheme(theme: "light" | "dark") {
    this._document.classList.add(THEME_CHANGE_CLASS)
    setTimeout(() => {
      this._document.classList.remove(THEME_CHANGE_CLASS)
    }, THEME_CHANGE_DURATION)
    switch (theme) {
      case "light":
        this._document.classList.remove("dark");
        return;
      case "dark":
        if (!this._document.classList.contains("dark")) {
          this._document.classList.add("dark");
        }
    }
  }
}

export default ThemeManager;
