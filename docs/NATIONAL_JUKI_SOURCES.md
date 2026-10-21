# 全国タブ：2015・2020年の住基値（採用値と出典）

全国タブの2015年・2020年は、国勢調査（10月1日）に最も近い各市公表の住民基本台帳人口を使う（2026-10-20追加調査）。
値は `tools/build_national_oct.mjs` に入れてあり、`data/national.json` の `juki` と `jukiDate` に反映される。
2010年は従来どおり2011-03-31（総務省）。秋田市・山形市・高松市は2015・2020・2025年とも同時点の公表がなく、
和歌山市は2015・2020年のみ同時点の住基月別がないため、翌年1月1日（2016/2021/2026-01-01）のまま。

## 検証

- 各値は総務省「住民基本台帳に基づく人口」の翌年1月1日値と比べ、すべて±0.25%以内（3か月分の変動として妥当）。桁違い・推計人口の取り違えがないことを確認した。
- 東京23区は東京都「住民基本台帳による世帯と人口（毎月）」の区部。区別23行の合計と区部が一致することを確認（2015年9,190,237／2020年9,585,007）。
- 京都市は町別CSVの単純合計が京北地域を欠くため、市の長期時系列（市計）を使った。
- 名古屋市は全市計がないため16区の合計。

## 採用値

