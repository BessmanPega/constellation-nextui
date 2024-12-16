How I set this up:

https://nextui.org/docs/guide/installation

npm install -g nextui-cli

nextui init constellation-nextui

(use vite template, defaults for everything else)

cd constellation-nextui

npm install

change `framer-motion` dependency to `11.5.6` in `package.json`

nextui add --all

Started working through: https://docs.pega.com/bundle/constellation-sdk/page/constellation-sdks/sdks/updating-next-js-application-integration-react-sdk.html

npm install @pega/auth

npm install @pega/react-sdk-components

npm install @pega/configs

npm install @pega/constellationjs

npm install @pega/pcore-pconnect-typedefs

npm install @pega/prettier-config

npm install @pega/react-sdk-overrides

npm install @pega/tsconfig

npm i -D vite-plugin-static-copy # Using this instead of webpack

Setup vite.config.ts to copy specific Pega node files to `public`.

npm run build

edited tsconfig.json to add Pega types.

built `src/pages/pega.tsx` as "hello, world' for the embedded scenario. Got these errors on run:

```
Error: Build failed with 257 errors:
node_modules/@pega/react-sdk-components/lib/bridge/react_pconnect.js:6:38: ERROR: Could not resolve "react-redux"
node_modules/@pega/react-sdk-components/lib/components/designSystemExtension/AlertBanner/AlertBanner.js:2:22: ERROR: Could not resolve "@mui/material"

[...etc...]
```

npm install react-redux

npm install @mui/material

npm install @mui/styles

npm install @mui/icons-material

npm install @tinymce/tinymce-react

npm install react-number-format

npm install @mui/x-date-pickers

npm install dayjs

npm install throttle-debounce

npm install mui-tel-input

npm install downloadjs

npm install lodash.difference

npm install uuid

npm install @mui/lab

npm install react-datepicker

make sure `sdkContentServerUrl` is setup correctly, including getting HTTP vs HTTPS correct.

Update vite.config.ts to account for `'./node_modules/@pega/constellationjs/dist/js/*'`.

npm run build

set `mashupGrantType` to `passwordCreds` in `sdk-config.json` (I can't get the default `authCode` to work, but I think that flow is less desirable anyway), created a matching oauth2 client reg rec in Pega.

Worked on making `src/pages/pega.tsx` show a button that, when clicked, shows an embedded case creation view.

Generated a `TextInput` in the standalone SDK, copied the .tsx file over to `src/components` and did rudimentary styling to make it stand out. Added it to `sdk-local-component-map.ts`.

Used DX API Explorer and browser network tracer and react debugger to find remaining components to override:

- Fields:
    - [x] AutoComplete
    - [x] Date
    - [x] Dropdown
    - [x] Email
    - [x] Phone
    - [x] RadioButtons
    - [x] TextInput
- Infra:
    - [ ] ActionButtons
    - [ ] Assignment
    - [ ] Flow container
    - [ ] MultiStep
    - [ ] ToDo
- Misc:
    - [ ] Wire up cancel button
    - [ ] Handle click-away-and-back-again

# Vite & NextUI Template

This is a template for creating applications using Vite and NextUI (v2).

[Try it on CodeSandbox](https://githubbox.com/nextui-org/vite-template)

## Technologies Used

- [Vite](https://vitejs.dev/guide/)
- [NextUI](https://nextui.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org)
- [Framer Motion](https://www.framer.com/motion)

## How to Use

To clone the project, run the following command:

```bash
git clone https://github.com/nextui-org/vite-template.git
```

### Install dependencies

You can use one of them `npm`, `yarn`, `pnpm`, `bun`, Example using `npm`:

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Setup pnpm (optional)

If you are using `pnpm`, you need to add the following code to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@nextui-org/*
```

After modifying the `.npmrc` file, you need to run `pnpm install` again to ensure that the dependencies are installed correctly.

## License

Licensed under the [MIT license](https://github.com/nextui-org/vite-template/blob/main/LICENSE).
