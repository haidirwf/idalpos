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
const mockGetUser = vi.fn().mockResolvedValue({
  data: { user: { id: 'mock-user-id' } },
  error: null
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => mockGetUser()
    },
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
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'mock-user-id' } },
      error: null
    });
  });

  describe('Category Actions', () => {
    it('successfully inserts new category', async () => {
      mockInsert.mockResolvedValueOnce({ error: null });
      const res = await createCategory('Foods', 'FoodIcon', 1);
      expect(res.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith('categories', {
        name: 'Foods',
        icon: 'FoodIcon',
        sort_order: 1
      });
    });

    it('rejects if name is missing or empty', async () => {
      const res1 = await createCategory('', 'FoodIcon', 1);
      expect(res1.success).toBe(false);
      expect(res1.error).toBe('Name is required');

      const res2 = await createCategory('   ', 'FoodIcon', 1);
      expect(res2.success).toBe(false);
      expect(res2.error).toBe('Name is required');

      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('successfully deletes category', async () => {
      mockDelete.mockResolvedValueOnce({ error: null });
      const res = await deleteCategory('cat-id-123');
      expect(res.success).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith('categories', 'id', 'cat-id-123');
    });

    it('rejects if id is missing in delete', async () => {
      const res = await deleteCategory('');
      expect(res.success).toBe(false);
      expect(res.error).toBe('ID is required');
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('rejects createCategory if user is unauthorized', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
      const res = await createCategory('Foods', 'FoodIcon', 1);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Unauthorized');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('rejects deleteCategory if user is unauthorized', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
      const res = await deleteCategory('cat-id-123');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Unauthorized');
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
      const res = await createProduct(productData);
      expect(res.success).toBe(true);
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
      const res = await createProduct(productData);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Name is required');
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
      const res = await createProduct(productData);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Category ID is required');
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
      const res = await createProduct(productData);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Price must be greater than or equal to 0');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('successfully deletes product', async () => {
      mockDelete.mockResolvedValueOnce({ error: null });
      const res = await deleteProduct('prod-123');
      expect(res.success).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith('products', 'id', 'prod-123');
    });

    it('rejects createProduct if user is unauthorized', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
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
      const res = await createProduct(productData);
      expect(res.success).toBe(false);
      expect(res.error).toBe('Unauthorized');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('rejects deleteProduct if user is unauthorized', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
      const res = await deleteProduct('prod-123');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Unauthorized');
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('Table Actions', () => {
    it('successfully inserts new table with qr code', async () => {
      mockInsert.mockResolvedValueOnce({ error: null });
      const res = await createTable('T01');
      expect(res.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith('tables', {
        number: 'T01',
        qr_code_url: expect.stringContaining('T01')
      });
    });

    it('rejects if table number is empty', async () => {
      const res = await createTable('');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Number is required');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('successfully deletes table', async () => {
      mockDelete.mockResolvedValueOnce({ error: null });
      const res = await deleteTable('table-123');
      expect(res.success).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith('tables', 'id', 'table-123');
    });

    it('rejects createTable if user is unauthorized', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
      const res = await createTable('T01');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Unauthorized');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('rejects deleteTable if user is unauthorized', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
      const res = await deleteTable('table-123');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Unauthorized');
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });
});
