import { transformAsync } from '@babel/core';
import linguiMacroPlugin from '@lingui/babel-plugin-lingui-macro';
import { getBabelParserOptions } from '@lingui/cli/api/extractors/babel';
import { getConfig } from '@lingui/conf';
import type { PluginBuild } from 'esbuild';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

// The options bag the consumer's `@babel/core` accepts, whatever version
// (7.x or 8.x) their install resolves to.
type BabelTransformOptions = NonNullable<Parameters<typeof transformAsync>[1]>;

const linguiMacroImportPattern = /from ['"]@lingui(?:\/.+)?\/macro['"]/;

export const linguiReactEmailMacro = () => ({
  name: 'lingui-react-email-macro',
  setup: async (build: PluginBuild) => {
    const linguiConfig = getConfig({ skipValidation: true });
    const buildWorkingDirectory =
      build.initialOptions.absWorkingDir ?? process.cwd();
    const entryPoints = build.initialOptions.entryPoints;
    const entryPointPaths =
      entryPoints === undefined
        ? []
        : Array.isArray(entryPoints)
          ? entryPoints.map((entryPoint) =>
              typeof entryPoint === 'string' ? entryPoint : entryPoint.in
            )
          : Object.values(entryPoints);
    const entryPointRealPaths = new Set(
      await Promise.all(
        entryPointPaths.map(async (entryPointPath) => {
          const resolvedEntryPointPath = path.resolve(
            buildWorkingDirectory,
            entryPointPath
          );

          try {
            return await realpath(resolvedEntryPointPath);
          } catch {
            return resolvedEntryPointPath;
          }
        })
      )
    );

    build.onLoad(
      { filter: /\.[cm]?[jt]sx?$/ },
      async ({ path: pathToFile }) => {
        const contents = await readFile(pathToFile, 'utf8');

        if (!linguiMacroImportPattern.test(contents)) {
          return undefined;
        }

        const filename = path.relative(process.cwd(), pathToFile);
        const transformed = await transformAsync(contents, {
          babelrc: false,
          configFile: false,
          filename,
          sourceMaps: 'inline',
          parserOpts: {
            // `getBabelParserOptions` returns the Babel 7 `ParserPlugin` union
            // from @lingui/cli's own @babel/parser, which is not assignable to
            // a different major's union (e.g. Babel 8). The plugin names
            // themselves are accepted by both, so cast to the consumer's
            // `parserOpts` type.
            plugins: getBabelParserOptions(
              filename,
              linguiConfig.extractorParserOptions
            ) as unknown as NonNullable<
              BabelTransformOptions['parserOpts']
            >['plugins'],
          },
          plugins: [[linguiMacroPlugin, { linguiConfig }]],
        });
        const transformedContents = transformed?.code ?? contents;
        let fileRealPath = pathToFile;
        try {
          fileRealPath = await realpath(pathToFile);
        } catch {
          // Keep the original path if the file cannot be canonicalized.
        }
        const isEntryPoint = entryPointRealPaths.has(fileRealPath);

        return {
          // If the macro transformer handles the entrypoint, it must also preserve the preview
          // exports that the rendering utilities plugin would normally add.
          contents: isEntryPoint
            ? `${transformedContents};
          export { render } from 'react-email-module-that-will-export-render'
          export { createElement as reactEmailCreateReactElement } from 'react';
        `
            : transformedContents,
          loader: 'tsx',
        };
      }
    );
  },
});
