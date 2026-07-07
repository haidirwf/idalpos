import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createCategory,
  deleteCategory,
  createProduct,
  deleteProduct,
  createTable,
  deleteTable
} from './admin';

const mockInsert = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    from: (table: string) => ({
      insert: async (row: unknown) => {
        return mockInsert(table, row);
      },
      delete: () => ({
        eq: async (column: string, value: unknown) => {
          return mockDelete(table, column, value);
        }
      })
    })
  })
}));

vi.mock('next/cache', () => ({
  revalidatePath: () => {},
}));

describe('Admin CRUD Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Category Actions', () => {
    it('successfully inserts new category', async () => {
      mockInsert.mockResolvedValueOnce({ error: null });
      await expect(createCategory('Foods', 'FoodIcon', 1)).resolves.not.toThrow();
      expect(mockInsert).toHaveBeenCalledWith('categories', {
        name: 'Foods',
        icon: 'FoodIcon',
        sort_order: 1
      });
    });

    it('rejects if name is missing or empty', async () => {
      await expect(createCategory('', 'FoodIcon', 1)).rejects.toThrow('Name is required');
      await expect(createCategory('   ', 'FoodIcon', 1)).rejects.toThrow('Name is required');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('successfully deletes category', async () => {
      mockDelete.mockResolvedValueOnce({ error: null });
      await expect(deleteCategory('cat-id-123')).resolves.not.toThrow();
      expect(mockDelete).toHaveBeenCalledWith('categories', 'id', 'cat-id-123');
    });

    it('rejects if id is missing in delete', async () => {
      await expect(deleteCategory('')).rejects.toThrow('ID is required');
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('Product Actions', () => {
    it('successfully inserts new product', async () => {
      mockInsert.mockResolvedValueOnce({ error: null });
      const productData = {
        name: 'Espresso',
        category_id: 'cat-123',
        description: 'Strong coffee',
        price: 15000,
        image_url: 'http://img.url',
        available: true,
        display_order: 2,
        is_featured: true
      };
      await expect(createProduct(productData)).resolves.not.toThrow();
      expect(mockInsert).toHaveBeenCalledWith('products', productData);
    });

    it('rejects if product name is missing', async () => {
      const productData = {
        name: '',
        category_id: 'cat-123',
        description: 'Strong coffee',
        price: 15000,
        image_url: 'http://img.url',
        available: true,
        display_order: 2,
        is_featured: true
      };
      await expect(createProduct(productData)).rejects.toThrow('Name is required');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('rejects if category ID is missing', async () => {
      const productData = {
        name: 'Espresso',
        category_id: '',
        description: 'Strong coffee',
        price: 15000,
        image_url: 'http://img.url',
        available: true,
        display_order: 2,
        is_featured: true
      };
      await expect(createProduct(productData)).rejects.toThrow('Category ID is required');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('rejects if price is negative', async () => {
      const productData = {
        name: 'Espresso',
        category_id: 'cat-123',
        description: 'Strong coffee',
        price: -500,
        image_url: 'http://img.url',
        available: true,
        display_order: 2,
        is_featured: true
      };
      await expect(createProduct(productData)).rejects.toThrow('Price must be greater than or equal to 0');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('successfully deletes product', async () => {
      mockDelete.mockResolvedValueOnce({ error: null });
      await expect(deleteProduct('prod-123')).resolves.not.toThrow();
      expect(mockDelete).toHaveBeenCalledWith('products', 'id', 'prod-123');
    });
  });

  describe('Table Actions', () => {
    it('successfully inserts new table with qr code', async () => {
      mockInsert.mockResolvedValueOnce({ error: null });
      await expect(createTable('T01')).resolves.not.toThrow();
      expect(mockInsert).toHaveBeenCalledWith('tables', {
        number: 'T01',
        qr_code_url: expect.stringContaining('T01')
      });
    });

    it('rejects if table number is empty', async () => {
      await expect(createTable('')).rejects.toThrow('Number is required');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('successfully deletes table', async () => {
      mockDelete.mockResolvedValueOnce({ error: null });
      await expect(deleteTable('table-123')).resolves.not.toThrow();
      expect(mockDelete).toHaveBeenCalledWith('tables', 'id', 'table-123');
    });
  });
});
