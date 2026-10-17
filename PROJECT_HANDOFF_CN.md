# Fiona 摄影作品集网站交接说明

这份文档用于把项目交给新的 Codex 会话。新会话开始后，应先阅读本文件，再阅读 src/main.ts、src/book.ts、src/style.css、src/book.css 和 src/gallery.css，然后再修改代码。

## 项目概况

这是 Fiona 的个人摄影作品集网站，使用 Vite + TypeScript + 原生 DOM/CSS 实现，没有 React 页面组件。网站部署目标是 GitHub Pages：

https://chenjingfei0509.github.io/my-photography-website/

GitHub 仓库：

https://github.com/chenjingfei0509/my-photography-website

本地项目目录：

C:\Users\qtrad\Documents\Codex\2026-09-24\wo\outputs\itom-photo

当前分支是 main。Vite 的 base 已设置为 /my-photography-website/，部署到 GitHub Pages 时不要改成 /。

## 运行和发布

在项目目录打开 PowerShell：

    npm install
    npm run dev

生产构建：

    npm run build

构建成功后提交并推送：

    git add .
    git commit -m "描述本次改动"
    git push origin main

GitHub Actions 位于 .github/workflows/，每次推送 main 会触发部署。网站更新后如果浏览器仍显示旧版本，使用强制刷新，或给 URL 加查询参数，例如 ?v=新的版本号。

交接时如果工作区存在未提交改动，应先运行 git status，不要覆盖用户改动。

## 文件结构

    itom-photo/
    ├─ public/
    │  ├─ welcome-poster.png          欢迎页主背景图
    │  ├─ optimized/                  网站实际使用的封面和照片
    │  │  ├─ 1-coffee-book/           Coffee & Book 照片
    │  │  ├─ 2-/                      城市漫游指南照片
    │  │  ├─ bride/                   落跑新娘照片
    │  │  ├─ butterfly/               黄晶眼蝶照片
    │  │  ├─ her/                     HER 照片
    │  │  ├─ metro/                   地下铁照片
    │  │  └─ *-cover.webp             主题封面
    │  └─ favicon.svg, icons.svg
    ├─ src/
    │  ├─ main.ts                     页面入口、数据、DOM、交互
    │  ├─ book.ts                     主题选择手翻书的逻辑
    │  ├─ book.css                    手翻书结构和翻页动画
    │  ├─ gallery.css                 主题照片页、欢迎页附加样式、Loading 样式
    │  ├─ style.css                   基础布局、欢迎页和全局样式
    │  └─ counter.ts                  模板遗留的小工具，通常不用改
    ├─ index.html                     Vite HTML 入口
    ├─ vite.config.ts                 GitHub Pages base 路径
    ├─ package.json                   依赖和脚本
    └─ PROJECT_HANDOFF_CN.md          本交接文档

## 页面结构和用户流程

1. main.ts 先创建 Loading Screen，等待欢迎页背景和所有主题封面至少完成加载。
2. Loading Screen 显示中央竖线和百分比。100% 后左右两块面板从中线向两侧打开。
3. 欢迎页是 welcome section，背景来自 public/welcome-poster.png。
4. 点击 START EXPLORING 后进入主题选择区。
5. 主题选择区由 createBook() 创建，可以拖动书页边缘、点击左右边缘、点击底部导航或使用键盘翻页。
6. 点击手翻书右页插画进入照片展示层 modal。
7. 照片展示层默认是横向滑轨。点击照片后进入 is-immersive 单图模式；关闭后回到原滑轨位置。
8. 页面下方是 About 内容，导航栏的 ABOUT 关于滚动到 About，PROJECTS 作品滚回作品区。

## 主题和照片数据

所有主题数据在 src/main.ts 顶部维护。Room 类型包含 id、title、subtitle、cover、photos、date。rooms 数组决定主题顺序，files 对象决定每个主题的照片文件顺序，两者必须使用同一个 id。

当前主题：

