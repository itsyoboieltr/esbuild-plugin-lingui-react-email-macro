# esbuild-plugin-lingui-react-email-macro

An esbuild plugin to transform Lingui macros in React email.

## Install

```bash
bun add esbuild-plugin-lingui-react-email-macro
```

## Usage

```ts
import { build } from "esbuild";
import { linguiReactEmailMacro } from "esbuild-plugin-lingui-react-email-macro";

build({
  ...,
  plugins: [linguiReactEmailMacro()],
});
```
