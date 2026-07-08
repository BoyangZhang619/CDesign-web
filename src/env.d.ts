declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
// 配置文件内已经包含了ts对vue的识别，不需要这个泛型声明了