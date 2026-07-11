/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Wissen',
  description: 'Photovoltaik einfach erklärt: Funktionsweise, Komponenten und Vorteile einer PV-Anlage.',
};

const missionAdvantages = [
  { title: 'Ihr Vorteil – Klimaschutz', text: 'Mit einer Photovoltaik-Anlage leisten Sie einen direkten Beitrag zur Reduzierung von Treibhausgasemissionen. Sie tragen aktiv zur Bekämpfung des Klimawandels bei, indem Sie auf saubere, erneuerbare Energie umstellen.' },
  { title: 'Ihr Vorteil – Autonomie und Unabhängigkeit', text: 'Als eigenständiger Energieerzeuger sind Sie weniger an den öffentlichen Strompreis und Netzstörungen gebunden. Der Grad der Autonomie gibt an, zu welchem Prozentsatz Sie Ihren eigenen Energiebedarf decken und wie viel Sie weiterhin aus dem Netz beziehen.' },
  { title: 'Ihr Vorteil – Kosteneinsparungen', text: 'Durch die Eigenproduktion und die Reduzierung des Netzbezugs senken Sie deutlich Ihre Energiekosten. Darüber hinaus erhalten Sie eine Vergütung für überschüssigen Strom, den Sie ins Netz einspeisen.' },
];

const pvComponents: { n: string; dir: 'row' | 'row-reverse'; img: string; title: string; text: string }[] = [
  { n: '1', dir: 'row', img: '/assets/pv_explained/1.svg', title: 'Die Photovoltaikanlage', text: 'Unsere Photovoltaik-Systeme bei LeBe Solarenergie wandeln Sonnenlicht effizient in elektrische Energie um. Diese PV-Anlagen können sowohl auf Dächern als auch auf Freiflächen installiert werden und tragen zur nachhaltigen Energieversorgung im Rhein-Main-Gebiet bei.' },
  { n: '2', dir: 'row-reverse', img: '/assets/pv_explained/2.svg', title: 'Ihr heimisches Stromnetz', text: 'Ihre Haushaltsgeräte verbrauchen Strom. Dieser wird in Watt gemessen. Sie finden Ihren Stromverbrauch auf der Abrechnung des Netzbetreibers oder lesen diesen vom Zählerkasten ab.' },
  { n: '3', dir: 'row', img: '/assets/pv_explained/3.svg', title: 'Direktverbrauch', text: 'Wird gleichzeitig Strom produziert und verbraucht, z. B. beim Waschvorgang einer Spülmaschine, dann wird der Strom der Anlage direkt verbraucht. Das wird als Direktverbrauch bezeichnet.' },
  { n: '4', dir: 'row-reverse', img: '/assets/pv_explained/4.svg', title: 'Netzbezug', text: 'Ist nicht genügend Strom aus der Photovoltaikanlage vorhanden, so wird der verbleibende benötigte Strom aus dem öffentlichen Netz bezogen – das ist der Netzbezug, den Sie je kWh bezahlen.' },
  { n: '5', dir: 'row', img: '/assets/pv_explained/5.svg', title: 'Netzeinspeisung', text: 'Produziert Ihre Anlage mehr als gerade benötigt, fließt der Strom in einen Energiespeicher oder wird an das öffentliche Netz abgegeben. Bei der Netzeinspeisung erhalten Sie dafür eine Vergütung.' },
  { n: '6', dir: 'row-reverse', img: '/assets/pv_explained/6.svg', title: 'Stromspeicher', text: 'Die Stromerzeugung und der Bedarf schwanken stark über den Tag. Ein Energiespeicher gleicht diese Schwankung aus: Fehlender Strom wird erst aus dem Speicher, dann erst aus dem Netz bezogen.' },
];

const pvSlider = [
  { img: '/assets/pv_explained/solarmodul.svg', title: 'Solarmodul', text: 'Ein Solarmodul besteht aus mehreren Solarzellen und fängt Sonnenlicht ein. Diese Zellen erzeugen Gleichstrom, der dann in Wechselstrom umgewandelt wird.' },
  { img: '/assets/pv_explained/wechselrichter.svg', title: 'Wechselrichter', text: 'Der Wechselrichter wandelt den erzeugten Gleichstrom aus den Solarmodulen in den verwendbaren Wechselstrom für Ihr Zuhause um.' },
  { img: '/assets/pv_explained/stromspeicher.svg', title: 'Stromspeicher', text: 'Ein Stromspeicher, oft eine Batterie, speichert überschüssigen Solarstrom, den Sie später nutzen können, wenn die Sonne nicht scheint.' },
  { img: '/assets/pv_explained/zaehlerkasten.svg', title: 'Zählerkasten', text: 'Der Zählerkasten misst Ihren Stromverbrauch und die Einspeisung Ihrer Photovoltaik-Anlage ins Netz – wichtig für Abrechnung und Überwachung.' },
  { img: '/assets/pv_explained/wallbox.svg', title: 'Wallbox', text: 'Eine Wallbox ist eine Ladestation für Elektrofahrzeuge und ermöglicht das schnelle, sichere Laden Ihres E-Autos mit Solarenergie.' },
  { img: '/assets/pv_explained/kabel.svg', title: 'Verkabelung', text: 'Die Verkabelung gewährleistet die sichere Übertragung des erzeugten Stroms vom Außendach zur Innenanlage.' },
  { img: '/assets/pv_explained/notstromschalter.svg', title: 'Notstromschalter', text: 'Ein Notstromschalter schaltet bei Stromausfall automatisch auf die Backup-Stromquelle um und schützt so kritische Systeme.' },
  { img: '/assets/pv_explained/waermepumpe.svg', title: 'Wärmepumpe', text: 'Eine Wärmepumpe nutzt Strom, um Wärme zu erzeugen oder zu transferieren – in Verbindung mit einer PV-Anlage effizient für Heizung und Kühlung.' },
];

