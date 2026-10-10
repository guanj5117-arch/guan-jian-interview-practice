# 面试练习助手

这是一个无需账号、可在电脑或手机浏览器打开的静态练习网页。题库由两份 Word 文档抽取而来，网页支持关键词检索、语音输入（取决于浏览器）和随机抽题。

## 运行

最简单的方式是在 `app` 文件夹中双击 `启动面试助手.bat`；浏览器会自动打开。不要关闭随后出现的黑色命令窗口，关闭它即可停止网页。

也可以在 `app` 文件夹中手动运行：

```powershell
py -m http.server 8080
```

电脑浏览器访问 `http://localhost:8080`。若手机和电脑接入同一 Wi-Fi，可将 `localhost` 替换为电脑的局域网 IP，例如 `http://192.168.1.6:8080`；系统防火墙提示时允许专用网络的入站访问。

## 更新题库

把新版 `.docx` 复制到 `work` 后运行：

```powershell
& "C:\Users\jjhgj'\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" work\extract_questions.py
```

它会重建 `app/data/question-bank.json`。
