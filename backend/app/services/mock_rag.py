import re

MOCK_KNOWLEDGE: list[tuple[str, str]] = [
    (
        r"fiyat|ücret|maliyet|ne kadar|para",
        """Kliniğimizin hizmet fiyatları:
- Diş Muayenesi: 500 ₺
- Diş Dolgusu: 800–1500 ₺ (malzemeye göre)
- Diş Temizliği (Tartar): 700 ₺
- Kanal Tedavisi: 2000–3500 ₺
- Diş Çekimi: 600–1200 ₺
- İmplant: 8000–15000 ₺
- Ortodonti Konsültasyon: Ücretsiz
- Diyetisyen Seans: 600 ₺

SGK anlaşmalı işlemlerimiz için lütfen bizi arayınız: +90 212 555 0100""",
    ),
    (
        r"saat|çalışma|açık|kapalı|mesai|zaman|ne zaman",
        """Kliniğimizin çalışma saatleri:
- Pazartesi – Cuma: 09:00 – 18:00
- Cumartesi: 10:00 – 16:00
- Pazar: Kapalı

Tatil günlerinde ve resmi tatillerde kapalıyız.
Acil durum hattımız: +90 212 555 0101""",
    ),
    (
        r"doktor|hekim|uzman|dr\.|dyt\.|kadro|kim",
        """Uzman kadromuz:

🦷 Dr. Ahmet Yılmaz – Diş Hekimi
  Uzmanlık: Genel Diş Hekimliği, İmplant, Estetik
  Çalışma günleri: Pazartesi–Cuma 09:00–17:00

🥗 Dyt. Fatma Şahin – Diyetisyen
  Uzmanlık: Kilo Yönetimi, Hastalık Diyetleri, Sporcu Beslenmesi
  Çalışma günleri: Pazartesi, Çarşamba, Cuma 10:00–18:00""",
    ),
    (
        r"hizmet|tedavi|yapıyor|yapılan|neler|sunuyor",
        """Kliniğimizin sunduğu hizmetler:

🦷 Diş Hekimliği:
- Genel Diş Muayenesi
- Diş Dolgusu ve Kanal Tedavisi
- Profesyonel Diş Temizliği
- Diş Çekimi
- İmplant Uygulaması
- Estetik Diş Hekimliği (Laminat, Bleaching)
- Ortodonti (Telli, Şeffaf Plak)
- Çocuk Diş Hekimliği

🥗 Diyetisyen:
- Kilo Verme / Alma Programları
- Kişisel Beslenme Planı
- Hastalık Diyetleri (Diyabet, Kalp, Çölyak)
- Sporcu Beslenmesi""",
    ),
    (
        r"randevu|rezervasyon|almak istiyorum|görüşmek|müsait",
        """Randevu alabilmek için:
1. Bu chat üzerinden randevu talebinde bulunabilirsiniz
2. Telefon: +90 212 555 0100
3. "Randevu Al" butonuna tıklayarak online form doldurabilirsiniz

Randevu için gereken bilgiler: Ad Soyad, Telefon, Tercih edilen doktor ve tarih/saat.""",
    ),
    (
        r"adres|konum|nerede|ulaşım|otopark|lokasyon",
        """Klinik adresimiz:
📍 Bağcılar Mah. Sağlık Cad. No:42, İstanbul

Ulaşım:
- 🚇 Metro: M1 Bağcılar Durağı – 5 dk yürüyüş
- 🚌 Otobüs: 74B ve 97 hatları
- 🚗 Araç: Binada ücretsiz otopark mevcuttur

Google Haritalar'da yön almak için "KlinikAI İstanbul" aratabilirsiniz.""",
    ),
    (
        r"sigorta|sgk|özel|poliçe|anlaşmalı",
        """Anlaşmalı sigorta şirketleri:
- ✅ SGK (bazı işlemler kapsam dahilinde)
- ✅ Allianz Sağlık
- ✅ AXA PPP Healthcare
- ✅ Mapfre Sağlık
- ✅ Anadolu Sigorta

Detaylı bilgi için: +90 212 555 0100""",
    ),
]

DEFAULT_REPLY = (
    "Merhaba! Size nasıl yardımcı olabilirim? "
    "Hizmetlerimiz, fiyatlarımız, çalışma saatlerimiz veya randevu almak hakkında sorularınızı yanıtlayabilirim."
)


def mock_chat(message: str) -> dict:
    msg = message.lower()
    for pattern, reply in MOCK_KNOWLEDGE:
        if re.search(pattern, msg):
            intent = None
            if re.search(r"randevu|rezervasyon|almak istiyorum", msg):
                intent = {"intent": "book_appointment"}
            return {"reply": reply, "intent": intent}

    if re.search(r"randevu|rezervasyon|almak istiyorum|görüşmek", msg):
        return {
            "reply": MOCK_KNOWLEDGE[4][1],
            "intent": {"intent": "book_appointment"},
        }

    return {"reply": DEFAULT_REPLY, "intent": None}
