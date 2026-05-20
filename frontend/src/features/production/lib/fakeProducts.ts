import type { Product, ProductionFieldDefinition } from '@/types/domain';

const now = new Date().toISOString();

const buildFake = (
  id: string,
  name: string,
  category: string,
  stock: number,
  productionFields: ProductionFieldDefinition[] = []
): Product => ({
  _id: id,
  workspaceId: 'demo',
  name,
  category,
  unit: 'pcs',
  price: 0,
  cost: 0,
  stock,
  lowStockThreshold: 5,
  aliases: [],
  productionFields,
  isArchived: false,
  isLowStock: stock <= 5,
  createdAt: now,
  updatedAt: now,
});

export const FAKE_PRODUCTS: Product[] = [
  buildFake('demo-beef-patty', 'Beef Patty', 'Proteins', 142, [
    {
      key: 'weight_per_piece',
      label: 'Weight per piece',
      type: 'number',
      required: true,
      unit: 'g',
      placeholder: '120',
    },
    {
      key: 'doneness',
      label: 'Doneness',
      type: 'select',
      required: false,
      options: ['Rare', 'Medium', 'Well done'],
    },
  ]),
  buildFake('demo-pizza-dough', 'Pizza Dough', 'Bakery', 24, [
    {
      key: 'hydration',
      label: 'Hydration',
      type: 'number',
      required: false,
      unit: '%',
      placeholder: '65',
    },
  ]),
  buildFake('demo-special-sauce', 'Special Sauce', 'Sauces', 12),
  buildFake('demo-brioche-bun', 'Brioche Bun', 'Bakery', 60),
  buildFake('demo-grated-cheese', 'Grated Cheese', 'Dairy', 30),
  buildFake('demo-tomato-sauce', 'Tomato Sauce', 'Sauces', 18),
  buildFake('demo-sliced-onions', 'Sliced Onions', 'Vegetables', 40),
  buildFake('demo-dill-pickles', 'Dill Pickles', 'Vegetables', 22),
  buildFake('demo-bacon-strips', 'Bacon Strips', 'Proteins', 16),
  buildFake('demo-cheddar-slices', 'Cheddar Slices', 'Dairy', 80),
];

export const isFakeProductId = (id: string): boolean => id.startsWith('demo-');
