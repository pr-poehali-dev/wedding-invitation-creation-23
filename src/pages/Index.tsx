import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

type IconName = React.ComponentProps<typeof Icon>["name"];

const HERO_IMAGE = "https://cdn.poehali.dev/projects/5f47c0fc-f12a-4e1c-a57b-fb5e9f136887/bucket/d4d34601-a0c7-4b78-bf95-bda73125b130.jpg";

const petals = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${(i * 7.3) % 100}%`,
  delay: `${(i * 1.3) % 10}s`,
  duration: `${8 + (i % 5) * 2}s`,
  size: `${14 + (i % 3) * 6}px`,
  emoji: ["🌸", "🌹", "✿", "🌺"][i % 4],
}));

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center justify-center gap-4 my-8">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <span className="text-gold text-lg">✦</span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
    </div>
  );
}

const GUEST_ORDER_URL = "https://functions.poehali.dev/eecccb17-ab4d-4755-9f80-b05e364a831a";

const HOT_DISHES = [
  { id: "halibut", label: "Стейк из палтуса с рисом", emoji: "🐟", desc: "Нежный стейк из палтуса с ароматным рисом" },
  { id: "pork", label: "Стейк из свинины на углях", emoji: "🥩", desc: "Сочный стейк на углях с картофельными дольками" },
  { id: "lamb", label: "Седло ягнёнка со спаржей гриль", emoji: "🍖", desc: "Изысканное седло ягнёнка с запечённой спаржей" },
  { id: "bulgogi", label: "Пульгоги", emoji: "🥢", desc: "Корейская говядина в маринаде с овощами" },
];

const ALCOHOL_OPTIONS = [
  { id: "cognac", label: "Коньяк", emoji: "🥃" },
  { id: "vodka", label: "Водка", emoji: "🍸" },
  { id: "wine_red", label: "Вино красное полусладкое", emoji: "🍷" },
  { id: "wine_rose", label: "Розовое полусухое", emoji: "🌸" },
  { id: "champagne_sweet", label: "Шампанское сладкое", emoji: "🥂" },
  { id: "champagne_semi", label: "Шампанское полусухое", emoji: "🍾" },
  { id: "none", label: "Не пью", emoji: "🧃" },
];

function RSVPForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coming, setComing] = useState("yes");
  const [name, setName] = useState("");
  const [guests, setGuests] = useState("1");
  const [hotDish, setHotDish] = useState("");
  const [alcohol, setAlcohol] = useState<string[]>([]);
  const [wish, setWish] = useState("");

  function toggleAlcohol(id: string) {
    setAlcohol(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Пожалуйста, укажите ваше имя"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(GUEST_ORDER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: name,
          coming,
          guests_count: parseInt(guests),
          hot_dish: hotDish,
          alcohol: alcohol.map(id => ALCOHOL_OPTIONS.find(a => a.id === id)?.label || id),
          wish,
        }),
      });
      if (res.ok) setSubmitted(true);
      else setError("Что-то пошло не так, попробуйте снова");
    } catch {
      setError("Ошибка соединения, попробуйте снова");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">💌</div>
        <p className="font-cormorant text-2xl text-deep-rose italic">Спасибо! Мы вас ждём с нетерпением</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Придёте? */}
      <div>
        <label className="block font-cormorant-sc text-sm tracking-widest text-rose/80 mb-3">Вы придёте?</label>
        <div className="flex gap-4">
          {[{ val: "yes", label: "С радостью буду!" }, { val: "no", label: "К сожалению, нет" }].map((opt) => (
            <button key={opt.val} type="button" onClick={() => setComing(opt.val)}
              className={`flex-1 py-3 rounded-xl border font-cormorant text-lg transition-all duration-300 ${coming === opt.val ? "bg-rose text-ivory border-rose shadow-md" : "border-gold/40 text-rose hover:border-rose"}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Имя */}
      <div>
        <label className="block font-cormorant-sc text-sm tracking-widest text-rose/80 mb-2">Ваше имя *</label>
        <input value={name} onChange={e => setName(e.target.value)} required placeholder="Иван Петров"
          className="w-full border border-gold/40 bg-ivory/60 rounded-xl px-4 py-3 font-cormorant text-lg text-deep-rose placeholder-rose/30 focus:outline-none focus:border-rose/50 transition-colors" />
      </div>

      {coming === "yes" && <>
        {/* Горячее */}
        <div>
          <label className="block font-cormorant-sc text-sm tracking-widest text-rose/80 mb-3">Горячее блюдо</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HOT_DISHES.map(dish => (
              <button key={dish.id} type="button" onClick={() => setHotDish(hotDish === dish.label ? "" : dish.label)}
                className={`text-left p-4 rounded-xl border transition-all duration-200 ${hotDish === dish.label ? "border-rose bg-rose/10 shadow-sm" : "border-gold/20 bg-white/40 hover:border-rose/40"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{dish.emoji}</span>
                  <span className="font-cormorant-sc text-sm text-deep-rose">{dish.label}</span>
                  {hotDish === dish.label && <Icon name="Check" size={14} className="text-rose ml-auto" />}
                </div>
                <p className="font-cormorant text-rose/60 text-sm">{dish.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Напитки */}
        <div>
          <label className="block font-cormorant-sc text-sm tracking-widest text-rose/80 mb-3">Напитки (можно несколько)</label>
          <div className="flex flex-wrap gap-2">
            {ALCOHOL_OPTIONS.map(opt => (
              <button key={opt.id} type="button" onClick={() => toggleAlcohol(opt.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border font-cormorant text-sm transition-all duration-200 ${alcohol.includes(opt.id) ? "border-rose bg-rose/10 text-deep-rose shadow-sm" : "border-gold/20 bg-white/40 text-rose/70 hover:border-rose/40"}`}>
                <span>{opt.emoji}</span>{opt.label}
              </button>
            ))}
          </div>
        </div>
      </>}

      {/* Пожелание */}
      <div>
        <label className="block font-cormorant-sc text-sm tracking-widest text-rose/80 mb-2">Пожелание молодожёнам</label>
        <textarea value={wish} onChange={e => setWish(e.target.value)} rows={4}
          placeholder="Напишите тёплые слова для Анастасии и Артёма..."
          className="w-full border border-gold/40 bg-ivory/60 rounded-xl px-4 py-3 font-cormorant text-lg text-deep-rose placeholder-rose/30 focus:outline-none focus:border-rose/50 transition-colors resize-none" />
      </div>

      {error && <p className="font-cormorant text-red-400 text-center">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full py-4 bg-rose text-ivory font-cormorant-sc tracking-widest text-lg rounded-xl hover:bg-deep-rose transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
        {loading ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="Send" size={16} />}
        {loading ? "Отправляем..." : "Подтвердить присутствие"}
      </button>
    </form>
  );
}

