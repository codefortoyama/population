# 10月前後の住民基本台帳人口（47地点）の入手可否

国勢調査（2025-10-01）に近い時点（2025年9月末または10月1日）の**住民基本台帳人口**を、各市が公表しているかを調べた一覧（2026-10-18調査）。
全国タブは2015・2020・2025年分を、この一覧と追加調査の同時点の値に置き換えた（2026-10-20。2015/2020年の採用値と出典は `docs/NATIONAL_JUKI_SOURCES.md`）。2010年は2011年3月31日の値を使っている。

- 対象は住民登録ベースの数字だけ。国勢調査ベースの「推計人口」「現住人口」は対象外（同じページに並んでいる市が多いので注意）。
- 「2025年総人口」は各市の公表ファイル・ページで確認した値。参考として、総務省の2026年1月1日の値との差を付けた（全市±0.3%以内）。
- 過去年＝2015年・2020年の同じ時点の値がサイトに残っているか。「あり（値確認）」は数値まで確認、「あり」はファイル・ページの存在だけ確認。

## まとめ

- **47地点中44地点で入手できる**。取れないのは秋田市・山形市・高松市の3地点。東京23区は東京都の毎月公表（区部＝23区合計）から取得した。
- 基準日：**9月末 24市、10月1日 20地点**（東京23区を含む）。国勢と同じ10月1日で取れる市と、1日前の9月末の市が混在する（実質の差はわずか）。
- 外国人：多くの市は「含む」と明記。**福島・大津・神戸・和歌山・鳥取・宮崎**はページ・ファイルに記載がなく未確認。
- 過去年：2015・2020年の同時点の値が残っている市が大半。**和歌山市**は住基ベースの月別が令和6年からで過去年なし。**新潟市**は2015・2020年が国立国会図書館のアーカイブ経由。
- **本サイトへの反映（2026-10-20）**：2015・2020・2025年分を同時点の値へ置き換えた（`tools/build_national_oct.mjs`、`data/national.json` の `jukiDate`）。2010年は2011-03-31。秋田・山形・高松は3年とも、和歌山は2015・2020年のみ翌年1月1日のまま。
- 2015・2020年の採用値と出典は `docs/NATIONAL_JUKI_SOURCES.md`（和歌山を除く43地点）。

### 取れない3地点

| 地点 | 理由 | 代わりの手段 |
|---|---|---|
| 秋田市 | 住基人口は年1回（3月31日現在）。毎月の人口世帯表は国勢調査ベースの推計 | 総務省の翌年1月1日を使い続ける |
| 山形市 | 9月末・10月1日の住基データが見つからない（毎月公表は推計人口） | 同上 |
| 高松市 | 住基ベースの統計書は毎年4月1日現在。月次は推計人口のみ | 同上 |

## 一覧（北から南）

