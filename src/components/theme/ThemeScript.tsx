/**
 * Inline script to prevent FOUC (Flash of Unstyled Content).
 * Runs before React hydration to apply theme class immediately.
 * Must be placed in <head> or at the very start of <body>.
 */
export function ThemeScript() {
  const script = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var resolved = stored === 'dark' ? 'dark' : (stored === 'light' ? 'light' : (prefersDark ? 'dark' : 'light'));
    document.documentElement.classList.remove('light','dark');
    document.documentElement.classList.add(resolved);
  } catch (e) {}
})();
`;
  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
