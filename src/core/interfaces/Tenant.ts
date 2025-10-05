export interface ITenant {
  id?: string;
  name: string;
  slug: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
  address?: string | null;
  password: string;
}