| 地点 | 2015年 | 基準日 | 2020年 | 基準日 | 主な出典（ファイル・表） |
|---|---:|---|---:|---|---|
| 札幌市 | 1,941,078 | 2015-10-01 | 1,961,682 | 2020-10-01 | 市「住民基本台帳人口」`juuki2012-2016.xls`／`juuki2017-2021.xls` 各10月行 |
| 青森市 | 293,528 | 2015-10-01 | 278,959 | 2020-10-01 | 市統計ページ（docs/JUKI_OCT_SOURCES.md、値確認済み） |
| 盛岡市 | 294,091 | 2015-09-30 | 287,284 | 2020-09-30 | 市統計ページ（同、値確認済み） |
| 仙台市 | 1,055,613 | 2015-10-01 | 1,065,446 | 2020-10-01 | `jyuuki_h27.html` の `2710.xls`／`jyuuki_r02.html` の `0210.xls` |
| 福島市 | 285,060 | 2015-09-30 | 275,966 | 2020-09-30 | WARP 2016年度ページ＋`juminkihondaityo_201509.csv`／`_202009.csv` 合計行 |
| 水戸市 | 272,932 | 2015-10-01 | 271,492 | 2020-10-01 | 市統計ページ（同、値確認済み） |
| 宇都宮市 | 521,132 | 2015-09-30 | 521,395 | 2020-09-30 | 市統計ページ（同、値確認済み） |
| 前橋市 | 339,440 | 2015-09-30 | 335,157 | 2020-09-30 | `jinkou4270930.pdf`／`jinkou0930.pdf` 7頁「合計」 |
| さいたま市 | 1,268,467 | 2015-10-01 | 1,323,110 | 2020-10-01 | `jinkou2015.html` の `kujin271001.xlsx`／`p069165.html` の `kujin021001.xlsx` |
| 千葉市 | 964,180 | 2015-09-30 | 973,972 | 2020-09-30 | `cho_zin27.xls`「平成27年9月」／`cho_zin2020.xlsx`「令和2年9月」 |
| 東京23区 | 9,190,237 | 2015-10-01 | 9,585,007 | 2020-10-01 | 都「住民基本台帳による世帯と人口（毎月）」`jm15av0000_1.csv`／`jm20av0000_1.csv` 区部 |
| 横浜市 | 3,730,345 | 2015-09-30 | 3,761,897 | 2020-09-30 | 市統計ページ（同、値確認済み） |
| 新潟市 | 803,025 | 2015-09-30 | 785,755 | 2020-09-30 | WARP `jyuukizensih27.html` の `150930kujinkou.xls`／`juukizenshir02.html` の `200930kujinkou.xls` |
| 富山市 | 418,957 | 2015-09-30 | 414,354 | 2020-09-30 | 市オープンデータ「年齢別・性別人口」`nennreibetsu2309.xlsx`（各年9月末） |
| 金沢市 | 454,058 | 2015-10-01 | 450,955 | 2020-10-01 | 市統計ページ（同、値確認済み） |
| 福井市 | 266,690 | 2015-10-01 | 261,898 | 2020-10-01 | `chiku2015.xlsx`／`chiku2020.xlsx`「10月」シート福井市全域 |
| 甲府市 | 192,608 | 2015-09-30 | 187,103 | 2020-09-30 | 市統計ページ（同、値確認済み） |
| 長野市 | 383,639 | 2015-10-01 | 374,273 | 2020-10-01 | `91725.xls`「27.10.1」／`350102.xls`「総括表」 |
| 岐阜市 | 414,200 | 2015-10-01 | 407,574 | 2020-10-01 | 市統計ページ（同、値確認済み） |
| 静岡市 | 712,741 | 2015-09-30 | 695,195 | 2020-09-30 | 市統計ページ（同、値確認済み） |
| 名古屋市 | 2,266,791 | 2015-10-01 | 2,300,749 | 2020-10-01 | `cc0021f_1510.xls`／`cc0021f_2010.xlsx` 16区合計 |
| 津市 | 283,103 | 2015-09-30 | 276,323 | 2020-09-30 | `50809301009688.xls`「H24.7～」の各9月30日行 |
| 大津市 | 342,369 | 2015-10-01 | 343,996 | 2020-09-30 | `10gatugakku.pdf`／`R210danjogakku_kaitei.xls` 合計行 |
| 京都市 | 1,419,439 | 2015-10-01 | 1,402,034 | 2020-10-01 | `juukijikeiretu.xlsx`「住民基本台帳人口」各10月行（市計） |
| 大阪市 | 2,679,962 | 2015-09-30 | 2,737,882 | 2020-09-30 | `(27.09)01_gyousei-danjo-setai.csv`／`020901_gyousei-danjo-setai.csv` 合計行 |
| 神戸市 | 1,547,494 | 2015-09-30 | 1,526,860 | 2020-09-30 | `zensi2709.xls`／`202009zensi.xlsx`「神戸市」全市合計 |
| 奈良市 | 362,335 | 2015-10-01 | 355,011 | 2020-10-01 | `32106.xls`「27.10.1」／`115210.xlsx`「2.10.1」奈良市総数 |
| 和歌山市 | ― | （2016-01-01） | ― | （2021-01-01） | 住基ベースの月別は2024年以降のみ。翌年1月1日を使用 |
| 鳥取市 | 192,122 | 2015-09-30 | 186,050 | 2020-09-30 | 市統計ページ（同、値確認済み） |
| 松江市 | 204,960 | 2015-09-30 | 200,965 | 2020-09-30 | 統計DB `download/3865.xls`／`download/5206.xls` 月別人口9月 |
| 岡山市 | 707,023 | 2015-09-30 | 707,967 | 2020-09-30 | `000235478.xls`／`202010_monthlyreport.xlsx`「住基人口」市計 |
| 広島市 | 1,190,629 | 2015-09-30 | 1,195,259 | 2020-09-30 | `36860.xls`／`125267.xls`「jyu」合計行（日本人＋外国人） |
| 山口市 | 194,107 | 2015-09-30 | 190,659 | 2020-09-30 | `65669.xlsx`／`70452.xlsx`「推計人口」シートの登録人口欄 |
| 徳島市 | 256,371 | 2015-10-01 | 252,235 | 2020-10-01 | 市統計ページ（同、値確認済み） |
| 松山市 | 517,263 | 2015-10-01 | 509,753 | 2020-10-01 | `27j-tyoubetu.xls`／`2j2-tyoubetu.xls`「10月1日」総合計 |
| 福岡市 | 1,497,236 | 2015-09-30 | 1,561,188 | 2020-09-30 | `2015nenreibetu-sousuu.xlsx`／`2020nenreibetu-sousuu.xlsx`「9月末」総数 |
| 佐賀市 | 235,466 | 2015-09-30 | 231,725 | 2020-09-30 | 市「住民基本台帳人口」各9月末行 |
| 長崎市 | 435,468 | 2015-09-30 | 412,273 | 2020-09-30 | `38894.xls`「27.9」／`38899.xlsx`「R2.9」全市合計 |
| 熊本市 | 734,719 | 2015-10-01 | 732,543 | 2020-10-01 | 市統計ページ（同、値確認済み） |
| 大分市 | 478,931 | 2015-09-30 | 478,295 | 2020-09-30 | `tiku2015_9.xls`／`tiku2020_9.xlsx`「地区別」全市合計 |
| 宮崎市 | 405,446 | 2015-10-01 | 401,790 | 2020-10-01 | `430598.xls`「H27_10」／`530837.xls`「R02-10」総計 |
| 鹿児島市 | 607,230 | 2015-10-01 | 601,674 | 2020-10-01 | `jyukijinko-h27.xls`／`r2juukijinkou.xls` 10月行 |
| 那覇市 | 323,558 | 2015-09-30 | 320,657 | 2020-09-30 | `choaza_201509.xlsx`（4地区計の合計）／`choaza_202009.xlsx` 市合計 |