- coffee-book：Coffee & Book
- city：城市漫游指南
- bride：落跑新娘
- butterfly：黄晶眼蝶
- her：HER
- metro：地下铁

照片路径最终是：

    /my-photography-website/optimized/{主题 id}/{文件名}

文件名大小写必须完全匹配。her 中存在 9.JPG、14.JPG、24.JPG、25.JPG、39.JPG 等大写扩展名，不能随意改成小写而不改文件名。

新增主题：

1. 在 public/optimized/ 建立与 id 完全相同的文件夹。
2. 放入已经处理好的照片，按想要的顺序命名。
3. 放入主题封面，并确认 rooms 的 cover 路径存在。
4. 在 rooms 中添加主题对象。
5. 在 files 中添加同名 id 的文件名数组。
6. 填写日期。
7. 运行 npm run build，检查路径和数量。

网站是静态 GitHub Pages，不会自动扫描目录，也没有后端上传接口。只把照片放进文件夹而不更新 files 是无效的。

## 图片处理和方向

项目使用 sharp 生成优化图片，依赖已写在 package.json。安装 sharp 必须在项目目录执行 npm install sharp，不要在 C:\Windows\System32 执行，否则 npm 会遇到 EPERM。

处理新照片时：

- 保留原始比例，网页使用 object-fit: contain。
- 读取并应用 EXIF 方向，避免手机照片旋转。
- 优化图用于网页，原图另行保存，不覆盖原始文件。
- WebP 不要统一裁剪成相同尺寸。
- 检查封面和照片是否实际生成成功。

## 欢迎页和 Loading Screen

欢迎页在 main.ts 中由模板创建，主要类名是 .welcome、.welcome-copy、.welcome-enter、.camera、.leaf-zone、.water-zone。

当前欢迎页使用 welcome-poster.png，并保留 Hello, I’m Fiona、Portrait Photography Journal 和 START EXPLORING。鼠标移动会产生轻微背景和相机视差；水波纹效果按用户要求移除，不要擅自恢复。

Loading Screen 也由 main.ts 创建，样式在 gallery.css。它等待封面和欢迎页背景的真实加载，同时有最短展示时间。图片失败会 resolve，不应让页面无限卡住。

修改 Loading 时保持 0% 到 100% 连续显示，100% 短暂停留，继续使用左右面板从中心打开的转场。欢迎页文字应在面板打开后执行 welcome-reveal。动画结束后移除 Loading，恢复交互和滚动，并检查 prefers-reduced-motion。

## 手翻书主题选择页

src/book.ts 是手翻书核心，不要在 main.ts 重复实现。createBook(host, pages, open) 接收主题数组和打开照片页的回调。

- 正向翻页：右侧纸张从右向左翻，背面显示下一主题文字。
- 反向翻页：左侧当前主题文字所在纸张向右翻，背面显示目标主题插画。
- 翻页过程中，文字和插画必须属于正在翻动的纸张，不能让静态页面提前闪变。
- ready 和 preloads 保证当前页、目标页资源可用后再动画。
- book.css 控制 perspective、curl、sheet-face、阴影和层级。

如果修改反向翻页，先看 begin(dir) 中 dir === -1 分支。不要给右侧静态纸张额外添加动效；反向翻页主体应该是左纸张向右旋转。

## 照片展示区

照片页 DOM 在 main.ts。modal 包含 modal-head、book-stage、photo-wall、book-nav 和 close。

当前交互：

- 默认 photo-wall 是横向 flex 滑轨，多张照片沿水平方向排列。
- 图片使用原始比例和 object-fit: contain，不裁剪。
- 支持横向滚动、鼠标拖拽、移动端触摸和键盘方向键。
- 点击 .shot 进入 modal.is-immersive。
- 沉浸模式只显示 .is-current 图片，背景为深色。
- 左右箭头调用 movePage(-1/1)。
- Escape 点击关闭按钮。
- 关闭单图模式时保存并恢复 galleryScroll。
- movedDuringDrag 防止拖动结束后的 click 误打开大图。

