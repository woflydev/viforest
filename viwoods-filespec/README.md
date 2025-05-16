# The Viwoods ".note" Format

## Overview

Let me just preface this by saying that there's really not much _to_ say. The `.note` file you get from the AIPaper is simply a `.zip` file. If you want to try poking around yourself, simply download the `.note` file and rename it with a `.zip` extension. The unzipped directory has the following structure:

```txt
.
├── <name>_HeaderInfo.json
├── <name>_NotesBean.json
├── <name>_NoteList.json
├── <name>_<pageID>_LayoutImage.json
├── <name>_<pageID>_LayoutText.png
├── PATH_<pageID>.json
├── <pageID>.png
├── thumbnai.png (WHY IS THIS SPELT WRONG???)
```

All JSON files are in standard UTF-8, so you can open it with a text editor or an IDE like VSCode. 

## Purpose of Files

### HeaderInfo.json
This small JSON holds app-specific metadata, not user content.

```json
{
  "appVersion": "104",
  "dbVersion": 8,
  "packageName": "com.wisky.captureLog"
}
```

It likely indicates the version of the app (in this case, "Picking") and database schema (e.g. version 104) and the Android package name.

### NotesBean.json
This JSON holds note-level metadata. For example:

```json
{
  "noteId": "17471854767311408",
  "noteName": "Learning 2",
  "nickname": "<name of the file visible to user>",
  "userId": "<redacted>",
  "createTime": 1747185476731,
  "upTime": 1747377568479,
  "pageCount": 1,
  "currentPage": 1,
  "isChose": false,
  "imgUrl": ""
}
```

Most of these fields are pretty self explanatory.

`createTime` and `upTime` are epoch timestamps of creation and last update (probably).

### NoteList.json
This file is a list of pages in the note. The file I exported only had one page, however.

```json
[
  {
    "isChose": false,
    "noteId": "17471854767311408",
    "pageId": "17471854767391408",
    "pathFile": "/storage/emulated/0/.../<userID redacted>/17471854767311408/hand_path/PATH_17471854767391408.json",
    "pathOrder": 1207,
    "smallOrderId": "1747185476739.1"
  }
]
```

Each entry corresponds to one page.

A key of interest is `pathFile`, which is the path to the JSON file that contains the path data for this page (covered below).

### LayoutImage.json
This JSON describes any bitmap images inserted into the page (imported images). In this example it’s an empty array ([]) as there were no images inserted into my exported note.

```json
[] (my file didn't have images)
```

However, if there were images, each object would probably specify the image file, its position (x,y), size, or layer order.

### LayoutText.json
This JSON describes any text boxes or typed text placed on the page. It’s also an empty array here because I didn't have any. 

```json
[] (my file didn't have text)
```

As with images, if there were text boxes, each object would probably specify the text, its position (x,y), size, or layer order.

### Handwritten Data (PATH JSON)

The actual handwriting/strokes are stored in two ways. 

1. `PATH_<pageID>.json`: This is a JSON array of point data capturing the pen strokes. Each element is a list `[x, y, t]`. For example, the first few entries (sorted by Y) might look like `[911, 27, 552]`, `[913, 28, 551]`, etc. The first two numbers are the (x, y) pixel coordinates on the page canvas (the display is 1920×2560px, and these values line up with that resolution). The third number is PROBABLY a timestamp or stroke identifier. If not, my guess would be that it's the pressure of the pen.

2. `<pageID>.png`: This is a rendered image of the page canvas including all pen strokes and a transparent background. It's a PNG with an alpha channel (RGBA). This might be used as a snapshot of all the handwriting on the page, OR for exporting (e.g. sending to PDF).

3. `thumbnai.jpg` is just a JPEG thumbnail for the UI (likely a downscaled version of the first page). **WHY** IS IT SPELT WRONG??? Infuriating.

# Conclusion

TLDR; The Viwoods `.note` format is basically just a `.zip` file with a few JSON files and a PNG image. I'm too busy to do a proper full analysis or actually do anything with this information (**_viforest_** fulfills all my workflow needs!) but this is just my two cents to hopefully kickstart some open-source initiatives around the AIPaper.

# License

These findings are licensed under the GNU General Public License v3.0. This means that any copy or modification of it must be released under the same license.