<p align="center">
  <p align="center">
    <picture>
     <source width=150 height=150 media="(prefers-color-scheme: dark)" srcset="doc/logo-circle.png" style="border-radius:100px">
     <source width=150 height=150 media="(prefers-color-scheme: light)" srcset="doc/logo-circle.png">
        <img alt="viforest logo and slogan" src="">
    </picture>
  </p>
	<h1 align="center"><b>viforest</b></h1>
	<p align="center">
	A beautiful and open-source UI alternative to the default Viwoods WLAN transfer tool.
    <br />
    <a href="https://github.com/woflydev/viforest/releases"><strong>Get Started! »»»</strong></a>
    <br />
    <br />
    <b>Compatible with </b> <br/>
	MacOS ·
	Windows ·
	Linux
    <br />
    <br />
    <b>Not Supported </b> <br/>
	Android ·
    iOS
    <br />
    <br />
    <b>Tested On </b> <br/>
	MacOS
  </p>
<br />

> [!WARNING]  
> **_viforest_ is still under active development**. <br />
> Please check the [changelog](https://github.com/woflydev/viforest/blob/main/viforest/CHANGELOG.md) for the roadmap for future features and changes.
>
> **I am not affiliated with Viwoods in any way. This is an educational project that uses publicly accessible APIs.**

> [!CAUTION]
> **Installation (especially on MacOS) requires you to do some extra steps.**
>
> **MacOS**: Because I don't have a MacOS developer license, I can't sign the app. MacOS will say something along the lines of "this app is broken and cannot be opened" when you try to run it. You will need to allow the app to run by going to **System Preferences > Security & Privacy > General**, scrolling down, and clicking **"Open Anyway"** when prompted. If you don't see this option, right click the app in your **Applications** folder and select **"Open"**, then check again. On newer versions of MacOS, you will also have to allow the app to access your Downloads folder and your local network (to talk to the AIPaper). You can do this by going to **System Preferences > Security & Privacy > Privacy** and enabling **"Files and Folders"** and **"Local Network"**.
>
> **Windows**: Likewise, I haven't signed the application for Windows, so your system will likely pop up with a SmartScreen warning. You can ignore this warning and click **"Run Anyway"**.
>
> If you are concerned about this, I've written a little about the safety of **_viforest_** in the FAQ section below.

<p align="center">
    <picture>
         <source media="(prefers-color-scheme: dark)" srcset="doc/viforest-hero.png" style="border-radius:100px">
         <source media="(prefers-color-scheme: light)" srcset="doc/viforest-hero.png" style="border-radius:100px">
            <img alt="viforest hero" src="">
        </picture>
</p>

# Motivations

One of my main use-cases for the AIPaper is importing various PDFs and notes from my laptop for reading and annotation. I also frequently use OneNote, and having to convert every single page to a PDF (as OneNote for MacOS doesn't allow batch file conversion) and then going through the janky upload process using the default Viwoods WLAN Transfer tool is incredibly tedious.

Enter **_viforest_**! This extremely creatively named app streamlines WLAN transfer for your Viwoods AIPaper. For OneNote pages (and anything with HTML copy support like Microsoft Word), simply copy the page or content you want to upload, navigate to the folder of your choice using **_viforest_**, and paste (CMD+V or CTRL+V)! OneNote import supports images and text as of now, but I plan to improve the import functionality with better formatting later on.

# Features

### **Revamped UI**
Beautiful user interface with support for both light and dark mode, built with [shadcn/ui](https://ui.shadcn.com/) and [TailwindCSS](https://tailwindcss.com/).

### Device Auto-Connect
Stop looking for your WLAN Transfer address! **_viforest_** allows you to add as many IP addresses as you want and automatically connects to the IP that corresponds to the network you're on.

### Quick Access Bar
Save your favourite folders to the quick access bar for one-click upload!

### OneNote Integration
Upload your OneNote pages (including images!) directly to your device by simply pasting them into the app. **_viforest_** will automatically upload them to the current folder.

### Bulk Upload
Select as many PDFs as you want to upload to your device all at once!

### Direct File Access
Stop wasting time! Unlike the ViTransfer app, **_viforest_** directly interfaces with your device, so any PDFs you upload will instantly appear in your Learning, Paper, or other Picking folders.

### Feature Complete (almost)
Almost all functionality from the original Viwoods WLAN Transfer interface is fully implemented.

# FAQ
1. Is **_viforest_** an official app?
   - No, no, and no. If you run into issues, please don't bother the Viwoods team about it! Instead, create an [issue](https://github.com/woflydev/viforest/issues) in this repository.
2. Will there be an Android or iOS version?
    - As much as I'd like to bring **_viforest_** to mobile, I don't have the time or resources to do so (the Apple Developer License is rather expensive). I will consider Android if I find the time.
3. Is **_viforest_** safe?
   - This project is open source. Anyone can read the code, which means anyone can find and fix any security vulnerabilities that I may have overlooked. **_viforest_** also only uses official Viwoods APIs (i.e., when interacting with files on your device, it goes through all the same channels as the official client). All network traffic is on your local network between you and your device. All the extra features **_viforest_** has are client-side, so it shouldn't void your warranty (I'm not a lawyer, this is an opinion).
4. Can I ask for a feature?
   - I primarily made **_viforest_** to fulfill my own workflow needs, so I have a list of future features I'm planning on implementing. But feel free to open an issue or fork the repository to make your own changes! You can check the [CHANGELOG.md](https://github.com/woflydev/viforest/blob/main/viforest/CHANGELOG.md) file for the current roadmap.
5. I want to support this app, what can I do?
   - Report any bugs you find! I'm very busy but will try and address them as soon as I can.
6. Your code is disgusting, can I fix it?
   - Sure lol


# Changelog & Planned Features

Please view past versions and planned features in the [CHANGELOG.md](https://github.com/woflydev/viforest/blob/main/viforest/CHANGELOG.md) file.

<br />

<p align="center">
    <picture>
         <source media="(prefers-color-scheme: dark)" srcset="doc/viforest-cxn.png" style="border-radius:100px">
         <source media="(prefers-color-scheme: light)" srcset="doc/viforest-cxn.png">
            <img alt="viforest multi-connection support" src="">
        </picture>
</p>

# Architecture

**_viforest_** is built with [Tauri](https://v2.tauri.app/), [Next.js](https://nextjs.org/), [React](https://react.dev/), [shadcn/ui](https://ui.shadcn.com/), [TypeScript](https://www.typescriptlang.org/), and [TailwindCSS](https://tailwindcss.com/).

Made with 💙 by [woflydev](https://woflydev.com).

# License

**_viforest_** is open-sourced under the GNU General Public License v3.0. This means that any copy or modification of the original code must be released under the same license.

# Contributing

Found a bug or want to add a feature yourself? Fork the project and submit a pull request! (it's a mess of a codebase so have fun lol)