## 主なURL

- 札幌 https://www.city.sapporo.jp/toukei/jinko/juuki/juuki.html
- 仙台 https://www.city.sendai.jp/chosatoke/shise/toke/jinko/jyuuki_h27.html ／ https://www.city.sendai.jp/chosatoke/shise/toke/jinko/jyuuki_r02.html
- 福島 https://www.city.fukushima.fukushima.jp/soshiki/2/1005/1/1/1/2895.html
- 前橋 https://www.city.maebashi.gunma.jp/soshiki/shimin/shimin/gyomu/4/26409.html
- さいたま https://www.city.saitama.lg.jp/006/013/005/001/jinkou2015.html ／ https://www.city.saitama.lg.jp/006/013/005/001/p069165.html
- 千葉 https://www.city.chiba.jp/sogoseisaku/sogoseisaku/kikaku/tokei/tyo-setai-jyuki_past.html
- 新潟 https://www.city.niigata.lg.jp/shisei/gaiyo/profile/00_01jinkou/kihon_kujinko/index.html
- 福井 https://www.city.fukui.lg.jp/sisei/tokei/opendata/opendatajinkou.html
- 長野 https://www.city.nagano.nagano.jp/n041000/contents/p004126.html
- 名古屋 https://www.city.nagoya.jp/shisei/toukei/1003703/1003706/1003721/1034905.html
- 津 https://www.info.city.tsu.mie.jp/shisei/toukeijouhou/1009688/index.html
- 大津 https://www.city.otsu.lg.jp/soshiki/001/1209/g/kokai/jinko/409710.html
- 京都 https://www2.city.kyoto.lg.jp/sogo/toukei/Population/Juki/
- 大阪 https://www.city.osaka.lg.jp/shimin/page/0000006893.html
- 神戸 https://www.city.kobe.lg.jp/a47946/shise/toke/toukei/jinkou/juukijinkou.html
- 奈良 https://www.city.nara.lg.jp/soshiki/7/249623.html
- 松江 https://ntoukei2.city.matsue.shimane.jp/
- 岡山 https://www.city.okayama.jp/shisei/0000067602.html
- 広島 https://www.city.hiroshima.lg.jp/shisei/toukei/1027844/1027845/1027846/1037045/index.html
- 山口 https://www.city.yamaguchi.lg.jp/soshiki/8/154684.html
- 松山 https://www.city.matsuyama.ehime.jp/shisei/tokei/toukei2.html
- 福岡 https://www.city.fukuoka.lg.jp/soki/tokeichosa/shisei/toukei/jinkou/tourokujinkou/TourokuJinko_kubetsu.html
- 佐賀 https://www.city.saga.lg.jp/shisei/sagashioshiru/6/7561.html
- 長崎 https://www.city.nagasaki.lg.jp/page/5604.html
- 大分 https://www.city.oita.oita.jp/o001/shisejoho/annai/1269847174200-2.html
- 宮崎 https://www.city.miyazaki.miyazaki.jp/city/statistics/population/12315.html
- 鹿児島 https://www.city.kagoshima.lg.jp/soumu/soumu/soumu/shise/toke-02/jinko/jinko/r7.html
- 那覇 https://www.city.naha.okinawa.jp/admin/toukei/1004537/1004586/1004587.html
- 東京23区 https://www.toukei.metro.tokyo.lg.jp/juukim/jm-index.htm

13市（青森・盛岡・水戸・宇都宮・横浜・金沢・甲府・岐阜・静岡・鳥取・徳島・高知・熊本）の2015/2020値は、
`docs/JUKI_OCT_SOURCES.md` の2026-10-18調査で値まで確認済みのものを使った。URLは同ファイルを参照。
