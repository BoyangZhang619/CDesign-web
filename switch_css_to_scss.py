import os
import re

def convert_css_to_scss(root_dir):
    print(f"🚀 开始在目录: {root_dir} 中将 CSS 转换为 SCSS...")
    
    # 用来匹配各种形式的 @import 语句中的 .css 后缀
    # 例如：@import "./style.css"; 或 @import '@/css/view.css';
    css_import_pattern = re.compile(r'(@import\s+[\'"][^\'"]+)\.css([\'"])')
    
    css_files = []

    # 第一步：递归遍历获取所有的 .css 文件
    for root, dirs, files in os.walk(root_dir):
        # 排除 node_modules 目录
        if 'node_modules' in root or '.git' in root:
            continue
        for file in files:
            if file.endswith('.css'):
                css_files.append(os.path.join(root, file))

    if not css_files:
        print("ℹ️ 没有找到任何 .css 文件。")
        return

    print(f"📦 共找到 {len(css_files)} 个 CSS 文件，开始处理内容...")

    # 第二步：更新文件内部的 @import 文本内容
    for file_path in css_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 将内容中的 .css 替换为 .scss
        new_content = css_import_pattern.sub(r'\1.scss\2', content)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

    # 第三步：物理重命名文件后缀
    for file_path in css_files:
        new_file_path = file_path[:-4] + '.scss'
        try:
            os.rename(file_path, new_file_path)
            print(f"✅ 已转换: {os.path.basename(file_path)} -> {os.path.basename(new_file_path)}")
        except Exception as e:
            print(f"❌ 重命名失败 {file_path}: {e}")

    print("\n🎉 转换全部完成！")
    print("💡 别忘了去你的 .vue 文件里，把 <style scoped> 改成 <style lang=\"scss\" scoped src=\"...\"> 哦！")

if __name__ == '__main__':
    # os.getcwd() 代表当前运行脚本的目录
    current_directory = os.getcwd()
    convert_css_to_scss(current_directory)