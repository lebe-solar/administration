import { Router } from 'express';

export const CATEGORIES = [
  { key: 'Solarmodule', en: 'Solar Modules', prefix: 'MOD', icon: 'panel' },
  { key: 'Wechselrichter', en: 'Inverters', prefix: 'INV', icon: 'inverter' },
  { key: 'Heimspeicher', en: 'Storage', prefix: 'STO', icon: 'battery' },
  { key: 'Ladestationen', en: 'Charging Stations', prefix: 'WAL', icon: 'plug' },
  { key: 'Heizsysteme', en: 'Heating Systems', prefix: 'HEAT', icon: 'heat' },
];

export const categoriesRouter = Router();
categoriesRouter.get('/', (req, res) => res.json(CATEGORIES));
