(() => {
  "use strict";

  const LANGUAGE_STORAGE_KEY = "yaa-site-language-v1";
  const SUPPORTED_LANGUAGES = new Set(["ja", "en"]);
  const TRANSLATABLE_ATTRIBUTES = ["aria-label", "placeholder", "title"];
  const SKIPPED_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "NOSCRIPT"]);

  const ENGLISH = Object.freeze({
    "生活機能": "Life Support",
    "効率化機能": "Productivity Tools",
    "英語を筆記体へ変換（生活）": "Convert English to cursive (life)",
    "yaa-site | 明日の起床時間": "yaa-site | Wake-up Time Randomizer",
    "明日の起床時間": "Tomorrow's Wake-up Time",
    "起床時間の範囲からランダムに明日の時間を決定": "Randomly choose tomorrow's wake-up time from a time range",
    "明日の起床時間をランダムに決める": "Randomize Tomorrow's Wake-up Time",
    "起床時間の範囲を指定して、明日の起床時間を5分刻みでランダムに決定します。": "Choose a wake-up time range and randomly pick tomorrow's time in five-minute increments.",
    "起床時間の範囲": "Wake-up time range",
    "開始時刻": "Start time",
    "終了時刻": "End time",
    "明日の時間を決める": "Choose tomorrow's time",
    "まだ決まっていません": "Not decided yet",
    "明日の起床時間を決めました。": "Tomorrow's wake-up time has been decided.",
    "開始時刻と終了時刻を正しく入力してください。終了時刻は開始時刻より後にしてください。": "Enter a valid range where the end time is later than the start time.",
    "yaa-site | 便利ツール": "yaa-site | Utility Tools",
    "yaa-site | 生活機能": "yaa-site | Life Support",
    "yaa-site | 効率化機能": "yaa-site | Productivity Tools",
    "actual-size-print | 実寸画像印刷": "actual-size-print | Actual-size Image Printing",
    "yaa-site | 文字数カウント": "yaa-site | Character Count",
    "yaa-site | MD5ハッシュ生成": "yaa-site | MD5 Hash Generator",
    "yaa-site | メモ帳": "yaa-site | Notepad",
    "yaa-site | 英語筆記体変換": "yaa-site | English Cursive Converter",
    "yaa-site | ファイル形式変換": "yaa-site | File Converter",
    "yaa-site | 画像トリミング": "yaa-site | Image Cropper",
    "yaa-site | 画像カラー抽出": "yaa-site | Image Color Picker",
    "yaa-site | 画像合成・編集": "yaa-site | Image Composer",
    "yaa-site | ネオン文字生成": "yaa-site | Neon Text Generator",
    "yaa-site | 設定": "yaa-site | Settings",
    "yaa-site | 次の連休カウントダウン": "yaa-site | Next Long Holiday Countdown",
    "便利ツール": "Utility Tools",
    "必要な機能を選んで、ブラウザ内で手軽に使えます。": "Choose a tool and use it easily in your browser.",
    "サイトデータ管理": "Site data management",
    "全データ保存": "Save all data",
    "全データ読込": "Load all data",
    "ホームに戻る": "Back to home",
    "プライバシー情報": "Privacy information",
    "🔒 データはこのブラウザ内で処理": "🔒 Data is processed in this browser",
    "使う機能を選択": "Choose a tool",
    "各ボタンから専用画面を開けます。": "Open a dedicated screen from each button.",
    "実寸画像印刷": "Actual-size Image Printing",
    "画像をmm単位で配置し、正確なサイズのPDFを作成": "Place images in millimeters and create an accurately sized PDF",
    "文字数カウント": "Character Count",
    "文章を入力して、文字数・行数・バイト数をリアルタイム集計": "Count characters, lines, and bytes as you type",
    "MD5ハッシュ生成": "MD5 Hash Generator",
    "文字列やファイルからMD5ハッシュ値をブラウザ内で生成": "Generate an MD5 hash from text or a file in your browser",
    "文字列またはファイルからMD5ハッシュ値を生成します。入力データは外部へ送信されません。": "Generate an MD5 hash from text or a file. Your data never leaves the browser.",
    "文字列から生成": "Generate from text",
    "ハッシュ化する文字列": "Text to hash",
    "ここに文字列を入力してください。": "Enter text here.",
    "ファイルから生成": "Generate from file",
    "すべてのファイル形式に対応": "All file types are supported",
    "MD5を生成": "Generate MD5",
    "MD5ハッシュ値": "MD5 hash",
    "32文字のハッシュ値がここに表示されます": "The 32-character hash appears here",
    "コピー": "Copy",
    "クリア": "Clear",
    "MD5は改ざん耐性が弱いため、パスワード保存やセキュリティ用途には使用しないでください。": "MD5 is not collision-resistant. Do not use it for password storage or security purposes.",
    "MD5ハッシュを生成しました。": "MD5 hash generated.",
    "計算中です…": "Calculating…",
    "ファイルを読み込めませんでした。": "The file could not be read.",
    "MD5ハッシュをコピーしました。": "MD5 hash copied.",
    "メモ帳": "Notepad",
    "文章を入力してブラウザへ自動保存し、いつでも続きを編集": "Write notes, save them automatically in your browser, and continue editing anytime",
    "入力内容はこのブラウザへ自動保存され、次回も続きから編集できます。": "Your notes are saved automatically in this browser so you can continue next time.",
    "タイトル": "Title",
    "無題のメモ": "Untitled note",
    "メモ本文": "Note",
    "ここにメモを入力してください。": "Write your note here.",
    "TXT保存": "Save TXT",
    "すべて消去": "Clear all",
    "メモを自動保存しました。": "Note saved automatically.",
    "メモを保存できませんでした。": "The note could not be saved.",
    "保存済みのメモを読み込めませんでした。": "The saved note could not be loaded.",
    "コピーするメモがありません。": "There is no note to copy.",
    "メモをコピーしました。": "Note copied.",
    "保存するメモがありません。": "There is no note to save.",
    "メモをTXTファイルへ保存しました。": "Note saved as a TXT file.",
    "タイトルと本文をすべて消去しますか？": "Clear the title and all note text?",
    "メモを消去しました。": "Note cleared.",
    "英語筆記体変換": "English Cursive Converter",
    "英語の大文字・小文字をUnicodeの筆記体文字へ自動変換": "Convert uppercase and lowercase English letters to Unicode script",
    "ファイル形式変換": "File Converter",
    "画像やテキストをブラウザ内で別の形式へ変換": "Convert images and text to other formats in your browser",
    "画像トリミング": "Image Cropper",
    "画像上で範囲を選択し、指定した比率・形式で切り抜き": "Select an area and crop it to your chosen ratio and format",
    "画像カラー抽出": "Image Color Picker",
    "画像の特定位置から色を取得し、HEXカラーコードをコピー": "Pick a color from an image and copy its HEX code",
    "画像合成・編集": "Image Composer",
    "複数画像をレイヤーとして重ね、配置や透明度を編集して保存": "Layer images, adjust placement and opacity, then export",
    "ネオン文字生成": "Neon Text Generator",
    "発光文字や看板をデザインし、画像・SVG・動画で保存": "Design glowing text and signs, then export images, SVG, or video",
    "設定": "Settings",
    "日本語と英語を切り替え、サイト全体の表示言語を変更": "Switch between Japanese and English across the site",
    "開く →": "Open →",
    "次の連休カウントダウン": "Next Long Holiday Countdown",
    "次の3連休以上の連休までの日数と期間を表示": "Show the days and dates until the next holiday period of three or more consecutive days",
    "日本の土日・祝日・振替休日をもとに、次の3連休以上の期間を表示します。": "Shows the next period of three or more consecutive days off based on Japanese weekends, holidays, and substitute holidays.",
    "対象データ": "Data coverage",
    "2026年から2030年までの日本の祝日・休日を内蔵しています。": "Japanese holidays and days off from 2026 through 2030 are built in.",
    "春分の日・秋分の日は国立天文台の予測に基づきます。正式な日付は前年2月の官報で確定します。": "Vernal and autumnal equinox dates use National Astronomical Observatory forecasts. Official dates are confirmed in the Official Gazette in February of the preceding year.",
    "内閣府の祝日情報 ↗": "Cabinet Office holiday information ↗",
    "国立天文台の春分・秋分情報 ↗": "NAOJ equinox information ↗",
    "画像を指定した実寸サイズで印刷": "Print an image at a specified actual size",
    "幅・高さ・位置をmmで指定し、A判・B判の用紙へ配置したPDFを作成します。": "Specify width, height, and position in millimeters to create a PDF on A- or B-series paper.",
    "印刷設定": "Print settings",
    "1. 画像を追加": "1. Add images",
    "クリックまたはドロップ": "Click or drop",
    "画像を追加すると、ここに一覧が表示されます。": "Added images will appear here.",
    "配置画像一覧": "Placed image list",
    "2. 用紙": "2. Paper",
    "用紙": "Paper",
    "A4（210 × 297 mm）": "A4 (210 × 297 mm)",
    "A3（297 × 420 mm）": "A3 (297 × 420 mm)",
    "B5（182 × 257 mm）": "B5 (182 × 257 mm)",
    "はがき（100 × 148 mm）": "Postcard (100 × 148 mm)",
    "向き": "Orientation",
    "縦": "Portrait",
    "横": "Landscape",
    "プリンター実寸補正": "Printer Size Calibration",
    "テスト印刷の「指定した長さ」と「実際に測った長さ」から、印刷時の補正倍率を計算します。": "Calculate a print correction factor from the requested length and the measured printed length.",
    "指定した長さ（mm）": "Requested length (mm)",
    "実測した長さ（mm）": "Measured length (mm)",
    "プリンター実寸補正を有効にする": "Enable printer size calibration",
    "補正倍率：1.000000倍（補正なし）": "Correction factor: 1.000000× (no correction)",
    "例：指定100mm、実測95mm → 100 ÷ 95 = 1.052631…倍": "Example: requested 100 mm, measured 95 mm → 100 ÷ 95 = 1.052631…×",
    "印刷時はブラウザ・プリンター側の倍率を100% / 「実際のサイズ」にしてください。「用紙に合わせる」等の自動縮小はOFFを推奨します。": "When printing, set the browser and printer scale to 100% / Actual size. Turn off automatic scaling such as Fit to page.",
    "3. 選択画像の設定": "3. Selected image settings",
    "画像を追加して選択してください。": "Add and select an image.",
    "幅（mm）": "Width (mm)",
    "高さ（mm）": "Height (mm)",
    "縦横比を固定（推奨）": "Lock aspect ratio (recommended)",
    "X座標（mm）": "X position (mm)",
    "Y座標（mm）": "Y position (mm)",
    "配置位置": "Placement",
    "自由配置（現在位置）": "Custom (current position)",
    "左上": "Top left",
    "上中央": "Top center",
    "右上": "Top right",
    "左中央": "Center left",
    "中央": "Center",
    "右中央": "Center right",
    "左下": "Bottom left",
    "下中央": "Bottom center",
    "右下": "Bottom right",
    "配置位置を適用": "Apply placement",
    "複製": "Duplicate",
    "削除": "Delete",
    "コピー枚数（合計）": "Total copies",
    "コピーを追加": "Add copies",
    "4. 整列と出力": "4. Arrange and export",
    "すべての画像を自動整列": "Auto-arrange all images",
    "PDFを生成してダウンロード": "Generate and download PDF",
    "PDFの画像サイズと位置は、プレビューのpx値ではなくmm値から計算されます。": "PDF image sizes and positions are calculated from millimeter values, not preview pixels.",
    "印刷プレビュー": "Print preview",
    "プレビュー": "Preview",
    "A4・縦 — 210 × 297 mm": "A4 · Portrait — 210 × 297 mm",
    "表示は縮尺です": "Preview is scaled",
    "用紙プレビュー": "Paper preview",
    "画像をドラッグして自由に配置できます。座標入力で0.01mm単位の位置指定も可能です。": "Drag images to place them freely, or enter coordinates with 0.01 mm precision.",
    "文章を入力すると、各項目をリアルタイムで集計します。": "Enter text to update every count in real time.",
    "カウントする文章": "Text to count",
    "ここに文章を入力してください。": "Enter text here.",
    "文字数（空白含む）": "Characters (with spaces)",
    "文字数（空白除く）": "Characters (without spaces)",
    "行数": "Lines",
    "UTF-8バイト数": "UTF-8 bytes",
    "英語の大文字・小文字をUnicodeの Mathematical Script 文字へ変換します。": "Convert uppercase and lowercase English letters to Unicode Mathematical Script characters.",
    "変換前": "Before",
    "変換後（Unicode）": "After (Unicode)",
    "英字以外の文字は変更されません。表示には筆記体対応フォントが必要です。": "Non-English characters are unchanged. A script-capable font is required for display.",
    "変換結果をコピー": "Copy result",
    "ファイルを選び、変換先の形式を指定してダウンロードします。": "Choose a file and output format, then download the converted file.",
    "ファイルを選択またはドロップ": "Choose or drop a file",
    "画像 / テキスト": "Image / Text",
    "ファイル未選択": "No file selected",
    "ファイルが選択されていません。": "No file is selected.",
    "対応形式：画像（PNG / JPG / WebP / SVG）、テキスト（TXT / CSV / JSON / MD / HTML）": "Supported: images (PNG / JPG / WebP / SVG), text (TXT / CSV / JSON / MD / HTML)",
    "変換先": "Convert to",
    "変換してダウンロード": "Convert and download",
    "画像はCanvasで変換します。テキストはTXT・HTML・JSONへ変換できます。": "Images are converted with Canvas. Text can be converted to TXT, HTML, or JSON.",
    "PNG画像": "PNG image",
    "JPG画像": "JPG image",
    "WebP画像": "WebP image",
    "プレーンテキスト（TXT）": "Plain text (TXT)",
    "HTML（テキスト）": "HTML (text)",
    "JSON（textプロパティ）": "JSON (text property)",
    "画像上をドラッグして切り抜く範囲を選択し、別ファイルとして保存します。": "Drag on an image to select a crop area and save it as a new file.",
    "トリミング設定": "Crop settings",
    "画像を選択またはドロップ": "Choose or drop an image",
    "選択比率": "Aspect ratio",
    "自由": "Free",
    "幅（px）": "Width (px)",
    "高さ（px）": "Height (px)",
    "画像全体を選択": "Select entire image",
    "保存形式": "Export format",
    "画質": "Quality",
    "トリミングしてダウンロード": "Crop and download",
    "画像を追加すると編集画面が表示されます。": "Add an image to open the editor.",
    "画像トリミング編集画面": "Image crop editor",
    "画像上をドラッグして範囲を選択できます。数値入力は元画像のピクセル単位です。": "Drag to select an area. Numeric inputs use source-image pixels.",
    "画像から色を抽出": "Pick a color from an image",
    "画像上の調べたい部分をクリックして、ピクセルの色とHEXカラーコードを取得します。": "Click a point on the image to get its pixel color and HEX code.",
    "カラー抽出設定": "Color picker settings",
    "選択色": "Selected color",
    "HEXカラーコード": "HEX color code",
    "画像をクリックして色を選択してください。": "Click the image to select a color.",
    "HEXをコピー": "Copy HEX",
    "最近選んだ色": "Recently selected colors",
    "履歴を消去": "Clear history",
    "画像を追加すると、色を選択できる画面が表示されます。": "Add an image to open the color picker.",
    "色を抽出する画像": "Image for color picking",
    "クリックまたは指で触れた位置の色を取得します。ドラッグしながら色を探すこともできます。": "Pick the color at a clicked or touched point. You can also drag to inspect colors.",
    "画像合成・レイヤー編集": "Image Composer and Layer Editor",
    "複数画像を重ね、位置・大きさ・回転・透明度・重なり順を編集して保存します。": "Layer images, edit position, size, rotation, opacity, and order, then export.",
    "画像合成設定": "Image composer settings",
    "複数画像を選択またはドロップ": "Choose or drop multiple images",
    "キャンバス": "Canvas",
    "背景を透明にする": "Transparent background",
    "背景色": "Background color",
    "キャンバスサイズを適用": "Apply canvas size",
    "元に戻す": "Undo",
    "やり直す": "Redo",
    "レイヤー": "Layers",
    "縦横比を固定": "Lock aspect ratio",
    "回転": "Rotation",
    "透明度": "Opacity",
    "前面へ": "Move forward",
    "背面へ": "Move backward",
    "書き出し": "Export",
    "合成画像をダウンロード": "Download composed image",
    "複数画像を追加すると編集を開始できます。": "Add multiple images to start editing.",
    "画像合成編集キャンバス": "Image composition canvas",
    "画像をドラッグして移動できます。右下の四角をドラッグするとサイズ変更できます。Deleteキーで選択画像を削除できます。": "Drag images to move them. Drag the lower-right handle to resize. Press Delete to remove the selected image.",
    "ネオン風の文字・看板を生成": "Create neon-style text and signs",
    "文字、発光、背景、看板枠、点滅を調整し、画像・SVG・アニメーションで保存できます。": "Adjust text, glow, background, sign frame, and flicker, then export as an image, SVG, or animation.",
    "ネオン文字設定": "Neon text settings",
    "文字": "Text",
    "表示する文字": "Display text",
    "プリセット": "Preset",
    "エレクトリック": "Electric",
    "ホットピンク": "Hot Pink",
    "サイバー": "Cyber",
    "サンセット": "Sunset",
    "グリーン": "Green",
    "ゴールド": "Gold",
    "書体": "Font",
    "ゴシック": "Sans serif",
    "丸ゴシック": "Rounded sans",
    "明朝": "Serif",
    "等幅": "Monospace",
    "筆記体": "Cursive",
    "文字サイズ": "Font size",
    "太さ": "Weight",
    "標準": "Regular",
    "太字": "Bold",
    "極太": "Extra bold",
    "文字間隔": "Letter spacing",
    "行間": "Line height",
    "文字揃え": "Alignment",
    "左": "Left",
    "右": "Right",
    "書字方向": "Writing direction",
    "横書き": "Horizontal",
    "縦書き": "Vertical",
    "斜体にする": "Italic",
    "色と発光": "Color and glow",
    "ネオン色": "Neon color",
    "グラデーション色": "Gradient color",
    "2色グラデーション": "Two-color gradient",
    "発光の強さ": "Glow strength",
    "発光の広がり": "Glow spread",
    "ネオン管の太さ": "Tube width",
    "背景と看板": "Background and sign",
    "背景": "Background",
    "レンガ壁": "Brick wall",
    "暗い壁": "Dark wall",
    "単色": "Solid color",
    "透明": "Transparent",
    "背景色プリセット": "Background color presets",
    "ミッドナイト": "Midnight",
    "ブラック": "Black",
    "チャコール": "Charcoal",
    "レンガ": "Brick",
    "ネイビー": "Navy",
    "パープル": "Purple",
    "フォレスト": "Forest",
    "アンバー": "Amber",
    "ネオン看板枠を付ける": "Add neon sign frame",
    "枠の色": "Frame color",
    "アニメーション": "Animation",
    "点滅プレビューを有効にする": "Enable flicker preview",
    "点滅速度": "Flicker speed",
    "WebMとGIFは3秒間のループ用アニメーションとして生成します。": "WebM and GIF exports are generated as three-second looping animations.",
    "ネオン単体データ": "Neon-only data",
    "設定JSONを保存": "Save settings JSON",
    "設定JSONを読込": "Load settings JSON",
    "文字・色・背景・点滅などの全設定を保存します。編集中の設定はこのブラウザにも自動保存されます。": "Save all text, color, background, and flicker settings. Current settings are also saved automatically in this browser.",
    "保存・共有": "Export and share",
    "CSSをコピー": "Copy CSS",
    "設定をリセット": "Reset settings",
    "ライブプレビュー": "Live preview",
    "ネオン文字プレビュー": "Neon text preview",
    "生成CSS": "Generated CSS",
    "透明背景はPNG・WebP・SVGに反映されます。GIFは仕様上、背景色を使った不透明画像になります。": "Transparent backgrounds are preserved in PNG, WebP, and SVG. GIF exports use the selected background color and are opaque.",
    "サイト全体の表示方法を変更します。": "Change display preferences for the entire site.",
    "言語": "Language",
    "表示言語": "Display language",
    "変更はすべての機能にすぐ反映され、このブラウザに保存されます。": "Changes apply immediately to every tool and are saved in this browser.",
    "サイトデータ": "Site data",
    "このサイトの各機能のデータをJSONファイルに保存し、あとから読み込めます。": "Save each tool's data to a JSON file and load it later.",
    "画像、配置、文章、カラー履歴、画像合成の操作履歴、ネオン設定、表示言語をまとめて保存します。": "Save images, placements, text, color history, image edit history, neon settings, and display language together.",
    "指定した長さは0より大きい数値で入力してください。": "Enter a requested length greater than 0.",
    "実測した長さは0より大きい数値で入力してください。": "Enter a measured length greater than 0.",
    "補正倍率：計算できません": "Correction factor: unavailable",
    "コピーする変換結果がありません。": "There is no converted result to copy.",
    "変換結果をクリップボードへコピーしました。": "Copied the converted result to the clipboard.",
    "自動コピーできませんでした。選択状態なのでCtrl+Cでコピーしてください。": "Automatic copy failed. The text is selected; press Ctrl+C to copy it.",
    "対応していない形式です。画像またはテキストファイルを選択してください。": "Unsupported format. Choose an image or text file.",
    "TXT / HTML / JSONへ変換できます。文字コードはUTF-8として読み込みます。": "Can be converted to TXT, HTML, or JSON. Text is read as UTF-8.",
    "変換先を選択してダウンロードしてください。": "Choose an output format and download the file.",
    "画像を変換できませんでした。": "The image could not be converted.",
    "画像の変換に失敗しました。": "Image conversion failed.",
    "変換してダウンロードしました。": "Converted and downloaded the file.",
    "配置位置を更新しました。": "Updated the placement.",
    "画像を複製しました。": "Duplicated the image.",
    "画像を削除しました。": "Deleted the image.",
    "画像を自動整列しました。用紙外にはみ出した画像は警告で確認できます。": "Auto-arranged the images. Check the warning for any image outside the paper.",
    "画像の配置を更新しました。": "Updated the image position.",
    "プリンター実寸補正が有効ですが、補正値が正しくありません。入力を確認してください。": "Printer size calibration is enabled, but its values are invalid. Check the inputs.",
    "PDFライブラリを読み込めませんでした。ネットワーク接続を確認してください。": "The PDF library could not be loaded. Check your network connection.",
    "PDFを生成しました。印刷時は「実際のサイズ」または倍率100%を選択してください。": "Generated the PDF. When printing, choose Actual size or 100% scale.",
    "サイト全体バックアップから変換元を復元しました。": "Restored the converter source from the site backup.",
    "サイト全体バックアップから実寸印刷と文章データを復元しました。": "Restored actual-size print and text data from the site backup.",
    "X・Yは0以上、幅・高さは1以上の数値で入力してください。": "Enter X and Y as 0 or greater, and width and height as 1 or greater.",
    "画像全体を選択しました。": "Selected the entire image.",
    "画像の書き出しに失敗しました。別の保存形式を試してください。": "Image export failed. Try another format.",
    "PNG / JPG / WebP画像を選択してください。": "Choose a PNG, JPG, or WebP image.",
    "画像を読み込めませんでした。": "The image could not be loaded.",
    "トリミング画像を復元できませんでした": "The cropper image could not be restored",
    "トリミングデータが不正です": "The cropper data is invalid",
    "トリミング画像形式が不正です": "The cropper image format is invalid",
    "画像を読み込みました。ドラッグして範囲を選択してください。": "Loaded the image. Drag to select an area.",
    "サイト全体バックアップからトリミング状態を復元しました。": "Restored the cropper state from the site backup.",
    "色の履歴を消去しました。": "Cleared the color history.",
    "画像を読み込みました。調べたい部分をクリックしてください。": "Loaded the image. Click the point you want to inspect.",
    "カラー抽出画像を復元できませんでした": "The color picker image could not be restored",
    "カラー抽出データが不正です": "The color picker data is invalid",
    "カラー抽出画像形式が不正です": "The color picker image format is invalid",
    "サイト全体バックアップからカラー抽出状態を復元しました。": "Restored the color picker state from the site backup.",
    "ひとつ前の状態へ戻しました。": "Undid the last action.",
    "操作をやり直しました。": "Redid the action.",
    "レイヤーを更新しました。": "Updated the layer.",
    "キャンバス幅・高さは1〜8000pxで入力してください。": "Enter a canvas width and height from 1 to 8000 px.",
    "位置は数値、幅・高さは1以上で入力してください。": "Enter numeric positions and a width and height of at least 1.",
    "選択したレイヤーを削除しました。": "Deleted the selected layer.",
    "画像の書き出しに失敗しました。別の形式を試してください。": "Image export failed. Try another format.",
    "画像合成の状態が不正です": "The image composition state is invalid",
    "画像合成の画像データが不足しています": "Image data is missing from the composition",
    "画像合成データが不正です": "The image composition data is invalid",
    "サイト全体バックアップから画像合成と操作履歴を復元しました。": "Restored the image composition and edit history from the site backup.",
    "画像の生成に失敗しました。": "Image generation failed.",
    "SVGをダウンロードしました。点滅設定もSVG内に含まれます。": "Downloaded the SVG. Flicker settings are included in the SVG.",
    "編集設定をJSONファイルへ保存しました。": "Saved the edit settings to a JSON file.",
    "設定ファイルが大きすぎます。1MB以下のJSONを選択してください。": "The settings file is too large. Choose a JSON file of 1 MB or less.",
    "対応していない設定ファイルです": "Unsupported settings file",
    "ネオン文字データが不正です": "The neon text data is invalid",
    "生成したCSSをコピーしました。": "Copied the generated CSS.",
    "CSSをコピーできませんでした。表示欄から手動でコピーしてください。": "Could not copy the CSS. Copy it manually from the output field.",
    "このブラウザはWebM生成に対応していません。ChromeまたはEdgeをお試しください。": "This browser does not support WebM generation. Try Chrome or Edge.",
    "WebMを生成しています…": "Generating WebM…",
    "3秒のWebMをダウンロードしました。": "Downloaded a three-second WebM.",
    "WebM 3秒": "WebM 3 sec",
    "GIF 3秒": "GIF 3 sec",
    "GIFを生成しています… しばらくお待ちください。": "Generating GIF… Please wait.",
    "設定を初期状態に戻しました。": "Reset settings to their defaults.",
    "サイト全体バックアップからネオン設定を復元しました。": "Restored neon settings from the site backup.",
    "前回の編集設定をこのブラウザから復元しました。": "Restored the previous edit settings from this browser.",
    "全データをまとめています…": "Preparing all data…",
    "yaa-siteのバックアップではありません": "This is not a yaa-site backup",
    "対応していないバックアップ形式です": "Unsupported backup format",
    "機能データがありません": "No tool data was found",
    "バックアップが大きすぎます。250MB以下のJSONを選択してください。": "The backup is too large. Choose a JSON file of 250 MB or less.",
    "全データを読み込んでいます…": "Loading all data…",
    "形式変換の画像データが不正です": "The converter image data is invalid",
    "形式変換データの種類が不正です": "The converter data type is invalid",
    "基本機能データが不正です": "The core tool data is invalid",
    "サイトデータ機能の登録内容が不正です": "The site data module registration is invalid",
    "対応していない言語です": "Unsupported language",
    "言語設定データが不正です": "The language settings data is invalid",
    "表示言語を日本語に変更しました。": "Display language changed to Japanese.",
    "表示言語を英語に変更しました。": "Display language changed to English."
  });

  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  let language = loadLanguage();

  function loadLanguage() {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return SUPPORTED_LANGUAGES.has(saved) ? saved : "ja";
    } catch {
      return "ja";
    }
  }

  function translateJapanese(source) {
    if (ENGLISH[source]) return ENGLISH[source];

    const replacements = [
      [/^補正倍率：([\d.]+)倍（有効）$/, "Correction factor: $1× (enabled)"],
      [/^補正倍率：([\d.]+)倍（OFF）$/, "Correction factor: $1× (off)"],
      [/^選択範囲：(.+)$/, "Selection: $1"],
      [/^(.+)pxで保存しました。$/, "Saved at $1 px."],
      [/^(PNG|JPG|WEBP)をダウンロードしました。$/, "Downloaded $1."],
      [/^(.+) × (.+)px。PNG \/ JPG \/ WebPへ変換できます。$/, "$1 × $2 px. Can be converted to PNG, JPG, or WebP."],
      [/^PDF出力サイズ：(.+)$/, "PDF output size: $1"],
      [/^PDF出力サイズ（補正後）：(.+)$/, "PDF output size (corrected): $1"],
      [/^(\d+)枚を配置中。画像を選択して寸法・座標を編集できます。$/, "$1 image(s) placed. Select an image to edit its size and coordinates."],
      [/^対応形式ではないファイルを(\d+)件スキップしました。$/, "Skipped $1 unsupported file(s)."],
      [/^(\d+)枚の画像を追加しました。$/, "Added $1 image(s)."],
      [/^(\d+)枚になるようにコピーを追加しました。$/, "Added copies for a total of $1."],
      [/^キャンバスを(.+)pxに変更しました。$/, "Changed the canvas to $1 px."],
      [/^(\d+)枚の画像を追加しました。 対応外を(\d+)件スキップしました。$/, "Added $1 image(s). Skipped $2 unsupported file(s)."],
      [/^(.+)の色を取得しました。$/, "Picked the color at $1."],
      [/^(#[0-9A-Fa-f]{6,8})をクリップボードへコピーしました。$/, "Copied $1 to the clipboard."],
      [/^(#[0-9A-Fa-f]{6,8})をコピーしました。$/, "Copied $1."],
      [/^「(.+)」から編集設定を読み込みました。$/, "Loaded edit settings from “$1”."],
      [/^設定を読み込めませんでした: (.+)$/, (_, detail) => `Could not load settings: ${translateJapanese(detail)}`],
      [/^GIFを生成しています… (\d+)%$/, "Generating GIF… $1%"],
      [/^3秒のGIFをダウンロードしました(?:（(.+)）)?。$/, (_, size) => size ? `Downloaded a three-second GIF (${size}).` : "Downloaded a three-second GIF."],
      [/^GIFを生成できませんでした: (.+)$/, (_, detail) => `Could not generate GIF: ${translateJapanese(detail)}`],
      [/^WebMを生成できませんでした: (.+)$/, (_, detail) => `Could not generate WebM: ${translateJapanese(detail)}`],
      [/^全データを保存しました（(.+)）。$/, "Saved all data ($1)."],
      [/^全データを保存できませんでした: (.+)$/, (_, detail) => `Could not save all data: ${translateJapanese(detail)}`],
      [/^全データを読み込みました（(\d+)機能）。$/, "Loaded all data ($1 modules)."],
      [/^全データを読み込めませんでした: (.+)$/, (_, detail) => `Could not load all data: ${translateJapanese(detail)}`],
      [/^(.+)を読み込めませんでした。$/, "$1 could not be loaded."],
      [/^(.+)は画像として読み込めませんでした。$/, "$1 could not be loaded as an image."],
      [/^(.+)を選択$/, "Select $1"],
      [/^(.+)。ドラッグして配置$/, "$1. Drag to position"],
      [/^(.+)（コピー）$/, "$1 (copy)"],
      [/^画像(\d+)$/, "Image $1"],
      [/^素材(\d+)$/, "Asset $1"],
      [/^実寸印刷の画像(\d+)が不正です$/, "Actual-size print image $1 is invalid"],
      [/^画像合成の素材(\d+)が不正です$/, "Image composition asset $1 is invalid"],
      [/^(.+)は登録済みです$/, "$1 is already registered"]
    ];

    for (const [pattern, replacement] of replacements) {
      if (pattern.test(source)) return source.replace(pattern, replacement);
    }

    const paperSummary = source.match(/^(.+)・(縦|横) — (.+)$/);
    if (paperSummary) {
      const paper = paperSummary[1] === "はがき" ? "Postcard" : paperSummary[1];
      return `${paper} · ${paperSummary[2] === "縦" ? "Portrait" : "Landscape"} — ${paperSummary[3]}`;
    }

    const imageMeta = source.match(/^(.+)（出力 (.+)）$/);
    if (imageMeta) return `${imageMeta[1]} (output ${imageMeta[2]})`;

    const colorDetails = source.match(/^RGB\((.+)\)・透明度 (.+)%(?:・座標 \((.+)\)px|・履歴から選択)$/);
    if (colorDetails) {
      const location = colorDetails[3] ? ` · coordinates (${colorDetails[3]}) px` : " · selected from history";
      return `RGB(${colorDetails[1]}) · opacity ${colorDetails[2]}%${location}`;
    }

    const overflow = source.match(/^用紙範囲外の画像があります：(.+)。赤い枠の部分はPDFでも用紙外にはみ出します。$/);
    if (overflow) {
      const details = overflow[1]
        .replaceAll("左", "left")
        .replaceAll("上", "top")
        .replaceAll("右", "right")
        .replaceAll("下", "bottom")
        .replaceAll("・", ", ")
        .replaceAll("、", "; ")
        .replaceAll("（", " (")
        .replaceAll("）", ")");
      return `Some images are outside the paper: ${details}. Areas with a red border will also extend beyond the PDF page.`;
    }

    return source;
  }

  function translate(source) {
    return language === "en" ? translateJapanese(String(source)) : String(source);
  }

  function splitWhitespace(value) {
    const match = String(value).match(/^(\s*)([\s\S]*?)(\s*)$/);
    return { before: match[1], content: match[2], after: match[3] };
  }

  function shouldSkipTextNode(node) {
    return !node.parentElement || SKIPPED_TAGS.has(node.parentElement.tagName) || node.parentElement.closest("[data-i18n-ignore]");
  }

  function syncTextNode(node, acceptCurrent = false) {
    if (shouldSkipTextNode(node)) return;
    const current = node.nodeValue;
    let source = originalText.get(node);
    if (source === undefined || (acceptCurrent && current !== source && current !== renderText(source))) {
      source = current;
      originalText.set(node, source);
    }
    const target = renderText(source);
    if (current !== target) node.nodeValue = target;
  }

  function renderText(source) {
    const parts = splitWhitespace(source);
    return `${parts.before}${translate(parts.content)}${parts.after}`;
  }

  function getAttributeSources(element) {
    let sources = originalAttributes.get(element);
    if (!sources) {
      sources = new Map();
      originalAttributes.set(element, sources);
    }
    return sources;
  }

  function syncAttribute(element, attribute, acceptCurrent = false) {
    if (!element.hasAttribute(attribute)) return;
    const current = element.getAttribute(attribute);
    const sources = getAttributeSources(element);
    let source = sources.get(attribute);
    if (source === undefined || (acceptCurrent && current !== source && current !== translate(source))) {
      source = current;
      sources.set(attribute, source);
    }
    const target = translate(source);
    if (current !== target) element.setAttribute(attribute, target);
  }

  function syncElement(element, acceptCurrent = false) {
    if (!(element instanceof Element) || SKIPPED_TAGS.has(element.tagName) || element.closest("[data-i18n-ignore]")) return;
    for (const attribute of TRANSLATABLE_ATTRIBUTES) syncAttribute(element, attribute, acceptCurrent);
    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) syncTextNode(child, acceptCurrent);
    }
  }

  function syncSubtree(root, acceptCurrent = false) {
    if (root.nodeType === Node.TEXT_NODE) {
      syncTextNode(root, acceptCurrent);
      return;
    }
    if (!(root instanceof Element) && root !== document) return;
    if (root instanceof Element) syncElement(root, acceptCurrent);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) syncTextNode(node, acceptCurrent);
      else syncElement(node, acceptCurrent);
      node = walker.nextNode();
    }
  }

  function refresh() {
    document.documentElement.lang = language;
    const select = document.querySelector("#languageSelect");
    if (select) select.value = language;
    syncSubtree(document);
  }

  function setLanguage(nextLanguage, announce = true) {
    if (!SUPPORTED_LANGUAGES.has(nextLanguage)) throw new Error("対応していない言語です");
    language = nextLanguage;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // localStorageが使えない場合も、現在のタブでは言語切替を続けます。
    }
    refresh();
    const status = document.querySelector("#languageStatus");
    if (announce && status) {
      status.textContent = language === "en" ? "Display language changed to English." : "表示言語を日本語に変更しました。";
    }
    window.dispatchEvent(new CustomEvent("yaa:languagechange", { detail: { language } }));
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") syncTextNode(mutation.target, true);
      if (mutation.type === "attributes") syncAttribute(mutation.target, mutation.attributeName, true);
      for (const node of mutation.addedNodes) syncSubtree(node, true);
    }
  });

  window.YaaI18n = Object.freeze({
    getLanguage: () => language,
    locale: () => language === "en" ? "en-US" : "ja-JP",
    refresh,
    setLanguage,
    translate,
  });
  refresh();
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: TRANSLATABLE_ATTRIBUTES,
  });

  const languageSelect = document.querySelector("#languageSelect");
  languageSelect?.addEventListener("change", (event) => setLanguage(event.target.value));
  window.YaaSiteData?.register("settings", {
    exportData: () => ({ language }),
    importData(data) {
      if (!data || typeof data !== "object" || !SUPPORTED_LANGUAGES.has(data.language)) throw new Error("言語設定データが不正です");
      setLanguage(data.language, false);
    },
  });
})();
