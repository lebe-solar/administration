/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Über uns',
  description: 'LeBe Solarenergie – hessisch, persönlich, zuverlässig. Photovoltaikanlagen im Rhein-Main-Gebiet.',
};

const uberUnsTrustPoints = ['Regional im Rhein-Main-Gebiet', 'Persönliche Beratung', '100+ Photovoltaikanlagen', 'Alles aus einer Hand'];

const whyLebeCards = [
  { icon: '/assets/icons/icn_hand.svg', title: 'Hessisch und persönlich', text: 'Wir sind in Rödermark verwurzelt und im Rhein-Main-Gebiet für Sie unterwegs. Der persönliche Kontakt und eine verständliche Beratung stehen bei uns im Mittelpunkt.' },
  { icon: '/assets/icons/icn_montage.svg', title: 'Alles aus einer Hand', text: 'Von der Beratung über Planung, Montage und Elektroinstallation bis zur Anmeldung begleiten wir Ihr PV-Projekt in einem koordinierten Ablauf.' },
  { icon: '/assets/icons/icn_modul.svg', title: 'Erfahrung aus 100+ PV-Anlagen', text: 'Unsere Erfahrung aus über 100 umgesetzten Photovoltaikanlagen hilft uns, Dächer, Technik und Kundenwünsche realistisch einzuschätzen.' },
  { icon: '/assets/icons/icn_anmeldung.svg', title: 'Transparente Komplettpakete', text: 'Unsere Angebote zeigen klar, welche Komponenten und Leistungen enthalten sind. So wissen Sie früh, womit Sie planen können.' },
];

const howWeWorkSteps = [
  { n: '1', title: 'Anfrage oder Paket auswählen', text: 'Sie wählen ein passendes Komplettpaket oder senden uns Ihre Anfrage.' },
  { n: '2', title: 'Beratung & technische Prüfung', text: 'Wir prüfen Dachfläche, Verbrauch, Zählerschrank, Speicherwunsch und technische Voraussetzungen.' },
  { n: '3', title: 'Planung & Produktauswahl', text: 'Sie erhalten eine passende Planung mit konkreten Komponenten und klaren Leistungen.' },
  { n: '4', title: 'Montage & Elektroinstallation', text: 'Die Anlage wird montiert, verkabelt und technisch eingebunden.' },
  { n: '5', title: 'Anmeldung & Inbetriebnahme', text: 'Wir begleiten die Anmeldung und erklären Ihnen Ihre Anlage nach der Inbetriebnahme.' },
];

const projectRefs = [
  { placeholder: 'Foto Einfamilienhaus Rödermark', location: 'Rödermark', title: 'Einfamilienhaus mit Speicher & Wallbox', kwp: '11,4 kWp', year: '2025', text: '24 Module, Fronius Reserva Speicher und Sungrow Wallbox – vollständig integriert in die Hausautomation.' },
  { placeholder: 'Foto Reihenmittelhaus Dietzenbach', location: 'Dietzenbach', title: 'Reihenmittelhaus, modular geplant', kwp: '7,6 kWp', year: '2025', text: 'Kompakte Anlage mit vorbereiteter Nachrüstung für Speicher und Wallbox.' },
  { placeholder: 'Foto Gewerbedach Rhein-Main', location: 'Rhein-Main-Gebiet', title: 'Gewerbedach für Produktionsbetrieb', kwp: '52,25 kWp', year: '2024', text: '110 Module auf einer Gewerbehalle, ausgelegt auf hohen Eigenverbrauch im Tagbetrieb.' },
];

const serviceAreaCities = ['Rödermark', 'Dietzenbach', 'Rodgau', 'Langen', 'Dreieich', 'Neu-Isenburg', 'Offenbach am Main', 'Hanau', 'Darmstadt', 'Frankfurt am Main', 'Seligenstadt', 'Eppertshausen', 'Münster', 'Babenhausen', 'Obertshausen', 'Heusenstamm', 'Mühlheim am Main', 'Groß-Zimmern', 'Dieburg'];

const founder = { name: 'Jonathan Leu', position: 'Geschäftsführung', email: 'mailto:kontakt@lebe-solarenergie.de', bio: 'Wir sind Ihr Ansprechpartner für maßgeschneiderte Photovoltaik-Anlagen und Balkonkraftwerke, sowohl für private als auch gewerbliche Kunden. Unser Unternehmen ist fest in Rödermark verankert und legt großen Wert auf eine persönliche und regionale Vertriebsstruktur im Rhein-Main-Gebiet. Bei uns steht Vertrauen im Mittelpunkt – schließlich basiert jedes Projekt auf einer Laufzeit von über 30 Jahren und der nachweisbaren Kompetenz unseres Teams.' };

const pillStyle: React.CSSProperties = {
  display: 'inline-flex', padding: '5px 12px', borderRadius: 'var(--radius-pill)', background: 'rgba(159,178,161,0.20)',
  fontSize: 'var(--text-p7)', fontWeight: 'var(--fw-semi)' as unknown as number,
};

