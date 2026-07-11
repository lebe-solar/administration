import { IconAction } from '../../components/ui/Button';
import { Field, TextInput, TextArea, SelectInput } from '../../components/ui/Fields';
import type { OfferRequirement, PriceType } from '../../types';

const PRICE_TYPE_LABEL: Record<PriceType, string> = { included: 'inklusive', onRequest: 'auf Anfrage', fixed: 'Festpreis', startingFrom: 'ab Preis' };

export function RequirementCard({ item, onChange, onRemove }: {
  item: OfferRequirement;
  onChange: (item: OfferRequirement) => void;
  onRemove: () => void;
}) {
  const set = <K extends keyof OfferRequirement>(k: K, v: OfferRequirement[K]) => onChange({ ...item, [k]: v });
  const isOptionalWork = item.type === 'optionalAdditionalWork';

  return (
    <div style={{ border: '1px solid var(--gray-400)', borderRadius: 'var(--radius-md)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}><TextInput value={item.title} placeholder="Titel" onChange={e => set('title', e.target.value)} /></div>
        <IconAction icon="x" label="Entfernen" tone="danger" onClick={onRemove} />
      </div>
      <TextArea value={item.description} placeholder="Beschreibung…" onChange={e => set('description', e.target.value)} style={{ minHeight: 56 }} />
      {isOptionalWork && (
        <Field label="Preisart">
          <SelectInput value={item.priceType} onChange={e => set('priceType', e.target.value as PriceType)}>
            {(Object.keys(PRICE_TYPE_LABEL) as PriceType[]).map(t => <option key={t} value={t}>{PRICE_TYPE_LABEL[t]}</option>)}
          </SelectInput>
        </Field>
      )}
      {isOptionalWork && item.priceType === 'startingFrom' && (
        <Field label="Preis ab (€)"><TextInput type="number" min="0" value={item.optionalPrice ?? ''} onChange={e => set('optionalPrice', e.target.value === '' ? null : Number(e.target.value))} /></Field>
      )}
    </div>
  );
}
