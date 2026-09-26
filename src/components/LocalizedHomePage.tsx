import Link from "next/link";

type LocalizedContent = {
  htmlLang: string;
  localName: string;
  nav: { methods: string; process: string; questions: string };
  eyebrow: string;
  h1: string;
  intro: string;
  primaryCta: string;
  methodsCta: string;
  audienceTitle: string;
  audienceText: string;
  methodsTitle: string;
  methodsIntro: string;
  methods: Array<{ title: string; text: string; spec: string }>;
  planningTitle: string;
  planningText: string;
  stepsTitle: string;
  steps: Array<{ title: string; text: string }>;
  logisticsTitle: string;
  logisticsText: string;
  faqTitle: string;
  faqs: Array<{ question: string; answer: string }>;
  finalTitle: string;
  finalText: string;
  finalCta: string;
  footer: string;
  message: string;
};

const CONTENT: Record<"id" | "zh-cn", LocalizedContent> = {
  id: {
    htmlLang: "id",
    localName: "Bahasa Indonesia",
    nav: { methods: "Metode", process: "Proses", questions: "FAQ" },
    eyebrow: "Dibuat di Bali untuk brand dan bisnis",
    h1: "Wujudkan koleksi brand pakaian Anda di Bali.",
    intro: "Untuk pendiri brand, tim produk, dan bisnis lokal yang membutuhkan apparel dengan desain sendiri. Kirim brief lewat WhatsApp, lalu bahas metode cetak, jumlah, sampel, jadwal, dan pengiriman bersama studio kami di Bali.",
    primaryCta: "Rencanakan pesanan",
    methodsCta: "Bandingkan metode cetak",
    audienceTitle: "Pesanan yang cocok untuk studio kami",
    audienceText: "Kami membantu mengerjakan satu desain uji hingga drop brand dan merchandise bisnis. DTF tersedia mulai satu potong. Sablon dan bordir cocok untuk pesanan pakaian mulai 24 potong. Jika Anda sedang berlibur di Bali, koordinasikan jadwal dan pengiriman sebelum mengandalkan tanggal penerbangan.",
    methodsTitle: "Pilih metode berdasarkan produk dan jumlah",
    methodsIntro: "Jangan memilih metode hanya dari harga per potong. Hasil akhir, kain, detail desain, jumlah, dan waktu produksi juga menentukan pilihan yang tepat.",
    methods: [
      { title: "Sablon", text: "Sablon manual dengan tinta plastisol atau water-based untuk desain dengan jumlah warna yang terencana. Biaya pembuatan screen dihitung sekali per warna dan dibagi ke jumlah produksi.", spec: "MOQ pakaian 24 potong · hingga 4 warna · estimasi 7–10 hari" },
      { title: "DTF", text: "Transfer full color untuk satu potong, desain berwarna, sampel, atau produksi kecil tanpa persiapan screen. Cocok untuk memeriksa ukuran dan posisi desain.", spec: "MOQ 1 potong · full color · estimasi 1–3 hari" },
      { title: "Bordir", text: "Pilihan untuk logo, badge, atau detail bertekstur. Biaya perlu dihitung berdasarkan desain dan jumlah jahitan.", spec: "MOQ 24 potong · biaya sesuai desain · estimasi 7–10 hari" },
    ],
    planningTitle: "Rencanakan jumlah yang masuk akal untuk dijual",
    planningText: "Pada sablon, biaya persiapan per warna dapat dibagi ke lebih banyak potong, sehingga harga per potong bisa membaik ketika jumlah meningkat. Minta perbandingan penawaran untuk beberapa jumlah sebelum memutuskan. Pilih jumlah berdasarkan perkiraan penjualan dan arus kas, bukan sekadar mengejar harga terendah. Harga final perlu dikonfirmasi berdasarkan spesifikasi pesanan.",
    stepsTitle: "Dari brief hingga barang siap dikirim",
    steps: [
      { title: "1. Kirim brief", text: "Sertakan produk, jumlah, desain atau referensi, tanggal dibutuhkan, dan tujuan pengiriman." },
      { title: "2. Sepakati detail", text: "Kami cek kebutuhan, metode, kain, area cetak, finishing, biaya, dan perkiraan jadwal. Mockup dan detail produksi perlu disetujui sebelum mulai." },
      { title: "3. Produksi dan QC", text: "Pengerjaan dilakukan di Bali, dengan pemeriksaan kualitas dan foto progres sebelum pengiriman." },
      { title: "4. Ambil atau kirim", text: "Ambil di Bali atau minta penawaran ongkir. Untuk kirim ke luar pulau atau luar negeri, sertakan alamat dan tenggat waktu." },
    ],
    logisticsTitle: "Untuk pelanggan lokal, turis, dan brand luar negeri",
    logisticsText: "Anda dapat mengatur pesanan saat berada di Bali atau membahasnya dari luar negeri melalui WhatsApp. Kami mencantumkan opsi kurir domestik dan internasional, tetapi biaya, estimasi tiba, ketersediaan pakaian, serta kemampuan memenuhi jadwal harus dikonfirmasi dalam penawaran. Jangan pesan produksi dengan asumsi selesai sebelum penerbangan tanpa tanggal produksi yang disepakati.",
    faqTitle: "Pertanyaan sebelum meminta penawaran",
    faqs: [
      { question: "Berapa minimum pesanan?", answer: "Informasi studio mencantumkan DTF mulai 1 potong. Sablon dan bordir mulai 24 potong untuk pakaian. Konfirmasikan MOQ untuk produk dan desain tertentu." },
      { question: "Berapa lama produksi?", answer: "Estimasi saat ini: 1–3 hari untuk DTF, 7–10 hari untuk sablon atau bordir, dan 2–4 minggu untuk proyek Brand Starter. Jadwal dimulai setelah detail dan artwork disetujui, lalu dikonfirmasi berdasarkan ketersediaan." },
      { question: "Bisa pesan sampel sebelum jumlah besar?", answer: "Bisa dibahas. DTF dapat membantu memeriksa artwork dan posisi, tetapi hasilnya berbeda dari sablon. Tanyakan jenis sampel yang sesuai dengan metode produksi akhir." },
      { question: "Apakah bisa dikirim setelah saya meninggalkan Bali?", answer: "Situs mencantumkan opsi pengiriman domestik dan internasional. Berikan alamat tujuan dan tanggal yang dibutuhkan agar ongkir dan jadwal dikonfirmasi sebelum produksi." },
      { question: "Apa yang perlu dikirim untuk mendapat penawaran?", answer: "Kirim jenis produk, jumlah dan ukuran, file desain atau referensi, ukuran dan posisi cetak, tanggal yang dibutuhkan, serta tujuan pengiriman. Rentang anggaran bersifat opsional, tetapi dapat membantu kami menyarankan lingkup yang sesuai." },
    ],
    finalTitle: "Kirim detail pesanan Anda.",
    finalText: "Mulai dengan produk, jumlah, desain, tanggal yang dibutuhkan, dan tujuan pengiriman. Kami akan membantu mengecek metode dan menyiapkan langkah berikutnya.",
    finalCta: "Tanya melalui WhatsApp",
    footer: "Studio sablon dan apparel di Bali, Indonesia. Klaim layanan dan estimasi mengikuti informasi situs dan perlu dikonfirmasi untuk setiap proyek.",
    message: "Halo, saya ingin meminta penawaran produksi apparel di Bali. Produk: __. Jumlah: __. Desain atau referensi: __. Tanggal dibutuhkan: __. Tujuan pengiriman: __. Mohon konfirmasi metode yang cocok, ketersediaan, jadwal, dan harga.",
  },
  "zh-cn": {
    htmlLang: "zh-Hans",
    localName: "简体中文",
    nav: { methods: "印制方式", process: "流程", questions: "常见问题" },
    eyebrow: "在巴厘岛为服装品牌和企业制作",
    h1: "在巴厘岛，把你的服装品牌系列真正做出来。",
    intro: "服务于正在准备首批服装系列的品牌创始人、产品团队和企业。通过 WhatsApp 发送需求，我们会一起确认印制方式、数量、样品、时间安排和配送方案。工作室位于巴厘岛。",
    primaryCta: "讨论生产计划",
    methodsCta: "对比印制工艺",
    audienceTitle: "适合工作室承接的订单",
    audienceText: "从单件设计测试、品牌新品系列到企业周边，我们会根据商品和数量讨论制作方案。DTF 最低一件；服装丝网印刷和刺绣最低通常为 24 件。若你正在巴厘岛旅行，请先确认生产排期和配送，再安排返程日期。",
    methodsTitle: "根据商品和数量选择工艺",
    methodsIntro: "不要只比较单件价格。成品效果、面料、图案细节、订单数量和制作时间都会影响合适的工艺。",
    methods: [
      { title: "丝网印刷", text: "使用塑料胶浆或水性油墨进行手工转盘印刷，适合颜色数量明确的服装订单。每种颜色的制版费用只收一次，可分摊到整批订单中。", spec: "服装起订 24 件 · 每款最多 4 色 · 预计 7–10 天" },
      { title: "DTF 热转印", text: "适合全彩图案、单件测试或小批量订单，无需制作丝网版。可用于检查图案大小和位置。", spec: "起订 1 件 · 全彩 · 预计 1–3 天" },
      { title: "刺绣", text: "适用于标志、徽章和需要立体纹理的细节。价格需根据图案和针数报价。", spec: "起订 24 件 · 按图案报价 · 预计 7–10 天" },
    ],
    planningTitle: "按实际销售计划确定订单数量",
    planningText: "丝网印刷的制版费按颜色一次计算，增加数量可以分摊这项费用，单件价格可能因此更合适。下单前可以询问不同数量的报价。请根据预期销量和现金流决定生产数量，不要只为追求最低单价而多做库存。最终价格需按订单规格确认。",
    stepsTitle: "从需求到完成配送",
    steps: [
      { title: "1. 发送需求", text: "请提供商品、数量、图案或参考、需要日期和配送目的地。" },
      { title: "2. 确认规格", text: "我们会核对工艺、面料、印刷位置、后整理、费用和预计时间。开始制作前需要确认效果图和生产细节。" },
      { title: "3. 制作与质检", text: "产品在巴厘岛制作，并会进行质量检查，发货前提供进度照片。" },
      { title: "4. 自取或配送", text: "可以在巴厘岛取货，也可询问配送报价。寄往外岛或海外时，请提供地址和截止日期。" },
    ],
    logisticsTitle: "服务当地客户、旅行者和海外品牌",
    logisticsText: "你可以在巴厘岛旅行期间安排订单，也可以在海外通过 WhatsApp 沟通。网站列有印尼国内和国际配送选项，但运费、到货时间、服装库存及能否赶上计划日期都需要在报价中确认。没有确认生产日期前，请勿假设订单能在航班前完成。",
    faqTitle: "询价前常见问题",
    faqs: [
      { question: "最低订单数量是多少？", answer: "工作室信息显示，DTF 从 1 件起；服装丝网印刷和刺绣从 24 件起。具体商品和图案的最低数量需再次确认。" },
      { question: "制作需要多久？", answer: "目前的预计时间为：DTF 1–3 天，丝网印刷或刺绣 7–10 天，品牌启动项目 2–4 周。时间取决于订单规格、图案确认和库存，需由工作室确认。" },
      { question: "大批量制作前可以先做样品吗？", answer: "可以先讨论样品方案。DTF 样品可用于检查图案大小和位置，但成品手感与丝网印刷不同。请说明最终生产工艺，并询问适合的样品方式。" },
      { question: "我离开巴厘岛后可以寄送吗？", answer: "网站列有印尼国内及国际配送选项。制作前请提供地址和所需日期，以便确认运费和时间。" },
      { question: "询价时需要提供哪些资料？", answer: "请提供商品类型、数量和尺码、设计文件或参考图、印刷尺寸和位置、需要日期及配送目的地。预算范围可选提供，有助于讨论合适的制作方案。" },
    ],
    finalTitle: "把订单信息发给我们。",
    finalText: "请从商品、数量、图案、需要日期和配送目的地开始。我们会协助确认工艺并安排下一步。",
    finalCta: "通过 WhatsApp 咨询",
    footer: "巴厘岛服装印花工作室。服务能力和时间均以网站信息为参考，每个项目需单独确认。",
    message: "你好，我想咨询巴厘岛服装印花。商品：__。数量：__。设计或参考图：__。需要日期：__。配送目的地：__。请确认适合的工艺、库存、时间和报价。",
  },
};

