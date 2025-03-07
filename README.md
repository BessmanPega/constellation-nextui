# Embedding a Constellation Case in a React app using the React SDK and NextUI

https://github.com/user-attachments/assets/83a4e4d5-f422-4f4e-ba46-9207e6ca793e

This is just an example, and not a particularly well documented one at this point. Think "descriptive," not "prescriptive."

## How I set this up:

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
    - [x] FlowContainer (this one isn't in the builder, had to grab it [from source](https://github.com/pegasystems/react-sdk-components/blob/29499ce83d08a14768981fed8eefcc613d5e7dab/packages/react-sdk-components/src/components/infra/Containers/FlowContainer/FlowContainer.tsx))
    - [x] ActionButtons
    - [x] Assignment
    - [x] AssignmentCard
    - [x] MultiStep
    - [x] ToDo
- Templates:
    - [x] DefaultForm
    - [X] TwoColumn
- Misc:
    - [x] Wire up cancel button
    - [x] Handle click-away-and-back-again

Then I tried to pull out all the MUI stuff from `package.json`:

```
@mui/icons-material
@mui/lab
@mui/material
@mui/styles
@mui/x-date-pickers
mui-tel-input
```

I ran `npm prune` and then `npm run dev`, but Vite threw about a billion errors about missing MUI stuff, it was basically this:

```
X [ERROR] Could not resolve "@mui/material/Checkbox"

    node_modules/@pega/react-sdk-components/lib/components/template/ListView/ListView.js:37:21:
      37 │ import Checkbox from '@mui/material/Checkbox';
         ╵                      ~~~~~~~~~~~~~~~~~~~~~~~~

  You can mark the path "@mui/material/Checkbox" as external to exclude it from the bundle, which
  will remove this error and leave the unresolved path in the bundle.
```

Over and over again. Given that `@pega/react-sdk-components` is one of the core libraries, it doesn't look like it's possible to pull MUI out of the project dependencies at this point in time.

## Based on Vite & NextUI Template

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
