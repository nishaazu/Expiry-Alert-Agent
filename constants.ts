import { RawMaterial, Status } from './types';

// Helper to generate a date relative to today
const getDate = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

export const MOCK_MATERIALS: RawMaterial[] = [
  {
    material_id: 101,
    outlet_id: 12,
    name: "Chicken Breast (Frozen)",
    supplier: "Ahmad Food Supplies",
    category: "Meat",
    is_critical: true,
    agent_status: Status.SAFE,
    halal_certificate_id: "JAKIM/MH/2023/101",
    expiry_date: getDate(45), // Safe
  },
  {
    material_id: 102,
    outlet_id: 12,
    name: "Ground Beef Grade A",
    supplier: "Premium Meats Sdn Bhd",
    category: "Meat",
    is_critical: true,
    agent_status: Status.SAFE,
    halal_certificate_id: "JAKIM/MH/2023/102",
    expiry_date: getDate(8), // Should trigger URGENT WARNING
  },
  {
    material_id: 103,
    outlet_id: 5,
    name: "Dark Chocolate Compound",
    supplier: "Cocoa World",
    category: "Dry Goods",
    is_critical: false,
    agent_status: Status.SAFE,
    halal_certificate_id: "JAKIM/MH/2023/103",
    expiry_date: getDate(20), // Should trigger WARNING
  },
  {
    material_id: 104,
    outlet_id: 5,
    name: "Heavy Cream",
    supplier: "Dairy Best",
    category: "Dairy",
    is_critical: true,
    agent_status: Status.SAFE,
    halal_certificate_id: "JAKIM/MH/2023/104",
    expiry_date: getDate(-2), // Should trigger EXPIRED
  },
  {
    material_id: 105,
    outlet_id: 8,
    name: "Gelatin Powder",
    supplier: "Halal Gelatin Co",
    category: "Additives",
    is_critical: true,
    agent_status: Status.SAFE,
    halal_certificate_id: "JAKIM/MH/2023/105",
    expiry_date: getDate(120), // Safe
  },
  {
    material_id: 106,
    outlet_id: 8,
    name: "Soy Sauce",
    supplier: "Taste Master",
    category: "Condiments",
    is_critical: false,
    agent_status: Status.WARNING,
    halal_certificate_id: "JAKIM/MH/2023/106",
    expiry_date: getDate(5), // Already warning, stays urgent warning
  },
  {
    material_id: 107,
    outlet_id: 12,
    name: "Mozzarella Cheese",
    supplier: "Dairy Best",
    category: "Dairy",
    is_critical: true,
    agent_status: Status.SAFE,
    halal_certificate_id: "JAKIM/MH/2023/107",
    expiry_date: getDate(28), // Should trigger WARNING
  },
];

export const SQL_QUERY_PREVIEW = `SELECT
    rm.material_id,
    rm.outlet_id,
    rm.name,
    rm.supplier,
    rm.category,
    rm.is_critical,
    rm.agent_status,
    d.expiry_date,
    DATEDIFF(d.expiry_date, CURDATE()) as days_until_expiry
FROM raw_materials rm
LEFT JOIN documents d ON rm.halal_certificate_id = d.document_id
WHERE rm.halal_certificate_id IS NOT NULL`;