export default function Index() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-ivory font-cormorant text-deep-rose overflow-x-hidden">

      {/* Falling petals */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {petals.map((p) => (
          <div
            key={p.id}
            className="absolute top-0 select-none"
            style={{
              left: p.left,
              fontSize: p.size,
              animation: `petal-fall ${p.duration} ${p.delay} linear infinite`,
              opacity: 0,
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* Sticky nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-ivory/90 backdrop-blur-md shadow-sm py-3" : "py-5"}`}>
        <div className="max-w-4xl mx-auto px-6 flex justify-center gap-8">
          {[
            { label: "История", href: "#история" },
            { label: "Детали", href: "#детали" },
            { label: "Меню", href: "#меню" },
            { label: "Маршрут", href: "#маршрут" },
            { label: "RSVP", href: "#rsvp" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-cormorant-sc text-xs tracking-widest text-rose/70 hover:text-rose transition-colors hidden sm:block"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-ivory/10 via-deep-rose/20 to-ivory/90" />

        <div className="relative z-10 px-6">
          <p className="font-caveat text-gold-light text-2xl mb-4 opacity-0" style={{ animation: "fade-up 1s 0.2s ease-out forwards" }}>
            мы приглашаем вас разделить с нами
          </p>
          <h1
            className="font-cormorant-sc text-6xl md:text-8xl text-ivory drop-shadow-lg leading-tight mb-2 opacity-0"
            style={{ animation: "fade-up 1s 0.5s ease-out forwards", textShadow: "0 2px 20px rgba(139,58,58,0.4)" }}
          >
            Анастасия
          </h1>
          <p className="font-caveat text-gold-light text-4xl md:text-5xl italic opacity-0" style={{ animation: "fade-up 1s 0.7s ease-out forwards" }}>
            &amp;
          </p>
          <h1
            className="font-cormorant-sc text-6xl md:text-8xl text-ivory drop-shadow-lg leading-tight mb-4 opacity-0"
            style={{ animation: "fade-up 1s 0.9s ease-out forwards", textShadow: "0 2px 20px rgba(139,58,58,0.4)" }}
          >
            Артём
          </h1>
          <p
            className="font-cormorant-sc text-xl md:text-2xl text-ivory/90 tracking-[0.3em] opacity-0"
            style={{ animation: "fade-up 1s 1.1s ease-out forwards" }}
          >
            26 · ИЮНЯ · 2026
          </p>
          <div className="mt-8 opacity-0" style={{ animation: "fade-up 1s 1.3s ease-out forwards" }}>
            <div className="w-px h-16 bg-gradient-to-b from-gold to-transparent mx-auto" />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <Icon name="ChevronDown" size={24} className="text-ivory/70" />
        </div>
      </section>

      {/* ПРИВЕТСТВИЕ */}
      <section className="py-20 px-6 bg-petal/40">
        <Section className="max-w-2xl mx-auto text-center">
          <p className="font-caveat text-gold text-xl mb-4">дорогие гости</p>
          <h2 className="font-cormorant-sc text-3xl md:text-4xl text-deep-rose mb-6">Вы — часть нашей истории</h2>
          <Divider />
          <p className="font-cormorant text-xl text-rose/80 leading-relaxed italic">
            «Любовь — это не то, что находишь,<br />
            это то, что создаёшь вместе»
          </p>
          <p className="mt-6 font-cormorant text-lg text-rose/70 leading-relaxed">
            Мы счастливы пригласить вас стать свидетелями самого важного дня нашей жизни.
            Разделите с нами радость, смех и слёзы счастья.
          </p>
        </Section>
      </section>

      {/* ИСТОРИЯ ПАРЫ */}
      <section id="история" className="py-20 px-6">
        <Section className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-caveat text-gold text-xl mb-2">наша история</p>
            <h2 className="font-cormorant-sc text-3xl md:text-4xl text-deep-rose">Путь к венцу</h2>
            <Divider />
          </div>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/20 via-gold/50 to-gold/20 hidden md:block" />
            {[
              { year: "2023", emoji: "🎶", title: "Встреча в ночном клубе", text: "Судьба свела нас в ночном клубе — один танец изменил всё. Именно тогда началась наша история.", photo: "https://cdn.poehali.dev/projects/5f47c0fc-f12a-4e1c-a57b-fb5e9f136887/bucket/9be52300-5122-47a5-ba41-a90a8db16075.jpg" },
              { year: "2024", emoji: "🌴", title: "Первое путешествие", text: "В 2024 году мы вместе отправились в Таиланд — солнце, море и новые впечатления на двоих.", photo: "https://cdn.poehali.dev/projects/5f47c0fc-f12a-4e1c-a57b-fb5e9f136887/bucket/93d626c3-2cb2-4f28-afbc-1a03320e1270.jpg" },
              { year: "2025", emoji: "💍", title: "Предложение", text: "Во вторую поездку в Таиланд, на горе с потрясающим видом на острова, Артём сделал предложение. Анастасия сказала «да»!", photo: "https://cdn.poehali.dev/projects/5f47c0fc-f12a-4e1c-a57b-fb5e9f136887/bucket/180bd4f2-bff3-4de4-8662-16f4b98bb061.jpg" },
              { year: "2026", emoji: "🕊️", title: "День свадьбы", text: "И вот настал момент, когда две жизни сольются в одну — навсегда и с любовью." },
            ].map((event, idx) => (
              <div key={idx} className={`flex gap-6 mb-10 ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className="flex-1">
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-gold/20 shadow-sm hover:shadow-md transition-shadow">
                    {"photo" in event && event.photo && (
                      <img src={event.photo} alt={event.title} className="w-full h-56 object-cover" />
                    )}
                    <div className="p-6">
                      <span className="font-cormorant-sc text-xs tracking-widest text-gold">{event.year}</span>
                      <h3 className="font-cormorant-sc text-xl text-deep-rose mt-1 mb-2">{event.emoji} {event.title}</h3>
                      <p className="font-cormorant text-rose/70 text-lg leading-relaxed">{event.text}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex w-8 flex-col items-center pt-6">
                  <div className="w-3 h-3 rounded-full bg-gold ring-4 ring-gold/20" />
                </div>
                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </Section>
      </section>

      {/* ДЕТАЛИ */}
      <section id="детали" className="py-20 px-6 bg-petal/40">
        <Section className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-caveat text-gold text-xl mb-2">важные детали</p>
            <h2 className="font-cormorant-sc text-3xl md:text-4xl text-deep-rose">Программа дня</h2>
            <Divider />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "Church" as IconName, time: "12:00", title: "Церемония", place: "Дворец бракосочетания, Коммунистический проспект, 39", desc: "Регистрация брака. Просим занять места за 15 минут до начала." },
              { icon: "Music" as IconName, time: "19:00", title: "Торжественный ужин", place: "Ресторан «Горький», Мира, 422", desc: "Живая музыка, танцы, тосты и незабываемые мгновения с близкими." },
            ].map((item, idx) => (
              <div key={idx} className="bg-white/70 backdrop-blur-sm rounded-2xl p-7 border border-gold/20 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-rose/10 flex items-center justify-center flex-shrink-0">
                    <Icon name={item.icon} size={20} className="text-rose" />
                  </div>
                  <div>
                    <span className="font-cormorant-sc text-xs tracking-widest text-gold">{item.time}</span>
                    <h3 className="font-cormorant-sc text-xl text-deep-rose mt-0.5 mb-1">{item.title}</h3>
                    <p className="font-caveat text-rose text-base mb-2">{item.place}</p>
                    <p className="font-cormorant text-rose/70 text-lg leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </Section>
      </section>

      {/* RSVP + МЕНЮ + ПОЖЕЛАНИЯ */}
      <section id="rsvp" className="py-20 px-6">
        <Section className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-cormorant-sc text-3xl md:text-4xl text-deep-rose">Подтвердите участие</h2>
            <Divider />
            <p className="font-cormorant text-lg text-rose/70">
              Подтвердите присутствие, выберите меню и оставьте пожелание молодожёнам.
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gold/20 shadow-sm">
            <RSVPForm />
          </div>
        </Section>
      </section>

      {/* КАРТА */}
      <section id="маршрут" className="py-20 px-6 bg-petal/40">
        <Section className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-caveat text-gold text-xl mb-2">как добраться</p>
            <h2 className="font-cormorant-sc text-3xl md:text-4xl text-deep-rose">Маршрут</h2>
            <Divider />
          </div>
          <div className="bg-white/70 rounded-2xl overflow-hidden border border-gold/20 shadow-sm">
            <div className="aspect-video w-full overflow-hidden">
              <iframe
                src="https://yandex.ru/map-widget/v1/?text=Южно-Сахалинск%2C%20ул.%20Мира%2C%20422&z=16&l=map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                title="Карта ресторана Горький"
              />
            </div>
            <div className="p-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose/10 flex items-center justify-center flex-shrink-0">
                <Icon name="MapPin" size={18} className="text-rose" />
              </div>
              <div>
                <p className="font-cormorant-sc text-sm tracking-wide text-deep-rose">Ресторан «Горький»</p>
                <p className="font-cormorant text-rose/70">Южно-Сахалинск, ул. Мира, 422</p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <a
                href="https://yandex.ru/maps/?text=Южно-Сахалинск%2C%20ул.%20Мира%2C%20422"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 border border-gold/40 rounded-xl font-cormorant-sc text-sm tracking-widest text-rose hover:bg-rose hover:text-ivory transition-all duration-300"
              >
                <Icon name="Navigation" size={16} />
                Открыть в Яндекс Картах
              </a>
            </div>
          </div>
        </Section>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6 bg-deep-rose text-ivory text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-cormorant-sc text-4xl mb-2">Анастасия &amp; Артём</h2>
          <p className="font-caveat text-gold-light text-2xl mb-6">26 июня 2026</p>
          <Divider />
          <p className="font-cormorant italic text-ivory/60 text-lg">
            «И пусть каждый ваш день будет наполнен любовью,<br />как этот — нашей благодарностью к вам»
          </p>
          <div className="flex justify-center mt-8">
            <a href="tel:+79147643359" className="flex items-center justify-center gap-2 font-cormorant text-gold-light hover:text-ivory transition-colors">
              <Icon name="Phone" size={16} />
              +7 914 764-33-59
            </a>
          </div>
          <p className="font-cormorant-sc text-xs tracking-widest text-ivory/30 mt-8">С любовью ✦ 2026</p>
        </div>
      </footer>
    </div>
  );
}