export default function LocalizedHomePage({ locale }: { locale: "id" | "zh-cn" }) {
  const content = CONTENT[locale];
  const whatsapp = "https://wa.me/6283174145415?text=" + encodeURIComponent(content.message);

  return (
    <main className="localized-page" lang={content.htmlLang}>
      <div className="container">
        <header className="localized-page__header">
          <Link className="seo-page__brand" href="/">Screenprinting Bali<span>/ Studio</span></Link>
          <nav aria-label="Language and page navigation">
            <a href="#methods">{content.nav.methods}</a>
            <a href="#process">{content.nav.process}</a>
            <a href="#faq">{content.nav.questions}</a>
            <Link href="/">{locale === "id" ? "English" : "英语"}</Link>
            <Link href="/id">{locale === "id" ? content.localName : "印度尼西亚语"}</Link>
            <Link href="/zh-cn">{locale === "id" ? "简体中文" : content.localName}</Link>
          </nav>
        </header>

        <section className="localized-page__hero">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1>{content.h1}</h1>
          <p>{content.intro}</p>
          <div className="seo-hero__actions">
            <a className="btn" href={whatsapp} target="_blank" rel="noopener noreferrer">{content.primaryCta} <span aria-hidden="true">↗</span></a>
            <a className="btn btn--ghost" href="#methods">{content.methodsCta}</a>
          </div>
        </section>

        <section className="localized-page__section">
          <p className="eyebrow">Screenprinting Bali / Studio</p>
          <h2>{content.audienceTitle}</h2>
          <p>{content.audienceText}</p>
        </section>

        <section className="localized-page__section" id="methods">
          <p className="eyebrow">01 / {content.nav.methods}</p>
          <h2>{content.methodsTitle}</h2>
          <p>{content.methodsIntro}</p>
          <div className="localized-cards">
            {content.methods.map((method) => (
              <article className="localized-card" key={method.title}>
                <p className="eyebrow">Screenprinting Bali</p>
                <h3>{method.title}</h3>
                <p>{method.text}</p>
                <span className="localized-card__spec">{method.spec}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="localized-page__section">
          <p className="eyebrow">{locale === "id" ? "02 / Perencanaan" : "02 / 生产计划"}</p>
          <h2>{content.planningTitle}</h2>
          <p>{content.planningText}</p>
          <a className="btn btn--ghost" href="#methods">{content.methodsCta} <span aria-hidden="true">↗</span></a>
        </section>

        <section className="localized-page__section" id="process">
          <p className="eyebrow">03 / {content.nav.process}</p>
          <h2>{content.stepsTitle}</h2>
          <div className="localized-cards">
            {content.steps.map((step) => (
              <article className="localized-card" key={step.title}>
                <h3>{step.title}</h3><p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="localized-page__section">
          <p className="eyebrow">{locale === "id" ? "04 / Pesanan lokal dan internasional" : "04 / 巴厘岛及海外订单"}</p>
          <h2>{content.logisticsTitle}</h2>
          <p>{content.logisticsText}</p>
        </section>

        <section className="localized-page__section" id="faq">
          <p className="eyebrow">{locale === "id" ? "05 / FAQ" : "05 / 常见问题"}</p>
          <h2>{content.faqTitle}</h2>
          <div className="faq seo-page__faq">
            {content.faqs.map((faq) => (
              <details className="faq__item" key={faq.question}>
                <summary>{faq.question}</summary>
                <div className="faq__item__answer">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="seo-final-cta">
          <p className="eyebrow">Bali, Indonesia</p>
          <h2>{content.finalTitle}</h2>
          <p>{content.finalText}</p>
          <a className="btn" href={whatsapp} target="_blank" rel="noopener noreferrer">{content.finalCta} <span aria-hidden="true">↗</span></a>
        </section>

        <footer className="localized-page__footer">
          <p>{content.footer}</p>
          <nav aria-label="Choose language">
            <Link href="/">{locale === "id" ? "English" : "英语"}</Link>
            <Link href="/id">{locale === "id" ? content.localName : "印度尼西亚语"}</Link>
            <Link href="/zh-cn">{locale === "id" ? "简体中文" : content.localName}</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