| 地点 | 可否 | 基準日 | 2025年総人口 | 1/1比 | 外国人 | 形式 | 過去年 | URL | 備考 |
|---|---|---|---|---|---|---|---|---|---|
| 札幌市 | 可 | 10/1 | 1,955,612 | +0.05% | 含む（内訳あり） | Excel | あり（1972年〜） | [ページ](https://www.city.sapporo.jp/toukei/jinko/juuki/juuki.html)／[2022-2025](https://www.city.sapporo.jp/toukei/jinko/juuki/documents/juuki2022-2025.xlsx) | 年次ファイルに毎月分 |
| 青森市 | 可 | 10/1 | 260,071 | +0.28% | 含む | Excel | あり（値確認：2015 293,528／2020 278,959） | [ページ](https://www.city.aomori.aomori.jp/shisei/toukei/1006137.html) | 2014年5月から月初、それ以前は月末 |
| 盛岡市 | 可 | 9/30 | 275,321 | +0.14% | 含む（別表） | Excel・PDF | あり（値確認：2015 294,091／2020 287,284） | [ページ](https://www.city.morioka.iwate.jp/shisei/1027188/1019915/index.html) | 同ページの1日現在は推計人口 |
| 仙台市 | 可 | 10/1 | 1,063,541 | +0.03% | 含む（内訳あり） | Excel | あり | [令和7年](https://www.city.sendai.jp/chosatoke/shise/toke/jinko/jyuuki_r07.html) | 区別 |
| 秋田市 | **不可** | （3/31のみ） | － | － | － | Excel・PDF | － | [ページ](https://www.city.akita.lg.jp/shisei/tokei/1003666/1003563.html) | 月次は推計人口 |
| 山形市 | **不可** | 不明 | － | － | － | － | － | [オープンデータ](https://www.city.yamagata-yamagata.lg.jp/opendata/category/1007068/1012901.html) | 月次は推計人口 |
| 福島市 | 可 | 9/30 | 262,122 | +0.22% | 未確認 | PDF | 不明 | [ページ](https://www.city.fukushima.fukushima.jp/soshiki/7/1028/3/1/1/6/15287.html) | 支所別、月ごとのページ |
| 水戸市 | 可 | 10/1 | 266,575 | −0.05% | 含む | Excel | あり（値確認：2015 272,932／2020 271,492） | [ページ](https://www.city.mito.lg.jp/site/open-data/3574.html) | 四半期ごと（1・4・7・10月） |
| 宇都宮市 | 可 | 9/30 | 513,744 | +0.07% | 含む | Excel | あり（値確認：2015 521,132／2020 521,395） | [ページ](https://www.city.utsunomiya.lg.jp/shisei/johokokai/gyoseisiryo/1020024/1020072/1020098.html) | 同じファイルに推計人口シートあり |
| 前橋市 | 可 | 9/30 | 327,763 | +0.03% | 含む | PDF | あり | [ページ](https://www.city.maebashi.gunma.jp/soshiki/shimin/shimin/gyomu/4/26409.html) | 町別表 |
| さいたま市 | 可 | 10/1 | 1,355,010 | −0.07% | 含む | PDF（過去はExcel） | あり | [令和7年](https://www.city.saitama.lg.jp/006/013/005/001/p118333.html) | |
| 千葉市 | 可 | 9/30 | 986,383 | −0.02% | 含む（内訳あり） | Excel | あり | [2025](https://www.city.chiba.jp/sogoseisaku/sogoseisaku/kikaku/tokei/documents/cho_zin2025.xlsx)／[過去分](https://www.city.chiba.jp/sogoseisaku/sogoseisaku/kikaku/tokei/tyo-setai-jyuki_past.html) | 町丁別、月別シート |
| 東京23区 | 可（取込済） | 10/1 | 9,799,375 | +0.03% | 含む（内訳あり） | Excel・CSV | 都は1/1のみ（区別は各区） | [都の月次住基](https://www.toukei.metro.tokyo.lg.jp/juukim/jm-index.htm)／[2025年10月](https://www.toukei.metro.tokyo.lg.jp/juukim/2025/jm25010000.htm) | 区部（13100）＝23区合計。区別の合計と一致を確認 |
| 横浜市 | 可 | 9/30 | 3,756,808 | +0.09% | 含む（内訳あり） | Excel | あり（値確認：2015 3,730,345／2020 3,761,897） | [ページ](https://www.city.yokohama.lg.jp/city-info/yokohamashi/tokei-chosa/portal/jinko/maitsuki/juki.html) | 統計書 第6表 |
| 新潟市 | 可 | 9/30 | 756,565 | +0.15% | 含む | Excel・PDF | 一部（2015・2020はWARP経由） | [ページ](https://www.city.niigata.lg.jp/shisei/gaiyo/profile/00_01jinkou/kihon_kujinko/index.html) | |
| 富山市 | 可（取込済） | 9/30 | 402,015 | +0.14% | 含む | オープンデータ | あり | [令和7年](https://opdt.city.toyama.lg.jp/dataset/e92ab994-edd1-4b9a-9130-4716da2ff8e6) | 概要・全国タブで使用中 |
| 金沢市 | 可 | 10/1 | 441,878 | −0.02% | 含む（内訳あり） | Excel・PDF | あり（値確認：2015 454,058／2020 450,955） | [ページ](https://www4.city.kanazawa.lg.jp/soshikikarasagasu/chosatokeishitsu/gyomuannai/1/3/2/7841.html) | 同ページに推計人口あり |
| 福井市 | 可 | 10/1 | 252,284 | +0.10% | 含む（内訳あり） | Excel（オープンデータ） | あり | [一覧](https://www.city.fukui.lg.jp/sisei/tokei/opendata/opendatajinkou.html) | 地区別、月別シート |
| 甲府市 | 可 | 9/30 | 182,944 | +0.19% | 含む | Excel・PDF | あり（値確認：2015 192,608／2020 187,103） | [ページ](https://www.city.kofu.yamanashi.jp/shimin/shise/toke/jinko/ugoki.html) | 町丁別 |
| 長野市 | 可 | 10/1 | 360,302 | +0.12% | 含む（内訳あり） | Excel | あり（1985年〜） | [ページ](https://www.city.nagano.nagano.jp/n041000/contents/p004126.html) | |
| 岐阜市 | 可 | 10/1 | 397,265 | −0.02% | 含む（内訳あり） | Excel | あり（値確認：2015 414,200／2020 407,574） | [ページ](https://www.city.gifu.lg.jp/info/toukei/1008684/index.html) | 地区別、年度ファイルに月別シート |
| 静岡市 | 可 | 9/30 | 668,570 | +0.16% | 含む（内訳あり） | Excel | あり（値確認：2015 712,741／2020 695,195） | [ページ](https://www.city.shizuoka.lg.jp/s2934/s005754.html) | 表の「10月」行＝前月末。推計人口の列と並ぶ |
| 名古屋市 | 可 | 10/1 | 2,309,417 | −0.06% | 含む | Excel | あり | [ページ](https://www.city.nagoya.jp/shisei/toukei/1003703/1003706/1003721/1034905.html) | 「公簿人口」。全市計なし（16区を合計） |
| 津市 | 可 | 9/30 | 266,185 | +0.07% | 含む（内訳あり） | CSV・Excel | あり | [ページ](https://www.info.city.tsu.mie.jp/shisei/toukeijouhou/1009688/index.html) | 2005年12月〜の月末推移 |
| 大津市 | 可 | 9/30 | 343,281 | −0.01% | 未確認 | Excel・PDF | あり | [ページ](https://www.city.otsu.lg.jp/soshiki/001/1209/g/kokai/jinko/409710.html) | ファイル名は10月分、表頭は9/30 |
| 京都市 | 可 | 10/1 | 1,371,116 | +0.10% | 含む（別表） | Excel・CSV | 一部（2020年は確認） | [ページ](https://www2.city.kyoto.lg.jp/sogo/toukei/Population/Juki/) | 年4回。総人口は町別CSVの合計 |
| 大阪市 | 可 | 9/30 | 2,800,028 | +0.04% | 含む（別表） | Excel・CSV | あり | [ページ](https://www.city.osaka.lg.jp/shimin/page/0000006893.html) | 区別は3月末・9月末の年2回 |
| 神戸市 | 可 | 9/30 | 1,487,746 | +0.04% | 未確認 | Excel | あり（全月） | [ページ](https://www.city.kobe.lg.jp/a47946/shise/toke/toukei/jinkou/juukijinkou.html) | 町丁別・1歳階級 |
| 奈良市 | 可 | 10/1 | 345,295 | +0.16% | 含む（内訳あり） | Excel・PDF | あり | [ページ](https://www.city.nara.lg.jp/soshiki/7/249623.html) | 総人口は町別の合計 |
| 和歌山市 | 可 | 10/1 | 350,166 | +0.15% | 未確認 | Excel・PDF | **なし**（住基の月別は2024年〜） | [ページ](https://www.city.wakayama.wakayama.jp/shisei/wakayama/1001006/1055677/1055678/1061064/1066152.html) | それ以前の月別は国勢基準 |
| 鳥取市 | 可 | 9/30 | 177,456 | +0.24% | 未確認 | Excel | あり（値確認：2015 192,122／2020 186,050） | [ページ](https://www.city.tottori.lg.jp/page/1011.html) | 1998年〜の月末推移 |
| 松江市 | 可 | 9/30 | 192,799 | +0.15% | 含む | Excel | 不明 | [統計DB](https://ntoukei2.city.matsue.shimane.jp/) | DBのダウンロードID 6550 |
| 岡山市 | 可 | 9/30 | 693,266 | +0.07% | 含む（内訳あり） | PDF（統計月報） | あり | [月報一覧](https://www.city.okayama.jp/shisei/0000067602.html) | PDFから読み取り |
| 広島市 | 可 | 9/30 | 1,168,848 | +0.08% | 含む（内訳あり） | CSV・Excel（オープンデータ） | あり | [ページ](https://www.city.hiroshima.lg.jp/shisei/toukei/1027844/1027845/1027846/1037045/index.html) | |
| 山口市 | 可 | 9/30 | 184,658 | +0.20% | 未確認（統計書では含む） | Excel | あり | [過去分](https://www.city.yamaguchi.lg.jp/soshiki/8/154684.html) | トップの大きな数字は推計人口 |
| 徳島市 | 可 | 10/1 | 242,923 | +0.13% | 含む（内訳あり） | Excel | あり（値確認：2015 256,371／2020 252,235） | [ページ](https://www.city.tokushima.tokushima.jp/shisei/toukei_johou/jinkousetaisu_tokei/jinkou_setaisu.html) | 1994年〜の各月 |
| 高松市 | **不可** | （4/1のみ） | － | － | － | － | － | [推計人口](https://www.city.takamatsu.kagawa.jp/kurashi/shinotorikumi/tokei/jinko/suikei/r07.files/R071101.pdf) | 月次は推計人口のみ |
| 松山市 | 可 | 10/1 | 493,372 | +0.14% | 含む | Excel | あり | [ページ](https://www.city.matsuyama.ehime.jp/shisei/tokei/toukei2.html) | 町丁別。愛媛県の9月末値と一致 |
| 高知市 | 可 | 10/1 | 309,121 | +0.19% | 含む | Excel | あり（値確認：2015 336,298／2020 325,664） | [ページ](https://www.city.kochi.kochi.jp/soshiki/7/toukei1.html) | 「今月の人口」は推計人口 |
| 福岡市 | 可 | 9/30 | 1,619,432 | −0.09% | 含む（内訳あり） | Excel | あり | [ページ](https://www.city.fukuoka.lg.jp/soki/tokeichosa/shisei/toukei/jinkou/tourokujinkou/TourokuJinko_kubetsu.html) | 区別・男女・年齢別 |
| 佐賀市 | 可 | 9/30 | 225,563 | +0.09% | 含む | HTML・Excel | 一部（過去の月報ページは現在404） | [ページ](https://www.city.saga.lg.jp/shisei/sagashioshiru/6/7561.html) | |
| 長崎市 | 可 | 9/30 | 386,574 | +0.26% | 含む（再掲） | Excel | 一部（町別月末ファイルに2015・2020） | [ページ](https://www.city.nagasaki.lg.jp/page/5604.html) | |
| 熊本市 | 可 | 10/1 | 729,125 | +0.06% | 含む（再掲） | 検索システム（Excel出力） | あり（値確認：2015 734,719／2020 732,543） | [検索](https://tokei.city.kumamoto.jp/content/ASP/Jinkou/default.asp) | 1998年〜 |
| 大分市 | 可 | 9/30 | 471,110 | +0.08% | 含む | Excel・CSV | あり | [ページ](https://www.city.oita.oita.jp/o001/shisejoho/annai/1269847174200-2.html) | 地区別 |
| 宮崎市 | 可 | 10/1 | 391,688 | +0.07% | 未確認 | Excel | あり | [ページ](https://www.city.miyazaki.miyazaki.jp/city/statistics/population/12315.html) | 秘匿で合計がずれる場合あり |
| 鹿児島市 | 可 | 10/1 | 587,748 | +0.08% | 含む（内訳あり） | Excel・PDF | あり | [令和7年](https://www.city.kagoshima.lg.jp/soumu/soumu/soumu/shise/toke-02/jinko/jinko/r7.html) | |
| 那覇市 | 可 | 9/30 | 312,229 | −0.04% | 含む | Excel | あり | [ページ](https://www.city.naha.okinawa.jp/admin/toukei/1004537/1004586/1004587.html) | 町丁字別 |

## 調査方法・注意

- 各市の公式サイト（市役所ドメイン・市のオープンデータ）をウェブ検索と閲覧で確認した。数値は公表ファイル・ページの表示値（京都・奈良・名古屋は町別や区別の合計）。
- 「1/1比」＝（この表の値 − 総務省 住民基本台帳に基づく人口 2026-01-01）÷ 後者。3か月のずれによる差で、桁違いや取り違えがないかの目安。
- 過去年の「あり」は多くがファイルの存在確認のみで、中の値までは確かめていない。
- URLは2026-10-18時点。市のサイト改修で変わることがある。
