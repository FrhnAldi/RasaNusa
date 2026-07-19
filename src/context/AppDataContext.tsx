import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  Product,
  Transaction,
  StockLog,
  PaymentMethod,
  Category,
  OrderType,
  OrderStatus,
} from '../types/pos';
import { INITIAL_PRODUCTS } from '../data/products';

const STORAGE_KEY = 'rasanusa_data_v1';

interface StoredShape {
  products: Product[];
  transactions: Transaction[];
  stockLogs: StockLog[];
}

interface RecordTransactionInput {
  items: { product: Product; quantity: number; note?: string }[];
  subtotal: number;
  tax: number;
  discount?: number;
  promoCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  change?: number;
  cashierName: string;
  customerUsername?: string;
  customerName?: string;
  orderType?: OrderType;
  tableNumber?: string;
}

interface NewProductInput {
  name: string;
  category: Category;
  price: number;
  stock: number;
  image: string;
  description: string;
}

interface AppDataContextValue {
  products: Product[];
  transactions: Transaction[];
  stockLogs: StockLog[];
  recordTransaction: (input: RecordTransactionInput) => void;
  adjustStock: (productId: string, delta: number, reason: string, actorName: string) => void;
  addProduct: (input: NewProductInput) => string;
  updateProduct: (id: string, patch: Partial<Omit<Product, 'id'>>) => void;
  removeProduct: (id: string) => void;
  removeTransaction: (id: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus, actorName?: string) => void;
  resetData: () => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

/** Ensures transactions saved before the order-status feature existed still have valid status fields. */
function withStatusDefaults(transactions: Transaction[]): Transaction[] {
  return transactions.map((t) =>
    t.status
      ? t
      : {
          ...t,
          status: 'selesai' as OrderStatus,
          statusUpdatedAt: t.timestamp,
          statusHistory: [{ status: 'selesai' as OrderStatus, timestamp: t.timestamp }],
        }
  );
}

function loadInitial(): StoredShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredShape;
      if (parsed && Array.isArray(parsed.products)) {
        return { ...parsed, transactions: withStatusDefaults(parsed.transactions ?? []) };
      }
    }
  } catch {
    // ignore malformed storage
  }
  return { products: INITIAL_PRODUCTS, transactions: [], stockLogs: [] };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredShape>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  // Real-time sync across tabs/windows on the same browser: e.g. an admin
  // updating an order's status in one tab instantly reflects on a customer's
  // "Riwayat Pesanan" open in another tab, without a page refresh.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as StoredShape;
        if (parsed && Array.isArray(parsed.products)) {
          setState({ ...parsed, transactions: withStatusDefaults(parsed.transactions ?? []) });
        }
      } catch {
        // ignore malformed cross-tab payloads
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const recordTransaction = (input: RecordTransactionInput) => {
    const now = Date.now();
    const transaction: Transaction = {
      id: `TRX-${now}`,
      items: input.items.map((l) => ({
        productId: l.product.id,
        name: l.product.name,
        quantity: l.quantity,
        price: l.product.price,
        note: l.note?.trim() ? l.note.trim() : undefined,
      })),
      subtotal: input.subtotal,
      tax: input.tax,
      discount: input.discount,
      promoCode: input.promoCode,
      total: input.total,
      paymentMethod: input.paymentMethod,
      cashReceived: input.cashReceived,
      change: input.change,
      cashierName: input.cashierName,
      timestamp: now,
      customerUsername: input.customerUsername,
      customerName: input.customerName,
      orderType: input.orderType,
      tableNumber: input.tableNumber,
      status: 'menunggu',
      statusUpdatedAt: now,
      statusHistory: [{ status: 'menunggu', timestamp: now }],
    };

    setState((prev) => {
      const qtyMap: Record<string, number> = {};
      input.items.forEach((l) => (qtyMap[l.product.id] = (qtyMap[l.product.id] ?? 0) + l.quantity));
      const products = prev.products.map((p) =>
        qtyMap[p.id] ? { ...p, stock: Math.max(0, p.stock - qtyMap[p.id]) } : p
      );
      return {
        ...prev,
        products,
        transactions: [...prev.transactions, transaction],
      };
    });
  };

  const adjustStock = (productId: string, delta: number, reason: string, actorName: string) => {
    setState((prev) => {
      const product = prev.products.find((p) => p.id === productId);
      if (!product) return prev;
      const resultingStock = Math.max(0, product.stock + delta);
      const log: StockLog = {
        id: `LOG-${Date.now()}`,
        productId,
        productName: product.name,
        delta,
        resultingStock,
        reason,
        actorName,
        timestamp: Date.now(),
      };
      return {
        ...prev,
        products: prev.products.map((p) => (p.id === productId ? { ...p, stock: resultingStock } : p)),
        stockLogs: [log, ...prev.stockLogs],
      };
    });
  };

  const addProduct = (input: NewProductInput) => {
    const id = `${input.category.slice(0, 2)}-${Date.now()}`;
    setState((prev) => {
      const product: Product = { id, ...input };
      const log: StockLog = {
        id: `LOG-${Date.now()}`,
        productId: id,
        productName: input.name,
        delta: input.stock,
        resultingStock: input.stock,
        reason: 'Menu baru ditambahkan',
        actorName: 'Admin',
        timestamp: Date.now(),
      };
      return { ...prev, products: [product, ...prev.products], stockLogs: [log, ...prev.stockLogs] };
    });
    return id;
  };

  const updateProduct = (id: string, patch: Partial<Omit<Product, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const removeProduct = (id: string) => {
    setState((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
  };

  const removeTransaction = (id: string) => {
    setState((prev) => ({ ...prev, transactions: prev.transactions.filter((t) => t.id !== id) }));
  };

  const updateOrderStatus = (id: string, status: OrderStatus, actorName?: string) => {
    setState((prev) => {
      const now = Date.now();
      return {
        ...prev,
        transactions: prev.transactions.map((t) =>
          t.id === id
            ? {
                ...t,
                status,
                statusUpdatedAt: now,
                statusHistory: [...t.statusHistory, { status, timestamp: now, actorName }],
              }
            : t
        ),
      };
    });
  };

  const resetData = () => {
    setState({ products: INITIAL_PRODUCTS, transactions: [], stockLogs: [] });
  };

  return (
    <AppDataContext.Provider
      value={{
        products: state.products,
        transactions: state.transactions,
        stockLogs: state.stockLogs,
        recordTransaction,
        adjustStock,
        addProduct,
        updateProduct,
        removeProduct,
        removeTransaction,
        updateOrderStatus,
        resetData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