export default function WissenPage() {
  return (
    <div style={{ animation: 'lebeRise .4s var(--ease-standard) both' }}>
      <section style={{ background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 24px 56px' }}>
          <p style={{ margin: '0 0 10px', fontSize: 'var(--text-p3)', color: 'var(--sage)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Wissen</p>
          <h1 style={{ margin: 0, fontSize: 'var(--text-h1)', fontWeight: 'var(--fw-semi)' as unknown as number, lineHeight: 'var(--lh-tight)', maxWidth: 760 }}>Alles über Photovoltaik-Anlagen</h1>
          <p style={{ margin: '18px 0 0', fontSize: 'var(--text-p3)', color: 'var(--charcoal)', maxWidth: 680, lineHeight: 'var(--lh-body)' }}>Funktionsweise, Komponenten und Vorteile – verständlich erklärt.</p>
        </div>
      </section>

      {/* Vorteile */}
      <section style={{ maxWidth: 960, margin: '56px auto 0', padding: '0 24px' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Ihre Vorteile einer Photovoltaikanlage</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {missionAdvantages.map((a) => (
            <div key={a.title}>
              <p style={{ margin: '0 0 8px', fontSize: 'var(--text-p2)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--charcoal)' }}>{a.title}</p>
              <p style={{ margin: 0, fontSize: 'var(--text-p4)', color: 'var(--charcoal)', lineHeight: 'var(--lh-body)' }}>{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PV-Komponenten Ablauf */}
      <section style={{ maxWidth: 1180, margin: '56px auto 0', padding: '0 24px 8px', display: 'flex', flexDirection: 'column', gap: 44 }}>
        {pvComponents.map((p) => (
          <div key={p.n} style={{ display: 'flex', alignItems: 'center', gap: 40, flexDirection: p.dir }}>
            <div style={{ flex: 'none', width: 220, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', borderRadius: 'var(--radius-lg)' }}>
              <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 20, boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ flex: 'none', display: 'inline-flex', width: 34, height: 34, borderRadius: '50%', border: '2px solid var(--charcoal)', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--fw-semi)' as unknown as number, fontSize: 'var(--text-p5)' }}>{p.n}</span>
                <div style={{ fontSize: 'var(--text-p2)', fontWeight: 'var(--fw-semi)' as unknown as number }}>{p.title}</div>
              </div>
              <div style={{ fontSize: 'var(--text-p5)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{p.text}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Komponenten-Kacheln */}
      <section style={{ maxWidth: 1180, margin: '64px auto 0', padding: '0 24px' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-semi)' as unknown as number, textAlign: 'center' }}>Ein System – viele Komponenten</h2>
        <p style={{ margin: '0 auto 40px', fontSize: 'var(--text-p4)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)', maxWidth: 720, textAlign: 'center' }}>
          Erfahren Sie im Detail, wie die einzelnen Bausteine einer Photovoltaik-Anlage harmonisch zusammenarbeiten, um nachhaltige Energieerzeugung zu gewährleisten.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {pvSlider.map((p) => (
            <div key={p.title} style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', gap: 18, alignItems: 'center' }}>
              <div style={{ flex: 'none', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', borderRadius: 'var(--radius-md)' }}>
                <img src={p.img} alt={p.title} style={{ width: '76%', height: '76%', objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-p3)', fontWeight: 'var(--fw-semi)' as unknown as number, marginBottom: 8 }}>{p.title}</div>
                <div style={{ fontSize: 'var(--text-p6)', color: 'var(--gray-mid)', lineHeight: 'var(--lh-body)' }}>{p.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '56px auto 0', padding: '0 24px' }}>
        <div style={{ background: 'var(--charcoal)', borderRadius: 'var(--radius-lg)', padding: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 26, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: 'var(--text-h4)', fontWeight: 'var(--fw-semi)' as unknown as number, color: 'var(--yellow)' }}>Sehen Sie, welche Produkte wir verbauen</h3>
            <p style={{ margin: 0, fontSize: 'var(--text-p5)', color: 'var(--cream)', maxWidth: 520 }}>Solarmodule, Wechselrichter, Speicher und Wallboxen führender Hersteller.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/produkte"><Button variant="solid" tone="yellow">Zu den Produkten</Button></Link>
            <Link href="/kontakt?intent=knowledgeQuestion"><Button variant="outline" tone="sage">Beratung anfragen</Button></Link>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '56px auto 80px', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26 }}>
        <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: 36, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Lernen Sie uns kennen</div>
          <Link href="/ueber-uns"><Button variant="outline" tone="ink">Mehr erfahren</Button></Link>
        </div>
        <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: 36, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 'var(--text-h5)', fontWeight: 'var(--fw-semi)' as unknown as number }}>Bereit für Ihr Angebot?</div>
          <Link href="/angebote"><Button variant="outline" tone="ink">Zu den Angeboten</Button></Link>
        </div>
      </section>
    </div>
  );
}
