# limulus.cdsa.app

LIMULUS-eVTOL araştırma programının sayfası. Statik site, GitHub Pages üzerinde yayınlanır.

## Sayfalar

| Yol | İçerik |
|---|---|
| `/` | Program özeti, makale portföyü ve durumları |
| `/ikiz/` | Dijital ikiz, geometri ve başarım noktası |
| `/kararlar/` | Elli dört karar belgesi, süzülebilir ve aranabilir |
| `/kampanyalar/` | On dört koşu dizini, yüz kırk dört koşu, grafikler |
| `/arsiv/` | Depo, DOI, yeniden üretim komutları, lisanslar |

## Veri nereden geliyor

`data/` altındaki dört dosya elle yazılmadı, kaynağından türetildi.

| Dosya | Kaynak |
|---|---|
| `kararlar.json` | `LIMULUS-eVTOL/4-KARARLAR/00-INDEKS.md` tablolarından ayrıştırıldı |
| `kampanyalar.json` | Arşivdeki 149 koşu günlüğünden sayıldı |
| `egriler.json` | Aynı günlüklerden, varyant başına ortalama, 60 noktaya seyreltilmiş |
| `ikiz.json` | `2-CIZIM-MOTORU/geometri.py` çıktısından ayrıştırıldı |

Kanıt tabanı değiştiğinde bu dosyalar yeniden türetilir, elle düzenlenmez.

## Bilinçli olarak konulmayanlar

Hakem sürecindeki ya da gönderim aşamasındaki makalelerin **tam metinleri ve özetleri**.
Kural, CDSA sitesinden devralındı. Her metnin tam hâli, kendi süreci sonuçlandığında eklenir.

## Tema

`cdsa.app` ile aynı. Plus Jakarta Sans ve Syne, `--accent: #2563eb`, `--accent2: #0891b2`,
yüzen hap gezinme, `data-tr` ve `data-en` ikilisiyle dil değiştirme.

## Lisans

İçerik CC BY 4.0. Programın kendisi `github.com/Orfeomete/limulus-evtol`, kod MIT.
