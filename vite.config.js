import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  css: {
    preprocessorOptions: {
      scss: {
        // uni.scss 由 Uni-app 框架自动注入，不要重复 import
        additionalData: `
          $u-primary: #3A7BF7;
          $u-success: #00B8A9;
          $u-warning: #FF8A5C;
          $u-error: #FF5252;
          $u-info: #8E9DAE;
          @import "uview-plus/theme.scss";
        `,
      },
    },
  },
})