修改时注意：

1. 不要在 pointerup 阶段直接替换 wall.innerHTML，否则后续 click 目标会被移除，造成“点击没有反应”。
2. 点击应由 wall 的事件委托处理。
3. 点击相邻图片时要更新 activePage 和 .is-current。
4. 不要让旧的 .modal.is-immersive .book-nav{display:none} 覆盖箭头样式。gallery.css 有很多历史覆盖规则，新增规则放文件末尾。
5. 默认画廊不要使用 opacity、saturate 或灰度让照片发灰。
6. 箭头要有足够点击区域，移动端不能依赖 hover。

## About 页面

About 接在主题作品页下面，不再是单独全屏页面。导航栏通过 scrollIntoView() 滚动到 #about-section，PROJECTS 滚回 .rooms。

简介内容目前在 main.ts 的 .about-section 和遗留 .about-panel 两个模板位置。如果更新简介，必须同步检查这两处，避免一个地方旧、一个地方新。用户的简介来源是：

C:\Users\qtrad\Desktop\photographsite\about.txt

再次更新时应读取文本，只更新文字，不改变字体、位置和格式，除非用户明确要求改变设计。

## 常见问题

### 照片不显示

检查文件是否在 public/optimized/{id}/，files 中扩展名和大小写是否正确，最终 URL 是否包含 /my-photography-website/，并检查浏览器 Network 是否 404。

### 图片旋转

通常是 EXIF orientation 没有在处理阶段应用。用 sharp(input).rotate() 后输出，并确认网页 CSS 没有额外 rotate。

### 照片加载慢

renderPage() 会预加载当前页前后两张，preload() 使用 Image.decode()。不要把所有原图改成 eager，应继续使用优化图和邻页预加载。

### 点击照片没有大图

检查 .shot 是否有 data-index，.photo-wall 是否有 click 委托，是否在 pointerup 中提前替换 wall.innerHTML，movedDuringDrag 是否在 pointerdown 时重置，以及 .modal.is-immersive .shot.is-current 是否被隐藏。

### 箭头没有出现

检查旧的 .book-nav 是否有 display:none!important，以及沉浸模式的 z-index、pointer-events、opacity。移动端应直接显示箭头。

### GitHub Pages 没有更新

检查 GitHub Actions 是否成功，确认推送的是 main，强制刷新浏览器，必要时给 URL 加新的 ?v= 查询参数。

## 给新 Codex 的接管提示

这是 Fiona 的摄影作品集网站。请先阅读项目根目录的 PROJECT_HANDOFF_CN.md，再检查当前 git 状态和最近提交。项目是 Vite + TypeScript + 原生 DOM/CSS，入口是 src/main.ts，主题手翻书是 src/book.ts，翻页样式是 src/book.css，全局和欢迎页样式是 src/style.css，照片页、Loading 和后续覆盖规则在 src/gallery.css。照片数据不自动扫描目录，主题顺序在 main.ts 的 rooms，照片顺序在 files，资源在 public/optimized。所有图片必须保持原始比例和方向。不要破坏欢迎页、Loading、手翻书反向翻页和 About 滚动导航。修改照片页时，默认是横向滑轨，点击照片进入 .is-immersive 单图模式，支持箭头、键盘、Escape 和返回原位置。修改后先运行 npm run build，再说明改动和验证结果，不要未经要求改动图片顺序或主题文字。

## 修改原则

- 先读代码和当前页面，再改动，不要依据旧截图猜测当前实现。
- 先做最小修改，避免重写已经稳定的手翻书。
- 对图片、主题顺序、文字内容等用户数据保持谨慎。
- 每次修改后运行构建。
- 交互问题要实际打开页面验证，不要只凭 TypeScript 编译通过判断完成。
- 提交前查看 git diff 和 git status，确保没有误删照片或临时文件。
