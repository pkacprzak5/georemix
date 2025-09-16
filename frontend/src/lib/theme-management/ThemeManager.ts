class ThemeManager {
  private readonly _document = window.document.documentElement;
  setTheme(theme: "light" | "dark") {
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