export default function UeberUnsPage() {
  return (
    <div style={{ animation: 'lebeRise .4s var(--ease-standard) both' }}>
      {/* 1 · HERO */}
      <section style={{ background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 24px 56px' }}>
          <p style={{ margin: '0 0 10px', fontSize: 'var(--text-p3)', color: 'var(--sage)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Über uns</p>
          <h1 style={{ margin: 0, fontSize: 'var(--text-h1)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 'var(--lh-tight)', maxWidth: 760 }}>LeBe Solarenergie – hessisch, persönlich, zuverlässig</h1>
          <p style={{ margin: '18px 0 0', fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)', maxWidth: 760 }}>
            Photovoltaikanlagen im Rhein-Main-Gebiet – geplant, installiert und begleitet mit LeBe als persönlichem Ansprechpartner.
          </p>
          <p style={{ margin: '14px 0 30px', fontSize: 'var(--text-p3)', color: 'var(--charcoal)', maxWidth: 760, lineHeight: 'var(--lh-body)' }}>
            Wir planen und installieren individuelle PV-Anlagen für private und gewerbliche Kunden – von der Beratung über Montage und Elektroinstallation bis zur Anmeldung und Inbetriebnahme.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 30 }}>
            <Link href="/angebote"><Button variant="solid" tone="ink" size="lg">Angebote ansehen</Button></Link>
            <Link href="/kontakt?intent=freeConsultation"><Button variant="outline" tone="sage" size="lg">Kostenlose Beratung anfragen</Button></Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: '24px 36px' }}>
            {uberUnsTrustPoints.map((tp) => (
              <div key={tp} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-p6)', color: 'var(--charcoal)', fontWeight: 'var(--fw-semi)' as unknown as number }}>
                <span style={{ color: 'var(--sage)' }}>✓</span>{tp}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2 · MISSION */}
      <section style={{ maxWidth: 1180, margin: '56px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 18px', fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Unsere Mission: die Energiewende – hessisch und persönlich</h2>
            <p style={{ margin: '0 0 16px', fontSize: 'var(--text-p3)', color: 'var(--charcoal)', lineHeight: 'var(--lh-body)' }}>
              Jung, dynamisch und mit Leidenschaft für die Sonne: Wir möchten den Zugang zu sauberer Energie einfacher, transparenter und persönlicher machen. Deshalb begleiten wir jedes Projekt mit klarer Planung, ehrlicher Beratung und einem koordinierten Ablauf von der ersten Anfrage bis zur fertigen Anlage.
            </p>
            <p style={{ margin: 0, fontSize: 'var(--text-p4)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>
              Unser Ziel ist nicht nur eine Solaranlage auf dem Dach, sondern eine Lösung, die zu Ihrem Haus, Ihrem Verbrauch und Ihren langfristigen Plänen passt.
            </p>
          </div>
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '4 / 3.4', boxShadow: 'var(--shadow-card)' }}>
            <img src="/assets/images/mission.jpg" alt="LeBe Solarenergie Team" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </section>

      {/* 3 · WARUM LEBE */}
      <section style={{ background: 'var(--cream)', marginTop: 64, padding: '56px 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ margin: '0 0 26px', fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Warum LeBe?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {whyLebeCards.map((w) => (
              <div key={w.title} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <span style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(159,178,161,0.20)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={w.icon} alt="" style={{ height: 34, width: 'auto' }} />
                </span>
                <div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)' }}>{w.title}</div>
                <p style={{ margin: 0, fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · SO ARBEITEN WIR */}
      <section style={{ maxWidth: 1180, margin: '64px auto 0', padding: '0 24px' }}>
        <div style={{ maxWidth: 760 }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number }}>So entsteht Ihre PV-Anlage mit LeBe</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {howWeWorkSteps.map((s) => (
              <div key={s.n} style={{ display: 'flex', gap: 20, padding: '20px 0', borderBottom: '1px solid var(--gray-400)' }}>
                <span style={{ flex: 'none', display: 'inline-flex', width: 38, height: 38, borderRadius: '50%', background: 'var(--sage)', color: 'var(--white)', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--fw-semi)' as unknown as number, fontSize: 'var(--text-p5)' }}>{s.n}</span>
                <div>
                  <div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{s.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <Link href="/kontakt"><Button variant="solid" tone="ink">PV-Paket unverbindlich prüfen lassen</Button></Link>
          </div>
        </div>
      </section>

      {/* 5 · PROJEKT-EINBLICKE */}
      <section style={{ maxWidth: 1180, margin: '64px auto 0', padding: '0 24px' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Projekt-Einblicke aus der Region</h3>
        <p style={{ margin: '0 0 28px', fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', maxWidth: 640, lineHeight: 'var(--lh-body)' }}>Eine Auswahl bereits umgesetzter Photovoltaikanlagen im Rhein-Main-Gebiet.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 26 }}>
          {projectRefs.map((pr) => (
            <div key={pr.title} style={{ display: 'flex', flexDirection: 'column', background: 'var(--white)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ aspectRatio: '4 / 3', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)', fontSize: 'var(--text-p6)', textAlign: 'center', padding: 16 }}>
                {pr.placeholder}
              </div>
              <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 'var(--text-p7)', color: 'var(--sage)', fontWeight: 'var(--fw-semi)' as unknown as number, textTransform: 'uppercase', letterSpacing: '.04em' }}>Beispiel-Einblick · {pr.location}</div>
                <h4 style={{ margin: 0, fontSize: 'var(--text-p2)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 'var(--lh-snug)' }}>{pr.title}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '2px 0 4px' }}>
                  <span style={pillStyle}>{pr.kwp}</span>
                  <span style={pillStyle}>{pr.year}</span>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{pr.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6 · EINSATZGEBIET */}
      <section style={{ background: 'var(--sage)', padding: '56px 0', marginTop: 64 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)' }}>Unser Einsatzgebiet</h3>
          <p style={{ margin: '0 0 30px', fontSize: 'var(--text-p4)', color: 'var(--charcoal)', maxWidth: 780, lineHeight: 'var(--lh-body)' }}>
            LeBe-Solarenergie ist in Rödermark-Ober-Roden verwurzelt und im Rhein-Main-Gebiet für Sie unterwegs. Wir planen und installieren Photovoltaikanlagen im Umkreis von ca. 40 km rund um Rödermark-Ober-Roden – persönlich, regional und mit kurzen Wegen.
          </p>
          <div style={{ fontSize: 'var(--text-p6)', color: 'var(--charcoal)', fontWeight: 'var(--fw-semi)' as unknown as number, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 14 }}>Städte in unserem Einsatzgebiet</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 26 }}>
            {serviceAreaCities.map((city) => (
              <span key={city} style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: 'var(--radius-pill)', background: 'var(--white)', color: 'var(--charcoal)', fontSize: 'var(--text-p6)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{city}</span>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-md)', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <p style={{ margin: 0, fontSize: 'var(--text-p5)', color: 'var(--charcoal)', lineHeight: 'var(--lh-body)', maxWidth: 560 }}>Sie wohnen nicht in der Liste? Senden Sie uns Ihre Adresse – wir prüfen gerne, ob wir Ihr Projekt betreuen können.</p>
            <Link href="/kontakt"><Button variant="solid" tone="ink">Adresse unverbindlich prüfen lassen</Button></Link>
          </div>
        </div>
      </section>

      {/* 7 · TEAM / ANSPRECHPARTNER */}
      <section style={{ maxWidth: 1180, margin: '64px auto 0', padding: '0 24px' }}>
        <h3 style={{ margin: '0 0 40px', fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number, textAlign: 'center' }}>Mit Herz bei der Sache – das sind wir</h3>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 640, margin: '0 auto' }}>
          <div style={{ width: 160, height: 160, borderRadius: '50%', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)', fontSize: 'var(--text-p7)', textAlign: 'center', padding: 12 }}>
            Foto Jonathan Leu
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 'var(--text-p2)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{founder.name}</p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', marginTop: 6 }}>
              <span style={{ fontStyle: 'italic', fontSize: 'var(--text-p5)', color: 'var(--gray-mid)' }}>{founder.position}</span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--charcoal)' }} />
              <a href={founder.email} style={{ fontSize: 'var(--text-p5)', color: 'var(--sage)' }}>E-Mail</a>
            </div>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 'var(--text-p5)', color: 'var(--charcoal)', lineHeight: 'var(--lh-body)', textAlign: 'center' }}>{founder.bio}</p>
          <div style={{ marginTop: 8 }}>
            <Link href="/kontakt"><Button variant="outline" tone="sage">Kontakt aufnehmen</Button></Link>
          </div>
        </div>
      </section>

      {/* 8 · FINAL CTA */}
      <section style={{ maxWidth: 1180, margin: '64px auto 90px', padding: '0 24px' }}>
        <div style={{ background: 'var(--charcoal)', borderRadius: 'var(--radius-lg)', padding: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
          <h3 style={{ margin: 0, fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--white)', maxWidth: 640 }}>Bereit für Ihr PV-Projekt?</h3>
          <p style={{ margin: 0, fontSize: 'var(--text-p4)', color: 'var(--white)', opacity: 0.8, maxWidth: 560, lineHeight: 'var(--lh-body)' }}>Sehen Sie sich unsere aktuellen Komplettpakete an oder lassen Sie Ihr Projekt unverbindlich prüfen.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            <Link href="/angebote"><Button variant="solid" tone="yellow" size="lg">Angebote ansehen</Button></Link>
            <Link href="/kontakt?intent=freeConsultation"><Button variant="outline" tone="sage" size="lg">Kostenlose Beratung anfragen</Button></Link>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 'var(--text-p7)', color: 'var(--white)', opacity: 0.6 }}>Persönlich. Regional. Transparent.</p>
        </div>
      </section>
    </div>
  );
}
