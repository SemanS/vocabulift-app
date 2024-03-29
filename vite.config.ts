import type { UserConfigExport, ConfigEnv } from "vite";
import { loadEnv } from "vite";
import { viteMockServe } from "vite-plugin-mock";
import { resolve } from "path";
import svgr from "vite-plugin-svgr";
import styleImport from "vite-plugin-style-import";
import react from "@vitejs/plugin-react";
import { theme } from "antd/lib";
import { convertLegacyToken } from "@ant-design/compatible/lib";
import visualizer from "rollup-plugin-visualizer";

const { defaultAlgorithm, defaultSeed } = theme;

const mapToken = defaultAlgorithm(defaultSeed);
const v4Token = convertLegacyToken(mapToken);

function pathResolve(dir: string) {
  return resolve(__dirname, ".", dir);
}

// https://vitejs.dev/config/
export default ({ command }: { command: string }) => {
  return {
    resolve: {
      // alias: aliases,
      alias: [
        {
          // /@/xxxx  =>  src/xxx
          find: /^~/,
          replacement: pathResolve("node_modules") + "/",
        },
        {
          // /@/xxxx  =>  src/xxx
          find: /@\//,
          replacement: pathResolve("src") + "/",
        },
      ],
    },
    optimizeDeps: {
      include: ["@ant-design/colors", "@ant-design/icons"],
    },
    // server: {
    //   proxy: {
    //     '/api': {
    //       target: 'http://127.0.0.1:7770',
    //       changeOrigin: true,
    //       rewrite: path => path.replace(/^\/api/, '')
    //     }
    //   },
    // },
    plugins: [
      react(),
      svgr(),
      viteMockServe({
        mockPath: "mock",
        supportTs: true,
        watchFiles: true,
        localEnabled: command === "serve",
        logger: true,
      }),
      visualizer(),
      // styleImport({
      //   libs: [
      //     {
      //       libraryName: 'antd',
      //       esModule: true,
      //       resolveStyle: (name) => {
      //         return `antd/es/${name}/style/index`;
      //       },
      //     },
      //   ],
      // }),
    ],
    css: {
      modules: {
        localsConvention: "camelCaseOnly",
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: "@root-entry-name: default;",
          modifyVars: {
            "@primary-color": "#1890ff",
            v4Token,
          },
        },
      },
    },
  };
};
