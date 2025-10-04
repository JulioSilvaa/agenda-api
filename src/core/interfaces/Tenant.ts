export interface ITenant {
  id?: string | null;
  name: string;
  slug: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
  address?: string | null;
}
