# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## GitHub Pages

This site is configured for free GitHub Pages hosting through the workflow in
`.github/workflows/deploy.yml`.

To publish it:

1. Create a GitHub repository for the site.
2. Push this project to the repository's `main` branch.
3. In GitHub, open the repository settings.
4. Go to Pages.
5. Set Source to GitHub Actions.
6. Push a change or run the Deploy to GitHub Pages workflow manually.

For a normal project repository, GitHub will publish the site at:

```text
https://<username>.github.io/<repository-name>/
```

For a user site repository named `<username>.github.io`, GitHub will publish it
at:

```text
https://<username>.github.io/
```

The Vite build uses `BASE_PATH` so public assets work in both setups.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
