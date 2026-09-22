import { db, collection, getDocs, addDoc } from './firebase';
import { LaundryService } from './types';

export const INITIAL_SERVICES: Omit<LaundryService, 'id'>[] = [
  {
    name: 'Wash & Fold',
    description: 'Everyday laundry washed, dried, and professionally folded. Sorted by whites and colors.',
    price: 2.50,
    unit: 'per kg',
    turnaroundTime: '24 Hours',
    category: 'Wash & Fold',
    available: true,
    icon: 'Shirt'
  },
  {
    name: 'Dry Cleaning',
    description: 'Specialized chemical cleaning and gentle care for delicate garments, suits, silk, and dresses.',
    price: 8.00,
    unit: 'per item',
    turnaroundTime: '48 Hours',
    category: 'Dry Cleaning',
    available: true,
    icon: 'Sparkles'
  },
  {
    name: 'Professional Ironing',
    description: 'Crisp, wrinkle-free pressing for shirts, trousers, blouses, and formal wear on hangers.',
    price: 2.00,
    unit: 'per item',
    turnaroundTime: '24 Hours',
    category: 'Ironing',
    available: true,
    icon: 'Flame'
  },
  {
    name: 'Express 6-Hour Wash',
    description: 'Rush service for urgent laundry needs. Picked up and returned freshly laundered the same day.',
    price: 4.50,
    unit: 'per kg',
    turnaroundTime: '6 Hours',
    category: 'Express',
    available: true,
    icon: 'Zap'
  },
  {
    name: 'Comforter & Bedding',
    description: 'Deep hygienic wash and sanitization for heavy duvets, blankets, pillows, and bedsheets.',
    price: 15.00,
    unit: 'per item',
    turnaroundTime: '48 Hours',
    category: 'Specialty',
    available: true,
    icon: 'BedDouble'
  },
  {
    name: 'Leather & Suede Care',
    description: 'Specialized conditioning, stain removal, and restoration for leather jackets and shoes.',
    price: 25.00,
    unit: 'per item',
    turnaroundTime: '72 Hours',
    category: 'Specialty',
    available: false,
    icon: 'ShieldCheck'
  }
];

export async function seedInitialServicesIfNeeded() {
  try {
    const servicesRef = collection(db, 'services');
    const snapshot = await getDocs(servicesRef);
    if (snapshot.empty) {
      console.log('Seeding initial laundry services...');
      for (const service of INITIAL_SERVICES) {
        await addDoc(servicesRef, service);
      }
    }
  } catch (error) {
    console.error('Error seeding services:', error);
  }
}
